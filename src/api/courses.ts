import type { Course, CourseMeta } from '../types'

export async function listCourses(): Promise<CourseMeta[]> {
  const res = await fetch('/api/courses')
  if (!res.ok) throw new Error('Failed to load courses')
  return res.json()
}

export async function fetchCourse(slug: string): Promise<Course> {
  const res = await fetch(`/api/courses/${slug}`)
  if (!res.ok) throw new Error('Course not found')
  return res.json()
}
