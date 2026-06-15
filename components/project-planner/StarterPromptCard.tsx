"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Copy, Check, Terminal } from "lucide-react"

interface StarterPromptCardProps {
  prompt: string
}

export function StarterPromptCard({ prompt }: StarterPromptCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement("textarea")
      textarea.value = prompt
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [prompt])

  if (!prompt) return null

  return (
    <Card className="animate-fade-up border-accent/20 teal-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-accent/15 flex items-center justify-center">
              <Terminal className="size-4 text-accent" />
            </div>
            <span>Starter Prompt for Coding Agent</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="size-4 text-accent" />
                <span className="text-accent">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="size-4" />
                Copy
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-background/30 rounded-xl border border-border overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/20">
            <span className="size-2.5 rounded-full bg-destructive/60" />
            <span className="size-2.5 rounded-full bg-primary/60" />
            <span className="size-2.5 rounded-full bg-accent/60" />
            <span className="micro-label text-muted-foreground ml-2">
              prompt.txt
            </span>
          </div>
          <pre className="text-sm leading-7 text-foreground/90 whitespace-pre-wrap font-mono p-4 max-h-[400px] overflow-y-auto">
            {prompt}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
