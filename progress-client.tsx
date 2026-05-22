"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, 
  BookOpen,
  Trophy,
  TrendingUp,
  Target,
  Calendar,
  Calculator,
  FlaskConical,
  BookText,
  Globe,
  Map
} from "lucide-react"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Calculator,
  FlaskConical,
  BookText,
  Globe,
  Map
}

interface SubjectStat {
  id: string
  name: string
  icon: string
  color: string
  description: string
  totalQuizzes: number
  averageScore: number
  recentQuizzes: Array<{
    id: string
    score: number
    total_questions: number
    created_at: string
  }>
}

interface QuizResult {
  id: string
  subject: string
  topic: string | null
  score: number
  total_questions: number
  created_at: string
}

interface ProgressClientProps {
  profile: {
    full_name: string | null
    level: string | null
  } | null
  subjectStats: SubjectStat[]
  recentQuizzes: QuizResult[]
}

export function ProgressClient({ profile, subjectStats, recentQuizzes }: ProgressClientProps) {
  const totalQuizzes = subjectStats.reduce((acc, s) => acc + s.totalQuizzes, 0)
  const overallScore = totalQuizzes > 0 
    ? Math.round(subjectStats.reduce((acc, s) => acc + s.averageScore * s.totalQuizzes, 0) / totalQuizzes)
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
              <p className="text-xs text-muted-foreground">Mes progrès</p>
            </div>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Overview Stats */}
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
                <p className="text-2xl font-bold text-foreground">{overallScore}%</p>
                <p className="text-xs text-muted-foreground">Score moyen</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                <Target className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {subjectStats.filter(s => s.averageScore >= 80).length}
                </p>
                <p className="text-xs text-muted-foreground">Matières maîtrisées</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                <Calendar className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {recentQuizzes.filter(q => {
                    const date = new Date(q.created_at)
                    const now = new Date()
                    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
                    return diffDays < 7
                  }).length}
                </p>
                <p className="text-xs text-muted-foreground">Cette semaine</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subject Progress */}
        <h2 className="text-lg font-semibold text-foreground mb-4">Progression par matière</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {subjectStats.map((subject) => {
            const Icon = iconMap[subject.icon]
            return (
              <Card key={subject.id} className="bg-card border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${subject.color}`}>
                      {Icon && <Icon className="h-5 w-5 text-white" />}
                    </div>
                    <div>
                      <CardTitle className="text-base text-card-foreground">{subject.name}</CardTitle>
                      <CardDescription>{subject.totalQuizzes} quiz complétés</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Score moyen</span>
                        <span className="font-medium text-foreground">{subject.averageScore}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            subject.averageScore >= 80 
                              ? "bg-green-500" 
                              : subject.averageScore >= 50 
                                ? "bg-amber-500" 
                                : "bg-red-500"
                          }`}
                          style={{ width: `${subject.averageScore}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/study/${subject.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          Réviser
                        </Button>
                      </Link>
                      <Link href={`/quiz/${subject.id}`} className="flex-1">
                        <Button size="sm" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                          Quiz
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Recent Activity */}
        {recentQuizzes.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Historique récent</h2>
            <Card className="bg-card border-border">
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {recentQuizzes.map((quiz) => {
                    const subject = subjectStats.find(s => s.id === quiz.subject)
                    const percentage = Math.round((quiz.score / quiz.total_questions) * 100)
                    return (
                      <div key={quiz.id} className="flex items-center gap-4 p-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          percentage >= 80 
                            ? "bg-green-500/20" 
                            : percentage >= 50 
                              ? "bg-amber-500/20" 
                              : "bg-red-500/20"
                        }`}>
                          <Trophy className={`h-5 w-5 ${
                            percentage >= 80 
                              ? "text-green-500" 
                              : percentage >= 50 
                                ? "text-amber-500" 
                                : "text-red-500"
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            Quiz {subject?.name || quiz.subject}
                          </p>
                          {quiz.topic && (
                            <p className="text-xs text-muted-foreground truncate">{quiz.topic}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">
                            {quiz.score}/{quiz.total_questions}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(quiz.created_at).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
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
