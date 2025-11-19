"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  BookOpen,
  Box,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "ZEnd Studio",
      logo: GalleryVerticalEnd,
      plan: "Portfolio",
    },
    {
      name: "Dashboard",
      logo: Command,
      plan: "Admin",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/dashboard",
        },
        {
          title: "Posts (CRUD)",
          url: "/dashboard/posts",
        },
        {
          title: "Projects",
          url: "/dashboard/projects",
        },
        {
          title: "Activities",
          url: "/dashboard/activities",
        },
        {
          title: "Skill Stack",
          url: "/dashboard/skill-stack",
        },
        {
          title: "Work Experiences",
          url: "/dashboard/work-experiences",
        },
        {
          title: "Education History",
          url: "/dashboard/education-history",
        },
        {
          title: "Profile",
          url: "/dashboard/profile",
        },
      ],
    },
    {
      title: "Public Site",
      url: "/",
      icon: BookOpen,
      items: [
        {
          title: "Home",
          url: "/",
        },
        {
          title: "Work",
          url: "/work",
        },
        {
          title: "Activities",
          url: "/activities",
        },
        {
          title: "Profile",
          url: "/profile",
        },
        {
          title: "Contact",
          url: "/contact",
        },
      ],
    },
    {
      title: "Settings",
      url: "/dashboard/profile",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "/dashboard/profile",
        },
        {
          title: "Login",
          url: "/login",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Posts CRUD",
      url: "/dashboard/posts",
      icon: Frame,
    },
    {
      name: "Public Profile",
      url: "/profile",
      icon: PieChart,
    },
    {
      name: "Work Showcase",
      url: "/work",
      icon: Map,
    },
    {
      name: "Contact",
      url: "/contact",
      icon: Box,
    },
  ],
}

export function AppSidebar({ ...props }) {
  const router = useRouter()
  const { user: authUser, logout } = useAuth()

  const resolvedUser = React.useMemo(() => {
    if (!authUser) {
      return data.user
    }
    return {
      name: authUser.username || authUser.email || "User",
      email: authUser.email ?? "",
      avatar: authUser.avatarUrl ?? authUser.avatar ?? null,
    }
  }, [authUser])

  const handleLogout = React.useCallback(() => {
    logout()
    router.replace("/login")
  }, [logout, router])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={resolvedUser} onLogout={handleLogout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
