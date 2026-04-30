"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Clock, Eye } from "lucide-react"
import { VideoPlayer } from "./video-player"

interface Video {
  id: string
  title: string
  description: string
  thumbnail: string
  videoUrl: string
  duration: string
  views: string
}

const sampleVideos: Video[] = [
  {
    id: "1",
    title: "Beautiful Nature Documentary",
    description:
      "Explore the wonders of nature in this breathtaking documentary featuring stunning landscapes and wildlife from around the world.",
    thumbnail: "/nature-documentary-landscape.png",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    duration: "10:34",
    views: "1.2M",
  },
  {
    id: "2",
    title: "Modern Architecture Tour",
    description:
      "Take a virtual tour through some of the most innovative and striking modern architectural marvels of the 21st century.",
    thumbnail: "/modern-architecture-building.png",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    duration: "8:45",
    views: "856K",
  },
  {
    id: "3",
    title: "Cooking Masterclass",
    description:
      "Learn professional cooking techniques from world-renowned chefs in this comprehensive culinary masterclass.",
    thumbnail: "/professional-cooking-kitchen-chef.png",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    duration: "15:22",
    views: "2.1M",
  },
  {
    id: "4",
    title: "Space Exploration Journey",
    description: "Journey through the cosmos and discover the latest breakthroughs in space exploration and astronomy.",
    thumbnail: "/space-exploration-cosmos-stars.png",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    duration: "12:18",
    views: "3.4M",
  },
]

export function VideoGallery() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)

  return (
    <div className="space-y-8">
      {selectedVideo && (
        <div className="mb-8">
          <VideoPlayer video={selectedVideo} onClose={() => setSelectedVideo(null)} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sampleVideos.map((video) => (
          <Card
            key={video.id}
            className="group hover:shadow-lg transition-all duration-300 border-yellow-200 hover:border-yellow-400"
          >
            <CardHeader className="p-0">
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={video.thumbnail || "/placeholder.svg"}
                  alt={video.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                <Button
                  onClick={() => setSelectedVideo(video)}
                  className="absolute inset-0 w-full h-full bg-transparent hover:bg-yellow-500/20 border-0 rounded-none"
                  variant="ghost"
                >
                  <Play className="w-12 h-12 text-white drop-shadow-lg" fill="currentColor" />
                </Button>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {video.duration}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-lg font-semibold text-yellow-900 mb-2 line-clamp-2">{video.title}</CardTitle>
              <CardDescription className="text-yellow-700 text-sm line-clamp-3 mb-3">
                {video.description}
              </CardDescription>
              <div className="flex items-center justify-between text-sm text-yellow-600">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {video.views} views
                </div>
                <Button
                  onClick={() => setSelectedVideo(video)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-yellow-900 font-medium"
                  size="sm"
                >
                  Watch Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
