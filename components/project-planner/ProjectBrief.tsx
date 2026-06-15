"use client"

import { useMemo } from "react"
import { BriefSection, type BriefSectionData } from "./BriefSection"
import { DataModelGraph } from "./DataModelGraph"
import { StarterPromptCard } from "./StarterPromptCard"
interface ProjectBriefProps {
  sections: BriefSectionData[]
  status: "idle" | "generating" | "complete" | "error"
  error?: string
  onSaveSection: (id: string, content: string) => void
  onStartEdit: (id: string) => void
  onCancelEdit: (id: string) => void
}

export function ProjectBrief({
  sections,
  status,
  error,
  onSaveSection,
  onStartEdit,
  onCancelEdit,
}: ProjectBriefProps) {
  const starterPrompt = useMemo(() => {
    if (sections.length === 0) return ""
    return sections
      .map((s) => `## ${s.label}\n${s.content}`)
      .join("\n\n")
  }, [sections])

  if (status === "idle") return null

  if (status === "error") {
    return (
      <div className="paper-card rounded-2xl p-6 text-center animate-fade-up">
        <div className="size-12 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-destructive"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p className="text-destructive font-semibold">Failed to generate brief</p>
        {error && (
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
        )}
      </div>
    )
  }

  if (sections.length === 0 && status === "generating") {
    return (
      <div className="space-y-4 animate-fade-up">
        <div className="teal-card paper-card rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <span className="relative flex size-4">
              <span className="absolute inset-0 rounded-full bg-teal animate-ping opacity-40" />
              <span className="relative inline-flex size-4 rounded-full bg-teal" />
            </span>
            <div>
              <p className="text-sm font-medium">Generating brief</p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                Streaming sections...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const disabled = status === "generating"

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-2">
        <span className="micro-label text-muted-foreground">Brief Sections</span>
        <span className="text-xs text-muted-foreground/50 font-mono">
          {sections.length} sections
        </span>
        {status === "generating" && (
          <span className="micro-label text-primary animate-pulse">
            Streaming...
          </span>
        )}
      </div>

      <div className="grid gap-5">
        {sections.map((section, i) => {
          if (section.id === "possible-data-model") {
            return (
              <div key={section.id} className="space-y-4">
                <BriefSection
                  section={section}
                  onSave={onSaveSection}
                  onStartEdit={onStartEdit}
                  onCancelEdit={onCancelEdit}
                  disabled={disabled}
                  index={i}
                />
                <DataModelGraph content={section.content} />
              </div>
            )
          }
          return (
            <BriefSection
              key={section.id}
              section={section}
              onSave={onSaveSection}
              onStartEdit={onStartEdit}
              onCancelEdit={onCancelEdit}
              disabled={disabled}
              index={i}
            />
          )
        })}
      </div>

      {sections.length > 0 && (
        <div className="pt-2">
          {status === "complete" && starterPrompt && (
            <StarterPromptCard prompt={starterPrompt} />
          )}
        </div>
      )}
    </div>
  )
}
