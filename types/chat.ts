export interface ChatMessage {
  sender_name?: string
  timestamp_ms?: number
  content?: string
  type?: string
  reactions?: Array<{
    reaction: string
    actor: string
  }>
  photos?: Array<{
    uri: string
    creation_timestamp: number
  }>
  videos?: Array<{
    uri: string
    creation_timestamp: number
  }>
  audio_files?: Array<{
    uri: string
    creation_timestamp: number
  }>
  share?: {
    link?: string
    share_text?: string
  }
}

export interface AnalysisData {
  totalMessages: number
  participants: string[]
  messagesByParticipant: Record<string, number>
  firstMessage: number
  lastMessage: number
  averageWordsPerMessage: number
  totalWords: number
  uniqueWords: number
  topWords: Array<{ word: string; count: number }>
  topEmojis: Array<{ emoji: string; count: number }>
  emojisByParticipant: Record<string, Record<string, number>>
  messagesByDay: Array<{ date: string; count: number }>
  messagesByHour: Record<number, number>
  averageReplyTime: number
  longestStreak: number
  conversationStarters: Record<string, number>
  doubleTexts: Record<string, number>
  reactions: Record<string, number>
  reactionsByParticipant: Record<string, Record<string, number>>
  mediaMessages: number
  mediaByType: Record<string, number>
  mediaByParticipant: Record<string, number>
  linksShared: Array<{ url: string; sender: string; timestamp: number }>
  linksByDomain: Record<string, number>
  monthlySummary: Array<{
    month: string
    messages: number
    reactions: number
    topEmoji: string
    activeDays: number
    mediaShared: number
  }>
  engagementScores: {
    replyEfficiency: number
    initiationBalance: number
    conversationConsistency: number
    doubleTextRatio: number
  }
}
