'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventClickArg, EventContentArg } from '@fullcalendar/core'
import type { TeeTime } from '@/types/database'

interface CalendarViewProps {
  teeTimes: TeeTime[]
  onTeeTimeClick: (teeTime: TeeTime) => void
}

const statusColors = {
  AVAILABLE: '#9CA3AF', // gray
  PENDING: '#FCD34D', // yellow
  JOINING: '#FB923C', // orange
  CONFIRMED: '#34D399', // green
  CANCELED: '#F87171', // red
}

export default function CalendarView({ teeTimes, onTeeTimeClick }: CalendarViewProps) {
  const events = teeTimes.map((teeTime) => ({
    id: teeTime.id,
    title: `${teeTime.time} ${teeTime.course_name}`,
    start: teeTime.date,
    backgroundColor: statusColors[teeTime.status],
    borderColor: statusColors[teeTime.status],
    extendedProps: teeTime,
  }))

  const handleEventClick = (info: EventClickArg) => {
    const teeTime = info.event.extendedProps as TeeTime
    onTeeTimeClick(teeTime)
  }

  const renderEventContent = (eventInfo: EventContentArg) => {
    const teeTime = eventInfo.event.extendedProps as TeeTime
    return (
      <div className="p-0.5 sm:p-1 text-[10px] sm:text-xs leading-tight overflow-hidden">
        <div className="font-semibold truncate">
          {teeTime.time}
        </div>
        <div className="text-[9px] sm:text-[10px] truncate hidden sm:block">
          {teeTime.course_name}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white p-2 sm:p-6 rounded-lg shadow">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          height="auto"
          headerToolbar={{
            left: 'prev,next',
            center: 'title',
            right: 'today',
          }}
          locale="ko"
          buttonText={{
            today: '오늘',
            month: '월',
            week: '주',
          }}
          dayMaxEvents={false}
          eventDisplay="block"
          dayCellClassNames="text-xs sm:text-sm"
          dayHeaderClassNames="text-xs sm:text-sm"
        />

        {/* Legend */}
        <div className="mt-3 sm:mt-6 flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div
              className="w-3 h-3 sm:w-4 sm:h-4 rounded"
              style={{ backgroundColor: statusColors.AVAILABLE }}
            />
            <span className="text-gray-600">등록</span>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div
              className="w-3 h-3 sm:w-4 sm:h-4 rounded"
              style={{ backgroundColor: statusColors.JOINING }}
            />
            <span className="text-gray-600">조인모집</span>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div
              className="w-3 h-3 sm:w-4 sm:h-4 rounded"
              style={{ backgroundColor: statusColors.CONFIRMED }}
            />
            <span className="text-gray-600">확정</span>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div
              className="w-3 h-3 sm:w-4 sm:h-4 rounded"
              style={{ backgroundColor: statusColors.CANCELED }}
            />
            <span className="text-gray-600">취소</span>
          </div>
        </div>
      </div>
    </>
  )
}
