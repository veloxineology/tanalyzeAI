"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, RotateCcw, BarChart3, MessageCircle, Clock, Play, Loader2, Brain } from "lucide-react"
import type { ChatMessage, AnalysisData } from "@/types/chat"
import { ChatStatistics } from "@/components/analysis/chat-statistics"
import { MessageTimeline } from "@/components/analysis/message-timeline"
import { LanguageAnalysis } from "@/components/analysis/language-analysis"
import { EmojiAnalysis } from "@/components/analysis/emoji-analysis"
import { ReplyBehavior } from "@/components/analysis/reply-behavior"
import { ReactionsAnalysis } from "@/components/analysis/reactions-analysis"
import { MediaTracking } from "@/components/analysis/media-tracking"
import { LinksShared } from "@/components/analysis/links-shared"
import { MonthlySummary } from "@/components/analysis/monthly-summary"
import { AIAnalysis } from "@/components/analysis/ai-analysis"
import { exportToJSON, exportToCSV, exportToPDF } from "@/utils/export"
import { ChatVisualization } from "@/components/analysis/chat-visualization"
import { WordCloud } from "@/components/analysis/word-cloud"

interface DashboardProps {
  messages: ChatMessage[]
  analysisData: AnalysisData | null
  uploadedFiles: string[]
  onReset: () => void
}

export function Dashboard({ messages, analysisData, uploadedFiles, onReset }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [chatViewLoaded, setChatViewLoaded] = useState(false)
  const [isLoadingChatView, setIsLoadingChatView] = useState(false)

  if (!analysisData) return null

  const handleExportJSON = () => {
    exportToJSON(analysisData, "instagram-chat-analysis.json")
  }

  const handleExportCSV = () => {
    exportToCSV(messages, "instagram-chat-data.csv")
  }

  const handleExportPDF = async () => {
    try {
      await exportToPDF(analysisData, messages, "instagram-chat-analysis.pdf")
    } catch (error) {
      console.error("PDF export failed:", error)
      // You could add a toast notification here
    }
  }

  const handleLoadChatView = async () => {
    setIsLoadingChatView(true)
    // Add a small delay to show loading state and allow UI to update
    await new Promise((resolve) => setTimeout(resolve, 100))
    setChatViewLoaded(true)
    setIsLoadingChatView(false)
  }

  const ChatViewPlaceholder = () => (
    <div className="bg-white/20 backdrop-blur-xl border-white/30 shadow-xl rounded-3xl overflow-hidden">
      <div className="p-12 text-center space-y-6">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto">
          <MessageCircle className="h-10 w-10 text-white" />
        </div>

        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-gray-800">Chat Visualization</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Load the interactive chat view to browse through your messages with Instagram-style interface, search
            functionality, and filters.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-lg mx-auto">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-800 text-xs font-bold">!</span>
              </div>
              <div className="text-sm text-yellow-800">
                <strong>Performance Note:</strong> With {messages.length.toLocaleString()} messages, rendering may take
                a moment and could impact performance on slower devices.
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleLoadChatView}
            disabled={isLoadingChatView}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl text-lg"
          >
            {isLoadingChatView ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading Chat View...
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5" />
                Render Chat View
              </>
            )}
          </Button>

          <div className="text-sm text-gray-500">
            This will load all {messages.length.toLocaleString()} messages for interactive browsing
          </div>
        </div>

        {/* Quick Stats Preview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-2xl mx-auto">
          <div className="bg-white/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-800">{messages.length.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Messages</div>
          </div>
          <div className="bg-white/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-800">{analysisData.participants.length}</div>
            <div className="text-sm text-gray-600">Participants</div>
          </div>
          <div className="bg-white/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-800">{analysisData.messagesByDay.length}</div>
            <div className="text-sm text-gray-600">Active Days</div>
          </div>
          <div className="bg-white/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-800">{analysisData.mediaMessages}</div>
            <div className="text-sm text-gray-600">Media Files</div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/30 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Analysis Dashboard
            </h2>
            <p className="text-gray-600 mt-1">
              {messages.length.toLocaleString()} messages from {uploadedFiles.length} files
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleExportJSON}
              variant="outline"
              className="bg-white/30 border-pink-300 text-pink-600 hover:bg-pink-50/50"
            >
              <Download className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="bg-white/30 border-pink-300 text-pink-600 hover:bg-pink-50/50"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button
              onClick={handleExportPDF}
              variant="outline"
              className="bg-white/30 border-purple-300 text-purple-600 hover:bg-purple-50/50"
            >
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button
              onClick={onReset}
              variant="outline"
              className="bg-white/30 border-gray-300 text-gray-600 hover:bg-gray-50/50"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              New Analysis
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-2 shadow-xl border border-white/30">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 bg-transparent gap-1">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-700 text-gray-600"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="ai-analysis"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-700 text-gray-600"
            >
              <Brain className="mr-2 h-4 w-4" />
              AI Analysis
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-700 text-gray-600"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat View
              {!chatViewLoaded && <span className="ml-1 w-2 h-2 bg-orange-400 rounded-full animate-pulse" />}
            </TabsTrigger>
            <TabsTrigger
              value="messages"
              className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-700 text-gray-600"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger
              value="behavior"
              className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-700 text-gray-600"
            >
              <Clock className="mr-2 h-4 w-4" />
              Behavior
            </TabsTrigger>
            <TabsTrigger
              value="media"
              className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-700 text-gray-600"
            >
              Media & Links
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChatStatistics data={analysisData} />
            <ReactionsAnalysis data={analysisData} />
          </div>
          <MonthlySummary data={analysisData} />
        </TabsContent>

        <TabsContent value="ai-analysis" className="space-y-6">
          <AIAnalysis messages={messages} analysisData={analysisData} />
        </TabsContent>

        <TabsContent value="chat" className="space-y-6">
          {chatViewLoaded ? (
            <div className="space-y-4">
              {/* Chat View Controls */}
              <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-white/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-gray-700">
                      Chat view loaded • {messages.length.toLocaleString()} messages
                    </span>
                  </div>
                  <Button
                    onClick={() => setChatViewLoaded(false)}
                    variant="outline"
                    size="sm"
                    className="bg-white/30 border-gray-300 text-gray-600 hover:bg-gray-50/50"
                  >
                    Unload Chat View
                  </Button>
                </div>
              </div>
              <ChatVisualization messages={messages} />
            </div>
          ) : (
            <ChatViewPlaceholder />
          )}
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MessageTimeline data={analysisData} />
            <LanguageAnalysis data={analysisData} />
          </div>
          <EmojiAnalysis data={analysisData} />
          {/* Full width word cloud */}
          <WordCloud data={analysisData} />
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <ReplyBehavior data={analysisData} />
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MediaTracking data={analysisData} />
            <LinksShared data={analysisData} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
