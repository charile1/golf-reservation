'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Plus, ArrowUpDown, List, Calendar } from 'lucide-react'
import TeeTimeForm from '@/components/admin/tee-time-form'
import TeeTimeList from '@/components/admin/tee-time-list'
import CalendarView from '@/components/admin/calendar-view'
import TeeTimeBookingsModal from '@/components/admin/tee-time-bookings-modal'
import AdminNav from '@/components/admin/admin-nav'
import type { TeeTime } from '@/types/database'
import { useRouter } from 'next/navigation'

export default function TeeTimesPage() {
  const router = useRouter()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTeeTime, setEditingTeeTime] = useState<TeeTime | null>(null)
  const [isBookingsModalOpen, setIsBookingsModalOpen] = useState(false)
  const [selectedTeeTime, setSelectedTeeTime] = useState<TeeTime | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/admin/login')
      }
    }
    checkAuth()
  }, [router, supabase])

  // Fetch tee times with booking counts
  const { data: teeTimes, isLoading } = useQuery({
    queryKey: ['teeTimes', sortOrder],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tee_time')
        .select(`
          *,
          bookings:booking(people_count, status)
        `)
        .order('date', { ascending: sortOrder === 'asc' })
        .order('time', { ascending: true })

      if (error) throw error

      // Calculate pending and confirmed counts
      return (data as any[]).map(teeTime => {
        const confirmedCount = teeTime.bookings
          ?.filter((b: any) => b.status === 'CONFIRMED')
          .reduce((sum: number, b: any) => sum + b.people_count, 0) || 0

        const pendingCount = teeTime.bookings
          ?.filter((b: any) => b.status === 'PENDING')
          .reduce((sum: number, b: any) => sum + b.people_count, 0) || 0

        return {
          ...teeTime,
          slots_booked: confirmedCount,
          slots_pending: pendingCount,
        }
      }) as (TeeTime & { slots_pending: number })[]
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tee_time').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teeTimes'] })
      toast({
        title: '삭제 완료',
        description: '티타임이 삭제되었습니다.',
      })
    },
    onError: (error) => {
      toast({
        title: '삭제 실패',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const handleEdit = (teeTime: TeeTime) => {
    setEditingTeeTime(teeTime)
    setIsFormOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleManageBookings = (teeTime: TeeTime) => {
    setSelectedTeeTime(teeTime)
    setIsBookingsModalOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingTeeTime(null)
  }

  const handleBookingsModalClose = () => {
    setIsBookingsModalOpen(false)
    setSelectedTeeTime(null)
  }

  return (
    <>
      <AdminNav />
      <div className="container mx-auto py-6 px-4">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">티타임 관리</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">골프장 티타임을 등록하고 관리하세요</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              {/* 뷰 모드 토글 */}
              <div className="flex border rounded-md overflow-hidden">
                <Button
                  onClick={() => setViewMode('list')}
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-none"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => setViewMode('calendar')}
                  variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-none"
                >
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>

              {viewMode === 'list' && (
                <Button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  variant="outline"
                  className="flex-1 sm:flex-none"
                  size="sm"
                >
                  <ArrowUpDown className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">
                    {sortOrder === 'asc' ? '빠른 날짜순' : '늦은 날짜순'}
                  </span>
                </Button>
              )}

              <Button onClick={() => setIsFormOpen(true)} className="flex-1 sm:flex-none" size="sm">
                <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                티타임 등록
              </Button>
            </div>
          </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      ) : viewMode === 'list' ? (
        <TeeTimeList
          teeTimes={teeTimes || []}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onManageBookings={handleManageBookings}
        />
      ) : (
        <CalendarView
          teeTimes={teeTimes || []}
          onTeeTimeClick={handleManageBookings}
        />
      )}

          <TeeTimeForm
            open={isFormOpen}
            onClose={handleFormClose}
            teeTime={editingTeeTime}
          />

          <TeeTimeBookingsModal
            open={isBookingsModalOpen}
            onClose={handleBookingsModalClose}
            teeTime={selectedTeeTime}
          />
        </div>
      </div>
    </>
  )
}
