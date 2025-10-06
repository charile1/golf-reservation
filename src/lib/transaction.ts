import type { SupabaseClient } from '@supabase/supabase-js'
import type { RevenueType } from '@/types/database'

/**
 * 수익 계산 함수
 */
export function calculateCommission(
  revenueType: RevenueType,
  prepayment: number,
  onsitePayment: number,
  cost: number,
  peopleCount: number
): { commission: number; commissionPerPerson: number } {
  let commission = 0

  switch (revenueType) {
    case 'standard':
      // 일반: 선입금이 전액 마진
      commission = prepayment
      break

    case 'package':
      // 패키지: 총액 - 원가
      commission = prepayment - cost
      break

    case 'buyout':
      // 선매입: (선입금 + 현장결제 * 인원) - 원가
      const total = prepayment + onsitePayment * peopleCount
      commission = total - cost
      break
  }

  const commissionPerPerson = peopleCount > 0 ? commission / peopleCount : 0

  return {
    commission: Math.round(commission),
    commissionPerPerson: Math.round(commissionPerPerson),
  }
}

/**
 * Transaction 생성 함수
 */
export async function createTransaction(
  supabase: SupabaseClient,
  bookingId: string
) {
  // 1. booking 정보 조회 (tee_time 포함)
  const { data: booking, error: bookingError } = await supabase
    .from('booking')
    .select(
      `
      *,
      tee_time:tee_time_id (*)
    `
    )
    .eq('id', bookingId)
    .single()

  if (bookingError || !booking) {
    throw new Error(`Booking not found: ${bookingError?.message}`)
  }

  const teeTime = booking.tee_time as any

  // 2. 수익 계산
  const { commission, commissionPerPerson } = calculateCommission(
    teeTime.revenue_type,
    booking.payment_amount,
    teeTime.onsite_payment,
    teeTime.cost_price,
    booking.people_count
  )

  const totalPrice =
    booking.payment_amount + teeTime.onsite_payment * booking.people_count

  // 3. transaction 생성
  const transactionData = {
    booking_id: booking.id,
    tee_time_id: booking.tee_time_id,
    course_name: teeTime.course_name,

    // 금액 정보
    total_price: totalPrice,
    prepayment: booking.payment_amount,
    onsite_payment: teeTime.onsite_payment,
    cost: teeTime.cost_price,
    commission: commission,

    // 메타 정보
    revenue_type: teeTime.revenue_type,
    people_count: booking.people_count,
    commission_per_person: commissionPerPerson,

    // 상태 및 날짜
    status: 'confirmed' as const,
    booking_date: new Date().toISOString().split('T')[0],
    play_date: teeTime.date,
    memo: null,
  }

  const { data: transaction, error: transactionError } = await supabase
    .from('transaction')
    .insert([transactionData])
    .select()
    .single()

  if (transactionError) {
    throw new Error(`Transaction creation failed: ${transactionError.message}`)
  }

  return transaction
}

/**
 * Transaction 취소 함수
 */
export async function cancelTransaction(
  supabase: SupabaseClient,
  bookingId: string
) {
  const { error } = await supabase
    .from('transaction')
    .update({ status: 'canceled' })
    .eq('booking_id', bookingId)

  if (error) {
    throw new Error(`Transaction cancellation failed: ${error.message}`)
  }
}

/**
 * Transaction 존재 여부 확인
 */
export async function transactionExists(
  supabase: SupabaseClient,
  bookingId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('transaction')
    .select('id')
    .eq('booking_id', bookingId)
    .single()

  return !error && !!data
}
