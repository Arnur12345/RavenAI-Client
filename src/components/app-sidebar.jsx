'use client'

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// RavenAI navigation data
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      items: [
        {
          title: "Overview",
          url: "/dashboard",
        },
        {
          title: "Recent Meetings",
          url: "/dashboard/recent",
        },
        {
          title: "Analytics",
          url: "/dashboard/analytics",
        },
      ],
    },
    {
      title: "Meetings",
      url: "/meetings",
      items: [
        {
          title: "All Meetings",
          url: "/meetings",
        },
        {
          title: "Schedule Meeting",
          url: "/meetings/schedule",
        },
        {
          title: "Meeting Templates",
          url: "/meetings/templates",
        },
      ],
    },
    {
      title: "Transcriptions",
      url: "/transcriptions",
      items: [
        {
          title: "Recent Transcriptions",
          url: "/transcriptions",
        },
        {
          title: "Search Transcriptions",
          url: "/transcriptions/search",
        },
        {
          title: "Export Data",
          url: "/transcriptions/export",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      items: [
        {
          title: "Profile",
          url: "/settings/profile",
        },
        {
          title: "API Keys",
          url: "/settings/api",
        },
        {
          title: "Integrations",
          url: "/settings/integrations",
        },
        {
          title: "Billing",
          url: "/settings/billing",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }) {
  const pathname = usePathname()

  return (
    <Sidebar {...props} className="border-r border-zinc-800">
      <SidebarHeader className="border-b border-zinc-800">
        <div className="p-4 lg:p-6">
          <h2 className="text-lg font-semibold text-white">RavenAI</h2>
          <p className="text-xs text-zinc-400 mt-1">Meeting Transcription</p>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title} className="py-2">
            <SidebarGroupLabel className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-3 py-2">
              {item.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {item.items.map((subItem) => {
                  const isActive = pathname === subItem.url
                  return (
                    <SidebarMenuItem key={subItem.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive}
                        className="w-full justify-start text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors px-3 py-2"
                      >
                        <Link href={subItem.url} className="flex items-center gap-3 w-full">
                          <span className="truncate">{subItem.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
