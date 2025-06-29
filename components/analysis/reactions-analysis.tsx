"use client"

import type { AnalysisData } from "@/types/chat"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ReactionsAnalysisProps {
  data: AnalysisData
}

export function ReactionsAnalysis({ data }: ReactionsAnalysisProps) {
  const reactionData = Object.entries(data.reactions).map(([reaction, count]) => ({
    reaction,
    count,
  }))

  const totalReactions = Object.values(data.reactions).reduce((a, b) => a + b, 0)

  return (
    <Card className="bg-white/20 backdrop-blur-xl border-white/30 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800">❤️ Reactions Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-white/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-gray-800">{totalReactions.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Reactions</div>
        </div>

        {reactionData.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Reaction Types</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reactionData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.3)" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="reaction" type="category" tick={{ fontSize: 12 }} width={60} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.9)",
                    border: "none",
                    borderRadius: "8px",
                    backdropFilter: "blur(10px)",
                  }}
                />
                <Bar dataKey="count" fill="url(#heartGradient)" radius={[0, 4, 4, 0]} />
                <defs>
                  <linearGradient id="heartGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
