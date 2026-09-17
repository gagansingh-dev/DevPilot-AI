def extract_technology_evidence(
    repositories: list,
) -> list:
    """
    Extract technology evidence from repository
    README content, description, name and topics.
    """

    technology_keywords = {
        "Python": ["python"],
        "FastAPI": ["fastapi"],
        "Django": ["django"],
        "Flask": ["flask"],
        "Java": ["java"],
        "JavaScript": ["javascript"],
        "TypeScript": ["typescript"],
        "Node.js": ["node.js", "nodejs"],
        "Go": ["golang"],
        "C#": ["c#", "csharp"],
        "C++": ["c++"],
        "SQL": ["sql"],
        "PostgreSQL": ["postgresql", "postgres"],
        "MongoDB": ["mongodb", "mongo"],
        "SQLAlchemy": ["sqlalchemy"],
        "REST API": [
            "rest api",
            "restful api",
            "restful",
        ],
        "Docker": ["docker", "dockerfile"],
        "Git": ["git", "github"],
        "JWT Authentication": [
            "jwt",
            "json web token",
        ],
        "Redis": ["redis"],
        "TensorFlow": ["tensorflow"],
        "PyTorch": ["pytorch"],
        "Scikit-learn": [
            "scikit-learn",
            "sklearn",
        ],
        "Pandas": ["pandas"],
        "NumPy": ["numpy"],
        "Machine Learning": [
            "machine learning",
            "machine-learning",
        ],
        "Deep Learning": [
            "deep learning",
            "deep-learning",
        ],
        "NLP": [
            "nlp",
            "natural language processing",
        ],
        "Generative AI": [
            "generative ai",
            "generative-ai",
            "genai",
            "llm",
            "large language model",
        ],
        "Linux": ["linux"],
        "Networking": [
            "networking",
            "computer network",
        ],
        "Cybersecurity": [
            "cybersecurity",
            "cyber security",
            "information security",
        ],
    }

    technology_evidence = []

    for repo in repositories:
        repo_name = str(
            repo.get("name", "")
        ).lower()

        description = str(
            repo.get("description", "")
        ).lower()

        readme_content = str(
            repo.get("readme_content", "")
        ).lower()

        topics = repo.get("topics", [])

        topics_text = " ".join(
            str(topic).lower()
            for topic in topics
        )

        searchable_text = " ".join(
            [
                repo_name,
                description,
                topics_text,
                readme_content,
            ]
        )

        detected_technologies = []

        for technology, keywords in (
            technology_keywords.items()
        ):
            for keyword in keywords:
                if keyword in searchable_text:
                    detected_technologies.append(
                        technology
                    )
                    break

        if detected_technologies:
            technology_evidence.append(
                {
                    "repository": repo.get("name"),
                    "technologies": sorted(
                        set(detected_technologies)
                    ),
                    "evidence_sources": {
                        "readme": bool(
                            readme_content
                        ),
                        "description": bool(
                            description
                        ),
                        "topics": bool(topics),
                    },
                }
            )

    return technology_evidence


def calculate_repository_score(
    repo: dict,
) -> int:
    """
    Calculate repository quality/depth score.
    Maximum score = 100.
    """

    score = 0

    # =====================================================
    # 1. README — 15 points
    # =====================================================

    if repo.get("has_readme"):
        score += 15

    # =====================================================
    # 2. Description — 10 points
    # =====================================================

    if repo.get("description"):
        score += 10

    # =====================================================
    # 3. Project size / file depth — 30 points
    # =====================================================

    file_count = repo.get(
        "file_count",
        0,
    )

    if file_count >= 40:
        score += 30
    elif file_count >= 25:
        score += 25
    elif file_count >= 15:
        score += 20
    elif file_count >= 8:
        score += 15
    elif file_count >= 4:
        score += 10
    elif file_count >= 2:
        score += 5

    # =====================================================
    # 4. Commit activity — 20 points
    # =====================================================

    commits = repo.get(
        "recent_commits",
        0,
    )

    if commits >= 20:
        score += 20
    elif commits >= 10:
        score += 17
    elif commits >= 5:
        score += 15
    elif commits >= 3:
        score += 12
    elif commits >= 1:
        score += 7

    # =====================================================
    # 5. Topics — 5 points
    # =====================================================

    topics = repo.get(
        "topics",
        []
    )

    if topics:
        score += 5

    # =====================================================
    # 6. Stars — 3 points
    # =====================================================

    stars = repo.get(
        "stars",
        0,
    )

    if stars >= 10:
        score += 3
    elif stars >= 1:
        score += 2

    # =====================================================
    # 7. Forks — 2 points
    # =====================================================

    forks = repo.get(
        "forks",
        0,
    )

    if forks >= 5:
        score += 2
    elif forks >= 1:
        score += 1

    # =====================================================
    # 8. Technical file evidence — 5 points
    # =====================================================

    file_evidence = repo.get(
        "file_evidence",
        {}
    )

    technologies = file_evidence.get(
        "evidence",
        []
    )

    if len(technologies) >= 5:
        score += 5
    elif len(technologies) >= 3:
        score += 4
    elif len(technologies) >= 1:
        score += 2

    # =====================================================
    # 9. Dependency/configuration evidence — 5 points
    # =====================================================

    dependency_evidence = repo.get(
        "dependency_evidence",
        {}
    )

    dependency_files = dependency_evidence.get(
        "files",
        []
    )

    if len(dependency_files) >= 2:
        score += 5
    elif len(dependency_files) == 1:
        score += 3

    # =====================================================
    # Final score
    # =====================================================

    return min(score, 100)

def analyze_project_depth(
    repositories: list,
) -> dict:
    analyzed_projects = []

    for repo in repositories:
        project_score = calculate_repository_score(
            repo
        )

        analyzed_projects.append(
            {
                "name": repo.get("name"),
                "score": project_score,
                "file_count": repo.get(
                    "file_count",
                    0,
                ),
                "recent_commits": repo.get(
                    "recent_commits",
                    0,
                ),
                "has_readme": repo.get(
                    "has_readme",
                    False,
                ),
                "has_description": bool(
                    repo.get("description")
                ),
                "topics_count": len(
                    repo.get("topics", [])
                ),
                "stars": repo.get(
                    "stars",
                    0,
                ),
                "forks": repo.get(
                    "forks",
                    0,
                ),
                "url": repo.get("url"),
            }
        )

    analyzed_projects.sort(
        key=lambda project: project["score"],
        reverse=True,
    )

    if analyzed_projects:
        overall_score = round(
            sum(
                project["score"]
                for project in analyzed_projects
            )
            / len(analyzed_projects)
        )
    else:
        overall_score = 0

    strong_projects = [
        project["name"]
        for project in analyzed_projects
        if project["score"] >= 60
    ]

    weak_projects = [
        project["name"]
        for project in analyzed_projects
        if project["score"] < 40
    ]

    return {
        "score": overall_score,
        "strong_projects": strong_projects,
        "weak_projects": weak_projects,
        "projects": analyzed_projects,
    }


def analyze_github_profile(
    repositories: list,
    languages: dict,
    activity: list,
) -> dict:
    repository_count = len(repositories)

    language_count = len(languages)

    total_stars = sum(
        repo.get("stars", 0)
        for repo in repositories
    )

    total_forks = sum(
        repo.get("forks", 0)
        for repo in repositories
    )

    recent_events = len(activity)

    if recent_events >= 10:
        activity_status = "Highly Active"
    elif recent_events >= 3:
        activity_status = "Active"
    elif recent_events >= 1:
        activity_status = "Low Activity"
    else:
        activity_status = "Inactive"

    primary_languages = {}

    for repo in repositories:
        language = repo.get("language")

        if language:
            primary_languages[language] = (
                primary_languages.get(
                    language,
                    0,
                )
                + 1
            )

    primary_languages = dict(
        sorted(
            primary_languages.items(),
            key=lambda item: item[1],
            reverse=True,
        )
    )

    project_depth = analyze_project_depth(
        repositories
    )

    return {
        "repository_count": repository_count,
        "language_count": language_count,
        "total_stars": total_stars,
        "total_forks": total_forks,
        "recent_events": recent_events,
        "activity_status": activity_status,
        "primary_languages": primary_languages,
        "project_depth": project_depth,
    }
def calculate_career_relevance(
    career_goal: str,
    languages: dict,
    repositories: list,
) -> dict:
    """
    Calculate GitHub relevance for the target career.
    Uses:
    - GitHub languages
    - README evidence
    - Repository metadata
    - File evidence
    - Dependency/configuration evidence
    - Project depth
    """

    career_profiles = {
        "backend software engineer": {
            "skills": [
                "Python",
                "Java",
                "JavaScript",
                "TypeScript",
                "Go",
                "C#",
                "Node.js",
                "FastAPI",
                "Django",
                "Flask",
                "REST API",
                "PostgreSQL",
                "SQL",
                "Docker",
            ],
            "keywords": [
                "api",
                "backend",
                "server",
                "fastapi",
                "django",
                "flask",
                "node",
                "express",
                "postgres",
                "database",
                "sql",
                "docker",
                "authentication",
            ],
        },

        "ml engineer": {
            "skills": [
                "Python",
                "SQL",
                "TensorFlow",
                "PyTorch",
                "Scikit-learn",
                "Pandas",
                "NumPy",
                "Machine Learning",
            ],
            "keywords": [
                "machine learning",
                "machine-learning",
                "ml",
                "deep learning",
                "deep-learning",
                "tensorflow",
                "pytorch",
                "scikit",
                "sklearn",
                "pandas",
                "numpy",
                "model",
                "prediction",
            ],
        },

        "ai engineer": {
            "skills": [
                "Python",
                "TensorFlow",
                "PyTorch",
                "Machine Learning",
                "Deep Learning",
                "NLP",
                "Generative AI",
            ],
            "keywords": [
                "ai",
                "artificial intelligence",
                "artificial-intelligence",
                "machine learning",
                "machine-learning",
                "deep learning",
                "deep-learning",
                "nlp",
                "llm",
                "generative ai",
                "generative-ai",
                "tensorflow",
                "pytorch",
                "model",
            ],
        },

        "cybersecurity engineer": {
            "skills": [
                "Python",
                "C",
                "C++",
                "Bash",
                "Linux",
                "Networking",
                "Cybersecurity",
            ],
            "keywords": [
                "security",
                "cybersecurity",
                "cyber security",
                "cyber",
                "penetration",
                "pentest",
                "network",
                "linux",
                "authentication",
                "encryption",
                "vulnerability",
                "firewall",
            ],
        },
    }

    career_aliases = {
        "backend": "backend software engineer",
        "backend developer": "backend software engineer",
        "machine learning engineer": "ml engineer",
        "artificial intelligence engineer": "ai engineer",
        "ai developer": "ai engineer",
        "cyber security engineer": "cybersecurity engineer",
        "cybersecurity": "cybersecurity engineer",
    }

    normalized_goal = career_goal.strip().lower()

    normalized_goal = career_aliases.get(
        normalized_goal,
        normalized_goal,
    )

    career_profile = career_profiles.get(
        normalized_goal,
        {
            "skills": [
                "Python",
                "Java",
                "JavaScript",
                "TypeScript",
                "SQL",
                "Git",
                "Docker",
            ],
            "keywords": [
                "api",
                "database",
                "backend",
                "project",
                "application",
                "software",
            ],
        },
    )

    required_skills = career_profile["skills"]
    keywords = career_profile["keywords"]

    # =====================================================
    # 1. GitHub language evidence
    # =====================================================

    github_languages = {
        language.lower()
        for language in languages.keys()
    }

    matched_skills = []
    missing_skills = []

    for skill in required_skills:
        if skill.lower() in github_languages:
            matched_skills.append(skill)

    # =====================================================
    # 2. README / description / topic evidence
    # =====================================================

    technology_evidence = extract_technology_evidence(
        repositories
    )

    detected_technologies = set()

    for evidence in technology_evidence:
        for technology in evidence.get(
            "technologies",
            [],
        ):
            detected_technologies.add(
                technology
            )

    # =====================================================
    # 3. Actual repository file evidence
    # =====================================================

    file_evidence = []

    for repo in repositories:

        repo_name = repo.get(
            "name",
            "",
        )

        evidence_data = repo.get(
            "file_evidence",
            {},
        )

        detected_files = evidence_data.get(
            "files",
            [],
        )

        detected_file_technologies = evidence_data.get(
            "evidence",
            [],
        )

        file_evidence.append({
            "repository": repo_name,
            "technologies": detected_file_technologies,
            "file_count": len(detected_files),
        })

        for technology in detected_file_technologies:
            detected_technologies.add(
                technology
            )

    # =====================================================
    # 4. Dependency/configuration evidence
    # =====================================================

    dependency_technology_evidence = []

    for repo in repositories:

        dependency_data = repo.get(
            "dependency_evidence",
            {}
        )

        dependency_files = dependency_data.get(
            "files",
            []
        )

        detected = set()

        for dependency_file in dependency_files:

            content = str(
                dependency_file.get(
                    "content",
                    ""
                )
            ).lower()

            filename = str(
                dependency_file.get(
                    "file",
                    ""
                )
            ).lower()

            searchable_text = (
                filename
                + "\n"
                + content
            )

            if "fastapi" in searchable_text:
                detected.add("FastAPI")

            if "sqlalchemy" in searchable_text:
                detected.add("SQLAlchemy")

            if "alembic" in searchable_text:
                detected.add("Alembic")

            if "pydantic" in searchable_text:
                detected.add("Pydantic")

            if "uvicorn" in searchable_text:
                detected.add("Uvicorn")

            if (
                "psycopg" in searchable_text
                or "psycopg2" in searchable_text
                or "asyncpg" in searchable_text
            ):
                detected.add("PostgreSQL")

            if "docker" in searchable_text:
                detected.add("Docker")

            if '"react"' in searchable_text:
                detected.add("React")

            if '"vite"' in searchable_text:
                detected.add("Vite")

            if "tailwindcss" in searchable_text:
                detected.add("Tailwind CSS")

        if detected:

            dependency_technology_evidence.append({
                "repository": repo.get(
                    "name",
                    ""
                ),
                "technologies": sorted(
                    detected
                ),
            })

            for technology in detected:

                detected_technologies.add(
                    technology
                )

    technology_to_skill = {
        "FastAPI": "FastAPI",
        "Django": "Django",
        "Flask": "Flask",
        "SQLAlchemy": "SQL",
        "PostgreSQL": "PostgreSQL",
        "Alembic": "SQL",
        "Pydantic": "Python",
        "Uvicorn": "Python",
        "Node.js": "Node.js",
        "React": "JavaScript",
        "Vite": "JavaScript",
        "Docker": "Docker",
    }

    for technology in detected_technologies:

        skill = technology_to_skill.get(
            technology
        )

        if skill and skill in required_skills:

            if skill not in matched_skills:
                matched_skills.append(
                    skill
                )

    # =====================================================
    # 6. Keyword evidence
    # =====================================================

    repository_keyword_matches = set()

    for repo in repositories:

        repo_name = str(
            repo.get("name", "")
        ).lower()

        description = str(
            repo.get("description", "")
        ).lower()

        readme_content = str(
            repo.get("readme_content", "")
        ).lower()

        topics = repo.get(
            "topics",
            [],
        )

        topics_text = " ".join(
            str(topic).lower()
            for topic in topics
        )

        searchable_text = " ".join(
            [
                repo_name,
                description,
                topics_text,
                readme_content,
            ]
        )

        for keyword in keywords:

            if keyword.lower() in searchable_text:

                repository_keyword_matches.add(
                    keyword.lower()
                )

    # =====================================================
    # 7. Keyword → skill mapping
    # =====================================================

    keyword_to_skill = {
        "api": "REST API",
        "backend": "Backend Development",
        "server": "Backend Development",
        "fastapi": "FastAPI",
        "django": "Django",
        "flask": "Flask",
        "node": "Node.js",
        "express": "Node.js",
        "postgres": "PostgreSQL",
        "database": "SQL",
        "sql": "SQL",
        "docker": "Docker",
        "machine-learning": "Machine Learning",
        "machine learning": "Machine Learning",
        "ml": "Machine Learning",
        "deep-learning": "Deep Learning",
        "deep learning": "Deep Learning",
        "tensorflow": "TensorFlow",
        "pytorch": "PyTorch",
        "scikit": "Scikit-learn",
        "sklearn": "Scikit-learn",
        "pandas": "Pandas",
        "numpy": "NumPy",
        "nlp": "NLP",
        "llm": "Generative AI",
        "generative-ai": "Generative AI",
        "generative ai": "Generative AI",
        "ai": "Artificial Intelligence",
        "security": "Cybersecurity",
        "cybersecurity": "Cybersecurity",
        "cyber": "Cybersecurity",
        "pentest": "Penetration Testing",
        "penetration": "Penetration Testing",
        "network": "Networking",
        "linux": "Linux",
        "authentication": "Authentication",
        "encryption": "Encryption",
        "vulnerability": "Vulnerability Assessment",
    }

    for keyword in repository_keyword_matches:

        skill = keyword_to_skill.get(
            keyword
        )

        if skill and skill not in matched_skills:

            matched_skills.append(
                skill
            )

    # =====================================================
    # 8. Missing skills
    # =====================================================

    for skill in required_skills:

        if skill not in matched_skills:

            missing_skills.append(
                skill
            )

            # =====================================================
    # 9. Relevant projects
    # =====================================================

    relevant_project_count = 0

    for repo in repositories:

        repo_name = str(
            repo.get("name", "")
        ).lower()

        description = str(
            repo.get("description", "")
        ).lower()

        readme_content = str(
            repo.get("readme_content", "")
        ).lower()

        topics = repo.get(
            "topics",
            []
        )

        topics_text = " ".join(
            str(topic).lower()
            for topic in topics
        )

        # -------------------------------------------------
        # File evidence
        # -------------------------------------------------

        evidence_data = repo.get(
            "file_evidence",
            {}
        )

        file_technologies = [
            str(item).lower()
            for item in evidence_data.get(
                "evidence",
                []
            )
        ]

        # -------------------------------------------------
        # Dependency evidence
        # -------------------------------------------------

        dependency_data = repo.get(
            "dependency_evidence",
            {}
        )

        dependency_files = dependency_data.get(
            "files",
            []
        )

        dependency_text = " ".join(
            str(item.get("content", "")).lower()
            for item in dependency_files
        )

        # -------------------------------------------------
        # Combine repository evidence
        # -------------------------------------------------

        searchable_text = " ".join(
            [
                repo_name,
                description,
                topics_text,
                readme_content,
                " ".join(file_technologies),
                dependency_text,
            ]
        )

        # -------------------------------------------------
        # 1. Strong career keyword evidence
        # -------------------------------------------------

        keyword_match = any(
            keyword.lower() in searchable_text
            for keyword in keywords
        )

        # -------------------------------------------------
        # 2. Strong technology evidence
        # -------------------------------------------------

        backend_technologies = {
            "fastapi",
            "django",
            "flask",
            "node.js",
            "express",
            "postgresql",
            "postgres",
            "sqlalchemy",
            "alembic",
            "uvicorn",
            "docker",
            "rest api",
        }

        technology_match = any(
            technology in searchable_text
            for technology in backend_technologies
        )

        # -------------------------------------------------
        # 3. Project relevance
        # -------------------------------------------------

        if keyword_match or technology_match:
            relevant_project_count += 1

    # =====================================================
    # 10. Language score — 30 points
    # =====================================================

    language_required = [
        skill
        for skill in required_skills
        if skill.lower() in {
            "python",
            "java",
            "javascript",
            "typescript",
            "go",
            "c",
            "c++",
            "c#",
            "bash",
        }
    ]

    matched_languages = [
        skill
        for skill in language_required
        if skill.lower() in github_languages
    ]

    if language_required:

        language_score = round(
            (
                len(matched_languages)
                / len(language_required)
            ) * 30
        )

    else:

        language_score = 0

    language_score = min(
        language_score,
        30,
    )

    # =====================================================
    # 11. Relevant project score — 30 points
    # =====================================================

    if repositories:

        project_ratio = (
            relevant_project_count
            / len(repositories)
        )

        project_score = round(
            min(project_ratio, 1) * 30
        )

    else:

        project_score = 0

    # =====================================================
    # 12. Project depth — 20 points
    # =====================================================

    project_depth = analyze_project_depth(
        repositories
    )

    depth_score = round(
        (
            project_depth["score"]
            / 100
        ) * 20
    )

    # =====================================================
    # 13. Technology evidence — 20 points
    # =====================================================

    evidence_score = min(
        len(detected_technologies) * 2,
        20,
    )

    # =====================================================
    # 14. Final score
    # =====================================================

    career_relevance_score = min(
        language_score
        + project_score
        + depth_score
        + evidence_score,
        100,
    )

    # =====================================================
    # 15. Suitability
    # =====================================================

    if career_relevance_score >= 75:

        suitability = "High"

    elif career_relevance_score >= 50:

        suitability = "Medium"

    else:

        suitability = "Low"

    # =====================================================
    # 16. Final response
    # =====================================================

    return {
        "career_goal": career_goal,
        "career_relevance_score": career_relevance_score,
        "suitability": suitability,
        "matched_skills": sorted(
            set(matched_skills)
        ),
        "missing_skills": sorted(
            set(missing_skills)
        ),
        "relevant_project_count": (
            relevant_project_count
        ),
        "language_score": language_score,
        "project_score": project_score,
        "depth_score": depth_score,
        "evidence_score": evidence_score,
        "technology_evidence": (
            technology_evidence
        ),
        "file_evidence": file_evidence,
        "dependency_technology_evidence": (
            dependency_technology_evidence
        ),
    }