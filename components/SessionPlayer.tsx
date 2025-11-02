import React, { useEffect, useRef } from 'react';
import type { SessionData } from '../types';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { PlayIcon, PauseIcon, SkipForwardIcon, SkipBackwardIcon, VolumeUpIcon, VolumeMuteIcon } from './IconComponents';

interface SessionPlayerProps {
  sessionData: SessionData;
}

const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const flooredSeconds = Math.floor(seconds);
  const min = Math.floor(flooredSeconds / 60);
  const sec = flooredSeconds % 60;
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
};


const SessionPlayer: React.FC<SessionPlayerProps> = ({ sessionData }) => {
  const { isPlaying, duration, currentTime, volume, load, togglePlayPause, seek, changeVolume } = useAudioPlayer();
  const playerRef = useRef<HTMLDivElement>(null);

  // Clean the script for display by removing pause markers
  const displayScript = sessionData.script.replace(/\[PAUSE=\d+s\]/g, '\n').trim();

  useEffect(() => {
    if (sessionData.audioUrl) {
      load(sessionData.audioUrl);
    }
  }, [sessionData, load]);

  useEffect(() => {
    // Scroll to the player when it appears
    playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);
  
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(parseFloat(e.target.value));
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    changeVolume(parseFloat(e.target.value));
  };
  
  const skip = (amount: number) => {
    seek(currentTime + amount);
  };

  return (
    <div ref={playerRef} className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-4xl mx-auto animate-fade-in">
      <div className="relative">
        <img src={sessionData.imageUrl} alt={sessionData.title} className="w-full h-48 md:h-64 object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
          <h2 className="text-2xl md:text-4xl font-bold text-white text-center shadow-text">{sessionData.title}</h2>
        </div>
      </div>
      <div className="p-6 md:p-8 space-y-6">
        {/* Player Controls */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            {/* Progress Bar */}
            <div className="flex items-center gap-3 mb-2">
                <span className="text-xs text-slate-500 font-mono w-10 text-center">{formatTime(currentTime)}</span>
                <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime || 0}
                    onChange={handleSeek}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    aria-label="Seek slider"
                />
                <span className="text-xs text-slate-500 font-mono w-10 text-center">{formatTime(duration)}</span>
            </div>
            
            {/* Main Controls */}
            <div className="flex items-center justify-between">
                {/* Volume */}
                <div className="flex items-center gap-2 w-1/3 max-w-[150px]">
                    <button onClick={() => changeVolume(volume > 0 ? 0 : 1)} className="text-slate-500 hover:text-blue-500 transition-colors" aria-label={volume > 0 ? "Mute" : "Unmute"}>
                        {volume > 0 ? <VolumeUpIcon className="w-6 h-6" /> : <VolumeMuteIcon className="w-6 h-6" />}
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        aria-label="Volume slider"
                    />
                </div>
                
                {/* Playback */}
                <div className="flex items-center justify-center gap-4">
                    <button onClick={() => skip(-15)} className="text-slate-500 hover:text-blue-500 transition-colors p-2" aria-label="Skip backward 15 seconds">
                        <SkipBackwardIcon className="w-7 h-7" />
                    </button>
                    <button
                        onClick={togglePlayPause}
                        className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                        {isPlaying ? <PauseIcon className="w-8 h-8" /> : <PlayIcon className="w-8 h-8" />}
                    </button>
                    <button onClick={() => skip(15)} className="text-slate-500 hover:text-blue-500 transition-colors p-2" aria-label="Skip forward 15 seconds">
                        <SkipForwardIcon className="w-7 h-7" />
                    </button>
                </div>

                <div className="w-1/3 max-w-[150px]"></div>{/* Spacer */}
            </div>
        </div>

        {/* Script */}
        <div className="max-h-60 overflow-y-auto p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-lg mb-2 text-slate-700">Guided Script</h3>
            <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{displayScript}</p>
        </div>
      </div>
    </div>
  );
};

export default SessionPlayer;