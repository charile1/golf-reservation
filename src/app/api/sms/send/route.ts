import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { recipients, message } = await request.json()

    // 환경 변수 확인
    const apiKey = process.env.ALIGO_API_KEY
    const userId = process.env.ALIGO_USER_ID
    const senderPhone = process.env.ALIGO_SENDER_PHONE

    if (!apiKey || !userId || !senderPhone) {
      return NextResponse.json(
        { error: '알리고 설정이 완료되지 않았습니다. 환경 변수를 확인해주세요.' },
        { status: 500 }
      )
    }

    // 알리고 SMS 발송
    const successCount = []
    const failCount = []

    for (const recipient of recipients) {
      try {
        const params = new URLSearchParams({
          key: apiKey,
          user_id: userId,
          sender: senderPhone,
          receiver: recipient.phone,
          msg: message,
          msg_type: 'SMS', // SMS, LMS, MMS
          title: '', // LMS, MMS일 때 제목
        })

        const response = await fetch('https://apis.aligo.in/send/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        })

        const result = await response.json()

        if (result.result_code === '1') {
          successCount.push(recipient)
        } else {
          failCount.push({ recipient, error: result.message })
          console.error(`SMS 발송 실패 (${recipient.name}):`, result.message)
        }
      } catch (err) {
        failCount.push({ recipient, error: err })
        console.error(`SMS 발송 에러 (${recipient.name}):`, err)
      }
    }

    return NextResponse.json({
      success: true,
      sentCount: successCount.length,
      failCount: failCount.length,
      successList: successCount,
      failList: failCount,
    })
  } catch (error: any) {
    console.error('SMS 발송 에러:', error)
    return NextResponse.json(
      {
        error: 'SMS 발송에 실패했습니다.',
        details: error.message || error,
      },
      { status: 500 }
    )
  }
}
