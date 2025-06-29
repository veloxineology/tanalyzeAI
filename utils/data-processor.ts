import type { ChatMessage, AnalysisData } from "@/types/chat"
import { decodeInstagramText, fixInstagramEncoding } from "./text-processor"

export function processMessages(messages: ChatMessage[]): AnalysisData {
  const participants = Array.from(new Set(messages.map((m) => m.sender_name).filter(Boolean)))
  const messagesByParticipant: Record<string, number> = {}
  const conversationStarters: Record<string, number> = {}
  const doubleTexts: Record<string, number> = {}
  const reactions: Record<string, number> = {}
  const reactionsByParticipant: Record<string, Record<string, number>> = {}
  const emojisByParticipant: Record<string, Record<string, number>> = {}
  const mediaByParticipant: Record<string, number> = {}
  const linksShared: Array<{ url: string; sender: string; timestamp: number }> = []
  const linksByDomain: Record<string, number> = {}
  const messagesByDay: Array<{ date: string; count: number }> = []
  const messagesByHour: Record<number, number> = {}
  const monthlySummary: Array<{
    month: string
    messages: number
    reactions: number
    topEmoji: string
    activeDays: number
    mediaShared: number
  }> = []

  // Initialize participant data
  participants.forEach((p) => {
    messagesByParticipant[p] = 0
    conversationStarters[p] = 0
    doubleTexts[p] = 0
    reactionsByParticipant[p] = {}
    emojisByParticipant[p] = {}
    mediaByParticipant[p] = 0
  })

  let totalWords = 0
  const wordCounts: Record<string, number> = {}
  const emojiCounts: Record<string, number> = {}
  let mediaMessages = 0
  const mediaByType: Record<string, number> = { photo: 0, video: 0, audio: 0 }

  // Enhanced emoji extraction function
  const extractEmojis = (text: string): string[] => {
    if (!text) return []

    // First decode Instagram text
    const decodedText = decodeInstagramText(text)
    const processedText = fixInstagramEncoding(decodedText)

    const emojis: string[] = []

    // Method 1: Unicode emoji regex (most comprehensive)
    const emojiRegex =
      /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g

    const unicodeEmojis = processedText.match(emojiRegex) || []
    emojis.push(...unicodeEmojis)

    // Method 2: Check for common emojis by their actual Unicode values
    const commonEmojiPatterns = [
      // Hearts
      { pattern: /❤️/g, emoji: "❤️" },
      { pattern: /❤/g, emoji: "❤️" },
      { pattern: /💕/g, emoji: "💕" },
      { pattern: /💖/g, emoji: "💖" },
      { pattern: /💗/g, emoji: "💗" },
      { pattern: /💘/g, emoji: "💘" },
      { pattern: /💙/g, emoji: "💙" },
      { pattern: /💚/g, emoji: "💚" },
      { pattern: /💛/g, emoji: "💛" },
      { pattern: /🧡/g, emoji: "🧡" },
      { pattern: /💜/g, emoji: "💜" },
      { pattern: /🖤/g, emoji: "🖤" },
      { pattern: /🤍/g, emoji: "🤍" },
      { pattern: /🤎/g, emoji: "🤎" },
      { pattern: /💔/g, emoji: "💔" },

      // Faces
      { pattern: /😂/g, emoji: "😂" },
      { pattern: /😭/g, emoji: "😭" },
      { pattern: /😍/g, emoji: "😍" },
      { pattern: /🥰/g, emoji: "🥰" },
      { pattern: /😘/g, emoji: "😘" },
      { pattern: /😊/g, emoji: "😊" },
      { pattern: /😎/g, emoji: "😎" },
      { pattern: /🤔/g, emoji: "🤔" },
      { pattern: /😴/g, emoji: "😴" },
      { pattern: /🙄/g, emoji: "🙄" },
      { pattern: /😤/g, emoji: "😤" },
      { pattern: /🤣/g, emoji: "🤣" },
      { pattern: /😜/g, emoji: "😜" },
      { pattern: /😏/g, emoji: "😏" },
      { pattern: /🥺/g, emoji: "🥺" },
      { pattern: /🤗/g, emoji: "🤗" },
      { pattern: /😌/g, emoji: "😌" },
      { pattern: /😋/g, emoji: "😋" },
      { pattern: /🤤/g, emoji: "🤤" },
      { pattern: /😈/g, emoji: "😈" },

      // Gestures
      { pattern: /👍/g, emoji: "👍" },
      { pattern: /👎/g, emoji: "👎" },
      { pattern: /👀/g, emoji: "👀" },
      { pattern: /🙈/g, emoji: "🙈" },
      { pattern: /🙉/g, emoji: "🙉" },
      { pattern: /🙊/g, emoji: "🙊" },

      // Objects
      { pattern: /🔥/g, emoji: "🔥" },
      { pattern: /💯/g, emoji: "💯" },
      { pattern: /💀/g, emoji: "💀" },
      { pattern: /👻/g, emoji: "👻" },
      { pattern: /🤡/g, emoji: "🤡" },
      { pattern: /💩/g, emoji: "💩" },
      { pattern: /🌟/g, emoji: "🌟" },
      { pattern: /⭐/g, emoji: "⭐" },
      { pattern: /✨/g, emoji: "✨" },
      { pattern: /💫/g, emoji: "💫" },
      { pattern: /🌈/g, emoji: "🌈" },

      // Party
      { pattern: /🎉/g, emoji: "🎉" },
      { pattern: /🎊/g, emoji: "🎊" },
      { pattern: /🎈/g, emoji: "🎈" },
      { pattern: /🎁/g, emoji: "🎁" },
      { pattern: /🎂/g, emoji: "🎂" },

      // Food
      { pattern: /🍰/g, emoji: "🍰" },
      { pattern: /🍕/g, emoji: "🍕" },
      { pattern: /🍔/g, emoji: "🍔" },
      { pattern: /🍟/g, emoji: "🍟" },
      { pattern: /🍿/g, emoji: "🍿" },
      { pattern: /☕/g, emoji: "☕" },
      { pattern: /🍺/g, emoji: "🍺" },
      { pattern: /🍷/g, emoji: "🍷" },
      { pattern: /🥂/g, emoji: "🥂" },

      // Misc
      { pattern: /💋/g, emoji: "💋" },
      { pattern: /💢/g, emoji: "💢" },
      { pattern: /💥/g, emoji: "💥" },
      { pattern: /💦/g, emoji: "💦" },
      { pattern: /💨/g, emoji: "💨" },
      { pattern: /💣/g, emoji: "💣" },
      { pattern: /💤/g, emoji: "💤" },
    ]

    commonEmojiPatterns.forEach(({ pattern, emoji }) => {
      const matches = processedText.match(pattern)
      if (matches) {
        emojis.push(...matches.map(() => emoji))
      }
    })

    // Method 3: Check for Instagram's encoded emojis
    const instagramEmojiPatterns = [
      // Heart patterns in Instagram encoding
      { pattern: /\u00f0\u009f\u0092\u0095/g, emoji: "💕" },
      { pattern: /\u00f0\u009f\u0092\u0096/g, emoji: "💖" },
      { pattern: /\u00f0\u009f\u0092\u0097/g, emoji: "💗" },
      { pattern: /\u00f0\u009f\u0092\u0098/g, emoji: "💘" },
      { pattern: /\u00f0\u009f\u0092\u0099/g, emoji: "💙" },
      { pattern: /\u00f0\u009f\u0092\u009a/g, emoji: "💚" },
      { pattern: /\u00f0\u009f\u0092\u009b/g, emoji: "💛" },
      { pattern: /\u00f0\u009f\u0092\u009c/g, emoji: "💜" },
      { pattern: /\u00f0\u009f\u0092\u009d/g, emoji: "💝" },
      { pattern: /\u00f0\u009f\u0092\u009e/g, emoji: "💞" },
      { pattern: /\u00f0\u009f\u0092\u009f/g, emoji: "💟" },

      // Face patterns
      { pattern: /\u00f0\u009f\u0098\u0082/g, emoji: "😂" },
      { pattern: /\u00f0\u009f\u0098\u008d/g, emoji: "😍" },
      { pattern: /\u00f0\u009f\u00a5\u00b0/g, emoji: "🥰" },
      { pattern: /\u00f0\u009f\u0098\u0098/g, emoji: "😘" },
      { pattern: /\u00f0\u009f\u0098\u008a/g, emoji: "😊" },
      { pattern: /\u00f0\u009f\u0098\u008e/g, emoji: "😎" },
      { pattern: /\u00f0\u009f\u00a4\u0094/g, emoji: "🤔" },
      { pattern: /\u00f0\u009f\u0098\u00b4/g, emoji: "😴" },
      { pattern: /\u00f0\u009f\u0099\u0084/g, emoji: "🙄" },
      { pattern: /\u00f0\u009f\u0098\u00a4/g, emoji: "😤" },
      { pattern: /\u00f0\u009f\u00a4\u00a3/g, emoji: "🤣" },
      { pattern: /\u00f0\u009f\u0098\u009c/g, emoji: "😜" },
      { pattern: /\u00f0\u009f\u0098\u008f/g, emoji: "😏" },
      { pattern: /\u00f0\u009f\u00a5\u00ba/g, emoji: "🥺" },

      // Fire and 100
      { pattern: /\u00f0\u009f\u0094\u00a5/g, emoji: "🔥" },
      { pattern: /\u00f0\u009f\u0092\u00af/g, emoji: "💯" },

      // Thumbs
      { pattern: /\u00f0\u009f\u0091\u008d/g, emoji: "👍" },
      { pattern: /\u00f0\u009f\u0091\u008e/g, emoji: "👎" },

      // Eyes
      { pattern: /\u00f0\u009f\u0091\u0080/g, emoji: "👀" },
    ]

    instagramEmojiPatterns.forEach(({ pattern, emoji }) => {
      const matches = text.match(pattern) // Use original text for Instagram patterns
      if (matches) {
        emojis.push(...matches.map(() => emoji))
      }
    })

    // Method 4: Check for byte-encoded emojis (Instagram's specific format)
    const bytePatterns = [
      // Common Instagram byte patterns for emojis
      { bytes: [240, 159, 152, 130], emoji: "😂" },
      { bytes: [240, 159, 152, 141], emoji: "😍" },
      { bytes: [240, 159, 165, 176], emoji: "🥰" },
      { bytes: [240, 159, 152, 152], emoji: "😘" },
      { bytes: [240, 159, 152, 138], emoji: "😊" },
      { bytes: [240, 159, 145, 141], emoji: "👍" },
      { bytes: [240, 159, 148, 165], emoji: "🔥" },
      { bytes: [240, 159, 146, 175], emoji: "💯" },
      { bytes: [226, 157, 164, 239, 184, 143], emoji: "❤️" },
      { bytes: [226, 157, 164], emoji: "❤️" },
    ]

    // Convert text to bytes and check patterns
    const textBytes = Array.from(new TextEncoder().encode(text))
    bytePatterns.forEach(({ bytes, emoji }) => {
      let index = 0
      while (index < textBytes.length - bytes.length + 1) {
        let match = true
        for (let i = 0; i < bytes.length; i++) {
          if (textBytes[index + i] !== bytes[i]) {
            match = false
            break
          }
        }
        if (match) {
          emojis.push(emoji)
          index += bytes.length
        } else {
          index++
        }
      }
    })

    // Filter out invalid characters and duplicates
    const validEmojis = emojis.filter(
      (emoji) => emoji && emoji.length > 0 && !["®", "©", "™", "℗", "℠"].includes(emoji) && emoji.trim().length > 0,
    )

    return validEmojis
  }

  // Process each message
  messages.forEach((message, index) => {
    const sender = message.sender_name
    if (!sender) return

    messagesByParticipant[sender]++

    // Process timestamp
    if (message.timestamp_ms) {
      const date = new Date(message.timestamp_ms)
      const hour = date.getHours()
      messagesByHour[hour] = (messagesByHour[hour] || 0) + 1

      const dayKey = date.toISOString().split("T")[0]
      const existingDay = messagesByDay.find((d) => d.date === dayKey)
      if (existingDay) {
        existingDay.count++
      } else {
        messagesByDay.push({ date: dayKey, count: 1 })
      }
    }

    // Process content
    if (message.content) {
      // Extract emojis using our enhanced function
      const emojis = extractEmojis(message.content)

      emojis.forEach((emoji) => {
        emojiCounts[emoji] = (emojiCounts[emoji] || 0) + 1
        if (!emojisByParticipant[sender][emoji]) {
          emojisByParticipant[sender][emoji] = 0
        }
        emojisByParticipant[sender][emoji]++
      })

      // Process words (decode text first, then remove emojis)
      const decodedContent = decodeInstagramText(message.content)
      const processedContent = fixInstagramEncoding(decodedContent)

      // Remove emojis from text before word processing
      const textWithoutEmojis = processedContent.replace(
        /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]/gu,
        " ",
      )

      const words = textWithoutEmojis
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 0)
      totalWords += words.length

      words.forEach((word) => {
        // Remove punctuation and filter out short words
        const cleanWord = word.replace(/[^\w]/g, "")
        if (
          cleanWord.length > 2 &&
          ![
            "the",
            "and",
            "for",
            "are",
            "but",
            "not",
            "you",
            "all",
            "can",
            "had",
            "her",
            "was",
            "one",
            "our",
            "out",
            "day",
            "get",
            "has",
            "him",
            "his",
            "how",
            "its",
            "may",
            "new",
            "now",
            "old",
            "see",
            "two",
            "who",
            "boy",
            "did",
            "man",
            "men",
            "put",
            "say",
            "she",
            "too",
            "use",
            "that",
            "this",
            "will",
            "with",
            "have",
            "from",
            "they",
            "know",
            "want",
            "been",
            "good",
            "much",
            "some",
            "time",
            "very",
            "when",
            "come",
            "here",
            "just",
            "like",
            "long",
            "make",
            "many",
            "over",
            "such",
            "take",
            "than",
            "them",
            "well",
            "were",
          ].includes(cleanWord)
        ) {
          wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1
        }
      })
    }

    // Process reactions
    if (message.reactions) {
      message.reactions.forEach((reaction) => {
        reactions[reaction.reaction] = (reactions[reaction.reaction] || 0) + 1
        if (!reactionsByParticipant[reaction.actor]) {
          reactionsByParticipant[reaction.actor] = {}
        }
        reactionsByParticipant[reaction.actor][reaction.reaction] =
          (reactionsByParticipant[reaction.actor][reaction.reaction] || 0) + 1
      })
    }

    // Process media
    if (message.photos || message.videos || message.audio_files) {
      mediaMessages++
      mediaByParticipant[sender]++

      if (message.photos) mediaByType.photo += message.photos.length
      if (message.videos) mediaByType.video += message.videos.length
      if (message.audio_files) mediaByType.audio += message.audio_files.length
    }

    // Process links
    if (message.share?.link) {
      try {
        const url = new URL(message.share.link)
        const domain = url.hostname
        linksByDomain[domain] = (linksByDomain[domain] || 0) + 1
        linksShared.push({
          url: message.share.link,
          sender,
          timestamp: message.timestamp_ms || 0,
        })
      } catch (e) {
        // Invalid URL
      }
    }

    // Check for conversation starters (first message after 12+ hour gap)
    if (index > 0) {
      const prevMessage = messages[index - 1]
      const timeDiff = (message.timestamp_ms || 0) - (prevMessage.timestamp_ms || 0)
      if (timeDiff > 12 * 60 * 60 * 1000) {
        // 12 hours
        conversationStarters[sender]++
      }
    }

    // Check for double texts (consecutive messages from same sender)
    if (index > 0) {
      const prevMessage = messages[index - 1]
      if (prevMessage.sender_name === sender) {
        doubleTexts[sender]++
      }
    }
  })

  // Calculate derived metrics
  const topWords = Object.entries(wordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 100)
    .map(([word, count]) => ({ word, count }))

  const topEmojis = Object.entries(emojiCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 50)
    .map(([emoji, count]) => ({ emoji, count }))

  // Calculate engagement scores
  const totalParticipants = participants.length
  const totalConversationStarts = Object.values(conversationStarters).reduce((a, b) => a + b, 0)
  const totalDoubleTexts = Object.values(doubleTexts).reduce((a, b) => a + b, 0)

  const engagementScores = {
    replyEfficiency: Math.min(100, Math.max(0, 100 - (totalDoubleTexts / messages.length) * 100)),
    initiationBalance:
      totalParticipants > 1
        ? 100 - Math.abs(50 - (conversationStarters[participants[0]] / totalConversationStarts) * 100) * 2
        : 100,
    conversationConsistency: Math.min(100, (messagesByDay.length / 365) * 100),
    doubleTextRatio: Math.min(100, (totalDoubleTexts / messages.length) * 100),
  }

  return {
    totalMessages: messages.length,
    participants,
    messagesByParticipant,
    firstMessage: messages[0]?.timestamp_ms || 0,
    lastMessage: messages[messages.length - 1]?.timestamp_ms || 0,
    averageWordsPerMessage: totalWords / messages.length,
    totalWords,
    uniqueWords: Object.keys(wordCounts).length,
    topWords,
    topEmojis,
    emojisByParticipant,
    messagesByDay: messagesByDay.sort((a, b) => a.date.localeCompare(b.date)),
    messagesByHour,
    averageReplyTime: 0,
    longestStreak: 0,
    conversationStarters,
    doubleTexts,
    reactions,
    reactionsByParticipant,
    mediaMessages,
    mediaByType,
    mediaByParticipant,
    linksShared,
    linksByDomain,
    monthlySummary,
    engagementScores,
  }
}
