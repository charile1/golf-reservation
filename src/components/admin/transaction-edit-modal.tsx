'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Transaction } from '@/types/database'
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface TransactionEditModalProps {
  open: boolean
  onClose: () => void
  transaction: Transaction | null
}

export default function TransactionEditModal({
  open,
  onClose,
  transaction,
}: TransactionEditModalProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    status: 'pending',
    memo: '',
  })

  useEffect(() => {
    if (transaction) {
      setFormData({
        status: transaction.status,
        memo: transaction.memo || '',
      })
    }
  }, [transaction])

  const updateMutation = useMutation({
    mutationFn: async (data: { status: string; memo: string }) => {
      if (!transaction) throw new Error('Transaction not found')

      const updateData: any = {
        status: data.status,
        memo: data.memo,
        updated_at: new Date().toISOString(),
      }

      // 정산완료로 변경하는 경우 settled_at 설정
      if (data.status === 'settled' && transaction.status !== 'settled') {
        updateData.settled_at = new Date().toISOString()
      }

      // 정산완료에서 다른 상태로 변경하는 경우 settled_at 제거
      if (data.status !== 'settled' && transaction.status === 'settled') {
        updateData.settled_at = null
      }

      const { error } = await supabase
        .from('transaction')
        .update(updateData)
        .eq('id', transaction.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast({
        title: '거래 내역이 수정되었습니다',
      })
      onClose()
    },
    onError: (error) => {
      console.error('거래 내역 수정 실패:', error)
      toast({
        title: '거래 내역 수정 실패',
        description: '다시 시도해주세요',
        variant: 'destructive',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  if (!transaction) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getRevenueTypeText = (type: string) => {
    switch (type) {
      case 'standard':
        return '일반'
      case 'package':
        return '패키지'
      case 'buyout':
        return '선매입'
      default:
        return type
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>거래 내역 상세</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-900">기본 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-600">플레이 날짜</Label>
                <p className="text-sm font-medium mt-1">
                  {formatDate(transaction.play_date)}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-600">예약 날짜</Label>
                <p className="text-sm font-medium mt-1">
                  {formatDate(transaction.booking_date)}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-600">골프장</Label>
                <p className="text-sm font-medium mt-1">{transaction.course_name}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-600">수익 모델</Label>
                <p className="text-sm font-medium mt-1">
                  {getRevenueTypeText(transaction.revenue_type)}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-600">인원</Label>
                <p className="text-sm font-medium mt-1">{transaction.people_count}명</p>
              </div>
            </div>
          </div>

          {/* 금액 정보 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-900">금액 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-600">선입금</Label>
                <p className="text-lg font-bold text-blue-600 mt-1">
                  {transaction.prepayment.toLocaleString()}원
                </p>
                <p className="text-xs text-gray-500">실제 받은 금액</p>
              </div>
              <div>
                <Label className="text-xs text-gray-600">현장결제</Label>
                <p className="text-sm font-medium mt-1">
                  {transaction.onsite_payment.toLocaleString()}원
                </p>
                <p className="text-xs text-gray-500">골프장 결제</p>
              </div>
            </div>
          </div>

          {/* 수정 가능한 필드 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-900">수정</h3>

            <div>
              <Label htmlFor="status">상태</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full mt-1 border rounded-md px-3 py-2 text-sm"
              >
                <option value="pending">대기</option>
                <option value="confirmed">확정</option>
                <option value="settled">정산완료</option>
                <option value="canceled">취소</option>
              </select>
            </div>

            <div>
              <Label htmlFor="memo">메모</Label>
              <Textarea
                id="memo"
                value={formData.memo}
                onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
