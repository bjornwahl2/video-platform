"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
} from "lucide-react";
import type { Recording } from "@/types";

export default function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [current, setCurrent] = useState<number>(0);

  useEffect(() => {
    fetch("/api/recordings")
      .then((res) => res.json())
      .then((data) => setRecordings(data));
  }, []);

  const currentVideo = recordings[current];

  return (
    <div className="flex flex-col md:flex-row bg-slate-900 text-white h-full">
      <div className="flex-1 p-4">
        {currentVideo && (
          <video
            key={currentVideo.id}
            ref={videoRef}
            src={currentVideo.videoUrl}
            poster={`/${currentVideo.thumbnail}`}
            className="w-full h-64 md:h-full"
            controls
            autoPlay
          />
        )}
      </div>
      <div className="w-full md:w-80 overflow-y-scroll p-2 space-y-2">
        {recordings.map((rec, i) => (
          <div
            key={rec.id}
            className={`p-2 flex gap-2 items-center cursor-pointer rounded-md hover:bg-slate-700 ${i === current ? "bg-slate-800" : ""}`}
            onClick={() => setCurrent(i)}
          >
            <img
              src={`/${rec.thumbnail}`}
              alt="thumb"
              className="w-16 h-12 object-cover rounded"
            />
            <div>
              <p className="text-sm font-semibold">{rec.timestamp}</p>
              <p className="text-xs text-slate-400">{rec.duration}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}