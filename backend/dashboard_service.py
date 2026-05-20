from __future__ import annotations
import asyncio
from typing import Optional
from jira_service import (
    get_projects,
    get_epics_for_project,
    get_blocked_issues,
    get_issues_by_project,
    get_sprints_for_project,
    is_issue_blocked,
    get_status_category,
    get_epic_key,
    get_epic_name,
    search_all_issues,
)

STATUS_COLORS: dict[str, str] = {
    "To Do": "#94a3b8",
    "Em Aberto": "#94a3b8",
    "Open": "#94a3b8",
    "In Progress": "#3b82f6",
    "Em Andamento": "#3b82f6",
    "In Review": "#8b5cf6",
    "Em Revisão": "#8b5cf6",
    "Done": "#22c55e",
    "Concluído": "#22c55e",
    "Closed": "#22c55e",
    "Blocked": "#ef4444",
    "Bloqueado": "#ef4444",
    "default": "#64748b",
}


def _calculate_stats(issues: list[dict]) -> dict:
    total = len(issues)
    completed = sum(1 for i in issues if get_status_category(i) == "done")
    in_progress = sum(1 for i in issues if get_status_category(i) == "inprogress")
    open_ = sum(1 for i in issues if get_status_category(i) == "todo")
    blocked = sum(1 for i in issues if is_issue_blocked(i))
    progress = round((completed / total) * 100) if total > 0 else 0
    return {"total": total, "completed": completed, "inProgress": in_progress, "open": open_, "blocked": blocked, "progress": progress}


def _map_issue_to_task(issue: dict) -> dict:
    fields = issue.get("fields", {})
    sprints = fields.get("customfield_10020")
    active_sprint = None
    if isinstance(sprints, list) and sprints:
        active_sprint = next((s for s in sprints if s.get("state") == "active"), sprints[-1])

    return {
        "id": issue.get("id"),
        "key": issue.get("key"),
        "summary": fields.get("summary"),
        "status": (fields.get("status") or {}).get("name", "Unknown"),
        "statusCategory": get_status_category(issue),
        "assignee": (fields.get("assignee") or {}).get("displayName"),
        "assigneeEmail": (fields.get("assignee") or {}).get("emailAddress"),
        "priority": (fields.get("priority") or {}).get("name", "Medium"),
        "labels": fields.get("labels") or [],
        "isBlocked": is_issue_blocked(issue),
        "projectKey": (fields.get("project") or {}).get("key", ""),
        "projectName": (fields.get("project") or {}).get("name", ""),
        "epicKey": get_epic_key(issue),
        "epicName": get_epic_name(issue),
        "sprintName": active_sprint.get("name") if active_sprint else None,
        "created": fields.get("created"),
        "updated": fields.get("updated"),
        "dueDate": fields.get("duedate"),
        "storyPoints": fields.get("customfield_10016"),
    }


async def get_dashboard_stats(filters: dict = {}) -> dict:
    projects = await get_projects()
    if filters.get("projectKey"):
        projects = [p for p in projects if p["key"] == filters["projectKey"]]

    results = await asyncio.gather(*[
        get_issues_by_project(
            p["key"],
            status=filters.get("status"),
            assignee_id=filters.get("assigneeId"),
            sprint_id=filters.get("sprintId"),
            epic_key=filters.get("epicKey"),
        )
        for p in projects
    ])
    all_issues = [issue for issues in results for issue in issues]

    stats = _calculate_stats(all_issues)
    return {
        "totalTasks": stats["total"],
        "completedTasks": stats["completed"],
        "inProgressTasks": stats["inProgress"],
        "openTasks": stats["open"],
        "blockedTasks": stats["blocked"],
        "progressPercentage": stats["progress"],
        "totalProjects": len(projects),
        "totalClients": len({p.get("projectTypeKey", "default") for p in projects}),
        "totalEpics": 0,
    }


async def _summarize_project(project: dict, filters: dict) -> dict:
    issues, epics = await asyncio.gather(
        get_issues_by_project(
            project["key"],
            status=filters.get("status"),
            assignee_id=filters.get("assigneeId"),
            sprint_id=filters.get("sprintId"),
        ),
        get_epics_for_project(project["key"]),
    )

    stats = _calculate_stats(issues)
    epic_summaries = []
    for epic in epics:
        epic_issues = [i for i in issues if get_epic_key(i) == epic["key"]]
        es = _calculate_stats(epic_issues)
        epic_summaries.append({
            "id": epic["id"],
            "key": epic["key"],
            "name": epic.get("fields", {}).get("summary"),
            "totalTasks": es["total"],
            "completedTasks": es["completed"],
            "inProgressTasks": es["inProgress"],
            "openTasks": es["open"],
            "blockedTasks": es["blocked"],
            "progressPercentage": es["progress"],
        })

    return {
        "id": project["id"],
        "key": project["key"],
        "name": project["name"],
        "clientName": project["name"],
        "totalTasks": stats["total"],
        "completedTasks": stats["completed"],
        "inProgressTasks": stats["inProgress"],
        "openTasks": stats["open"],
        "blockedTasks": stats["blocked"],
        "progressPercentage": stats["progress"],
        "epics": epic_summaries,
    }


async def get_projects_summary(filters: dict = {}) -> list[dict]:
    projects = await get_projects()
    if filters.get("projectKey"):
        projects = [p for p in projects if p["key"] == filters["projectKey"]]

    return list(await asyncio.gather(*[_summarize_project(p, filters) for p in projects]))


async def get_blocked_tasks_list(project_key: Optional[str] = None) -> list[dict]:
    issues = await get_blocked_issues(project_key)
    result = []
    for issue in issues:
        fields = issue.get("fields", {})
        labels = fields.get("labels") or []
        block_label = next(
            (l for l in labels if l.lower() in ["blocked", "impedimento", "bloqueado", "impediment"]),
            None,
        )
        result.append({
            "id": issue.get("id"),
            "key": issue.get("key"),
            "summary": fields.get("summary"),
            "status": (fields.get("status") or {}).get("name", "Unknown"),
            "assignee": (fields.get("assignee") or {}).get("displayName"),
            "priority": (fields.get("priority") or {}).get("name", "Medium"),
            "labels": labels,
            "projectName": (fields.get("project") or {}).get("name", ""),
            "epicName": get_epic_name(issue),
            "blockReason": f"Label: {block_label}" if block_label else f"Status: {(fields.get('status') or {}).get('name')}",
        })
    return result


async def get_tasks_list(filters: dict = {}) -> list[dict]:
    projects = await get_projects()
    if filters.get("projectKey"):
        projects = [p for p in projects if p["key"] == filters["projectKey"]]

    results = await asyncio.gather(*[
        get_issues_by_project(
            p["key"],
            status=filters.get("status"),
            assignee_id=filters.get("assigneeId"),
            sprint_id=filters.get("sprintId"),
            epic_key=filters.get("epicKey"),
        )
        for p in projects
    ])
    all_issues = [issue for issues in results for issue in issues]
    return [_map_issue_to_task(i) for i in all_issues]


async def get_status_distribution(project_key: Optional[str] = None) -> list[dict]:
    jql = "issuetype != Epic"
    if project_key:
        jql = f'project = "{project_key}" AND {jql}'

    issues = await search_all_issues(jql)
    status_count: dict[str, int] = {}
    for issue in issues:
        status = (issue.get("fields", {}).get("status") or {}).get("name", "Unknown")
        status_count[status] = status_count.get(status, 0) + 1

    return [
        {"name": name, "value": value, "color": STATUS_COLORS.get(name, STATUS_COLORS["default"])}
        for name, value in status_count.items()
    ]


async def get_projects_progress() -> list[dict]:
    projects = await get_projects()

    results = await asyncio.gather(*[get_issues_by_project(p["key"]) for p in projects])

    progress_list = []
    for project, issues in zip(projects, results):
        stats = _calculate_stats(issues)
        name = project["name"]
        if len(name) > 20:
            name = name[:20] + "..."
        progress_list.append({
            "name": name,
            "total": stats["total"],
            "completed": stats["completed"],
            "inProgress": stats["inProgress"],
            "open": stats["open"],
            "blocked": stats["blocked"],
            "progress": stats["progress"],
        })

    return sorted(progress_list, key=lambda x: x["progress"], reverse=True)


async def get_filter_options() -> dict:
    projects = await get_projects()

    results = await asyncio.gather(*[
        asyncio.gather(
            get_sprints_for_project(p["key"]),
            get_issues_by_project(p["key"]),
        )
        for p in projects
    ])

    all_sprints: list[dict] = []
    all_assignees: dict[str, dict] = {}
    sprint_ids: set[int] = set()

    for project, (sprints, issues) in zip(projects, results):
        for sprint in sprints:
            if sprint["id"] not in sprint_ids:
                sprint_ids.add(sprint["id"])
                all_sprints.append({"id": sprint["id"], "name": sprint["name"], "state": sprint["state"], "projectKey": project["key"]})

        for issue in issues:
            assignee = issue.get("fields", {}).get("assignee")
            if assignee and assignee["accountId"] not in all_assignees:
                all_assignees[assignee["accountId"]] = {
                    "accountId": assignee["accountId"],
                    "displayName": assignee["displayName"],
                }

    return {
        "clients": [{"id": p["id"], "name": p["name"]} for p in projects],
        "projects": [{"id": p["id"], "key": p["key"], "name": p["name"]} for p in projects],
        "sprints": all_sprints,
        "statuses": ["To Do", "In Progress", "In Review", "Done", "Blocked"],
        "assignees": list(all_assignees.values()),
    }


async def get_clients_summary() -> list[dict]:
    projects = await get_projects()

    results = await asyncio.gather(*[get_issues_by_project(p["key"]) for p in projects])

    client_map: dict[str, dict] = {}
    for project, issues in zip(projects, results):
        stats = _calculate_stats(issues)
        client_id = project["id"]

        if client_id not in client_map:
            client_map[client_id] = {
                "id": client_id,
                "name": project["name"],
                "projectCount": 0,
                "totalTasks": 0,
                "completedTasks": 0,
                "inProgressTasks": 0,
                "openTasks": 0,
                "blockedTasks": 0,
                "progressPercentage": 0,
            }

        c = client_map[client_id]
        c["projectCount"] += 1
        c["totalTasks"] += stats["total"]
        c["completedTasks"] += stats["completed"]
        c["inProgressTasks"] += stats["inProgress"]
        c["openTasks"] += stats["open"]
        c["blockedTasks"] += stats["blocked"]
        c["progressPercentage"] = (
            round((c["completedTasks"] / c["totalTasks"]) * 100) if c["totalTasks"] > 0 else 0
        )

    return list(client_map.values())