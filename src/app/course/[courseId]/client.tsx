'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'

interface Block {
  id: string
  title: string
  lessons: any[]
}

export default function CoursePageClient() {
  const { courses, user, addBlock } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const { courseId } = useParams()
  const [course, setCourse] = useState<any>(null)
  const [newBlockTitle, setNewBlockTitle] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    const foundCourse = courses.find(c => c.id === courseId)
    if (foundCourse) {
      setCourse(foundCourse)
    }
  }, [user, courses, courseId, router])

  if (!course) return <div>Загрузка...</div>

  const handleAddBlock = () => {
    if (newBlockTitle.trim()) {
      addBlock(courseId as string, { title: newBlockTitle, order: course.blocks.length + 1 })
      setNewBlockTitle('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{course.title}</h1>
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
          {user?.role === 'teacher' && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Добавить блок</h3>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newBlockTitle}
                  onChange={(e) => setNewBlockTitle(e.target.value)}
                  placeholder="Название блока"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <button
                  onClick={handleAddBlock}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Добавить
                </button>
              </div>
            </div>
          )}
          {course.blocks.map((block: Block) => (
            <div key={block.id} className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">{block.title}</h2>
              <div className="space-y-2">
                {block.lessons.map(lesson => (
                  <div key={lesson.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{lesson.title}</h3>
                    <Link href={`/lesson/${lesson.id}`} className="text-indigo-600 dark:text-indigo-400">Просмотреть урок</Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}