'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { Pause, Play } from 'lucide-react';

const transcript = [
  'Mr. Osagie speaking, with hopes that you are having a fantastic day today.',
  'Now, it takes at least 4 minutes to fully walk through our services, and it will be time well spent.',
  "Here's a little ask: take just one extra minute to request via WhatsApp, or join my weekly newsletter.",
  'We get to talk, and this is just one of those conversations.',
  'Warm regards, my friend!',
];

export const VoicePlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const bars = useMemo(
    () => Array.from({ length: 24 }, (_, index) => 0.35 + ((index + 1) % 7) * 0.08),
    [],
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (!audio.duration) return;
      setProgress(audio.currentTime / audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={togglePlayback}
          className="inline-flex size-12 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground transition-transform hover:scale-105"
          aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
        >
          {isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
        </button>

        <div className="flex-1">
          <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span>{isPlaying ? 'Now playing' : 'Voice intro'}</span>
            <span>27s</span>
          </div>
          <div className="flex h-10 items-end gap-1 overflow-hidden rounded-full bg-muted/40 px-2 py-2">
            {bars.map((height, index) => (
              <div
                key={index}
                className="flex-1 rounded-full bg-primary/80 transition-all duration-300"
                style={{
                  height: `${Math.max(0.25, height + (isPlaying ? progress * 0.25 : 0))}rem`,
                  opacity: index % 3 === 0 ? 0.95 : 0.75,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <audio ref={audioRef} src="/my-voice-intro.mp3" preload="metadata" />

      <div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {transcript.map((line, index) => (
            <span key={index}>
              {line}
              {index < transcript.length - 1 ? ' ' : ''}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
};

export default VoicePlayer;
