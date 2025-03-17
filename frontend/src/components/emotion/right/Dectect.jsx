import React, { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import { Profile } from "@/components/right/profile/Profile";
import { motion } from "framer-motion";

// Emotional theme configuration
const emotionalThemes = {
  happy: {
    bg: "from-yellow-300 via-amber-400 to-orange-300",
    emoji: "😄",
    message: "Looking great! Keep smiling!",
    particles: "bg-yellow-400/20",
  },
  sad: {
    bg: "from-blue-400 via-indigo-500 to-purple-600",
    emoji: "😢",
    message: "Cheer up! Better days are coming!",
    particles: "bg-blue-400/20",
  },
  angry: {
    bg: "from-red-400 via-rose-500 to-pink-600",
    emoji: "😠",
    message: "Take a deep breath. Stay calm!",
    particles: "bg-red-400/20",
  },
  surprised: {
    bg: "from-purple-400 via-violet-500 to-fuchsia-600",
    emoji: "😲",
    message: "Wow! That's unexpected!",
    particles: "bg-purple-400/20",
  },
  neutral: {
    bg: "from-gray-400 via-slate-500 to-stone-600",
    emoji: "😐",
    message: "Keep being awesome!",
    particles: "bg-gray-400/20",
  },
  default: {
    bg: "from-gray-900 via-slate-900 to-zinc-900",
    emoji: "🤖",
    message: "Let's detect your mood!",
    particles: "bg-white/10",
  },
};

export const Detect = () => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [emotion, setEmotion] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  const currentTheme =
    emotionalThemes[emotion?.toLowerCase()] || emotionalThemes.default;

  // Animated floating particles
  const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${currentTheme.particles}`}
          initial={{
            scale: 0,
            x: Math.random() * 100,
            y: Math.random() * 100,
            opacity: 0,
          }}
          animate={{
            scale: [0, 1, 0],
            x: Math.random() * 100,
            y: Math.random() * 100,
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            width: `${Math.random() * 20 + 10}px`,
            height: `${Math.random() * 20 + 10}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  );

  // Initialize socket connection
  const initSocket = () => {
    socketRef.current = io("http://localhost:8000");

    socketRef.current.on("connect", () => {
      console.log("Socket connected");
    });

    socketRef.current.on("emotion_result", (data) => {
      if (data.error) {
        setError("Error: " + data.error);
      } else {
        setEmotion(data.emotion);
      }
    });

    socketRef.current.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  };

  // Start video stream with proper async handling
  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video metadata to load
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            resolve();
          };
        });
        setIsCameraActive(true);
      }
      return stream;
    } catch (err) {
      setError("Camera access denied: " + err.message);
      throw err;
    }
  };

  // Capture frame with proper dimensions
  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Set canvas dimensions to match video stream
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    // Return full data URL without splitting
    return canvas.toDataURL("image/jpeg");
  };

  // Start detection with proper cleanup
  const startDetection = async () => {
    try {
      setError(null);
      setIsDetecting(true);
      await startVideo();
      initSocket();

      detectionIntervalRef.current = setInterval(() => {
        const imageData = captureFrame();
        if (imageData && socketRef.current?.connected) {
          socketRef.current.emit("detect_emotion_stream", imageData);
        }
      }, 3000);
    } catch (err) {
      setIsDetecting(false);
      setIsCameraActive(false);
      console.log(err);
    }
  };

  // Stop detection with proper cleanup
  const stopDetection = () => {
    setIsDetecting(false);
    setIsCameraActive(false);

    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    setEmotion(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, []);

  // Keep existing logic for video, socket, and detection...
  // (Same as previous implementation, just keep those functions)

  return (
    <div className="right-section p-5 pr-9 pl-0 pb-5 pt-5 max-xs:py-5 max-xs:px-9">
      <Profile />

      <motion.div
        className={`relative flex flex-col items-center mt-4 rounded-lg p-8 overflow-hidden bg-gradient-to-br ${currentTheme.bg} transition-all duration-500`}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <FloatingParticles />

        <div className="relative z-10 w-full max-w-2xl text-center">
          <h2 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
            Mood Lens
          </h2>

          <div className="relative group aspect-video bg-black/30 rounded-2xl overflow-hidden backdrop-blur-sm border-2 border-white/10 mb-8">
            <video
              ref={videoRef}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
              playsInline
              muted
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-4 left-4 flex items-center">
              <div
                className={`w-3 h-3 rounded-full mr-2 animate-pulse ${
                  isCameraActive ? "bg-green-400" : "bg-red-400"
                }`}
              />
              <span className="text-white/80 text-sm">
                {isCameraActive ? "Live Detection Active" : "Camera Offline"}
              </span>
            </div>
          </div>

          <motion.div
            className="inline-block p-6 bg-white/10 backdrop-blur-lg rounded-2xl mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
          >
            <div className="text-6xl mb-4 animate-bounce">
              {currentTheme.emoji}
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              {emotion
                ? emotion.charAt(0).toUpperCase() + emotion.slice(1)
                : "Unknown"}
            </h3>
            <p className="text-white/80">{currentTheme.message}</p>
          </motion.div>

          <div className="flex justify-center gap-4">
            <motion.button
              onClick={isDetecting ? stopDetection : startDetection}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`${
                isDetecting
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-emerald-500 hover:bg-emerald-600"
              } text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors flex items-center gap-2`}
            >
              {isDetecting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Stop Analysis
                </>
              ) : (
                <>
                  <span>🎭</span>
                  Start Mood Scan
                </>
              )}
            </motion.button>
          </div>

          {error && (
            <motion.div
              className="mt-4 p-4 bg-red-500/20 text-red-200 rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              ⚠️ {error}
            </motion.div>
          )}
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0 bg-noise opacity-10 mix-blend-overlay" />
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </motion.div>
    </div>
  );
};
