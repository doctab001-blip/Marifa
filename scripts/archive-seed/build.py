import json, sys, time, urllib.request, urllib.parse
sys.path.insert(0, '.')
import entries
UA = {"User-Agent": "MarifaArchiveSeed/1.0 (mailto:doctab.001@gmail.com)"}
def get(doi):
    url = "https://api.crossref.org/works/" + urllib.parse.quote(doi, safe="/()")
    for _ in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=25) as r:
                return json.load(r)["message"]
        except urllib.error.HTTPError as e:
            if e.code == 404: return None
            time.sleep(2)
        except Exception:
            time.sleep(2)
    return None
def date_of(m):
    best = None
    for k in ("published-online", "published-print", "published", "issued"):
        p = (m.get(k) or {}).get("date-parts", [[None]])[0]
        if p and p[0]:
            t = (p + [1, 1])[:3]
            t = [t[0], t[1] or 1, t[2] or 1]
            if best is None or t < best: best = t
    return best
ok, bad = [], []
for e in entries.D:
    m = get(e["doi"])
    if not m: bad.append((e["doi"], "not found")); continue
    title = " ".join(m.get("title") or [""])
    d = date_of(m)
    if e["kw"] not in title.lower(): bad.append((e["doi"], "title mismatch: " + title[:90])); continue
    if not d or not (2016 <= d[0] <= 2026): bad.append((e["doi"], "date out of range %s" % d)); continue
    e = dict(e)
    e["date"] = "%04d-%02d-%02d" % tuple(d)
    e["journal"] = (m.get("container-title") or [""])[0]
    e["cr_title"] = title
    ok.append(e)
    time.sleep(0.15)
json.dump(ok, open("verified.json", "w"), indent=1)
print("verified", len(ok), "dropped", len(bad))
for b in bad: print(" DROP", b)
