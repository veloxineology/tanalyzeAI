"use client"

import type { AnalysisData } from "@/types/chat"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { ImageIcon, Video, Mic } from "lucide-react"

interface MediaTrackingProps {
  data: AnalysisData
}

export function MediaTracking({ data }: MediaTrackingProps) {
  const mediaTypeData = Object.entries(data.mediaByType).map(([type, count]) => ({
    name: type,
    value: count,
    color: type === "photo" ? "#ec4899" : type === "video" ? "#8b5cf6" : "#06b6d4",
  }))

  const getMediaIcon = (type: string) => {
    switch (type) {
      case "photo":
        return ImageIcon
      case "video":
        return Video
      case "audio":
        return Mic
      default:
        return ImageIcon
    }
  }

  return (
    <Card className="bg-white/20 backdrop-blur-xl border-white/30 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800">📦 Media Tracking</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-white/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-gray-800">{data.mediaMessages.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Media Messages</div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {Object.entries(data.mediaByType).map(([type, count]) => {
            const Icon = getMediaIcon(type)
            return (
              <div key={type} className="bg-white/30 rounded-xl p-4 text-center">
                <Icon className="h-6 w-6 mx-auto mb-2 text-pink-600" />
                <div className="text-xl font-bold text-gray-800">{count}</div>
                <div className="text-sm text-gray-600 capitalize">{type}s</div>
              </div>
            )
          })}
        </div>

        {mediaTypeData.some((d) => d.value > 0) && (
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Media Distribution</h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={mediaTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {mediaTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
