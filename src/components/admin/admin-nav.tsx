"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ClipboardList, Clock, LogOut, Users, Menu, X } from "lucide-react"
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
  ]

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link
            href="/admin/tee-times"
            className="text-lg sm:text-xl font-bold text-gray-900 shrink-0"
          >
            골프 예약
          </Link>

          {/* 데스크톱 메뉴 */}
          <div className="hidden lg:flex items-center space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
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
            {userName && (
              <div className="text-sm text-gray-600 px-3 py-2">
                {userName}님
              </div>
            )}
            <Button variant="ghost" onClick={handleLogout} size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              로그아웃
            </Button>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
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
          <div className="lg:hidden border-t py-4 space-y-2">
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
    </nav>
  )
}
