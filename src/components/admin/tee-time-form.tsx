"use client"

import { useEffect, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import type { TeeTime } from "@/types/database"

interface TeeTimeFormProps {
  open: boolean
  onClose: () => void
  teeTime?: TeeTime | null
}

export default function TeeTimeForm({
  open,
  onClose,
  teeTime,
}: TeeTimeFormProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const supabase = createClient()

  const [formData, setFormData] = useState<{
    date: string
    time: string
    course_name: string
    course: string
    booker_name: string
    green_fee: string
    onsite_payment: string
    slots_total: string
    status: "AVAILABLE" | "JOINING" | "CONFIRMED" | "CANCELED"
  }>({
    date: "",
    time: "",
    course_name: "오션비치리조트",
    course: "OCEAN",
    booker_name: "박광로",
    green_fee: "",
    onsite_payment: "",
    slots_total: "4",
    status: "AVAILABLE",
  })

  useEffect(() => {
    if (teeTime) {
      setFormData({
        date: teeTime.date,
        time: teeTime.time,
        course_name: teeTime.course_name,
        course: (teeTime as any).course || "OCEAN",
        booker_name: (teeTime as any).booker_name || "박광로",
        green_fee: teeTime.green_fee.toString(),
        onsite_payment: teeTime.onsite_payment?.toString() || "0",
        slots_total: teeTime.slots_total.toString(),
        status: teeTime.status,
      })
    } else {
      const now = new Date()
      const today = now.toISOString().split("T")[0]
      const currentTime = now.toTimeString().slice(0, 5)

      setFormData({
        date: today,
        time: currentTime,
        course_name: "오션비치리조트",
        course: "OCEAN",
        booker_name: "박광로",
        green_fee: "",
        onsite_payment: "0",
        slots_total: "4",
        status: "AVAILABLE",
      })
    }
  }, [teeTime, open])

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        date: data.date,
        time: data.time,
        course_name: data.course_name,
        course: data.course,
        booker_name: data.booker_name,
        green_fee: parseInt(data.green_fee),
        onsite_payment: parseInt(data.onsite_payment) || 0,
        slots_total: parseInt(data.slots_total),
        revenue_type: 'standard',  // 기본값으로 설정
        cost_price: 0,  // 기본값 0
        status: data.status,
      }

      if (teeTime) {
        const { error } = await supabase
          .from("tee_time")
          .update(payload)
          .eq("id", teeTime.id)
        if (error) throw error
      } else {
        // 생성자 정보 가져오기
        const {
          data: { user },
        } = await supabase.auth.getUser()

        let userName = null
        if (user?.id) {
          // admin_user 테이블에서 이름 조회
          const { data: adminUser } = await supabase
            .from("admin_user")
            .select("name")
            .eq("id", user.id)
            .single()

          if (adminUser?.name) {
            userName = adminUser.name
          } else {
            // 없으면 이메일 사용
            userName = user.email?.split("@")[0] || null
          }
        }

        const { error } = await supabase.from("tee_time").insert([
          {
            ...payload,
            created_by: userName,
          },
        ])
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teeTimes"] })
      toast({
        title: teeTime ? "수정 완료" : "등록 완료",
        description: teeTime
          ? "티타임이 수정되었습니다."
          : "티타임이 등록되었습니다.",
      })
      onClose()
    },
    onError: (error) => {
      toast({
        title: "오류",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>{teeTime ? "티타임 수정" : "티타임 등록"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 골프장명 & 상태 */}
          <div className="grid grid-cols-2 gap-3">
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
                  <SelectItem value="AVAILABLE">예약 대기</SelectItem>
                  <SelectItem value="JOINING">조인 모집 중</SelectItem>
                  <SelectItem value="CONFIRMED">마감</SelectItem>
                  <SelectItem value="CANCELED">취소</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 예약자명 & 코스 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="booker_name">예약자명</Label>
              <Select
                value={formData.booker_name}
                onValueChange={(value) =>
                  setFormData({ ...formData, booker_name: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="박광로">박광로</SelectItem>
                  <SelectItem value="윤미라">윤미라</SelectItem>
                  <SelectItem value="박경서">박경서</SelectItem>
                  <SelectItem value="박건빈">박건빈</SelectItem>
                  <SelectItem value="윤태경">윤태경</SelectItem>
                  <SelectItem value="박영기">박영기</SelectItem>
                  <SelectItem value="백수예">백수예</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.course_name === "오션비치리조트" && (
              <div>
                <Label htmlFor="course">코스</Label>
                <Select
                  value={formData.course}
                  onValueChange={(value) =>
                    setFormData({ ...formData, course: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OCEAN">OCEAN</SelectItem>
                    <SelectItem value="VALLEY">VALLEY</SelectItem>
                    <SelectItem value="BEACH">BEACH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* 날짜 & 시간 */}
          <div className="grid grid-cols-2 gap-3">
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
              {formData.date && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(formData.date + 'T00:00:00').toLocaleDateString('ko-KR', {
                    weekday: 'short',
                    month: 'numeric',
                    day: 'numeric'
                  })}
                </p>
              )}
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
          </div>

          {/* 인원수 */}
          <div>
            <Label htmlFor="slots_total">인원수</Label>
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

          {/* 선입금 & 현장결제 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="green_fee">선입금 (원)</Label>
              <Input
                id="green_fee"
                type="number"
                value={formData.green_fee}
                onChange={(e) =>
                  setFormData({ ...formData, green_fee: e.target.value })
                }
                placeholder="0"
                required
                className="mt-1"
              />
              <div className="flex gap-1 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => {
                    const current = parseInt(formData.green_fee) || 0
                    setFormData({ ...formData, green_fee: (current + 10000).toString() })
                  }}
                >
                  10,000
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => {
                    const current = parseInt(formData.green_fee) || 0
                    setFormData({ ...formData, green_fee: (current + 15000).toString() })
                  }}
                >
                  15,000
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => {
                    const current = parseInt(formData.green_fee) || 0
                    setFormData({ ...formData, green_fee: (current + 20000).toString() })
                  }}
                >
                  20,000
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="onsite_payment">현장결제 (원)</Label>
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
              <div className="flex gap-1 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => {
                    const current = parseInt(formData.onsite_payment) || 0
                    setFormData({ ...formData, onsite_payment: (current + 92500).toString() })
                  }}
                >
                  92,500
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => {
                    const current = parseInt(formData.onsite_payment) || 0
                    setFormData({ ...formData, onsite_payment: (current + 102500).toString() })
                  }}
                >
                  102,500
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "저장 중..." : "저장"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
