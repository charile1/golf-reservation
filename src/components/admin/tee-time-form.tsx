'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
import type { TeeTime } from '@/types/database'

interface TeeTimeFormProps {
  open: boolean
  onClose: () => void
  teeTime?: TeeTime | null
}

export default function TeeTimeForm({ open, onClose, teeTime }: TeeTimeFormProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    course_name: '오션비치리조트',
    green_fee: '',
    onsite_payment: '',
    slots_total: '4',
    status: 'AVAILABLE' as const,
  })

  useEffect(() => {
    if (teeTime) {
      setFormData({
        date: teeTime.date,
        time: teeTime.time,
        course_name: teeTime.course_name,
        green_fee: teeTime.green_fee.toString(),
        onsite_payment: teeTime.onsite_payment?.toString() || '0',
        slots_total: teeTime.slots_total.toString(),
        status: teeTime.status,
      })
    } else {
      setFormData({
        date: '',
        time: '',
        course_name: '오션비치리조트',
        green_fee: '',
        onsite_payment: '0',
        slots_total: '4',
        status: 'AVAILABLE',
      })
    }
  }, [teeTime, open])

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        date: data.date,
        time: data.time,
        course_name: data.course_name,
        green_fee: parseInt(data.green_fee),
        onsite_payment: parseInt(data.onsite_payment) || 0,
        slots_total: parseInt(data.slots_total),
        status: data.status,
      }

      if (teeTime) {
        const { error } = await supabase
          .from('tee_time')
          .update(payload)
          .eq('id', teeTime.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('tee_time').insert([payload])
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teeTimes'] })
      toast({
        title: teeTime ? '수정 완료' : '등록 완료',
        description: teeTime
          ? '티타임이 수정되었습니다.'
          : '티타임이 등록되었습니다.',
      })
      onClose()
    },
    onError: (error) => {
      toast({
        title: '오류',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{teeTime ? '티타임 수정' : '티타임 등록'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date">날짜</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="time">시간</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="course_name">골프장명</Label>
            <Select
              value={formData.course_name}
              onValueChange={(value) =>
                setFormData({ ...formData, course_name: value })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="오션비치리조트">오션비치리조트</SelectItem>
                <SelectItem value="오션힐스포항">오션힐스포항</SelectItem>
                <SelectItem value="오션힐스영천">오션힐스영천</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="green_fee">그린피 (원)</Label>
            <Input
              id="green_fee"
              type="number"
              value={formData.green_fee}
              onChange={(e) =>
                setFormData({ ...formData, green_fee: e.target.value })
              }
              placeholder="150000"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="onsite_payment">현장 결제 (원)</Label>
            <Input
              id="onsite_payment"
              type="number"
              value={formData.onsite_payment}
              onChange={(e) =>
                setFormData({ ...formData, onsite_payment: e.target.value })
              }
              placeholder="0"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              카트비, 캐디피 등 현장에서 결제할 금액
            </p>
          </div>

          <div>
            <Label htmlFor="slots_total">총 인원</Label>
            <Select
              value={formData.slots_total}
              onValueChange={(value) =>
                setFormData({ ...formData, slots_total: value })
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
            <Label htmlFor="status">상태</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AVAILABLE">등록</SelectItem>
                <SelectItem value="JOINING">조인모집</SelectItem>
                <SelectItem value="CONFIRMED">확정</SelectItem>
                <SelectItem value="CANCELED">취소</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? '저장 중...' : '저장'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
