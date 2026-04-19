import LessonPageClient from './client'

export async function generateStaticParams() {
  return []
}

export default function LessonPage() {
  return <LessonPageClient />
}