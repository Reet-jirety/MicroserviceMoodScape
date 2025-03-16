import React from "react";

export const Musiclist = () => {
  return (
    <div className="music-list bg-deep-charcoal p-5 text-white rounded-md w-[65%] max-3xl:w-full">
      <div className="header flex items-center justify-between mb-6">
        <h5 className="text-lg font-semibold">Top Songs</h5>
        <a href="#" className="text-cool-gray-txt text-xs">See all</a>
      </div>

      <div className="items space-y-5">
        {[
          { id: "01", title: "Diet Mountain Diew", artist: "Lana Del Ray", duration: "03:45", img: "assets/song-1.png" },
          { id: "02", title: "Die With A Smile", artist: "Lady Gaga, Bruno Mars", duration: "04:35", img: "assets/song-2.png" },
          { id: "03", title: "Snowman", artist: "Sia", duration: "04:22", img: "assets/song-3.png" },
          { id: "04", title: "Lover", artist: "Taylor Swift", duration: "03:17", img: "assets/song-4.png" }
        ].map((song, index) => (
          <div 
            key={song.id} 
            className={`item flex items-center justify-between`}
          >
            <div className="info flex items-center gap-4">
              <p className="text-cool-gray-txt text-sm font-bold max-4xl:hidden">{song.id}</p>
              <img src={song.img} className="w-12 h-12" alt={song.title} />
              <div>
                <h5 className="text-base font-medium">{song.title}</h5>
                <p className="text-cool-gray-txt text-xs font-bold mt-1">{song.artist}</p>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <p className="text-sm font-bold">{song.duration}</p>
              <div className="flex items-center justify-center bg-dark-bluish-gray p-2 border-2 border-light-border rounded-md">
                <i className="bx bxs-right-arrow text-[10px] text-blue-foreground"></i>
              </div>
              <i className="bx bxs-plus-square text-cool-gray-txt"></i>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
