"use client"

import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
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
import { Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { BookingWithTeeTime, TeeTime, Customer } from "@/types/database"

interface BookingFormProps {
  open: boolean
  onClose: () => void
  booking?: BookingWithTeeTime | null
}

export default function BookingForm({
  open,
  onClose,
  booking,
}: BookingFormProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const supabase = createClient()

  const [formData, setFormData] = useState<{
    tee_time_id: string
    customer_id: string
    name: string
    phone: string
    people_count: number
    companion_names: string[]
    payment_amount: string
    status: "PENDING" | "CONFIRMED" | "CANCELED"
    memo: string
  }>({
    tee_time_id: "",
    customer_id: "",
    name: "",
    phone: "",
    people_count: 0,
    companion_names: [],
    payment_amount: "",
    status: "PENDING",
    memo: "",
  })

  // Fetch available tee times
  const { data: teeTimes } = useQuery({
    queryKey: ["availableTeeTimes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tee_time")
        .select("*")
        .in("status", ["AVAILABLE", "JOINING"])
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true })
        .order("time", { ascending: true })

      if (error) throw error
      return data as TeeTime[]
    },
    enabled: open,
  })

  // Fetch customers
  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer")
        .select("*")
        .order("name", { ascending: true })

      if (error) throw error
      return data as Customer[]
    },
    enabled: open,
  })

  useEffect(() => {
    if (booking) {
      setFormData({
        tee_time_id: booking.tee_time_id,
        customer_id: booking.customer_id || "",
        name: booking.name,
        phone: booking.phone,
        people_count: booking.people_count,
        companion_names:
          booking.companion_names || Array(booking.people_count).fill(""),
        payment_amount: booking.payment_amount?.toString() || "0",
        status: booking.status,
        memo: booking.memo || "",
      })
    } else {
      setFormData({
        tee_time_id: "",
        customer_id: "",
        name: "",
        phone: "",
        people_count: 0,
        companion_names: [],
        payment_amount: "",
        status: "PENDING",
        memo: "",
      })
    }
  }, [booking, open])

  // 인원수 변경 시 companion_names 배열 크기 조정
  const handlePeopleCountChange = (count: number) => {
    const newCompanionNames = Array(count)
      .fill("")
      .map((_, idx) => formData.companion_names[idx] || "")
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

  // Handle customer selection - 고객 이름을 입력 필드에 추가
  const handleCustomerSelect = (customerId: string) => {
    const customer = customers?.find((c) => c.id === customerId)
    if (customer) {
      // 새로운 이름 추가
      const newCompanionNames = [...formData.companion_names, customer.name]
      setFormData({
        ...formData,
        customer_id: "",
        people_count: newCompanionNames.length,
        companion_names: newCompanionNames,
      })
    }
  }

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // 모든 고객명이 입력되었는지 확인
      const hasEmptyNames = data.companion_names.some((name) => !name.trim())
      if (hasEmptyNames) {
        throw new Error("모든 고객명을 입력해주세요.")
      }

      const payload = {
        tee_time_id: data.tee_time_id,
        customer_id: null,
        name: data.companion_names[0] || data.name, // 첫 번째 이름을 대표자로
        phone: data.phone || "미입력",
        people_count: data.people_count,
        companion_names: data.companion_names,
        payment_amount: parseInt(data.payment_amount) || 0,
        status: data.status,
        memo: data.memo || null,
        paid_at: data.status === "CONFIRMED" ? new Date().toISOString() : null,
      }

      if (booking) {
        // 예약 수정
        const { error } = await supabase
          .from("booking")
          .update(payload)
          .eq("id", booking.id)
        if (error) throw error

        // transaction도 함께 업데이트 (선입금 금액 동기화)
        const { error: txError } = await supabase
          .from("transaction")
          .update({
            prepayment: parseInt(data.payment_amount) || 0,
            updated_at: new Date().toISOString(),
          })
          .eq("booking_id", booking.id)

        // transaction이 없어도 에러로 처리하지 않음 (아직 생성 전일 수 있음)
        if (txError) {
          console.warn("Transaction update failed:", txError)
        }
      } else {
        const { error } = await supabase.from("booking").insert([payload])
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
      queryClient.invalidateQueries({ queryKey: ["teeTimes"] })
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
      toast({
        title: booking ? "수정 완료" : "등록 완료",
        description: booking
          ? "예약이 수정되었습니다."
          : "예약이 등록되었습니다.",
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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{booking ? "예약 수정" : "예약 등록"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="tee_time_id">티타임 선택</Label>
            <Select
              value={formData.tee_time_id}
              onValueChange={(value) =>
                setFormData({ ...formData, tee_time_id: value })
              }
              disabled={!!booking}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="티타임을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {teeTimes?.map((teeTime) => (
                  <SelectItem key={teeTime.id} value={teeTime.id}>
                    {teeTime.date} {teeTime.time} - {teeTime.course_name} (
                    {teeTime.slots_booked}/{teeTime.slots_total})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="customer_select">고객 선택</Label>
            <Select value="" onValueChange={handleCustomerSelect}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="고객을 선택하세요 (추가)" />
              </SelectTrigger>
              <SelectContent>
                {customers?.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} ({customer.phone})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              고객을 선택하면 목록에 추가됩니다
            </p>
          </div>

          <div>
            <Label>고객명 목록 ({formData.people_count}명)</Label>
            <div className="space-y-2 mt-1">
              {formData.companion_names.map((name, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={name}
                    onChange={(e) =>
                      handleCompanionNameChange(index, e.target.value)
                    }
                    placeholder={`${index + 1}번째 고객 이름`}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newNames = formData.companion_names.filter(
                        (_, i) => i !== index
                      )
                      setFormData({
                        ...formData,
                        people_count: newNames.length,
                        companion_names: newNames,
                      })
                    }}
                  >
                    삭제
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newNames = [...formData.companion_names, ""]
                  setFormData({
                    ...formData,
                    people_count: newNames.length,
                    companion_names: newNames,
                  })
                }}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-1" />
                고객 추가
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              모든 고객명을 입력해주세요. 골프장에 전달됩니다.
            </p>
          </div>

          <div>
            <Label htmlFor="phone">연락처 (선택)</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="010-1234-5678"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="payment_amount">선입금 금액 (원)</Label>
            <Input
              id="payment_amount"
              type="number"
              value={formData.payment_amount}
              onChange={(e) =>
                setFormData({ ...formData, payment_amount: e.target.value })
              }
              placeholder="0"
              required
              className="mt-1"
            />
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
                <SelectItem value="PENDING">입금대기</SelectItem>
                <SelectItem value="CONFIRMED">입금 확인</SelectItem>
                <SelectItem value="CANCELED">취소</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="memo">메모</Label>
            <Input
              id="memo"
              value={formData.memo}
              onChange={(e) =>
                setFormData({ ...formData, memo: e.target.value })
              }
              placeholder="특이사항 입력"
              className="mt-1"
            />
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
