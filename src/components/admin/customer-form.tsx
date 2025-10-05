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
import { useToast } from '@/components/ui/use-toast'
import type { Customer } from '@/types/database'

interface CustomerFormProps {
  open: boolean
  onClose: () => void
  customer?: Customer | null
}

export default function CustomerForm({ open, onClose, customer }: CustomerFormProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    memo: '',
  })

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        memo: customer.memo || '',
      })
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        memo: '',
      })
    }
  }, [customer, open])

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        memo: data.memo || null,
      }

      if (customer) {
        const { error } = await supabase
          .from('customer')
          .update(payload)
          .eq('id', customer.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('customer').insert([payload])
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast({
        title: customer ? '수정 완료' : '등록 완료',
        description: customer
          ? '고객 정보가 수정되었습니다.'
          : '고객이 등록되었습니다.',
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
          <DialogTitle>{customer ? '고객 수정' : '고객 등록'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">고객명 *</Label>
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
            <Label htmlFor="phone">연락처 *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="010-1234-5678"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="example@email.com"
              className="mt-1"
            />
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
