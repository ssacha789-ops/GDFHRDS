import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { subjects } from "@/lib/subjects"
import { StudyClient } from "@/components/study/study-client"

interface StudyPageProps {
  params: Promise<{ subject: string }>
}

export default async function StudyPage({ params }: StudyPageProps) {
  const { subject: subjectId } = await params
  
  const subject = subjects.find(s => s.id === subjectId)
  if (!subject) {
    notFound()
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const { data: conversations } = await supabase
    .from("conversations")
    .select("*")
    .eq("user_id", user.id)
    .eq("subject", subjectId)
    .order("updated_at", { ascending: false })

  return (
    <StudyClient 
      subject={subject}
      userLevel={profile?.level || "lycee"}
      userId={user.id}
      conversations={conversations || []}
    />
  )
}
