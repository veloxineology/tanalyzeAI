"use client"

import type { AnalysisData } from "@/types/chat"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ReplyBehaviorProps {
  data: AnalysisData
}

export function ReplyBehavior({ data }: ReplyBehaviorProps) {
  const starterData = Object.entries(data.conversationStarters).map(([name, count]) => ({
    name: name.length > 15 ? name.substring(0, 15) + "..." : name,
    conversations: count,
  }))

  const doubleTextData = Object.entries(data.doubleTexts).map(([name, count]) => ({
    name: name.length > 15 ? name.substring(0, 15) + "..." : name,
    doubleTexts: count,
  }))

  return (
    <Card className="bg-white/20 backdrop-blur-xl border-white/30 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800">🕒 Reply Behavior</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Conversation Starters</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={starterData}>
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
                <Bar dataKey="conversations" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Double Texts</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={doubleTextData}>
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
                <Bar dataKey="doubleTexts" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
