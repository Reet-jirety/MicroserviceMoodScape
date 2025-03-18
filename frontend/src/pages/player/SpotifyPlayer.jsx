import React, { useState, useEffect } from "react";

const CLIENT_ID = "8d4b8418c9d6404eb0bf0641c73d1ebc";
const REDIRECT_URI = "http://localhost:5173/player";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const SCOPES = [
  "streaming",
  "user-read-private",
  "user-read-email",
  "user-read-playback-state",
  "user-modify-playback-state",
];

const SpotifyPlayer = () => {
  const [token, setToken] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tracks, setTracks] = useState([]);
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [isPaused, setIsPaused] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playerInitialized, setPlayerInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [positionUpdateInterval, setPositionUpdateInterval] = useState(null);
  const [currentTrackId, setCurrentTrackId] = useState(null);

  // Get token from URL hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      if (accessToken) {
        setToken(accessToken);
        window.location.hash = "";
        checkUserSubscription(accessToken);
      }
    }
  }, []);

  // Check if user has Spotify Premium
  const checkUserSubscription = async (accessToken) => {
    try {
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) throw new Error("Failed to fetch user data");
      const userData = await response.json();
      setIsPremium(userData.product === "premium");
    } catch (err) {
      setError(`Error checking subscription: ${err.message}`);
    }
  };

  // Initialize Spotify Web Playback SDK
  useEffect(() => {
    if (!token || !isPremium) return;
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const playerInstance = new window.Spotify.Player({
        name: "Spotify Web Player",
        getOAuthToken: (cb) => cb(token),
        volume: 0.5,
      });

      playerInstance.addListener("ready", ({ device_id }) => {
        setDeviceId(device_id);
        setPlayerInitialized(true);
      });

      playerInstance.addListener("player_state_changed", (state) => {
        if (state) {
          setCurrentTrack(state.track_window.current_track);
          setCurrentTrackId(state.track_window.current_track.id);
          setIsPaused(state.paused);
          setPosition(state.position);
          setDuration(state.duration);
        }
      });

      playerInstance.connect();
      setPlayer(playerInstance);
    };

    return () => {
      if (player) player.disconnect();
      if (positionUpdateInterval) clearInterval(positionUpdateInterval);
    };
  }, [token, isPremium]);

  // Set up position update interval when currentTrack changes
  useEffect(() => {
    if (currentTrack && !isPaused) {
      // Clear any existing interval
      if (positionUpdateInterval) clearInterval(positionUpdateInterval);
      
      // Create a new interval to update position every second
      const interval = setInterval(() => {
        setPosition(prev => {
          // Only update if not paused and don't exceed duration
          if (!isPaused && prev < duration) {
            return prev + 1000; // Add 1 second (1000ms)
          }
          return prev;
        });
      }, 1000);
      
      setPositionUpdateInterval(interval);
    } else {
      // Clear interval when paused or no track
      if (positionUpdateInterval) {
        clearInterval(positionUpdateInterval);
        setPositionUpdateInterval(null);
      }
    }
    
    // Cleanup function
    return () => {
      if (positionUpdateInterval) {
        clearInterval(positionUpdateInterval);
      }
    };
  }, [currentTrack, isPaused, duration]);

  const login = () => {
    window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${REDIRECT_URI}&scope=${SCOPES.join("%20")}`;
  };

  const searchTracks = async () => {
    if (!token || !searchQuery.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=20`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      setTracks(data.tracks.items);
    } catch (err) {
      setError(`Search error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const playTrack = (uri, trackId) => {
    if (!deviceId || !playerInitialized) return;
    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ uris: [uri] }),
    });
    setCurrentTrackId(trackId);
  };

  const togglePlayback = () => player && (isPaused ? player.resume() : player.pause());

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const seekToPosition = (e) => {
    if (!player || !currentTrack) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const percentClicked = clickPosition / progressBar.offsetWidth;
    const seekPosition = Math.floor(duration * percentClicked);
    
    player.seek(seekPosition);
    setPosition(seekPosition);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#1a1b1e] to-black text-gray-100 font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-[#1a1b1e] bg-opacity-80 backdrop-blur-lg sticky top-0 z-20 shadow-lg border-b border-[#393e46] animate-slideInDown">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <svg
              className={`w-10 h-10 text-green-500 mr-4 transition-transform duration-300 ${!isPaused ? "animate-beat" : ""}`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#c4c3c8] animate-fadeIn">Spotify Player</h1>
          </div>
          {token && (
            <div className="flex items-center space-x-3 animate-fadeInRight">
              <span className="text-sm font-medium text-[#919191]">
                {isPremium ? "Premium" : "Free"}
              </span>
              <div
                className={`w-3 h-3 rounded-full shadow-md transition-all duration-300 ${isPremium ? "bg-green-500 animate-pulse" : "bg-yellow-500"}`}
              />
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 relative">
        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-[#a24c34] bg-opacity-70 border border-[#a24c34] rounded-xl p-5 shadow-2xl animate-bounceIn">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-300 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-100">{error}</p>
            </div>
          </div>
        )}

        {/* Login Screen */}
        {!token ? (
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-lg mx-auto animate-zoomIn">
            <svg className="w-32 h-32 text-green-500 mb-8 animate-spinSlow" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            <h2 className="text-4xl font-bold mb-6 text-[#c4c3c8] animate-fadeInUp">Welcome to Spotify Web Player</h2>
            <p className="text-[#919191] mb-10 animate-fadeInUp animation-delay-200">Stream your favorite music with a premium experience</p>
            <button
              onClick={login}
              className="bg-green-500 hover:bg-green-400 text-black font-semibold py-4 px-10 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 hover:rotate-2 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50 animate-pulse"
            >
              Connect with Spotify
            </button>
          </div>
        ) : (
          <div>
            {/* Search Bar */}
            <div className="relative max-w-3xl mx-auto mb-12 animate-slideInUp">
              <input
                type="text"
                className="w-full bg-[#25252d] text-[#c4c3c8] p-5 pl-14 pr-20 rounded-full border border-[#393e46] focus:border-green-500 focus:ring-4 focus:ring-green-500 focus:ring-opacity-50 transition-all duration-500 shadow-xl hover:shadow-2xl placeholder-[#919191]"
                placeholder="Search for songs, artists, or albums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && searchTracks()}
              />
              <svg
                className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-[#919191] animate-fadeIn"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-500 hover:bg-green-400 text-black px-6 py-3 rounded-full transition-all duration-300 font-semibold shadow-md hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-700"
                onClick={searchTracks}
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg className="animate-spin h-6 w-6 text-black" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  "Search"
                )}
              </button>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Now Playing */}
              <div className="lg:col-span-1 order-2 lg:order-1">
                {currentTrack ? (
                  <div
                    key={currentTrack.id}
                    className="bg-[#1d1d1d] bg-opacity-80 rounded-2xl p-8 shadow-2xl border border-[#464748] animate-fadeInUp transition-all duration-500 hover:shadow-[0_0_20px_rgba(30,215,96,0.3)]"
                  >
                    <h2 className="text-2xl font-bold mb-6 text-[#c4c3c8] flex items-center">
                      <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></span>
                      Now Playing
                    </h2>
                    {currentTrack.album.images[0]?.url && (
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-xl transition-transform duration-300 hover:scale-105 hover:rotate-1">
                        <img src={currentTrack.album.images[0].url} alt="Album Art" className="w-full h-full object-cover" />
                        <div className={`absolute inset-0 bg-gradient-to-t from-black opacity-0 ${!isPaused ? "opacity-50 animate-pulse" : ""} transition-opacity duration-300`}></div>
                      </div>
                    )}
                    <div className="mt-6 space-y-3">
                      <h3 className="font-bold text-2xl text-[#c4c3c8] line-clamp-1">{currentTrack.name}</h3>
                      <p className="text-[#919191]">{currentTrack.artists.map((a) => a.name).join(", ")}</p>
                      <p className="text-sm text-[#919191]">{currentTrack.album.name}</p>
                    </div>
                    <div className="mt-6">
                      <div className="flex justify-between text-sm text-[#919191] mb-2">
                        <span>{formatTime(position)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                      <div 
                        className="w-full bg-[#393e46] rounded-full h-3 overflow-hidden cursor-pointer relative"
                        onClick={seekToPosition}
                      >
                        <div
                          className="bg-green-500 h-3 rounded-full transition-all duration-200"
                          style={{ width: `${(position / duration) * 100}%` }}
                        ></div>
                        <div 
                          className="absolute top-0 left-0 h-full rounded-full bg-white opacity-20 hover:opacity-30 transition-opacity duration-300"
                          style={{ width: `${(position / duration) * 100}%` }}
                        ></div>
                        <div 
                          className="absolute top-0 right-0 w-3 h-3 bg-white rounded-full shadow-lg transform -translate-x-1/2 -translate-y-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
                          style={{ left: `${(position / duration) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <button
                      className="w-full mt-6 py-4 bg-green-500 hover:bg-green-400 text-black rounded-full font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_15px_rgba(30,215,96,0.5)] focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50"
                      onClick={togglePlayback}
                      disabled={!playerInitialized}
                    >
                      {isPaused ? "Play" : "Pause"}
                    </button>
                  </div>
                ) : token && isPremium && !playerInitialized && !error ? (
                  <div className="bg-[#1d1d1d] bg-opacity-80 rounded-2xl p-8 shadow-2xl border border-[#464748] animate-pulse">
                    <div className="flex flex-col items-center justify-center py-10">
                      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-500 mb-6"></div>
                      <h3 className="text-xl font-semibold text-[#c4c3c8]">Initializing Player</h3>
                      <p className="text-[#919191] mt-3">Please wait...</p>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Search Results */}
              <div className="lg:col-span-2 order-1 lg:order-2">
                {tracks.length > 0 && (
                  <div className="bg-[#1d1d1d] bg-opacity-80 rounded-2xl shadow-2xl border border-[#464748] overflow-hidden animate-slideInRight">
                    <div className="p-6 border-b border-[#464748] flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-[#c4c3c8]">Search Results</h2>
                      <span className="text-sm text-[#919191]">{tracks.length} tracks</span>
                    </div>
                    <div className="divide-y divide-[#464748]">
                      {tracks.map((track, index) => {
                        const isCurrentTrack = currentTrackId === track.id;
                        return (
                        <div
                          key={track.id}
                          className={`flex items-center p-5 ${isCurrentTrack 
                            ? "bg-[#183028] border-l-4 border-green-500" 
                            : "hover:bg-[#25252d]"} transition-all duration-300 cursor-pointer animate-fadeIn`}
                          style={{ animationDelay: `${index * 100}ms` }}
                          onClick={() => playerInitialized && isPremium && playTrack(track.uri, track.id)}
                        >
                          <div className={`${isCurrentTrack ? "text-green-500 font-bold" : "text-[#919191]"} mr-5 w-6 text-center`}>
                            {isCurrentTrack ? (
                              <svg className="w-6 h-6 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                              </svg>
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div className="w-14 h-14 flex-shrink-0 mr-5 rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:scale-110">
                            <img src={track.album.images[0]?.url} alt="Album Art" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0 mr-5">
                            <p className={`font-medium ${isCurrentTrack ? "text-green-500" : "text-[#c4c3c8]"} truncate`}>{track.name}</p>
                            <p className="text-sm text-[#919191] truncate">{track.artists.map((a) => a.name).join(", ")}</p>
                          </div>
                          <div className="hidden md:flex flex-col items-end ml-auto">
                            <span className="text-sm text-[#919191] truncate max-w-xs">{track.album.name}</span>
                            <span className="text-xs text-[#919191] mt-1">{formatTime(track.duration_ms)}</span>
                          </div>
                          <button
                            className={`ml-5 p-2 rounded-full ${isCurrentTrack 
                              ? "bg-green-600 hover:bg-green-500" 
                              : "bg-green-500 hover:bg-green-400"} text-black transition-all duration-300 transform hover:scale-110 hover:shadow-lg focus:outline-none`}
                            onClick={(e) => {
                              e.stopPropagation();
                              playTrack(track.uri, track.id);
                            }}
                          >
                            {isCurrentTrack && !isPaused ? (
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        </div>
                      )})}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 px-6 border-t border-[#393e46] animate-fadeInUp">
        <div className="container mx-auto text-center text-[#919191] text-sm">
          <p>Powered by Spotify • Premium Experience</p>
        </div>
      </footer>

      {/* Custom CSS */}
      <style jsx global>{`
        @keyframes beat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .animate-beat {
          animation: beat 1s infinite;
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spinSlow {
          animation: spinSlow 10s linear infinite;
        }
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .animate-bounceIn {
          animation: bounceIn 0.8s ease-out;
        }
        @keyframes zoomIn {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-zoomIn {
          animation: zoomIn 0.6s ease-in-out;
        }
        @keyframes slideInRight {
          0% { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out;
        }
        @keyframes fadeInUp {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        @keyframes slideInDown {
          0% { transform: translateY(-100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-slideInDown {
          animation: slideInDown 0.5s ease-out;
        }
        @keyframes fadeInRight {
          0% { transform: translateX(20px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .animate-fadeInRight {
          animation: fadeInRight 0.6s ease-out;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
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

export default SpotifyPlayer;