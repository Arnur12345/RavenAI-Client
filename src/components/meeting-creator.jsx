"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import StartMeetingModal from "@/components/StartMeetingModal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { toast } from "sonner"

export function MeetingCreator({ onMeetingCreated, buttonLabel = "New AI Meeting" }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleStartMeeting = async (meetingData) => {
    const { startMeetingBot } = await import("@/lib/vexa-api-service")
    const result = await startMeetingBot(meetingData)
    toast.success("Bot is joining your meeting")
    if (onMeetingCreated) onMeetingCreated(result)
    
    // Navigate to the specific meeting page
    if (result.meetingId) {
      router.push(`/meetings/${encodeURIComponent(result.meetingId)}`)
    } else {
      router.push("/meetings")
    }
    return result
  }

  return (
    <div className="w-full">
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full h-12 bg-zinc-900 text-white border border-zinc-800 hover:bg-zinc-800"
      >
        <Plus className="mr-2" />
        {buttonLabel}
      </Button>

      <StartMeetingModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onStartMeeting={handleStartMeeting}
      />
    </div>
  )
}
