"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { MeetingCreator } from "@/components/meeting-creator"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import data from "./data.json"

export default function Page() {
  const handleMeetingCreated = (newMeeting) => {
    // Refresh page data when a new meeting is created
    console.log('New meeting created:', newMeeting)
    // You could add state management here to refresh the dashboard
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Dashboard" description="Overview of your meetings and analytics" />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-6 p-6">
            {/* Meeting Creator Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
                  <p className="text-muted-foreground">Start a new AI-powered meeting</p>
                </div>
              </div>
              <MeetingCreator onMeetingCreated={handleMeetingCreated} />
            </div>

            {/* Analytics Overview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Analytics Overview</h2>
                  <p className="text-muted-foreground">Your meeting insights and statistics</p>
                </div>
              </div>
              <SectionCards />
            </div>

            {/* Charts and Data */}
            <div className="space-y-6">
              <ChartAreaInteractive />
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
