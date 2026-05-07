import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';

interface AudioPlayerProps {
  src: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src }) => {
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(script);
    }

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: extractVideoId(src),
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          showinfo: 0,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    };

    if (window.YT && window.YT.Player) {
      window.onYouTubeIframeAPIReady();
    }
  }, [src]);

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : '';
  };

  const onPlayerReady = () => {
    setIsReady(true);
    setDuration(playerRef.current.getDuration());
    playerRef.current.setVolume(volume);
  };

  const onPlayerStateChange = (event: any) => {
    setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
    if (event.data === window.YT.PlayerState.PLAYING) {
      const updateTime = () => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          setCurrentTime(playerRef.current.getCurrentTime());
          requestAnimationFrame(updateTime);
        }
      };
      updateTime();
    }
  };

  const togglePlay = () => {
    if (!isReady) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleTimeChange = (value: number[]) => {
    if (!isReady) return;
    const newTime = value[0];
    setCurrentTime(newTime);
    playerRef.current.seekTo(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (isReady) {
      playerRef.current.setVolume(newVolume);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="audio-player bg-gray-100 p-4 rounded-lg">
      <div id="youtube-player" style={{ display: 'none' }}></div>
      <div className="flex items-center space-x-4">
        <Button onClick={togglePlay} disabled={!isReady}>
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
        <div className="flex-1">
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            onValueChange={handleTimeChange}
            className="w-full"
          />
        </div>
        <span className="text-sm">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
        <div className="flex items-center space-x-2">
          <span className="text-sm">Vol:</span>
          <Slider
            value={[volume]}
            max={100}
            step={1}
            onValueChange={handleVolumeChange}
            className="w-20"
          />
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;