"use client"

import type { AnalysisData } from "@/types/chat"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { MessageCircle, Users, Calendar, TrendingUp } from "lucide-react"

interface ChatStatisticsProps {
  data: AnalysisData
}

export function ChatStatistics({ data }: ChatStatisticsProps) {
  const chartData = Object.entries(data.messagesByParticipant).map(([name, count]) => ({
    name: name.length > 15 ? name.substring(0, 15) + "..." : name,
    messages: count,
  }))

  const stats = [
    {
      title: "Total Messages",
      value: data.totalMessages.toLocaleString(),
      icon: MessageCircle,
      color: "text-pink-600",
    },
    {
      title: "Participants",
      value: data.participants.length.toString(),
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Days Active",
      value: data.messagesByDay.length.toString(),
      icon: Calendar,
      color: "text-indigo-600",
    },
    {
      title: "Avg Words/Message",
      value: data.averageWordsPerMessage.toFixed(1),
      icon: TrendingUp,
      color: "text-pink-600",
    },
  ]

  return (
    <Card className="bg-white/20 backdrop-blur-xl border-white/30 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800">💬 Chat Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/30 rounded-xl p-4 text-center">
              <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.title}</div>
            </div>
          ))}
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Messages by Participant</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.3)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255,255,255,0.9)",
                  border: "none",
                  borderRadius: "8px",
                  backdropFilter: "blur(10px)",
                }}
              />
              <Bar dataKey="messages" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
