"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  ClipboardList,
  Clock,
  LogOut,
  Users,
  Menu,
  X,
  DollarSign,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useState, useEffect } from "react"

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userName, setUserName] = useState<string>("")

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user?.id) {
        // admin_user 테이블에서 이름 조회
        const { data: adminUser } = await supabase
          .from("admin_user")
          .select("name")
          .eq("id", user.id)
          .single()

        if (adminUser?.name) {
          setUserName(adminUser.name)
        } else {
          // 없으면 이메일 사용
          setUserName(user.email?.split("@")[0] || "닉네임 없음")
        }
      }
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast({
      title: "로그아웃",
      description: "로그아웃되었습니다.",
    })
    router.push("/admin/login")
    router.refresh()
  }

  const navItems = [
    { href: "/admin/tee-times", label: "티타임 관리", icon: Clock },
    { href: "/admin/bookings", label: "예약 관리", icon: ClipboardList },
    { href: "/admin/customers", label: "고객 관리", icon: Users },
    { href: "/admin/transactions", label: "거래 내역", icon: DollarSign },
  ]

  return (
    <>
      {/* 모바일 헤더 */}
      <div className="lg:hidden bg-white shadow-sm border-b">
        <div className="flex items-center justify-between h-16 px-4">
          <Link
            href="/admin/tee-times"
            className="text-xl font-bold text-gray-900"
          >
            골프 예약
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* 모바일 메뉴 */}
        {mobileMenuOpen && (
          <div className="border-t py-4 px-4 space-y-2">
            {userName && (
              <div className="px-3 py-2 text-sm text-gray-600 font-medium border-b pb-3 mb-2">
                {userName}님
              </div>
            )}
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            <Button
              variant="ghost"
              onClick={handleLogout}
              size="sm"
              className="w-full justify-start"
            >
              <LogOut className="h-4 w-4 mr-2" />
              로그아웃
            </Button>
          </div>
        )}
      </div>

      {/* 데스크톱 사이드바 */}
      <aside className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-white border-r shadow-sm z-10">
        <div className="flex flex-col h-full">
          {/* 로고 */}
          <div className="h-16 flex items-center px-6 border-b">
            <Link
              href="/admin/tee-times"
              className="text-xl font-bold text-gray-900"
            >
              골프 예약
            </Link>
          </div>

          {/* 사용자 정보 */}
          {userName && (
            <div className="px-6 py-4 border-b">
              <div className="text-sm text-gray-600">{userName}님</div>
            </div>
          )}

          {/* 메뉴 */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* 로그아웃 */}
          <div className="px-4 py-4 border-t">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start"
            >
              <LogOut className="h-5 w-5 mr-3" />
              로그아웃
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
