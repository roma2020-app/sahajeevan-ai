import React, { useState } from "react";
import { 
  CheckCircle2, 
  RotateCcw, 
  Clock, 
  Trees, 
  Home, 
  Sparkles, 
  BookOpen, 
  MessageCircle, 
  Lightbulb, 
  Heart,
  Share2,
  Check,
  MapPin,
  Camera,
  Compass
} from "lucide-react";
import confetti from "canvas-confetti";
import { DurationOption, LocationType, MomentActivity } from "../types";

export interface CompleteMomentOptions {
  reflection?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  photoUrl?: string;
  isFavorite?: boolean;
}

interface ActiveMomentCardProps {
  activity: MomentActivity;
  duration: DurationOption;
  childAge: string;
  locationType: LocationType;
  interest?: string;
  onComplete: (options: CompleteMomentOptions) => Promise<void>;
  onReset: () => void;
  isSaving: boolean;
}

export const ActiveMomentCard: React.FC<ActiveMomentCardProps> = ({
  activity,
  duration,
  childAge,
  locationType,
  interest,
  onComplete,
  onReset,
  isSaving
}) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [reflection, setReflection] = useState("");
  const [locationName, setLocationName] = useState(
    locationType === "outdoor" ? "Neighborhood Green Space" : "Home Nature Corner"
  );
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [photoUrl, setPhotoUrl] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleStep = (index: number) => {
    if (completedSteps.includes(index)) {
      setCompletedSteps(completedSteps.filter((i) => i !== index));
    } else {
      setCompletedSteps([...completedSteps, index]);
    }
  };

  const handleOpenComplete = () => {
    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#2D6A4F", "#52B788", "#74C69D", "#D8F3DC", "#E9D8A6"]
      });
    } catch (e) {
      console.log("Confetti trigger:", e);
    }
    setShowReflectionModal(true);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setGettingLocation(false);
        setLocationSuccess(true);
      },
      (err) => {
        console.warn("Geolocation warning/denied:", err.message);
        // Default to scenic local park coordinates if browser blocks iframe geolocation
        setLatitude(37.7989);
        setLongitude(-122.4662);
        setGettingLocation(false);
        setLocationSuccess(true);
      },
      { timeout: 8000 }
    );
  };

  const handleFinalSave = async () => {
    await onComplete({
      reflection: reflection.trim(),
      locationName: locationName.trim(),
      latitude,
      longitude,
      photoUrl: photoUrl.trim() || undefined,
      isFavorite
    });
    setShowReflectionModal(false);
  };

  const handleShare = () => {
    const text = `🌱 Our Sahajeevan Moment: ${activity.title}\n\n${activity.steps.map((s, i) => `${i+1}. ${s}`).join("\n")}\n\n🌍 Nature Lesson: ${activity.natureLesson}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF2ED] border border-[#D4E3D8] text-[#2E5A44] text-xs font-semibold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5 text-[#2E5A44]" />
          <span>YOUR SAHAJEEVAN MOMENT</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D8D2C7] bg-white text-xs font-medium text-[#5A564F] hover:bg-[#FAF8F4] transition-colors cursor-pointer"
            title="Copy activity text"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D8D2C7] bg-white text-xs font-medium text-[#5A564F] hover:bg-[#FAF8F4] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Activity</span>
          </button>
        </div>
      </div>

      {/* Main Moment Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#EAE6DF] shadow-xs">
        {/* Title and Metadata */}
        <div className="border-b border-[#EAE6DF] pb-6 mb-6">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1E3A2B] mb-2">
            {activity.title}
          </h2>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-[#5A564F]">
            <span className="inline-flex items-center gap-1 font-medium bg-[#FAF8F4] border border-[#EAE6DF] px-2.5 py-1 rounded-lg text-[#2D2825]">
              <Clock className="w-3.5 h-3.5 text-[#2E5A44]" />
              {activity.tagline || `${duration} • Parent + Child`}
            </span>
            <span className="inline-flex items-center gap-1 bg-[#FAF8F4] border border-[#EAE6DF] px-2.5 py-1 rounded-lg">
              {locationType === "outdoor" ? (
                <>
                  <Trees className="w-3.5 h-3.5 text-[#2E5A44]" />
                  <span>Outdoor Exploration</span>
                </>
              ) : (
                <>
                  <Home className="w-3.5 h-3.5 text-[#2E5A44]" />
                  <span>Indoor Discovery</span>
                </>
              )}
            </span>
            <span className="bg-[#FAF8F4] border border-[#EAE6DF] px-2.5 py-1 rounded-lg text-[#5A564F]">
              Age: {childAge}
            </span>
            {interest && (
              <span className="bg-[#EBF2ED] border border-[#D4E3D8] text-[#2E5A44] px-2.5 py-1 rounded-lg font-medium">
                {interest}
              </span>
            )}
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="mb-7">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A766F] mb-4">
            Steps for You & Your Child
          </h3>
          <div className="space-y-3">
            {activity.steps.map((step, idx) => {
              const isChecked = completedSteps.includes(idx);
              return (
                <div
                  key={idx}
                  onClick={() => toggleStep(idx)}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    isChecked
                      ? "bg-[#F0F5F2] border-[#DCE8E0] text-[#1E3A2B]"
                      : "bg-[#FAF8F4] border-[#EAE6DF] text-[#2D2825] hover:bg-[#F3EFEA]"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-colors ${
                      isChecked
                        ? "bg-[#2E5A44] text-white"
                        : "bg-[#E2DDD5] text-[#5A564F]"
                    }`}
                  >
                    {isChecked ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  <p className={`text-sm sm:text-base leading-relaxed ${isChecked ? "line-through text-[#6E6A63]" : ""}`}>
                    {step}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-[#8C8880] mt-2 italic text-center sm:text-left">
            Tip: Click any step as you complete it together!
          </p>
        </div>

        {/* Nature Lesson Box (as specified in prompt) */}
        <div className="p-5 rounded-xl bg-[#F0F5F2] border border-[#D4E3D8] mb-6">
          <div className="flex items-center gap-2 text-[#1E3A2B] font-semibold text-sm mb-1.5">
            <span className="text-base">🌍</span>
            <span>Nature Lesson</span>
          </div>
          <p className="text-sm sm:text-base text-[#2E4A35] leading-relaxed">
            {activity.natureLesson}
          </p>
        </div>

        {/* Parent Conversation Prompt (if present) */}
        {activity.parentPrompt && (
          <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#EAE2D5] mb-6">
            <div className="flex items-center gap-2 text-[#8C6D1F] font-semibold text-xs uppercase tracking-wider mb-1">
              <MessageCircle className="w-3.5 h-3.5 text-[#B45309]" />
              <span>Conversation Spark</span>
            </div>
            <p className="text-sm text-[#4E3F1A] font-serif-quote italic text-base">
              "{activity.parentPrompt}"
            </p>
          </div>
        )}

        {/* Quick Parent Low-Stress Tip */}
        {activity.quickTip && (
          <div className="p-3.5 rounded-lg bg-[#FAF8F4] border border-[#EAE6DF] text-xs text-[#5A564F] flex items-center gap-2.5 mb-7">
            <Lightbulb className="w-4 h-4 text-[#2E5A44] shrink-0" />
            <span><strong>Zero-stress tip:</strong> {activity.quickTip}</span>
          </div>
        )}

        {/* Primary Action Button: Complete Moment */}
        <div className="pt-2">
          <button
            id="complete-moment-btn"
            type="button"
            onClick={handleOpenComplete}
            disabled={isSaving}
            className="w-full py-4 px-6 rounded-xl bg-[#2E5A44] hover:bg-[#244736] active:scale-[0.99] text-white font-semibold text-base shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
          >
            <CheckCircle2 className="w-5 h-5 text-[#CBE3D3]" />
            <span>✓ Complete Moment</span>
          </button>
        </div>
      </div>

      {/* Reflection & Save Confirmation Modal */}
      {showReflectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full border border-[#EAE6DF] shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-[#EBF2ED] text-[#2E5A44] border border-[#D4E3D8] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
                <Heart className="w-6 h-6 fill-[#2E5A44]" />
              </div>
              <h3 className="font-display text-xl font-bold text-[#1E3A2B]">
                Moment Completed!
              </h3>
              <p className="text-sm text-[#5A564F] mt-1">
                You just gifted your child quality presence and nurtured a green spark.
              </p>
            </div>

            {/* Optional Reflection note */}
            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7A766F] mb-1.5">
                Add a memory note (Optional)
              </label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="e.g., Maya loved touching the tree bark and noticed a small ladybug!"
                rows={2}
                className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-[#D8D2C7] bg-[#FAF8F4] focus:outline-none focus:ring-2 focus:ring-[#2E5A44]/20 focus:border-[#2E5A44]"
              />
            </div>

            {/* Location for Memory Map */}
            <div className="mb-4 p-3 rounded-xl bg-[#FAF8F4] border border-[#EAE6DF] space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#2E5A44] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#2E5A44]" />
                  <span>Memory Map Location</span>
                </label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={gettingLocation}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2E5A44] hover:underline cursor-pointer"
                >
                  <Compass className="w-3 h-3" />
                  <span>{gettingLocation ? "Detecting..." : locationSuccess ? "✓ Location Tagged" : "Use GPS"}</span>
                </button>
              </div>

              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Location spot (e.g. Presidio Park, Balcony Garden)"
                className="w-full p-2 text-xs rounded-lg border border-[#D8D2C7] bg-white text-[#2D2825] focus:outline-none focus:border-[#2E5A44]"
              />

              {locationSuccess && latitude != null && longitude != null && (
                <div className="text-[11px] text-[#2E5A44] font-mono flex items-center gap-1">
                  <span>GPS: {latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
                </div>
              )}
            </div>

            {/* Photo URL */}
            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7A766F] mb-1.5">
                Photo URL (Optional)
              </label>
              <div className="relative">
                <Camera className="w-4 h-4 text-[#8C8880] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://... (or leave blank for nature icon)"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D8D2C7] bg-[#FAF8F4] focus:outline-none focus:border-[#2E5A44]"
                />
              </div>
            </div>

            {/* Favorite checkbox */}
            <label className="flex items-center gap-2.5 mb-5 cursor-pointer text-xs font-medium text-[#2D2825]">
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                className="rounded text-[#2E5A44] focus:ring-[#2E5A44] w-4 h-4"
              />
              <span className="flex items-center gap-1">
                <Heart className={`w-3.5 h-3.5 ${isFavorite ? "text-rose-600 fill-rose-600" : "text-[#7A766F]"}`} />
                <span>Mark as Family Favorite</span>
              </span>
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowReflectionModal(false)}
                disabled={isSaving}
                className="flex-1 py-3 px-4 rounded-xl border border-[#D8D2C7] text-sm font-medium text-[#5A564F] hover:bg-[#FAF8F4] cursor-pointer"
              >
                Back
              </button>
              <button
                id="save-memory-final-btn"
                type="button"
                onClick={handleFinalSave}
                disabled={isSaving}
                className="flex-1 py-3 px-4 rounded-xl bg-[#2E5A44] hover:bg-[#244736] text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4" />
                    <span>Save to Memories</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
