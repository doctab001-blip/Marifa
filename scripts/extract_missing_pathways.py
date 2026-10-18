#!/usr/bin/env python3
"""Create unreviewed, organization-scoped pathway drafts from PMC articles.

The worker uses the two authenticated RPCs in
`supabase/migrations/20261011083413_extracted_pathway_rpcs.sql`. It does not
approve or publish clinical content. Every save is atomic and requires the
signed-in user's `guidelines.edit` permission in ORGANIZATION_ID.

Required environment variables:
  SUPABASE_URL, SUPABASE_KEY, SUPABASE_ACCESS_TOKEN, ORGANIZATION_ID,
  OPENAI_API_KEY

SUPABASE_KEY must be a publishable/anon key. SUPABASE_ACCESS_TOKEN must be a
real authenticated user's access token, not a service-role key. The user must
have a matching profile and `guidelines.edit` permission in ORGANIZATION_ID.
Optional: OPENAI_MODEL (defaults to gpt-4o-2024-08-06), NCBI_API_KEY,
NCBI_EMAIL, NCBI_TOOL.
"""

from __future__ import annotations

import json
import logging
import os
import re
import time
import uuid
import xml.etree.ElementTree as ET
from typing import Any

import requests
from openai import OpenAI


LOG = logging.getLogger("pathway_extractor")
NCBI_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
MAX_BATCH_SIZE = 10
SOURCE_ISSUER = "Other"


def required_env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def uuid_env(name: str) -> str:
    value = required_env(name)
    try:
        return str(uuid.UUID(value))
    except ValueError as exc:
        raise RuntimeError(f"{name} must be a valid UUID") from exc


def object_schema(properties: dict[str, Any]) -> dict[str, Any]:
    return {
        "type": "object",
        "properties": properties,
        "required": list(properties),
        "additionalProperties": False,
    }


def array_schema(items: dict[str, Any]) -> dict[str, Any]:
    return {"type": "array", "items": items}


def string_schema() -> dict[str, Any]:
    return {"type": "string"}


def evidence_schema(source: dict[str, str]) -> dict[str, Any]:
    source_properties = {
        "id": {"type": "string", "enum": [source["id"]]},
        "title": {"type": "string", "enum": [source["title"]]},
        "issuer": {"type": "string", "enum": [source["issuer"]]},
        "edition": {"type": "string", "enum": [source["edition"]]},
        "url": {"type": "string", "enum": [source["url"]]},
        "locator": string_schema(),
        "primary_source": {"type": "boolean", "enum": [True]},
    }
    return object_schema({
        "sources": array_schema(object_schema(source_properties)),
        "selection_rationale": string_schema(),
    })


def payload_schema(source: dict[str, str]) -> dict[str, Any]:
    evidence = evidence_schema(source)
    exact_dose = object_schema({
        "kind": {"type": "string", "enum": ["exact"]},
        "amount": {"type": "number"},
        "unit": string_schema(),
        "frequency": string_schema(),
        "duration": string_schema(),
    })
    not_indicated_dose = object_schema({
        "kind": {"type": "string", "enum": ["not-indicated"]},
        "reason": string_schema(),
    })
    dose = {"anyOf": [exact_dose, not_indicated_dose]}

    medicine = object_schema({
        "id": string_schema(),
        "medicine": string_schema(),
        "indication": string_schema(),
        "patient_group": string_schema(),
        "loading_dose": dose,
        "maintenance_dose": dose,
        "route": string_schema(),
        "contraindications": array_schema(string_schema()),
        "adjustments": array_schema(string_schema()),
        "monitoring": array_schema(string_schema()),
        "evidence": evidence,
    })
    action = object_schema({"instruction": string_schema(), "timeframe": string_schema()})
    branch = object_schema({
        "id": string_schema(),
        "condition": string_schema(),
        "actions": array_schema(action),
        "Medicines_Doses": array_schema(medicine),
        "evidence": evidence,
    })
    investigation_step = object_schema({
        "test": string_schema(),
        "clinical_question": string_schema(),
        "expected_finding": string_schema(),
        "decision_rationale": string_schema(),
        "timeframe": string_schema(),
    })
    investigation = object_schema({
        "id": string_schema(),
        "title": string_schema(),
        "timeframe": string_schema(),
        "steps": array_schema(investigation_step),
        "evidence": evidence,
    })
    treatment = object_schema({
        "id": string_schema(),
        "title": string_schema(),
        "timeframe": string_schema(),
        "actions": array_schema(action),
        "Medicines_Doses": array_schema(medicine),
        "branches": array_schema(branch),
        "evidence": evidence,
    })
    return object_schema({
        "schema_version": {"type": "integer", "enum": [1]},
        "evidence": evidence,
        "Investigations": array_schema(investigation),
        "Treatment_Plan": array_schema(treatment),
    })


def validate_against_schema(value: Any, schema: dict[str, Any], path: str = "payload") -> None:
    if "anyOf" in schema:
        errors: list[str] = []
        for option in schema["anyOf"]:
            try:
                validate_against_schema(value, option, path)
                return
            except ValueError as exc:
                errors.append(str(exc))
        raise ValueError(f"{path} did not match any allowed structure")

    expected = schema["type"]
    if expected == "object":
        if not isinstance(value, dict):
            raise ValueError(f"{path} must be an object")
        properties = schema["properties"]
        if set(value) != set(properties):
            raise ValueError(f"{path} has missing or unexpected fields")
        for key, child_schema in properties.items():
            validate_against_schema(value[key], child_schema, f"{path}.{key}")
    elif expected == "array":
        if not isinstance(value, list):
            raise ValueError(f"{path} must be an array")
        for index, item in enumerate(value):
            validate_against_schema(item, schema["items"], f"{path}[{index}]")
    elif expected == "string":
        if not isinstance(value, str) or not value.strip():
            raise ValueError(f"{path} must be a non-empty string")
    elif expected == "boolean":
        if not isinstance(value, bool):
            raise ValueError(f"{path} must be a boolean")
    elif expected == "integer":
        if isinstance(value, bool) or not isinstance(value, int):
            raise ValueError(f"{path} must be an integer")
    elif expected == "number":
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise ValueError(f"{path} must be a number")
    else:
        raise ValueError(f"Unsupported schema type {expected!r} at {path}")

    if "enum" in schema and value not in schema["enum"]:
        raise ValueError(f"{path} is not an allowed value")


def validate_payload(payload: Any, source: dict[str, str]) -> dict[str, Any]:
    validate_against_schema(payload, payload_schema(source))
    if not payload["Investigations"] or not payload["Treatment_Plan"]:
        raise ValueError("Source text did not support both investigations and treatment; draft not saved")

    evidence_objects = [payload["evidence"]]
    for investigation in payload["Investigations"]:
        if not investigation["steps"]:
            raise ValueError("An investigation phase has no source-supported steps")
        evidence_objects.append(investigation["evidence"])

    def add_treatment_evidence(item: dict[str, Any]) -> None:
        if not item["actions"]:
            raise ValueError("A treatment step has no source-supported actions")
        evidence_objects.append(item["evidence"])
        for medicine in item["Medicines_Doses"]:
            if not medicine["contraindications"] or not medicine["adjustments"] or not medicine["monitoring"]:
                raise ValueError("Medicine records need explicit details or 'Not specified in source' markers")
            for dose in (medicine["loading_dose"], medicine["maintenance_dose"]):
                if dose["kind"] == "exact" and dose["amount"] <= 0:
                    raise ValueError("Exact medicine doses must be positive")
            evidence_objects.append(medicine["evidence"])
        for nested_branch in item.get("branches", []):
            if not nested_branch["actions"]:
                raise ValueError("A treatment branch has no source-supported actions")
            evidence_objects.append(nested_branch["evidence"])
            for medicine in nested_branch["Medicines_Doses"]:
                if not medicine["contraindications"] or not medicine["adjustments"] or not medicine["monitoring"]:
                    raise ValueError("Medicine records need explicit details or 'Not specified in source' markers")
                for dose in (medicine["loading_dose"], medicine["maintenance_dose"]):
                    if dose["kind"] == "exact" and dose["amount"] <= 0:
                        raise ValueError("Exact medicine doses must be positive")
                evidence_objects.append(medicine["evidence"])

    for treatment in payload["Treatment_Plan"]:
        add_treatment_evidence(treatment)

    for evidence in evidence_objects:
        sources = evidence["sources"]
        if len(sources) != 1 or sources[0]["id"] != source["id"] or not sources[0]["primary_source"]:
            raise ValueError("Every evidence record must cite exactly the registered PMC source")
    return payload


def ncbi_request(session: requests.Session, endpoint: str, params: dict[str, str]) -> ET.Element:
    request_params = {**params, "tool": os.getenv("NCBI_TOOL", "marifa_pathway_draft_extractor")}
    if email := os.getenv("NCBI_EMAIL"):
        request_params["email"] = email
    if api_key := os.getenv("NCBI_API_KEY"):
        request_params["api_key"] = api_key
    response = session.get(
        f"{NCBI_BASE}/{endpoint}", params=request_params, timeout=(10, 45)
    )
    response.raise_for_status()
    return ET.fromstring(response.content)


def article_text(article: ET.Element) -> str:
    title_node = article.find(".//article-title")
    title = " ".join("".join(title_node.itertext()).split()) if title_node is not None else "Untitled PMC article"
    chunks = [f"Article title: {title}"]
    abstract = article.find(".//abstract")
    if abstract is not None:
        abstract_text = " ".join(" ".join("".join(p.itertext()).split()) for p in abstract.findall(".//p"))
        if abstract_text:
            chunks.append(f"Abstract\n{abstract_text}")

    for section in article.findall(".//body//sec"):
        heading_node = section.find("title")
        heading = " ".join("".join(heading_node.itertext()).split()) if heading_node is not None else "Unheaded section"
        paragraphs = [" ".join("".join(p.itertext()).split()) for p in section.findall(".//p")]
        text = " ".join(part for part in paragraphs if part)
        if text:
            chunks.append(f"Section: {heading}\n{text}")
    return "\n\n".join(chunks)


def find_pmc_article(session: requests.Session, disease: str) -> dict[str, str] | None:
    safe_disease = disease.replace('"', " ").strip()
    term = f'("{safe_disease}"[Title/Abstract]) AND (StatPearls[Journal] OR "clinical practice guideline")'
    result = ncbi_request(session, "esearch.fcgi", {
        "db": "pmc", "term": term, "retmode": "xml", "retmax": "5", "sort": "relevance",
    })
    ids = [node.text for node in result.findall(".//IdList/Id") if node.text]
    if not ids:
        return None

    fetched = ncbi_request(session, "efetch.fcgi", {
        "db": "pmc", "id": ",".join(ids), "retmode": "xml",
    })
    for article in fetched.findall(".//article"):
        id_nodes = article.findall(".//article-id")
        pmcid = next((node.text.strip() for node in id_nodes
                      if node.get("pub-id-type", "").lower() in {"pmc", "pmcid"}
                      and node.text and re.fullmatch(r"PMC[0-9]+", node.text.strip())), None)
        if not pmcid:
            continue
        title_node = article.find(".//article-title")
        title = " ".join("".join(title_node.itertext()).split()) if title_node is not None else disease
        journal_node = article.find(".//journal-title")
        journal = " ".join("".join(journal_node.itertext()).split()) if journal_node is not None else "PubMed Central article"
        text = article_text(article)
        if len(text) >= 500:
            return {"pmcid": pmcid, "title": title, "journal": journal, "text": text[:100_000]}
    return None


def source_metadata(article: dict[str, str], source_id: str) -> dict[str, str]:
    pmcid = article["pmcid"]
    url = f"https://pmc.ncbi.nlm.nih.gov/articles/{pmcid}/"
    return {
        "id": source_id,
        "title": article["title"] + f" (PMCID: {pmcid})",
        "issuer": SOURCE_ISSUER,
        "edition": f"PMCID: {pmcid}",
        "url": url,
    }


def rpc(
    session: requests.Session,
    supabase_url: str,
    function_name: str,
    body: dict[str, Any],
) -> Any:
    response = session.post(
        f"{supabase_url.rstrip('/')}/rest/v1/rpc/{function_name}",
        json=body,
        timeout=(10, 60),
    )
    response.raise_for_status()
    if not response.content:
        return None
    return response.json()


def extract_payload(
    client: OpenAI,
    model: str,
    disease: str,
    article: dict[str, str],
    source: dict[str, str],
) -> dict[str, Any]:
    instructions = """Extract a draft pathway using only the supplied PMC article.
Do not add medical advice, doses, contraindications, monitoring, thresholds, or timeframes that the article does not state.
If the article does not support a complete investigations section and a complete treatment section, return the available arrays empty; the caller will reject and skip that draft.
Only include a medicine record when the article explicitly supports the full dose structure. Never calculate, normalize, or infer a dose. For text fields that the schema requires but the article does not address, use the literal phrase 'Not specified in source'.
Every evidence.sources array must cite exactly the supplied source record, retain its supplied id/title/issuer/edition/url and primary_source=true, and give a concise article section locator. Do not treat extraction as clinical approval. Output only the required JSON object."""
    schema = payload_schema(source)
    completion = client.chat.completions.create(
        model=model,
        temperature=0,
        max_completion_tokens=6000,
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "clinical_pathway_draft",
                "strict": True,
                "schema": schema,
            },
        },
        messages=[
            {"role": "system", "content": instructions},
            {
                "role": "user",
                "content": (
                    f"Disease topic: {disease}\n"
                    f"Article: {article['title']}\nJournal: {article['journal']}\n"
                    f"Registered provenance: {json.dumps(source, ensure_ascii=False)}\n\n"
                    f"PMC source text:\n{article['text']}"
                ),
            },
        ],
    )
    message = completion.choices[0].message
    if message.refusal:
        raise ValueError("OpenAI refused the extraction request")
    if completion.choices[0].finish_reason != "stop" or not message.content:
        raise ValueError("OpenAI returned an incomplete extraction")
    return validate_payload(json.loads(message.content), source)


def main() -> int:
    logging.basicConfig(
        level=os.getenv("LOG_LEVEL", "INFO").upper(),
        format="%(asctime)s %(levelname)s %(message)s",
    )
    supabase_url = required_env("SUPABASE_URL")
    supabase_key = required_env("SUPABASE_KEY")
    access_token = required_env("SUPABASE_ACCESS_TOKEN")
    organization_id = uuid_env("ORGANIZATION_ID")
    client = OpenAI(api_key=required_env("OPENAI_API_KEY"), timeout=90, max_retries=2)
    model = os.getenv("OPENAI_MODEL", "gpt-4o-2024-08-06")

    session = requests.Session()
    session.headers.update({
        "apikey": supabase_key,
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "marifa-clinical-pathway-draft-extractor/1.0",
    })
    ncbi = requests.Session()
    ncbi.headers.update({"User-Agent": "marifa-clinical-pathway-draft-extractor/1.0"})

    topics = rpc(session, supabase_url, "get_topics_without_payloads", {
        "organization_id": organization_id,
        "batch_size": MAX_BATCH_SIZE,
    })
    if not isinstance(topics, list):
        raise RuntimeError("get_topics_without_payloads returned an unexpected response")
    if not topics:
        LOG.info("No eligible topics without pathway payloads were found")
        return 0

    for topic in topics:
        topic_id = str(uuid.UUID(topic["topic_id"]))
        topic_name = str(topic["topic_name"]).strip()
        if not topic_name:
            LOG.warning("Skipping topic %s with an empty name", topic_id)
            continue
        try:
            article = find_pmc_article(ncbi, topic_name)
            if article is None:
                LOG.info("No usable PMC full text found for %s; skipped", topic_name)
                continue

            source = source_metadata(article, str(uuid.uuid4()))
            payload = extract_payload(client, model, topic_name, article, source)
            result = rpc(session, supabase_url, "save_extracted_pathway", {
                "organization_id": organization_id,
                "topic_id": topic_id,
                "source_pmcid": article["pmcid"],
                "source_article_title": article["title"],
                "source_journal": article["journal"],
                "pathway_payload": payload,
                "source_record_id": source["id"],
            })
            LOG.info(
                "Stored unreviewed draft for %s from %s (verified=%s)",
                topic_name,
                article["pmcid"],
                result.get("is_verified") if isinstance(result, dict) else False,
            )
        except Exception:
            LOG.exception("Draft extraction failed for %s; no partial save was made", topic_name)
        finally:
            time.sleep(2)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
