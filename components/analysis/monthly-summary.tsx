"use client"

import type { AnalysisData } from "@/types/chat"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MessageCircle } from "lucide-react"

interface MonthlySummaryProps {
  data: AnalysisData
}

export function MonthlySummary({ data }: MonthlySummaryProps) {
  // Generate monthly summary from daily data
  const monthlyData = data.messagesByDay.reduce(
    (acc, day) => {
      const date = new Date(day.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const monthName = date.toLocaleDateString("en-US", { year: "numeric", month: "long" })

      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthName,
          messages: 0,
          reactions: 0,
          topEmoji: "💬",
          activeDays: 0,
          mediaShared: 0,
        }
      }

      acc[monthKey].messages += day.count
      acc[monthKey].activeDays += 1

      return acc
    },
    {} as Record<string, any>,
  )

  const months = Object.values(monthlyData).slice(-6) // Last 6 months

  const getBadgeTitle = (month: any, index: number) => {
    if (index === 0) return "Most Recent"
    if (month.messages === Math.max(...months.map((m: any) => m.messages))) return "Most Active"
    if (month.messages === Math.min(...months.map((m: any) => m.messages))) return "Quietest"
    return "Active Month"
  }

  const getBadgeColor = (title: string) => {
    switch (title) {
      case "Most Active":
        return "bg-green-500/20 text-green-700"
      case "Quietest":
        return "bg-gray-500/20 text-gray-700"
      case "Most Recent":
        return "bg-blue-500/20 text-blue-700"
      default:
        return "bg-pink-500/20 text-pink-700"
    }
  }

  return (
    <Card className="bg-white/20 backdrop-blur-xl border-white/30 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800">📅 Monthly Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {months.map((month: any, index) => {
            const badgeTitle = getBadgeTitle(month, index)
            return (
              <div key={index} className="bg-white/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-800">{month.month}</h4>
                  <Badge className={getBadgeColor(badgeTitle)}>{badgeTitle}</Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-pink-600" />
                    <span className="text-sm text-gray-600">{month.messages.toLocaleString()} messages</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-gray-600">{month.activeDays} active days</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-lg">{month.topEmoji}</span>
                    <span className="text-sm text-gray-600">Top emoji</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
