"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { Upload, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileUploaderProps {
  onFilesProcessed: (files: File[]) => void
  isProcessing: boolean
}

export function FileUploader({ onFilesProcessed, isProcessing }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === "application/json" || file.name.endsWith(".json"),
    )

    if (files.length > 0) {
      setSelectedFiles(files)
    }
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(
      (file) => file.type === "application/json" || file.name.endsWith(".json"),
    )

    if (files.length > 0) {
      setSelectedFiles(files)
    }
  }, [])

  const processFiles = useCallback(() => {
    if (selectedFiles.length > 0) {
      onFilesProcessed(selectedFiles)
    }
  }, [selectedFiles, onFilesProcessed])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30">
        <div
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
            dragActive ? "border-pink-400 bg-pink-50/50" : "border-pink-300 hover:border-pink-400 hover:bg-pink-50/30"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-16 w-16 text-pink-400 mb-4" />
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">Upload Instagram Chat Files</h3>
          <p className="text-gray-500 mb-6">Drag and drop your Instagram JSON export files here, or click to browse</p>

          <input type="file" multiple accept=".json" onChange={handleFileInput} className="hidden" id="file-input" />

          <label htmlFor="file-input">
            <Button
              variant="outline"
              className="bg-pink-500/10 border-pink-300 text-pink-600 hover:bg-pink-500/20 cursor-pointer"
              asChild
            >
              <span>Browse Files</span>
            </Button>
          </label>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-700 mb-3">Selected Files ({selectedFiles.length})</h4>
            <div className="space-y-2 mb-6">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white/30 rounded-xl">
                  <FileText className="h-5 w-5 text-pink-500" />
                  <span className="text-gray-700">{file.name}</span>
                  <span className="text-sm text-gray-500 ml-auto">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              ))}
            </div>

            <Button
              onClick={processFiles}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing Files...
                </>
              ) : (
                "Analyze Chat Data"
              )}
            </Button>
          </div>
        )}

        <div className="mt-8 p-4 bg-green-50/50 rounded-xl border border-green-200">
          <h4 className="font-semibold text-green-800 mb-2">🔒 Privacy First</h4>
          <p className="text-sm text-green-700">
            Your data never leaves your browser. All analysis happens locally on your device.
          </p>
        </div>
      </div>
    </div>
  )
}
