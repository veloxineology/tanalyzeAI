"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Brain,
  Key,
  Play,
  Pause,
  RotateCcw,
  Heart,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles,
  MessageCircle,
  Target,
  Shield,
  Star,
  Eye,
  Lightbulb,
  Award,
  ChevronDown,
} from "lucide-react"
import type { ChatMessage, AnalysisData } from "@/types/chat"

interface AIAnalysisProps {
  messages: ChatMessage[]
  analysisData: AnalysisData
}

interface AIInsight {
  id: string
  title: string
  description: string
  icon: any
  category: "relationship" | "individual" | "compatibility" | "growth"
  prompt: string
  result?: string
  status: "pending" | "analyzing" | "completed" | "error"
}

interface AIAnalysisState {
  insights: AIInsight[]
  currentAnalyzing: number
  isAnalyzing: boolean
  isPaused: boolean
  apiKey: string
  lastAnalyzed: number
  totalMessages: number
}

// Add these constants at the top
const RATE_LIMIT_DELAY = 3000 // 3 seconds between requests for large datasets
const LARGE_DATASET_THRESHOLD = 5000 // Consider dataset large if >5k messages
const MAX_SAMPLE_MESSAGES = 300 // Reduce sample size for large datasets

export function AIAnalysis({ messages, analysisData }: AIAnalysisProps) {
  const [state, setState] = useState<AIAnalysisState>({
    insights: [],
    currentAnalyzing: -1,
    isAnalyzing: false,
    isPaused: false,
    apiKey: "",
    lastAnalyzed: 0,
    totalMessages: 0,
  })

  const [expandedInsights, setExpandedInsights] = useState<{ [key: string]: boolean }>({})

  // Define all analysis insights
  const analysisInsights: AIInsight[] = [
    {
      id: "relationship_dynamics",
      title: "Relationship Dynamics",
      description: "Overall relationship patterns and interaction style",
      icon: Heart,
      category: "relationship",
      prompt:
        "Analyze the overall relationship dynamics between these two people based on their chat messages. Focus on power balance, emotional connection, and interaction patterns. Do not bad reviews. Keep it mostly positive.give ",
      status: "pending",
    },
    {
      id: "communication_style",
      title: "Communication Style",
      description: "How they communicate and express themselves",
      icon: MessageCircle,
      category: "relationship",
      prompt:
        "Analyze their communication styles. How do they express emotions, handle disagreements, and maintain conversations? Are they direct or indirect communicators?Do not bad reviews. Keep it mostly positive.give",
      status: "pending",
    },
    {
      id: "emotional_intelligence",
      title: "Emotional Intelligence",
      description: "Emotional awareness and empathy levels",
      icon: Brain,
      category: "individual",
      prompt:
        "Evaluate the emotional intelligence of both participants. How well do they understand and respond to emotions? Do they show empathy and emotional support?Do not bad reviews. Keep it mostly positive.give",
      status: "pending",
    },
    {
      id: "conflict_resolution",
      title: "Conflict Resolution",
      description: "How they handle disagreements and tensions",
      icon: Shield,
      category: "relationship",
      prompt:
        "Analyze how they handle conflicts, disagreements, or tense moments. Do they resolve issues constructively or avoid confrontation?Do not bad reviews. Keep it mostly positive.give",
      status: "pending",
    },
    {
      id: "intimacy_level",
      title: "Intimacy & Closeness",
      description: "Emotional and personal intimacy indicators",
      icon: Users,
      category: "relationship",
      prompt:
        "Assess the level of intimacy and emotional closeness. Do they share personal thoughts, vulnerabilities, and deep conversations?Do not bad reviews. Keep it mostly positive.give",
      status: "pending",
    },
    {
      id: "trust_indicators",
      title: "Trust Indicators",
      description: "Signs of trust, reliability, and security",
      icon: CheckCircle,
      category: "relationship",
      prompt:
        "Identify trust indicators in their conversations. Do they rely on each other, share secrets, and show consistency in their words and actions?Do not bad reviews. Keep it mostly positive.give",
      status: "pending",
    },
    {
      id: "future_compatibility",
      title: "Future Compatibility",
      description: "Long-term relationship potential and alignment",
      icon: Target,
      category: "compatibility",
      prompt:
        "Evaluate their long-term compatibility. Do they share similar values, life goals, and visions for the future? Are they growing in the same direction?Do not bad reviews. Keep it mostly positive.give",
      status: "pending",
    },
    {
      id: "person1_strengths",
      title: `${analysisData.participants[0]}'s Strengths`,
      description: "Individual strengths and positive qualities",
      icon: Star,
      category: "individual",
      prompt: `Analyze ${analysisData.participants[0]}'s strengths based on their messages. What positive qualities, skills, and traits do they demonstrate?Do not bad reviews. Keep it mostly positive.give`,
      status: "pending",
    },
    {
      id: "person1_weaknesses",
      title: `${analysisData.participants[0]}'s Growth Areas`,
      description: "Areas for personal development and improvement",
      icon: TrendingUp,
      category: "individual",
      prompt: `Identify areas where ${analysisData.participants[0]} could grow or improve based on their communication patterns and behaviors in the chat.Do not bad reviews. Keep it mostly positive.give`,
      status: "pending",
    },
    {
      id: "person2_strengths",
      title: `${analysisData.participants[1] || "Partner"}'s Strengths`,
      description: "Individual strengths and positive qualities",
      icon: Award,
      category: "individual",
      prompt: `Analyze ${analysisData.participants[1] || "the other person"}'s strengths based on their messages. What positive qualities, skills, and traits do they demonstrate?Do not bad reviews. Keep it mostly positive.give`,
      status: "pending",
    },
    {
      id: "person2_weaknesses",
      title: `${analysisData.participants[1] || "Partner"}'s Growth Areas`,
      description: "Areas for personal development and improvement",
      icon: Lightbulb,
      category: "individual",
      prompt: `Identify areas where ${analysisData.participants[1] || "the other person"} could grow or improve based on their communication patterns and behaviors in the chat.Do not bad reviews. Keep it mostly positive.give`,
      status: "pending",
    },
    {
      id: "shared_interests",
      title: "Shared Interests & Values",
      description: "Common ground and mutual interests",
      icon: Sparkles,
      category: "compatibility",
      prompt:
        "Identify shared interests, values, hobbies, and topics they both enjoy discussing. What brings them together?Do not bad reviews. Keep it mostly positive.give",
      status: "pending",
    },
    {
      id: "growth_potential",
      title: "Relationship Growth Potential",
      description: "Capacity for relationship development",
      icon: TrendingUp,
      category: "growth",
      prompt:
        "Assess the potential for their relationship to grow and deepen. Are they both invested in improvement and development?Do not bad reviews. Keep it mostly positive.give",
      status: "pending",
    },
    {
      id: "red_flags",
      title: "Red Flags & Concerns",
      description: "Warning signs and potential issues",
      icon: AlertTriangle,
      category: "relationship",
      prompt:
        "Identify any red flags, concerning patterns, or potential issues in their communication that might need attention.Do not bad reviews. Keep it mostly positive.give",
      status: "pending",
    },
    {
      id: "relationship_health",
      title: "Relationship Health Score",
      description: "Overall relationship wellness assessment",
      icon: Heart,
      category: "relationship",
      prompt:
        "Provide an overall relationship health assessment with a score out of 10 and explain the reasoning behind the score.Do not bad reviews. Keep it mostly positive.give",
      status: "pending",
    },
    {
      id: "love_languages",
      title: "Love Language Analysis",
      description: "How they express and receive love",
      icon: Heart,
      category: "compatibility",
      prompt:
        "Analyze their love languages based on how they express affection and care. Do they use words of affirmation, quality time, physical touch references, acts of service, or gifts? Do not bad reviews. Keep it mostly positive.give",
      status: "pending",
    },
    {
      id: "attachment_style",
      title: "Attachment Styles",
      description: "Emotional attachment and bonding patterns",
      icon: Users,
      category: "individual",
      prompt:
        "Identify their attachment styles (secure, anxious, avoidant, disorganized) based on how they connect and maintain relationships.Do not bad reviews. Keep it mostly positive.give",
      status: "pending",
    },
    {
      id: "communication_frequency",
      title: "Communication Patterns",
      description: "Frequency and timing analysis",
      icon: Clock,
      category: "relationship",
      prompt:
        "Analyze their communication frequency patterns. Who initiates more? Are there patterns in response times and conversation flow?Do not bad reviews. Keep it mostly positive.give",
      status: "pending",
    },
    {
      id: "emotional_support",
      title: "Emotional Support Quality",
      description: "How they support each other emotionally",
      icon: Shield,
      category: "relationship",
      prompt:
        "Evaluate the quality of emotional support they provide each other during difficult times, celebrations, and daily life.Do not bad reviews. Keep it mostly positive.give",
      status: "pending",
    },
    {
      id: "long_term_prospects",
      title: "Long-term Relationship Prospects",
      description: "Future relationship sustainability",
      icon: Eye,
      category: "growth",
      prompt:
        "Based on all their interactions, assess the long-term prospects of their relationship. What factors support or challenge their future together?Do not bad reviews. Keep it mostly positive.give",
      status: "pending",
    },
  ]

  // Load saved data from localStorage
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("ai-analysis-data")
      const savedApiKey = localStorage.getItem("gemini-api-key")

      if (savedData) {
        const parsed = JSON.parse(savedData)
        if (parsed.totalMessages === messages.length && parsed.lastAnalyzed > Date.now() - 24 * 60 * 60 * 1000) {
          // Use cached data if it's less than 24 hours old and message count matches
          setState((prev) => ({
            ...prev,
            insights: parsed.insights || analysisInsights,
            lastAnalyzed: parsed.lastAnalyzed,
            totalMessages: parsed.totalMessages,
          }))
        } else {
          // Reset if data is stale
          setState((prev) => ({ ...prev, insights: analysisInsights }))
        }
      } else {
        setState((prev) => ({ ...prev, insights: analysisInsights }))
      }

      if (savedApiKey) {
        setState((prev) => ({ ...prev, apiKey: savedApiKey }))
      }
    } catch (error) {
      console.error("Error loading saved data:", error)
      setState((prev) => ({ ...prev, insights: analysisInsights }))
    }
  }, [messages.length])

  // Save data to localStorage
  const saveToLocalStorage = (newState: Partial<AIAnalysisState>) => {
    const dataToSave = {
      insights: newState.insights || state.insights,
      lastAnalyzed: Date.now(),
      totalMessages: messages.length,
    }
    localStorage.setItem("ai-analysis-data", JSON.stringify(dataToSave))

    if (newState.apiKey) {
      localStorage.setItem("gemini-api-key", newState.apiKey)
    }
  }

  // Prepare chat data for analysis
  const prepareChatData = () => {
    try {
      // Adjust sample size based on total messages
      const isLargeDataset = messages.length > LARGE_DATASET_THRESHOLD
      const sampleSize = isLargeDataset ? MAX_SAMPLE_MESSAGES : 200

      const sampleMessages = messages.slice(-sampleSize)
      const chatSummary = {
        totalMessages: messages.length,
        isLargeDataset,
        participants: analysisData.participants,
        timeSpan: `${Math.floor((analysisData.lastMessage - analysisData.firstMessage) / (1000 * 60 * 60 * 24))} days`,
        messagesByParticipant: analysisData.messagesByParticipant,
        topWords: analysisData.topWords.slice(0, 15), // Reduce for large datasets
        topEmojis: analysisData.topEmojis.slice(0, 8),
        recentMessages: sampleMessages.map((msg) => ({
          sender: msg.sender_name || "Unknown",
          content: msg.content?.substring(0, 150) || "", // Shorter content for large datasets
          timestamp: msg.timestamp_ms || 0,
          hasMedia: !!(msg.photos || msg.videos || msg.audio_files),
          reactions: msg.reactions?.length || 0,
        })),
      }
      return JSON.stringify(chatSummary, null, 2)
    } catch (error) {
      console.error("Error preparing chat data:", error)
      return JSON.stringify({ error: "Failed to prepare chat data" })
    }
  }

  // Call Gemini API
  const callGeminiAPI = async (prompt: string, chatData: string): Promise<string> => {
    const fullPrompt = `
You are an expert relationship analyst. Analyze the following Instagram chat data and provide insights.

Chat Data:
${chatData}

Analysis Request:
${prompt}

Please provide a detailed, thoughtful analysis in 2-3 paragraphs. Be specific and reference patterns you observe in the data. Focus on constructive insights that could help improve the relationship.
`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${state.apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: fullPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated"
  }

  // Start analysis
  const startAnalysis = async () => {
    if (!state.apiKey.trim()) {
      alert("Please enter your Gemini API key")
      return
    }

    setState((prev) => ({ ...prev, isAnalyzing: true, isPaused: false, currentAnalyzing: 0 }))

    const chatData = prepareChatData()
    const updatedInsights = [...state.insights]

    for (let i = 0; i < updatedInsights.length; i++) {
      // Check if paused
      if (state.isPaused) {
        setState((prev) => ({ ...prev, isAnalyzing: false, currentAnalyzing: -1 }))
        return
      }

      setState((prev) => ({ ...prev, currentAnalyzing: i }))

      // Update status to analyzing
      updatedInsights[i] = { ...updatedInsights[i], status: "analyzing" }
      setState((prev) => ({ ...prev, insights: [...updatedInsights] }))

      try {
        const result = await callGeminiAPI(updatedInsights[i].prompt, chatData)
        updatedInsights[i] = { ...updatedInsights[i], result, status: "completed" }
      } catch (error) {
        console.error(`Error analyzing ${updatedInsights[i].id}:`, error)
        updatedInsights[i] = {
          ...updatedInsights[i],
          result: `Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}. Please check your API key and try again.`,
          status: "error",
        }
      }

      setState((prev) => ({ ...prev, insights: [...updatedInsights] }))
      saveToLocalStorage({ insights: updatedInsights })

      // Dynamic delay based on dataset size
      const isLargeDataset = messages.length > LARGE_DATASET_THRESHOLD
      const delay = isLargeDataset ? RATE_LIMIT_DELAY : 2000

      await new Promise((resolve) => setTimeout(resolve, delay))
    }

    setState((prev) => ({ ...prev, isAnalyzing: false, currentAnalyzing: -1 }))
  }

  // Pause/Resume analysis
  const togglePause = () => {
    setState((prev) => ({ ...prev, isPaused: !prev.isPaused }))
  }

  // Reset analysis
  const resetAnalysis = () => {
    const resetInsights = analysisInsights.map((insight) => ({
      ...insight,
      result: undefined,
      status: "pending" as const,
    }))
    setState((prev) => ({
      ...prev,
      insights: resetInsights,
      isAnalyzing: false,
      isPaused: false,
      currentAnalyzing: -1,
    }))
    localStorage.removeItem("ai-analysis-data")
  }

  const completedCount = state.insights.filter((i) => i.status === "completed").length
  const progress = (completedCount / state.insights.length) * 100

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "relationship":
        return Heart
      case "individual":
        return Users
      case "compatibility":
        return Sparkles
      case "growth":
        return TrendingUp
      default:
        return Brain
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "relationship":
        return "bg-pink-500/20 text-pink-700"
      case "individual":
        return "bg-blue-500/20 text-blue-700"
      case "compatibility":
        return "bg-purple-500/20 text-purple-700"
      case "growth":
        return "bg-green-500/20 text-green-700"
      default:
        return "bg-gray-500/20 text-gray-700"
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedInsights((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <Card className="bg-white/20 backdrop-blur-xl border-white/30 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            AI Relationship Analysis
          </CardTitle>
          <p className="text-sm text-gray-600">
            Deep insights powered by Google Gemini AI • {state.insights.length} analysis parameters
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* API Key Input */}
          <div className="space-y-2">
            <Label htmlFor="api-key" className="text-sm font-medium">
              Gemini API Key
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter your free Gemini API key..."
                  value={state.apiKey}
                  onChange={(e) => setState((prev) => ({ ...prev, apiKey: e.target.value }))}
                  className="pl-10 bg-white/30 border-pink-300/50"
                />
              </div>
              <Button
                onClick={() => window.open("https://aistudio.google.com/app/apikey", "_blank")}
                variant="outline"
                className="bg-white/30 border-pink-300/50"
              >
                Get API Key
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Get your free API key from Google AI Studio. Your key is stored locally and never shared.
            </p>
          </div>

          {/* Add this after the API key section */}
          {messages.length > LARGE_DATASET_THRESHOLD && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Large dataset detected ({messages.length.toLocaleString()} messages). Analysis will use longer delays
                between requests to avoid rate limits.
              </AlertDescription>
            </Alert>
          )}

          {/* Progress & Controls */}
          {(state.isAnalyzing || completedCount > 0) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Analysis Progress: {completedCount}/{state.insights.length}
                </span>
                <span className="text-sm text-gray-600">{Math.round(progress)}% complete</span>
              </div>
              <Progress value={progress} className="h-2" />

              {state.isAnalyzing && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  Analyzing: {state.insights[state.currentAnalyzing]?.title}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {!state.isAnalyzing ? (
              <Button
                onClick={startAnalysis}
                disabled={!state.apiKey.trim()}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
              >
                <Play className="mr-2 h-4 w-4" />
                Start AI Analysis
              </Button>
            ) : (
              <Button onClick={togglePause} variant="outline" className="bg-white/30 border-purple-300/50">
                {state.isPaused ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
                {state.isPaused ? "Resume" : "Pause"}
              </Button>
            )}

            {completedCount > 0 && (
              <Button onClick={resetAnalysis} variant="outline" className="bg-white/30 border-gray-300/50">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Analysis
              </Button>
            )}
          </div>

          {state.lastAnalyzed > 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Last analyzed: {new Date(state.lastAnalyzed).toLocaleString()}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results - Replace the entire grid section */}
      <div className="space-y-4">
        <div className="bg-white/20 backdrop-blur-xl border-white/30 shadow-xl rounded-2xl p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Analysis Results</h3>
          <p className="text-sm text-gray-600">Click on any insight below to expand and view the detailed analysis</p>
        </div>

        {state.insights.map((insight, index) => {
          const IconComponent = insight.icon
          const CategoryIcon = getCategoryIcon(insight.category)
          const isExpanded = expandedInsights[insight.id] || false

          return (
            <Card key={insight.id} className="bg-white/20 backdrop-blur-xl border-white/30 shadow-xl">
              <CardHeader
                className="pb-3 cursor-pointer hover:bg-white/10 transition-colors rounded-t-xl"
                onClick={() => toggleExpand(insight.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/30 rounded-lg">
                      <IconComponent className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-800">{insight.title}</CardTitle>
                      <p className="text-sm text-gray-600">{insight.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      <CategoryIcon className="h-3 w-3 mr-1" />
                      {insight.category}
                    </Badge>
                    <div className={`transform transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  {insight.status === "pending" && (
                    <div className="text-center py-6 text-gray-500">
                      <Clock className="h-6 w-6 mx-auto mb-2 opacity-50" />
                      <p>Waiting for analysis...</p>
                    </div>
                  )}

                  {insight.status === "analyzing" && (
                    <div className="text-center py-6 text-blue-600">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p>Analyzing with AI...</p>
                    </div>
                  )}

                  {insight.status === "error" && (
                    <div className="text-center py-6 text-red-600">
                      <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
                      <p className="text-sm">Analysis failed. Please try again.</p>
                    </div>
                  )}

                  {insight.status === "completed" && insight.result && (
                    <div className="space-y-3">
                      <div className="bg-white/30 rounded-lg p-4">
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{insight.result}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        Analysis completed
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
