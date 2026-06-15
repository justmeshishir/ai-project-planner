"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useCompletion } from "@ai-sdk/react"
import { IdeaInput } from "@/components/project-planner/IdeaInput"
import { ProjectBrief } from "@/components/project-planner/ProjectBrief"
import type { BriefSectionData } from "@/components/project-planner/BriefSection"
import { cn } from "@/lib/utils"

const SECTION_LABELS: Record<string, string> = {
  "app-summary": "App Summary",
  "target-users": "Target Users",
  "core-features": "Core Features",
  "recommended-tech-stack": "Recommended Tech Stack",
  "pages--routes": "Pages / Routes",
  "possible-data-model": "Possible Data Model",
  "build-phases": "Build Phases",
  "risks--edge-cases": "Risks & Edge Cases",
  "starter-prompt-for-a-coding-agent": "Starter Prompt for a Coding Agent",
}

function headingToId(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function parseSections(content: string): BriefSectionData[] {
  const sections: BriefSectionData[] = []
  const parts = content.split(/\n(?=## )/)
  for (const part of parts) {
    const headingMatch = part.match(/^## (.+)/m)
    if (headingMatch) {
      const heading = headingMatch[1].trim()
      const body = part.replace(/^## .+\n?/, "").trim()
      const id = headingToId(heading)
      if (id) {
        sections.push({
          id,
          label: SECTION_LABELS[id] || heading,
          content: body,
          isEditing: false,
        })
      }
    }
  }
  return sections
}

export default function Home() {
  const [sections, setSections] = useState<BriefSectionData[]>([])
  const [briefStatus, setBriefStatus] = useState<
    "idle" | "generating" | "complete" | "error"
  >("idle")
  const [briefError, setBriefError] = useState<string | undefined>()
  const lastContentRef = useRef("")
  const finishHandledRef = useRef(false)

  const { completion, complete, isLoading, error } = useCompletion({
    api: "/api/chat",
    streamProtocol: "text",
    onFinish: () => {
      finishHandledRef.current = true
      setBriefStatus("complete")
    },
    onError: (err) => {
      setBriefStatus("error")
      setBriefError(err.message || "An error occurred")
    },
  })

  useEffect(() => {
    if (!completion || completion === lastContentRef.current) return
    lastContentRef.current = completion
    const parsed = parseSections(completion)
    if (parsed.length === 0) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSections((prev) => {
      const merged = [...prev]
      for (const section of parsed) {
        const idx = merged.findIndex((s) => s.id === section.id)
        if (idx >= 0) {
          merged[idx] = {
            ...merged[idx],
            content: section.content,
            isEditing: merged[idx].isEditing,
          }
        } else {
          merged.push({ ...section, isEditing: false })
        }
      }
      return merged
    })
  }, [completion])

  useEffect(() => {
    if (error) {
      setBriefStatus("error") // eslint-disable-line react-hooks/set-state-in-effect
      setBriefError(error.message || "An error occurred")
    } else if (isLoading && briefStatus !== "generating") {
      setBriefStatus("generating")
      lastContentRef.current = ""
      finishHandledRef.current = false
    }
  }, [isLoading, error, briefStatus])

  const handleGenerate = useCallback(
    (idea: string) => {
      setSections([])
      setBriefStatus("generating")
      setBriefError(undefined)
      lastContentRef.current = ""
      finishHandledRef.current = false
      complete(idea)
    },
    [complete],
  )

  const handleSave = useCallback((id: string, content: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, content, isEditing: false } : s,
      ),
    )
  }, [])

  const handleStartEdit = useCallback(
    (id: string) => {
      if (briefStatus === "generating") return
      setSections((prev) =>
        prev.map((s) => ({
          ...s,
          isEditing: s.id === id,
        })),
      )
    },
    [briefStatus],
  )

  const handleCancelEdit = useCallback((id: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, isEditing: false } : s,
      ),
    )
  }, [])

  return (
    <main className="planner-bg min-h-screen flex-1 overflow-hidden">
      <div className="relative z-10 container mx-auto max-w-[1500px] px-4 py-8 lg:py-12">

        <header className="mb-12 animate-fade-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="command-strip size-10 rounded-xl flex items-center justify-center shadow-lg">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <span className="micro-label text-muted-foreground">
              AI-Assisted Planning
            </span>
          </div>
          <h1 className="font-display text-5xl lg:text-7xl font-bold tracking-tight leading-[1.08]">
            Project Planner
          </h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-[36rem] leading-7">
            Transform a rough idea into a structured brief, refine each section,
            and hand off a ready-to-use prompt to your coding agent.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)]">
          <div className="space-y-6">
            <IdeaInput onGenerate={handleGenerate} isGenerating={isLoading} />

            {(briefStatus === "complete" ||
              briefStatus === "generating" ||
              briefStatus === "error") && (
              <div className="amber-card paper-card rounded-2xl p-4 space-y-3 animate-fade-up stagger-1">
                <div className="flex items-center justify-between">
                  <p className="micro-label text-muted-foreground">Status</p>
                  <span
                    className={cn(
                      "micro-label",
                      briefStatus === "complete" && "text-teal",
                      briefStatus === "generating" && "text-primary",
                      briefStatus === "error" && "text-destructive",
                    )}
                  >
                    {briefStatus === "generating"
                      ? "In Progress"
                      : briefStatus === "complete"
                        ? "Done"
                        : briefStatus === "error"
                          ? "Failed"
                          : null}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="relative flex size-3">
                    {briefStatus === "generating" && (
                      <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-40" />
                    )}
                    <span
                      className={cn(
                        "relative inline-flex size-3 rounded-full",
                        briefStatus === "generating" && "bg-primary",
                        briefStatus === "complete" && "bg-teal",
                        briefStatus === "error" && "bg-destructive",
                      )}
                    />
                  </span>
                  <span className="text-sm font-mono text-muted-foreground">
                    {briefStatus === "generating"
                      ? "Generating brief..."
                      : briefStatus === "complete"
                        ? "Brief generated successfully"
                        : briefStatus === "error"
                          ? `Error: ${briefError || "Unknown error"}`
                          : null}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <ProjectBrief
              sections={sections}
              status={briefStatus}
              error={briefError}
              onSaveSection={handleSave}
              onStartEdit={handleStartEdit}
              onCancelEdit={handleCancelEdit}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
