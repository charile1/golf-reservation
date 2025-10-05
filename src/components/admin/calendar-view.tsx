'use client'

import { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventClickArg, EventContentArg } from '@fullcalendar/core'
import type { TeeTime } from '@/types/database'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils'

interface CalendarViewProps {
  teeTimes: TeeTime[]
}

const statusColors = {
  AVAILABLE: '#9CA3AF', // gray
  PENDING: '#FCD34D', // yellow
  JOINING: '#FB923C', // orange
  CONFIRMED: '#34D399', // green
  CANCELED: '#F87171', // red
}

export default function CalendarView({ teeTimes }: CalendarViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<TeeTime | null>(null)

  const events = teeTimes.map((teeTime) => ({
    id: teeTime.id,
    title: `${teeTime.time} ${teeTime.course_name}`,
    start: teeTime.date,
    backgroundColor: statusColors[teeTime.status],
    borderColor: statusColors[teeTime.status],
    extendedProps: teeTime,
  }))

  const handleEventClick = (info: EventClickArg) => {
    setSelectedEvent(info.event.extendedProps as TeeTime)
  }

  const renderEventContent = (eventInfo: EventContentArg) => {
    const teeTime = eventInfo.event.extendedProps as TeeTime
    return (
      <div className="p-1 text-xs">
        <div className="font-semibold truncate">{eventInfo.event.title}</div>
        <div className="text-[10px]">
          {teeTime.slots_booked}/{teeTime.slots_total}명
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          height="auto"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek',
          }}
          locale="ko"
          buttonText={{
            today: '오늘',
            month: '월',
            week: '주',
          }}
        />

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: statusColors.AVAILABLE }}
            />
            <span className="text-sm text-gray-600">등록</span>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: statusColors.JOINING }}
            />
            <span className="text-sm text-gray-600">조인모집</span>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: statusColors.CONFIRMED }}
            />
            <span className="text-sm text-gray-600">확정</span>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: statusColors.CANCELED }}
            />
            <span className="text-sm text-gray-600">취소</span>
          </div>
        </div>
      </div>

      {/* Event Detail Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>티타임 상세</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">골프장</label>
                <p className="text-lg font-semibold">{selectedEvent.course_name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">날짜</label>
                  <p>{selectedEvent.date}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">시간</label>
                  <p>{selectedEvent.time}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">그린피</label>
                <p className="text-lg font-semibold">
                  {formatCurrency(selectedEvent.green_fee)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">예약현황</label>
                  <p>
                    {selectedEvent.slots_booked} / {selectedEvent.slots_total}명
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">상태</label>
                  <p
                    className="inline-block px-2 py-1 rounded text-sm font-medium"
                    style={{
                      backgroundColor: statusColors[selectedEvent.status],
                      color: 'white',
                    }}
                  >
                    {selectedEvent.status === 'AVAILABLE' && '등록'}
                    {selectedEvent.status === 'JOINING' && '조인모집'}
                    {selectedEvent.status === 'CONFIRMED' && '확정'}
                    {selectedEvent.status === 'CANCELED' && '취소'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
