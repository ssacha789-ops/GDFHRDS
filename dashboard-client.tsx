"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { subjects, levels } from "@/lib/subjects"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  BookOpen, 
  Calculator, 
  FlaskConical, 
  BookText, 
  Globe, 
  Map,
  MessageSquare,
  Trophy,
  TrendingUp,
  LogOut,
  Sparkles,
  Clock,
  BarChart3,
  PenTool
} from "lucide-react"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Calculator,
  FlaskConical,
  BookText,
  Globe,
  Map
}

interface DashboardClientProps {
  user: User
  profile: {
    id: string
    full_name: string | null
    level: string | null
    created_at: string
  } | null
  quizResults: Array<{
    id: string
    subject: string
    topic: string | null
    score: number
    total_questions: number
    created_at: string
  }>
  recentConversations: Array<{
    id: string
    subject: string
    title: string | null
    updated_at: string
  }>
}

export function DashboardClient({ user, profile, quizResults, recentConversations }: DashboardClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const userName = profile?.full_name || user.email?.split("@")[0] || "Étudiant"
  const userLevel = levels.find(l => l.id === profile?.level)

  // Calculate stats
  const totalQuizzes = quizResults.length
  const averageScore = totalQuizzes > 0 
    ? Math.round(quizResults.reduce((acc, q) => acc + (q.score / q.total_questions) * 100, 0) / totalQuizzes)
    : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
              <BookOpen className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">SchoolPilot</h1>
              <p className="text-xs text-muted-foreground">Plateforme de révision</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/progress">
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Progrès
              </Button>
            </Link>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">{userName}</p>
              {userLevel && (
                <p className="text-xs text-muted-foreground">{userLevel.name}</p>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              disabled={loggingOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {loggingOut ? "..." : "Déconnexion"}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Bonjour, {userName.split(" ")[0]} !
          </h2>
          <p className="text-muted-foreground">
            Que souhaitez-vous réviser aujourd&apos;hui ?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                <Trophy className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalQuizzes}</p>
                <p className="text-xs text-muted-foreground">Quiz complétés</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{averageScore}%</p>
                <p className="text-xs text-muted-foreground">Score moyen</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                <MessageSquare className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{recentConversations.length}</p>
                <p className="text-xs text-muted-foreground">Conversations</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                <Sparkles className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">5</p>
                <p className="text-xs text-muted-foreground">Matières</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subject Cards */}
        <h3 className="text-lg font-semibold text-foreground mb-4">Choisissez une matière</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {subjects.map((subject) => {
            const Icon = iconMap[subject.icon]
            return (
              <Card key={subject.id} className="bg-card border-border hover:border-accent/50 transition-all hover:shadow-lg hover:shadow-accent/5 group h-full">
                <CardHeader className="pb-2">
                  <Link href={`/study/${subject.id}`}>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${subject.color} mb-3 group-hover:scale-105 transition-transform`}>
                      {Icon && <Icon className="h-6 w-6 text-white" />}
                    </div>
                    <CardTitle className="text-lg text-card-foreground">{subject.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {subject.description}
                    </CardDescription>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Link href={`/study/${subject.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Chat IA
                      </Button>
                    </Link>
                    <Link href={`/quiz/${subject.id}`} className="flex-1">
                      <Button size="sm" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                        <PenTool className="h-4 w-4 mr-1" />
                        Quiz
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Recent Activity */}
        {recentConversations.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Activité récente</h3>
            <Card className="bg-card border-border">
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {recentConversations.map((conv) => {
                    const subject = subjects.find(s => s.id === conv.subject)
                    return (
                      <Link 
                        key={conv.id} 
                        href={`/study/${conv.subject}?conversation=${conv.id}`}
                        className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors"
                      >
                        <MessageSquare className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {conv.title || `Conversation ${subject?.name || conv.subject}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {subject?.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(conv.updated_at).toLocaleDateString("fr-FR")}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
