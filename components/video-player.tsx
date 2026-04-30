"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from "lucide-react"

interface Video {
  id: string
  title: string
  description: string
  thumbnail: string
  videoUrl: string
}

interface VideoPlayerProps {
  video: Video
  onClose: () => void
}

export function VideoPlayer({ video, onClose }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    video.addEventListener("timeupdate", updateTime)
    // video.addEventListener("loadedmetadata", updateDuration)

    return () => {
      video.removeEventListener("timeupdate", updateTime)
      // video.removeEventListener("loadedmetadata", updateDuration)
    }
  }, [])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number.parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto border-yellow-300 shadow-2xl">
      <CardHeader className="flex flex-row items-center justify-between bg-yellow-500 text-yellow-900">
        <div>
          <CardTitle className="text-xl font-bold">{video.title}</CardTitle>
          <CardDescription className="text-yellow-800">VIEWING</CardDescription>
        </div>
        <Button onClick={onClose} variant="ghost" size="sm" className="text-yellow-900 hover:bg-yellow-400">
          <X className="w-5 h-5" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div
          className="relative bg-black group"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          <video
            ref={videoRef}
            className="w-full aspect-video"
            src={video.videoUrl}
            poster={video.thumbnail}
            onClick={togglePlay}
          />

          {/* Video Controls Overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
          >
            {/* Play/Pause Button Center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                onClick={togglePlay}
                className="bg-yellow-500/80 hover:bg-yellow-500 text-yellow-900 w-16 h-16 rounded-full"
                size="sm"
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" fill="currentColor" />}
              </Button>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
              {/* Progress Bar */}
              <div className="flex items-center gap-2 text-white text-sm">
                <span>{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                />
                <span>{formatTime(duration)}</span>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => skipTime(-10)}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                  >
                    <SkipBack className="w-5 h-5" />
                  </Button>
                  <Button onClick={togglePlay} variant="ghost" size="sm" className="text-white hover:bg-white/20">
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" fill="currentColor" />}
                  </Button>
                  <Button
                    onClick={() => skipTime(10)}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                  >
                    <SkipForward className="w-5 h-5" />
                  </Button>
                  <Button onClick={toggleMute} variant="ghost" size="sm" className="text-white hover:bg-white/20">
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>
                </div>
                <Button
                  onClick={() => videoRef.current?.requestFullscreen()}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <Maximize className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Video Description */}
        <div className="p-6 bg-yellow-50">
          <p className="text-yellow-800 leading-relaxed">{video.description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
