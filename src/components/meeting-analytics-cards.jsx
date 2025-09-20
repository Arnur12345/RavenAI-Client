import { TrendingDownIcon, TrendingUpIcon, Mic, Users, Clock, BarChart3 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function MeetingAnalyticsCards({ analytics }) {
  if (!analytics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="relative">
              <CardDescription>Loading...</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                --
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  const getTrendIcon = (current, previous = 0) => {
    const trend = current > previous
    return trend ? <TrendingUpIcon className="size-3" /> : <TrendingDownIcon className="size-3" />
  }

  const getTrendPercentage = (current, previous = 0) => {
    if (previous === 0) return "+100%"
    const change = ((current - previous) / previous) * 100
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`
  }

  const getTrendColor = (current, previous = 0) => {
    return current > previous ? "text-green-600" : "text-red-600"
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      
      {/* Total Meetings */}
      <Card>
        <CardHeader className="relative">
          <CardDescription>Total Meetings</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {analytics.totalMeetings}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <BarChart3 className="size-3" />
              {analytics.totalMeetings > 0 ? '+15.3%' : '0%'}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="flex gap-2 font-medium">
            {analytics.totalMeetings > 0 ? (
              <>
                Growing steadily <TrendingUpIcon className="size-4" />
              </>
            ) : (
              <>
                No meetings yet <BarChart3 className="size-4" />
              </>
            )}
          </div>
          <div className="text-muted-foreground">
            Meetings recorded this month
          </div>
        </CardFooter>
      </Card>

      {/* Total Duration */}
      <Card>
        <CardHeader className="relative">
          <CardDescription>Total Duration</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {analytics.totalDuration}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <Clock className="size-3" />
              +8.2%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="flex gap-2 font-medium">
            {analytics.totalDuration !== '0m' ? (
              <>
                More productive meetings <TrendingUpIcon className="size-4" />
              </>
            ) : (
              <>
                Start recording meetings <Clock className="size-4" />
              </>
            )}
          </div>
          <div className="text-muted-foreground">
            Total meeting time tracked
          </div>
        </CardFooter>
      </Card>

      {/* Total Participants */}
      <Card>
        <CardHeader className="relative">
          <CardDescription>Total Participants</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {analytics.totalParticipants}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <Users className="size-3" />
              +22.1%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="flex gap-2 font-medium">
            {analytics.totalParticipants > 0 ? (
              <>
                Strong team engagement <TrendingUpIcon className="size-4" />
              </>
            ) : (
              <>
                Invite team members <Users className="size-4" />
              </>
            )}
          </div>
          <div className="text-muted-foreground">
            People engaged in meetings
          </div>
        </CardFooter>
      </Card>

      {/* Transcription Accuracy */}
      <Card>
        <CardHeader className="relative">
          <CardDescription>Transcription Accuracy</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {analytics.transcriptionAccuracy}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <Mic className="size-3" />
              High Quality
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="flex gap-2 font-medium">
            {parseFloat(analytics.transcriptionAccuracy) > 95 ? (
              <>
                Excellent quality <TrendingUpIcon className="size-4" />
              </>
            ) : analytics.transcriptionAccuracy !== '0%' ? (
              <>
                Good quality <TrendingUpIcon className="size-4" />
              </>
            ) : (
              <>
                No transcriptions yet <Mic className="size-4" />
              </>
            )}
          </div>
          <div className="text-muted-foreground">
            AI transcription performance
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
