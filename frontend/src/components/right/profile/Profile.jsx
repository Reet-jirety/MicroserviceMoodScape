import React, { useState, useRef, useEffect } from "react";
import { SignedOut, SignedIn, useUser } from "@clerk/clerk-react";
import SignInOAuthButtons from "./SignInOAuthButtons";
import { SignOutButton } from "@clerk/clerk-react";

export const Profile = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { user } = useUser();
  const dropdownRef = useRef(null);

  // Get the user's profile image if available
  const userImageUrl = user?.imageUrl || "assets/profile.png";
  
  // Get the user's display name
  const displayName = user?.fullName || user?.username || "User";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="profile flex items-center justify-end gap-[18px] mb-[40px] max-xs:justify-center max-xs:mb-5">
      <i className="bx bxs-bell text-white cursor-pointer hover:opacity-80 transition-opacity"></i>
      <i className="bx bxs-cog text-white cursor-pointer hover:opacity-80 transition-opacity"></i>
      
      <div className="user flex relative">
        <SignedIn>
          <div className="flex" ref={dropdownRef}>
            <button 
              className="flex items-center focus:outline-none"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="left flex items-center justify-center bg-dark-bluish-gray p-[6px] rounded-tl-md rounded-tr-none rounded-bl-md rounded-br-none">
                <img 
                  className="w-[30px] h-[30px] rounded-full object-cover" 
                  src={userImageUrl} 
                  alt="Profile" 
                />
              </div>
              <div className="right flex items-center bg-midnight-gray px-[13px] py-[10px] h-[42px] text-white rounded-tl-none rounded-tr-md rounded-bl-none rounded-br-none">
                <h5 className="font-bold text-sm">{displayName}</h5>
                <i className={`bx ${showDropdown ? 'bx-chevron-up' : 'bx-chevron-down'} ml-2 text-xs`}></i>
              </div>
            </button>

            {showDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-midnight-gray text-white rounded-md shadow-lg z-10 w-full border border-dark-bluish-gray overflow-hidden">
                <div className="py-1">
                  <a href="/profile" className="block px-4 py-2 hover:bg-dark-bluish-gray transition-colors">
                    My Profile
                  </a>
                  <a href="/settings" className="block px-4 py-2 hover:bg-dark-bluish-gray transition-colors">
                    Settings
                  </a>
                  <div className="border-t border-dark-bluish-gray my-1"></div>
                  <div className="px-4 py-2 hover:bg-dark-bluish-gray transition-colors">
                    <SignOutButton>
                      <span className="cursor-pointer flex items-center">
                        <i className="bx bx-log-out mr-2"></i> Logout
                      </span>
                    </SignOutButton>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SignedIn>
        <SignedOut>
          <SignInOAuthButtons />
        </SignedOut>
      </div>
    </div>
  );
};