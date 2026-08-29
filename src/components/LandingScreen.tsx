import React, { useState } from "react";
import { Leaf, Sparkles, Heart, Sun, Trees, ArrowRight, ShieldCheck, Clock, Compass } from "lucide-react";
import { signInWithGoogle, signInAsGuest } from "../firebase";

interface LandingScreenProps {
  onAuthSuccess: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onAuthSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      onAuthSuccess();
    } catch (err: any) {
      console.error("Sign-in failed:", err);
      if (err.code === "auth/popup-blocked" || err.code === "auth/popup-closed-by-user") {
        setError("Pop-up was closed or blocked. You can also click 'Try Guest Demo' below to explore instantly.");
      } else {
        setError(err.message || "Failed to sign in. Please try again or use Guest Demo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInAsGuest();
      onAuthSuccess();
    } catch (err: any) {
      console.error("Guest sign-in failed:", err);
      setError("Unable to start guest session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col justify-between max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
        {/* Animated Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF2ED] border border-[#D4E3D8] text-[#2E5A44] text-xs sm:text-sm font-medium mb-6 shadow-xs">
          <Leaf className="w-3.5 h-3.5 text-[#2E5A44]" />
          <span>Living together in harmony with family & nature</span>
        </div>

        {/* Brand & Name */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#1E3A2B] mb-4">
          Sahajeevan
        </h1>

        {/* Tagline */}
        <p className="font-serif-quote italic text-xl sm:text-2xl text-[#334E3C] mb-6 leading-relaxed">
          "Small Moments. Strong Families. A Greener Future."
        </p>

        {/* Core Description */}
        <p className="text-base sm:text-lg text-[#5A564F] leading-relaxed mb-8 max-w-xl">
          Designed especially for busy working parents. Turn just <strong className="text-[#1E3A2B] font-semibold">10 to 30 minutes</strong> of your day into a calming micro-adventure that bonds your family and plants a lifelong love for the Earth.
        </p>

        {/* Error message banner */}
        {error && (
          <div className="w-full mb-6 p-4 rounded-xl bg-[#FFF1F0] border border-[#FFA39E] text-[#CF1322] text-sm text-left flex items-start gap-3">
            <span className="font-bold">Notice:</span>
            <span>{error}</span>
          </div>
        )}

        {/* Auth CTA Card */}
        <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 border border-[#EAE6DF] shadow-xs flex flex-col gap-4">
          <button
            id="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-xl border border-[#D8D2C7] bg-white text-[#2D2825] font-medium text-base hover:bg-[#FAF8F4] hover:border-[#C4BEB2] active:scale-[0.99] transition-all shadow-xs disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-[#2E5A44] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-[#EAE6DF]" />
            <span className="text-xs text-[#8C8880] uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-[#EAE6DF]" />
          </div>

          <button
            id="guest-demo-btn"
            onClick={handleGuestSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl text-sm font-medium text-[#2E5A44] bg-[#F0F5F2] hover:bg-[#E5EEE8] border border-[#DCE8E0] transition-colors cursor-pointer"
          >
            Quick Guest Demo (Explore immediately)
          </button>

          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-[#7A766F]">
            <ShieldCheck className="w-4 h-4 text-[#2E5A44]" />
            <span>Private & isolated user storage on Firestore</span>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12 pt-10 border-t border-[#EAE6DF]">
        <div className="p-5 rounded-2xl bg-white border border-[#EAE6DF] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#F0F5F2] text-[#2E5A44] flex items-center justify-center mb-3 border border-[#DCE8E0]">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-display font-semibold text-base text-[#1E3A2B] mb-1">
            10, 15, or 30 Minutes
          </h3>
          <p className="text-sm text-[#5A564F] leading-relaxed">
            Quick, zero-prep activities tailored specifically for low-energy evenings and short windows after work.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#EAE6DF] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#F0F5F2] text-[#2E5A44] flex items-center justify-center mb-3 border border-[#DCE8E0]">
            <Trees className="w-5 h-5" />
          </div>
          <h3 className="font-display font-semibold text-base text-[#1E3A2B] mb-1">
            Rooted in Nature
          </h3>
          <p className="text-sm text-[#5A564F] leading-relaxed">
            Every moment includes a gentle eco-lesson—from tree bark textures and cloud watching to seed discovery.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#EAE6DF] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#F0F5F2] text-[#2E5A44] flex items-center justify-center mb-3 border border-[#DCE8E0]">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="font-display font-semibold text-base text-[#1E3A2B] mb-1">
            Family Memories Log
          </h3>
          <p className="text-sm text-[#5A564F] leading-relaxed">
            Keep a heartfelt timeline of completed moments and conversations that your family can cherish together.
          </p>
        </div>
      </div>

      {/* Footer message */}
      <div className="mt-8 text-center text-xs text-[#8C8880]">
        <p>Sahajeevan • Small moments with your child create strong bonds and a greener future.</p>
      </div>
    </div>
  );
};
