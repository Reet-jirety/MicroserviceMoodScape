import React from "react";
import { Top } from "./top/Top";
import { Player } from "./player/Player";


export const Music = () => {
  return (
    
    <div className="music-player text-white bg-twilight-black rounded-md h-[88%] flex flex-col max-3xl:h-[88%] max-2xl:h-[87%] max-xs:h-full">
      <Top />
      <Player />
    </div>
   
  );
};
