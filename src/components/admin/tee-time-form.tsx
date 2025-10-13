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
        revenue_type: "standard", // 기본값으로 설정
        cost_price: 0, // 기본값 0
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
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teeTimes"] })

      const dateStr = new Date(variables.date).toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      })

      toast({
        title: teeTime ? "수정 완료" : "등록 완료",
        description: teeTime
          ? `${dateStr} ${variables.time} ${variables.course_name} 티타임이 수정되었습니다.`
          : `${dateStr} ${variables.time} ${variables.course_name} ${variables.booker_name} 티타임이 등록되었습니다.`,
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
              <Input
                id="booker_name"
                value={formData.booker_name}
                onChange={(e) =>
                  setFormData({ ...formData, booker_name: e.target.value })
                }
                placeholder="예약자명 입력"
                className="mt-1"
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {['박광로', '윤미라', '박경서', '박건빈', '윤태경', '박영기', '백수예', '김도엽', '서인애', '김종원', '이정수', '장진선', '박병하'].map((name) => (
                  <Button
                    key={name}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs px-2 py-1 h-auto"
                    onClick={() => setFormData({ ...formData, booker_name: name })}
                  >
                    {name}
                  </Button>
                ))}
              </div>
            </div>

            {formData.course_name === "오션비치리조트" && (
              <div>
                <Label htmlFor="course">코스</Label>
                <Input
                  id="course"
                  value={formData.course}
                  onChange={(e) =>
                    setFormData({ ...formData, course: e.target.value })
                  }
                  placeholder="코스 입력"
                  className="mt-1"
                />
                <div className="flex gap-1 mt-2">
                  {['OCEAN', 'VALLEY', 'BEACH'].map((course) => (
                    <Button
                      key={course}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs px-2 py-1 h-auto flex-1"
                      onClick={() => setFormData({ ...formData, course })}
                    >
                      {course}
                    </Button>
                  ))}
                </div>
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
                  {new Date(formData.date + "T00:00:00").toLocaleDateString(
                    "ko-KR",
                    {
                      weekday: "short",
                      month: "numeric",
                      day: "numeric",
                    }
                  )}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="time">시간</Label>
              <div className="flex gap-2 mt-1">
                <Select
                  value={formData.time.split(':')[0] || '06'}
                  onValueChange={(hour) => {
                    const minute = formData.time.split(':')[1] || '00'
                    setFormData({ ...formData, time: `${hour}:${minute}` })
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="시" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0')
                      return (
                        <SelectItem key={hour} value={hour}>
                          {hour}시
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                <Select
                  value={formData.time.split(':')[1] || '00'}
                  onValueChange={(minute) => {
                    const hour = formData.time.split(':')[0] || '06'
                    setFormData({ ...formData, time: `${hour}:${minute}` })
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="분" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {Array.from({ length: 60 }, (_, i) => {
                      const minute = i.toString().padStart(2, '0')
                      return (
                        <SelectItem key={minute} value={minute}>
                          {minute}분
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
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
          <div className="space-y-3">
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
                    setFormData({
                      ...formData,
                      green_fee: (current + 10000).toString(),
                    })
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
                    setFormData({
                      ...formData,
                      green_fee: (current + 15000).toString(),
                    })
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
                    setFormData({
                      ...formData,
                      green_fee: (current + 20000).toString(),
                    })
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
                    setFormData({
                      ...formData,
                      onsite_payment: (current + 92500).toString(),
                    })
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
                    setFormData({
                      ...formData,
                      onsite_payment: (current + 102500).toString(),
                    })
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
