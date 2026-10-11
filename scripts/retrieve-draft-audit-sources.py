"""Retrieve public reference pages; record failures and never treat HTTP 200 as verification."""
import concurrent.futures, hashlib, json, pathlib, re, subprocess, sys
from html.parser import HTMLParser

ROOT = pathlib.Path('outputs/draft-audit-2026-10-11')
(ROOT / 'sources').mkdir(exist_ok=True)
class Text(HTMLParser):
    def __init__(self):
        super().__init__(); self.hide = 0; self.items = []
    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'): self.hide += 1
    def handle_endtag(self, tag):
        if tag in ('script', 'style'): self.hide = max(0, self.hide-1)
    def handle_data(self, data):
        if not self.hide and data.strip(): self.items.append(data.strip())

urls = {}
for line in (ROOT / 'source-map.tsv').read_text().splitlines():
    title, nice, medscape = line.split('\t')
    for code in nice.split(','):
        if code != '-': urls[code] = f'https://www.nice.org.uk/guidance/{code}/chapter/recommendations'
    if medscape != '-':
        for section in ('overview', 'clinical', 'workup', 'treatment'):
            urls[f'medscape-{medscape}-{section}'] = f'https://emedicine.medscape.com/article/{medscape}-{section}'

def retrieve(item):
    key, url = item; dest = ROOT / 'sources' / f'{key}.html'
    p = subprocess.run(['curl', '-L', '-sS', '--max-time', '45', '-o', str(dest), '-w', '%{http_code}', url], capture_output=True, text=True)
    body = dest.read_text(errors='replace') if dest.exists() else ''
    parser = Text(); parser.feed(body); text = '\n'.join(parser.items)
    (ROOT / 'sources' / f'{key}.txt').write_text(text)
    heading = re.search(r'<title[^>]*>(.*?)</title>', body, re.S)
    return {'key':key, 'url':url, 'httpStatus':p.stdout, 'title':heading.group(1).strip() if heading else '', 'characters':len(text), 'sha256':hashlib.sha256(body.encode()).hexdigest(), 'retrieved':'2026-10-11', 'error':p.stderr}
if '--nice-chapters' in sys.argv:
    urls = {}
    for page in (ROOT / 'sources').glob('*.html'):
        if page.name.startswith('medscape'): continue
        for link in re.findall(r'href="(/guidance/[^"\n]+/chapter/[^"\n]+)"', page.read_text()):
            if any(part in link.lower() for part in ['research', 'rationale', 'finding-more', 'terms-used', 'update-information', 'context', 'using-this', 'training', 'commissioning']): continue
            key = link.split('/')[2] + '-' + link.split('/')[-1].lower()
            if not (ROOT / 'sources' / f'{key}.txt').exists(): urls[key] = 'https://www.nice.org.uk' + link
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    records = list(pool.map(retrieve, urls.items()))
(ROOT / ('nice-chapter-retrieval.json' if '--nice-chapters' in sys.argv else 'source-retrieval.json')).write_text(json.dumps(records, indent=2)+'\n')
for row in records:
    if row['key'].endswith('-treatment') or row['key'].startswith(('ng','cg','ph')): print(row['key'], row['httpStatus'], row['title'], row['characters'])
