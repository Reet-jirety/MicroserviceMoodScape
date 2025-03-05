import React from "react";

export const Player = () => {
  return (
    <div className="player-actions bg-[#5773ff] h-[26%] rounded-md flex flex-col items-center relative">
      <div className="buttons flex items-center gap-7.5 mt-6 max-3xl:mt-[30px] max-2xl:mt-[38px]">
        <i className="bx bx-repeat text-white text-[20px] max-2xl:text-[18px] max-xs:text-[22px]"></i>
        <i className="bx bx-first-page text-white text-[20px] max-2xl:text-[18px] max-xs:text-[22px]"></i>
        <i className="bx bxs-right-arrow play-button text-[20px] p-4 bg-white text-[#5775ff] rounded-[18px] max-3xl:p-[10px] max-3xl:rounded-[16px] max-2xl:text-[18px] max-xs:text-[22px]"></i>
        <i className="bx bx-last-page text-white text-[20px] max-2xl:text-[18px] max-xs:text-[22px]"></i>
        <i className="bx bx-transfer-alt text-white text-[20px] max-2xl:text-[18px] max-xs:text-[22px]"></i>
      </div>
      <div className="lyrics flex flex-col items-center absolute bottom-2">
        <i className="bx bx-chevron-up text-white"></i>
        <h5>LYRICS</h5>
      </div>
    </div>
  );
};
