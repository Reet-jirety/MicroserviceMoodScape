import React from "react";

export const Navbar = () => {
  return (
    <div className="nav-links flex items-center gap-[20px]">
      <button className="menu-btn hidden items-center justify-center bg-[#1d1d1d] border border-[#464748] text-[20px] p-1 rounded-lg cursor-pointer" id="menu-open">
        <i className="bx bx-menu"></i>
      </button>
      <a href="#" className="uppercase text-[#919191] transition-all duration-300 ease-in-out">Music</a>
      <a href="#" className="uppercase text-[#919191] transition-all duration-300 ease-in-out">Live</a>
      <a href="#" className="uppercase text-[#919191] transition-all duration-300 ease-in-out">Podcast</a>
    </div>
  );
};
