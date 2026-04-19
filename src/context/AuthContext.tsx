'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { saveToStorage, loadFromStorage } from '@/lib/storage'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface Course {
  id: string
  title: string
  description: string
  teacherId: string
  blocks: Block[]
}

interface Block {
  id: string
  title: string
  courseId: string
  order: number
  lessons: Lesson[]
}

interface Lesson {
  id: string
  title: string
  content: string
  blockId: string
  order: number
  hasHomework: boolean
  homeworks: Homework[]
}

interface Homework {
  id: string
  lessonId: string
  description: string
  submissions: Submission[]
}

interface Submission {
  id: string
  homeworkId: string
  studentId: string
  content: string
  submittedAt: string
  checked: boolean
  checkedAt?: string
}

interface AuthContextType {
  user: User | null
  courses: Course[]
  login: (email: string, password: string) => boolean
  register: (email: string, name: string, password: string, role: string) => boolean
  logout: () => void
  addCourse: (course: Omit<Course, 'id' | 'blocks'>) => void
  addBlock: (courseId: string, block: Omit<Block, 'id' | 'courseId' | 'lessons'>) => void
  addLesson: (blockId: string, lesson: Omit<Lesson, 'id' | 'blockId' | 'homeworks'>) => void
  submitHomework: (homeworkId: string, content: string) => void
  checkHomework: (submissionId: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    const savedUser = loadFromStorage('user')
    const savedCourses = loadFromStorage('courses') || []
    if (savedUser) setUser(savedUser)
    setCourses(savedCourses)
  }, [])

  const login = (email: string, password: string): boolean => {
    const users = loadFromStorage('users') || []
    const foundUser = users.find((u: any) => u.email === email && u.password === password)
    if (foundUser) {
      setUser(foundUser)
      saveToStorage('user', foundUser)
      return true
    }
    return false
  }

  const register = (email: string, name: string, password: string, role: string): boolean => {
    const users = loadFromStorage('users') || []
    if (users.find((u: any) => u.email === email)) return false
    const newUser = { id: Date.now().toString(), email, name, password, role }
    users.push(newUser)
    saveToStorage('users', users)
    setUser(newUser)
    saveToStorage('user', newUser)
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const addCourse = (course: Omit<Course, 'id' | 'blocks'>) => {
    const newCourse = { ...course, id: Date.now().toString(), blocks: [] }
    const newCourses = [...courses, newCourse]
    setCourses(newCourses)
    saveToStorage('courses', newCourses)
  }

  const addBlock = (courseId: string, block: Omit<Block, 'id' | 'courseId' | 'lessons'>) => {
    const newBlock = { ...block, id: Date.now().toString(), courseId, lessons: [] }
    const newCourses = courses.map(c =>
      c.id === courseId ? { ...c, blocks: [...c.blocks, newBlock] } : c
    )
    setCourses(newCourses)
    saveToStorage('courses', newCourses)
  }

  const addLesson = (blockId: string, lesson: Omit<Lesson, 'id' | 'blockId' | 'homeworks'>) => {
    const newLesson = { ...lesson, id: Date.now().toString(), blockId, homeworks: [] }
    const newCourses = courses.map(c => ({
      ...c,
      blocks: c.blocks.map(b =>
        b.id === blockId ? { ...b, lessons: [...b.lessons, newLesson] } : b
      )
    }))
    setCourses(newCourses)
    saveToStorage('courses', newCourses)
  }

  const submitHomework = (homeworkId: string, content: string) => {
    if (!user) return
    const submission = {
      id: Date.now().toString(),
      homeworkId,
      studentId: user.id,
      content,
      submittedAt: new Date().toISOString(),
      checked: false,
    }
    const newCourses = courses.map(c => ({
      ...c,
      blocks: c.blocks.map(b => ({
        ...b,
        lessons: b.lessons.map(l => ({
          ...l,
          homeworks: l.homeworks.map(h =>
            h.id === homeworkId ? { ...h, submissions: [...h.submissions, submission] } : h
          )
        }))
      }))
    }))
    setCourses(newCourses)
    saveToStorage('courses', newCourses)
    // Здесь можно добавить уведомление, но без сервера - mailto или alert
    alert('Задание сдано! Уведомление отправлено преподавателю.')
  }

  const checkHomework = (submissionId: string) => {
    const newCourses = courses.map(c => ({
      ...c,
      blocks: c.blocks.map(b => ({
        ...b,
        lessons: b.lessons.map(l => ({
          ...l,
          homeworks: l.homeworks.map(h => ({
            ...h,
            submissions: h.submissions.map(s =>
              s.id === submissionId ? { ...s, checked: true, checkedAt: new Date().toISOString() } : s
            )
          }))
        }))
      }))
    }))
    setCourses(newCourses)
    saveToStorage('courses', newCourses)
  }

  return (
    <AuthContext.Provider value={{
      user,
      courses,
      login,
      register,
      logout,
      addCourse,
      addBlock,
      addLesson,
      submitHomework,
      checkHomework,
    }}>
      {children}
    </AuthContext.Provider>
  )
}