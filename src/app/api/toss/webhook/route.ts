import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This endpoint handles Toss Payments webhook for automatic payment confirmation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verify webhook signature (optional but recommended)
    const signature = request.headers.get('toss-signature')
    if (process.env.TOSS_WEBHOOK_SECRET && signature !== process.env.TOSS_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Initialize Supabase client with service role for webhook
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Handle different event types
    switch (body.eventType) {
      case 'PAYMENT_CONFIRMED':
        // Extract payment info
        const { orderId, amount, paymentKey } = body.data

        // Find booking by orderId (you should set orderId when creating Toss payment)
        // Assuming orderId is the booking.id
        const { data: booking, error: fetchError } = await supabase
          .from('booking')
          .select('*')
          .eq('id', orderId)
          .single()

        if (fetchError || !booking) {
          return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
        }

        // Update booking status to CONFIRMED
        const { error: updateError } = await supabase
          .from('booking')
          .update({
            status: 'CONFIRMED',
            paid_at: new Date().toISOString(),
            memo: booking.memo
              ? `${booking.memo} | 결제키: ${paymentKey}`
              : `결제키: ${paymentKey}`,
          })
          .eq('id', orderId)

        if (updateError) {
          console.error('Error updating booking:', updateError)
          return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: 'Payment confirmed' })

      case 'PAYMENT_CANCELED':
        // Handle payment cancellation
        const { orderId: canceledOrderId } = body.data

        const { error: cancelError } = await supabase
          .from('booking')
          .update({
            status: 'CANCELED',
          })
          .eq('id', canceledOrderId)

        if (cancelError) {
          console.error('Error canceling booking:', cancelError)
          return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: 'Payment canceled' })

      default:
        return NextResponse.json({ message: 'Event type not handled' }, { status: 200 })
    }
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
