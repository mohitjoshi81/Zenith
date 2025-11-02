import { useState, useRef, useCallback, useEffect } from 'react';

// Helper function to decode base64 string to Uint8Array
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper function to decode raw PCM audio data into an AudioBuffer
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Refs for managing playback state
  const animationFrameRef = useRef<number>();
  const playbackStartTimeRef = useRef<number>(0); // Time in AudioContext's clock
  const pauseTimeRef = useRef<number>(0); // Time within the audio buffer

  // Initialize AudioContext and GainNode
  useEffect(() => {
    if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
            const context = new AudioContext({ sampleRate: 24000 });
            audioContextRef.current = context;
            const gainNode = context.createGain();
            gainNode.connect(context.destination);
            gainNodeRef.current = gainNode;
        } else {
            console.error("Web Audio API is not supported in this browser.");
        }
    }

    return () => {
        // Cleanup on unmount
        cancelAnimationFrame(animationFrameRef.current!);
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }
    };
  }, []);
  
  const load = useCallback(async (base64Audio: string) => {
    if (!audioContextRef.current) return;
    
    // Stop any current playback and reset state
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect(); // clean up connection
    }
    cancelAnimationFrame(animationFrameRef.current!);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    pauseTimeRef.current = 0;

    try {
      const audioBytes = decode(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, audioContextRef.current, 24000, 1);
      audioBufferRef.current = audioBuffer;
      setDuration(audioBuffer.duration);
    } catch (error) {
      console.error("Failed to decode audio data:", error);
      audioBufferRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    if (audioContextRef.current) {
      const elapsed = audioContextRef.current.currentTime - playbackStartTimeRef.current;
      setCurrentTime(Math.min(elapsed, duration));
      animationFrameRef.current = requestAnimationFrame(tick);
    }
  }, [duration]);

  const play = useCallback(() => {
    if (!audioBufferRef.current || isPlaying || !audioContextRef.current || !gainNodeRef.current) return;
    
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.connect(gainNodeRef.current);
    
    source.onended = () => {
      cancelAnimationFrame(animationFrameRef.current!);
      // Only reset if audio finished naturally
      if (pauseTimeRef.current >= duration - 0.1) { 
          setCurrentTime(duration);
          pauseTimeRef.current = 0;
      }
      setIsPlaying(false);
    };
    
    source.start(0, pauseTimeRef.current);
    playbackStartTimeRef.current = audioContextRef.current.currentTime - pauseTimeRef.current;

    sourceNodeRef.current = source;
    setIsPlaying(true);
    animationFrameRef.current = requestAnimationFrame(tick);
  }, [isPlaying, tick, duration]);

  const pause = useCallback(() => {
    if (!isPlaying || !sourceNodeRef.current || !audioContextRef.current) return;
    
    cancelAnimationFrame(animationFrameRef.current!);
    pauseTimeRef.current = audioContextRef.current.currentTime - playbackStartTimeRef.current;

    sourceNodeRef.current.onended = null;
    try {
      sourceNodeRef.current.stop();
    } catch (e) {
      // Ignore errors if node is already stopped
    }
    
    setIsPlaying(false);
  }, [isPlaying]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    if (!audioBufferRef.current) return;
    const newTime = Math.max(0, Math.min(time, duration));
    pauseTimeRef.current = newTime;
    setCurrentTime(newTime);
    
    if (isPlaying) {
        if(sourceNodeRef.current) {
            sourceNodeRef.current.onended = null;
            try { sourceNodeRef.current.stop(); } catch (e) {}
        }
        play();
    }
  }, [isPlaying, duration, play]);

  const changeVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(newVolume, 1));
    setVolume(clampedVolume);
    if(gainNodeRef.current) {
      gainNodeRef.current.gain.value = clampedVolume;
    }
  }, []);

  return { isPlaying, duration, currentTime, volume, load, togglePlayPause, seek, changeVolume };
};