import React from "react";
import { SignedOut, SignedIn } from "@clerk/clerk-react";
import SignInOAuthButtons from "./SignInOAuthButtons";
import { SignOutButton } from "@clerk/clerk-react";

export const Profile = () => {
  return (
    <div className="profile flex items-center justify-end gap-[18px] mb-[40px] max-xs:justify-center max-xs:mb-5">
      <i className="bx bxs-bell text-white"></i>
      <i className="bx bxs-cog text-white"></i>
      <div className="user flex">
        <SignedIn>
          <div className="text-white">
            <SignOutButton />
          </div>
        </SignedIn>

        <SignedOut>
          <SignInOAuthButtons />
        </SignedOut>
        <div className="left flex items-center bg-dark-bluish-gray p-[6px] rounded-tl-md rounded-tr-none rounded-bl-none rounded-br-none">
          <img className="w-[30px] h-[30px]" src="assets/profile.png" />
        </div>
        <div className="right bg-midnight-gray p-[13px] text-white rounded-tl-none rounded-tr-md rounded-bl-md rounded-br-none">
          <h5>Pallav Kr</h5>
          </div>
      </div>
    </div>
  );
};