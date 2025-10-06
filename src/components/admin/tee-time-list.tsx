import { Edit, Trash2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDateWithDay, formatCurrency } from "@/lib/utils"
import type { TeeTime } from "@/types/database"

interface TeeTimeListProps {
  teeTimes: (TeeTime & { slots_pending?: number })[]
  onEdit: (teeTime: TeeTime) => void
  onDelete: (id: string) => void
  onManageBookings: (teeTime: TeeTime) => void
}

const statusColors = {
  AVAILABLE: "bg-gray-100 text-gray-800",
  JOINING: "bg-orange-100 text-orange-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELED: "bg-red-100 text-red-800",
}

const statusLabels = {
  AVAILABLE: "예약 대기",
  JOINING: "조인 모집 중",
  CONFIRMED: "마감",
  CANCELED: "취소",
}

export default function TeeTimeList({
  teeTimes,
  onEdit,
  onDelete,
  onManageBookings,
}: TeeTimeListProps) {
  if (teeTimes.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <p className="text-gray-500">등록된 티타임이 없습니다.</p>
      </div>
    )
  }

  // 날짜별로 그룹화
  const groupedByDate = teeTimes.reduce((groups, teeTime) => {
    const date = teeTime.date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(teeTime)
    return groups
  }, {} as Record<string, TeeTime[]>)

  return (
    <div className="space-y-6">
      {Object.entries(groupedByDate).map(([date, times]) => (
        <div key={date} className="bg-white rounded-lg shadow overflow-hidden">
          {/* 날짜 헤더 */}
          <div className="bg-gray-50 px-6 py-3 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              {formatDateWithDay(date)}
            </h3>
          </div>

          {/* 티타임 목록 */}
          <div className="divide-y divide-gray-200">
            {times.map((teeTime) => (
              <div
                key={teeTime.id}
                className="px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                {/* 데스크톱 레이아웃 */}
                <div className="hidden md:flex items-center justify-between gap-4">
                  {/* 시간 (강조) */}
                  <div className="flex-shrink-0">
                    <div className="text-3xl font-bold text-gray-900">
                      {teeTime.time}
                    </div>
                  </div>

                  {/* 골프장 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-semibold text-gray-900">
                      {teeTime.course_name}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      선입금: {formatCurrency(teeTime.green_fee)}
                      {teeTime.onsite_payment > 0 && (
                        <span className="ml-2 text-gray-500">
                          | 현장결제: {formatCurrency(teeTime.onsite_payment)}
                        </span>
                      )}
                    </div>
                    {(teeTime as any).booker_name && (
                      <div className="text-sm text-gray-700 mt-1">
                        예약자: {(teeTime as any).booker_name}
                      </div>
                    )}
                    {teeTime.created_by && (
                      <div className="text-xs text-gray-500 mt-1">
                        생성자: {teeTime.created_by}
                      </div>
                    )}
                  </div>

                  {/* 예약현황 */}
                  <div className="flex-shrink-0 text-center min-w-[120px]">
                    <div className="text-sm text-gray-500 mb-1">예약현황</div>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-2xl font-bold text-green-600">
                        {teeTime.slots_booked}
                      </span>
                      {teeTime.slots_pending ? (
                        <span className="text-lg font-semibold text-yellow-600">
                          +{teeTime.slots_pending}
                        </span>
                      ) : null}
                      <span className="text-lg text-gray-400">/</span>
                      <span className="text-lg text-gray-600">
                        {teeTime.slots_total}
                      </span>
                      <span className="text-xs text-gray-500">명</span>
                    </div>
                    {teeTime.slots_pending ? (
                      <div className="text-xs text-yellow-600 mt-1">
                        대기 {teeTime.slots_pending}명
                      </div>
                    ) : null}
                  </div>

                  {/* 상태 */}
                  <div className="flex-shrink-0">
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-full ${
                        statusColors[teeTime.status]
                      }`}
                    >
                      {statusLabels[teeTime.status]}
                    </span>
                  </div>

                  {/* 작업 버튼 */}
                  <div className="flex-shrink-0 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onManageBookings(teeTime)}
                      title="예약 관리"
                    >
                      <UserPlus className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(teeTime)}
                      title="수정"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(teeTime.id)}
                      title="삭제"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                {/* 모바일 레이아웃 */}
                <div className="md:hidden space-y-3">
                  {/* 상단: 시간과 상태 */}
                  <div className="flex items-start justify-between">
                    <div className="text-2xl font-bold text-gray-900">
                      {teeTime.time}
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        statusColors[teeTime.status]
                      }`}
                    >
                      {statusLabels[teeTime.status]}
                    </span>
                  </div>

                  {/* 골프장 정보 */}
                  <div>
                    <div className="text-base font-semibold text-gray-900">
                      {teeTime.course_name}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      선입금: {formatCurrency(teeTime.green_fee)}
                    </div>
                    {teeTime.onsite_payment > 0 && (
                      <div className="text-sm text-gray-500 mt-0.5">
                        현장결제: {formatCurrency(teeTime.onsite_payment)}
                      </div>
                    )}
                    {(teeTime as any).booker_name && (
                      <div className="text-sm text-gray-700 mt-1">
                        예약자: {(teeTime as any).booker_name}
                      </div>
                    )}
                    {teeTime.created_by && (
                      <div className="text-xs text-gray-500 mt-1">
                        생성자: {teeTime.created_by}
                      </div>
                    )}
                  </div>

                  {/* 예약현황 */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">예약현황</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-green-600">
                        {teeTime.slots_booked}
                      </span>
                      {teeTime.slots_pending ? (
                        <span className="text-base font-semibold text-yellow-600">
                          +{teeTime.slots_pending}
                        </span>
                      ) : null}
                      <span className="text-base text-gray-400">/</span>
                      <span className="text-base text-gray-600">
                        {teeTime.slots_total}
                      </span>
                      <span className="text-xs text-gray-500">명</span>
                    </div>
                  </div>
                  {teeTime.slots_pending ? (
                    <div className="text-xs text-yellow-600 text-right">
                      입금대기 {teeTime.slots_pending}명
                    </div>
                  ) : null}

                  {/* 작업 버튼 */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onManageBookings(teeTime)}
                      className="flex-1"
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      예약
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(teeTime)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(teeTime.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
