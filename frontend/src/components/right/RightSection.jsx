import React from "react";
import { Profile } from "./profile/Profile";
import { Music } from "./music/Music";

export const RightSection = () => {
  return (
    <div className="right-section p-5 pr-9 pl-0 pb-5 pt-5 max-xs:py-5 max-xs:px-9">
      <Profile />
      <Music />
    </div>
  );
};
