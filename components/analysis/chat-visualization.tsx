"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Phone,
  Video,
  Info,
  ImageIcon,
  VideoIcon,
  Mic,
  ExternalLink,
  Heart,
  Smile,
  Camera,
  Paperclip,
} from "lucide-react"
import type { ChatMessage } from "@/types/chat"
import { decodeInstagramText, extractLikedMessageInfo, fixInstagramEncoding } from "@/utils/text-processor"

interface ChatVisualizationProps {
  messages: ChatMessage[]
}

export function ChatVisualization({ messages }: ChatVisualizationProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedParticipant, setSelectedParticipant] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [messageType, setMessageType] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const messagesPerPage = 100

  const participants = useMemo(() => {
    return Array.from(new Set(messages.map((m) => m.sender_name).filter(Boolean)))
  }, [messages])

  // Determine the main user (most messages)
  const mainParticipant = useMemo(() => {
    const messageCounts = participants.reduce(
      (acc, participant) => {
        acc[participant] = messages.filter((m) => m.sender_name === participant).length
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(messageCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || participants[0] || "You"
  }, [participants, messages])

  const filteredMessages = useMemo(() => {
    return messages.filter((message) => {
      // Filter out "liked a message" notifications
      if (message.content) {
        const processedContent = fixInstagramEncoding(decodeInstagramText(message.content))
        const likedInfo = extractLikedMessageInfo(processedContent)
        if (likedInfo.isLiked) {
          return false // Skip these messages
        }
      }

      // Search term filter
      if (searchTerm && message.content) {
        const processedContent = fixInstagramEncoding(decodeInstagramText(message.content))
        if (!processedContent.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false
        }
      }

      // Participant filter
      if (selectedParticipant !== "all" && message.sender_name !== selectedParticipant) {
        return false
      }

      // Date filter
      if (dateFilter !== "all" && message.timestamp_ms) {
        const messageDate = new Date(message.timestamp_ms)
        const now = new Date()
        const daysDiff = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24))

        switch (dateFilter) {
          case "today":
            if (daysDiff > 0) return false
            break
          case "week":
            if (daysDiff > 7) return false
            break
          case "month":
            if (daysDiff > 30) return false
            break
          case "year":
            if (daysDiff > 365) return false
            break
        }
      }

      // Message type filter
      if (messageType !== "all") {
        switch (messageType) {
          case "text":
            if (!message.content || message.photos || message.videos || message.audio_files) return false
            break
          case "media":
            if (!message.photos && !message.videos && !message.audio_files) return false
            break
          case "reactions":
            if (!message.reactions || message.reactions.length === 0) return false
            break
          case "links":
            if (!message.share?.link) return false
            break
        }
      }

      return true
    })
  }, [messages, searchTerm, selectedParticipant, dateFilter, messageType])

  const paginatedMessages = useMemo(() => {
    const startIndex = (currentPage - 1) * messagesPerPage
    return filteredMessages.slice(startIndex, startIndex + messagesPerPage)
  }, [filteredMessages, currentPage])

  const totalPages = Math.ceil(filteredMessages.length / messagesPerPage)

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "Unknown Date"
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      })
    }
  }

  const shouldShowTimestamp = (currentMessage: ChatMessage, prevMessage?: ChatMessage) => {
    if (!currentMessage.timestamp_ms || !prevMessage?.timestamp_ms) return true
    const timeDiff = currentMessage.timestamp_ms - prevMessage.timestamp_ms
    return timeDiff > 10 * 60 * 1000 // Show timestamp if more than 10 minutes apart
  }

  const shouldShowAvatar = (currentMessage: ChatMessage, nextMessage?: ChatMessage) => {
    return !nextMessage || nextMessage.sender_name !== currentMessage.sender_name
  }

  const getInitials = (name?: string) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm || !text) return text
    const regex = new RegExp(`(${searchTerm})`, "gi")
    const parts = text.split(regex)
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { [key: string]: ChatMessage[] } = {}
    paginatedMessages.forEach((message) => {
      const dateKey = formatDate(message.timestamp_ms)
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(message)
    })
    return groups
  }, [paginatedMessages])

  const otherParticipant = participants.find((p) => p !== mainParticipant) || "Chat"

  const renderMessageContent = (message: ChatMessage, isCurrentUser: boolean) => {
    if (!message.content) return null

    // Apply both decoding methods
    const decodedContent = decodeInstagramText(message.content)
    const processedContent = fixInstagramEncoding(decodedContent)

    // Regular message content only (no special handling for likes)
    return (
      <div className="text-sm leading-relaxed whitespace-pre-wrap">
        {highlightSearchTerm(processedContent, searchTerm)}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
      {/* Instagram-style Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {getInitials(otherParticipant)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-base">
                {participants.length > 1 ? otherParticipant : "Chat Analysis"}
              </h3>
              <p className="text-sm text-gray-500">{filteredMessages.length.toLocaleString()} messages</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100">
              <Phone className="h-5 w-5 text-gray-600" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100">
              <Video className="h-5 w-5 text-gray-600" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100">
              <Info className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10 bg-white border-gray-300 text-sm h-9"
            />
          </div>

          <Select
            value={selectedParticipant}
            onValueChange={(value) => {
              setSelectedParticipant(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="bg-white border-gray-300 text-sm h-9">
              <SelectValue placeholder="All participants" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All participants</SelectItem>
              {participants.map((participant) => (
                <SelectItem key={participant} value={participant}>
                  {participant}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={dateFilter}
            onValueChange={(value) => {
              setDateFilter(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="bg-white border-gray-300 text-sm h-9">
              <SelectValue placeholder="All time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last week</SelectItem>
              <SelectItem value="month">Last month</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={messageType}
            onValueChange={(value) => {
              setMessageType(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="bg-white border-gray-300 text-sm h-9">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="text">Text only</SelectItem>
              <SelectItem value="media">Media</SelectItem>
              <SelectItem value="reactions">With reactions</SelectItem>
              <SelectItem value="links">Links</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="bg-white h-[600px] overflow-y-auto">
        <div className="px-6 py-4 space-y-6">
          {Object.entries(groupedMessages).map(([date, dayMessages]) => (
            <div key={date} className="space-y-4">
              {/* Date Separator */}
              <div className="flex justify-center">
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">{date}</span>
              </div>

              {/* Messages for this date */}
              <div className="space-y-2">
                {dayMessages.map((message, index) => {
                  const isCurrentUser = message.sender_name === mainParticipant
                  const prevMessage = index > 0 ? dayMessages[index - 1] : undefined
                  const nextMessage = index < dayMessages.length - 1 ? dayMessages[index + 1] : undefined
                  const showTimestamp = shouldShowTimestamp(message, prevMessage)
                  const showAvatar = shouldShowAvatar(message, nextMessage)
                  const isConsecutive = prevMessage?.sender_name === message.sender_name

                  // Process the content
                  const decodedContent = message.content ? decodeInstagramText(message.content) : ""
                  const processedContent = fixInstagramEncoding(decodedContent)
                  const likedInfo = extractLikedMessageInfo(processedContent)

                  return (
                    <div key={`${message.timestamp_ms}-${index}`} className="space-y-1">
                      {/* Timestamp */}
                      {showTimestamp && (
                        <div className="flex justify-center py-2">
                          <span className="text-xs text-gray-500 font-medium">{formatTime(message.timestamp_ms)}</span>
                        </div>
                      )}

                      {/* Message Container */}
                      <div className={`flex items-end gap-2 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                        {/* Avatar for received messages */}
                        {!isCurrentUser && (
                          <div className={`w-7 h-7 flex-shrink-0 ${showAvatar ? "visible" : "invisible"}`}>
                            <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                              {getInitials(message.sender_name)}
                            </div>
                          </div>
                        )}

                        {/* Message Bubble - Remove the likedInfo.isLiked condition */}
                        <div className={`max-w-[65%] ${isCurrentUser ? "" : ""}`}>
                          <div
                            className={`px-4 py-2 rounded-2xl break-words ${
                              isCurrentUser ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                            } ${
                              isConsecutive && !showTimestamp ? (isCurrentUser ? "rounded-tr-md" : "rounded-tl-md") : ""
                            }`}
                          >
                            {/* Message Content */}
                            {renderMessageContent(message, isCurrentUser)}

                            {/* Shared Link */}
                            {message.share?.link && (
                              <div
                                className={`mt-2 p-3 rounded-lg ${isCurrentUser ? "bg-blue-600/50" : "bg-gray-200"}`}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <ExternalLink className="h-4 w-4" />
                                  <span className="text-xs font-semibold">Shared Link</span>
                                </div>
                                <a
                                  href={message.share.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`text-xs break-all block ${
                                    isCurrentUser
                                      ? "text-blue-100 hover:text-white"
                                      : "text-blue-600 hover:text-blue-800"
                                  }`}
                                >
                                  {message.share.link}
                                </a>
                                {message.share.share_text && (
                                  <div className="text-xs mt-1 opacity-80">
                                    {fixInstagramEncoding(decodeInstagramText(message.share.share_text))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Media Indicators */}
                            {(message.photos || message.videos || message.audio_files) && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {message.photos?.map((_, photoIndex) => (
                                  <div
                                    key={`photo-${photoIndex}`}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
                                      isCurrentUser ? "bg-blue-600/50" : "bg-gray-200"
                                    }`}
                                  >
                                    <ImageIcon className="h-3 w-3" />
                                    <span>Photo</span>
                                  </div>
                                ))}
                                {message.videos?.map((_, videoIndex) => (
                                  <div
                                    key={`video-${videoIndex}`}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
                                      isCurrentUser ? "bg-blue-600/50" : "bg-gray-200"
                                    }`}
                                  >
                                    <VideoIcon className="h-3 w-3" />
                                    <span>Video</span>
                                  </div>
                                ))}
                                {message.audio_files?.map((_, audioIndex) => (
                                  <div
                                    key={`audio-${audioIndex}`}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
                                      isCurrentUser ? "bg-blue-600/50" : "bg-gray-200"
                                    }`}
                                  >
                                    <Mic className="h-3 w-3" />
                                    <span>Audio</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {paginatedMessages.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-lg font-medium mb-2">No messages found</div>
              <div className="text-sm">Try adjusting your search filters</div>
            </div>
          )}
        </div>
      </div>

      {/* Instagram-style Message Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100">
            <Smile className="h-5 w-5 text-gray-600" />
          </Button>
          <div className="flex-1 bg-gray-100 rounded-full px-4 py-2.5">
            <span className="text-gray-500 text-sm">Message...</span>
          </div>
          <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100">
            <Mic className="h-5 w-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100">
            <Camera className="h-5 w-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100">
            <Paperclip className="h-5 w-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100">
            <Heart className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} • {filteredMessages.length.toLocaleString()} messages
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="bg-white border-gray-300 hover:bg-gray-50"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="bg-white border-gray-300 hover:bg-gray-50"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
