'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'

interface Lesson {
  id: string
  title: string
  content: string
  hasHomework: boolean
  homeworks: any[]
}

export default function LessonPageClient() {
  const { courses, user, submitHomework } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const { lessonId } = useParams()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [content, setContent] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    // Найти урок в курсах
    for (const course of courses) {
      for (const block of course.blocks) {
        const foundLesson = block.lessons.find((l: any) => l.id === lessonId)
        if (foundLesson) {
          setLesson(foundLesson)
          return
        }
      }
    }
  }, [user, courses, lessonId, router])

  const handleSubmitHomework = () => {
    submitHomework(lesson?.homeworks[0]?.id, content)
    setSubmitted(true)
  }

  if (!lesson) return <div>Загрузка...</div>

  const parsedContent = JSON.parse(lesson.content)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{lesson.title}</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              <Link href="/dashboard" className="text-indigo-600 dark:text-indigo-400">Назад</Link>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <p className="text-gray-900 dark:text-gray-100">{parsedContent.text}</p>
            {parsedContent.video && (
              <iframe src={parsedContent.video} width="560" height="315" className="mt-4 border-0"></iframe>
            )}
          </div>
          {lesson.hasHomework && !submitted && (
            <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">{lesson.homeworks[0]?.description}</h3>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                rows={4}
              />
              <button
                onClick={handleSubmitHomework}
                className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Сдать задание
              </button>
            </div>
          )}
          {submitted && <p className="mt-4 text-green-600 dark:text-green-400">Задание сдано! Ожидайте проверки.</p>}
        </div>
      </main>
    </div>
  )
}