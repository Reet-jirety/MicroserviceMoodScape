import React, { useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";
import PlayingSong from "../../../../assets/player.png";
import './Top.css'

export const Top = () => {
  const { currentSong, currentTime, duration, seekTo } = useContext(PlayerContext);

  const getImageUrl = (imageArray) => {
    if (!imageArray || !Array.isArray(imageArray)) return PlayingSong;
    const highQualityImage = imageArray.find(img => img.quality === "500x500");
    return highQualityImage?.url || imageArray[0]?.url || PlayingSong;
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleSeek = (e) => {
    const newTime = (e.target.value / 100) * duration;
    seekTo(newTime);
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="p-5 h-[86%]">
      <div className="flex items-center justify-between mb-[30px]">
        <h5 className="text-lg">Player</h5>
        <i className="bx bxs-playlist text-xl"></i>
      </div>
      <div className="song-info flex flex-col items-center gap-[24px] text-center">
        <img
          className="w-70 h-[220px] max-3xl:w-[220px] max-3xl:h-[220px] max-2xl:w-[180px] max-2xl:h-[180px] max-xs:w-[300px] max-xs:h-[190px]"
          src={currentSong ? getImageUrl(currentSong.image) : PlayingSong}
          alt="Album cover"
        />
        <div className="description">
          <h3 className="text-[26px] font-medium mb-2 max-3xl:text-[22px]">
            {currentSong ? (currentSong.title || currentSong.name) : "Ripple Echoes"}
          </h3>
          <h5 className="text-[16px] mb-1">
            {currentSong ? (currentSong.primaryArtists || currentSong.singers || currentSong.artist) : "Kael Fischer"}
          </h5>
          <p className="text-cool-gray-txt text-[12px] font-bold">
            {currentSong ? "Now Playing" : "Best of 2024"}
          </p>
        </div>
        <div className="progress flex items-center my-2.5 mx-0 max-3xl:m-0 w-full">
          <p className="text-[11px]">{formatTime(currentTime)}</p>
          <input
            type="range"
            min="0"
            max="100"
            value={progressPercentage}
            onChange={handleSeek}
            className="w-full mx-[30px] h-0.5 bg-[#919191] appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, white ${progressPercentage}%, #919191 ${progressPercentage}%)`,
            }}
          />
          <p className="text-[11px]">{formatTime(duration)}</p>
        </div>
      </div>
    </div>
  );
};