import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsPlayFill, BsPauseFill, BsVolumeUp, BsVolumeMute, BsSkipBackward, BsSkipForward } from 'react-icons/bs';

const Music = ({ recommendations = [] }) => {
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(true);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const volumeRef = useRef(null);

  useEffect(() => {
    if (recommendations && recommendations.length > 0) {
      setTracks(recommendations);
    }
  }, [recommendations]);

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playTrack = async (track, index) => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentTrackIndex(index);
      
      const res = await fetch(
        `https://saavn.dev/api/search/songs?query=${encodeURIComponent(track.name)}`
      );
      
      if (!res.ok) {
        throw new Error('Failed to fetch song data');
      }
      
      const data = await res.json();
      
      if (data.success && data.data.results.length > 0) {
        const songData = data.data.results[0];
        console.log(data);
        
        const transformedTrack = {
          id: songData.id,
          name: songData.name,
          album: {
            name: songData.album?.name || "",
            images: songData.image || [],
          },
          artists: songData.artists?.primary || [],
          duration: songData.duration || 0,
          downloadUrl: songData.downloadUrl?.[0]?.url || null
        };
        
        setCurrentTrack(transformedTrack);
        
        if (transformedTrack.downloadUrl && audioRef.current) {
          audioRef.current.src = transformedTrack.downloadUrl;
          audioRef.current.volume = volume;
          try {
            await audioRef.current.play();
            setIsPaused(false);
          } catch (playError) {
            // Handle browser autoplay restrictions
            console.error('Playback error:', playError);
            setError("Playback blocked. Click play to start.");
            setIsPaused(true);
          }
        } else {
          throw new Error('No playable URL found for this track');
        }
      } else {
        throw new Error('No matching songs found');
      }
    } catch (err) {
      console.error('Error playing track:', err);
      setError(err.message || "Error playing track. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayback = async () => {
    if (!currentTrack) return;
    
    try {
      if (isPaused) {
        await audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
      setIsPaused(!isPaused);
    } catch (err) {
      console.error('Playback toggle error:', err);
      setError("Playback error. Please try again.");
    }
  };

  const playNextTrack = () => {
    if (tracks.length === 0) return;
    
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    playTrack(tracks[nextIndex], nextIndex);
  };

  const playPreviousTrack = () => {
    if (tracks.length === 0) return;
    
    const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    playTrack(tracks[prevIndex], prevIndex);
  };

  const handleProgressChange = (e) => {
    const time = parseFloat(e.target.value);
    setPlaybackTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
      } else {
        audioRef.current.volume = 0;
      }
      setIsMuted(!isMuted);
    }
  };

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="music-player-container relative mt-8">
      {/* Track List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
        {tracks.map((track, index) => (
          <motion.div
            key={track.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`group relative bg-gradient-to-br from-gray-900/90 to-purple-900/50 rounded-xl p-4 hover:from-purple-900/70 hover:to-blue-900/60 transition-all duration-300 shadow-lg hover:shadow-purple-500/20 cursor-pointer ${currentTrack && currentTrack.id === (track.id || `track-${index}`) ? 'ring-2 ring-purple-500 ring-opacity-70' : ''}`}
            onClick={() => playTrack(track, index)}
          >
            <div className="relative aspect-square rounded-lg overflow-hidden mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
              <img 
                src={track.image?.[1]?.url || track.albumArt || '/placeholder-art.jpg'} 
                alt={track.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
              <motion.div 
                className="absolute inset-0 flex items-center justify-center bg-black/30"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-white/20 backdrop-blur-md p-4 rounded-full">
                  <BsPlayFill className="text-4xl text-white" />
                </div>
              </motion.div>
            </div>
            
            <h3 className="font-bold text-lg truncate mb-1 text-white group-hover:text-purple-200 transition-colors">{track.name}</h3>
            <p className="text-sm text-white/70 truncate group-hover:text-white/90 transition-colors">
              {track.artist}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Audio Player */}
      <AnimatePresence>
        {currentTrack && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-900/95 to-blue-900/95 backdrop-blur-xl p-4 border-t border-white/10 shadow-lg shadow-purple-900/50 z-50"
          >
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-4">
              {/* Track Info */}
              <div className="flex items-center gap-4 flex-shrink-0 w-full sm:w-auto mb-3 sm:mb-0">
                <div className="relative w-14 h-14 rounded-md overflow-hidden">
                  <img
                    src={currentTrack.album.images?.[0]?.url || '/placeholder-art.jpg'}
                    alt={currentTrack.name}
                    className="w-full h-full object-cover"
                  />
                  <motion.div 
                    animate={{ 
                      rotate: isPaused ? 0 : 360 
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 20, 
                      ease: "linear" 
                    }}
                    className={`absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 ${isPaused ? 'opacity-0' : 'opacity-100'} transition-opacity`}
                  />
                </div>
                <div className="max-w-xs">
                  <h4 className="font-bold truncate text-white">{currentTrack.name}</h4>
                  <p className="text-sm text-white/70 truncate">
                    {Array.isArray(currentTrack.artists) 
                      ? currentTrack.artists.map(a => a.name).join(', ')
                      : currentTrack.artist || 'Unknown Artist'}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex-1 w-full sm:w-auto">
                <div className="flex items-center gap-2 sm:gap-4 justify-center">
                  <button
                    onClick={playPreviousTrack}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white/90 hover:text-white"
                  >
                    <BsSkipBackward className="text-lg" />
                  </button>
                  
                  <button
                    onClick={togglePlayback}
                    className="p-3 rounded-full bg-purple-600 hover:bg-purple-500 transition-colors text-white shadow-lg hover:shadow-purple-500/50"
                  >
                    {isPaused ? (
                      <BsPlayFill className="text-2xl ml-0.5" />
                    ) : (
                      <BsPauseFill className="text-2xl" />
                    )}
                  </button>
                  
                  <button
                    onClick={playNextTrack}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white/90 hover:text-white"
                  >
                    <BsSkipForward className="text-lg" />
                  </button>

                  <div className="flex items-center gap-2 flex-1 ml-2">
                    <span className="text-xs text-white/70 hidden sm:inline">{formatTime(playbackTime)}</span>
                    <div className="relative flex-1 h-2 group">
                      <div className="absolute inset-y-0 left-0 right-0 h-1 bg-white/10 rounded-full my-auto group-hover:h-1.5 transition-all" />
                      <div 
                        className="absolute inset-y-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-blue-400 rounded-full my-auto group-hover:h-1.5 transition-all" 
                        style={{ width: `${(playbackTime / Math.max(duration, 1)) * 100}%` }}
                      />
                      <input
                        type="range"
                        ref={progressRef}
                        min="0"
                        max={duration || 100}
                        step="0.1"
                        value={playbackTime}
                        onChange={handleProgressChange}
                        className="absolute inset-0 w-full opacity-0 cursor-pointer"
                      />
                    </div>
                    <span className="text-xs text-white/70 hidden sm:inline">{formatTime(duration)}</span>
                  </div>
                </div>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-2 flex-shrink-0 mt-2 sm:mt-0">
                <button
                  onClick={toggleMute}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {isMuted ? (
                    <BsVolumeMute className="text-xl" />
                  ) : (
                    <BsVolumeUp className="text-xl" />
                  )}
                </button>
                <div className="relative w-20 h-2 group">
                  <div className="absolute inset-y-0 left-0 right-0 h-1 bg-white/10 rounded-full my-auto group-hover:h-1.5 transition-all" />
                  <div 
                    className="absolute inset-y-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-blue-400 rounded-full my-auto group-hover:h-1.5 transition-all" 
                    style={{ width: `${volume * 100}%` }}
                  />
                  <input
                    type="range"
                    ref={volumeRef}
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <audio
              ref={audioRef}
              onTimeUpdate={() => audioRef.current && setPlaybackTime(audioRef.current.currentTime)}
              onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
              onEnded={() => {
                setIsPaused(true);
                // Optionally auto-play next track
                // playNextTrack();
              }}
              onError={(e) => {
                console.error('Audio error:', e);
                setError("Error loading audio. Please try another track.");
                setIsPaused(true);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-400 border-t-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-6 w-6 rounded-full bg-purple-600" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="fixed bottom-24 right-4 bg-gradient-to-r from-red-500/90 to-pink-500/90 text-white px-6 py-3 rounded-lg shadow-lg backdrop-blur-sm z-50"
          >
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Music;