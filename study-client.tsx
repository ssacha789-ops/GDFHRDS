"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { createClient } from "@/lib/supabase/client"
import { Subject } from "@/lib/subjects"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { 
  ArrowLeft, 
  Send, 
  Loader2, 
  MessageSquare, 
  Plus,
  Sparkles,
  BookOpen,
  PenTool,
  Lightbulb,
  Clock,
  Trash2,
  Square
} from "lucide-react"

interface Conversation {
  id: string
  title: string | null
  messages: unknown[]
  updated_at: string
}

interface StudyClientProps {
  subject: Subject
  userLevel: string
  userId: string
  conversations: Conversation[]
}

const suggestions = [
  { icon: BookOpen, text: "Explique-moi ce chapitre" },
  { icon: PenTool, text: "Génère-moi un quiz de 5 questions" },
  { icon: Lightbulb, text: "Donne-moi des astuces de mémorisation" },
]

export function StudyClient({ subject, userLevel, userId, conversations: initialConversations }: StudyClientProps) {
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useState(initialConversations)
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClient()

  const { messages, sendMessage, status, setMessages, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        subject: subject.id,
        level: userLevel,
      },
    }),
  })

  const isLoading = status === "streaming" || status === "submitted"

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`
    }
  }, [input])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    
    const userMessage = input.trim()
    setInput("")
    
    // Create new conversation if needed
    if (!currentConversationId) {
      const { data: newConv, error } = await supabase
        .from("conversations")
        .insert({
          user_id: userId,
          subject: subject.id,
          title: userMessage.slice(0, 50) + (userMessage.length > 50 ? "..." : ""),
          messages: [],
        })
        .select()
        .single()
      
      if (!error && newConv) {
        setCurrentConversationId(newConv.id)
        setConversations(prev => [newConv, ...prev])
      }
    }

    sendMessage({ text: userMessage })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestionClick = (text: string) => {
    setInput(text)
    textareaRef.current?.focus()
  }

  const startNewConversation = () => {
    setCurrentConversationId(null)
    setMessages([])
    setInput("")
  }

  const loadConversation = async (conv: Conversation) => {
    setCurrentConversationId(conv.id)
    // Messages are stored in the conversation, but we start fresh for the chat
    // In a full implementation, you'd load and restore the messages
    setMessages([])
  }

  const deleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await supabase.from("conversations").delete().eq("id", convId)
    setConversations(prev => prev.filter(c => c.id !== convId))
    if (currentConversationId === convId) {
      startNewConversation()
    }
  }

  // Save messages to conversation when they update
  useEffect(() => {
    if (currentConversationId && messages.length > 0 && status === "ready") {
      supabase
        .from("conversations")
        .update({ 
          messages: messages,
          updated_at: new Date().toISOString()
        })
        .eq("id", currentConversationId)
        .then(() => {})
    }
  }, [messages, currentConversationId, status, supabase])

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-72 flex-col border-r border-border bg-card">
        <div className="p-4 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Retour au tableau de bord</span>
          </Link>
          <div className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br ${subject.color}`}>
            <Sparkles className="h-5 w-5 text-white" />
            <div>
              <h2 className="font-semibold text-white">{subject.name}</h2>
              <p className="text-xs text-white/80">Assistant IA</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <Button 
            onClick={startNewConversation}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle conversation
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <p className="text-xs text-muted-foreground mb-2">Historique</p>
          <div className="space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => loadConversation(conv)}
                className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                  currentConversationId === conv.id 
                    ? "bg-accent/20 text-foreground" 
                    : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <MessageSquare className="h-4 w-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{conv.title || "Nouvelle conversation"}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(conv.updated_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                  onClick={(e) => deleteConversation(conv.id, e)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {conversations.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune conversation
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden border-b border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${subject.color}`}>
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">{subject.name}</h2>
              <p className="text-xs text-muted-foreground">Assistant IA</p>
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${subject.color} mb-4`}>
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Assistant {subject.name}
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md">
                Je suis là pour t&apos;aider à comprendre tes cours, répondre à tes questions, et te faire progresser !
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
                {suggestions.map((suggestion, i) => (
                  <Card 
                    key={i}
                    className="bg-card border-border hover:border-accent/50 cursor-pointer transition-all hover:shadow-lg group"
                    onClick={() => handleSuggestionClick(suggestion.text)}
                  >
                    <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                      <suggestion.icon className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        {suggestion.text}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-accent text-accent-foreground"
                        : "bg-card border border-border text-card-foreground"
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">
                      {message.parts?.map((part, i) => {
                        if (part.type === "text") {
                          return <span key={i}>{part.text}</span>
                        }
                        return null
                      })}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex justify-start">
                  <div className="bg-card border border-border rounded-2xl px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-card p-4">
          <div className="max-w-3xl mx-auto flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pose ta question..."
              className="min-h-[44px] max-h-[150px] resize-none bg-input border-border"
              rows={1}
            />
            {isLoading ? (
              <Button
                onClick={stop}
                variant="outline"
                size="icon"
                className="h-11 w-11 flex-shrink-0"
              >
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSend}
                disabled={!input.trim()}
                className="h-11 w-11 flex-shrink-0 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
