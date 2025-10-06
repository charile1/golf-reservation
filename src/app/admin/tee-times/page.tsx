"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Plus, ArrowUpDown, List, Calendar } from "lucide-react"
import TeeTimeForm from "@/components/admin/tee-time-form"
import TeeTimeList from "@/components/admin/tee-time-list"
import CalendarView from "@/components/admin/calendar-view"
import TeeTimeBookingsModal from "@/components/admin/tee-time-bookings-modal"
import AdminNav from "@/components/admin/admin-nav"
import type { TeeTime } from "@/types/database"
import { useRouter } from "next/navigation"

export default function TeeTimesPage() {
  const router = useRouter()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTeeTime, setEditingTeeTime] = useState<TeeTime | null>(null)
  const [isBookingsModalOpen, setIsBookingsModalOpen] = useState(false)
  const [selectedTeeTime, setSelectedTeeTime] = useState<TeeTime | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [viewMode, setViewMode] = useState<"list" | "calendar">("calendar")
  const [createdAtFilter, setCreatedAtFilter] = useState<
    "all" | "today" | "custom"
  >("all")
  const [customDate, setCustomDate] = useState<string>("")
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/admin/login")
      }
    }
    checkAuth()
  }, [router, supabase])

  // Fetch tee times with booking counts
  const { data: teeTimes, isLoading } = useQuery({
    queryKey: ["teeTimes", sortOrder, createdAtFilter, customDate, selectedMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tee_time")
        .select(
          `
          *,
          bookings:booking(people_count, status)
        `
        )
        .order("date", { ascending: sortOrder === "asc" })
        .order("time", { ascending: true })

      if (error) throw error

      // Calculate pending and confirmed counts
      const allTeeTimes = (data as any[]).map((teeTime) => {
        const confirmedCount =
          teeTime.bookings
            ?.filter((b: any) => b.status === "CONFIRMED")
            .reduce((sum: number, b: any) => sum + b.people_count, 0) || 0

        const pendingCount =
          teeTime.bookings
            ?.filter((b: any) => b.status === "PENDING")
            .reduce((sum: number, b: any) => sum + b.people_count, 0) || 0

        return {
          ...teeTime,
          slots_booked: confirmedCount,
          slots_pending: pendingCount,
        }
      }) as (TeeTime & { slots_pending: number })[]

      // 생성일 필터 적용
      let filteredTeeTimes = allTeeTimes
      if (createdAtFilter === "today") {
        const today = new Date().toISOString().split("T")[0]
        filteredTeeTimes = filteredTeeTimes.filter((t) => t.created_at.startsWith(today))
      } else if (createdAtFilter === "custom" && customDate) {
        filteredTeeTimes = filteredTeeTimes.filter((t) => t.created_at.startsWith(customDate))
      }

      // 월별 필터 적용
      if (selectedMonth) {
        filteredTeeTimes = filteredTeeTimes.filter((t) => t.date.startsWith(selectedMonth))
      }

      return filteredTeeTimes
    },
  })

  // 월별 옵션 생성 (현재 월 기준 ±6개월)
  const monthOptions = (() => {
    const options: string[] = []
    const now = new Date()

    for (let i = -6; i <= 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1)
      const yearMonth = date.toISOString().substring(0, 7)
      options.push(yearMonth)
    }

    return options.reverse()
  })()

  // 선택된 월이 없으면 현재 월 선택
  useEffect(() => {
    if (!selectedMonth) {
      const currentMonth = new Date().toISOString().substring(0, 7)
      setSelectedMonth(currentMonth)
    }
  }, [selectedMonth])

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tee_time").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teeTimes"] })
      toast({
        title: "삭제 완료",
        description: "티타임이 삭제되었습니다.",
      })
    },
    onError: (error) => {
      toast({
        title: "삭제 실패",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const handleEdit = (teeTime: TeeTime) => {
    setEditingTeeTime(teeTime)
    setIsFormOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      deleteMutation.mutate(id)
    }
  }

  const handleManageBookings = (teeTime: TeeTime) => {
    setSelectedTeeTime(teeTime)
    setIsBookingsModalOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingTeeTime(null)
  }

  const handleBookingsModalClose = () => {
    setIsBookingsModalOpen(false)
    setSelectedTeeTime(null)
  }

  return (
    <>
      <AdminNav />
      <div className="lg:ml-64">
        <div className="container mx-auto py-6 px-4">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                티타임 관리
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                골프장 티타임을 등록하고 관리하세요
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {viewMode === "list" && (
                <>
                  {/* 월별 필터 */}
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="border rounded-md px-3 py-2 text-sm bg-white"
                  >
                    {monthOptions.map((month) => {
                      const [year, monthNum] = month.split("-")
                      return (
                        <option key={month} value={month}>
                          {year}년 {parseInt(monthNum)}월
                        </option>
                      )
                    })}
                  </select>

                  {/* 생성일 필터 */}
                  <div className="flex gap-2">
                    <select
                      value={createdAtFilter}
                      onChange={(e) =>
                        setCreatedAtFilter(
                          e.target.value as "all" | "today" | "custom"
                        )
                      }
                      className="border rounded-md px-3 py-2 text-sm bg-white"
                    >
                      <option value="all">전체</option>
                      <option value="today">오늘 생성된 티</option>
                      <option value="custom">특정 날짜 선택</option>
                    </select>

                    {createdAtFilter === "custom" && (
                      <input
                        type="date"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        className="border rounded-md px-3 py-2 text-sm"
                      />
                    )}
                  </div>
                </>
              )}

              <div className="flex gap-2">
                {/* 뷰 모드 토글 */}
                <div className="flex border rounded-md overflow-hidden">
                  <Button
                    onClick={() => setViewMode("list")}
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    className="rounded-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => setViewMode("calendar")}
                    variant={viewMode === "calendar" ? "default" : "ghost"}
                    size="sm"
                    className="rounded-none"
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                </div>

                {viewMode === "list" && (
                  <Button
                    onClick={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                    variant="outline"
                    className="flex-1 sm:flex-none"
                    size="sm"
                  >
                    <ArrowUpDown className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">
                      {sortOrder === "asc" ? "빠른 날짜순" : "늦은 날짜순"}
                    </span>
                  </Button>
                )}

                <Button
                  onClick={() => setIsFormOpen(true)}
                  className="flex-1 sm:flex-none"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                  티타임 등록
                </Button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          ) : viewMode === "list" ? (
            <TeeTimeList
              teeTimes={teeTimes || []}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onManageBookings={handleManageBookings}
            />
          ) : (
            <CalendarView
              teeTimes={teeTimes || []}
              onTeeTimeClick={handleManageBookings}
            />
          )}

          <TeeTimeForm
            open={isFormOpen}
            onClose={handleFormClose}
            teeTime={editingTeeTime}
          />

          <TeeTimeBookingsModal
            open={isBookingsModalOpen}
            onClose={handleBookingsModalClose}
            teeTime={selectedTeeTime}
          />
        </div>
        </div>
      </div>
    </>
  )
}
