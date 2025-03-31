import React, { useState, useEffect, useRef } from "react";
import { axiosInstance } from "@/lib/axios";
import SearchResults from "./SearchResults";

export const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setSearchResults({});
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setError(null);
    setShowResults(true);
    try {
      const response = await axiosInstance.get(
        `http://localhost:8010/search?query=${encodeURIComponent(searchQuery)}`
      );
      console.log("API Response:", response.data);
      if (response.data && response.data.length > 0 && response.data[0].data) {
        setSearchResults(response.data[0].data);
        console.log("Updated searchResults:", response.data[0].data);
      } else {
        setSearchResults({});
        console.log("No results found, searchResults reset to {}");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(err.message || "An error occurred while searching");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  console.log("Current searchResults:", searchResults);
  console.log("showResults:", showResults);

  return (
    <div
      className="search relative flex items-center gap-[6px] w-[70%] bg-light-backgound border border-light-border p-[10px] rounded-[8px] max-4xl:w-1/2 max-3xl:w-[40%] max-2xl:w-[38px] max-xs:w-[40%]"
      ref={searchRef}
    >
      <i className="bx bx-search text-white"></i>
      <input
        type="text"
        placeholder="Type here to search"
        className="w-full bg-transparent border-none outline-none text-white max-2xl:hidden max-xs:block"
        value={searchQuery}
        onChange={handleInputChange}
        onFocus={() => searchQuery.trim() && setShowResults(true)}
      />
      {showResults && (
        <SearchResults results={searchResults} isLoading={isLoading} error={error} />
      )}
    </div>
  );
};