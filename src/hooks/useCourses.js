import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCourses() {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          profiles (name, avatar_url)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (!error) setCourses(data || [])
      setLoading(false)
    }

    fetchCourses()
  }, [])

  return { courses, loading }
}