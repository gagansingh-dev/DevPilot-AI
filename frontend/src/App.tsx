import { useState } from "react";
import "./App.css";

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>

{/* Header: Polished SaaS Bar */}
<header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-md border-b border-surface-container-highest/60 pt-safe">
<div className="h-16 px-layout-margin-mobile flex items-center justify-between gap-space-sm">
<div className="flex items-center gap-2.5 min-w-0">
<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-container/20 to-secondary-container/30 border border-primary-container/30 flex items-center justify-center shrink-0 shadow-sm">
<span className="material-symbols-outlined text-primary-container text-[20px]">explore</span>
</div>
<div className="flex flex-col min-w-0">
<span className="font-headline font-bold text-base text-on-surface tracking-tight leading-none">DevPilot AI</span>
<span className="font-body text-[11px] text-on-surface-variant font-medium mt-0.5">Career Intelligence</span>
</div>
</div>
<div className="flex items-center gap-2 shrink-0">
<div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high/80 border border-surface-container-highest text-on-surface-variant">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary-container shadow-[0_0_8px_rgba(91,233,173,0.8)]"></span>
<span className="font-mono text-[11px] font-medium text-on-surface tracking-wide">Platform Active</span>
</div>
<div className="w-8 h-8 rounded-full bg-surface-container-high border border-surface-container-highest flex items-center justify-center text-on-surface-variant">
<span className="material-symbols-outlined text-[18px]">person</span>
</div>
</div>
</div>
</header>
{/* Main Content */}
<main className="flex flex-col relative w-full pt-16 pb-24 bg-surface min-h-screen">
{/*} Hero Section */}
<section className="flex flex-col px-layout-margin-mobile pt-6 pb-6 relative overflow-hidden">
{/* Subtle background ambient glow */}
<div className="absolute top-0 right-1/4 w-72 h-72 bg-primary-container/5 rounded-full blur-3xl pointer-events-none"></div>
<div className="absolute top-40 left-0 w-64 h-64 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none"></div>
{/* Badge */}
<div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-surface-container-high/70 border border-primary-container/20 backdrop-blur-sm mb-4">
<span className="w-2 h-2 rounded-full bg-primary-container"></span>
<span className="font-body text-xs font-semibold text-primary tracking-wide">AI Career Readiness Platform</span>
</div>
{/* Hero Headlines (Strict Directive #5) */}
<div className="flex flex-col gap-2 mb-3">
<h1 className="font-headline font-bold text-[28px] leading-[34px] tracking-tight text-on-surface">
          Know Where You Stand. <br/>Know What to Build Next.
        </h1>
</div>
<p className="font-body text-[14px] leading-relaxed text-on-surface-variant mb-6">
        DevPilot AI analyzes your skills, resume, GitHub and career goals to turn your current profile into a personalized path to career readiness.
      </p>
{/* CTAs (Strict Directive #5) */}
<div className="flex flex-col sm:flex-row gap-3 mb-8">
<button className="w-full sm:w-auto h-12 px-6 rounded-xl bg-primary-container text-on-primary font-body font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.25)] hover:bg-[#33ebff] active:scale-[0.98] transition-all" onClick={() => setModalOpen(true)}>
<span>Analyze My Career</span>
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</button>
<a className="w-full sm:w-auto h-12 px-5 rounded-xl bg-surface-container/80 hover:bg-surface-container-high border border-outline-variant/50 backdrop-blur-sm text-on-surface font-body font-medium text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all" href="#how-it-works">
<span className="material-symbols-outlined text-[18px] text-secondary">play_circle</span>
<span>See How It Works</span>
</a>
</div>
{/* Hero Architecture Pipeline Visual (Strict Directive #4 & Realistic Career Staging #3) */}
<div className="w-full rounded-2xl bg-surface-container-low/90 border border-outline-variant/40 p-4 relative overflow-hidden backdrop-blur-md shadow-xl">
{/* Header tag */}
<div className="flex items-center justify-between pb-3 mb-3 border-b border-surface-container-highest/60">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary-container text-[18px]">schema</span>
<span className="font-headline font-semibold text-xs text-on-surface tracking-wide">DevPilot Intelligence Architecture</span>
</div>
<span className="px-2 py-0.5 rounded-full bg-primary-container/10 border border-primary-container/20 text-[11px] font-mono text-primary font-medium">Pipeline Flow</span>
</div>
{/* Flow Container */}
<div className="flex flex-col gap-2 relative">
{/* Layer 1: Inputs Grid */}
<div className="flex flex-col gap-1.5">
<span className="font-mono text-[10px] uppercase text-on-surface-variant font-medium tracking-wider">01 Ingested Signals</span>
<div className="grid grid-cols-2 gap-1.5">
<div className="p-2.5 rounded-lg bg-surface-container/90 border border-outline-variant/30 flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0">description</span>
<div className="min-w-0">
<div className="text-[11px] font-semibold text-on-surface truncate">Resume</div>
<div className="text-[10px] text-on-surface-variant truncate">PDF / LaTeX AST</div>
</div>
</div>
<div className="p-2.5 rounded-lg bg-surface-container/90 border border-outline-variant/30 flex items-center gap-2">
<span className="material-symbols-outlined text-tertiary text-[18px] shrink-0">terminal</span>
<div className="min-w-0">
<div className="text-[11px] font-semibold text-on-surface truncate">GitHub Repos</div>
<div className="text-[10px] text-on-surface-variant truncate">Codebases &amp; PRs</div>
</div>
</div>
<div className="p-2.5 rounded-lg bg-surface-container/90 border border-outline-variant/30 flex items-center gap-2">
<span className="material-symbols-outlined text-secondary text-[18px] shrink-0">hub</span>
<div className="min-w-0">
<div className="text-[11px] font-semibold text-on-surface truncate">Skills Graph</div>
<div className="text-[10px] text-on-surface-variant truncate">Demonstrated Proficiencies</div>
</div>
</div>
<div className="p-2.5 rounded-lg bg-surface-container/90 border border-outline-variant/30 flex items-center gap-2">
<span className="material-symbols-outlined text-tertiary-fixed text-[18px] shrink-0">flag</span>
<div className="min-w-0">
<div className="text-[11px] font-semibold text-on-surface truncate">Target Goal</div>
<div className="text-[10px] text-primary truncate">Backend SDE</div>
</div>
</div>
</div>
</div>
{/* Connector 1 */}
<div className="flex items-center justify-center py-0.5">
<div className="flex items-center gap-1 text-primary-container text-xs font-mono">
<span className="w-1 h-1 rounded-full bg-primary-container"></span>
<span className="material-symbols-outlined text-[16px] text-primary-container">arrow_downward</span>
<span className="w-1 h-1 rounded-full bg-primary-container"></span>
</div>
</div>
{/* Layer 2: DevPilot AI Profile Engine */}
<div className="p-3 rounded-xl bg-gradient-to-r from-surface-container to-surface-container-high border border-primary-container/30 relative overflow-hidden shadow-sm">
<div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-primary-container/10 to-transparent pointer-events-none"></div>
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<div className="w-6 h-6 rounded bg-primary-container/20 flex items-center justify-center">
<span className="material-symbols-outlined text-primary-container text-[16px]">memory</span>
</div>
<div>
<span className="font-headline font-semibold text-xs text-on-surface block">DevPilot AI Profile Engine</span>
<span className="font-body text-[11px] text-on-surface-variant">Synthesizes practical proof-of-work against role standards</span>
</div>
</div>
<span className="px-2 py-0.5 rounded bg-surface-container-highest text-[10px] font-mono text-primary">Core Engine</span>
</div>
</div>
{/* Connector 2 */}
<div className="flex items-center justify-center py-0.5">
<div className="flex items-center gap-1 text-secondary text-xs font-mono">
<span className="w-1 h-1 rounded-full bg-secondary"></span>
<span className="material-symbols-outlined text-[16px] text-secondary">arrow_downward</span>
<span className="w-1 h-1 rounded-full bg-secondary"></span>
</div>
</div>
{/* Layer 3: Skill Gap Engine */}
<div className="p-3 rounded-xl bg-surface-container/90 border border-outline-variant/40 flex items-center justify-between">
<div className="flex items-center gap-2">
<div className="w-6 h-6 rounded bg-secondary-container/20 flex items-center justify-center">
<span className="material-symbols-outlined text-secondary text-[16px]">troubleshoot</span>
</div>
<div>
<span className="font-headline font-semibold text-xs text-on-surface block">Skill Gap Engine</span>
<span className="font-body text-[11px] text-on-surface-variant">Isolates production deltas: Redis, gRPC, Docker pipelines</span>
</div>
</div>
<span className="text-[11px] font-mono text-secondary font-medium">Gap Diff</span>
</div>
{/* Connector 3 */}
<div className="flex items-center justify-center py-0.5">
<div className="flex items-center gap-1 text-tertiary text-xs font-mono">
<span className="w-1 h-1 rounded-full bg-tertiary"></span>
<span className="material-symbols-outlined text-[16px] text-tertiary">arrow_downward</span>
<span className="w-1 h-1 rounded-full bg-tertiary"></span>
</div>
</div>
{/* Layer 4: Outputs (Score & Roadmap with Staging & Context) */}
<div className="flex flex-col gap-2">
<span className="font-mono text-[10px] uppercase text-on-surface-variant font-medium tracking-wider">02 Precision Deliverables</span>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
{/* Output Card 1: Score & Career Staging */}
<div className="p-3 rounded-xl bg-surface-container-high/90 border border-primary-container/20 flex flex-col gap-2">
<div className="flex items-center justify-between">
<span className="text-xs font-semibold text-on-surface">Career Readiness Score</span>
<span className="px-1.5 py-0.5 rounded bg-primary-container/10 text-primary-container font-mono text-[10px] font-medium">Target: Job Ready</span>
</div>
<div className="flex items-center gap-3">
<div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
<svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
<path className="text-surface-container-highest stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3.5"></path>
<path className="text-primary-container stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeDasharray="72, 100" strokeLinecap="round" strokeWidth="3.5"></path>
</svg>
<span className="absolute font-headline font-bold text-xs text-on-surface">72</span>
</div>
<div className="flex flex-col min-w-0">
<div className="text-[12px] font-medium text-on-surface">Current: <span className="text-primary font-semibold">Intermediate</span></div>
<div className="text-[11px] text-on-surface-variant">Target: <span className="text-tertiary font-medium">Job Ready (85+)</span></div>
</div>
</div>
{/* Explanatory Context (Strict Directive #7) */}
<div className="pt-1 border-t border-surface-container-highest/60 text-[11px] text-on-surface-variant leading-tight">
<span className="text-primary font-medium">What this means:</span> Strong foundational backend syntax; needs production caching &amp; deployment proof to pass hiring filters.
                </div>
</div>
{/* Output Card 2: Roadmap */}
<div className="p-3 rounded-xl bg-surface-container-high/90 border border-tertiary/20 flex flex-col justify-between gap-2">
<div className="flex items-center justify-between">
<span className="text-xs font-semibold text-on-surface">Execution Roadmap</span>
<span className="text-[10px] font-mono text-tertiary">Tailored Plan</span>
</div>
<div className="space-y-1.5">
<div className="flex items-center gap-2 text-[11px] text-on-surface bg-surface-container/60 px-2 py-1 rounded">
<span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
<span className="truncate">Milestone 1: Redis Caching Layer</span>
</div>
<div className="flex items-center gap-2 text-[11px] text-on-surface bg-surface-container/60 px-2 py-1 rounded">
<span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
<span className="truncate">Milestone 2: Dockerized CI/CD &amp; Tests</span>
</div>
</div>
{/* Explanatory Context */}
<div className="pt-1 border-t border-surface-container-highest/60 text-[11px] text-on-surface-variant leading-tight">
<span className="text-tertiary font-medium">Career Outcome:</span> Replaces vague study checklists with verifiable architectural GitHub PRs recruiters trust.
                </div>
</div>
</div>
</div>
</div>
</div>
</section>
{/* How It Works Section (Directive #6) */}
<section className="px-layout-margin-mobile py-8 border-t border-surface-container-high" id="how-it-works">
<div className="flex flex-col gap-1 mb-6">
<div className="flex items-center gap-2">
<span className="text-xs font-mono font-semibold text-secondary uppercase tracking-wider">Methodology</span>
</div>
<h2 className="font-headline font-bold text-xl text-on-surface tracking-tight">How DevPilot AI Works</h2>
<p className="font-body text-sm text-on-surface-variant leading-relaxed">
          A structured, evidence-based approach to moving from learner to hireable software engineer.
        </p>
</div>
<div className="flex flex-col gap-4">
{/* Step 1 */}
<div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 relative flex flex-col gap-2">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="w-6 h-6 rounded-lg bg-primary-container/10 border border-primary-container/20 text-primary-container font-mono text-xs flex items-center justify-center font-bold">1</span>
<h3 className="font-headline font-semibold text-sm text-on-surface">Connect Signal</h3>
</div>
<span className="material-symbols-outlined text-primary-container text-[20px]">sync_saved_locally</span>
</div>
<p className="font-body text-xs text-on-surface-variant leading-relaxed">
            Securely connect your GitHub profile and upload your resume (PDF or LaTeX). DevPilot parses repository structure, AST syntax complexity, commit histories, and technical statements.
          </p>
<div className="flex flex-wrap gap-1.5 pt-1">
<span className="px-2 py-0.5 rounded bg-surface-container-high text-[10px] font-mono text-on-surface-variant">GitHub Repos</span>
<span className="px-2 py-0.5 rounded bg-surface-container-high text-[10px] font-mono text-on-surface-variant">PDF / LaTeX Resume</span>
<span className="px-2 py-0.5 rounded bg-surface-container-high text-[10px] font-mono text-on-surface-variant">Target Role Parameters</span>
</div>
</div>
{/* Step 2 */}
<div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 relative flex flex-col gap-2">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="w-6 h-6 rounded-lg bg-secondary-container/20 border border-secondary/30 text-secondary font-mono text-xs flex items-center justify-center font-bold">2</span>
<h3 className="font-headline font-semibold text-sm text-on-surface">Extract Technical Skill Gaps</h3>
</div>
<span className="material-symbols-outlined text-secondary text-[20px]">analytics</span>
</div>
<p className="font-body text-xs text-on-surface-variant leading-relaxed">
            DevPilot performs AST code analysis and compares your work with calibrated hiring requirements for Backend Software Engineers, spotlighting exact gaps in architecture, test suites, and data layers.
          </p>
<div className="flex flex-wrap gap-1.5 pt-1">
<span className="px-2 py-0.5 rounded bg-surface-container-high text-[10px] font-mono text-on-surface-variant">Code Verification</span>
<span className="px-2 py-0.5 rounded bg-surface-container-high text-[10px] font-mono text-on-surface-variant">Requirement Diff</span>
<span className="px-2 py-0.5 rounded bg-surface-container-high text-[10px] font-mono text-on-surface-variant">ATS Compatibility Check</span>
</div>
</div>
{/* Step 3 */}
<div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 relative flex flex-col gap-2">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="w-6 h-6 rounded-lg bg-tertiary/10 border border-tertiary/30 text-tertiary font-mono text-xs flex items-center justify-center font-bold">3</span>
<h3 className="font-headline font-semibold text-sm text-on-surface">Actionable Proof-of-Work Roadmap</h3>
</div>
<span className="material-symbols-outlined text-tertiary text-[20px]">flag</span>
</div>
<p className="font-body text-xs text-on-surface-variant leading-relaxed">
            Execute targeted project modules with guided repository templates. Build verified system architectures—such as Redis caching, Docker CI pipelines, and resilient APIs—that prove real capability.
          </p>
<div className="flex flex-wrap gap-1.5 pt-1">
<span className="px-2 py-0.5 rounded bg-surface-container-high text-[10px] font-mono text-tertiary">Redis Caching</span>
<span className="px-2 py-0.5 rounded bg-surface-container-high text-[10px] font-mono text-tertiary">Docker CI/CD</span>
<span className="px-2 py-0.5 rounded bg-surface-container-high text-[10px] font-mono text-tertiary">Verified GitHub PRs</span>
</div>
</div>
</div>
</section>
{/* Core Capabilities Section */}
<section className="px-layout-margin-mobile py-8 border-t border-surface-container-high bg-surface-container-low/40">
<div className="flex flex-col gap-1 mb-5">
<span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider">Features</span>
<h2 className="font-headline font-bold text-xl text-on-surface tracking-tight">Engineered for Technical Rigor</h2>
<p className="font-body text-sm text-on-surface-variant">Built specifically for aspiring and early-career software engineers.</p>
</div>
<div className="grid grid-cols-1 gap-3">
{/* Feature 1 */}
<div className="p-4 rounded-xl bg-surface-container/80 border border-outline-variant/30 flex gap-3.5 items-start">
<div className="w-9 h-9 rounded-lg bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-container shrink-0 mt-0.5">
<span className="material-symbols-outlined text-[20px]">fact_check</span>
</div>
<div className="flex flex-col gap-1">
<h3 className="font-headline font-semibold text-sm text-on-surface">Code Proof Verification</h3>
<p className="font-body text-xs text-on-surface-variant leading-relaxed">
              Disregards vanity green commit squares. Evaluates modular design, concurrency patterns, test coverage, and documentation depth in your actual codebases.
            </p>
</div>
</div>
{/* Feature 2 */}
<div className="p-4 rounded-xl bg-surface-container/80 border border-outline-variant/30 flex gap-3.5 items-start">
<div className="w-9 h-9 rounded-lg bg-secondary-container/20 border border-secondary/20 flex items-center justify-center text-secondary shrink-0 mt-0.5">
<span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
</div>
<div className="flex flex-col gap-1">
<h3 className="font-headline font-semibold text-sm text-on-surface">Semantic Resume Audit</h3>
<p className="font-body text-xs text-on-surface-variant leading-relaxed">
              Detects weak bullet points, unquantified outcomes, and missing technical competencies to ensure your resume matches recruiter and engineering manager evaluation rubrics.
            </p>
</div>
</div>
{/* Feature 3 */}
<div className="p-4 rounded-xl bg-surface-container/80 border border-outline-variant/30 flex gap-3.5 items-start">
<div className="w-9 h-9 rounded-lg bg-tertiary/10 border border-tertiary/20 flex items-center justify-center text-tertiary shrink-0 mt-0.5">
<span className="material-symbols-outlined text-[20px]">route</span>
</div>
<div className="flex flex-col gap-1">
<h3 className="font-headline font-semibold text-sm text-on-surface">Actionable Roadmap Builder</h3>
<p className="font-body text-xs text-on-surface-variant leading-relaxed">
              Generates curated repository templates and explicit milestone criteria. Build proof-of-work that clearly distinguishes you from generic boot camp projects.
            </p>
</div>
</div>
</div>
</section>
{/* Honest Context & Technology Stacks */}
<section className="px-layout-margin-mobile py-8 border-t border-surface-container-high">
<div className="flex flex-col gap-1 mb-4">
<span className="text-xs font-mono font-semibold text-secondary uppercase tracking-wider">Benchmark Standards</span>
<h2 className="font-headline font-bold text-lg text-on-surface">Industry-Standard Backend Profiles</h2>
<p className="font-body text-xs text-on-surface-variant">Evaluated against the core requirements of modern engineering teams.</p>
</div>
<div className="grid grid-cols-2 gap-2">
<div className="p-3 rounded-lg bg-surface-container border border-outline-variant/30 flex flex-col gap-1">
<div className="flex items-center justify-between">
<span className="text-xs font-semibold text-on-surface">FastAPI &amp; Python</span>
<span className="material-symbols-outlined text-primary text-[16px]">bolt</span>
</div>
<span className="text-[10px] font-mono text-on-surface-variant">Async IO, Pydantic, Auth</span>
</div>
<div className="p-3 rounded-lg bg-surface-container border border-outline-variant/30 flex flex-col gap-1">
<div className="flex items-center justify-between">
<span className="text-xs font-semibold text-on-surface">Go &amp; Microservices</span>
<span className="material-symbols-outlined text-secondary text-[16px]">speed</span>
</div>
<span className="text-[10px] font-mono text-on-surface-variant">Goroutines, gRPC, Clean Arch</span>
</div>
<div className="p-3 rounded-lg bg-surface-container border border-outline-variant/30 flex flex-col gap-1">
<div className="flex items-center justify-between">
<span className="text-xs font-semibold text-on-surface">Data &amp; Caching</span>
<span className="material-symbols-outlined text-tertiary text-[16px]">database</span>
</div>
<span className="text-[10px] font-mono text-on-surface-variant">Postgres, Redis, Invalidation</span>
</div>
<div className="p-3 rounded-lg bg-surface-container border border-outline-variant/30 flex flex-col gap-1">
<div className="flex items-center justify-between">
<span className="text-xs font-semibold text-on-surface">DevOps &amp; CI/CD</span>
<span className="material-symbols-outlined text-on-surface-variant text-[16px]">deployed_code</span>
</div>
<span className="text-[10px] font-mono text-on-surface-variant">Docker, GitHub Actions, Pytest</span>
</div>
</div>
</section>
{/* Final Call to Action */}
<section className="px-layout-margin-mobile pb-8 pt-2">
<div className="p-6 rounded-2xl bg-gradient-to-b from-surface-container-high to-surface-container border border-outline-variant/50 flex flex-col items-center text-center relative overflow-hidden shadow-2xl">
<div className="absolute -top-16 -right-16 w-36 h-36 bg-primary-container/10 rounded-full blur-2xl pointer-events-none"></div>
<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-highest border border-primary-container/20 text-xs font-medium text-primary mb-3">
<span className="material-symbols-outlined text-[14px]">school</span>
<span>Student &amp; Early Career Friendly</span>
</div>
<h2 className="font-headline font-bold text-xl text-on-surface max-w-xs mb-2">
          Stop guessing your readiness. Build with intent.
        </h2>
<p className="font-body text-xs text-on-surface-variant max-w-xs mb-5 leading-relaxed">
          Get an honest evaluation of your backend codebase and resume with a concrete roadmap to job readiness.
        </p>
<button className="w-full h-12 rounded-xl bg-primary-container text-on-primary font-body font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.25)] active:scale-[0.98] transition-all mb-3" onClick={() => setModalOpen(true)}>
<span>Analyze My Career</span>
<span className="material-symbols-outlined text-[18px]">terminal</span>
</button>
<div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
<span className="material-symbols-outlined text-[14px] text-tertiary">check_circle</span>
<span>Sample demo analysis available with one click</span>
</div>
</div>
</section>
{/* Interactive Analysis Modal */}
<div className={`fixed inset-0 z-50 bg-surface/85 backdrop-blur-md ${modalOpen ? "flex" : "hidden"} flex-col justify-end p-4 transition-all`} id="telemetry-modal">
<div className="w-full bg-surface-container p-4 rounded-2xl border border-outline-variant/50 shadow-2xl flex flex-col gap-3 max-w-lg mx-auto">
<div className="flex items-center justify-between pb-2 border-b border-surface-container-highest">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-primary-container animate-ping"></span>
<span className="font-headline font-semibold text-xs text-on-surface">Career Profile Engine Demo</span>
</div>
<button className="text-on-surface-variant hover:text-on-surface p-1" onClick={() => setModalOpen(false)}>
<span className="material-symbols-outlined text-[18px]">close</span>
</button>
</div>
<div className="font-mono text-xs bg-surface-container-lowest p-3 rounded-lg min-h-[140px] flex flex-col gap-1.5 text-on-surface-variant border border-surface-container-high overflow-y-auto" id="telemetry-output">
<span className="text-primary">&gt; Ingesting sample profile: Target Role: Backend SDE</span>
</div>
<div className="flex gap-2 pt-1">
<button className="flex-1 h-10 rounded-lg bg-surface-container-highest hover:bg-surface-bright text-on-surface font-body font-medium text-xs transition-colors" onClick={() => setModalOpen(false)}>
            Close
          </button>
<button className="flex-1 h-10 rounded-lg bg-primary-container hover:bg-[#33ebff] text-on-primary font-body font-semibold text-xs transition-colors" onClick={() => setModalOpen(false)}>
            View Sample Dashboard
          </button>
</div>
</div>
</div>
</main>
{/* Navigation Bar: Refined, Polished SaaS Mobile Dock */}
<nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface/90 backdrop-blur-xl border-t border-surface-container-highest/60" data-active-classes="text-primary-container font-semibold">
<div className="flex items-center justify-around h-16 px-1">
<a aria-current="page" className="flex flex-col items-center justify-center min-w-[56px] h-12 text-primary-container font-semibold transition-colors" data-path="overview" href="#">
<span className="material-symbols-outlined text-[20px]">explore</span>
<span className="text-[10px] font-medium tracking-wide mt-1">Overview</span>
</a>
<a className="flex flex-col items-center justify-center min-w-[56px] h-12 text-on-surface-variant hover:text-on-surface transition-colors" data-path="dashboard" href="#">
<span className="material-symbols-outlined text-[20px]">grid_view</span>
<span className="text-[10px] font-medium tracking-wide mt-1">Dashboard</span>
</a>
<a className="flex flex-col items-center justify-center min-w-[56px] h-12 text-on-surface-variant hover:text-on-surface transition-colors" data-path="career-analysis" href="#">
<span className="material-symbols-outlined text-[20px]">insights</span>
<span className="text-[10px] font-medium tracking-wide mt-1">Analysis</span>
</a>
<a className="flex flex-col items-center justify-center min-w-[56px] h-12 text-on-surface-variant hover:text-on-surface transition-colors" data-path="roadmap" href="#">
<span className="material-symbols-outlined text-[20px]">timeline</span>
<span className="text-[10px] font-medium tracking-wide mt-1">Roadmap</span>
</a>
<a className="flex flex-col items-center justify-center min-w-[56px] h-12 text-on-surface-variant hover:text-on-surface transition-colors" data-path="profile" href="#">
<span className="material-symbols-outlined text-[20px]">account_circle</span>
<span className="text-[10px] font-medium tracking-wide mt-1">Profile</span>
</a>
</div>
</nav>


    </>
  );
}
