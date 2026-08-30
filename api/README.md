# agent-engine

A DAG-based agent workflow engine. A client submits a graph of steps (each a
prompt, with optional dependencies on other steps); the server resolves the
graph one layer at a time — independent steps run in parallel — and streams
each step's model output back to the client as NDJSON, in real time, over a
single HTTP response.

## Architecture

```
frontend (React/Vite)  --POST /work-->  api (Express)
                                            |
                                            | resolves the DAG layer by layer
                                            v
                                        Ollama (local LLM  tool-calling loop)
                                            |
                                            -- web_res tool  --> Ollama's web search
                                            -- get_weather    --> weatherapi.com
```

- **`api/`** — Express server. `POST /work` validates the submitted graph
  (schema  cycle/dangling-dependency checks), then resolves it recursively:
  every step whose dependencies are done runs in parallel via a multi-turn
  tool-calling loop against Ollama, streaming NDJSON events
  (`chunk` / `done` / `error` / `skipped` / `flow-done`) back on the response.
- **`frontend/`** — React  Zustand. Submits a workflow, reads the NDJSON
  stream, and updates per-node UI state as chunks arrive.

## Prerequisites

- [Bun](https://bun.sh) (both `api` and `frontend` are Bun projects)
- [Ollama](https://ollama.com), running locally, with a model pulled — e.g.:
  ```bash
  ollama pull gemma3:12b
  ```
  (set `OLLAMA_MODEL` to whatever you pull — see below)
- A [weatherapi.com](https://www.weatherapi.com/) API key, only if you want
  workflows that use the `get_weather` tool

## Running locally (native)

```bash
# terminal 1 — Ollama
ollama serve

# terminal 2 — api
cd api
cp .env.example .env   # fill in WEATHER_API_KEY if you need the weather tool
bun install
bun run dev

# terminal 3 — frontend
cd frontend
cp .env.example .env.local
bun install
bun run dev
```

Frontend: http://localhost:5173 · API: http://localhost:3000 · API health check: `GET /health`

## Running with Docker

```bash
docker compose up --build
# then, once ollama is up:
docker compose exec ollama ollama pull gemma3:12b
```

`OLLAMA_MODEL` and `WEATHER_API_KEY` can be overridden via a `.env` file at
the repo root (read by docker compose) — see `api/.env.example` for the full
list of variables.

## Environment variables

| Var | Where | Default | Notes |
|---|---|---|---|
| `PORT` | api | `3000` | |
| `CORS_ORIGIN` | api | `http://localhost:5173` | |
| `OLLAMA_HOST` | api | `http://127.0.0.1:11434` | `http://ollama:11434` inside Docker |
| `OLLAMA_MODEL` | api | `gemma4:12b` | must match a model you've pulled |
| `MAX_TOOL_ITERATIONS` | api | `8` | safety cap per step's tool-calling loop |
| `WEATHER_API_KEY` | api | — | only required if a workflow uses `get_weather` |
| `VITE_API_URL` | frontend | `http://localhost:3000` | |

## Testing

```bash
cd api
bun test
```

## Status

This is under active development — see open issues for the production-readiness
backlog (auth, rate limiting, structured logging, retry policy, etc.).