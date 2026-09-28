import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import "./App.css";
import { formatApiErrorDetail } from "./loginErrors";

export default function App() {
  // =========================================================
  // UI STATE
  // =========================================================
  const [modalOpen, setModalOpen] = useState(false);
  const [activePage, setActivePage] = useState("overview");
  const [interviewFocus, setInterviewFocus] = useState("Mixed practice");
  const [interviewQuestions, setInterviewQuestions] = useState<any[]>([]);
  const [interviewIndex, setInterviewIndex] = useState(0);
  const [interviewAnswer, setInterviewAnswer] = useState("");
  const [interviewFeedback, setInterviewFeedback] = useState<any>(null);
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [interviewError, setInterviewError] = useState("");
  const [interviewHistory, setInterviewHistory] = useState<any[]>([]);
  const [completedRoadmapTasks, setCompletedRoadmapTasks] = useState<string[]>([]);

  // =========================================================
  // AI ANALYSIS STATE
  // =========================================================
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [roadmapData, setRoadmapData] = useState<any[]>([]);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  // =========================================================
  // AUTHENTICATION STATE
  // =========================================================
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("token"))
  );

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [loginMode, setLoginMode] = useState<"login" | "register">("login");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // =========================================================
  // LOGIN
  // =========================================================
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    setLoginLoading(true);
    setLoginError("");

    try {
      const response = await fetch(
        "/api/v1/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: loginEmail,
            password: loginPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          formatApiErrorDetail(data.detail, "Invalid email or password.")
        );
      }

      localStorage.setItem("token", data.access_token);

      setIsLoggedIn(true);
      setLoginEmail("");
      setLoginPassword("");
      setLoginError("");
      setActivePage("overview");
    } catch (error) {
      console.error("Login failed:", error);

      setLoginError(
        error instanceof Error
          ? error.message
          : "Login failed. Please try again."
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const registerResponse = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: registerUsername.trim(),
          email: loginEmail,
          password: loginPassword,
        }),
      });
      const registerData = await registerResponse.json();
      if (!registerResponse.ok) {
        throw new Error(registerData.detail || "Account creation failed.");
      }

      const loginResponse = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const loginData = await loginResponse.json();
      if (!loginResponse.ok) {
        throw new Error(loginData.detail || "Account created; please sign in.");
      }

      localStorage.setItem("token", loginData.access_token);
      setIsLoggedIn(true);
      setLoginEmail("");
      setLoginPassword("");
      setRegisterUsername("");
      setActivePage("profile");
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Registration failed.");
    } finally {
      setLoginLoading(false);
    }
  };

  // =========================================================
  // FETCH AI ANALYSIS
  // =========================================================
  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!isLoggedIn) {
        return;
      }

      setAnalysisLoading(true);
      setAnalysisError("");

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          return;
        }

        const response = await fetch(
          "/api/v1/ai/analysis",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (isSessionExpired(response)) return;
        if (response.status === 404) {
          setAnalysisData(null);
          return;
        }
        if (!response.ok) {
          throw new Error(
            `API Error: ${response.status}`
          );
        }

        const data = await response.json();

        setAnalysisData(data);
      } catch (error) {
        console.error(
          "Failed to fetch AI analysis:",
          error
        );

        setAnalysisError(
          "Unable to load AI analysis."
        );
      } finally {
        setAnalysisLoading(false);
      }
    };

    fetchAnalysis();
  }, [isLoggedIn]);

  // =========================================================
  // FETCH ROADMAP
  // =========================================================
  useEffect(() => {
    const fetchRoadmap = async () => {
      if (!isLoggedIn) {
        return;
      }

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          return;
        }

        const response = await fetch(
          "/api/v1/ai/roadmap",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (isSessionExpired(response)) return;
        if (response.status === 404) {
          setRoadmapData([]);
          return;
        }
        if (!response.ok) {
          throw new Error(
            `Roadmap API Error: ${response.status}`
          );
        }

        const data = await response.json();

        /*
         * Backend roadmap may return either:
         * 1. An array
         * 2. An object containing roadmap/phases
         */
        if (Array.isArray(data)) {
          setRoadmapData(data);
        } else if (Array.isArray(data?.roadmap)) {
          setRoadmapData(data.roadmap);
        } else if (Array.isArray(data?.phases)) {
          setRoadmapData(data.phases);
        } else {
          setRoadmapData([]);
        }
      } catch (error) {
        console.error(
          "Failed to fetch roadmap:",
          error
        );

        setRoadmapData([]);
      }
    };

    fetchRoadmap();
  }, [isLoggedIn]);

  // =========================================================
  // DASHBOARD DATA
  // =========================================================
  const careerReadiness =
    analysisData?.career_readiness_score ?? 0;

  const resumeScore =
    analysisData?.resume_score ?? 0;

  const careerSuitability =
    analysisData?.suitability ?? "Not analyzed";

  const strengths =
    Array.isArray(analysisData?.strengths)
      ? analysisData.strengths
      : [];

  const skillGaps =
    Array.isArray(analysisData?.skill_gaps)
      ? analysisData.skill_gaps
      : [];

  const recommendedSkills =
    Array.isArray(analysisData?.recommended_skills)
      ? analysisData.recommended_skills
      : [];

  const recommendedProjects =
    Array.isArray(analysisData?.recommended_projects)
      ? analysisData.recommended_projects
      : [];

  // =========================================================
  // COMMON NAVIGATION
  // =========================================================
  const navigateTo = (page: string) => {
    setActivePage(page);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // LOGIN SCREEN
  // =========================================================
  // =========================================================
  // PROFILE STATE
  // =========================================================
  const [profileData, setProfileData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    target_role: "",
    experience_level: "Beginner",
    bio: "",
    skills: "",
    github_username: "",
  });
  const targetCareer =
    analysisData?.career ??
    profileData?.target_role ??
    "Set your target career";

  // =========================================================
  // RESUME STATE
  // =========================================================
  const [resumeData, setResumeData] = useState<any>(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeMessage, setResumeMessage] = useState("");

  // =========================================================
  // GITHUB STATE
  // =========================================================
  const [githubData, setGithubData] = useState<any>({
    username: "",
    analysis: {
      repository_count: 0,
      language_count: 0,
      activity_status: "Not analyzed",
      primary_languages: {},
      projects: [],
    },
    career_relevance: {
      career_relevance_score: 0,
      suitability: "Not analyzed",
      matched_skills: [],
      missing_skills: [],
      relevant_project_count: 0,
    },
  });

  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setActivePage("overview");
    setAnalysisData(null);
    setRoadmapData([]);
    setProfileData(null);
    setResumeData(null);
    setGithubData({ username: "", analysis: {}, career_relevance: {} });
    setInterviewHistory([]);
    setCompletedRoadmapTasks([]);
  };

  function isSessionExpired(response: Response) {
    if (response.status !== 401) return false;
    handleLogout();
    return true;
  }

  const loadUserLocalData = (userId?: number) => {
    if (!userId) return;
    try {
      setInterviewHistory(JSON.parse(localStorage.getItem(`devpilot-interview-history:${userId}`) || "[]"));
      setCompletedRoadmapTasks(JSON.parse(localStorage.getItem(`devpilot-roadmap-tasks:${userId}`) || "[]"));
    } catch {
      setInterviewHistory([]);
      setCompletedRoadmapTasks([]);
    }
  };

  const beginProfileEdit = () => {
    if (profileData) {
      setProfileForm({
        full_name: profileData.full_name ?? "",
        target_role: profileData.target_role ?? "",
        experience_level: profileData.experience_level ?? "Beginner",
        bio: profileData.bio ?? "",
        skills: profileData.skills ?? "",
        github_username: profileData.github_username ?? "",
      });
    }
    setProfileEditing(true);
  };

  // =========================================================
  // FETCH PROFILE
  // =========================================================
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isLoggedIn) {
        return;
      }

      setProfileLoading(true);

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          return;
        }

        const response = await fetch(
          "/api/v1/profile",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (isSessionExpired(response)) return;
        if (response.status === 404) {
          setProfileData(null);
          setActivePage("profile");
          return;
        }
        if (!response.ok) {
          throw new Error(
            `Profile API Error: ${response.status}`
          );
        }

        const data = await response.json();

        setProfileData(data);
        loadUserLocalData(data.user_id);
        setProfileMessage("");
      } catch (error) {
        console.error(
          "Failed to fetch profile:",
          error
        );
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchLatestResume = async () => {
      if (!isLoggedIn) return;
      const token = localStorage.getItem("token");
      if (!token) return;
      setResumeLoading(true);
      try {
        const response = await fetch("/api/v1/resume/latest", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (isSessionExpired(response)) return;
        if (response.status === 404) {
          setResumeData(null);
          return;
        }
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Could not load resume.");
        setResumeData(data);
      } catch (error) {
        setResumeMessage(error instanceof Error ? error.message : "Could not load resume.");
      } finally {
        setResumeLoading(false);
      }
    };
    void fetchLatestResume();
  }, [isLoggedIn]);

  const handleSaveProfile = async (event: FormEvent) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    setProfileSaving(true);
    setProfileMessage("");
    try {
      const response = await fetch("/api/v1/profile", {
        method: profileData ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...profileForm,
          full_name: profileForm.full_name.trim(),
          target_role: profileForm.target_role.trim(),
          skills: profileForm.skills.trim(),
          github_username: profileForm.github_username.trim() || null,
        }),
      });
      if (isSessionExpired(response)) return;
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Could not save profile.");
      }
      setProfileData(data);
      setProfileForm({
        full_name: data.full_name ?? "",
        target_role: data.target_role ?? "",
        experience_level: data.experience_level ?? "Beginner",
        bio: data.bio ?? "",
        skills: data.skills ?? "",
        github_username: data.github_username ?? "",
      });
      loadUserLocalData(data.user_id);
      setProfileEditing(false);
      setProfileMessage("Profile saved.");
    } catch (error) {
      setProfileMessage(error instanceof Error ? error.message : "Could not save profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleRunAnalysis = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setAnalysisLoading(true);
    setAnalysisError("");
    try {
      const response = await fetch("/api/v1/ai/analyze", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (isSessionExpired(response)) return;
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Career analysis failed.");
      }
      setAnalysisData(data);
      setRoadmapData(Array.isArray(data.roadmap) ? data.roadmap : []);
      setModalOpen(false);
      navigateTo("analysis");
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : "Career analysis failed.");
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleGenerateInterview = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setInterviewLoading(true);
    setInterviewError("");
    setInterviewFeedback(null);
    setInterviewAnswer("");
    try {
      const response = await fetch("/api/v1/interview/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          career_goal: profileData?.target_role || targetCareer,
          experience_level: profileData?.experience_level || "Beginner",
          focus_area: interviewFocus === "Mixed practice" ? null : interviewFocus,
          count: 5,
        }),
      });
      if (isSessionExpired(response)) return;
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Could not create interview questions.");
      setInterviewQuestions(Array.isArray(data.questions) ? data.questions : []);
      setInterviewIndex(0);
    } catch (error) {
      setInterviewError(error instanceof Error ? error.message : "Could not create interview questions.");
    } finally {
      setInterviewLoading(false);
    }
  };

  const handleEvaluateInterviewAnswer = async () => {
    const token = localStorage.getItem("token");
    const currentQuestion = interviewQuestions[interviewIndex];
    if (!token || !currentQuestion || interviewAnswer.trim().length < 5) {
      setInterviewError("Write a few sentences before asking for feedback.");
      return;
    }
    setInterviewLoading(true);
    setInterviewError("");
    try {
      const response = await fetch("/api/v1/interview/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          career_goal: profileData?.target_role || targetCareer,
          experience_level: profileData?.experience_level || "Beginner",
          question: currentQuestion.question,
          answer: interviewAnswer.trim(),
        }),
      });
      if (isSessionExpired(response)) return;
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Could not evaluate your answer.");
      setInterviewFeedback(data);
      const entry = {
        date: new Date().toISOString(),
        role: profileData?.target_role || targetCareer,
        question: currentQuestion.question,
        answer: interviewAnswer.trim(),
        feedback: data,
      };
      const nextHistory = [entry, ...interviewHistory].slice(0, 20);
      setInterviewHistory(nextHistory);
      localStorage.setItem(`devpilot-interview-history:${profileData?.user_id}`, JSON.stringify(nextHistory));
    } catch (error) {
      setInterviewError(error instanceof Error ? error.message : "Could not evaluate your answer.");
    } finally {
      setInterviewLoading(false);
    }
  };

  // =========================================================
  // FETCH GITHUB ANALYSIS
  // =========================================================
  useEffect(() => {
    const fetchGithubAnalysis = async () => {
      if (
        !isLoggedIn ||
        !profileData?.github_username
      ) {
        setGithubData({ username: "", analysis: {}, career_relevance: {} });
        return;
      }

      setGithubLoading(true);
      setGithubError("");

      try {
        const username =
          profileData.github_username;

        const careerGoal =
          profileData.target_role ||
          "Software Engineer";

       const url =
  `/api/v1/github/user/` +
  `${encodeURIComponent(username)}/analysis` +
  `?career_goal=${encodeURIComponent(careerGoal)}`;

const response = await fetch(url, {
  method: "GET",
  cache: "no-store",
  headers: {
    Accept: "application/json",
  },
});

        if (!response.ok) {
          const errorText =
            await response.text();

          console.error(
            "GitHub API Error Response:",
            errorText
          );

          throw new Error(
            `GitHub API Error: ${response.status}`
          );
        }

        const data =
          await response.json();

        // Keep the complete backend response
        // instead of throwing away useful fields.
        const analysis =
          data?.analysis ?? {};

        const careerRelevance =
          data?.career_relevance ?? {};

        const projects = Array.isArray(analysis?.projects)
          ? analysis.projects
          : Array.isArray(analysis?.project_depth?.projects)
          ? analysis.project_depth.projects
          : [];

        // Repository count fallback:
        // If backend does not directly send repository_count,
        // count the projects returned by the backend.
        const repositoryCount =
          Number(
            analysis?.repository_count ?? 0
          ) > 0
            ? Number(
                analysis.repository_count
              )
            : projects.length;

        // Language count fallback:
        // If backend does not directly send language_count,
        // count primary languages.
        const languageCount =
          Number(
            analysis?.language_count ?? 0
          ) > 0
            ? Number(
                analysis.language_count
              )
            : Object.keys(
                analysis?.primary_languages ?? {}
              ).length;

        const normalizedGithubData = {
          ...data,

          username:
            data?.username ?? username,

          analysis: {
            ...analysis,

            repository_count:
              repositoryCount,

            language_count:
              languageCount,

            activity_status:
              analysis?.activity_status ??
              "Not analyzed",

            primary_languages:
              analysis?.primary_languages ??
              {},

            projects:
              projects,
          },

          career_relevance: {
            ...careerRelevance,

            career_relevance_score:
              Number(
                careerRelevance
                  ?.career_relevance_score ??
                  0
              ),

            suitability:
              careerRelevance?.suitability ??
              "Not analyzed",

            matched_skills:
              careerRelevance
                ?.matched_skills ?? [],

            missing_skills:
              careerRelevance
                ?.missing_skills ?? [],

            relevant_project_count:
              Number(
                careerRelevance
                  ?.relevant_project_count ??
                  0
              ),
          },
        };

        setGithubData(
          normalizedGithubData
        );
      } catch (error) {
        console.error(
          "Failed to fetch GitHub analysis:",
          error
        );
        setGithubError(error instanceof Error ? error.message : "GitHub analysis failed.");
      } finally {
        setGithubLoading(false);
      }
    };

    fetchGithubAnalysis();
  }, [isLoggedIn, profileData]);

  // =========================================================
  // RESUME UPLOAD
  // =========================================================
  const handleResumeUpload = async (
    file: File
  ) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setResumeMessage(
        "Please login first."
      );
      return;
    }

    setResumeLoading(true);
    setResumeMessage("");

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(
        "/api/v1/resume/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (isSessionExpired(response)) return;
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Resume upload failed."
        );
      }

      setResumeData(data);
      setAnalysisData(null);
      setRoadmapData([]);

      setResumeMessage(
        data.message ||
          "Resume uploaded successfully."
      );
    } catch (error) {
      console.error(
        "Resume upload failed:",
        error
      );

      setResumeMessage(
        error instanceof Error
          ? error.message
          : "Resume upload failed."
      );
    } finally {
      setResumeLoading(false);
    }
  };

  // =========================================================
  // PROFILE DISPLAY DATA
  // =========================================================
  const profileName =
    profileData?.name ||
    profileData?.full_name ||
    "Your profile";

  const profileCareer =
    profileData?.target_career ||
    profileData?.career_goal ||
    targetCareer;

  const profileUniversity =
    profileData?.university ||
    profileData?.college ||
    "Education details not added";

  const profileDegree =
    profileData?.degree ||
    "Add education details to your bio";

 // =========================================================
// GITHUB DISPLAY DATA
// =========================================================

const rawGithubRepositoryCount =
  Number(
    githubData?.analysis?.repository_count ?? 0
  );

const githubRepositoryCount =
  rawGithubRepositoryCount > 0
    ? rawGithubRepositoryCount
    : Array.isArray(
        githubData?.analysis?.projects
      )
    ? githubData.analysis.projects.length
    : 0;

const rawGithubLanguageCount =
  Number(
    githubData?.analysis?.language_count ?? 0
  );

const githubLanguageCount =
  rawGithubLanguageCount > 0
    ? rawGithubLanguageCount
    : Object.keys(
        githubData?.analysis?.primary_languages ?? {}
      ).length;

const githubActivity =
  githubData?.analysis?.activity_status ??
  "Not analyzed";

const githubRelevanceScore =
  Number(
    githubData?.career_relevance
      ?.career_relevance_score ?? 0
  );

const githubSuitability =
  githubData?.career_relevance
    ?.suitability ??
  "Not analyzed";

const githubMatchedSkills =
  Array.isArray(
    githubData?.career_relevance
      ?.matched_skills
  )
    ? githubData.career_relevance.matched_skills
    : [];

const githubMissingSkills =
  Array.isArray(
    githubData?.career_relevance
      ?.missing_skills
  )
    ? githubData.career_relevance.missing_skills
    : [];

  // =========================================================
  // SAFE ARRAY HELPERS
  // =========================================================
  const toArray = (value: any) => {
    if (Array.isArray(value)) {
      return value;
    }

    return [];
  };

  const safeStrengths =
    toArray(strengths);

  const safeSkillGaps =
    toArray(skillGaps);

  const safeRecommendedSkills =
    toArray(recommendedSkills);

  const safeRecommendedProjects =
    toArray(recommendedProjects);

  // =========================================================
  // PROJECT DISPLAY HELPER
  // =========================================================
  const getProjectTitle = (
    project: any
  ) => {
    if (typeof project === "string") {
      return project;
    }

    return (
      project?.title ||
      project?.name ||
      "Recommended Project"
    );
  };

  const getProjectDescription = (
    project: any
  ) => {
    if (typeof project === "string") {
      return "Build this project to strengthen your practical backend skills.";
    }

    return (
      project?.description ||
      "Build this project to strengthen your practical skills."
    );
  };

  const getProjectIcon = (
    project: any
  ) => {
    if (
      typeof project === "object" &&
      project?.icon
    ) {
      return project.icon;
    }

    return "🚀";
  };

  // =========================================================
  // SKILL DISPLAY HELPER
  // =========================================================
  const getSkillName = (
    skill: any
  ) => {
    if (typeof skill === "string") {
      return skill;
    }

    return (
      skill?.name ||
      skill?.skill ||
      skill?.title ||
      "Recommended Skill"
    );
  };

  // =========================================================
  // SKILL GAP DISPLAY HELPER
  // =========================================================
  const getSkillGapName = (
    gap: any
  ) => {
    if (typeof gap === "string") {
      return gap;
    }

    return (
      gap?.name ||
      gap?.skill ||
      gap?.title ||
      "Skill Gap"
    );
  };

  // =========================================================
  // ROADMAP DISPLAY HELPER
  // =========================================================
  const getRoadmapTitle = (
    phase: any
  ) => {
    if (typeof phase === "string") {
      return phase;
    }

    return (
      phase?.title ||
      phase?.name ||
      phase?.phase_name ||
      "Roadmap Phase"
    );
  };

  const getRoadmapDescription = (
    phase: any
  ) => {
    if (typeof phase === "string") {
      return "Follow this phase to improve your career readiness.";
    }

    return (
      phase?.description ||
      phase?.details ||
      phase?.summary ||
      "Follow this phase to improve your career readiness."
    );
  };

  const getRoadmapTaskId = (phase: any, task: any, taskIndex: number) => {
    const title = typeof task === "string" ? task : task?.title || task?.description || `task-${taskIndex}`;
    return `${profileData?.user_id ?? "anonymous"}:${profileData?.target_role || targetCareer}:${getRoadmapTitle(phase)}:${title}`;
  };

  const toggleRoadmapTask = (taskId: string) => {
    setCompletedRoadmapTasks((current) => {
      const next = current.includes(taskId)
        ? current.filter((item) => item !== taskId)
        : [...current, taskId];
      localStorage.setItem(`devpilot-roadmap-tasks:${profileData?.user_id ?? "anonymous"}`, JSON.stringify(next));
      return next;
    });
  };

  const roadmapTaskCount = roadmapData.reduce(
    (total, phase) => total + (Array.isArray(phase?.tasks) ? phase.tasks.length : 0),
    0,
  );
  const roadmapCompletedCount = roadmapData.reduce(
    (total, phase) => total + (Array.isArray(phase?.tasks)
      ? phase.tasks.filter((task: any, index: number) => completedRoadmapTasks.includes(getRoadmapTaskId(phase, task, index))).length
      : 0),
    0,
  );

  // =========================================================
  // ANALYSIS STATUS
  // =========================================================
  const hasAnalysis =
    Boolean(analysisData);

  const analysisStatusText =
    analysisLoading
      ? "Analyzing..."
      : hasAnalysis
      ? "Analysis available"
      : "Analysis not available";

  // =========================================================
  // LOGIN SCREEN
  // =========================================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background text-on-background flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-on-primary mb-5 shadow-lg">
              <span className="text-2xl font-black">
                D
              </span>
            </div>

            <h1 className="text-4xl font-black tracking-tight">
              DevPilot AI
            </h1>

            <p className="mt-2 text-on-surface-variant">
              From Code to Career
            </p>
          </div>

          <div className="bg-surface-container rounded-3xl p-7 shadow-xl border border-outline-variant">
            <div className="mb-7">
              <h2 className="text-2xl font-bold">
                {loginMode === "login" ? "Welcome back" : "Create your account"}
              </h2>

              <p className="text-sm text-on-surface-variant mt-1">
                Login to continue your career journey.
              </p>
            </div>

            <form
              onSubmit={loginMode === "login" ? handleLogin : handleRegister}
              className="space-y-5"
            >
              {loginMode === "register" && (
                <div>
                  <label className="block text-sm font-semibold mb-2">Username</label>
                  <input
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    placeholder="Choose a username"
                    minLength={3}
                    maxLength={50}
                    required
                    className="w-full rounded-xl border border-outline-variant bg-surface-container-high px-4 py-3 outline-none focus:border-primary"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Email
                </label>

                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) =>
                    setLoginEmail(
                      e.target.value
                    )
                  }
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl border border-outline-variant bg-surface-container-high px-4 py-3 outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Password
                </label>

                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) =>
                    setLoginPassword(
                      e.target.value
                    )
                  }
                  placeholder="••••••••"
                  required
                  minLength={loginMode === "register" ? 8 : undefined}
                  className="w-full rounded-xl border border-outline-variant bg-surface-container-high px-4 py-3 outline-none focus:border-primary"
                />
              </div>

              {loginError && (
                <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full rounded-xl bg-primary text-on-primary py-3.5 font-bold transition hover:opacity-90 disabled:opacity-60"
              >
                {loginLoading
                  ? "Please wait..."
                  : loginMode === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>
            <p className="mt-5 text-center text-sm text-on-surface-variant">
              {loginMode === "login" ? "New to DevPilot?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setLoginError("");
                  setLoginMode(loginMode === "login" ? "register" : "login");
                }}
                className="font-bold text-primary hover:underline"
              >
                {loginMode === "login" ? "Create an account" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN APPLICATION
  // =========================================================
  // =========================================================
  // MAIN APPLICATION LAYOUT
  // =========================================================
  return (
    <div className="min-h-screen bg-background text-on-background">
      {/* =====================================================
          HEADER
      ===================================================== */}
      <header className="sticky top-0 z-40 border-b border-outline-variant bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigateTo("overview")}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-black">
              D
            </div>

            <div className="text-left">
              <h1 className="font-black text-lg">
                DevPilot AI
              </h1>
              <p className="text-xs text-on-surface-variant">
                From Code to Career
              </p>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold">
                {profileName}
              </p>

              <p className="text-xs text-on-surface-variant">
                {targetCareer}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl border border-outline-variant text-sm font-semibold hover:bg-surface-container transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}
      <main className="max-w-7xl mx-auto px-6 py-8 pb-28">

        {/* ===================================================
            OVERVIEW
        =================================================== */}
        {activePage === "overview" && (
          <section className="space-y-8">

            <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 items-stretch">

              <div className="rounded-3xl bg-surface-container p-8 border border-outline-variant">
                <div className="max-w-2xl">
                  <span className="inline-flex px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-5">
                    AI Career Intelligence
                  </span>

                  <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                    Turn your code into your career.
                  </h2>

                  <p className="mt-5 text-on-surface-variant leading-relaxed max-w-xl">
                    DevPilot AI analyzes your resume, GitHub
                    projects, skills and career goal to identify
                    gaps and create a personalized career roadmap.
                  </p>

                  <div className="flex flex-wrap gap-3 mt-7">
                    <button
                      type="button"
                      onClick={() => setModalOpen(true)}
                      className="px-6 py-3 rounded-xl bg-primary text-on-primary font-bold hover:opacity-90 transition"
                    >
                      Start AI Analysis
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigateTo("dashboard")
                      }
                      className="px-6 py-3 rounded-xl border border-outline-variant font-bold hover:bg-surface-container-high transition"
                    >
                      View Dashboard
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-surface-container-high p-7 border border-outline-variant">
                <p className="text-sm font-semibold text-on-surface-variant">
                  Current Career Goal
                </p>

                <h3 className="text-2xl font-black mt-3">
                  {targetCareer}
                </h3>

                <div className="mt-7">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Career Readiness</span>
                    <span className="font-bold">
                      {careerReadiness}/100
                    </span>
                  </div>

                  <div className="h-3 rounded-full bg-surface-container">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-700"
                      style={{
                        width: `${Math.min(
                          Math.max(
                            careerReadiness,
                            0
                          ),
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-7">
                  <div className="rounded-2xl bg-surface-container p-4">
                    <p className="text-xs text-on-surface-variant">
                      Resume
                    </p>

                    <p className="text-2xl font-black mt-1">
                      {resumeScore}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-surface-container p-4">
                    <p className="text-xs text-on-surface-variant">
                      GitHub
                    </p>

                    <p className="text-2xl font-black mt-1">
                      {githubRelevanceScore}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK STATS */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

              <div className="rounded-2xl bg-surface-container p-5 border border-outline-variant">
                <p className="text-sm text-on-surface-variant">
                  GitHub Repositories
                </p>

                <p className="text-3xl font-black mt-2">
                  {githubRepositoryCount}
                </p>
              </div>

              <div className="rounded-2xl bg-surface-container p-5 border border-outline-variant">
                <p className="text-sm text-on-surface-variant">
                  Languages
                </p>

                <p className="text-3xl font-black mt-2">
                  {githubLanguageCount}
                </p>
              </div>

              <div className="rounded-2xl bg-surface-container p-5 border border-outline-variant">
                <p className="text-sm text-on-surface-variant">
                  Skill Gaps
                </p>

                <p className="text-3xl font-black mt-2">
                  {safeSkillGaps.length}
                </p>
              </div>

              <div className="rounded-2xl bg-surface-container p-5 border border-outline-variant">
                <p className="text-sm text-on-surface-variant">
                  Roadmap Phases
                </p>

                <p className="text-3xl font-black mt-2">
                  {roadmapData.length}
                </p>
              </div>

            </div>

            {/* DATA SOURCES */}
            <div className="rounded-3xl bg-surface-container p-7 border border-outline-variant">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black">
                    Your Career Intelligence
                  </h3>

                  <p className="text-sm text-on-surface-variant mt-1">
                    Data sources used by DevPilot AI.
                  </p>
                </div>

                <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                  {analysisStatusText}
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-4">

                <div className="rounded-2xl bg-surface-container-high p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">
                      📄
                    </span>

                    <span className={`text-xs font-bold ${resumeData ? "text-primary" : "text-on-surface-variant"}`}>
                      {resumeData ? "Connected" : "Missing"}
                    </span>
                  </div>

                  <h4 className="font-bold mt-4">
                    Resume
                  </h4>

                  <p className="text-sm text-on-surface-variant mt-1">
                    {resumeData?.file_name || "No resume uploaded yet"}
                  </p>
                </div>

                <div className="rounded-2xl bg-surface-container-high p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">
                      ◉
                    </span>

                    <span className={`text-xs font-bold ${profileData?.github_username ? "text-primary" : "text-on-surface-variant"}`}>
                      {profileData?.github_username ? "Connected" : "Missing"}
                    </span>
                  </div>

                  <h4 className="font-bold mt-4">
                    GitHub
                  </h4>

                  <p className="text-sm text-on-surface-variant mt-1">
                    {githubRepositoryCount} repositories
                  </p>
                </div>

                <div className="rounded-2xl bg-surface-container-high p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">
                      ✦
                    </span>

                    <span className="text-xs font-bold text-primary">
                      AI
                    </span>
                  </div>

                  <h4 className="font-bold mt-4">
                    Career Analysis
                  </h4>

                  <p className="text-sm text-on-surface-variant mt-1">
                    {careerSuitability}
                  </p>
                </div>

              </div>
            </div>
          </section>
        )}

        {activePage === "overview" && (
          <section className="-mt-4 mb-8 rounded-3xl bg-surface-container border border-outline-variant p-7 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-black">GitHub project snapshot</h3>
                <p className="text-sm text-on-surface-variant mt-1">Career relevance from your public repositories.</p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">{githubLoading ? "Analyzing…" : githubActivity}</span>
            </div>
            {githubError && <p role="status" className="text-sm text-error">{githubError}</p>}
            {profileData?.github_username ? (
              <>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="rounded-2xl bg-surface-container-high p-4"><p className="text-xs text-on-surface-variant">Career relevance</p><p className="text-2xl font-black mt-1">{githubRelevanceScore}/100</p></div>
                  <div className="rounded-2xl bg-surface-container-high p-4"><p className="text-xs text-on-surface-variant">Role fit</p><p className="text-2xl font-black mt-1">{githubSuitability}</p></div>
                  <div className="rounded-2xl bg-surface-container-high p-4"><p className="text-xs text-on-surface-variant">Repositories</p><p className="text-2xl font-black mt-1">{githubRepositoryCount}</p></div>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <h4 className="text-sm font-bold mb-3">Skills with repository evidence</h4>
                    <div className="flex flex-wrap gap-2">{githubMatchedSkills.length ? githubMatchedSkills.slice(0, 8).map((skill: string) => <span key={skill} className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">{skill}</span>) : <p className="text-sm text-on-surface-variant">No matched skills returned yet.</p>}</div>
                    {githubMissingSkills.length > 0 && <p className="mt-3 text-xs text-on-surface-variant">Next to evidence: {githubMissingSkills.slice(0, 5).join(", ")}</p>}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold mb-3">Top repositories</h4>
                    <div className="space-y-2">{githubData?.analysis?.projects?.slice(0, 3).map((project: any) => <a key={project.name} href={project.url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-high p-3 hover:bg-surface-container-highest"><span className="truncate text-sm font-semibold">{project.name}</span><span className="shrink-0 text-xs text-on-surface-variant">Score {project.score}/100</span></a>)}</div>
                    {githubData?.analysis?.projects?.length === 0 && <p className="text-sm text-on-surface-variant">Project details will appear after analysis.</p>}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-on-surface-variant">Add your GitHub username in your profile to analyze projects and skill evidence.</p>
            )}
          </section>
        )}

        {/* ===================================================
            DASHBOARD
        =================================================== */}
        {activePage === "dashboard" && (
          <section className="space-y-8">

            <div>
              <p className="text-sm font-bold text-primary">
                DASHBOARD
              </p>

              <h2 className="text-4xl font-black mt-2">
                Career Overview
              </h2>

              <p className="text-on-surface-variant mt-2">
                Your current progress based on available career data.
              </p>
            </div>

            {/* SCORE CARDS */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">

              <div className="rounded-3xl bg-surface-container p-6 border border-outline-variant">
                <p className="text-sm text-on-surface-variant">
                  Career Readiness
                </p>

                <p className="text-5xl font-black mt-3">
                  {careerReadiness}
                  <span className="text-xl text-on-surface-variant">
                    /100
                  </span>
                </p>

                <div className="h-2 bg-surface-container-high rounded-full mt-5">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        Math.max(
                          careerReadiness,
                          0
                        ),
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="rounded-3xl bg-surface-container p-6 border border-outline-variant">
                <p className="text-sm text-on-surface-variant">
                  Resume Score
                </p>

                <p className="text-5xl font-black mt-3">
                  {resumeScore}
                  <span className="text-xl text-on-surface-variant">
                    /100
                  </span>
                </p>

                <p className="text-sm text-on-surface-variant mt-4">
                  Based on latest AI analysis
                </p>
              </div>

              <div className="rounded-3xl bg-surface-container p-6 border border-outline-variant">
                <p className="text-sm text-on-surface-variant">
                  GitHub Projects
                </p>

                <p className="text-5xl font-black mt-3">
                  {githubRepositoryCount}
                </p>

                <p className="text-sm text-on-surface-variant mt-4">
                  Repositories analyzed
                </p>
              </div>

              <div className="rounded-3xl bg-surface-container p-6 border border-outline-variant">
                <p className="text-sm text-on-surface-variant">
                  Skill Gaps
                </p>

                <p className="text-5xl font-black mt-3">
                  {safeSkillGaps.length}
                </p>

                <p className="text-sm text-on-surface-variant mt-4">
                  Areas to improve
                </p>
              </div>

            </div>

            <div className="rounded-3xl bg-surface-container border border-outline-variant p-7">
              <div className="mb-5">
                <h3 className="text-xl font-black">Readiness snapshot</h3>
                <p className="mt-1 text-sm text-on-surface-variant">A quick comparison of your current evidence scores.</p>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Career readiness", value: careerReadiness },
                  { label: "Resume strength", value: resumeScore },
                  { label: "GitHub relevance", value: githubRelevanceScore },
                ].map((metric) => (
                  <div key={metric.label}>
                    <div className="mb-1.5 flex justify-between text-sm"><span>{metric.label}</span><span className="font-bold">{metric.value}/100</span></div>
                    <div className="h-2.5 rounded-full bg-surface-container-high"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, Math.max(0, Number(metric.value) || 0))}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>

            {/* CAREER GOAL */}
            <div className="rounded-3xl bg-surface-container p-7 border border-outline-variant">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                <div>
                  <p className="text-sm text-on-surface-variant">
                    Target Career
                  </p>

                  <h3 className="text-2xl font-black mt-2">
                    {targetCareer}
                  </h3>

                  <p className="text-sm text-on-surface-variant mt-2">
                    AI suitability:{" "}
                    <span className="font-bold text-on-background">
                      {careerSuitability}
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigateTo("analysis")
                  }
                  className="px-5 py-3 rounded-xl bg-primary text-on-primary font-bold"
                >
                  View Full Analysis
                </button>

              </div>
            </div>

            {/* FOCUS AREAS */}
            <div className="grid lg:grid-cols-2 gap-6">

              <div className="rounded-3xl bg-surface-container p-7 border border-outline-variant">

                <h3 className="text-xl font-black">
                  Current Skill Gaps
                </h3>

                <p className="text-sm text-on-surface-variant mt-1 mb-5">
                  Skills identified by your AI career analysis.
                </p>

                <div className="space-y-3">
                  {safeSkillGaps.length > 0 ? (
                    safeSkillGaps.slice(0, 6).map(
                      (gap: any, index: number) => (
                        <div
                          key={`${getSkillGapName(
                            gap
                          )}-${index}`}
                          className="flex items-center gap-3 rounded-2xl bg-surface-container-high px-4 py-3"
                        >
                          <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </span>

                          <span className="font-semibold">
                            {getSkillGapName(gap)}
                          </span>
                        </div>
                      )
                    )
                  ) : (
                    <p className="text-sm text-on-surface-variant">
                      No skill gaps available yet.
                    </p>
                  )}
                </div>

              </div>

              <div className="rounded-3xl bg-surface-container p-7 border border-outline-variant">

                <h3 className="text-xl font-black">
                  Recommended Skills
                </h3>

                <p className="text-sm text-on-surface-variant mt-1 mb-5">
                  Skills you can focus on next.
                </p>

                <div className="flex flex-wrap gap-3">
                  {safeRecommendedSkills.length > 0 ? (
                    safeRecommendedSkills.map(
                      (skill: any, index: number) => (
                        <span
                          key={`${getSkillName(
                            skill
                          )}-${index}`}
                          className="px-4 py-2 rounded-xl bg-primary/10 text-primary font-semibold text-sm"
                        >
                          {getSkillName(skill)}
                        </span>
                      )
                    )
                  ) : (
                    <p className="text-sm text-on-surface-variant">
                      No recommendations available yet.
                    </p>
                  )}
                </div>

              </div>

            </div>
          </section>
        )}

        {/* ===================================================
            ANALYSIS
        =================================================== */}
        {activePage === "analysis" && (
          <section className="space-y-8">

            <div>
              <p className="text-sm font-bold text-primary">
                AI CAREER ANALYSIS
              </p>

              <h2 className="text-4xl font-black mt-2">
                Your Career Intelligence
              </h2>

              <p className="text-on-surface-variant mt-2">
                AI-generated insights from your profile and career data.
              </p>
            </div>

            {analysisLoading && (
              <div className="rounded-3xl bg-surface-container p-10 text-center border border-outline-variant">
                <div className="text-3xl mb-3">
                  ✦
                </div>

                <h3 className="text-xl font-bold">
                  Loading AI analysis...
                </h3>

                <p className="text-sm text-on-surface-variant mt-2">
                  Fetching your latest career insights.
                </p>
              </div>
            )}

            {analysisError && !analysisLoading && (
              <div className="rounded-2xl bg-error/10 border border-error/30 p-5 text-error">
                {analysisError}
              </div>
            )}

            {!analysisLoading && (
              <>
                {/* TOP SCORES */}
                <div className="grid md:grid-cols-3 gap-5">

                  <div className="rounded-3xl bg-surface-container p-7 border border-outline-variant">
                    <p className="text-sm text-on-surface-variant">
                      Career Readiness
                    </p>

                    <p className="text-5xl font-black mt-3">
                      {careerReadiness}
                      <span className="text-xl text-on-surface-variant">
                        /100
                      </span>
                    </p>

                    <div className="h-2 bg-surface-container-high rounded-full mt-5">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            Math.max(
                              careerReadiness,
                              0
                            ),
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="rounded-3xl bg-surface-container p-7 border border-outline-variant">
                    <p className="text-sm text-on-surface-variant">
                      Resume Score
                    </p>

                    <p className="text-5xl font-black mt-3">
                      {resumeScore}
                      <span className="text-xl text-on-surface-variant">
                        /100
                      </span>
                    </p>

                    <p className="text-sm text-on-surface-variant mt-4">
                      Latest resume analysis
                    </p>
                  </div>

                  <div className="rounded-3xl bg-surface-container p-7 border border-outline-variant">
                    <p className="text-sm text-on-surface-variant">
                      Career Suitability
                    </p>

                    <p className="text-3xl font-black mt-4">
                      {careerSuitability}
                    </p>

                    <p className="text-sm text-on-surface-variant mt-3">
                      For {targetCareer}
                    </p>
                  </div>

                </div>

                {/* STRENGTHS + GAPS */}
                <div className="grid lg:grid-cols-2 gap-6">

                  <div className="rounded-3xl bg-surface-container p-7 border border-outline-variant">

                    <h3 className="text-xl font-black">
                      Your Strengths
                    </h3>

                    <p className="text-sm text-on-surface-variant mt-1 mb-5">
                      Areas where your profile already shows useful evidence.
                    </p>

                    <div className="space-y-3">
                      {safeStrengths.length > 0 ? (
                        safeStrengths.map(
                          (strength: any, index: number) => (
                            <div
                              key={index}
                              className="flex gap-3 items-start rounded-2xl bg-surface-container-high p-4"
                            >
                              <span className="text-primary text-lg">
                                ✓
                              </span>

                              <span className="text-sm font-medium leading-relaxed">
                                {typeof strength === "string"
                                  ? strength
                                  : strength?.text ||
                                    strength?.description ||
                                    strength?.name ||
                                    "Strength identified"}
                              </span>
                            </div>
                          )
                        )
                      ) : (
                        <p className="text-sm text-on-surface-variant">
                          No strengths available yet.
                        </p>
                      )}
                    </div>

                  </div>

                  <div className="rounded-3xl bg-surface-container p-7 border border-outline-variant">

                    <h3 className="text-xl font-black">
                      Skill Gaps
                    </h3>

                    <p className="text-sm text-on-surface-variant mt-1 mb-5">
                      Areas that need more practical evidence.
                    </p>

                    <div className="space-y-3">
                      {safeSkillGaps.length > 0 ? (
                        safeSkillGaps.map(
                          (gap: any, index: number) => (
                            <div
                              key={`${getSkillGapName(
                                gap
                              )}-${index}`}
                              className="flex items-center justify-between rounded-2xl bg-surface-container-high p-4"
                            >
                              <span className="font-semibold">
                                {getSkillGapName(gap)}
                              </span>

                              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                                Gap
                              </span>
                            </div>
                          )
                        )
                      ) : (
                        <p className="text-sm text-on-surface-variant">
                          No skill gaps available.
                        </p>
                      )}
                    </div>

                  </div>

                </div>

                {/* RECOMMENDED SKILLS */}
                <div className="rounded-3xl bg-surface-container p-7 border border-outline-variant">

                  <h3 className="text-xl font-black">
                    Recommended Skills
                  </h3>

                  <p className="text-sm text-on-surface-variant mt-1 mb-5">
                    Skills suggested by the AI based on your target career.
                  </p>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

                    {safeRecommendedSkills.length > 0 ? (
                      safeRecommendedSkills.map(
                        (skill: any, index: number) => (
                          <div
                            key={`${getSkillName(
                              skill
                            )}-${index}`}
                            className="rounded-2xl bg-surface-container-high p-5"
                          >
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">
                              {index + 1}
                            </div>

                            <h4 className="font-bold mt-4">
                              {getSkillName(skill)}
                            </h4>

                            <p className="text-sm text-on-surface-variant mt-2">
                              Focus on practical implementation and project evidence.
                            </p>
                          </div>
                        )
                      )
                    ) : (
                      <p className="text-sm text-on-surface-variant">
                        No recommended skills available.
                      </p>
                    )}

                  </div>
                </div>

                {/* RECOMMENDED PROJECTS */}
                <div className="rounded-3xl bg-surface-container p-7 border border-outline-variant">

                  <h3 className="text-xl font-black">
                    Recommended Projects
                  </h3>

                  <p className="text-sm text-on-surface-variant mt-1 mb-5">
                    Projects that can help close your current skill gaps.
                  </p>

                  <div className="grid lg:grid-cols-3 gap-5">

                    {safeRecommendedProjects.length > 0 ? (
                      safeRecommendedProjects.map(
                        (project: any, index: number) => (
                          <div
                            key={`${getProjectTitle(
                              project
                            )}-${index}`}
                            className="rounded-2xl bg-surface-container-high p-6"
                          >
                            <div className="text-3xl">
                              {getProjectIcon(project)}
                            </div>

                            <h4 className="text-lg font-bold mt-4">
                              {getProjectTitle(project)}
                            </h4>

                            <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                              {getProjectDescription(project)}
                            </p>

                            <div className="mt-5">
                              <span className="inline-flex px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold">
                                Recommended
                              </span>
                            </div>
                          </div>
                        )
                      )
                    ) : (
                      <p className="text-sm text-on-surface-variant">
                        No projects available yet.
                      </p>
                    )}

                  </div>
                </div>

                {/* ANALYSIS SUMMARY */}
                <div className="rounded-3xl bg-primary text-on-primary p-8">

                  <p className="text-sm font-bold opacity-80">
                    NEXT STEP
                  </p>

                  <h3 className="text-2xl font-black mt-2">
                    Turn these insights into action.
                  </h3>

                  <p className="mt-3 opacity-85 max-w-2xl leading-relaxed">
                    Use your personalized roadmap to work through
                    the identified skill gaps and build stronger
                    evidence for your target career.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigateTo("roadmap")
                    }
                    className="mt-6 px-5 py-3 rounded-xl bg-background text-on-background font-bold"
                  >
                    Open Career Roadmap →
                  </button>

                </div>
              </>
            )}
          </section>
        )}

        {/* ===================================================
            ROADMAP — PART 4 WILL CONTINUE HERE
        =================================================== */}
                {/* ===================================================
            ROADMAP
        =================================================== */}
        {activePage === "roadmap" && (
          <section className="space-y-8">

            <div>
              <p className="text-sm font-bold text-primary">
                PERSONALIZED ROADMAP
              </p>

              <h2 className="text-4xl font-black mt-2">
                Your Career Roadmap
              </h2>

              <p className="text-on-surface-variant mt-2 max-w-2xl">
                A step-by-step path generated from your current
                skills, career goal and identified skill gaps.
              </p>
            </div>

            {/* ROADMAP HEADER */}
            <div className="rounded-3xl bg-primary text-on-primary p-7">
              <p className="text-sm font-bold opacity-80">
                TARGET CAREER
              </p>

              <h3 className="text-2xl font-black mt-2">
                {targetCareer}
              </h3>

              <div className="flex flex-wrap gap-3 mt-5">
                <span className="px-3 py-1.5 rounded-lg bg-white/10 text-sm font-semibold">
                  {roadmapData.length || 0} Phases
                </span>

                <span className="px-3 py-1.5 rounded-lg bg-white/10 text-sm font-semibold">
                  AI Generated
                </span>

                <span className="px-3 py-1.5 rounded-lg bg-white/10 text-sm font-semibold">
                  Personalized
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-surface-container border border-outline-variant p-5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-bold">Roadmap progress</span>
                <span className="text-on-surface-variant">{roadmapCompletedCount} of {roadmapTaskCount} tasks</span>
              </div>
              <div className="mt-3 h-2.5 rounded-full bg-surface-container-high">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${roadmapTaskCount ? Math.round(roadmapCompletedCount / roadmapTaskCount * 100) : 0}%` }} />
              </div>
            </div>

            {/* ROADMAP PHASES */}
            <div className="space-y-5">

              {roadmapData.length > 0 ? (
                roadmapData.map(
                  (phase: any, index: number) => (
                    <div
                      key={`${getRoadmapTitle(
                        phase
                      )}-${index}`}
                      className="rounded-3xl bg-surface-container border border-outline-variant p-6 md:p-7"
                    >
                      <div className="flex gap-5">

                        {/* PHASE NUMBER */}
                        <div className="shrink-0">
                          <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-black">
                            {String(index + 1).padStart(
                              2,
                              "0"
                            )}
                          </div>
                        </div>

                        {/* PHASE CONTENT */}
                        <div className="flex-1">

                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">

                            <div>
                              <p className="text-xs font-bold text-primary uppercase tracking-wider">
                                Phase {index + 1}
                              </p>

                              <h3 className="text-xl md:text-2xl font-black mt-1">
                                {getRoadmapTitle(phase)}
                              </h3>
                            </div>

                            <span className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                              Recommended
                            </span>

                          </div>

                          <p className="text-sm text-on-surface-variant leading-relaxed mt-4">
                            {getRoadmapDescription(phase)}
                          </p>

                          {/* OPTIONAL ROADMAP DETAILS */}
                          {typeof phase === "object" &&
                            Array.isArray(
                              phase?.skills
                            ) &&
                            phase.skills.length > 0 && (
                              <div className="mt-5">

                                <p className="text-sm font-bold mb-3">
                                  Skills
                                </p>

                                <div className="flex flex-wrap gap-2">
                                  {phase.skills.map(
                                    (
                                      skill: any,
                                      skillIndex: number
                                    ) => (
                                      <span
                                        key={
                                          skillIndex
                                        }
                                        className="px-3 py-1.5 rounded-lg bg-surface-container-high text-xs font-semibold"
                                      >
                                        {typeof skill ===
                                        "string"
                                          ? skill
                                          : skill?.name ||
                                            skill?.skill ||
                                            "Skill"}
                                      </span>
                                    )
                                  )}
                                </div>

                              </div>
                            )}

                          {typeof phase === "object" &&
                            Array.isArray(
                              phase?.tasks
                            ) &&
                            phase.tasks.length > 0 && (
                              <div className="mt-5">

                                <p className="text-sm font-bold mb-3">
                                  Suggested Tasks
                                </p>

                                <div className="space-y-2">
                                  {phase.tasks.map(
                                    (
                                      task: any,
                                      taskIndex: number
                                    ) => (
                                      <div
                                        key={
                                          taskIndex
                                        }
                                        className="flex gap-3 items-start"
                                      >
                                        <input
                                          type="checkbox"
                                          className="mt-1 accent-primary"
                                          checked={completedRoadmapTasks.includes(getRoadmapTaskId(phase, task, taskIndex))}
                                          onChange={() => toggleRoadmapTask(getRoadmapTaskId(phase, task, taskIndex))}
                                          aria-label={`Mark roadmap task ${taskIndex + 1} complete`}
                                        />

                                        <span className={`text-sm text-on-surface-variant ${completedRoadmapTasks.includes(getRoadmapTaskId(phase, task, taskIndex)) ? "line-through opacity-60" : ""}`}>
                                          {typeof task ===
                                          "string"
                                            ? task
                                            : task?.title ||
                                              task?.description ||
                                              "Complete recommended task"}
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>

                              </div>
                            )}

                        </div>
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className="rounded-3xl bg-surface-container border border-outline-variant p-10 text-center">

                  <div className="text-4xl mb-4">
                    🧭
                  </div>

                  <h3 className="text-xl font-black">
                    Your roadmap is not available yet
                  </h3>

                  <p className="text-sm text-on-surface-variant mt-2 max-w-md mx-auto">
                    Complete your AI career analysis first.
                    DevPilot AI will use the analysis to build
                    your personalized roadmap.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigateTo("analysis")
                    }
                    className="mt-6 px-5 py-3 rounded-xl bg-primary text-on-primary font-bold"
                  >
                    View AI Analysis
                  </button>

                </div>
              )}

            </div>

            {/* ROADMAP FOOTER */}
            {roadmapData.length > 0 && (
              <div className="rounded-3xl bg-surface-container-high border border-outline-variant p-7">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                  <div>
                    <h3 className="text-lg font-black">
                      Keep building. Keep improving.
                    </h3>

                    <p className="text-sm text-on-surface-variant mt-1">
                      Re-analyze your profile after completing
                      major roadmap milestones.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setModalOpen(true)
                    }
                    className="px-5 py-3 rounded-xl bg-primary text-on-primary font-bold"
                  >
                    Re-analyze Profile
                  </button>

                </div>

              </div>
            )}

          </section>
        )}

        {activePage === "interview" && (
          <section className="space-y-7">
            <div>
              <p className="text-sm font-bold text-primary">INTERVIEW PRACTICE</p>
              <h2 className="text-4xl font-black mt-2">Practice for your next role</h2>
              <p className="text-on-surface-variant mt-2">Get role-specific questions and actionable feedback on each answer.</p>
            </div>

            <div className="rounded-3xl bg-surface-container border border-outline-variant p-6 flex flex-col sm:flex-row sm:items-end gap-4">
              <label className="flex-1 text-sm font-semibold">Practice area
                <select value={interviewFocus} onChange={(e) => setInterviewFocus(e.target.value)} className="mt-2 w-full rounded-xl border border-outline-variant bg-surface-container-high px-4 py-3">
                  <option>Mixed practice</option><option>Technical</option><option>Behavioral</option><option>System Design</option><option>Problem Solving</option>
                </select>
              </label>
              <button type="button" onClick={() => void handleGenerateInterview()} disabled={interviewLoading || !profileData?.target_role} className="rounded-xl bg-primary px-5 py-3 font-bold text-on-primary disabled:opacity-60">{interviewLoading ? "Preparing…" : interviewQuestions.length ? "New question set" : "Generate questions"}</button>
            </div>
            {!profileData?.target_role && <div className="rounded-2xl bg-surface-container border border-outline-variant p-5 text-sm text-on-surface-variant">Create your career profile before generating role-specific interview questions. <button type="button" onClick={() => navigateTo("profile")} className="font-bold text-primary underline">Set up profile</button></div>}

            {interviewError && <p role="alert" className="rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-error">{interviewError}</p>}

            {interviewQuestions[interviewIndex] && (
              <div className="rounded-3xl bg-surface-container border border-outline-variant p-7 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">{interviewQuestions[interviewIndex].category || "Interview question"}</span>
                  <span className="text-sm text-on-surface-variant">Question {interviewIndex + 1} of {interviewQuestions.length}</span>
                </div>
                <h3 className="text-2xl font-bold leading-snug">{interviewQuestions[interviewIndex].question}</h3>
                <p className="text-sm text-on-surface-variant">Focus: {interviewQuestions[interviewIndex].evaluation_focus}</p>
                <label className="block text-sm font-semibold">Your answer
                  <textarea value={interviewAnswer} onChange={(e) => setInterviewAnswer(e.target.value)} rows={7} maxLength={6000} placeholder="Structure your answer, then support it with a concrete example…" className="mt-2 w-full rounded-2xl border border-outline-variant bg-surface-container-high p-4 font-normal leading-relaxed" />
                </label>
                <p className="text-xs text-on-surface-variant">Your answer is sent to the configured AI provider only when you request feedback.</p>
                <div className="flex flex-wrap justify-end gap-3">
                  {interviewFeedback && <button type="button" onClick={() => { setInterviewIndex((index) => index + 1); setInterviewAnswer(""); setInterviewFeedback(null); setInterviewError(""); }} className="rounded-xl border border-outline-variant px-5 py-3 font-semibold">{interviewIndex + 1 < interviewQuestions.length ? "Next question" : "Finish set"}</button>}
                  <button type="button" onClick={() => void handleEvaluateInterviewAnswer()} disabled={interviewLoading || interviewAnswer.trim().length < 5} className="rounded-xl bg-primary px-5 py-3 font-bold text-on-primary disabled:opacity-50">{interviewLoading ? "Reviewing…" : "Get answer feedback"}</button>
                </div>
                {interviewFeedback && (
                  <div className="rounded-2xl bg-surface-container-high p-5 space-y-4">
                    <div className="flex items-center justify-between gap-4"><h4 className="text-lg font-black">Answer review</h4><span className="text-2xl font-black text-primary">{interviewFeedback.score}/100</span></div>
                    <p className="text-sm leading-relaxed">{interviewFeedback.summary}</p>
                    <div className="grid md:grid-cols-2 gap-5">
                      <div><h5 className="font-bold mb-2">What worked</h5><ul className="list-disc pl-5 space-y-1 text-sm">{interviewFeedback.strengths?.map((item: string, index: number) => <li key={`${index}-${item}`}>{item}</li>)}</ul></div>
                      <div><h5 className="font-bold mb-2">Try next time</h5><ul className="list-disc pl-5 space-y-1 text-sm">{interviewFeedback.improvements?.map((item: string, index: number) => <li key={`${index}-${item}`}>{item}</li>)}</ul></div>
                    </div>
                    {interviewFeedback.sample_answer && <div><h5 className="font-bold mb-2">A stronger structure</h5><p className="text-sm leading-relaxed text-on-surface-variant">{interviewFeedback.sample_answer}</p></div>}
                  </div>
                )}
              </div>
            )}

            {interviewHistory.length > 0 && (
              <div className="rounded-3xl bg-surface-container border border-outline-variant p-7">
                <h3 className="text-xl font-black">Recent practice</h3>
                <div className="mt-4 space-y-3">{interviewHistory.slice(0, 5).map((entry: any, index: number) => <div key={`${entry.date}-${index}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface-container-high p-4"><div><p className="font-semibold">{entry.question}</p><p className="mt-1 text-xs text-on-surface-variant">{entry.role} · {new Date(entry.date).toLocaleDateString()}</p></div><span className="font-black text-primary">{entry.feedback?.score ?? 0}/100</span></div>)}</div>
              </div>
            )}
          </section>
        )}

        {/* ===================================================
            PROFILE
        =================================================== */}
        {activePage === "profile" && (
          <section className="space-y-8">

            <div>
              <p className="text-sm font-bold text-primary">
                PROFILE
              </p>

              <h2 className="text-4xl font-black mt-2">
                Your Profile
              </h2>

              <p className="text-on-surface-variant mt-2">
                Your career identity and connected data sources.
              </p>
            </div>

            {profileLoading && (
              <div className="rounded-2xl bg-surface-container p-5 text-on-surface-variant">
                Loading your profile…
              </div>
            )}

            {(!profileData || profileEditing) && (
              <form onSubmit={handleSaveProfile} className="rounded-3xl bg-surface-container border border-outline-variant p-7 space-y-5">
                <div>
                  <h3 className="text-xl font-black">{profileData ? "Edit career profile" : "Set up your career profile"}</h3>
                  <p className="text-sm text-on-surface-variant mt-1">This information personalizes your analysis and roadmap.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <label className="text-sm font-semibold">Full name
                    <input required maxLength={100} value={profileForm.full_name} onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })} className="mt-2 w-full rounded-xl border border-outline-variant bg-surface-container-high px-4 py-3" />
                  </label>
                  <label className="text-sm font-semibold">Target role
                    <input required maxLength={100} value={profileForm.target_role} onChange={(e) => setProfileForm({ ...profileForm, target_role: e.target.value })} placeholder="Backend Software Engineer" className="mt-2 w-full rounded-xl border border-outline-variant bg-surface-container-high px-4 py-3" />
                  </label>
                  <label className="text-sm font-semibold">Experience level
                    <select value={profileForm.experience_level} onChange={(e) => setProfileForm({ ...profileForm, experience_level: e.target.value })} className="mt-2 w-full rounded-xl border border-outline-variant bg-surface-container-high px-4 py-3">
                      <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                    </select>
                  </label>
                  <label className="text-sm font-semibold">GitHub username <span className="font-normal text-on-surface-variant">(optional)</span>
                    <input value={profileForm.github_username} onChange={(e) => setProfileForm({ ...profileForm, github_username: e.target.value })} placeholder="your-github-handle" className="mt-2 w-full rounded-xl border border-outline-variant bg-surface-container-high px-4 py-3" />
                  </label>
                  <label className="text-sm font-semibold md:col-span-2">Skills <span className="font-normal text-on-surface-variant">(comma separated)</span>
                    <input required value={profileForm.skills} onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })} placeholder="Python, FastAPI, SQL" className="mt-2 w-full rounded-xl border border-outline-variant bg-surface-container-high px-4 py-3" />
                  </label>
                  <label className="text-sm font-semibold md:col-span-2">Bio
                    <textarea value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} rows={3} maxLength={1000} placeholder="What are you studying or building toward?" className="mt-2 w-full rounded-xl border border-outline-variant bg-surface-container-high px-4 py-3" />
                  </label>
                </div>
                {profileMessage && <p role="status" className="text-sm text-primary">{profileMessage}</p>}
                <div className="flex justify-end gap-3">
                  {profileData && <button type="button" onClick={() => { setProfileEditing(false); setProfileMessage(""); }} className="px-5 py-3 rounded-xl border border-outline-variant font-semibold">Cancel</button>}
                  <button type="submit" disabled={profileSaving} className="px-5 py-3 rounded-xl bg-primary text-on-primary font-bold disabled:opacity-60">{profileSaving ? "Saving…" : profileData ? "Save profile" : "Create profile"}</button>
                </div>
              </form>
            )}
            {profileData && !profileEditing && (
              <div className="flex justify-end">
                <button type="button" onClick={beginProfileEdit} className="px-5 py-3 rounded-xl border border-outline-variant font-semibold hover:bg-surface-container-high">Edit profile</button>
              </div>
            )}
            {profileMessage && !profileEditing && <p role="status" className="text-sm text-primary">{profileMessage}</p>}

            {/* PROFILE CARD */}
            {profileData && (
            <div className="rounded-3xl bg-surface-container border border-outline-variant p-7">

              <div className="flex flex-col md:flex-row md:items-center gap-6">

                <div className="w-20 h-20 rounded-3xl bg-primary text-on-primary flex items-center justify-center text-3xl font-black">
                  {profileName
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="flex-1">
                  <h3 className="text-2xl font-black">
                    {profileName}
                  </h3>

                  <p className="text-on-surface-variant mt-1">
                    {profileDegree}
                  </p>

                  <p className="text-sm text-on-surface-variant mt-1">
                    {profileUniversity}
                  </p>
                </div>

                <div className="rounded-2xl bg-surface-container-high p-4 min-w-[200px]">
                  <p className="text-xs text-on-surface-variant">
                    Target Career
                  </p>

                  <p className="font-bold mt-1">
                    {profileCareer}
                  </p>
                </div>

              </div>
            </div>
            )}

            {/* PROFILE INFORMATION */}
            {profileData && <div className="grid lg:grid-cols-2 gap-6">

              <div className="rounded-3xl bg-surface-container border border-outline-variant p-7">

                <h3 className="text-xl font-black">
                  Career Goal
                </h3>

                <div className="mt-5 rounded-2xl bg-surface-container-high p-5">

                  <p className="text-xs text-on-surface-variant">
                    Target Role
                  </p>

                  <p className="text-xl font-black mt-2">
                    {targetCareer}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-sm text-on-surface-variant">
                      Career Readiness
                    </span>

                    <span className="font-black">
                      {careerReadiness}/100
                    </span>
                  </div>

                  <div className="h-2 bg-surface-container rounded-full mt-2">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: `${Math.min(
                          Math.max(
                            careerReadiness,
                            0
                          ),
                          100
                        )}%`,
                      }}
                    />
                  </div>

                </div>

              </div>

              <div className="rounded-3xl bg-surface-container border border-outline-variant p-7">

                <h3 className="text-xl font-black">
                  Connected Sources
                </h3>

                <div className="space-y-3 mt-5">

                  <div className="flex items-center gap-4 rounded-2xl bg-surface-container-high p-4">
                    <span className="text-2xl">
                      📄
                    </span>

                    <div className="flex-1">
                      <p className="font-bold">
                        Resume
                      </p>

                      <p className="text-xs text-on-surface-variant">
                        {resumeData?.file_name ||
                          "Resume connected"}
                      </p>
                    </div>

                    <span className={`text-xs font-bold ${resumeData ? "text-primary" : "text-on-surface-variant"}`}>
                      {resumeData ? "Uploaded" : "Not uploaded"}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 rounded-2xl bg-surface-container-high p-4">
                    <span className="text-2xl">
                      ◉
                    </span>

                    <div className="flex-1">
                      <p className="font-bold">
                        GitHub
                      </p>

                      <p className="text-xs text-on-surface-variant">
                        {githubRepositoryCount} repositories analyzed
                      </p>
                    </div>

                    <span className="text-xs font-bold text-primary">
                      {profileData?.github_username ? "Connected" : "Add username"}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 rounded-2xl bg-surface-container-high p-4">
                    <span className="text-2xl">
                      ✦
                    </span>

                    <div className="flex-1">
                      <p className="font-bold">
                        AI Analysis
                      </p>

                      <p className="text-xs text-on-surface-variant">
                        Career intelligence available
                      </p>
                    </div>

                    <span className="text-xs font-bold text-primary">
                      {hasAnalysis
                        ? "Ready"
                        : "Pending"}
                    </span>
                  </div>

                </div>

              </div>
            </div>}

            {/* PROFILE SKILLS */}
            {profileData && <div className="rounded-3xl bg-surface-container border border-outline-variant p-7">

              <h3 className="text-xl font-black">
                Current Skills
              </h3>

              <p className="text-sm text-on-surface-variant mt-1">
                Skills currently associated with your career profile.
              </p>

              <div className="flex flex-wrap gap-3 mt-5">
                {((profileData.skills || "") as string).split(",").map((skill: string) => skill.trim()).filter(Boolean).map(
                  (skill: string, index: number) => (
                    <span
                      key={`${skill}-${index}`}
                      className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-semibold"
                    >
                      {skill}
                    </span>
                  )
                )}

              </div>
            </div>}

            <div className="rounded-3xl bg-surface-container border border-outline-variant p-7">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-xl font-black">Resume insights</h3>
                  <p className="text-sm text-on-surface-variant mt-1">Upload a PDF to refresh your resume analysis.</p>
                  <p className="text-sm mt-3">{resumeData?.file_name || "No resume uploaded"}</p>
                </div>
                <label className="px-5 py-3 rounded-xl bg-primary text-on-primary font-bold cursor-pointer">
                  {resumeLoading ? "Uploading…" : "Upload PDF"}
                  <input type="file" accept="application/pdf,.pdf" disabled={resumeLoading} className="sr-only" onChange={(e) => { const file = e.target.files?.[0]; if (file) void handleResumeUpload(file); e.currentTarget.value = ""; }} />
                </label>
              </div>
              {resumeMessage && <p role="status" className="mt-3 text-sm text-primary">{resumeMessage}</p>}
              {analysisData?.resume_summary && <p className="mt-4 text-sm text-on-surface-variant leading-relaxed">{analysisData.resume_summary}</p>}
            </div>

            {/* PROFILE ACTIONS */}
            {profileData && <div className="grid sm:grid-cols-2 gap-4">

              <button
                type="button"
                onClick={() =>
                  navigateTo("analysis")
                }
                className="rounded-2xl bg-surface-container border border-outline-variant p-5 text-left hover:bg-surface-container-high transition"
              >
                <span className="text-2xl">
                  ✦
                </span>

                <h4 className="font-bold mt-3">
                  View AI Analysis
                </h4>

                <p className="text-sm text-on-surface-variant mt-1">
                  Review your career strengths and skill gaps.
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  navigateTo("roadmap")
                }
                className="rounded-2xl bg-surface-container border border-outline-variant p-5 text-left hover:bg-surface-container-high transition"
              >
                <span className="text-2xl">
                  🧭
                </span>

                <h4 className="font-bold mt-3">
                  Open Roadmap
                </h4>

                <p className="text-sm text-on-surface-variant mt-1">
                  Continue with your personalized learning path.
                </p>
              </button>

            </div>}

          </section>
        )}

        {/* ===================================================
            ANALYZE MODAL
        =================================================== */}
        {modalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5"
            onClick={() =>
              setModalOpen(false)
            }
          >
            <div
              className="w-full max-w-2xl rounded-3xl bg-surface-container border border-outline-variant shadow-2xl overflow-hidden"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {/* MODAL HEADER */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant">

                <div>
                  <p className="text-xs font-bold text-primary uppercase tracking-wider">
                    DevPilot AI
                  </p>

                  <h3 className="text-xl font-black mt-1">
                    AI Career Analysis
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setModalOpen(false)
                  }
                  className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center font-bold hover:bg-surface-container-highest transition"
                >
                  ×
                </button>

              </div>

              {/* TERMINAL */}
              <div className="p-6">

                <div className="rounded-2xl bg-black text-white p-5 font-mono text-sm space-y-3">

                  <p>
                    <span className="text-primary">
                      $
                    </span>{" "}
                    devpilot analyze --career
                  </p>

                  <p className={analysisLoading ? "text-primary" : "opacity-80"}>
                    {analysisLoading ? "⟳ Analyzing your latest resume and profile…" : "Ready to analyze your current profile."}
                  </p>

                </div>

                <div className="mt-6">

                  <h4 className="font-bold">
                    Ready to analyze your profile?
                  </h4>

                  <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                    DevPilot AI will use your available resume,
                    GitHub and profile data to generate career
                    insights and a personalized roadmap.
                  </p>
                  <p className="text-xs text-on-surface-variant mt-3">
                    Running analysis sends your resume text and career profile to the configured Gemini provider.
                  </p>

                </div>

                {analysisError && <p role="alert" className="mt-4 rounded-xl bg-error/10 border border-error/30 p-3 text-sm text-error">{analysisError}</p>}

                <div className="flex justify-end gap-3 mt-7">

                  <button
                    type="button"
                    onClick={() =>
                      setModalOpen(false)
                    }
                    className="px-5 py-3 rounded-xl border border-outline-variant font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleRunAnalysis()}
                    disabled={analysisLoading}
                    className="px-5 py-3 rounded-xl bg-primary text-on-primary font-bold disabled:opacity-60"
                  >
                    {analysisLoading ? "Analyzing…" : "Run analysis →"}
                  </button>

                </div>

              </div>
            </div>
          </div>
        )}

        {/* ===================================================
            PART 4 END
        =================================================== */}
                {/* ===================================================
            BOTTOM NAVIGATION
        =================================================== */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-outline-variant bg-background/95 backdrop-blur">
          <div className="max-w-3xl mx-auto px-3 py-2">
            <div className="grid grid-cols-6 gap-1">

              {/* OVERVIEW */}
              <button
                type="button"
                aria-current={
                  activePage === "overview"
                    ? "page"
                    : undefined
                }
                onClick={() =>
                  navigateTo("overview")
                }
                className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-xs font-semibold transition ${
                  activePage === "overview"
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                <span className="text-lg">
                  ⌂
                </span>

                <span>
                  Overview
                </span>
              </button>

              {/* DASHBOARD */}
              <button
                type="button"
                aria-current={
                  activePage === "dashboard"
                    ? "page"
                    : undefined
                }
                onClick={() =>
                  navigateTo("dashboard")
                }
                className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-xs font-semibold transition ${
                  activePage === "dashboard"
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                <span className="text-lg">
                  ▦
                </span>

                <span>
                  Dashboard
                </span>
              </button>

              {/* ANALYSIS */}
              <button
                type="button"
                aria-current={
                  activePage === "analysis"
                    ? "page"
                    : undefined
                }
                onClick={() =>
                  navigateTo("analysis")
                }
                className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-xs font-semibold transition ${
                  activePage === "analysis"
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                <span className="text-lg">
                  ✦
                </span>

                <span>
                  Analysis
                </span>
              </button>

              {/* ROADMAP */}
              <button
                type="button"
                aria-current={
                  activePage === "roadmap"
                    ? "page"
                    : undefined
                }
                onClick={() =>
                  navigateTo("roadmap")
                }
                className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-xs font-semibold transition ${
                  activePage === "roadmap"
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                <span className="text-lg">
                  ◎
                </span>

                <span>
                  Roadmap
                </span>
              </button>

              {/* INTERVIEW */}
              <button
                type="button"
                aria-current={activePage === "interview" ? "page" : undefined}
                onClick={() => navigateTo("interview")}
                className={`flex flex-col items-center gap-1 rounded-xl px-1 py-2.5 text-[11px] font-semibold transition ${activePage === "interview" ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:bg-surface-container"}`}
              >
                <span className="text-lg">◌</span>
                <span>Interview</span>
              </button>

              {/* PROFILE */}
              <button
                type="button"
                aria-current={
                  activePage === "profile"
                    ? "page"
                    : undefined
                }
                onClick={() =>
                  navigateTo("profile")
                }
                className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-xs font-semibold transition ${
                  activePage === "profile"
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                <span className="text-lg">
                  ●
                </span>

                <span>
                  Profile
                </span>
              </button>

            </div>
          </div>
        </nav>

      </main>
    </div>
  );
}
