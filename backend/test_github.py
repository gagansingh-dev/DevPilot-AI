import asyncio

from app.services.github_service import get_github_user


async def main():
    username = "gagansingh-dev"

    try:
        user = await get_github_user(username)

        print("GitHub user found!")
        print("Username:", user["login"])
        print("Name:", user["name"])
        print("Public Repositories:", user["public_repos"])
        print("Followers:", user["followers"])
        print("Following:", user["following"])

    except Exception as e:
        print("Error:", e)


asyncio.run(main())