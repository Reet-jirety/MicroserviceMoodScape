import React from "react";
import "../../../../index.css";

export const Navbar = ({onOpen}) => {
  return (
    <div className="nav-links flex items-center gap-[20px]">
      <button 
        className="menu-btn hidden items-center justify-center bg-background border border-[#393e46] text-[20px] p-1 rounded-lg cursor-pointer max-2xl:flex"
        onClick={onOpen}
      >
        <i className="bx bx-menu text-white"></i>
      </button>
      <a href="/" className="uppercase text-primary transition-all duration-300 ease-in-out max-2xl:text-[13px]">Music</a>
      <a href="/emotion" className="uppercase text-primary transition-all duration-300 ease-in-out max-2xl:text-[13px]">Emotion</a>
    </div>
  );
};
