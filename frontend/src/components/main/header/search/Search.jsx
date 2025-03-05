import React from "react";

export const Search = () => {
  return (
    <div className="flex items-center gap-[6px] w-[70%] bg-[#1d1d1d] border border-[#464748] p-[10px] rounded-[8px]">
      <i className="bx bx-search text-white"></i>
      <input
        type="text"
        placeholder="Type here to search"
        className="w-full bg-transparent border-none outline-none text-white"
      />
    </div>
  );
};
