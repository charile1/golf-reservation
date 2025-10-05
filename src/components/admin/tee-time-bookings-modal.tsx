'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Trash2, Plus } from 'lucide-react'
import type { TeeTime, Booking, Customer } from '@/types/database'
import { formatCurrency } from '@/lib/utils'

interface TeeTimeBookingsModalProps {
  open: boolean
  onClose: () => void
  teeTime: TeeTime | null
}

export default function TeeTimeBookingsModal({
  open,
  onClose,
  teeTime,
}: TeeTimeBookingsModalProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const supabase = createClient()

  const [showAddForm, setShowAddForm] = useState(false)
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('existing')
  const [formData, setFormData] = useState({
    customer_id: '',
    name: '',
    phone: '',
    people_count: '1',
    memo: '',
  })

  // Fetch bookings for this tee time
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['teeTimeBookings', teeTime?.id],
    queryFn: async () => {
      if (!teeTime) return []
      const { data, error } = await supabase
        .from('booking')
        .select(`
          *,
          customer:customer_id (*)
        `)
        .eq('tee_time_id', teeTime.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as (Booking & { customer: Customer | null })[]
    },
    enabled: open && !!teeTime,
  })

  // Fetch customers
  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      return data as Customer[]
    },
    enabled: open,
  })

  useEffect(() => {
    if (open) {
      setShowAddForm(false)
      setFormData({
        customer_id: '',
        name: '',
        phone: '',
        people_count: '1',
        memo: '',
      })
    }
  }, [open])

  // Handle customer selection
  const handleCustomerChange = (customerId: string) => {
    const customer = customers?.find(c => c.id === customerId)
    if (customer) {
      setFormData({
        ...formData,
        customer_id: customerId,
        name: customer.name,
        phone: customer.phone,
      })
    }
  }

  // Add booking mutation
  const addMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!teeTime) return

      const payload = {
        tee_time_id: teeTime.id,
        customer_id: customerMode === 'existing' ? data.customer_id || null : null,
        name: data.name,
        phone: data.phone,
        people_count: parseInt(data.people_count),
        status: 'PENDING' as const,
        memo: data.memo || null,
      }

      const { error } = await supabase.from('booking').insert([payload])
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teeTimeBookings', teeTime?.id] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['teeTimes'] })
      toast({
        title: '등록 완료',
        description: '예약이 등록되었습니다.',
      })
      setShowAddForm(false)
      setFormData({
        customer_id: '',
        name: '',
        phone: '',
        people_count: '1',
        memo: '',
      })
    },
    onError: (error) => {
      toast({
        title: '오류',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // Delete booking mutation
  const deleteMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase.from('booking').delete().eq('id', bookingId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teeTimeBookings', teeTime?.id] })
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addMutation.mutate(formData)
  }

  const handleDelete = (bookingId: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deleteMutation.mutate(bookingId)
    }
  }

  if (!teeTime) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            예약 관리 - {teeTime.course_name} ({teeTime.date} {teeTime.time})
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            그린피: {formatCurrency(teeTime.green_fee)} | 예약현황: {teeTime.slots_booked}/{teeTime.slots_total}명
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* 예약 목록 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">현재 예약</h3>
              {!showAddForm && (
                <Button onClick={() => setShowAddForm(true)} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  예약 추가
                </Button>
              )}
            </div>

            {isLoading ? (
              <p className="text-gray-500 text-sm">로딩 중...</p>
            ) : bookings && bookings.length > 0 ? (
              <div className="space-y-2">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{booking.name}</div>
                      <div className="text-sm text-gray-600">
                        {booking.phone} | {booking.people_count}명
                        {booking.customer && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            등록고객
                          </span>
                        )}
                      </div>
                      {booking.memo && (
                        <div className="text-xs text-gray-500 mt-1">{booking.memo}</div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(booking.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">예약이 없습니다.</p>
            )}
          </div>

          {/* 예약 추가 폼 */}
          {showAddForm && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">예약 추가</h3>
                <Button onClick={() => setShowAddForm(false)} variant="ghost" size="sm">
                  취소
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={customerMode === 'existing' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCustomerMode('existing')}
                      className="flex-1"
                    >
                      기존 고객
                    </Button>
                    <Button
                      type="button"
                      variant={customerMode === 'new' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCustomerMode('new')}
                      className="flex-1"
                    >
                      신규 고객
                    </Button>
                  </div>
                </div>

                {customerMode === 'existing' ? (
                  <div>
                    <Label htmlFor="customer_id">고객 선택</Label>
                    <Select
                      value={formData.customer_id}
                      onValueChange={handleCustomerChange}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="고객을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers?.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} ({customer.phone})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="name">예약자명</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="홍길동"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">연락처</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="010-1234-5678"
                        required
                        className="mt-1"
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="people_count">인원</Label>
                  <Select
                    value={formData.people_count}
                    onValueChange={(value) =>
                      setFormData({ ...formData, people_count: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1명</SelectItem>
                      <SelectItem value="2">2명</SelectItem>
                      <SelectItem value="3">3명</SelectItem>
                      <SelectItem value="4">4명</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="memo">메모</Label>
                  <Input
                    id="memo"
                    value={formData.memo}
                    onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                    placeholder="특이사항 입력"
                    className="mt-1"
                  />
                </div>

                <Button type="submit" disabled={addMutation.isPending} className="w-full">
                  {addMutation.isPending ? '등록 중...' : '예약 추가'}
                </Button>
              </form>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
