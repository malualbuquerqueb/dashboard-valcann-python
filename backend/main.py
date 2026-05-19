import os
from datetime import datetime, timezone
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from dashboard_service import (
    get_dashboard_stats,
    get_projects_summary,
    get_clients_summary,
    get_blocked_tasks_list,
    get_tasks_list,
    get_status_distribution,
    get_projects_progress,
    get_filter_options,
)

PORT = int(os.getenv("PORT", 3001))
CORS_ORIGIN = os.getenv("CORS_ORIGIN", "http://localhost:5173")

app = FastAPI(title="Dashboard Valcann API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[CORS_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _filters(
    projectKey: Optional[str] = None,
    status: Optional[str] = None,
    sprintId: Optional[str] = None,
    assigneeId: Optional[str] = None,
    epicKey: Optional[str] = None,
    clientId: Optional[str] = None,
) -> dict:
    return {k: v for k, v in {
        "projectKey": projectKey,
        "status": status,
        "sprintId": sprintId,
        "assigneeId": assigneeId,
        "epicKey": epicKey,
        "clientId": clientId,
    }.items() if v is not None}


@app.get("/api/health")
async def health():
    return {
        "status": "online",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/api/dashboard/health")
async def dashboard_health():
    return {
        "success": True,
        "status": "ok",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "jiraConfigured": bool(os.getenv("JIRA_EMAIL") and os.getenv("JIRA_API_TOKEN")),
    }


@app.get("/api/dashboard/stats")
async def stats(
    projectKey: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    sprintId: Optional[str] = Query(None),
    assigneeId: Optional[str] = Query(None),
    epicKey: Optional[str] = Query(None),
    clientId: Optional[str] = Query(None),
):
    try:
        data = await get_dashboard_stats(_filters(projectKey, status, sprintId, assigneeId, epicKey, clientId))
        return {"success": True, "data": data}
    except Exception as e:
        print(f"[GET /stats] {e}")
        raise HTTPException(status_code=500, detail="Erro ao buscar estatísticas")


@app.get("/api/dashboard/projects")
async def projects(
    projectKey: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    sprintId: Optional[str] = Query(None),
    assigneeId: Optional[str] = Query(None),
    epicKey: Optional[str] = Query(None),
    clientId: Optional[str] = Query(None),
):
    try:
        data = await get_projects_summary(_filters(projectKey, status, sprintId, assigneeId, epicKey, clientId))
        return {"success": True, "data": data}
    except Exception as e:
        print(f"[GET /projects] {e}")
        raise HTTPException(status_code=500, detail="Erro ao buscar projetos")


@app.get("/api/dashboard/clients")
async def clients():
    try:
        data = await get_clients_summary()
        return {"success": True, "data": data}
    except Exception as e:
        print(f"[GET /clients] {e}")
        raise HTTPException(status_code=500, detail="Erro ao buscar clientes")


@app.get("/api/dashboard/blocked")
async def blocked(projectKey: Optional[str] = Query(None)):
    try:
        data = await get_blocked_tasks_list(projectKey)
        return {"success": True, "data": data}
    except Exception as e:
        print(f"[GET /blocked] {e}")
        raise HTTPException(status_code=500, detail="Erro ao buscar tarefas bloqueadas")


@app.get("/api/dashboard/tasks")
async def tasks(
    projectKey: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    sprintId: Optional[str] = Query(None),
    assigneeId: Optional[str] = Query(None),
    epicKey: Optional[str] = Query(None),
    clientId: Optional[str] = Query(None),
):
    try:
        data = await get_tasks_list(_filters(projectKey, status, sprintId, assigneeId, epicKey, clientId))
        return {"success": True, "data": data}
    except Exception as e:
        print(f"[GET /tasks] {e}")
        raise HTTPException(status_code=500, detail="Erro ao buscar tarefas")


@app.get("/api/dashboard/status-distribution")
async def status_distribution(projectKey: Optional[str] = Query(None)):
    try:
        data = await get_status_distribution(projectKey)
        return {"success": True, "data": data}
    except Exception as e:
        print(f"[GET /status-distribution] {e}")
        raise HTTPException(status_code=500, detail="Erro ao buscar distribuição de status")


@app.get("/api/dashboard/projects-progress")
async def projects_progress():
    try:
        data = await get_projects_progress()
        return {"success": True, "data": data}
    except Exception as e:
        print(f"[GET /projects-progress] {e}")
        raise HTTPException(status_code=500, detail="Erro ao buscar progresso dos projetos")


@app.get("/api/dashboard/filter-options")
async def filter_options():
    try:
        data = await get_filter_options()
        return {"success": True, "data": data}
    except Exception as e:
        print(f"[GET /filter-options] {e}")
        raise HTTPException(status_code=500, detail="Erro ao buscar opções de filtro")


if __name__ == "__main__":
    import uvicorn
    print("╔══════════════════════════════════════════╗")
    print("║   Dashboard Valcann - Backend API        ║")
    print(f"║   Porta: {PORT}                           ║")
    print("╚══════════════════════════════════════════╝")
    print(f"[Server] Rodando em http://localhost:{PORT}")
    print(f"[Jira] Base URL: {os.getenv('JIRA_BASE_URL', 'NÃO CONFIGURADO')}")
    print(f"[Jira] Email: {os.getenv('JIRA_EMAIL', 'NÃO CONFIGURADO')}")
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
