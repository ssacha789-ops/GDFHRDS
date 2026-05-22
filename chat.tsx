'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { ChatMessage } from '@/components/chat-message'
import { ChatInput } from '@/components/chat-input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bot, Sparkles } from 'lucide-react'

export function Chat() {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput('')
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
            <Bot className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Assistant IA</h1>
            <p className="text-xs text-muted-foreground">Propulsé par Claude</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-xs text-muted-foreground border border-border">
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          En ligne
        </div>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="mx-auto max-w-3xl">
          {messages.length === 0 ? (
            <div className="flex h-[calc(100vh-200px)] flex-col items-center justify-center gap-4 px-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card border border-border">
                <Sparkles className="h-8 w-8 text-accent" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">
                  Bonjour, comment puis-je vous aider ?
                </h2>
                <p className="text-sm text-muted-foreground max-w-md">
                  Je suis votre assistant IA. Posez-moi des questions, demandez de l&apos;aide 
                  pour rédiger du contenu, du code, ou simplement discutons.
                </p>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {[
                  'Explique-moi un concept',
                  'Aide-moi à coder',
                  'Rédige un email',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:bg-secondary"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="pb-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-3 px-4 py-6">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-accent">
                    <Bot className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <ChatInput
        input={input}
        setInput={setInput}
        onSubmit={handleSubmit}
        onStop={stop}
        isLoading={isLoading}
      />
    </div>
  )
}
