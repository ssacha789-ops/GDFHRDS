"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Subject } from "@/lib/subjects"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Trophy,
  RotateCcw,
  Home,
  Sparkles
} from "lucide-react"

interface Question {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

interface QuizClientProps {
  subject: Subject
  userLevel: string
}

type QuizState = "setup" | "loading" | "playing" | "result"

export function QuizClient({ subject, userLevel }: QuizClientProps) {
  const router = useRouter()
  const [state, setState] = useState<QuizState>("setup")
  const [topic, setTopic] = useState("")
  const [questionCount, setQuestionCount] = useState(5)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [answers, setAnswers] = useState<number[]>([])
  const [score, setScore] = useState(0)

  const generateQuiz = async () => {
    setState("loading")
    
    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.id,
          level: userLevel,
          topic: topic || undefined,
          questionCount,
        }),
      })

      const data = await res.json()
      
      if (data.quiz?.questions) {
        setQuestions(data.quiz.questions)
        setState("playing")
      } else {
        throw new Error("Invalid quiz data")
      }
    } catch (error) {
      console.error("Failed to generate quiz:", error)
      setState("setup")
    }
  }

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return
    
    setSelectedAnswer(index)
    setShowExplanation(true)
    
    const newAnswers = [...answers, index]
    setAnswers(newAnswers)
    
    if (index === questions[currentIndex].correctIndex) {
      setScore(prev => prev + 1)
    }
  }

  const nextQuestion = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      // Save quiz result
      await fetch("/api/quiz/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.id,
          topic: topic || null,
          score,
          totalQuestions: questions.length,
          questions: questions.map((q, i) => ({
            question: q.question,
            correctIndex: q.correctIndex,
            userAnswer: answers[i],
          })),
        }),
      })
      
      setState("result")
    }
  }

  const restartQuiz = () => {
    setState("setup")
    setQuestions([])
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setShowExplanation(false)
    setAnswers([])
    setScore(0)
    setTopic("")
  }

  const currentQuestion = questions[currentIndex]
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Retour au tableau de bord</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${subject.color}`}>
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Quiz {subject.name}</h1>
              <p className="text-sm text-muted-foreground">Testez vos connaissances</p>
            </div>
          </div>
        </div>

        {/* Setup State */}
        {state === "setup" && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Configurer le quiz</CardTitle>
              <CardDescription>Personnalisez votre quiz selon vos besoins</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">
                  Sujet spécifique (optionnel)
                </label>
                <Input
                  placeholder="Ex: Les équations du second degré, La Révolution française..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">
                  Nombre de questions
                </label>
                <div className="flex gap-2">
                  {[3, 5, 10].map((count) => (
                    <Button
                      key={count}
                      variant={questionCount === count ? "default" : "outline"}
                      onClick={() => setQuestionCount(count)}
                      className={questionCount === count ? "bg-accent text-accent-foreground" : ""}
                    >
                      {count}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={generateQuiz}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Générer le quiz
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Loading State */}
        {state === "loading" && (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-accent mb-4" />
              <p className="text-card-foreground font-medium">Génération du quiz en cours...</p>
              <p className="text-sm text-muted-foreground">L&apos;IA prépare des questions adaptées à votre niveau</p>
            </CardContent>
          </Card>
        )}

        {/* Playing State */}
        {state === "playing" && currentQuestion && (
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Question {currentIndex + 1} / {questions.length}
                </span>
                <span className="text-sm font-medium text-accent">
                  Score: {score}
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <h2 className="text-lg font-medium text-card-foreground">
                {currentQuestion.question}
              </h2>
              <div className="space-y-2">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index
                  const isCorrect = index === currentQuestion.correctIndex
                  const showResult = selectedAnswer !== null

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={selectedAnswer !== null}
                      className={`w-full p-4 rounded-lg text-left transition-all flex items-center gap-3 ${
                        showResult
                          ? isCorrect
                            ? "bg-green-500/20 border-green-500 border"
                            : isSelected
                              ? "bg-red-500/20 border-red-500 border"
                              : "bg-secondary border border-transparent"
                          : "bg-secondary hover:bg-secondary/80 border border-transparent hover:border-accent/50"
                      }`}
                    >
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium ${
                        showResult && isCorrect
                          ? "bg-green-500 text-white"
                          : showResult && isSelected
                            ? "bg-red-500 text-white"
                            : "bg-muted text-muted-foreground"
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-1 text-card-foreground">{option}</span>
                      {showResult && isCorrect && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                      {showResult && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-500" />}
                    </button>
                  )
                })}
              </div>

              {showExplanation && (
                <div className="mt-4 p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <p className="text-sm font-medium text-accent mb-1">Explication</p>
                  <p className="text-sm text-card-foreground">{currentQuestion.explanation}</p>
                </div>
              )}
            </CardContent>
            {selectedAnswer !== null && (
              <CardFooter>
                <Button 
                  onClick={nextQuestion}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {currentIndex < questions.length - 1 ? "Question suivante" : "Voir les résultats"}
                </Button>
              </CardFooter>
            )}
          </Card>
        )}

        {/* Result State */}
        {state === "result" && (
          <Card className="bg-card border-border">
            <CardContent className="py-8 text-center">
              <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full mb-4 ${
                percentage >= 80 
                  ? "bg-green-500/20" 
                  : percentage >= 50 
                    ? "bg-amber-500/20" 
                    : "bg-red-500/20"
              }`}>
                <Trophy className={`h-10 w-10 ${
                  percentage >= 80 
                    ? "text-green-500" 
                    : percentage >= 50 
                      ? "text-amber-500" 
                      : "text-red-500"
                }`} />
              </div>
              <h2 className="text-2xl font-bold text-card-foreground mb-2">
                {percentage >= 80 
                  ? "Excellent !" 
                  : percentage >= 50 
                    ? "Bien joué !" 
                    : "Continue tes efforts !"}
              </h2>
              <p className="text-4xl font-bold text-accent mb-2">
                {score} / {questions.length}
              </p>
              <p className="text-muted-foreground mb-6">
                {percentage}% de bonnes réponses
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={restartQuiz}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Nouveau quiz
                </Button>
                <Button 
                  onClick={() => router.push("/dashboard")}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Tableau de bord
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
