"use client"

import { useState, useCallback, useMemo } from "react"
import { FileUploader } from "@/components/file-uploader"
import { Dashboard } from "@/components/dashboard"
import type { ChatMessage } from "@/types/chat"
import { processMessages } from "@/utils/data-processor"

export default function InstagramChatAnalyzer() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

  const analysisData = useMemo(() => {
    if (messages.length === 0) return null
    return processMessages(messages)
  }, [messages])

  const handleFilesProcessed = useCallback(async (files: File[]) => {
    setIsProcessing(true)
    try {
      const allMessages: ChatMessage[] = []
      const fileNames: string[] = []

      for (const file of files) {
        const text = await file.text()
        const data = JSON.parse(text)

        if (data.messages && Array.isArray(data.messages)) {
          allMessages.push(...data.messages)
          fileNames.push(file.name)
        }
      }

      // Sort messages by timestamp
      allMessages.sort((a, b) => (a.timestamp_ms || 0) - (b.timestamp_ms || 0))

      setMessages(allMessages)
      setUploadedFiles(fileNames)
    } catch (error) {
      console.error("Error processing files:", error)
    } finally {
      setIsProcessing(false)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
            tanalyseAI
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
            Comprehensive Instagram Chat Analysis with AI-Powered Insights - 100% Offline & Private
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-4 border border-white/30">
              <div className="text-2xl mb-2">🤖</div>
              <h3 className="font-semibold text-gray-800 mb-1">AI Analysis</h3>
              <p className="text-sm text-gray-600">Get relationship insights powered by Google Gemini AI</p>
            </div>
            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-4 border border-white/30">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-semibold text-gray-800 mb-1">Deep Analytics</h3>
              <p className="text-sm text-gray-600">Word clouds, timelines, emoji analysis & more</p>
            </div>
            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-4 border border-white/30">
              <div className="text-2xl mb-2">🔒</div>
              <h3 className="font-semibold text-gray-800 mb-1">100% Private</h3>
              <p className="text-sm text-gray-600">All analysis happens locally in your browser</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/30 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📱 How to Get Your Instagram Data</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Request Your Data</h3>
                    <p className="text-sm text-gray-600">
                      Go to Instagram Settings → Privacy and Security → Download Your Information
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Select JSON Format</h3>
                    <p className="text-sm text-gray-600">
                      Choose "JSON" format and select "Messages" from the data types
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Download & Upload</h3>
                    <p className="text-sm text-gray-600">
                      Instagram will email you a download link. Extract and upload the JSON files here
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-200/50">
                  <h3 className="font-semibold text-blue-800 mb-2">🤖 AI Analysis Setup</h3>
                  <p className="text-sm text-blue-700 mb-2">For AI-powered relationship insights:</p>
                  <ol className="text-xs text-blue-600 space-y-1">
                    <li>
                      1. Get a free API key from{" "}
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        className="underline"
                        rel="noreferrer"
                      >
                        Google AI Studio
                      </a>
                    </li>
                    <li>2. No credit card required - completely free</li>
                    <li>3. Enter your API key in the AI Analysis tab</li>
                    <li>4. Get 20+ detailed relationship insights</li>
                  </ol>
                </div>

                <div className="bg-green-50/50 rounded-xl p-4 border border-green-200/50">
                  <h3 className="font-semibold text-green-800 mb-2">⚡ What You'll Get</h3>
                  <ul className="text-xs text-green-600 space-y-1">
                    <li>• Interactive chat visualization</li>
                    <li>• Word clouds & emoji analysis</li>
                    <li>• Timeline & activity patterns</li>
                    <li>• Comprehensive PDF reports</li>
                    <li>• AI relationship insights (optional)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-amber-50/50 rounded-xl border border-amber-200/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-amber-600">⏱️</span>
                <h3 className="font-semibold text-amber-800">Processing Time</h3>
              </div>
              <p className="text-sm text-amber-700">
                Instagram typically takes 24-48 hours to prepare your data. The download will include all your messages
                in JSON format.
              </p>
            </div>
          </div>
        </header>

        {messages.length === 0 ? (
          <FileUploader onFilesProcessed={handleFilesProcessed} isProcessing={isProcessing} />
        ) : (
          <Dashboard
            messages={messages}
            analysisData={analysisData}
            uploadedFiles={uploadedFiles}
            onReset={() => {
              setMessages([])
              setUploadedFiles([])
            }}
          />
        )}
      </div>
    </div>
  )
}
