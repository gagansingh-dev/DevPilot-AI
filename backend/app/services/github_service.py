import asyncio

import httpx

from app.core.config import settings


GITHUB_API_URL = "https://api.github.com"

GITHUB_HEADERS = {
    "Accept": "application/vnd.github+json",
    "Authorization": f"Bearer {settings.GITHUB_TOKEN}",
    "X-GitHub-Api-Version": "2022-11-28",
}


async def get_github_user(username: str) -> dict:
    url = f"{GITHUB_API_URL}/users/{username}"

    async with httpx.AsyncClient(headers=GITHUB_HEADERS) as client:
        response = await client.get(url)

    if response.status_code == 404:
        raise ValueError("GitHub user not found")

    response.raise_for_status()
    return response.json()


async def get_github_repositories(username: str) -> list:
    url = f"{GITHUB_API_URL}/users/{username}/repos"

    params = {
        "per_page": 100,
        "sort": "updated",
    }

    async with httpx.AsyncClient(headers=GITHUB_HEADERS) as client:
        response = await client.get(url, params=params)

    if response.status_code == 404:
        raise ValueError("GitHub user not found")

    response.raise_for_status()
    return response.json()


async def get_repository_languages(owner: str, repo: str) -> dict:
    url = f"{GITHUB_API_URL}/repos/{owner}/{repo}/languages"

    async with httpx.AsyncClient(headers=GITHUB_HEADERS) as client:
        response = await client.get(url)

    if response.status_code in (404, 409):
        return {}

    response.raise_for_status()
    return response.json()


async def get_github_languages(username: str) -> dict:
    repositories = await get_github_repositories(username)
    semaphore = asyncio.Semaphore(5)

    async def fetch_languages(repo: dict) -> dict:
        async with semaphore:
            return await get_repository_languages(username, repo["name"])

    repository_languages = await asyncio.gather(
        *(fetch_languages(repo) for repo in repositories)
    )
    language_totals = {}
    for languages in repository_languages:
        for language, bytes_count in languages.items():
            language_totals[language] = (
                language_totals.get(language, 0) + bytes_count
            )

    return language_totals


async def get_github_activity(username: str) -> list:
    url = f"{GITHUB_API_URL}/users/{username}/events/public"

    params = {
        "per_page": 30,
    }

    async with httpx.AsyncClient(headers=GITHUB_HEADERS) as client:
        response = await client.get(url, params=params)

    if response.status_code == 404:
        raise ValueError("GitHub user not found")

    response.raise_for_status()

    events = response.json()

    activity = []

    for event in events:
        event_type = event.get("type")
        repo = event.get("repo", {})

        activity.append(
            {
                "type": event_type,
                "repository": repo.get("name"),
                "created_at": event.get("created_at"),
            }
        )

    return activity


async def get_repository_details(owner: str, repo: str) -> dict:
    url = f"{GITHUB_API_URL}/repos/{owner}/{repo}"

    async with httpx.AsyncClient(headers=GITHUB_HEADERS) as client:
        response = await client.get(url)

    if response.status_code in (404, 409):
        raise ValueError("Repository not found or empty")

    response.raise_for_status()
    return response.json()


async def get_github_repository_details(username: str) -> list:
    repositories = await get_github_repositories(username)
    semaphore = asyncio.Semaphore(5)

    async def fetch_repository_details(repo: dict) -> dict:
        repo_name = repo["name"]
        async with semaphore:
            details, has_readme, recent_commits = await asyncio.gather(
                get_repository_details(username, repo_name),
                get_repository_readme(username, repo_name),
                get_repository_commits(username, repo_name),
            )
            file_evidence = await get_repository_file_evidence(
                username,
                repo_name,
                details["default_branch"],
            )

        return {
            "name": details["name"],
            "description": details["description"],
            "stars": details["stargazers_count"],
            "forks": details["forks_count"],
            "language": details["language"],
            "size": details["size"],
            "default_branch": details["default_branch"],
            "topics": details.get("topics", []),
            "has_readme": has_readme,
            "has_issues": details["has_issues"],
            "open_issues": details["open_issues_count"],
            "created_at": details["created_at"],
            "updated_at": details["updated_at"],
            "pushed_at": details["pushed_at"],
            "url": details["html_url"],
            "file_count": len(file_evidence.get("files", [])),
            "file_evidence": file_evidence,
            "recent_commits": recent_commits,
        }

    return await asyncio.gather(
        *(fetch_repository_details(repo) for repo in repositories)
    )


async def get_repository_readme(owner: str, repo: str) -> bool:
    url = f"{GITHUB_API_URL}/repos/{owner}/{repo}/readme"

    async with httpx.AsyncClient(headers=GITHUB_HEADERS) as client:
        response = await client.get(url)

    if response.status_code in (404, 409):
        return False

    response.raise_for_status()
    return True

async def get_repository_readme_content(
    owner: str,
    repo: str,
) -> str:
    url = f"{GITHUB_API_URL}/repos/{owner}/{repo}/readme"

    async with httpx.AsyncClient(
    headers=GITHUB_HEADERS,
    timeout=10.0
) as client:
        response = await client.get(url)

    if response.status_code in (404, 409):
        return ""

    response.raise_for_status()

    data = response.json()

    content = data.get("content", "")

    if not content:
        return ""

    import base64

    try:
        decoded_content = base64.b64decode(
            content
        ).decode("utf-8", errors="ignore")

        return decoded_content

    except Exception:
        return ""

async def get_repository_file_count(
    owner: str,
    repo: str,
    branch: str,
) -> int:
    url = (
        f"{GITHUB_API_URL}/repos/"
        f"{owner}/{repo}/git/trees/{branch}"
    )

    params = {
        "recursive": "1",
    }

    async with httpx.AsyncClient(headers=GITHUB_HEADERS) as client:
        response = await client.get(
            url,
            params=params,
        )

    if response.status_code in (404, 409):
        return 0

    response.raise_for_status()

    tree = response.json().get("tree", [])

    file_count = sum(
        1
        for item in tree
        if item.get("type") == "blob"
    )

    return file_count


async def get_repository_commits(
    owner: str,
    repo: str,
) -> int:
    url = f"{GITHUB_API_URL}/repos/{owner}/{repo}/commits"

    params = {
        "per_page": 30,
    }

    async with httpx.AsyncClient(headers=GITHUB_HEADERS) as client:
        response = await client.get(
            url,
            params=params,
        )

    if response.status_code in (404, 409):
        return 0

    response.raise_for_status()

    commits = response.json()

    return len(commits)

async def get_repository_file_evidence(
    owner: str,
    repo: str,
    branch: str,
) -> dict:
    """
    Inspect repository files to detect technology/dependency evidence.
    """

    url = f"{GITHUB_API_URL}/repos/{owner}/{repo}/git/trees/{branch}"

    params = {
        "recursive": "1"
    }

    async with httpx.AsyncClient(
        headers=GITHUB_HEADERS
    ) as client:

        response = await client.get(
            url,
            params=params
        )

    if response.status_code in (404, 409):
        return {
            "files": [],
            "evidence": [],
        }

    response.raise_for_status()

    tree = response.json().get(
        "tree",
        []
    )

    files = []

    for item in tree:
        if item.get("type") != "blob":
            continue

        path = item.get(
            "path",
            ""
        )

        files.append(path)

    # --------------------------------
    # Technology detection
    # --------------------------------

    evidence = set()

    for file_path in files:

        path = file_path.lower()

        # Python
        if (
            path.endswith(".py")
            or path.endswith("requirements.txt")
            or path.endswith("pyproject.toml")
            or path.endswith("pipfile")
        ):
            evidence.add("Python")

        # JavaScript / TypeScript
        if path.endswith(".js"):
            evidence.add("JavaScript")

        if path.endswith(".ts") or path.endswith(".tsx"):
            evidence.add("TypeScript")

        if path.endswith("package.json"):
            evidence.add("Node.js")

        # Java
        if path.endswith(".java"):
            evidence.add("Java")

        # C / C++
        if path.endswith(".c"):
            evidence.add("C")

        if (
            path.endswith(".cpp")
            or path.endswith(".cc")
            or path.endswith(".cxx")
        ):
            evidence.add("C++")

        # C#
        if path.endswith(".cs"):
            evidence.add("C#")

        # Go
        if path.endswith(".go"):
            evidence.add("Go")

        # HTML / CSS
        if path.endswith(".html"):
            evidence.add("HTML")

        if path.endswith(".css"):
            evidence.add("CSS")

        # Docker
        filename = path.split("/")[-1]

        if filename == "dockerfile":
            evidence.add("Docker")

        if filename in (
            "docker-compose.yml",
            "docker-compose.yaml",
        ):
            evidence.add("Docker")

        # Database / SQL
        if path.endswith(".sql"):
            evidence.add("SQL")

    return {
        "files": files,
        "evidence": sorted(evidence),
    }

async def get_repository_dependency_evidence(
    owner: str,
    repo: str,
    branch: str,
    file_evidence: dict | None = None,
) -> dict:
    """
    Read important dependency/configuration files
    from a repository and return their contents.
    """

    if file_evidence is None:
        file_evidence = await get_repository_file_evidence(
            owner,
            repo,
            branch,
        )

    files = file_evidence.get(
        "files",
        []
    )

    important_files = {
        "requirements.txt",
        "pyproject.toml",
        "pipfile",
        "package.json",
        "dockerfile",
        "docker-compose.yml",
        "docker-compose.yaml",
    }

    selected_files = []

    for file_path in files:

        filename = file_path.split("/")[-1].lower()

        if filename in important_files:
            selected_files.append(file_path)

    dependency_files = []

    for file_path in selected_files:

        url = (
            f"{GITHUB_API_URL}/repos/"
            f"{owner}/{repo}/contents/{file_path}"
        )

        params = {
            "ref": branch
        }

        async with httpx.AsyncClient(
            headers=GITHUB_HEADERS
        ) as client:

            response = await client.get(
                url,
                params=params
            )

        if response.status_code in (404, 409):
            continue

        response.raise_for_status()

        data = response.json()

        content = data.get(
            "content",
            ""
        )

        if not content:
            continue

        import base64

        try:
            decoded_content = base64.b64decode(
                content
            ).decode(
                "utf-8",
                errors="ignore"
            )
        except Exception:
            decoded_content = ""

        if decoded_content:

            dependency_files.append({
                "file": file_path,
                "content": decoded_content,
            })

    return {
        "files": dependency_files,
    }
