"use client"

import { useMemo, useRef, useEffect, useState } from "react"
import type { AnalysisData } from "@/types/chat"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, RefreshCw } from "lucide-react"

interface WordCloudProps {
  data: AnalysisData
}

interface CloudItem {
  text: string
  size: number
  color: string
  isEmoji: boolean
  count: number
  weight: number
  x: number
  y: number
  width: number
  height: number
  fontWeight: number
  tier: number
  semanticCluster: string
}

interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export function WordCloud({ data }: WordCloudProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [regenerateKey, setRegenerateKey] = useState(0)

  // More vibrant color scheme with better distribution
  const getFrequencyColor = (tier: number): string => {
    switch (tier) {
      case 1:
        return "#8B0000" // Dark red for highest frequency
      case 2:
        return "#FF4500" // Orange red
      case 3:
        return "#FF8C00" // Dark orange
      case 4:
        return "#32CD32" // Lime green
      case 5:
        return "#4169E1" // Royal blue
      case 6:
        return "#9370DB" // Medium purple
      default:
        return "#708090" // Slate gray
    }
  }

  // Color assignment based on scheme
  const getWordColor = (item: CloudItem): string => {
    if (item.isEmoji) {
      return "#FF1493" // Deep pink for all emojis
    }
    return getFrequencyColor(item.tier)
  }

  // Ultra-tight collision detection
  const boxesOverlap = (box1: BoundingBox, box2: BoundingBox, padding = 1): boolean => {
    return !(
      box1.x + box1.width + padding < box2.x ||
      box2.x + box2.width + padding < box1.x ||
      box1.y + box1.height + padding < box2.y ||
      box2.y + box2.height + padding < box1.y
    )
  }

  // Ultra-tight center-outward placement
  const findTightCenterPosition = (
    item: CloudItem,
    placedItems: CloudItem[],
    canvasWidth: number,
    canvasHeight: number,
    centerX: number,
    centerY: number,
  ): { x: number; y: number } => {
    const maxRadius = Math.min(canvasWidth, canvasHeight) / 2 - 30

    // First item goes exactly in center
    if (placedItems.length === 0) {
      const centerTestX = centerX - item.width / 2
      const centerTestY = centerY - item.height / 2

      if (
        centerTestX >= 5 &&
        centerTestY >= 5 &&
        centerTestX + item.width <= canvasWidth - 5 &&
        centerTestY + item.height <= canvasHeight - 5
      ) {
        return { x: centerTestX, y: centerTestY }
      }
    }

    // Ultra-tight packing with very small steps
    const radiusStep = 2 // Very small steps for tight packing
    const startRadius = 5

    for (let radius = startRadius; radius <= maxRadius; radius += radiusStep) {
      // Many more angle positions for tight packing
      const numPositions = Math.max(8, Math.floor(radius / 2))
      const angleStep = (Math.PI * 2) / numPositions

      for (let i = 0; i < numPositions; i++) {
        const angle = i * angleStep + (Math.random() * 0.2 - 0.1) // Small random jitter

        const x = centerX + Math.cos(angle) * radius - item.width / 2
        const y = centerY + Math.sin(angle) * radius - item.height / 2

        // Check canvas bounds with minimal margin
        if (x >= 5 && y >= 5 && x + item.width <= canvasWidth - 5 && y + item.height <= canvasHeight - 5) {
          const testBox = { x, y, width: item.width, height: item.height }

          // Ultra-tight collision check (1px padding)
          const hasOverlap = placedItems.some((placedItem) => {
            const placedBox = { x: placedItem.x, y: placedItem.y, width: placedItem.width, height: placedItem.height }
            return boxesOverlap(testBox, placedBox, 1)
          })

          if (!hasOverlap) {
            return { x, y }
          }
        }
      }
    }

    // Fallback with more attempts
    for (let attempts = 0; attempts < 200; attempts++) {
      const x = 10 + Math.random() * (canvasWidth - item.width - 20)
      const y = 10 + Math.random() * (canvasHeight - item.height - 20)

      const testBox = { x, y, width: item.width, height: item.height }

      const hasOverlap = placedItems.some((placedItem) => {
        const placedBox = { x: placedItem.x, y: placedItem.y, width: placedItem.width, height: placedItem.height }
        return boxesOverlap(testBox, placedBox, 1)
      })

      if (!hasOverlap) {
        return { x, y }
      }
    }

    // Last resort
    return { x: 10, y: 10 }
  }

  // Precise text measurement with tighter bounds
  const measureText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    fontSize: number,
    fontWeight: number,
    isEmoji: boolean,
  ): { width: number; height: number } => {
    if (isEmoji) {
      ctx.font = `${fontSize}px "Apple Color Emoji", "Noto Color Emoji", "Segoe UI Emoji", sans-serif`
    } else {
      ctx.font = `${fontWeight} ${fontSize}px "SF Pro Display", "Helvetica Neue", -apple-system, BlinkMacSystemFont, Arial, sans-serif`
    }

    const metrics = ctx.measureText(text)
    return {
      width: Math.ceil(metrics.width),
      height: Math.ceil(fontSize * 0.9), // Tighter height
    }
  }

  // Better font size calculation
  const calculateFontSize = (frequency: number, maxFreq: number, minFreq: number): number => {
    const minSize = 18
    const maxSize = 72

    if (maxFreq === minFreq) return minSize

    const ratio = (frequency - minFreq) / (maxFreq - minFreq)
    const curved = Math.pow(ratio, 0.5) // Square root for better distribution

    return Math.round(minSize + (maxSize - minSize) * curved)
  }

  // NEW: Better tier calculation using position-based distribution
  const calculateTierByPosition = (index: number, totalItems: number): number => {
    const ratio = index / totalItems

    if (ratio <= 0.1) return 1 // Top 10%
    if (ratio <= 0.25) return 2 // Next 15%
    if (ratio <= 0.45) return 3 // Next 20%
    if (ratio <= 0.7) return 4 // Next 25%
    if (ratio <= 0.9) return 5 // Next 20%
    return 6 // Bottom 10%
  }

  // Semantic cluster detection
  const getSemanticCluster = (text: string): string => {
    const positiveWords = [
      "love",
      "happy",
      "good",
      "great",
      "amazing",
      "awesome",
      "best",
      "perfect",
      "wonderful",
      "nice",
      "cool",
      "fun",
    ]
    const negativeWords = [
      "hate",
      "bad",
      "terrible",
      "awful",
      "worst",
      "horrible",
      "sad",
      "angry",
      "mad",
      "stupid",
      "dumb",
    ]

    const lowerText = text.toLowerCase()

    if (positiveWords.some((word) => lowerText.includes(word))) return "positive"
    if (negativeWords.some((word) => lowerText.includes(word))) return "negative"
    if (text[0] === text[0].toUpperCase() && text.length > 2) return "names"

    return "neutral"
  }

  // Generate cloud items with proper tier calculation
  const cloudItems = useMemo(() => {
    const items: CloudItem[] = []

    const allWords = [...data.topWords.slice(0, 60)]
    const allEmojis = [...data.topEmojis.slice(0, 25)]

    if (allWords.length === 0 && allEmojis.length === 0) return []

    // Get actual min/max for proper tier calculation
    const allCounts = [...allWords.map((w) => w.count), ...allEmojis.map((e) => e.count)]
    const maxCount = Math.max(...allCounts)
    const minCount = Math.min(...allCounts)

    // Process words with position-based tier calculation
    allWords.forEach((word, index) => {
      if (word.word.length < 2) return

      const size = calculateFontSize(word.count, maxCount, minCount)
      const tier = calculateTierByPosition(index, allWords.length) // Use position instead of frequency
      const fontWeight = tier <= 2 ? 900 : tier <= 3 ? 800 : tier <= 4 ? 700 : 600
      const semanticCluster = getSemanticCluster(word.word)

      items.push({
        text: word.word,
        size,
        color: "",
        isEmoji: false,
        count: word.count,
        weight: word.count / maxCount,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        fontWeight,
        tier,
        semanticCluster,
      })
    })

    // Process emojis with position-based tier calculation
    allEmojis.forEach((emoji, index) => {
      if (["®", "©", "™"].includes(emoji.emoji)) return

      const size = calculateFontSize(emoji.count, maxCount, minCount) * 0.9
      const tier = calculateTierByPosition(index, allEmojis.length) // Use position instead of frequency

      items.push({
        text: emoji.emoji,
        size,
        color: "",
        isEmoji: true,
        count: emoji.count,
        weight: emoji.count / maxCount,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        fontWeight: 400,
        tier,
        semanticCluster: "emojis",
      })
    })

    // Sort by count (highest first) for center placement
    return items.sort((a, b) => b.count - a.count)
  }, [data, regenerateKey])

  // Generate the word cloud
  const generateWordCloud = async () => {
    if (!canvasRef.current || cloudItems.length === 0) return

    setIsGenerating(true)

    setTimeout(() => {
      const canvas = canvasRef.current!
      const ctx = canvas.getContext("2d")!

      // High DPI setup
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()

      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)

      // Clear canvas
      ctx.clearRect(0, 0, rect.width, rect.height)

      // Enable antialiasing
      ctx.textAlign = "left"
      ctx.textBaseline = "top"
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"

      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const placedItems: CloudItem[] = []

      // Process items in frequency order (highest first)
      cloudItems.forEach((item, index) => {
        // Measure text precisely
        const dimensions = measureText(ctx, item.text, item.size, item.fontWeight, item.isEmoji)
        item.width = dimensions.width
        item.height = dimensions.height

        // Assign color based on tier
        item.color = getWordColor(item)

        // Find position using tight center-outward algorithm
        const position = findTightCenterPosition(item, placedItems, rect.width, rect.height, centerX, centerY)
        item.x = position.x
        item.y = position.y

        placedItems.push(item)
      })

      // Render all items
      placedItems.forEach((item) => {
        ctx.save()

        // Set font
        if (item.isEmoji) {
          ctx.font = `${item.size}px "Apple Color Emoji", "Noto Color Emoji", "Segoe UI Emoji", sans-serif`
        } else {
          ctx.font = `${item.fontWeight} ${item.size}px "SF Pro Display", "Helvetica Neue", -apple-system, BlinkMacSystemFont, Arial, sans-serif`
        }

        ctx.fillStyle = item.color

        // Shadow for top tier words
        if (!item.isEmoji && item.tier <= 2) {
          ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
          ctx.shadowBlur = 2
          ctx.shadowOffsetX = 1
          ctx.shadowOffsetY = 1
        } else {
          ctx.shadowColor = "transparent"
          ctx.shadowBlur = 0
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 0
        }

        // Render text
        ctx.fillText(item.text, item.x, item.y)

        ctx.restore()
      })

      setIsGenerating(false)
    }, 100)
  }

  useEffect(() => {
    generateWordCloud()
  }, [cloudItems])

  const exportWordCloud = () => {
    if (!canvasRef.current) return
    const link = document.createElement("a")
    link.download = "tight-packed-word-cloud.png"
    link.href = canvasRef.current.toDataURL("image/png", 1.0)
    link.click()
  }

  const regenerate = () => {
    setRegenerateKey((prev) => prev + 1)
  }

  return (
    <Card className="bg-white/20 backdrop-blur-xl border-white/30 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-800">🎯 Frequency Word Cloud</CardTitle>
            <p className="text-sm text-gray-600">Tightly packed • Most frequent in center • Color by frequency</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={regenerate}
              variant="outline"
              size="sm"
              disabled={isGenerating}
              className="bg-white/30 border-pink-300/50"
            >
              <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
            </Button>

            <Button onClick={exportWordCloud} variant="outline" size="sm" className="bg-white/30 border-pink-300/50">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-[600px] bg-gradient-to-br from-gray-50/20 to-white/20 rounded-xl border border-gray-200/20"
            style={{ width: "100%", height: "600px" }}
          />

          {isGenerating && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">Ultra-tight packing in progress...</p>
              </div>
            </div>
          )}

          {cloudItems.length === 0 && !isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">🎯</div>
                <div>No words available for visualization</div>
              </div>
            </div>
          )}
        </div>

        {/* Updated Legend with new colors */}
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          <Badge variant="secondary" className="bg-red-800/20 text-red-800">
            <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: "#8B0000" }} />
            Tier 1: Top 10%
          </Badge>
          <Badge variant="secondary" className="bg-orange-600/20 text-orange-600">
            <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: "#FF4500" }} />
            Tier 2: 10-25%
          </Badge>
          <Badge variant="secondary" className="bg-orange-500/20 text-orange-500">
            <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: "#FF8C00" }} />
            Tier 3: 25-45%
          </Badge>
          <Badge variant="secondary" className="bg-green-500/20 text-green-500">
            <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: "#32CD32" }} />
            Tier 4: 45-70%
          </Badge>
          <Badge variant="secondary" className="bg-blue-600/20 text-blue-600">
            <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: "#4169E1" }} />
            Tier 5: 70-90%
          </Badge>
          <Badge variant="secondary" className="bg-purple-600/20 text-purple-600">
            <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: "#9370DB" }} />
            Tier 6: Bottom 10%
          </Badge>
          <Badge variant="secondary" className="bg-pink-500/20 text-pink-700">
            <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: "#FF1493" }} />
            Emojis
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
