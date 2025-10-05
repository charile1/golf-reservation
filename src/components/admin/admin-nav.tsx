'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Calendar, ClipboardList, Clock, LogOut, Users } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast({
      title: '로그아웃',
      description: '로그아웃되었습니다.',
    })
    router.push('/admin/login')
    router.refresh()
  }

  const navItems = [
    { href: '/admin/tee-times', label: '티타임 관리', icon: Clock },
    { href: '/admin/bookings', label: '예약 관리', icon: ClipboardList },
    { href: '/admin/customers', label: '고객 관리', icon: Users },
    { href: '/admin/calendar', label: '캘린더', icon: Calendar },
  ]

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/admin/tee-times" className="text-xl font-bold text-gray-900">
              골프 예약 관리
            </Link>
            <div className="flex space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            로그아웃
          </Button>
        </div>
      </div>
    </nav>
  )
}
