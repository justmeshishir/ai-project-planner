"use client"

import { useState, useRef, useEffect } from "react"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Textarea } from "@/components/ui/Textarea"
import { Pencil, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BriefSectionData {
  id: string
  label: string
  content: string
  isEditing: boolean
}

interface BriefSectionProps {
  section: BriefSectionData
  onSave: (id: string, content: string) => void
  onStartEdit: (id: string) => void
  onCancelEdit: (id: string) => void
  disabled: boolean
  index?: number
}

export function BriefSection({
  section,
  onSave,
  onStartEdit,
  onCancelEdit,
  disabled,
  index = 0,
}: BriefSectionProps) {
  const [draft, setDraft] = useState(section.content)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const prevEditingRef = useRef(section.isEditing)
  useEffect(() => {
    if (section.isEditing && !prevEditingRef.current) {
      setDraft(section.content)
      textareaRef.current?.focus()
    }
    prevEditingRef.current = section.isEditing
  }, [section.isEditing, section.content])

  const handleSave = () => {
    onSave(section.id, draft)
  }

  const handleCancel = () => {
    setDraft(section.content)
    onCancelEdit(section.id)
  }

  return (
    <div
      className={cn(
        "paper-card rounded-2xl transition-all duration-200",
        "stagger-1",
      )}
    >
      <div className="flex items-center justify-between gap-2 p-5 pb-0">
        <div className="flex items-center gap-2">
          <span className="micro-label text-muted-foreground/50">
            {(index + 1).toString().padStart(2, "0")}
          </span>
          <Badge variant="accent">{section.label}</Badge>
        </div>
        {!section.isEditing && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onStartEdit(section.id)}
            disabled={disabled}
            aria-label={`Edit ${section.label}`}
          >
            <Pencil className="size-4" />
          </Button>
        )}
      </div>

      <div className="p-5 pt-3">
        {section.isEditing ? (
          <div className="space-y-3">
            <Textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={6}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="size-4" />
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave}>
                <Check className="size-4" />
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm leading-7 text-foreground/90 whitespace-pre-wrap">
            {section.content || (
              <span className="text-muted-foreground italic">Empty</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
