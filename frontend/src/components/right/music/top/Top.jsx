import React from "react";

export const Top = () => {
  return (
    <div className="p-5 h-[86%]">
      <div className="flex items-center justify-between mb-[30px]">
        <h5 className="text-lg">Player</h5>
        <i className="bx bxs-playlist text-xl"></i>
      </div>
      <div className="flex flex-col items-center gap-[24px] text-center">
        <img
          className="w-70 h-[220px]"
          src="assets/player.png"
          alt="Album cover"
        />
        <div className="description">
          <h3 className="text-[26px] font-medium mb-2">Ripple Echoes</h3>
          <h5 className="text-[16px] mb-1">Kael Fischer</h5>
          <p className="text-[#919191] text-[12px] font-bold">Best of 2024</p>
        </div>
        <div className="flex items-center my-2.5 mx-0">
          <p className="text-[11px]">02:45</p>
          <div className="relative w-30 h-0.5 bg-white ml-[30px] before:content-[''] before:bg-[#25252d] before:h-[10px] before:w-[10px] before:border-2 before:border-white before:absolute before:-top-[6px] before:left-30 before:rounded-full"></div>
          <div className="w-20 h-0.5 bg-[#919191] mr-[30px]"></div>
          <p className="text-[11px]">01:02</p>
        </div>
      </div>
    </div>
  );
};
