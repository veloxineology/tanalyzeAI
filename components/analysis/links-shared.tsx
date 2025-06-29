"use client"

import { useState, useMemo } from "react"
import type { AnalysisData } from "@/types/chat"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ExternalLink, Calendar, User } from "lucide-react"

interface LinksSharedProps {
  data: AnalysisData
}

export function LinksShared({ data }: LinksSharedProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDomain, setSelectedDomain] = useState("all")
  const [selectedSender, setSelectedSender] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const linksPerPage = 20

  const topDomains = Object.entries(data.linksByDomain)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)

  const senders = useMemo(() => {
    return Array.from(new Set(data.linksShared.map((link) => link.sender)))
  }, [data.linksShared])

  const domains = useMemo(() => {
    return Array.from(
      new Set(
        data.linksShared.map((link) => {
          try {
            return new URL(link.url).hostname
          } catch {
            return "invalid-url"
          }
        }),
      ),
    )
  }, [data.linksShared])

  const filteredLinks = useMemo(() => {
    return data.linksShared.filter((link) => {
      // Search term filter
      if (searchTerm && !link.url.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Domain filter
      if (selectedDomain !== "all") {
        try {
          const linkDomain = new URL(link.url).hostname
          if (linkDomain !== selectedDomain) return false
        } catch {
          if (selectedDomain !== "invalid-url") return false
        }
      }

      // Sender filter
      if (selectedSender !== "all" && link.sender !== selectedSender) {
        return false
      }

      // Date filter
      if (dateFilter !== "all" && link.timestamp) {
        const linkDate = new Date(link.timestamp)
        const now = new Date()
        const daysDiff = Math.floor((now.getTime() - linkDate.getTime()) / (1000 * 60 * 60 * 24))

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

      return true
    })
  }, [data.linksShared, searchTerm, selectedDomain, selectedSender, dateFilter])

  const paginatedLinks = useMemo(() => {
    const startIndex = (currentPage - 1) * linksPerPage
    return filteredLinks.slice(startIndex, startIndex + linksPerPage)
  }, [filteredLinks, currentPage])

  const totalPages = Math.ceil(filteredLinks.length / linksPerPage)

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text
    const regex = new RegExp(`(${searchTerm})`, "gi")
    const parts = text.split(regex)
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-pink-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

  return (
    <Card className="bg-white/20 backdrop-blur-xl border-white/30 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800">🔗 Links Shared</CardTitle>
        <div className="text-sm text-gray-600">
          Showing {filteredLinks.length} of {data.linksShared.length} links
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-white/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-gray-800">{data.linksShared.length}</div>
          <div className="text-sm text-gray-600">Total Links</div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search links..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10 bg-white/30 border-pink-300/50"
            />
          </div>

          <Select
            value={selectedDomain}
            onValueChange={(value) => {
              setSelectedDomain(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="bg-white/30 border-pink-300/50">
              <SelectValue placeholder="All domains" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All domains</SelectItem>
              {domains.map((domain) => (
                <SelectItem key={domain} value={domain}>
                  {domain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedSender}
            onValueChange={(value) => {
              setSelectedSender(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="bg-white/30 border-pink-300/50">
              <SelectValue placeholder="All senders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All senders</SelectItem>
              {senders.map((sender) => (
                <SelectItem key={sender} value={sender}>
                  {sender}
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
            <SelectTrigger className="bg-white/30 border-pink-300/50">
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
        </div>

        {topDomains.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Top Domains</h4>
            <div className="space-y-2">
              {topDomains.map(([domain, count], index) => (
                <div key={index} className="flex items-center justify-between bg-white/30 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <ExternalLink className="h-4 w-4 text-pink-600" />
                    <span className="font-medium text-gray-700">{domain}</span>
                  </div>
                  <Badge variant="secondary" className="bg-pink-500/20 text-pink-700">
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Links List */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-3">All Links</h4>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {paginatedLinks.map((link, index) => (
              <div key={index} className="bg-white/30 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-gray-700">{link.sender}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{new Date(link.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-600 hover:text-pink-700 text-sm break-all block"
                >
                  {highlightSearchTerm(link.url, searchTerm)}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="bg-white/30 border-pink-300/50"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="bg-white/30 border-pink-300/50"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
