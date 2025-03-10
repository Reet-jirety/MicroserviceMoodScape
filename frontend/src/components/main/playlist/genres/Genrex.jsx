import React from "react";

export const Genrex = () => {
  return (
    <div className="text-white bg-deep-charcoal p-5 rounded-md w-[40%] max-4xl:w-[30%] max-3xl:hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <h5>Genres</h5>
        <a href="#" className="text-cool-gray-txt text-xs">See all</a>
      </div>

      {/* Genre Items */}
      <div className="grid grid-cols-2 gap-2 max-4xl:grid-cols-[1fr]">
        {[
          { name: "Electro Pop", bg: "bg-steel-blue" },
          { name: "Dance Beat", bg: "bg-warm-taupe" },
          { name: "Clubhouse Remix", bg: "bg-rusty-red" },
          { name: "Hip-Hop Rap", bg: "bg-deep-teal" },
          { name: "Alternative Indie", bg: "bg-dusky-rose" },
          { name: "Classical Period", bg: "bg-royal-purple" },
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
