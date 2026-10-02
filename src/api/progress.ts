import type { CourseProgress } from '../types'

export async function loadProgress(slug: string): Promise<CourseProgress | null> {
  const res = await fetch(`/api/progress/${slug}`)
  if (!res.ok) return null
  return res.json()
}

export async function saveProgress(slug: string, progress: CourseProgress): Promise<void> {
  await fetch(`/api/progress/${slug}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(progress),
  })
}

export async function resetProgress(slug: string): Promise<void> {
  await fetch(`/api/progress/${slug}`, { method: 'DELETE' })
}
