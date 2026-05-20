from __future__ import annotations
from typing import Any, Optional
from jira_client import get_client

BLOCKED_LABELS = ["blocked", "impedimento", "bloqueado", "impediment", "block"]
BLOCKED_STATUSES = ["blocked", "bloqueado", "impedido"]

SEARCH_FIELDS = ",".join([
    "summary", "status", "assignee", "reporter", "priority",
    "issuetype", "project", "labels", "created", "updated",
    "duedate", "resolutiondate", "parent",
    "customfield_10016",  # Story Points
    "customfield_10020",  # Sprint
])


async def search_issues(jql: str, next_page_token: Optional[str] = None, max_results: int = 100) -> dict:
    params: dict[str, Any] = {"jql": jql, "maxResults": max_results, "fields": SEARCH_FIELDS}
    if next_page_token:
        params["nextPageToken"] = next_page_token

    print(f"[Jira API] GET /search/jql jql={jql[:80]}")
    r = await get_client().get("/search/jql", params=params)
    r.raise_for_status()
    return r.json()


async def search_all_issues(jql: str) -> list[dict]:
    all_issues: list[dict] = []
    next_page_token: Optional[str] = None

    while True:
        data = await search_issues(jql, next_page_token, 100)
        issues = data.get("issues") or []
        all_issues.extend(issues)

        if data.get("isLast") or not data.get("nextPageToken") or len(issues) == 0:
            break
        next_page_token = data["nextPageToken"]

    return all_issues


async def get_projects() -> list[dict]:
    all_projects: list[dict] = []
    start_at = 0
    max_results = 50
    client = get_client()

    while True:
        print(f"[Jira API] GET /project/search startAt={start_at}")
        r = await client.get("/project/search", params={"startAt": start_at, "maxResults": max_results, "orderBy": "name"})
        r.raise_for_status()
        data = r.json()
        all_projects.extend(data.get("values", []))

        if data.get("isLast") or len(data.get("values", [])) == 0:
            break
        start_at += max_results

    return all_projects


async def get_epics_for_project(project_key: str) -> list[dict]:
    jql = f'project = "{project_key}" AND issuetype = Epic ORDER BY created DESC'
    return await search_all_issues(jql)


async def get_issues_for_epic(epic_key: str, project_key: str) -> list[dict]:
    jql = f'project = "{project_key}" AND (parent = "{epic_key}" OR "Epic Link" = "{epic_key}") ORDER BY created DESC'
    return await search_all_issues(jql)


async def get_blocked_issues(project_key: Optional[str] = None) -> list[dict]:
    label_conditions = " OR ".join(f'labels = "{l}"' for l in BLOCKED_LABELS)
    status_conditions = " OR ".join(f'status = "{s}"' for s in BLOCKED_STATUSES)

    jql = f"({label_conditions} OR {status_conditions})"
    if project_key:
        jql = f'project = "{project_key}" AND ({jql})'
    jql += " ORDER BY created DESC"

    return await search_all_issues(jql)


async def get_issues_by_project(
    project_key: str,
    status: Optional[str] = None,
    assignee_id: Optional[str] = None,
    sprint_id: Optional[str] = None,
    epic_key: Optional[str] = None,
) -> list[dict]:
    jql = f'project = "{project_key}"'

    if status:
        jql += f' AND status = "{status}"'
    if assignee_id:
        jql += f' AND assignee = "{assignee_id}"'
    if sprint_id:
        jql += f" AND sprint = {sprint_id}"
    if epic_key:
        jql += f' AND (parent = "{epic_key}" OR "Epic Link" = "{epic_key}")'

    jql += " ORDER BY created DESC"
    return await search_all_issues(jql)


async def get_sprints_for_project(project_key: str) -> list[dict]:
    try:
        data = await search_issues(f'project = "{project_key}" AND sprint is not EMPTY', max_results=50)
        sprints_map: dict[int, dict] = {}
        for issue in data.get("issues", []):
            sprints = issue.get("fields", {}).get("customfield_10020")
            if isinstance(sprints, list):
                for sprint in sprints:
                    if sprint and sprint.get("id") and sprint["id"] not in sprints_map:
                        sprints_map[sprint["id"]] = {**sprint, "projectKey": project_key}
        return list(sprints_map.values())
    except Exception:
        return []


def is_issue_blocked(issue: dict) -> bool:
    labels = [l.lower() for l in (issue.get("fields", {}).get("labels") or [])]
    status = (issue.get("fields", {}).get("status", {}).get("name") or "").lower()
    return any(l in BLOCKED_LABELS for l in labels) or status in BLOCKED_STATUSES


def get_status_category(issue: dict) -> str:
    category = (
        issue.get("fields", {})
        .get("status", {})
        .get("statusCategory", {})
        .get("key", "")
        .lower()
    )
    if category == "done":
        return "done"
    if category == "indeterminate":
        return "inprogress"
    return "todo"


def get_epic_key(issue: dict) -> Optional[str]:
    parent = issue.get("fields", {}).get("parent", {})
    if parent and parent.get("fields", {}).get("issuetype", {}).get("name") == "Epic":
        return parent.get("key")
    return issue.get("fields", {}).get("customfield_10014")


def get_epic_name(issue: dict) -> Optional[str]:
    parent = issue.get("fields", {}).get("parent", {})
    if parent and parent.get("fields", {}).get("issuetype", {}).get("name") == "Epic":
        return parent.get("fields", {}).get("summary")
    return issue.get("fields", {}).get("customfield_10008")