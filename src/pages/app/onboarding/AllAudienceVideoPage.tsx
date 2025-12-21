import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Play, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/auth-store';
import confetti from 'canvas-confetti';

// All-audience orientation video URL
const ORIENTATION_VIDEO_URL = 'https://descriptusercontent.com/published/5f3a94a5-c23c-4a01-94f9-b16614ddc2ee/original.mp4';

export default function AllAudienceVideoPage() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Start muted for autoplay
  const [showPlayOverlay, setShowPlayOverlay] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Handle video end - auto-navigate to dashboard
  const handleVideoEnd = () => {
    // Celebrate!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#FBBF24', '#FCD34D', '#22C55E', '#10B981']
    });

    // Navigate to dashboard after a brief moment
    setTimeout(() => {
      navigate('/app');
    }, 500);
  };

  // Handle video load - try to autoplay muted
  const handleVideoLoaded = () => {
    setIsVideoLoaded(true);

    if (videoRef.current) {
      // Try to autoplay muted first (browsers allow this)
      videoRef.current.muted = true;
      setIsMuted(true);

      videoRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setShowPlayOverlay(false);
          // After starting muted, try to unmute
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.muted = false;
              setIsMuted(false);
            }
          }, 100);
        })
        .catch((err) => {
          console.error('Autoplay failed even muted:', err);
          // Show play button overlay
          setShowPlayOverlay(true);
        });
    }
  };

  // Handle manual play
  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setShowPlayOverlay(false);
        })
        .catch((err) => {
          console.error('Manual play failed:', err);
          // Try playing muted as fallback
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().then(() => {
              setIsPlaying(true);
              setShowPlayOverlay(false);
            });
          }
        });
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  // Handle video error
  const handleVideoError = () => {
    console.error('Video failed to load');
    setVideoError(true);
  };

  // Skip video and go to dashboard
  const handleSkip = () => {
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#FBBF24', '#FCD34D']
    });
    navigate('/app');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  // Show error state with skip option
  if (videoError) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Welcome, {user.name?.split(' ')[0] || 'Challenger'}!
          </h1>
          <p className="text-slate-400 mb-6">
            We couldn't load the orientation video, but you're all set!
          </p>
          <Button
            onClick={handleSkip}
            className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold py-6 px-8 text-lg"
          >
            Enter Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Video Container */}
      <div className="flex-1 relative flex items-center justify-center">
        {/* Loading indicator while video loads */}
        {!isVideoLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a1628] z-10">
            <Loader2 className="h-12 w-12 animate-spin text-amber-500 mb-4" />
            <p className="text-slate-400">Loading orientation video...</p>
          </div>
        )}

        {/* Play button overlay - shown if autoplay fails */}
        {showPlayOverlay && isVideoLoaded && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20 cursor-pointer"
            onClick={handlePlay}
          >
            <div className="p-6 rounded-full bg-gold-500 hover:bg-gold-400 transition-colors mb-4">
              <Play className="h-16 w-16 text-navy-900 fill-navy-900" />
            </div>
            <p className="text-white text-xl font-semibold">Tap to Play</p>
            <p className="text-slate-400 mt-2">Watch your orientation video</p>
          </div>
        )}

        {/* Full-screen video */}
        <video
          ref={videoRef}
          src={ORIENTATION_VIDEO_URL}
          className="w-full h-full object-contain"
          onLoadedData={handleVideoLoaded}
          onEnded={handleVideoEnd}
          onError={handleVideoError}
          onPlay={() => { setIsPlaying(true); setShowPlayOverlay(false); }}
          onPause={() => setIsPlaying(false)}
          playsInline
          controls={false}
        />

        {/* Mute/Unmute button - only show when playing */}
        {isPlaying && (
          <button
            onClick={toggleMute}
            className="absolute bottom-4 left-4 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors z-30"
          >
            {isMuted ? (
              <VolumeX className="h-6 w-6 text-white" />
            ) : (
              <Volume2 className="h-6 w-6 text-white" />
            )}
          </button>
        )}
      </div>

      {/* Bottom bar with skip option */}
      <div className="bg-[#0a1628] py-4 px-4 flex justify-center">
        <button
          onClick={handleSkip}
          className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
        >
          Skip video →
        </button>
      </div>
    </div>
  );
}
