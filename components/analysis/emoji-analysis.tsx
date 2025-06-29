"use client"

import type { AnalysisData } from "@/types/chat"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface EmojiAnalysisProps {
  data: AnalysisData
}

export function EmojiAnalysis({ data }: EmojiAnalysisProps) {
  // Check if we have emoji data
  if (!data.topEmojis || data.topEmojis.length === 0) {
    return (
      <Card className="bg-white/20 backdrop-blur-xl border-white/30 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">🎭 Emoji Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">😔</div>
              <div>No emojis found in your messages</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare data for pie chart
  const pieData = data.topEmojis.slice(0, 8).map((emoji, index) => ({
    name: emoji.emoji,
    value: emoji.count,
    emoji: emoji.emoji,
    fill:
      [
        "#FF6B6B", // Red
        "#4ECDC4", // Teal
        "#45B7D1", // Blue
        "#96CEB4", // Green
        "#FFEAA7", // Yellow
        "#DDA0DD", // Plum
        "#98D8C8", // Mint
        "#F7DC6F", // Light Yellow
      ][index] || "#95A5A6",
  }))

  const totalEmojiCount = data.topEmojis.reduce((sum, emoji) => sum + emoji.count, 0)

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = ((data.value / totalEmojiCount) * 100).toFixed(1)
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{data.emoji}</span>
            <div>
              <div className="font-semibold text-gray-800">{data.value} times</div>
              <div className="text-sm text-gray-600">{percentage}% of all emojis</div>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="bg-white/20 backdrop-blur-xl border-white/30 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800">🎭 Emoji Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Top Emojis</h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {data.topEmojis.slice(0, 15).map((emoji, index) => {
                const percentage = totalEmojiCount > 0 ? ((emoji.count / totalEmojiCount) * 100).toFixed(1) : "0"
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white/30 rounded-lg p-3 hover:bg-white/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="text-2xl"
                        style={{
                          fontFamily:
                            "Apple Color Emoji, Segoe UI Emoji, NotoColorEmoji, Noto Color Emoji, Segoe UI Symbol, Android Emoji, EmojiSymbols",
                        }}
                      >
                        {emoji.emoji}
                      </span>
                      <div>
                        <div className="font-medium text-gray-700">#{index + 1}</div>
                        <div className="text-xs text-gray-500">{percentage}%</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-600">{emoji.count}</div>
                      <div className="text-xs text-gray-500">times</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Usage Distribution</h4>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="#fff"
                    strokeWidth={2}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value, entry: any) => (
                      <span style={{ color: entry.color }}>
                        {entry.payload.emoji} {entry.payload.value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">😔</div>
                  <div>No emoji data available</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-800">{totalEmojiCount.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Emojis</div>
          </div>
          <div className="bg-white/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-800">{data.topEmojis.length}</div>
            <div className="text-sm text-gray-600">Unique Emojis</div>
          </div>
          <div className="bg-white/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-800">
              {data.topEmojis.length > 0 ? data.topEmojis[0].emoji : "N/A"}
            </div>
            <div className="text-sm text-gray-600">Most Used</div>
          </div>
          <div className="bg-white/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-800">
              {totalEmojiCount > 0 && data.totalMessages > 0
                ? ((totalEmojiCount / data.totalMessages) * 100).toFixed(1)
                : "0"}
              %
            </div>
            <div className="text-sm text-gray-600">Emoji Rate</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
