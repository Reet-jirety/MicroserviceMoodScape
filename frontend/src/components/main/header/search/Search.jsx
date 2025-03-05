import React from "react";

export const Search = () => {
  return (
    <div className="search flex items-center gap-[6px] w-[70%] bg-[#1d1d1d] border border-[#464748] p-[10px] rounded-[8px] max-4xl:w-1/2 max-3xl:w-[40%] max-2xl:w-[38px] max-xs:w-[40%]">
      <i className="bx bx-search text-white"></i>
      <input
        type="text"
        placeholder="Type here to search"
        className="w-full bg-transparent border-none outline-none text-white max-2xl:hidden max-xs:block"
      />
    </div>
  );
};
