import React, { useContext, useState } from "react";
import axios from "axios";
import { PlayerContext } from "../../../right/music/context/PlayerContext"; // Adjust path if needed

const SearchResults = ({ results, isLoading, error }) => {
  const { playSong } = useContext(PlayerContext);
  const [songLoading, setSongLoading] = useState(null); // State to track loading for individual song clicks
  const [songError, setSongError] = useState(null); // State to track errors for individual song clicks

  // console.log("SearchResults props:", { results, isLoading, error }); // Keep for debugging if needed

  if (isLoading) {
    return (
      <div className="search-results absolute top-full left-0 w-full mt-2 bg-black border border-gray-700 rounded-md p-4 shadow-lg z-10">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="search-results absolute top-full left-0 w-full mt-2 bg-black border border-gray-700 rounded-md p-4 shadow-lg z-10">
        <p className="text-white">Error: {error}</p>
      </div>
    );
  }

  // Ensure results and results.songs exist before proceeding
  if (!results || !results.songs || !results.songs.results || results.songs.results.length === 0) {
    // Optional: Render a "No songs found" message or null
    // return (
    //   <div className="search-results absolute top-full left-0 w-full mt-2 bg-black border border-gray-700 rounded-md p-4 shadow-lg z-10">
    //     <p className="text-gray-400">No songs found.</p>
    //   </div>
    // );
    return null; // Or return null if you want nothing to show
  }


  const getImageUrl = (imageArray) => {
    if (!imageArray || !Array.isArray(imageArray) || imageArray.length === 0) return "https://via.placeholder.com/50";
    // Prefer 150x150 for list view, fallback to 50x50 or the first available
    const qualityOrder = ["150x150", "50x50", "500x500"];
    for (const quality of qualityOrder) {
        const img = imageArray.find((i) => i.quality === quality);
        if (img && img.url) return img.url;
    }
    // Fallback to the first image URL if specific qualities not found
    return imageArray[0]?.url || "https://via.placeholder.com/50";
  };

  // Helper to get primary artist names
  const getPrimaryArtistNames = (song) => {
      if (song.artists?.primary && song.artists.primary.length > 0) {
          return song.artists.primary.map(artist => artist.name).join(', ');
      }
      // Fallback logic if primary artists aren't available in the initial search result format
      if (song.primaryArtists) return song.primaryArtists;
      if (song.artists?.all && song.artists.all.length > 0) {
           // Get singers if available
          const singers = song.artists.all.filter(a => a.role === 'singer');
          if (singers.length > 0) return singers.map(a => a.name).join(', ');
          // Fallback to first artist if no singers
          return song.artists.all[0]?.name || 'Unknown Artist';
      }
      return song.artist || 'Unknown Artist'; // Further fallback
  };

  const handleSongClick = async (song) => {
    setSongLoading(song.id); // Set loading state for this song
    setSongError(null); // Clear previous errors

    // Decide the identifier: Use song ID if available for a more direct fetch (if API supports it)
    // Otherwise, use the name/title for search as currently implemented.
    const songIdentifier = song.id; // Assuming initial search provides ID
    const searchName = song.title || song.name;

    // OPTION 1: Fetch by ID (Ideal if your backend API supports `/songs/{id}`)
    // try {
    //   const response = await axios.get(`http://localhost:8010/songs/${songIdentifier}`); // Example endpoint
    //   console.log("API response for song ID fetch:", response.data);
    //   // Adapt parsing based on the response structure for fetching by ID
    //   // const detailedSongData = response.data; // Adjust as needed
    //   // if (detailedSongData && detailedSongData.downloadUrl) {
    //   //     playSong(detailedSongData);
    //   // } else { ... error handling ... }
    // } catch (err) { ... error handling ... } finally { setSongLoading(null); }

    // OPTION 2: Fetch by Search Query (Using existing implementation, correcting parsing)
    try {
      // Use the name for searching as per the original code
      const query = encodeURIComponent(searchName);
      const response = await axios.get(
        `http://localhost:8010/songs/search?query=${encodeURIComponent(query)}&limit=1` // Fetching just one, hoping it's the right one
      );
      console.log("API response for song click search:", response.data);

      // *** CORRECTED RESPONSE PARSING ***
      if (
          response.data &&
          Array.isArray(response.data) &&
          response.data.length > 0 &&
          response.data[0].data &&
          response.data[0].data.results &&
          Array.isArray(response.data[0].data.results) &&
          response.data[0].data.results.length > 0
      ) {
          // Find the best match (ideally by comparing ID if the search returns multiple)
          // For limit=1, we assume the first result is the correct one.
          const detailedSongData = response.data[0].data.results[0];
          console.log("Detailed song data extracted:", detailedSongData);

          // Check if the necessary 'downloadUrl' exists and has URLs
          if (detailedSongData.downloadUrl && Array.isArray(detailedSongData.downloadUrl) && detailedSongData.downloadUrl.length > 0) {
             playSong(detailedSongData); // Play the song using PlayerContext
          } else {
              console.error("Detailed song data is missing valid downloadUrl:", detailedSongData);
              setSongError("Song data incomplete."); // More specific error
          }
      } else {
        console.error("Unexpected API response structure or no results found for:", query, response.data);
        setSongError("Could not fetch song details."); // Changed error message
      }
    } catch (err) {
      console.error(`Error fetching detailed song data for "${searchName}":`, err);
      setSongError("Failed to load song."); // Simplified error
    } finally {
      setSongLoading(null); // Clear loading state regardless of success or failure
    }
  };


  return (
    <div className="search-results absolute top-full left-0 w-full mt-2 bg-black border border-gray-700 rounded-md p-4 shadow-lg z-10 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-black">
      {/* Songs Section */}
      <div className="mb-4">
        <h3 className="text-white font-bold mb-2">Songs</h3>
        <ul className="space-y-2">
          {results.songs.results.slice(0, 5).map((song) => (
            <li
              key={song.id} // Ensure each song has a unique ID
              className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-md cursor-pointer relative transition-colors duration-150"
              onClick={() => handleSongClick(song)} // Use the handler function
            >
              {/* Loading Indicator */}
              {songLoading === song.id && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-md z-10">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                </div>
              )}
              {/* Error Indicator */}
              {songError && songLoading !== song.id && ( // Show error only if not loading
                <div className="absolute inset-0 bg-red-800 bg-opacity-70 flex items-center justify-center rounded-md z-10 px-2">
                  <p className="text-white text-xs text-center line-clamp-2">{songError}</p>
                </div>
              )}
              <img
                src={getImageUrl(song.image)} // Use helper function for image URL
                alt={song.title || song.name} // Use title or name
                className="w-10 h-10 rounded object-cover flex-shrink-0"
                onError={(e) => { // Fallback for broken images
                  e.target.src = "https://via.placeholder.com/50";
                }}
              />
              <div className="flex-grow overflow-hidden">
                <p className="text-white font-medium truncate">{song.title || song.name}</p>
                <p className="text-gray-400 text-sm truncate">
                    {getPrimaryArtistNames(song)} {/* Use helper for artists */}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Add sections for Albums, Artists etc. similarly if needed */}
      {/* Example for Albums (if results.albums exists) */}
      
      {results.albums && results.albums.results && results.albums.results.length > 0 && (
        <div className="mb-4">
           <h3 className="text-white font-bold mb-2">Albums</h3>
           <ul className="space-y-2">
             {results.albums.results.slice(0, 3).map((album) => (
               <li key={album.id} className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded-md cursor-pointer">
                 <img src={getImageUrl(album.image)} alt={album.name} className="w-10 h-10 rounded object-cover"/>
                 <div>
                   <p className="text-white font-medium">{album.name}</p>
                   <p className="text-gray-400 text-sm">{album.year} • {album.artist || album.primaryArtists || 'Unknown Artist'}</p>
                 </div>
               </li>
             ))}
           </ul>
         </div>
      )}
      
    </div>
  );
};

export default SearchResults;