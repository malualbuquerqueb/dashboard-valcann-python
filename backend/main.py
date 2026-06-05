import os
from datetime import datetime, timezone, timedelta
from typing import Optional

import jwt
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi import FastAPI, Query, HTTPException, Depends, Response, Cookie
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from dashboard_service import (
    get_dashboard_stats,
    get_projects_summary,
    get_clients_summary,
    get_blocked_tasks_list,
    get_overdue_tasks_list,
    get_epics_list,
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

#autenticacao
DASHBOARD_PASSWORD = os.getenv("DASHBOARD_PASSWORD")
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = int(os.getenv("JWT_EXPIRE_HOURS", 8))

if not DASHBOARD_PASSWORD:
    raise RuntimeError("DASHBOARD_PASSWORD não definida no .env")
if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET não definida no .env")
class LoginRequest(BaseModel):
    password: str

def _create_token() -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS)
    return jwt.encode(
        {"exp": expire, "sub": "dashboard"},
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )

def _verify_token(token: str) -> bool:
    try:
        jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return True
    except jwt.ExpiredSignatureError:
        return False
    except jwt.InvalidTokenError:
        return False
    
def require_auth(access_token: Optional[str] = Cookie(default=None)):
    if not access_token or not _verify_token(access_token):
        raise HTTPException(status_code=401, detail="Não autenticado")

@app.post("/api/auth/login")
async def login(body: LoginRequest, response: Response):
    # Compara com a senha do .env — nunca envia a senha ao frontend
    if body.password != DASHBOARD_PASSWORD:
        raise HTTPException(status_code=401, detail="Senha incorreta")

    token = _create_token()

    # Define cookie HttpOnly — JavaScript não consegue ler este cookie
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=os.getenv("ENVIRONMENT") == "production",
        max_age=JWT_EXPIRE_HOURS * 3600,
        path="/",
    )
    return {"authenticated": True}


@app.post("/api/auth/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    return {"authenticated": False}


@app.get("/api/auth/verify")
async def verify(access_token: Optional[str] = Cookie(default=None)):
    if access_token and _verify_token(access_token):
        return {"authenticated": True}
    raise HTTPException(status_code=401, detail="Não autenticado")

@app.get("/api/dashboard/health", dependencies=[Depends(require_auth)])
async def dashboard_health():
    return {
        "success": True,
        "status": "ok",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "jiraConfigured": bool(os.getenv("JIRA_EMAIL") and os.getenv("JIRA_API_TOKEN")),
    }


@app.get("/api/dashboard/stats", dependencies=[Depends(require_auth)])
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


@app.get("/api/dashboard/projects", dependencies=[Depends(require_auth)])
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


@app.get("/api/dashboard/clients", dependencies=[Depends(require_auth)])
async def clients():
    try:
        data = await get_clients_summary()
        return {"success": True, "data": data}
    except Exception as e:
        print(f"[GET /clients] {e}")
        raise HTTPException(status_code=500, detail="Erro ao buscar clientes")


@app.get("/api/dashboard/blocked", dependencies=[Depends(require_auth)])
async def blocked(
    projectKey: Optional[str] = Query(None),
    epicKey: Optional[str] = Query(None),
):
    try:
        data = await get_blocked_tasks_list(projectKey, epicKey)
        return {"success": True, "data": data}
    except Exception as e:
        print(f"[GET /blocked] {e}")
        raise HTTPException(status_code=500, detail="Erro ao buscar tarefas bloqueadas")


@app.get("/api/dashboard/epics", dependencies=[Depends(require_auth)])
async def epics(projectKey: str = Query(...)):
    try:
        data = await get_epics_list(projectKey)
        return {"success": True, "data": data}
    except Exception as e:
        print(f"[GET /epics] {e}")
        raise HTTPException(status_code=500, detail="Erro ao buscar épicos")


@app.get("/api/dashboard/overdue", dependencies=[Depends(require_auth)])
async def overdue(
    projectKey: Optional[str] = Query(None),
    sprintId: Optional[str] = Query(None),
    assigneeId: Optional[str] = Query(None),
    epicKey: Optional[str] = Query(None),
    clientId: Optional[str] = Query(None),
):
    try:
        data = await get_overdue_tasks_list(_filters(projectKey, None, sprintId, assigneeId, epicKey, clientId))
        return {"success": True, "data": data}
    except Exception as e:
        print(f"[GET /overdue] {e}")
        raise HTTPException(status_code=500, detail="Erro ao buscar atividades em atraso")


@app.get("/api/dashboard/tasks", dependencies=[Depends(require_auth)])
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


@app.get("/api/dashboard/status-distribution", dependencies=[Depends(require_auth)])
async def status_distribution(
    projectKey: Optional[str] = Query(None),
    epicKey: Optional[str] = Query(None),
):
    try:
        data = await get_status_distribution(projectKey, epicKey)
        return {"success": True, "data": data}
    except Exception as e:
        print(f"[GET /status-distribution] {e}")
        raise HTTPException(status_code=500, detail="Erro ao buscar distribuição de status")


@app.get("/api/dashboard/projects-progress", dependencies=[Depends(require_auth)])
async def projects_progress(
    projectKey: Optional[str] = Query(None),
    epicKey: Optional[str] = Query(None),
    assigneeId: Optional[str] = Query(None),
):
    try:
        data = await get_projects_progress({
            k: v for k, v in {
                "projectKey": projectKey,
                "epicKey": epicKey,
                "assigneeId": assigneeId,
            }.items() if v is not None
        })
        return {"success": True, "data": data}
    except Exception as e:
        print(f"[GET /projects-progress] {e}")
        raise HTTPException(status_code=500, detail="Erro ao buscar progresso dos projetos")


@app.get("/api/dashboard/filter-options", dependencies=[Depends(require_auth)])
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
