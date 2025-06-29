// Utility functions for processing text and emojis
export function decodeInstagramText(text: string): string {
  if (!text) return text

  try {
    // First, handle the specific Instagram encoding pattern
    // Instagram exports often use UTF-8 bytes encoded as individual characters

    // Try to decode as UTF-8 if it looks like encoded bytes
    if (text.includes("à®") || text.includes("à¯") || text.includes("â")) {
      try {
        // Convert the malformed UTF-8 back to proper encoding
        const bytes = []
        for (let i = 0; i < text.length; i++) {
          const char = text.charCodeAt(i)
          if (char < 256) {
            bytes.push(char)
          } else {
            // For characters outside byte range, convert to UTF-8 bytes
            const utf8 = unescape(encodeURIComponent(text.charAt(i)))
            for (let j = 0; j < utf8.length; j++) {
              bytes.push(utf8.charCodeAt(j))
            }
          }
        }

        // Convert bytes back to proper UTF-8 string
        const uint8Array = new Uint8Array(bytes)
        const decoder = new TextDecoder("utf-8")
        const decoded = decoder.decode(uint8Array)

        // If decoding was successful and looks better, use it
        if (decoded && decoded !== text && !decoded.includes("�")) {
          return decoded
        }
      } catch (e) {
        // If UTF-8 decoding fails, continue with other methods
      }
    }

    // Handle Unicode escape sequences like \u00f0\u009f\u00a5\u00b0
    let processed = text.replace(/\\u([0-9a-fA-F]{4})/g, (match, code) => {
      return String.fromCharCode(Number.parseInt(code, 16))
    })

    // Handle hex-encoded emojis (common in Instagram exports)
    processed = processed.replace(/\\x([0-9a-fA-F]{2})/g, (match, hex) => {
      return String.fromCharCode(Number.parseInt(hex, 16))
    })

    // Try to fix common emoji patterns that appear as byte sequences
    const emojiPatterns = [
      // Heart emoji patterns
      [/â¤ï¸/g, "❤️"],
      [/â¤/g, "❤️"],
      [/\u00e2\u009d\u00a4\u00ef\u00b8\u008f/g, "❤️"],
      [/\u00e2\u009d\u00a4/g, "❤️"],

      // Fire emoji
      [/\u00f0\u009f\u0094\u00a5/g, "🔥"],

      // Face with heart eyes
      [/\u00f0\u009f\u0098\u008d/g, "😍"],

      // Smiling face with heart eyes
      [/\u00f0\u009f\u00a5\u00b0/g, "🥰"],

      // Thumbs up
      [/\u00f0\u009f\u0091\u008d/g, "👍"],

      // Crying laughing
      [/\u00f0\u009f\u0098\u0082/g, "😂"],
    ]

    for (const [pattern, replacement] of emojiPatterns) {
      processed = processed.replace(pattern, replacement)
    }

    return processed
  } catch (error) {
    console.warn("Text processing error:", error)
    return text // Return original text if processing fails
  }
}

export function isLikedMessage(content: string): boolean {
  if (!content) return false

  const likedPatterns = [
    "liked a message",
    "liked your message",
    "reacted to your message",
    "reacted to a message",
    "❤️ your message",
    "❤️ a message",
    // Tamil patterns (properly encoded)
    "செய்தியை விரும்பினார்",
    "உங்கள் செய்தியை விரும்பினார்",
    // Also check for the malformed versions
    "liked",
    "reacted",
  ]

  const processedContent = decodeInstagramText(content).toLowerCase()
  return likedPatterns.some((pattern) => processedContent.includes(pattern.toLowerCase()))
}

export function extractLikedMessageInfo(content: string): {
  isLiked: boolean
  reactor: string | null
  originalMessage: string | null
} {
  if (!content) return { isLiked: false, reactor: null, originalMessage: null }

  const processedContent = decodeInstagramText(content)

  // Pattern for "X liked a message" or similar
  const likedPattern = /(.+?)\s+(liked|reacted to)\s+(a message|your message)/i
  const match = processedContent.match(likedPattern)

  if (match) {
    return {
      isLiked: true,
      reactor: match[1].trim(),
      originalMessage: null,
    }
  }

  // Check if it's a simple liked message
  if (isLikedMessage(content)) {
    return {
      isLiked: true,
      reactor: null,
      originalMessage: null,
    }
  }

  return { isLiked: false, reactor: null, originalMessage: null }
}

// Alternative approach: Try to detect and fix Instagram's specific encoding issues
export function fixInstagramEncoding(text: string): string {
  if (!text) return text

  try {
    // Instagram sometimes double-encodes UTF-8
    // First try to detect if this is double-encoded UTF-8

    // Convert string to bytes
    const encoder = new TextEncoder()
    const decoder = new TextDecoder("utf-8", { fatal: false })

    // Try different decoding approaches
    const approaches = [
      // Approach 1: Direct decoding
      () => text,

      // Approach 2: Fix common Instagram encoding issues
      () => {
        return text
          .replace(/à®/g, "அ")
          .replace(/à¯/g, "ா")
          .replace(/à°/g, "ி")
          .replace(/à±/g, "ீ")
          .replace(/à²/g, "ு")
          .replace(/à³/g, "ூ")
          .replace(/à´/g, "ெ")
          .replace(/àµ/g, "ே")
          .replace(/à¶/g, "ை")
          .replace(/à·/g, "ொ")
          .replace(/à¸/g, "ோ")
          .replace(/à¹/g, "ௌ")
          .replace(/â¤ï¸/g, "❤️")
          .replace(/â¤/g, "❤️")
      },

      // Approach 3: Try to decode as Latin-1 then re-encode as UTF-8
      () => {
        try {
          // Convert each character to its byte value
          const bytes = []
          for (let i = 0; i < text.length; i++) {
            const code = text.charCodeAt(i)
            if (code < 256) {
              bytes.push(code)
            }
          }

          if (bytes.length > 0) {
            const uint8Array = new Uint8Array(bytes)
            return decoder.decode(uint8Array)
          }
          return text
        } catch {
          return text
        }
      },
    ]

    // Try each approach and return the best result
    for (const approach of approaches) {
      try {
        const result = approach()
        // Check if the result looks better (has fewer weird characters)
        const weirdCharCount = (result.match(/[à-ÿ]/g) || []).length
        const originalWeirdCharCount = (text.match(/[à-ÿ]/g) || []).length

        if (weirdCharCount < originalWeirdCharCount && result !== text) {
          return result
        }
      } catch {
        continue
      }
    }

    return text
  } catch {
    return text
  }
}
