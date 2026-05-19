import os
import httpx
from dotenv import load_dotenv

load_dotenv()

JIRA_BASE_URL = os.getenv("JIRA_BASE_URL", "https://valcann-project.atlassian.net/rest/api/3")
JIRA_EMAIL = os.getenv("JIRA_EMAIL", "")
JIRA_API_TOKEN = os.getenv("JIRA_API_TOKEN", "")

if not JIRA_EMAIL or not JIRA_API_TOKEN:
    print("[JiraClient] AVISO: JIRA_EMAIL ou JIRA_API_TOKEN não configurados no .env")


def get_client() -> httpx.AsyncClient:
    return httpx.AsyncClient(
        base_url=JIRA_BASE_URL,
        auth=(JIRA_EMAIL, JIRA_API_TOKEN),
        headers={"Accept": "application/json", "Content-Type": "application/json"},
        timeout=30.0,
    )
