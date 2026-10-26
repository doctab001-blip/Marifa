"""Depth-standard helpers (docs/clinical-topic-authoring-standard.md section 3A): algorithms and the ABIM teaching layer."""
from hx import S

def node(id, kind, text, nxt=None, detail=None):
    d = {"id": id, "kind": kind, "text": text}
    if detail: d["detail"] = detail
    if nxt: d["next"] = [{"to": t} if l is None else {"to": t, "label": l} for t, l in nxt]
    return d

def algo(id, title, placement, k, loc, nodes):
    t, u, e = S[k]
    return {"id": id, "title": title, "placement": placement, "nodes": nodes, "source": {"title": t, "edition": e, "url": u, "locator": loc}}

def explain(section, title, prompt, guidance):
    return {"title": title, "prompt": prompt, "guidance": guidance, "section": section}

def bq(id, vignette, question, options, answer, objective, keypoint):
    return {"id": id, "vignette": vignette, "fictitious": True, "question": question,
            "options": [{"id": l, "text": t, "explanation": e} for l, (t, e) in zip("ABCDE", options)],
            "answer": answer, "educationalObjective": objective, "keyPoint": keypoint}

def deepen(topic, algorithms, vignette, explanations, questions):
    topic["algorithms"] = algorithms
    topic["teaching"]["vignette"] = {"text": vignette, "fictitious": True}
    topic["teaching"]["guidedApproach"] = explanations
    topic["teaching"]["boardQuestions"] = questions
    return topic
