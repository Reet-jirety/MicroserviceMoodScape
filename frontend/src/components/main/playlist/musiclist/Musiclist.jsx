import React from "react";

export const Musiclist = () => {
  return (
    <div className="music-list bg-[#202026] p-5 text-white rounded-md w-[65%] max-3xl:w-full">
      <div className="header flex items-center justify-between mb-6">
        <h5 className="text-lg font-semibold">Top Songs</h5>
        <a href="#" className="text-[#919191] text-xs">See all</a>
      </div>

      <div className="items space-y-5">
        {[
          { id: "01", title: "Sunrise", artist: "Lila Rivera", duration: "03:45", img: "assets/song-1.png" },
          { id: "02", title: "Voyage", artist: "Tyde Brennnan", duration: "04:35", img: "assets/song-2.png" },
          { id: "03", title: "Breeze", artist: "Sola Kim", duration: "04:22", img: "assets/song-3.png" },
          { id: "04", title: "Twilight", artist: "Jett Lawsonn", duration: "03:17", img: "assets/song-4.png" }
        ].map((song, index) => (
          <div 
            key={song.id} 
            className={`item flex items-center justify-between`}
          >
            <div className="info flex items-center gap-4">
              <p className="text-[#919191] text-sm font-bold max-4xl:hidden">{song.id}</p>
              <img src={song.img} className="w-12 h-12" alt={song.title} />
              <div>
                <h5 className="text-base font-medium">{song.title}</h5>
                <p className="text-[#919191] text-xs font-bold mt-1">{song.artist}</p>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <p className="text-sm font-bold">{song.duration}</p>
              <div className="flex items-center justify-center bg-[#32323d] p-2 border-2 border-[#464748] rounded-md">
                <i className="bx bxs-right-arrow text-[10px] text-[#5773ff]"></i>
              </div>
              <i className="bx bxs-plus-square text-[#919191]"></i>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
