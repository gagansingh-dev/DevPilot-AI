from fastapi import APIRouter, HTTPException

from app.services.github_service import (
    get_github_user,
    get_github_repositories,
    get_github_languages,
    get_github_activity,
    get_github_repository_details,
    get_repository_readme,
    get_repository_readme_content,
    get_repository_file_count,
    get_repository_commits,
    get_repository_file_evidence,
    get_repository_dependency_evidence,
)

from app.services.github_analyzer import (
    analyze_github_profile,
    calculate_career_relevance,
)


router = APIRouter(
    prefix="/github",
    tags=["GitHub"],
)


@router.get("/user/{username}")
async def github_user(username: str):
    try:
        user = await get_github_user(username)

        return {
            "username": user["login"],
            "name": user["name"],
            "avatar_url": user["avatar_url"],
            "bio": user["bio"],
            "public_repositories": user["public_repos"],
            "followers": user["followers"],
            "following": user["following"],
            "profile_url": user["html_url"],
        }

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to fetch GitHub profile: {str(e)}",
        )


@router.get("/user/{username}/repositories")
async def github_repositories(username: str):
    try:
        repositories = await get_github_repositories(username)

        return {
            "username": username,
            "total_repositories": len(repositories),
            "repositories": [
                {
                    "name": repo["name"],
                    "description": repo["description"],
                    "stars": repo["stargazers_count"],
                    "forks": repo["forks_count"],
                    "language": repo["language"],
                    "url": repo["html_url"],
                    "updated_at": repo["updated_at"],
                }
                for repo in repositories
            ],
        }

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to fetch GitHub repositories: {str(e)}",
        )


@router.get("/user/{username}/languages")
async def github_languages(username: str):
    try:
        languages = await get_github_languages(username)

        return {
            "username": username,
            "languages": languages,
        }

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to fetch GitHub languages: {str(e)}",
        )


@router.get("/user/{username}/activity")
async def github_activity(username: str):
    try:
        activity = await get_github_activity(username)

        return {
            "username": username,
            "total_events": len(activity),
            "activity": activity,
        }

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to fetch GitHub activity: {str(e)}",
        )


@router.get("/user/{username}/repositories/details")
async def github_repository_details(username: str):
    try:
        repositories = await get_github_repository_details(username)

        detailed_repositories = []

        for repo in repositories:
            repo_name = repo["name"]
            default_branch = repo["default_branch"]

            has_readme = await get_repository_readme(
                username,
                repo_name,
            )

            file_count = await get_repository_file_count(
                username,
                repo_name,
                default_branch,
            )

            commit_count = await get_repository_commits(
                username,
                repo_name,
            )

            detailed_repositories.append(
                {
                    **repo,
                    "has_readme": has_readme,
                    "file_count": file_count,
                    "recent_commits": commit_count,
                }
            )

        return {
            "username": username,
            "total_repositories": len(detailed_repositories),
            "repositories": detailed_repositories,
        }

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to fetch detailed repository "
                f"information: {str(e)}"
            ),
        )


@router.get("/user/{username}/analysis")
async def github_analysis(
    username: str,
    career_goal: str,
):
    try:
        repositories = await get_github_repository_details(username)

        detailed_repositories = []

        for repo in repositories:
            repo_name = repo["name"]
            default_branch = repo["default_branch"]

            readme_content = await get_repository_readme_content(
                username,
                repo_name,
            )

            file_evidence = await get_repository_file_evidence(
                username,
                repo_name,
                default_branch,
            )

            dependency_evidence = await get_repository_dependency_evidence(
                username,
                repo_name,
                default_branch,
)
            detailed_repositories.append({
                **repo,
                "readme_content": readme_content,
                "file_evidence": file_evidence,
                "dependency_evidence": dependency_evidence,
            })

        languages = await get_github_languages(username)

        activity = await get_github_activity(username)

        analysis = analyze_github_profile(
            repositories=detailed_repositories,
            languages=languages,
            activity=activity,
        )

        career_relevance = calculate_career_relevance(
            career_goal=career_goal,
            languages=languages,
            repositories=detailed_repositories,
        )

        return {
            "username": username,
            "analysis": analysis,
            "career_relevance": career_relevance,
        }

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"{type(e).__name__}: {repr(e)}",
        )