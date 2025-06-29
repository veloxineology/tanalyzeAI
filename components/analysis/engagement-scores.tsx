"use client"

import type { AnalysisData } from "@/types/chat"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface EngagementScoresProps {
  data: AnalysisData
}

export function EngagementScores({ data }: EngagementScoresProps) {
  const scores = [
    {
      name: "Reply Efficiency",
      value: data.engagementScores.replyEfficiency,
      description: "How well you respond without double texting",
      color: "from-green-500 to-emerald-600",
    },
    {
      name: "Initiation Balance",
      value: data.engagementScores.initiationBalance,
      description: "Balance of who starts conversations",
      color: "from-blue-500 to-cyan-600",
    },
    {
      name: "Conversation Consistency",
      value: data.engagementScores.conversationConsistency,
      description: "How regularly you chat",
      color: "from-purple-500 to-violet-600",
    },
    {
      name: "Double Text Ratio",
      value: 100 - data.engagementScores.doubleTextRatio,
      description: "Lower is better for this metric",
      color: "from-pink-500 to-rose-600",
    },
  ]

  const getScoreLabel = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "bg-green-500/20 text-green-700" }
    if (score >= 60) return { label: "Good", color: "bg-blue-500/20 text-blue-700" }
    if (score >= 40) return { label: "Average", color: "bg-yellow-500/20 text-yellow-700" }
    return { label: "Needs Work", color: "bg-red-500/20 text-red-700" }
  }

  return (
    <Card className="bg-white/20 backdrop-blur-xl border-white/30 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800">📊 Engagement Scores</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {scores.map((score, index) => {
          const scoreLabel = getScoreLabel(score.value)
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-800">{score.name}</h4>
                  <p className="text-sm text-gray-600">{score.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">{Math.round(score.value)}</div>
                  <Badge className={scoreLabel.color}>{scoreLabel.label}</Badge>
                </div>
              </div>
              <Progress
                value={score.value}
                className="h-3 bg-white/30"
                style={{
                  background: `linear-gradient(to right, ${score.color.split(" ")[1]}, ${score.color.split(" ")[3]})`,
                }}
              />
            </div>
          )
        })}

        <div className="bg-white/30 rounded-xl p-4 mt-6">
          <h4 className="font-semibold text-gray-800 mb-2">Overall Engagement</h4>
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {Math.round(scores.reduce((acc, score) => acc + score.value, 0) / scores.length)}
            </div>
            <div className="text-sm text-gray-600">Average Score</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
