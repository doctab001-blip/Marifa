#!/usr/bin/env python3
"""Extract unreviewed pathway drafts from PMC and save them to PostgreSQL.

This worker targets a table that has the columns configured below. It will
refuse to run if that contract does not match the database. In particular,
the repository's governed `clinical_pathways` table currently does not have
the `is_verified` or JSON payload columns expected by this workflow.

Required environment variables:
  DATABASE_URL       PostgreSQL connection string (use a secret, server-side key)
  OPENAI_API_KEY

Optional:
  NCBI_API_KEY       Raises the NCBI E-utilities rate limit
  NCBI_EMAIL         Contact email sent with E-utilities requests
  NCBI_TOOL          Client label sent with E-utilities requests
  OPENAI_MODEL       Defaults to gpt-4o
  CLINICAL_TABLE     Defaults to clinical_pathways
  CLINICAL_ID_COLUMN Defaults to id
  DISEASE_COLUMN     Defaults to disease_name
  JSON_COLUMN        Defaults to pathway_data
  BATCH_SIZE         Defaults to 10; values above 10 are rejected
"""

from __future__ import annotations

import json
import logging
import os
import re
import sys
import time
import xml.etree.ElementTree as ET
from typing import Any

import psycopg2
from psycopg2 import sql
import requests
from openai import OpenAI


LOG = logging.getLogger("clinical_pathway_worker")
NCBI_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
SYSTEM_PROMPT = (
    "You are a clinical data extraction engine. Analyze the provided open-access medical text. "
    "Extract diagnostic criteria, dosages, and pathways. Output the data strictly matching the "
    "required JSON schema. DO NOT generate medical advice not found in the text. If a parameter "
    "is not mentioned, output 'NULL'."
)

SCHEMA: dict[str, Any] = {
    "type": "object",
    "additionalProperties": False,
    "properties": {
        "disease_name": {"type": "string"},
        "is_verified": {"type": "boolean", "enum": [False]},
        "presentation_and_red_flags": {
            "type": "object", "additionalProperties": False,
            "properties": {
                "cardinal_symptoms": {"type": "array", "items": {"type": "string"}},
                "urgent_escalation_criteria": {"type": "array", "items": {"type": "string"}},
            },
            "required": ["cardinal_symptoms", "urgent_escalation_criteria"],
        },
        "investigations": {
            "type": "array", "items": {
                "type": "object", "additionalProperties": False,
                "properties": {"test_name": {"type": "string"}, "rationale": {"type": "string"}},
                "required": ["test_name", "rationale"],
            },
        },
        "acute_management_sequence": {
            "type": "array", "items": {
                "type": "object", "additionalProperties": False,
                "properties": {
                    "step_order": {"type": "number"},
                    "intervention_type": {"type": "string"},
                    "details": {"type": "string"},
                    "specific_drugs": {
                        "type": "array", "items": {
                            "type": "object", "additionalProperties": False,
                            "properties": {"drug_name": {"type": "string"}, "dosage": {"type": "string"}},
                            "required": ["drug_name", "dosage"],
                        },
                    },
                },
                "required": ["step_order", "intervention_type", "details", "specific_drugs"],
            },
        },
    },
    "required": [
        "disease_name", "is_verified", "presentation_and_red_flags", "investigations",
        "acute_management_sequence",
    ],
}


def required_env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def identifier(name: str) -> str:
    if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", name):
        raise ValueError(f"Unsafe SQL identifier: {name!r}")
    return name


def ncbi_request(session: requests.Session, endpoint: str, params: dict[str, str]) -> ET.Element:
    params = {**params, "tool": os.getenv("NCBI_TOOL", "clinical_pathway_extractor")}
    if email := os.getenv("NCBI_EMAIL"):
        params["email"] = email
    if api_key := os.getenv("NCBI_API_KEY"):
        params["api_key"] = api_key
    response = session.get(f"{NCBI_BASE}/{endpoint}", params=params, timeout=(10, 45))
    response.raise_for_status()
    return ET.fromstring(response.content)


def find_pmc_article(session: requests.Session, disease: str) -> tuple[str, str] | None:
    queries = [
        f'("StatPearls"[Title] AND "{disease}"[Title/Abstract])',
        f'("{disease}"[Title/Abstract] AND (guideline[Title/Abstract] OR "practice guideline"[Publication Type]))',
    ]
    for query in queries:
        result = ncbi_request(session, "esearch.fcgi", {
            "db": "pmc", "term": query, "retmode": "xml", "retmax": "5", "sort": "relevance",
        })
        ids = [item.text for item in result.findall(".//IdList/Id") if item.text]
        if not ids:
            continue
        fetched = ncbi_request(session, "efetch.fcgi", {
            "db": "pmc", "id": ",".join(ids), "retmode": "xml",
        })
        article = fetched.find(".//article")
        if article is None:
            continue
        title_node = article.find(".//article-title")
        title = ""
        if title_node is not None:
            title = " ".join("".join(title_node.itertext()).split())
        pmcid_node = article.find(".//article-id[@pub-id-type='pmc']")
        pmcid = (pmcid_node.text or "") if pmcid_node is not None else ids[0]
        sections: list[str] = []
        for sec in article.findall(".//body//sec"):
            heading_node = sec.find("title")
            heading = " ".join("".join(heading_node.itertext()).split()).lower() if heading_node is not None else ""
            if any(term in heading for term in ("evaluation", "diagnos", "treatment", "management")):
                body = " ".join(" ".join("".join(p.itertext()).split()) for p in sec.findall(".//p"))
                if body:
                    sections.append(f"{heading.title()}\n{body}")
        if not sections:
            abstract = article.find(".//abstract")
            if abstract is not None:
                body = " ".join(" ".join("".join(p.itertext()).split()) for p in abstract.findall(".//p"))
                if body:
                    sections.append(f"Abstract\n{body}")
        text = "\n\n".join(sections)
        if text:
            return pmcid, f"Article: {title}\nPMCID: {pmcid}\n\n{text}"
    return None


def validate_result(data: Any, disease: str) -> dict[str, Any]:
    if not isinstance(data, dict) or set(data) != set(SCHEMA["properties"]):
        raise ValueError("Model response does not match the required top-level JSON schema")
    if data.get("is_verified") is not False:
        raise ValueError("Extracted content must remain unverified")
    # The requested JSON schema uses scalar strings throughout; validate common nested types.
    for key in ("disease_name",):
        if not isinstance(data.get(key), str):
            raise ValueError(f"Invalid {key}")
    presentation = data.get("presentation_and_red_flags")
    if not isinstance(presentation, dict) or any(
        not isinstance(presentation.get(k), list) or not all(isinstance(x, str) for x in presentation[k])
        for k in ("cardinal_symptoms", "urgent_escalation_criteria")
    ):
        raise ValueError("Invalid presentation_and_red_flags")
    if not isinstance(data.get("investigations"), list) or not isinstance(data.get("acute_management_sequence"), list):
        raise ValueError("Invalid investigation or management sequence")
    # Keep the authoritative table label, not a model-generated variant.
    data["disease_name"] = disease
    data["is_verified"] = False
    return data


def main() -> int:
    logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO").upper(), format="%(asctime)s %(levelname)s %(message)s")
    dsn = required_env("DATABASE_URL")
    client = OpenAI(api_key=required_env("OPENAI_API_KEY"), timeout=90, max_retries=2)
    table = identifier(os.getenv("CLINICAL_TABLE", "clinical_pathways"))
    id_col = identifier(os.getenv("CLINICAL_ID_COLUMN", "id"))
    disease_col = identifier(os.getenv("DISEASE_COLUMN", "disease_name"))
    json_col = identifier(os.getenv("JSON_COLUMN", "pathway_data"))
    batch_size = int(os.getenv("BATCH_SIZE", "10"))
    if not 1 <= batch_size <= 10:
        raise ValueError("BATCH_SIZE must be between 1 and 10")

    with psycopg2.connect(dsn, connect_timeout=10, application_name="clinical_pathway_extractor") as conn:
        conn.autocommit = False
        with conn.cursor() as cur:
            # A session advisory lock prevents concurrent workers from selecting the same pending rows.
            cur.execute("SELECT pg_advisory_lock(hashtext(%s))", ("clinical_pathway_extractor",))
            cur.execute(
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_schema = current_schema() AND table_name = %s",
                (table,),
            )
            columns = {row[0] for row in cur.fetchall()}
            required = {id_col, disease_col, json_col, "status", "is_verified"}
            missing = sorted(required - columns)
            if missing:
                raise RuntimeError(
                    f"Refusing to process {table}: missing required column(s) {', '.join(missing)}. "
                    "No clinical content was changed. Use a staging table/schema with the documented contract "
                    "or implement the repository's governed guideline-version workflow."
                )
            cur.execute(
                sql.SQL("SELECT {id}, {disease} FROM {table} "
                        "WHERE status = 'pending' OR is_verified IS NULL "
                        "ORDER BY {id} LIMIT %s FOR UPDATE SKIP LOCKED").format(
                    id=sql.Identifier(id_col), disease=sql.Identifier(disease_col), table=sql.Identifier(table)
                ), (batch_size,),
            )
            rows = cur.fetchall()
            conn.commit()

            if not rows:
                LOG.info("No pending rows found")
                return 0

            session = requests.Session()
            session.headers.update({"User-Agent": "clinical-pathway-extractor/1.0 (open-access research extraction)"})
            for row_id, disease in rows:
                disease = str(disease or "").strip()
                try:
                    if not disease:
                        raise ValueError("Disease name is empty")
                    source = find_pmc_article(session, disease)
                    if source is None:
                        raise LookupError("NCBI PMC search returned no usable article text")
                    pmcid, source_text = source
                    completion = client.chat.completions.create(
                        model=os.getenv("OPENAI_MODEL", "gpt-4o"),
                        response_format={"type": "json_object"},
                        messages=[
                            {"role": "system", "content": SYSTEM_PROMPT + "\nRequired schema:\n" + json.dumps(SCHEMA)},
                            {"role": "user", "content": f"Disease: {disease}\nSource: {pmcid}\n\n{source_text[:100000]}"},
                        ],
                    )
                    raw = completion.choices[0].message.content
                    if not raw:
                        raise ValueError("OpenAI returned an empty response")
                    extracted = validate_result(json.loads(raw), disease)
                    cur.execute(
                        sql.SQL("UPDATE {table} SET {payload} = %s, is_verified = false, status = 'processed' "
                                "WHERE {id} = %s AND (status = 'pending' OR is_verified IS NULL)").format(
                            table=sql.Identifier(table), payload=sql.Identifier(json_col), id=sql.Identifier(id_col)
                        ), (json.dumps(extracted), row_id),
                    )
                    if cur.rowcount != 1:
                        raise RuntimeError("Row was not updated exactly once")
                    conn.commit()
                    LOG.info("Processed row_id=%s disease=%r source=PMC%s; remains unverified", row_id, disease, pmcid)
                except Exception as exc:
                    conn.rollback()
                    LOG.exception("Failed row_id=%s disease=%r: %s", row_id, disease, exc)
                    try:
                        cur.execute(
                            sql.SQL("UPDATE {table} SET status = 'failed' WHERE {id} = %s").format(
                                table=sql.Identifier(table), id=sql.Identifier(id_col)
                            ), (row_id,),
                        )
                        if cur.rowcount != 1:
                            raise RuntimeError("Failure status was not persisted exactly once")
                        conn.commit()
                    except Exception:
                        conn.rollback()
                        LOG.exception("Could not persist failed status for row_id=%s", row_id)
                        return 2
                time.sleep(2)
            session.close()
            cur.execute("SELECT pg_advisory_unlock(hashtext(%s))", ("clinical_pathway_extractor",))
            conn.commit()
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as error:
        LOG.exception("Worker stopped: %s", error)
        sys.exit(1)
