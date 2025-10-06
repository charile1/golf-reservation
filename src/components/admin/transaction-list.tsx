'use client'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface TransactionListProps {
  transactions: any[]
  onEdit: (transaction: any) => void
}

export default function TransactionList({ transactions, onEdit }: TransactionListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '대기'
      case 'confirmed':
        return '확정'
      case 'canceled':
        return '취소'
      case 'settled':
        return '정산완료'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50'
      case 'confirmed':
        return 'text-blue-600 bg-blue-50'
      case 'canceled':
        return 'text-red-600 bg-red-50'
      case 'settled':
        return 'text-green-600 bg-green-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }


  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <p className="text-gray-500">거래 내역이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">플레이 일시</TableHead>
              <TableHead className="whitespace-nowrap">골프장</TableHead>
              <TableHead className="whitespace-nowrap">예약자</TableHead>
              <TableHead className="whitespace-nowrap text-right">인원</TableHead>
              <TableHead className="whitespace-nowrap text-right">선입금</TableHead>
              <TableHead className="whitespace-nowrap text-right">현장결제</TableHead>
              <TableHead className="whitespace-nowrap">상태</TableHead>
              <TableHead className="whitespace-nowrap">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="whitespace-nowrap">
                  <div>{formatDate(transaction.play_date)}</div>
                  {transaction.tee_time?.time && (
                    <div className="text-xs text-gray-500">{transaction.tee_time.time}</div>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {transaction.course_name}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {transaction.booking?.name || '-'}
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  {transaction.people_count}명
                </TableCell>
                <TableCell className="text-right whitespace-nowrap font-medium text-blue-600">
                  {transaction.prepayment.toLocaleString()}원
                </TableCell>
                <TableCell className="text-right whitespace-nowrap text-gray-600">
                  {transaction.onsite_payment.toLocaleString()}원
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <span
                    className={`text-xs px-2 py-1 rounded ${getStatusColor(
                      transaction.status
                    )}`}
                  >
                    {getStatusText(transaction.status)}
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(transaction)}
                  >
                    상세
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
