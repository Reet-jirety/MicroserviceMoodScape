// import React from "react";
import PlayingSong from "../../../../assets/player.png"

export const Top = () => {
  return (
    <div className="p-5 h-[86%]">
      <div className="flex items-center justify-between mb-[30px]">
        <h5 className="text-lg">Player</h5>
        <i className="bx bxs-playlist text-xl"></i>
      </div>
      <div className="song-info flex flex-col items-center gap-[24px] text-center">
        <img
          className="w-70 h-[220px] max-3xl:w-[220px] max-3xl:h-[220px] max-2xl:w-[180px] max-2xl:h-[180px] max-xs:w-[300px] max-xs:h-[190px]"
          src={PlayingSong}
          alt="Album cover"
        />
        <div className="description">
          <h3 className="text-[26px] font-medium mb-2 max-3xl:text-[22px]">Ripple Echoes</h3>
          <h5 className="text-[16px] mb-1">Kael Fischer</h5>
          <p className="text-cool-gray-txt text-[12px] font-bold">Best of 2024</p>
        </div>
        <div className="progress flex items-center my-2.5 mx-0 max-3xl:m-0">
          <p className="text-[11px]">02:45</p>
          <div className="active-line relative w-30 h-0.5 bg-white ml-[30px] before:content-[''] before:bg-[#25252d] before:h-[10px] before:w-[10px] before:border-2 before:border-white before:absolute before:-top-[6px] before:left-30 before:rounded-full max-3xl:w-[80px] max-3xl:before:left-[80px]"></div>
          <div className="deactive-line w-20 h-0.5 bg-[#919191] mr-[30px] max-3xl:w-[40px]"></div>
          <p className="text-[11px]">01:02</p>
        </div>
      </div>
    </div>
  );
};
