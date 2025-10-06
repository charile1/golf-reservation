import { Edit, Trash2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDate, formatDateTime, formatDateWithDay } from "@/lib/utils"
import type { BookingWithTeeTime } from "@/types/database"

interface BookingListProps {
  bookings: BookingWithTeeTime[]
  onEdit: (booking: BookingWithTeeTime) => void
  onDelete: (id: string) => void
  onConfirmPayment: (id: string) => void
}

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELED: "bg-red-100 text-red-800",
}

const statusLabels = {
  PENDING: "입금대기",
  CONFIRMED: "확정",
  CANCELED: "취소",
}

export default function BookingList({
  bookings,
  onEdit,
  onDelete,
  onConfirmPayment,
}: BookingListProps) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <p className="text-gray-500">등록된 예약이 없습니다.</p>
      </div>
    )
  }

  // 날짜별로 그룹화
  const groupedByDate = bookings.reduce((groups, booking) => {
    const date = booking.tee_time.date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(booking)
    return groups
  }, {} as Record<string, BookingWithTeeTime[]>)

  return (
    <div className="space-y-6">
      {Object.entries(groupedByDate).map(([date, dateBookings]) => (
        <div key={date} className="bg-white rounded-lg shadow overflow-hidden">
          {/* 날짜 헤더 */}
          <div className="bg-gray-50 px-6 py-3 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              {formatDateWithDay(date)}
            </h3>
          </div>

          {/* 데스크톱 테이블 뷰 */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    티타임
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    예약자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    연락처
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    인원
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    고객명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    선입금 금액
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    메모
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dateBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.tee_time.course_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(booking.tee_time.date)}{" "}
                        {booking.tee_time.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.people_count}명
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {booking.companion_names &&
                        booking.companion_names.length > 0
                          ? booking.companion_names.join(", ")
                          : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          statusColors[booking.status]
                        }`}
                      >
                        {statusLabels[booking.status]}
                      </span>
                      {booking.paid_at && (
                        <div className="text-xs text-gray-500 mt-1">
                          {/* {formatDateTime(booking.paid_at)} */}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.payment_amount?.toLocaleString() || 0}원
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {booking.memo || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      {booking.status === "PENDING" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onConfirmPayment(booking.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(booking)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(booking.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 모바일 카드 뷰 */}
          <div className="md:hidden divide-y divide-gray-200">
            {dateBookings.map((booking) => (
              <div key={booking.id} className="p-4 hover:bg-gray-50">
                <div className="space-y-3">
                  {/* 티타임 정보 */}
                  <div>
                    <div className="font-medium text-gray-900">
                      {booking.tee_time.course_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.tee_time.time}
                    </div>
                  </div>

                  {/* 예약자 정보 */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">예약자:</span>
                      <div className="font-medium">{booking.name}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">인원:</span>
                      <div className="font-medium">
                        {booking.people_count}명
                      </div>
                    </div>
                  </div>

                  {/* 연락처 */}
                  <div className="text-sm">
                    <span className="text-gray-500">연락처:</span>
                    <div className="font-medium">{booking.phone}</div>
                  </div>

                  {/* 고객명 */}
                  {booking.companion_names &&
                    booking.companion_names.length > 0 && (
                      <div className="text-sm">
                        <span className="text-gray-500">고객명:</span>
                        <div className="font-medium">
                          {booking.companion_names.join(", ")}
                        </div>
                      </div>
                    )}

                  {/* 상태 */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        statusColors[booking.status]
                      }`}
                    >
                      {statusLabels[booking.status]}
                    </span>
                    {booking.paid_at && (
                      <div className="text-xs text-gray-500">
                        {formatDateTime(booking.paid_at)}
                      </div>
                    )}
                  </div>

                  {/* 선입금 금액 */}
                  <div className="text-sm">
                    <span className="text-gray-500">선입금 금액: </span>
                    <span className="font-medium">
                      {booking.payment_amount?.toLocaleString() || 0}원
                    </span>
                  </div>

                  {/* 메모 */}
                  {booking.memo && (
                    <div className="text-sm text-gray-500">{booking.memo}</div>
                  )}

                  {/* 작업 버튼 */}
                  <div className="flex justify-end gap-2 pt-2 border-t">
                    {booking.status === "PENDING" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onConfirmPayment(booking.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        입금확인
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(booking)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      수정
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(booking.id)}
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
