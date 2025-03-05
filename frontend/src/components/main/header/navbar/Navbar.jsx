import React from "react";

export const Navbar = ({onOpen}) => {
  return (
    <div className="nav-links flex items-center gap-[20px]">
      <button 
        className="menu-btn hidden items-center justify-center bg-[#1d1d1d] border border-[#464748] text-[20px] p-1 rounded-lg cursor-pointer max-2xl:flex"
        onClick={onOpen}
      >
        <i className="bx bx-menu text-white"></i>
      </button>
      <a href="#" className="uppercase text-[#919191] transition-all duration-300 ease-in-out max-2xl:text-[13px]">Music</a>
      <a href="#" className="uppercase text-[#919191] transition-all duration-300 ease-in-out max-2xl:text-[13px]">Live</a>
      <a href="#" className="uppercase text-[#919191] transition-all duration-300 ease-in-out max-2xl:text-[13px]">Podcast</a>
    </div>
  );
};
