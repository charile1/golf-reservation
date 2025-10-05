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
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as unknown as BookingWithTeeTime[]
    },
  })

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">예약 관리</h1>
              <p className="text-gray-600 mt-1">고객 예약을 관리하고 입금을 확인하세요</p>
            </div>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              예약 등록
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          ) : (
            <BookingList
              bookings={bookings || []}
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
