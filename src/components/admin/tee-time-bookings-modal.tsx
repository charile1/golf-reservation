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
    booking_type: 'JOIN' as 'TRANSFER' | 'JOIN',
    people_count: 1,
    companion_names: [''],
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
        booking_type: 'JOIN',
        people_count: 1,
        companion_names: [''],
        memo: '',
      })
    }
  }, [open])

  // 예약 타입 변경 시 처리
  const handleBookingTypeChange = (type: 'TRANSFER' | 'JOIN') => {
    if (type === 'TRANSFER' && teeTime) {
      // 양도인 경우 전체 인원으로 설정
      const count = teeTime.slots_total
      const newCompanionNames = Array(count).fill('').map((_, idx) =>
        formData.companion_names[idx] || (idx === 0 ? formData.name : '')
      )
      setFormData({
        ...formData,
        booking_type: type,
        people_count: count,
        companion_names: newCompanionNames,
      })
    } else {
      // 조인인 경우
      setFormData({
        ...formData,
        booking_type: type,
      })
    }
  }

  // 인원수 변경 시 companion_names 배열 크기 조정
  const handlePeopleCountChange = (count: number) => {
    const newCompanionNames = Array(count).fill('').map((_, idx) =>
      formData.companion_names[idx] || ''
    )
    setFormData({
      ...formData,
      people_count: count,
      companion_names: newCompanionNames,
    })
  }

  // 동반자 이름 변경
  const handleCompanionNameChange = (index: number, value: string) => {
    const newCompanionNames = [...formData.companion_names]
    newCompanionNames[index] = value
    setFormData({
      ...formData,
      companion_names: newCompanionNames,
    })
  }

  // Handle customer selection
  const handleCustomerChange = (customerId: string) => {
    const customer = customers?.find(c => c.id === customerId)
    if (customer) {
      const newCompanionNames = [...formData.companion_names]
      newCompanionNames[0] = customer.name
      setFormData({
        ...formData,
        customer_id: customerId,
        name: customer.name,
        phone: customer.phone,
        companion_names: newCompanionNames,
      })
    }
  }

  // Add booking mutation
  const addMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!teeTime) return

      // 모든 고객명이 입력되었는지 확인
      const hasEmptyNames = data.companion_names.some(name => !name.trim())
      if (hasEmptyNames) {
        throw new Error('모든 고객명을 입력해주세요.')
      }

      const payload = {
        tee_time_id: teeTime.id,
        customer_id: customerMode === 'existing' ? data.customer_id || null : null,
        name: data.name,
        phone: data.phone,
        booking_type: data.booking_type,
        people_count: data.people_count,
        companion_names: data.companion_names,
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
        booking_type: 'JOIN',
        people_count: 1,
        companion_names: [''],
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
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{booking.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          booking.booking_type === 'TRANSFER'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {booking.booking_type === 'TRANSFER' ? '양도' : '조인'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {booking.phone} | {booking.people_count}명
                        {booking.customer && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            등록고객
                          </span>
                        )}
                      </div>
                      {booking.companion_names && booking.companion_names.length > 0 && (
                        <div className="text-sm text-gray-700 mt-1">
                          <span className="font-medium">고객명:</span>{' '}
                          {booking.companion_names.join(', ')}
                        </div>
                      )}
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
                  <Label>예약 타입</Label>
                  <div className="flex gap-2 mt-1">
                    <Button
                      type="button"
                      variant={formData.booking_type === 'JOIN' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleBookingTypeChange('JOIN')}
                      className="flex-1"
                    >
                      조인
                    </Button>
                    <Button
                      type="button"
                      variant={formData.booking_type === 'TRANSFER' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleBookingTypeChange('TRANSFER')}
                      className="flex-1"
                    >
                      양도
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.booking_type === 'TRANSFER'
                      ? '양도: 전체 인원을 대표자가 가져갑니다'
                      : '조인: 일부 인원만 예약합니다'}
                  </p>
                </div>

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
                      <Label htmlFor="name">예약자명 (대표)</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => {
                          const newName = e.target.value
                          const newCompanionNames = [...formData.companion_names]
                          newCompanionNames[0] = newName
                          setFormData({
                            ...formData,
                            name: newName,
                            companion_names: newCompanionNames,
                          })
                        }}
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
                    value={formData.people_count.toString()}
                    onValueChange={(value) => handlePeopleCountChange(parseInt(value))}
                    disabled={formData.booking_type === 'TRANSFER'}
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
                  {formData.booking_type === 'TRANSFER' && (
                    <p className="text-xs text-gray-500 mt-1">
                      양도는 전체 {teeTime?.slots_total}명으로 자동 설정됩니다
                    </p>
                  )}
                </div>

                <div>
                  <Label>고객명 ({formData.people_count}명)</Label>
                  <div className="space-y-2 mt-1">
                    {formData.companion_names.map((name, index) => (
                      <Input
                        key={index}
                        value={name}
                        onChange={(e) => handleCompanionNameChange(index, e.target.value)}
                        placeholder={`${index + 1}번째 고객 이름`}
                        required
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    모든 고객명을 입력해주세요. 골프장에 전달됩니다.
                  </p>
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
