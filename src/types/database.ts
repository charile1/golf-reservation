export type TeeTimeStatus = 'AVAILABLE' | 'JOINING' | 'CONFIRMED' | 'CANCELED'
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELED'
export type BookingType = 'TRANSFER' | 'JOIN'
export type CustomerGroupType = 'NONE' | 'COUPLE' | 'SINGLE'
export type RevenueType = 'standard' | 'package' | 'buyout'
export type TransactionStatus = 'pending' | 'confirmed' | 'canceled' | 'settled'

export interface Customer {
  id: string
  name: string
  phone: string
  email: string | null
  group_type: CustomerGroupType
  memo: string | null
  created_at: string
  updated_at: string
}

export interface TeeTime {
  id: string
  date: string
  time: string
  course_name: string
  green_fee: number
  onsite_payment: number
  slots_total: number
  slots_booked: number
  slots_pending?: number
  status: TeeTimeStatus
  revenue_type: RevenueType
  cost_price: number
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  tee_time_id: string
  customer_id: string | null
  name: string
  phone: string
  people_count: number
  companion_names: string[] | null
  booking_type: BookingType
  payment_amount: number
  status: BookingStatus
  paid_at: string | null
  memo: string | null
  created_at: string
  updated_at: string
}

export interface BookingWithTeeTime extends Booking {
  tee_time: TeeTime
}

export interface BookingWithCustomer extends Booking {
  customer: Customer | null
}

export interface AdminUser {
  id: string
  name: string
  email: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  booking_id: string
  tee_time_id: string | null
  course_name: string

  // 금액 정보
  total_price: number
  prepayment: number
  onsite_payment: number
  cost: number
  commission: number

  // 메타 정보
  revenue_type: RevenueType
  people_count: number
  commission_per_person: number

  // 상태 및 날짜
  status: TransactionStatus
  booking_date: string
  play_date: string
  settled_at: string | null
  memo: string | null

  created_at: string
  updated_at: string
}

export interface TransactionWithBooking extends Transaction {
  booking: Booking
}
