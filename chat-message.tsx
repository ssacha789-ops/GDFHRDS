'use client'

import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Bot, User } from 'lucide-react'
import type { UIMessage } from 'ai'

interface ChatMessageProps {
  message: UIMessage
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={cn(
        'flex gap-3 px-4 py-6',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0 border border-border">
          <AvatarFallback className="bg-accent text-accent-foreground">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-card text-card-foreground border border-border'
        )}
      >
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.parts.map((part, index) => {
            if (part.type === 'text') {
              return <span key={index}>{part.text}</span>
            }
            return null
          })}
        </div>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 shrink-0 border border-border">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
