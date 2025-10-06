import { Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/utils'
import type { Customer } from '@/types/database'

interface CustomerListProps {
  customers: Customer[]
  onEdit: (customer: Customer) => void
  onDelete: (id: string) => void
}

export default function CustomerList({
  customers,
  onEdit,
  onDelete,
}: CustomerListProps) {
  if (customers.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <p className="text-gray-500">등록된 고객이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* 데스크톱 테이블 뷰 */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                고객명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                연락처
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                그룹
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                메모
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                등록일
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {customer.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{customer.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      customer.group_type === 'COUPLE'
                        ? 'bg-pink-100 text-pink-800'
                        : customer.group_type === 'SINGLE'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {customer.group_type === 'COUPLE'
                      ? '부부'
                      : customer.group_type === 'SINGLE'
                      ? '1인 조인'
                      : '미지정'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 max-w-xs truncate">
                    {customer.memo || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {formatDateTime(customer.created_at)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(customer)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(customer.id)}
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
        {customers.map((customer) => (
          <div key={customer.id} className="p-4 hover:bg-gray-50">
            <div className="space-y-3">
              {/* 고객명 */}
              <div>
                <div className="font-medium text-gray-900 text-lg">
                  {customer.name}
                </div>
              </div>

              {/* 연락처 */}
              <div className="text-sm">
                <span className="text-gray-500">연락처:</span>
                <div className="font-medium">{customer.phone}</div>
              </div>

              {/* 그룹 */}
              <div className="text-sm">
                <span className="text-gray-500">그룹: </span>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    customer.group_type === 'COUPLE'
                      ? 'bg-pink-100 text-pink-800'
                      : customer.group_type === 'SINGLE'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {customer.group_type === 'COUPLE'
                    ? '부부'
                    : customer.group_type === 'SINGLE'
                    ? '1인 조인'
                    : '미지정'}
                </span>
              </div>

              {/* 메모 */}
              {customer.memo && (
                <div className="text-sm">
                  <span className="text-gray-500">메모:</span>
                  <div className="text-gray-700">{customer.memo}</div>
                </div>
              )}

              {/* 등록일 */}
              <div className="text-xs text-gray-500">
                등록일: {formatDateTime(customer.created_at)}
              </div>

              {/* 작업 버튼 */}
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(customer)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  수정
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(customer.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
