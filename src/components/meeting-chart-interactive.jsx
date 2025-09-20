"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

const chartConfig = {
  meetings: {
    label: "Meetings",
    color: "hsl(var(--chart-1))",
  },
  participants: {
    label: "Participants",
    color: "hsl(var(--chart-2))",
  }
}

export function MeetingChartInteractive({ chartData = [] }) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("6m")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("3m")
    }
  }, [isMobile])

  // Filter data based on time range
  const filteredData = React.useMemo(() => {
    if (!chartData || chartData.length === 0) {
      // Return default empty data for each time range
      const now = new Date()
      const months = timeRange === "3m" ? 3 : timeRange === "6m" ? 6 : 12
      
      return Array.from({ length: months }, (_, i) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1)
        return {
          date: date.toISOString().slice(0, 7),
          month: date.toLocaleDateString('en-US', { month: 'long' }),
          meetings: 0,
          participants: 0
        }
      })
    }

    const months = timeRange === "3m" ? 3 : timeRange === "6m" ? 6 : 12
    return chartData.slice(-months)
  }, [chartData, timeRange])

  const totalMeetings = React.useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + curr.meetings, 0)
  }, [filteredData])

  const totalParticipants = React.useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + curr.participants, 0)
  }, [filteredData])

  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle>Meeting Activity</CardTitle>
        <CardDescription>
          Meetings and participants over time
        </CardDescription>
        <div className="absolute right-4 top-4">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden sm:flex">
            <ToggleGroupItem value="12m" className="h-8 px-2.5">
              Last 12 months
            </ToggleGroupItem>
            <ToggleGroupItem value="6m" className="h-8 px-2.5">
              Last 6 months
            </ToggleGroupItem>
            <ToggleGroupItem value="3m" className="h-8 px-2.5">
              Last 3 months
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="sm:hidden flex w-40" aria-label="Select a value">
              <SelectValue placeholder="Last 6 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="12m" className="rounded-lg">
                Last 12 months
              </SelectItem>
              <SelectItem value="6m" className="rounded-lg">
                Last 6 months
              </SelectItem>
              <SelectItem value="3m" className="rounded-lg">
                Last 3 months
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillMeetings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-meetings)" stopOpacity={1.0} />
                <stop offset="95%" stopColor="var(--color-meetings)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillParticipants" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-participants)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-participants)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                return value.slice(0, 3) // Show first 3 letters of month
              }} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => value}
                  indicator="dot" />
              } />
            <Area
              dataKey="participants"
              type="natural"
              fill="url(#fillParticipants)"
              stroke="var(--color-participants)"
              stackId="a" />
            <Area
              dataKey="meetings"
              type="natural"
              fill="url(#fillMeetings)"
              stroke="var(--color-meetings)"
              stackId="a" />
          </AreaChart>
        </ChartContainer>
        <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-1))]"></div>
              <span className="text-muted-foreground">Total Meetings:</span>
              <span className="font-medium">{totalMeetings}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-2))]"></div>
              <span className="text-muted-foreground">Total Participants:</span>
              <span className="font-medium">{totalParticipants}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
