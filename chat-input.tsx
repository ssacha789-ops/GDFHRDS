'use client'

import { useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowUp, Square } from 'lucide-react'

interface ChatInputProps {
  input: string
  setInput: (value: string) => void
  onSubmit: () => void
  onStop?: () => void
  isLoading: boolean
}

export function ChatInput({
  input,
  setInput,
  onSubmit,
  onStop,
  isLoading,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isLoading && input.trim()) {
        onSubmit()
      }
    }
  }

  return (
    <div className="border-t border-border bg-background p-4">
      <div className="mx-auto max-w-3xl">
        <div className="relative flex items-end gap-2 rounded-2xl border border-border bg-card p-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Envoyer un message..."
            className="min-h-[44px] max-h-[200px] flex-1 resize-none border-0 bg-transparent px-3 py-2 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            rows={1}
            disabled={isLoading}
          />
          {isLoading ? (
            <Button
              onClick={onStop}
              size="icon"
              className="h-9 w-9 shrink-0 rounded-xl bg-destructive hover:bg-destructive/90"
            >
              <Square className="h-4 w-4 fill-current" />
              <span className="sr-only">Arrêter</span>
            </Button>
          ) : (
            <Button
              onClick={onSubmit}
              disabled={!input.trim()}
              size="icon"
              className="h-9 w-9 shrink-0 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
              <ArrowUp className="h-4 w-4" />
              <span className="sr-only">Envoyer</span>
            </Button>
          )}
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Propulsé par Claude AI
        </p>
      </div>
    </div>
  )
}
