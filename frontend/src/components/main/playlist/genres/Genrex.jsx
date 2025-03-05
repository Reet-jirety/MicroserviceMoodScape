import React from "react";

export const Genrex = () => {
  return (
    <div className="text-white bg-[#202026] p-5 rounded-md w-[40%] max-4xl:w-[30%] max-3xl:hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <h5>Genres</h5>
        <a href="#" className="text-[#919191] text-xs">See all</a>
      </div>

      {/* Genre Items */}
      <div className="grid grid-cols-2 gap-2 max-4xl:grid-cols-[1fr]">
        {[
          { name: "Electro Pop", bg: "bg-[#476a8a]" },
          { name: "Dance Beat", bg: "bg-[#a69984]" },
          { name: "Clubhouse Remix", bg: "bg-[#a24c34]" },
          { name: "Hip-Hop Rap", bg: "bg-[#0d4045]" },
          { name: "Alternative Indie", bg: "bg-[#a67894]" },
          { name: "Classical Period", bg: "bg-[#5547a5]" },
        ].map((genre, index) => (
          <div
            key={index}
            className={`py-5 px-3 flex items-center justify-center rounded-md cursor-pointer ${genre.bg} ${index === 5 ? "max-4xl:hidden" : ""} max-4xl:p-[10px]`}
          >
            <p className="text-sm font-bold text-center max-4xl:text-[12px]">
              {genre.name.split(" ").map((word, i) => (
                <span key={i} className="block">{word}</span>
              ))}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
