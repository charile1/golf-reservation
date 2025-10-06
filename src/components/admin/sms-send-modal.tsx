'use client'

import { useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import type { Customer, CustomerGroupType } from '@/types/database'

interface SmsSendModalProps {
  open: boolean
  onClose: () => void
  customers: Customer[]
  groupType: 'ALL' | CustomerGroupType
}

export default function SmsSendModal({
  open,
  onClose,
  customers,
  groupType,
}: SmsSendModalProps) {
  const { toast } = useToast()
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  const getGroupName = (type: 'ALL' | CustomerGroupType) => {
    switch (type) {
      case 'COUPLE':
        return '부부'
      case 'SINGLE':
        return '1인 조인'
      case 'NONE':
        return '미지정'
      default:
        return '전체'
    }
  }

  const handleSend = async () => {
    if (!message.trim()) {
      toast({
        title: '메시지를 입력해주세요',
        variant: 'destructive',
      })
      return
    }

    if (customers.length === 0) {
      toast({
        title: '발송할 고객이 없습니다',
        variant: 'destructive',
      })
      return
    }

    setIsSending(true)

    try {
      // TODO: SMS 발송 API 호출
      // 실제 SMS 발송 로직은 백엔드 API를 통해 구현해야 합니다
      // 예: await fetch('/api/sms/send', { method: 'POST', body: JSON.stringify({ customers, message }) })

      // 임시: 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1500))

      toast({
        title: '문자 발송 완료',
        description: `${customers.length}명에게 문자를 발송했습니다.`,
      })

      setMessage('')
      onClose()
    } catch (error) {
      console.error('SMS 발송 실패:', error)
      toast({
        title: '문자 발송 실패',
        description: '다시 시도해주세요',
        variant: 'destructive',
      })
    } finally {
      setIsSending(false)
    }
  }

  const messageLength = message.length
  const maxLength = 2000

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>단체 문자 발송</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 발송 대상 정보 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">발송 대상</span>
              <span className="text-sm text-gray-600">
                {getGroupName(groupType)} 그룹
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">총 인원</span>
              <span className="text-lg font-bold text-blue-600">
                {customers.length}명
              </span>
            </div>
          </div>

          {/* 수신자 목록 (미리보기) */}
          {customers.length > 0 && (
            <div>
              <Label className="text-sm text-gray-600 mb-2 block">수신자 목록</Label>
              <div className="max-h-32 overflow-y-auto border rounded-md p-3 bg-white">
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    className="text-xs text-gray-600 py-1 flex justify-between"
                  >
                    <span>{customer.name}</span>
                    <span className="text-gray-400">{customer.phone}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 메시지 입력 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="message">메시지 내용</Label>
              <span className="text-xs text-gray-500">
                {messageLength} / {maxLength}
              </span>
            </div>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="발송할 메시지를 입력하세요"
              rows={8}
              maxLength={maxLength}
              className="resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              * 실제 SMS 발송을 위해서는 문자 발송 서비스(예: 알리고, 카카오 알림톡 등)와 연동이 필요합니다.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            disabled={isSending || !message.trim() || customers.length === 0}
          >
            {isSending ? '발송 중...' : `${customers.length}명에게 발송`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
