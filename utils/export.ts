import type { AnalysisData, ChatMessage } from "@/types/chat"
import jsPDF from "jspdf"

export function exportToJSON(data: AnalysisData, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportToCSV(messages: ChatMessage[], filename: string) {
  const headers = ["timestamp", "sender", "content", "type", "reactions_count", "media_count"]
  const rows = messages.map((msg) => [
    msg.timestamp_ms ? new Date(msg.timestamp_ms).toISOString() : "",
    msg.sender_name || "",
    (msg.content || "").replace(/"/g, '""'),
    msg.type || "text",
    msg.reactions?.length || 0,
    (msg.photos?.length || 0) + (msg.videos?.length || 0) + (msg.audio_files?.length || 0),
  ])

  const csvContent = [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

  const blob = new Blob([csvContent], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Helper function to convert emoji to text description for PDF
function emojiToText(emoji: string): string {
  const emojiMap: Record<string, string> = {
    "❤️": "Red Heart",
    "😂": "Crying Laughing",
    "😍": "Heart Eyes",
    "🥰": "Smiling Heart Eyes",
    "😘": "Kiss",
    "😊": "Smiling",
    "👍": "Thumbs Up",
    "👎": "Thumbs Down",
    "🔥": "Fire",
    "💯": "100",
    "😭": "Crying",
    "😎": "Cool",
    "🤔": "Thinking",
    "😴": "Sleeping",
    "🙄": "Eye Roll",
    "😤": "Huffing",
    "🤣": "Rolling Laughing",
    "😜": "Winking Tongue",
    "😏": "Smirking",
    "🥺": "Pleading",
    "🤗": "Hugging",
    "😌": "Relieved",
    "😋": "Yummy",
    "🤤": "Drooling",
    "😈": "Devil",
    "👀": "Eyes",
    "🙈": "See No Evil",
    "🙉": "Hear No Evil",
    "🙊": "Speak No Evil",
    "💀": "Skull",
    "👻": "Ghost",
    "🤡": "Clown",
    "💩": "Poop",
    "🌟": "Star",
    "⭐": "Star",
    "✨": "Sparkles",
    "💫": "Dizzy",
    "🌈": "Rainbow",
    "🎉": "Party",
    "🎊": "Confetti",
    "🎈": "Balloon",
    "🎁": "Gift",
    "🎂": "Birthday Cake",
    "🍰": "Cake",
    "🍕": "Pizza",
    "🍔": "Burger",
    "🍟": "Fries",
    "🍿": "Popcorn",
    "☕": "Coffee",
    "🍺": "Beer",
    "🍷": "Wine",
    "🥂": "Cheers",
    "💋": "Kiss Mark",
    "💕": "Two Hearts",
    "💖": "Sparkling Heart",
    "💗": "Growing Heart",
    "💘": "Heart Arrow",
    "💙": "Blue Heart",
    "💚": "Green Heart",
    "💛": "Yellow Heart",
    "🧡": "Orange Heart",
    "💜": "Purple Heart",
    "🖤": "Black Heart",
    "🤍": "White Heart",
    "🤎": "Brown Heart",
    "💔": "Broken Heart",
    "❣️": "Heart Exclamation",
    "💯": "Hundred",
    "💢": "Anger",
    "💥": "Explosion",
    "💦": "Sweat Drops",
    "💨": "Dash",
    "🕳️": "Hole",
    "💣": "Bomb",
    "💤": "Zzz",
  }

  return emojiMap[emoji] || emoji
}

export async function exportToPDF(analysisData: AnalysisData, messages: ChatMessage[], filename: string) {
  try {
    const pdf = new jsPDF("p", "mm", "a4")
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 15
    let yPosition = margin

    // Helper function to add text with word wrapping
    const addText = (text: string, fontSize = 10, isBold = false, color = [0, 0, 0]) => {
      pdf.setFontSize(fontSize)
      if (isBold) pdf.setFont(undefined, "bold")
      else pdf.setFont(undefined, "normal")
      pdf.setTextColor(color[0], color[1], color[2])

      const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin)

      if (yPosition + lines.length * fontSize * 0.35 > pageHeight - margin) {
        pdf.addPage()
        yPosition = margin
      }

      pdf.text(lines, margin, yPosition)
      yPosition += lines.length * fontSize * 0.35 + 3
    }

    // Helper function to add section header
    const addSectionHeader = (title: string) => {
      yPosition += 8
      pdf.setFillColor(236, 72, 153) // Pink background
      pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 8, "F")
      pdf.setTextColor(255, 255, 255)
      addText(title, 14, true, [255, 255, 255])
      pdf.setTextColor(0, 0, 0)
      yPosition += 3
    }

    // Helper function to add subsection
    const addSubsection = (title: string) => {
      yPosition += 5
      addText(title, 12, true, [139, 69, 19]) // Brown color
    }

    // Helper function to add data table
    const addDataTable = (data: Array<[string, string]>, title?: string) => {
      if (title) addSubsection(title)

      data.forEach(([key, value]) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage()
          yPosition = margin
        }

        pdf.setFont(undefined, "normal")
        pdf.text(`• ${key}:`, margin + 5, yPosition)
        pdf.setFont(undefined, "bold")
        pdf.text(value, margin + 60, yPosition)
        yPosition += 5
      })
      yPosition += 3
    }

    // Title Page
    pdf.setFillColor(236, 72, 153)
    pdf.rect(0, 0, pageWidth, 60, "F")

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(28)
    pdf.setFont(undefined, "bold")
    pdf.text("Instagram Chat Analysis", pageWidth / 2, 25, { align: "center" })

    pdf.setFontSize(16)
    pdf.text("Complete Data Report", pageWidth / 2, 35, { align: "center" })

    pdf.setFontSize(12)
    pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 45, { align: "center" })
    pdf.text(`Powered by tanalyseAI`, pageWidth / 2, 52, { align: "center" })

    yPosition = 70
    pdf.setTextColor(0, 0, 0)

    // Executive Summary
    addSectionHeader("📊 EXECUTIVE SUMMARY")
    addDataTable([
      ["Total Messages", analysisData.totalMessages.toLocaleString()],
      ["Participants", analysisData.participants.join(", ")],
      [
        "Analysis Period",
        `${Math.floor((analysisData.lastMessage - analysisData.firstMessage) / (1000 * 60 * 60 * 24))} days`,
      ],
      ["First Message", new Date(analysisData.firstMessage).toLocaleDateString()],
      ["Last Message", new Date(analysisData.lastMessage).toLocaleDateString()],
      ["Active Days", analysisData.messagesByDay.length.toString()],
      ["Average Messages/Day", Math.round(analysisData.totalMessages / analysisData.messagesByDay.length).toString()],
    ])

    // Detailed Statistics
    addSectionHeader("💬 MESSAGE STATISTICS")

    addSubsection("Overall Metrics")
    addDataTable([
      ["Total Words", analysisData.totalWords.toLocaleString()],
      ["Unique Words", analysisData.uniqueWords.toLocaleString()],
      ["Vocabulary Richness", `${((analysisData.uniqueWords / analysisData.totalWords) * 100).toFixed(1)}%`],
      ["Average Words per Message", analysisData.averageWordsPerMessage.toFixed(1)],
      ["Media Messages", analysisData.mediaMessages.toString()],
      ["Links Shared", analysisData.linksShared.length.toString()],
    ])

    addSubsection("Messages by Participant")
    const participantData = Object.entries(analysisData.messagesByParticipant).map(([name, count]) => {
      const percentage = ((count / analysisData.totalMessages) * 100).toFixed(1)
      return [name, `${count.toLocaleString()} (${percentage}%)`]
    })
    addDataTable(participantData)

    // Communication Patterns
    addSectionHeader("🕒 COMMUNICATION PATTERNS")

    addSubsection("Conversation Starters")
    const starterData = Object.entries(analysisData.conversationStarters).map(([name, count]) => [
      name,
      `${count} conversations started`,
    ])
    addDataTable(starterData)

    addSubsection("Double Text Analysis")
    const doubleTextData = Object.entries(analysisData.doubleTexts).map(([name, count]) => [
      name,
      `${count} double texts`,
    ])
    addDataTable(doubleTextData)

    addSubsection("Peak Activity Hours")
    const topHours = Object.entries(analysisData.messagesByHour)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([hour, count]) => [`${hour}:00`, `${count} messages`])
    addDataTable(topHours, "Most Active Hours")

    // Language Analysis
    addSectionHeader("🔤 LANGUAGE ANALYSIS")

    addSubsection("Top 20 Words")
    analysisData.topWords.slice(0, 20).forEach((word, index) => {
      if (yPosition > pageHeight - 10) {
        pdf.addPage()
        yPosition = margin
      }
      addText(`${index + 1}. ${word.word}: ${word.count} times`, 9)
    })

    // Emoji Analysis
    addSectionHeader("😀 EMOJI ANALYSIS")

    const totalEmojis = analysisData.topEmojis.reduce((sum, emoji) => sum + emoji.count, 0)
    addDataTable([
      ["Total Emojis Used", totalEmojis.toLocaleString()],
      ["Unique Emojis", analysisData.topEmojis.length.toString()],
      ["Emoji Rate", `${((totalEmojis / analysisData.totalMessages) * 100).toFixed(1)}% of messages`],
    ])

    addSubsection("Top 15 Emojis")
    analysisData.topEmojis.slice(0, 15).forEach((emoji, index) => {
      const percentage = totalEmojis > 0 ? ((emoji.count / totalEmojis) * 100).toFixed(1) : "0"
      addText(`${index + 1}. ${emojiToText(emoji.emoji)} (${emoji.emoji}): ${emoji.count} times (${percentage}%)`, 9)
    })

    // Reactions Analysis
    if (Object.keys(analysisData.reactions).length > 0) {
      addSectionHeader("❤️ REACTIONS ANALYSIS")

      const totalReactions = Object.values(analysisData.reactions).reduce((a, b) => a + b, 0)
      addDataTable([["Total Reactions", totalReactions.toLocaleString()]])

      addSubsection("Reaction Breakdown")
      Object.entries(analysisData.reactions).forEach(([reaction, count]) => {
        const percentage = ((count / totalReactions) * 100).toFixed(1)
        addText(`${emojiToText(reaction)} (${reaction}): ${count} times (${percentage}%)`, 9)
      })
    }

    // Media Analysis
    addSectionHeader("📱 MEDIA ANALYSIS")

    addDataTable([
      ["Total Media Files", analysisData.mediaMessages.toString()],
      ["Photos", analysisData.mediaByType.photo?.toString() || "0"],
      ["Videos", analysisData.mediaByType.video?.toString() || "0"],
      ["Audio Files", analysisData.mediaByType.audio?.toString() || "0"],
    ])

    addSubsection("Media by Participant")
    const mediaParticipantData = Object.entries(analysisData.mediaByParticipant).map(([name, count]) => [
      name,
      `${count} media files`,
    ])
    addDataTable(mediaParticipantData)

    // Links Analysis
    if (analysisData.linksShared.length > 0) {
      addSectionHeader("🔗 LINKS ANALYSIS")

      addDataTable([["Total Links Shared", analysisData.linksShared.length.toString()]])

      addSubsection("Top Domains")
      const topDomains = Object.entries(analysisData.linksByDomain)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([domain, count]) => [domain, `${count} links`])
      addDataTable(topDomains)

      addSubsection("Recent Links (Last 10)")
      analysisData.linksShared.slice(-10).forEach((link, index) => {
        addText(`${index + 1}. ${link.sender}: ${link.url.substring(0, 60)}${link.url.length > 60 ? "..." : ""}`, 8)
      })
    }

    // Engagement Scores
    addSectionHeader("📈 ENGAGEMENT ANALYSIS")

    addDataTable([
      ["Reply Efficiency", `${Math.round(analysisData.engagementScores.replyEfficiency)}%`],
      ["Initiation Balance", `${Math.round(analysisData.engagementScores.initiationBalance)}%`],
      ["Conversation Consistency", `${Math.round(analysisData.engagementScores.conversationConsistency)}%`],
      ["Double Text Ratio", `${Math.round(analysisData.engagementScores.doubleTextRatio)}%`],
      [
        "Overall Engagement Score",
        `${Math.round((analysisData.engagementScores.replyEfficiency + analysisData.engagementScores.initiationBalance + analysisData.engagementScores.conversationConsistency + (100 - analysisData.engagementScores.doubleTextRatio)) / 4)}%`,
      ],
    ])

    // Monthly Activity
    addSectionHeader("📅 ACTIVITY TIMELINE")

    // Group messages by month
    const monthlyActivity = analysisData.messagesByDay.reduce(
      (acc, day) => {
        const date = new Date(day.date)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        const monthName = date.toLocaleDateString("en-US", { year: "numeric", month: "long" })

        if (!acc[monthKey]) {
          acc[monthKey] = { month: monthName, messages: 0, days: 0 }
        }
        acc[monthKey].messages += day.count
        acc[monthKey].days += 1
        return acc
      },
      {} as Record<string, any>,
    )

    addSubsection("Monthly Breakdown")
    Object.values(monthlyActivity)
      .slice(-12)
      .forEach((month: any) => {
        addText(`${month.month}: ${month.messages.toLocaleString()} messages across ${month.days} days`, 9)
      })

    // Technical Details
    addSectionHeader("🔧 TECHNICAL DETAILS")

    const totalReactions = Object.values(analysisData.reactions).reduce((a, b) => a + b, 0)
    addDataTable([
      ["Analysis Date", new Date().toLocaleString()],
      ["Data Processing", "100% Local (Privacy Protected)"],
      ["File Format", "Instagram JSON Export"],
      ["Analysis Engine", "tanalyseAI v2.0"],
      [
        "Total Data Points",
        (analysisData.totalMessages + totalEmojis + totalReactions + analysisData.mediaMessages).toLocaleString(),
      ],
    ])

    // Footer on last page
    yPosition = pageHeight - 30
    pdf.setFontSize(8)
    pdf.setTextColor(128, 128, 128)
    pdf.text("Generated by tanalyseAI - Instagram Chat Analyzer", pageWidth / 2, yPosition, { align: "center" })
    pdf.text("Your data stays private - 100% offline analysis", pageWidth / 2, yPosition + 5, { align: "center" })
    pdf.text(
      `Report contains ${pdf.getNumberOfPages()} pages of comprehensive analysis`,
      pageWidth / 2,
      yPosition + 10,
      { align: "center" },
    )

    // Save the PDF
    pdf.save(filename)
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw new Error("Failed to generate comprehensive PDF report")
  }
}
