'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Plus } from 'lucide-react'
import BookingForm from '@/components/admin/booking-form'
import BookingList from '@/components/admin/booking-list'
import AdminNav from '@/components/admin/admin-nav'
import type { BookingWithTeeTime } from '@/types/database'
import { useRouter } from 'next/navigation'

export default function BookingsPage() {
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
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingBooking, setEditingBooking] = useState<BookingWithTeeTime | null>(null)
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED'>('ALL')
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const supabase = createClient()

  // Fetch bookings with tee time info
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking')
        .select(`
          *,
          tee_time:tee_time_id (*)
        `)

      if (error) throw error

      // 티타임 날짜와 시간 기준으로 정렬
      const sorted = (data as unknown as BookingWithTeeTime[]).sort((a, b) => {
        const dateCompare = a.tee_time.date.localeCompare(b.tee_time.date)
        if (dateCompare !== 0) return dateCompare
        return a.tee_time.time.localeCompare(b.tee_time.time)
      })

      return sorted
    },
  })

  // 월별 옵션 추출
  const monthOptions = bookings
    ? Array.from(new Set(bookings.map(b => b.tee_time.date.substring(0, 7))))
        .sort()
        .reverse()
    : []

  // 선택된 월이 없으면 가장 최근 월 선택
  useEffect(() => {
    if (!selectedMonth && monthOptions.length > 0) {
      setSelectedMonth(monthOptions[0])
    }
  }, [monthOptions, selectedMonth])

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('booking').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['teeTimes'] })
      toast({
        title: '삭제 완료',
        description: '예약이 삭제되었습니다.',
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

  // Confirm payment mutation
  const confirmPaymentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('booking')
        .update({
          status: 'CONFIRMED',
          paid_at: new Date().toISOString(),
        })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['teeTimes'] })
      toast({
        title: '입금 확인 완료',
        description: '예약이 확정되었습니다.',
      })
    },
    onError: (error) => {
      toast({
        title: '입금 확인 실패',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const handleEdit = (booking: BookingWithTeeTime) => {
    setEditingBooking(booking)
    setIsFormOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleConfirmPayment = (id: string) => {
    if (confirm('입금을 확인하셨습니까?')) {
      confirmPaymentMutation.mutate(id)
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingBooking(null)
  }

  return (
    <>
      <AdminNav />
      <div className="container mx-auto py-6 px-4">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">예약 관리</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">고객 예약을 관리하고 입금을 확인하세요</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {/* 월별 선택 */}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm bg-white"
              >
                {monthOptions.map(month => {
                  const [year, monthNum] = month.split('-')
                  return (
                    <option key={month} value={month}>
                      {year}년 {parseInt(monthNum)}월
                    </option>
                  )
                })}
              </select>

              <div className="flex gap-2 w-full sm:w-auto">
              <div className="flex border rounded-md overflow-hidden flex-1 sm:flex-none">
                <Button
                  onClick={() => setStatusFilter('ALL')}
                  variant={statusFilter === 'ALL' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-none text-xs sm:text-sm"
                >
                  전체
                </Button>
                <Button
                  onClick={() => setStatusFilter('PENDING')}
                  variant={statusFilter === 'PENDING' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-none text-xs sm:text-sm"
                >
                  입금대기
                </Button>
                <Button
                  onClick={() => setStatusFilter('CONFIRMED')}
                  variant={statusFilter === 'CONFIRMED' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-none text-xs sm:text-sm"
                >
                  입금완료
                </Button>
              </div>
              <Button onClick={() => setIsFormOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                예약 등록
              </Button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          ) : (
            <BookingList
              bookings={
                (statusFilter === 'ALL'
                  ? bookings || []
                  : (bookings || []).filter(b => b.status === statusFilter)
                ).filter(b => b.tee_time.date.startsWith(selectedMonth))
              }
              onEdit={handleEdit}
              onDelete={handleDelete}
              onConfirmPayment={handleConfirmPayment}
            />
          )}

          <BookingForm
            open={isFormOpen}
            onClose={handleFormClose}
            booking={editingBooking}
          />
        </div>
      </div>
    </>
  )
}
