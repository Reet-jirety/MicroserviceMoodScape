import React, { createContext, useState, useRef, useEffect } from "react";

export const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null); // Store the currently playing song
  const [isPlaying, setIsPlaying] = useState(false); // Track if the song is playing
  const [currentTime, setCurrentTime] = useState(0); // Track current time of the song
  const [duration, setDuration] = useState(0); // Track song duration
  const audioRef = useRef(new Audio()); // Reference to the audio element

  // Update duration when metadata is loaded
  useEffect(() => {
    const audio = audioRef.current;
    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
    };
    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
    };
    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    return () => {
      audio.pause();
    };
  }, []);

  // Play or pause the song when isPlaying changes
  useEffect(() => {
    if (currentSong) {
      const audio = audioRef.current;
      audio.src = currentSong.downloadUrl?.find(url => url.quality === "320kbps")?.url || "";
      if (isPlaying) {
        audio.play().catch(err => console.error("Playback error:", err));
      } else {
        audio.pause();
      }
    }
  }, [currentSong, isPlaying]);

  const playSong = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    setCurrentTime(0);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const seekTo = (time) => {
    const audio = audioRef.current;
    audio.currentTime = time;
    setCurrentTime(time);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        playSong,
        togglePlayPause,
        seekTo,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};