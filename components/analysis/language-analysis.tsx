"use client"

import type { AnalysisData } from "@/types/chat"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface LanguageAnalysisProps {
  data: AnalysisData
}

export function LanguageAnalysis({ data }: LanguageAnalysisProps) {
  const vocabularyRichness = ((data.uniqueWords / data.totalWords) * 100).toFixed(1)

  return (
    <Card className="bg-white/20 backdrop-blur-xl border-white/30 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800">🔤 Language Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-800">{data.totalWords.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Words</div>
          </div>
          <div className="bg-white/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-800">{vocabularyRichness}%</div>
            <div className="text-sm text-gray-600">Vocabulary Richness</div>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Top Words</h4>
          <div className="flex flex-wrap gap-2">
            {data.topWords.slice(0, 15).map((word, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-gray-700 border-pink-300/50"
              >
                {word.word} ({word.count})
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
