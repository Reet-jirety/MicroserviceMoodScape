import React from "react";

const SearchResults = ({ results, isLoading, error }) => {
  console.log("SearchResults props:", { results, isLoading, error });

  // Show loading state
  if (isLoading) {
    return (
      <div className="search-results absolute top-full left-0 w-full mt-2 bg-black border border-gray-700 rounded-md p-4 shadow-lg z-10">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="search-results absolute top-full left-0 w-full mt-2 bg-black border border-gray-700 rounded-md p-4 shadow-lg z-10">
        <p className="text-white">Error: {error}</p>
      </div>
    );
  }

  // Return null if no results
  if (!results || Object.keys(results).length === 0) {
    return null;
  }

  // Function to get the highest quality image (500x500) or a fallback
  const getImageUrl = (imageArray) => {
    if (!imageArray || !Array.isArray(imageArray)) return "https://via.placeholder.com/50";
    const highQualityImage = imageArray.find(img => img.quality === "500x500");
    return highQualityImage?.url || imageArray[0]?.url || "https://via.placeholder.com/50";
  };

  return (
    <div className="search-results absolute top-full left-0 w-full mt-2 bg-black border border-gray-700 rounded-md p-4 shadow-lg z-10 max-h-[400px] overflow-y-auto">
      {/* Songs Section */}
      {results.songs && results.songs.results && results.songs.results.length > 0 && (
        <div className="mb-4">
          <h3 className="text-white font-bold mb-2">Songs</h3>
          <ul className="space-y-2">
            {results.songs.results.slice(0, 5).map((song) => (
              <li key={song.id} className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded-md">
                <img
                  src={getImageUrl(song.image)}
                  alt={song.title || song.name}
                  className="w-10 h-10 rounded object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/50"; // Fallback image
                  }}
                />
                <div>
                  <p className="text-white font-medium">{song.title || song.name}</p>
                  <p className="text-gray-400 text-sm">{song.primaryArtists || song.singers || song.artist}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Albums Section */}
      {results.albums && results.albums.results && results.albums.results.length > 0 && (
        <div className="mb-4">
          <h3 className="text-white font-bold mb-2">Albums</h3>
          <ul className="space-y-2">
            {results.albums.results.slice(0, 3).map((album) => (
              <li key={album.id} className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded-md">
                <img
                  src={getImageUrl(album.image)}
                  alt={album.title}
                  className="w-10 h-10 rounded object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/50"; // Fallback image
                  }}
                />
                <div>
                  <p className="text-white font-medium">{album.title}</p>
                  <p className="text-gray-400 text-sm">{album.artist}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Artists Section */}
      {results.artists && results.artists.results && results.artists.results.length > 0 && (
        <div>
          <h3 className="text-white font-bold mb-2">Artists</h3>
          <ul className="space-y-2">
            {results.artists.results.slice(0, 3).map((artist) => (
              <li key={artist.id} className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded-md">
                <img
                  src={getImageUrl(artist.image)}
                  alt={artist.title || artist.name}
                  className="w-10 h-10 rounded object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/50"; // Fallback image
                  }}
                />
                <div>
                  <p className="text-white font-medium">{artist.title || artist.name}</p>
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