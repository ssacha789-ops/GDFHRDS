export type Subject = {
  id: string
  name: string
  icon: string
  color: string
  description: string
}

export const subjects: Subject[] = [
  {
    id: "maths",
    name: "Mathématiques",
    icon: "Calculator",
    color: "from-blue-500 to-cyan-500",
    description: "Algèbre, géométrie, analyse et statistiques"
  },
  {
    id: "sciences",
    name: "Sciences",
    icon: "FlaskConical",
    color: "from-emerald-500 to-teal-500",
    description: "Physique, chimie et SVT"
  },
  {
    id: "francais",
    name: "Français",
    icon: "BookText",
    color: "from-rose-500 to-pink-500",
    description: "Grammaire, littérature et rédaction"
  },
  {
    id: "anglais",
    name: "Anglais",
    icon: "Globe",
    color: "from-amber-500 to-orange-500",
    description: "Vocabulaire, grammaire et expression"
  },
  {
    id: "histoire-geo",
    name: "Histoire-Géo",
    icon: "Map",
    color: "from-violet-500 to-purple-500",
    description: "Histoire, géographie et éducation civique"
  }
]

export const levels = [
  { id: "college", name: "Collège", description: "6ème à 3ème" },
  { id: "lycee", name: "Lycée", description: "2nde à Terminale" },
  { id: "superieur", name: "Supérieur", description: "Post-bac" }
]
