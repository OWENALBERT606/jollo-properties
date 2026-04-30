"use client"

import { useState } from "react"
import { VideoPlayer } from "./video-player"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Clock, Eye } from "lucide-react"

interface Video {
  id: string
  title: string
  description: string
  thumbnail: string
  videoUrl: string
}

// const mpomurroVideos: Video[] = [
//   {
//     id: "1",
//     title: "Future of AI Technology",
//     description:
//       "Explore cutting-edge artificial intelligence developments and how they're reshaping our world in unprecedented ways.",
//     thumbnail: "/space-exploration-cosmos-stars.png",
//     videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
//     views: "5.7M",
//   },
//   {
//     id: "2",
//     title: "Urban Architecture Masterpieces",
//     description:
//       "Discover the most innovative urban designs and architectural wonders that define modern city skylines worldwide.",
//     thumbnail: "/modern-architecture-building.png",
//     videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
//     duration: "11:55",
//     views: "3.4M",
//   },
//   {
//     id: "3",
//     title: "Gourmet Fusion Cuisine",
//     description:
//       "Master the art of fusion cooking with internationally acclaimed chefs creating extraordinary culinary experiences.",
//     thumbnail: "/professional-cooking-kitchen-chef.png",
//     videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
//     duration: "19:40",
//     views: "2.9M",
//   },
//   {
//     id: "4",
//     title: "Digital Art Revolution",
//     description:
//       "Witness the transformation of digital art and how creators are pushing boundaries with new technologies.",
//     thumbnail: "/nature-documentary-landscape.png",
//     videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
//     duration: "13:17",
//     views: "4.6M",
//   },
// ]

export function NosigakiVideoGallery({ mpomurros}: { mpomurros:any}) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)

  return (
    <div className="space-y-8">
      {selectedVideo && (
        <div className="mb-8">
          <VideoPlayer video={selectedVideo} onClose={() => setSelectedVideo(null)} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mpomurros?.map((video:any) => (
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
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-lg font-semibold text-yellow-900 mb-2 line-clamp-2">{video.title}</CardTitle>
              <CardDescription className="text-yellow-700 text-sm line-clamp-3 mb-3">
                {video.description}
              </CardDescription>
              <div className="flex items-center justify-between text-sm text-yellow-600">
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
