import React, { useState, useRef, useEffect } from "react";

// Helper: choose the best quality image (assumes the last image is best quality)
const getBestImage = (images) => {
  if (!images || images.length === 0) return null;
  return images[images.length - 1].url;
};

const Player = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPaused, setIsPaused] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  // Update time/duration of the audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateTime = () => setPosition(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, [currentTrack]);

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Search Saavn for songs matching the query
  const searchTracks = async () => {
    if (!searchQuery) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://saavn.dev/api/search?query=${encodeURIComponent(searchQuery)}`
      );
      const data = await res.json();
      if (data.success) {
        setTracks(data.data.songs.results);
      } else {
        setError("Search failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred while searching.");
    } finally {
      setIsLoading(false);
    }
  };

  // Play a track using its title (calls detailed endpoint for best quality audio)
  const playTrack = async (track) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(
        `https://saavn.dev/api/search/songs?query=${encodeURIComponent(
          track.title
        )}`
      );
      const data = await res.json();
      if (data.success && data.data.results.length > 0) {
        // Attempt to find a matching song by id, if not fallback to the first result.
        const songData =
          data.data.results.find((song) => song.id === track.id) ||
          data.data.results[0];

        const transformedTrack = {
          id: songData.id,
          name: songData.name,
          album: {
            name: songData.album?.name || "",
            images: track.image || [], // use images from search result
          },
          artists: songData.artists?.primary || [],
          duration: songData.duration || 0,
          // Use the first downloadUrl as best quality audio
          downloadUrl:
            songData.downloadUrl && songData.downloadUrl.length > 0
              ? songData.downloadUrl[0].url
              : null,
        };
        setCurrentTrack(transformedTrack);
        if (transformedTrack.downloadUrl && audioRef.current) {
          audioRef.current.src = transformedTrack.downloadUrl;
          await audioRef.current.play();
          setIsPaused(false);
        } else {
          setError("No playable URL found for this track.");
        }
      } else {
        setError("Failed to fetch song details.");
      }
    } catch (err) {
      setError("An error occurred while playing the track.");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle playback state
  const togglePlayback = async () => {
    if (!audioRef.current) return;
    if (isPaused) {
      await audioRef.current.play();
      setIsPaused(false);
    } else {
      audioRef.current.pause();
      setIsPaused(true);
    }
  };

  // Allow seeking by clicking on the progress bar
  const seekToPosition = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    audioRef.current.currentTime = newTime;
    setPosition(newTime);
  };

  const currentTrackId = currentTrack ? currentTrack.id : null;

  return (
    <div
      style={{
        backgroundColor: "var(--color-background)",
        color: "var(--color-primary)",
      }}
      className="min-h-screen font-sans overflow-hidden"
    >
      {/* Hidden audio element */}
      <audio ref={audioRef} />

      {/* Header */}
      <header
        style={{
          backgroundColor: "var(--color-light-background)",
          borderBottom: "1px solid var(--color-border)",
        }}
        className="sticky top-0 z-20 shadow-lg"
      >
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <svg
              style={{ fill: "var(--color-blue-foreground)" }}
              className={`w-10 h-10 mr-4 transition-transform duration-300 ${
                !isPaused ? "animate-bounce" : ""
              }`}
              viewBox="0 0 24 24"
            >
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            <h1 className="text-3xl font-extrabold tracking-tight">
              MoodScape
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 relative">
        {/* Error Message */}
        {error && (
          <div
            style={{
              backgroundColor: "var(--color-rusty-red)",
              border: `1px solid var(--color-rusty-red)`,
            }}
            className="mb-8 rounded-xl p-5 shadow-lg"
          >
            <div className="flex items-center">
              <svg
                className="w-6 h-6 mr-3"
                style={{ fill: "var(--color-secondary)" }}
                viewBox="0 0 20 20"
              >
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
              </svg>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div>
          <div className="relative max-w-3xl mx-auto mb-12">
            <input
              type="text"
              style={{
                backgroundColor: "var(--color-midnight-gray)",
                color: "var(--color-primary)",
                border: `1px solid var(--color-border)`,
              }}
              className="w-full p-5 pl-14 pr-20 rounded-full transition-all duration-500 shadow-md"
              placeholder="Search for songs, artists, or albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && searchTracks()}
            />
            <svg
              className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6"
              style={{ fill: "var(--color-cool-gray-txt)" }}
              viewBox="0 0 24 24"
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <button
              style={{
                backgroundColor: "var(--color-blue-foreground)",
                color: "var(--color-secondary)",
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-3 rounded-full transition-all duration-300 shadow-md"
              onClick={searchTracks}
              disabled={isLoading}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-6 w-6"
                  style={{ fill: "var(--color-secondary)" }}
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                "Search"
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Now Playing */}
            <div className="lg:col-span-1">
              {currentTrack ? (
                <div
                  key={currentTrack.id}
                  style={{
                    backgroundColor: "var(--color-light-background)",
                    border: `1px solid var(--color-light-border)`,
                  }}
                  className="rounded-2xl p-8 shadow-lg transition-all duration-300"
                >
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <span
                      className="w-3 h-3 rounded-full mr-3"
                      style={{
                        backgroundColor: "var(--color-blue-foreground)",
                      }}
                    ></span>
                    Now Playing
                  </h2>
                  {getBestImage(currentTrack.album.images) && (
                    <div className="relative w-full overflow-hidden rounded-xl shadow-md transition-transform duration-300">
                      <img
                        src={getBestImage(currentTrack.album.images)}
                        alt="Album Art"
                        className="w-full h-full object-cover"
                      />
                      <div
                        className="absolute inset-0 transition-opacity duration-300"
                        style={{
                          backgroundColor: isPaused
                            ? "transparent"
                            : "rgba(0,0,0,0.5)",
                        }}
                      ></div>
                    </div>
                  )}
                  <div className="mt-6 space-y-3">
                    <h3 className="font-bold text-2xl line-clamp-1">
                      {currentTrack.name}
                    </h3>
                    <p>{currentTrack.artists.map((a) => a.name).join(", ")}</p>
                    <p className="text-sm">{currentTrack.album.name}</p>
                  </div>
                  <div className="mt-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span>{formatTime(position)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                    <div
                      className="w-full rounded-full h-3 cursor-pointer relative"
                      style={{ backgroundColor: "var(--color-border)" }}
                      onClick={seekToPosition}
                    >
                      <div
                        className="h-3 rounded-full transition-all duration-200"
                        style={{
                          width: `${
                            duration ? (position / duration) * 100 : 0
                          }%`,
                          backgroundColor: "var(--color-blue-foreground)",
                        }}
                      ></div>
                    </div>
                  </div>
                  <button
                    style={{
                      backgroundColor: "var(--color-blue-foreground)",
                      color: "var(--color-secondary)",
                    }}
                    className="w-full mt-6 py-4 rounded-full font-semibold shadow-md transition-all duration-300"
                    onClick={togglePlayback}
                  >
                    {isPaused ? "Play" : "Pause"}
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: "var(--color-light-background)",
                    border: `1px solid var(--color-light-border)`,
                  }}
                  className="rounded-2xl p-8 shadow-lg flex items-center justify-center"
                >
                  <p className="text-xl text-center">
                    Search for a track to play
                  </p>
                </div>
              )}
            </div>

            {/* Search Results */}
            <div className="lg:col-span-2">
              {tracks.length > 0 && (
                <div
                  style={{
                    backgroundColor: "var(--color-light-background)",
                    border: `1px solid var(--color-light-border)`,
                  }}
                  className="rounded-2xl shadow-lg overflow-hidden"
                >
                  <div
                    className="p-6 border-b flex items-center justify-between"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <h2 className="text-2xl font-bold">Search Results</h2>
                    <span className="text-sm">{tracks.length} tracks</span>
                  </div>
                  <div>
                    {tracks.map((track, index) => {
                      const isCurrentTrack = currentTrackId === track.id;
                      return (
                        <div
                          key={track.id}
                          className={`flex items-center p-5 transition-all duration-300 cursor-pointer ${
                            isCurrentTrack ? "border-l-4" : "hover:opacity-80"
                          }`}
                          style={{
                            borderLeft: isCurrentTrack
                              ? `4px solid var(--color-blue-foreground)`
                              : "none",
                            animationDelay: `${index * 100}ms`,
                          }}
                          onClick={() => playTrack(track)}
                        >
                          <div
                            className="mr-5 text-center w-6"
                            style={{
                              color: isCurrentTrack
                                ? "var(--color-blue-foreground)"
                                : "var(--color-cool-gray-txt)",
                            }}
                          >
                            {isCurrentTrack ? (
                              <svg
                                className="w-6 h-6 animate-bounce"
                                viewBox="0 0 20 20"
                                style={{ fill: "var(--color-blue-foreground)" }}
                              >
                                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                              </svg>
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div className="w-14 h-14 flex-shrink-0 mr-5 overflow-hidden rounded-lg shadow-md transition-transform duration-300">
                            <img
                              src={track.image && getBestImage(track.image)}
                              alt="Album Art"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0 mr-5">
                            <p
                              className={`font-medium truncate ${
                                isCurrentTrack ? "text-blue-foreground" : ""
                              }`}
                            >
                              {track.title}
                            </p>
                            <p className="text-sm truncate">
                              {track.primaryArtists || track.artist}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: `1px solid var(--color-border)`,
        }}
        className="py-8 px-6 text-center text-sm"
      >
        <p>Powered by MoodScape</p>
      </footer>

      {/* Custom CSS */}
      <style jsx global>{`
        @keyframes beat {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        .animate-beat {
          animation: beat 1s infinite;
        }
        @keyframes spinSlow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spinSlow {
          animation: spinSlow 10s linear infinite;
        }
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-bounceIn {
          animation: bounceIn 0.8s ease-out;
        }
        @keyframes zoomIn {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-zoomIn {
          animation: zoomIn 0.6s ease-in-out;
        }
        @keyframes slideInRight {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out;
        }
        @keyframes fadeInUp {
          0% {
            transform: translateY(20px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        @keyframes slideInDown {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideInDown {
          animation: slideInDown 0.5s ease-out;
        }
        @keyframes fadeInRight {
          0% {
            transform: translateX(20px);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-fadeInRight {
          animation: fadeInRight 0.6s ease-out;
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-pulse {
          animation: pulse 2s infinite;
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
      `}</style>
    </div>
  );
};

export default Player;
