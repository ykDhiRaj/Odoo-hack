"use client"

import {
  CheckCircle,
  FileText,
  LayoutDashboard,
  PlusCircle,
  Settings,
  Users,
  Wallet
} from "lucide-react"
import { usePathname } from "next/navigation"
import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar
} from "@/components/ui/sidebar"

// Employee navigation data
const employeeData = {
  user: {
    name: "Employee",
    email: "employee@company.com",
    avatar: "/avatars/employee.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/employee/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Submit Expense",
      url: "/employee/submit-expense",
      icon: PlusCircle,
    },
    {
      title: "My Expenses",
      url: "/employee/my-expenses",
      icon: FileText,
    },
  ],
}

// Manager navigation data
const managerData = {
  user: {
    name: "Manager",
    email: "manager@company.com",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/manager/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Approvals to Review",
      url: "/manager/approvals",
      icon: CheckCircle,
    },
  ],
}

// Admin navigation data
const adminData = {
  user: {
    name: "Admin",
    email: "admin@company.com",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Manage Users",
      url: "/admin/users",
      icon: Users,
    },
    {
      title: "Approval Rules",
      url: "/admin/approval-rules",
      icon: Settings,
    },
    {
      title: "All Expenses",
      url: "/admin/expenses",
      icon: Wallet,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar()
  const pathname = usePathname()

  // Determine route context and select appropriate navigation data
  const isAdminRoute = pathname.startsWith('/admin')
  const isManagerRoute = pathname.startsWith('/manager')

  let currentData = employeeData
  if (isAdminRoute) {
    currentData = adminData
  } else if (isManagerRoute) {
    currentData = managerData
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex h-14 items-center ml-2 font-semibold text-lg">
          {state === "collapsed" ? "E" : "Expenses"}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={currentData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}