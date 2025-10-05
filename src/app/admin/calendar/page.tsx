'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import CalendarView from '@/components/admin/calendar-view'
import AdminNav from '@/components/admin/admin-nav'
import type { TeeTime } from '@/types/database'
import { useRouter } from 'next/navigation'

export default function CalendarPage() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/admin/login')
      }
    }
    checkAuth()
  }, [router])
  const supabase = createClient()

  const { data: teeTimes, isLoading } = useQuery({
    queryKey: ['teeTimes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tee_time')
        .select('*')
        .order('date', { ascending: true })

      if (error) throw error
      return data as TeeTime[]
    },
  })

  return (
    <>
      <AdminNav />
      <div className="container mx-auto py-6 px-4">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">캘린더</h1>
            <p className="text-gray-600 mt-1">티타임 및 예약 현황을 한눈에 확인하세요</p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          ) : (
            <CalendarView teeTimes={teeTimes || []} />
          )}
        </div>
      </div>
    </>
  )
}
