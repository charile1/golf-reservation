'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import AdminNav from '@/components/admin/admin-nav'
import TransactionList from '@/components/admin/transaction-list'
import TransactionEditModal from '@/components/admin/transaction-edit-modal'
import type { Transaction } from '@/types/database'
import { useRouter } from 'next/navigation'

export default function TransactionsPage() {
  const router = useRouter()
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'pending' | 'confirmed' | 'canceled' | 'settled'>('ALL')
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/admin/login')
      }
    }
    checkAuth()
  }, [router, supabase])

  // Fetch transactions with tee_time info
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transaction')
        .select(`
          *,
          tee_time:tee_time_id (
            time
          )
        `)
        .order('play_date', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as any[]
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

  // 디버깅용 로그
  useEffect(() => {
    if (transactions && transactions.length > 0) {
      console.log('Transactions:', transactions)
      console.log('Selected month:', selectedMonth)
      console.log('Sample play_date:', transactions[0]?.play_date)
    }
  }, [transactions, selectedMonth])

  // 필터링된 transactions
  const filteredTransactions = transactions
    ? transactions.filter(t => {
        // 상태 필터
        if (statusFilter !== 'ALL' && t.status !== statusFilter) {
          return false
        }
        // 월별 필터 - play_date가 "2025-10-15" 형식이므로 substring으로 비교
        if (selectedMonth) {
          const playMonth = t.play_date.substring(0, 7) // "2025-10"
          if (playMonth !== selectedMonth) {
            return false
          }
        }
        return true
      })
    : []

  // 매출 통계 계산 - 선입금 중심
  const stats = filteredTransactions.reduce(
    (acc, t) => {
      if (t.status !== 'canceled') {
        acc.totalPrepayment += t.prepayment  // 실제 받은 선입금
        acc.totalOnsitePayment += t.onsite_payment  // 현장결제
        acc.count += 1
      }
      return acc
    },
    { totalPrepayment: 0, totalOnsitePayment: 0, count: 0 }
  )

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsEditModalOpen(true)
  }

  const handleEditClose = () => {
    setIsEditModalOpen(false)
    setSelectedTransaction(null)
  }

  return (
    <>
      <AdminNav />
      <div className="lg:ml-64">
        <div className="container mx-auto py-6 px-4">
          <div className="space-y-6">
          {/* 헤더 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">거래 내역</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                예약별 수익 및 매출을 관리하세요
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {/* 월별 필터 */}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm bg-white"
              >
                {monthOptions.map((month) => {
                  const [year, monthNum] = month.split('-')
                  return (
                    <option key={month} value={month}>
                      {year}년 {parseInt(monthNum)}월
                    </option>
                  )
                })}
              </select>

              {/* 상태 필터 */}
              <div className="flex border rounded-md overflow-hidden flex-1 sm:flex-none">
                <Button
                  onClick={() => setStatusFilter('ALL')}
                  variant={statusFilter === 'ALL' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-none text-xs sm:text-sm"
                >
                  전체
                </Button>
                <Button
                  onClick={() => setStatusFilter('confirmed')}
                  variant={statusFilter === 'confirmed' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-none text-xs sm:text-sm"
                >
                  확정
                </Button>
                <Button
                  onClick={() => setStatusFilter('settled')}
                  variant={statusFilter === 'settled' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-none text-xs sm:text-sm"
                >
                  정산완료
                </Button>
                <Button
                  onClick={() => setStatusFilter('canceled')}
                  variant={statusFilter === 'canceled' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-none text-xs sm:text-sm"
                >
                  취소
                </Button>
              </div>
            </div>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm text-gray-500">총 거래</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {stats.count}건
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm text-gray-500">총 선입금</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">
                {stats.totalPrepayment.toLocaleString()}원
              </div>
              <div className="text-xs text-gray-500 mt-1">실제 받은 금액</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm text-gray-500">총 현장결제</div>
              <div className="text-2xl font-bold text-gray-600 mt-1">
                {stats.totalOnsitePayment.toLocaleString()}원
              </div>
              <div className="text-xs text-gray-500 mt-1">골프장 결제</div>
            </div>
          </div>

          {/* 거래 내역 리스트 */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          ) : (
            <TransactionList
              transactions={filteredTransactions}
              onEdit={handleEdit}
            />
          )}

          {/* 수정 모달 */}
          <TransactionEditModal
            open={isEditModalOpen}
            onClose={handleEditClose}
            transaction={selectedTransaction}
          />
          </div>
        </div>
      </div>
    </>
  )
}
