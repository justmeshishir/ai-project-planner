"use client"

import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/Button"
import { Textarea } from "@/components/ui/Textarea"
import { Sparkles, ArrowRight } from "lucide-react"

interface IdeaInputProps {
  onGenerate: (idea: string) => void
  isGenerating: boolean
}

export function IdeaInput({ onGenerate, isGenerating }: IdeaInputProps) {
  const [idea, setIdea] = useState("")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (idea.trim() && !isGenerating) {
      onGenerate(idea.trim())
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="amber-card glass-panel rounded-2xl p-6 space-y-4 animate-fade-up shadow-2xl"
    >
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-lg bg-primary/15 flex items-center justify-center">
          <Sparkles className="size-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight">
            What are you building?
          </h2>
          <p className="text-sm text-muted-foreground">
            Describe your idea with as much detail as you like
          </p>
        </div>
      </div>
      <Textarea
        placeholder="Describe your app idea in a few sentences... e.g., A habit tracker that uses AI to suggest personalized routines based on a user's goals and past behavior..."
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        rows={5}
        disabled={isGenerating}
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground font-mono">
          {idea.length} characters
        </p>
        <Button
          type="submit"
          disabled={!idea.trim() || isGenerating}
          size="lg"
        >
          {isGenerating ? (
            <>
              <span className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Generating...
            </>
          ) : (
            <>
              Generate Brief
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
