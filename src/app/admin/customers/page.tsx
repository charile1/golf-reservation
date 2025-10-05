'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Plus } from 'lucide-react'
import CustomerForm from '@/components/admin/customer-form'
import CustomerList from '@/components/admin/customer-list'
import AdminNav from '@/components/admin/admin-nav'
import type { Customer } from '@/types/database'
import { useRouter } from 'next/navigation'

export default function CustomersPage() {
  const router = useRouter()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
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

  // Fetch customers
  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Customer[]
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('customer').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast({
        title: '삭제 완료',
        description: '고객이 삭제되었습니다.',
      })
    },
    onError: (error) => {
      toast({
        title: '삭제 실패',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setIsFormOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingCustomer(null)
  }

  return (
    <>
      <AdminNav />
      <div className="container mx-auto py-6 px-4">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">고객 관리</h1>
              <p className="text-gray-600 mt-1">고객 정보를 등록하고 관리하세요</p>
            </div>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              고객 등록
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          ) : (
            <CustomerList
              customers={customers || []}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}

          <CustomerForm
            open={isFormOpen}
            onClose={handleFormClose}
            customer={editingCustomer}
          />
        </div>
      </div>
    </>
  )
}
