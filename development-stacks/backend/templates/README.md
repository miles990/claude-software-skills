# Backend Templates

Server application templates for Node.js and Python.

## Express (Node.js + TypeScript)

| Template | Purpose |
|----------|---------|
| `express/app.ts` | Express app with middleware |
| `express/server.ts` | Server entry point |

### Usage

```bash
mkdir -p src
cp templates/express/app.ts src/app.ts
cp templates/express/server.ts src/server.ts
```

### Dependencies

```bash
npm install express cors helmet morgan
npm install -D @types/express @types/cors @types/morgan typescript
```

## FastAPI (Python)

| Template | Purpose |
|----------|---------|
| `fastapi/main.py` | FastAPI app with CORS |
| `fastapi/requirements.txt` | Python dependencies |

### Usage

```bash
mkdir -p app
cp templates/fastapi/main.py app/main.py
cp templates/fastapi/requirements.txt requirements.txt
```

### Quick Start

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
