"use client"

import type { AnalysisData } from "@/types/chat"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface MessageTimelineProps {
  data: AnalysisData
}

export function MessageTimeline({ data }: MessageTimelineProps) {
  const timelineData = data.messagesByDay.slice(-30).map((day) => ({
    date: new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    messages: day.count,
  }))

  const hourlyData = Object.entries(data.messagesByHour).map(([hour, count]) => ({
    hour: `${hour}:00`,
    messages: count,
  }))

  return (
    <Card className="bg-white/20 backdrop-blur-xl border-white/30 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800">📈 Message Timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Last 30 Days</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.3)" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255,255,255,0.9)",
                  border: "none",
                  borderRadius: "8px",
                  backdropFilter: "blur(10px)",
                }}
              />
              <Line
                type="monotone"
                dataKey="messages"
                stroke="#ec4899"
                strokeWidth={3}
                dot={{ fill: "#ec4899", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Activity by Hour</h4>
          <div className="grid grid-cols-6 gap-2">
            {hourlyData.map((item, index) => (
              <div key={index} className="text-center">
                <div
                  className="bg-gradient-to-t from-pink-500 to-purple-500 rounded-lg mb-1"
                  style={{
                    height: `${Math.max(4, (item.messages / Math.max(...hourlyData.map((d) => d.messages))) * 60)}px`,
                  }}
                />
                <div className="text-xs text-gray-600">{item.hour}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
