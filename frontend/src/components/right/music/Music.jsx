import React from "react";
import { Top } from "./top/Top";
import { Player } from "./player/Player";

export const Music = () => {
  return (
    <div className="music-player text-white bg-[#202026] rounded-md h-[88%] flex flex-col">
      <Top />
      <Player />
    </div>
  );
};
