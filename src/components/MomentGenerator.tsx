import React, { useState } from "react";
import { Sparkles, Clock, Compass, Home, Trees, Heart, User, Lightbulb, RefreshCw } from "lucide-react";
import { DurationOption, LocationType, MomentActivity } from "../types";

interface MomentGeneratorProps {
  userName: string | null;
  onMomentGenerated: (moment: MomentActivity, config: { duration: DurationOption; childAge: string; locationType: LocationType; interest: string }) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const MomentGenerator: React.FC<MomentGeneratorProps> = ({
  userName,
  onMomentGenerated,
  isLoading,
  setIsLoading
}) => {
  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const [duration, setDuration] = useState<DurationOption>("15 min");
  const [childAge, setChildAge] = useState<string>("6 years old");
  const [locationType, setLocationType] = useState<LocationType>("outdoor");
  const [interest, setInterest] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Quick preset suggestions
  const agePresets = [
    { label: "Toddler (2-3)", value: "3 years old" },
    { label: "Early Child (4-6)", value: "5 years old" },
    { label: "Primary (7-9)", value: "8 years old" },
    { label: "Pre-teen (10-12)", value: "11 years old" }
  ];

  const interestPresets = [
    "🌳 Leaves & Bark",
    "🐜 Bugs & Ants",
    "☁️ Clouds & Sky",
    "💧 Water & Rain",
    "🌱 Seeds & Soil",
    "🐦 Birds & Sounds"
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const timeOfDay = getGreeting().toLowerCase().replace("good ", "");

    try {
      const response = await fetch("/api/generate-moment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration,
          childAge,
          locationType,
          interest: interest.trim(),
          timeOfDay
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        onMomentGenerated(result.data, {
          duration,
          childAge,
          locationType,
          interest: interest.trim()
        });
      } else {
        throw new Error(result.error || "Could not generate moment");
      }
    } catch (err: any) {
      console.error("Moment generation error:", err);
      setError("Unable to generate a moment right now. Let's try again in a moment!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header Greeting */}
      <div className="mb-8 text-center sm:text-left">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1E3A2B] flex items-center justify-center sm:justify-start gap-2">
          <span>{getGreeting()}</span>
          {userName && <span className="text-[#2E5A44]">{userName.split(" ")[0]}</span>}
          <span>👋</span>
        </h2>
        <p className="text-sm sm:text-base text-[#6E6A63] mt-1">
          Take a slow breath. Let's craft a peaceful, joyful moment for you and your child.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#EAE6DF] shadow-xs">
        <form onSubmit={handleGenerate} className="space-y-6 sm:space-y-7">
          {/* Question 1: How much time do you have? */}
          <div>
            <label className="block text-sm sm:text-base font-semibold text-[#1E3A2B] mb-3">
              How much time do you have with your child today?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["10 min", "15 min", "30 min"] as DurationOption[]).map((time) => {
                const isSelected = duration === time;
                return (
                  <button
                    key={time}
                    id={`time-btn-${time.replace(" ", "")}`}
                    type="button"
                    onClick={() => setDuration(time)}
                    className={`py-3 px-3 rounded-xl border text-center font-medium transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? "bg-[#EBF2ED] border-[#2E5A44] text-[#1E3A2B] shadow-xs ring-1 ring-[#2E5A44]"
                        : "bg-[#FAF8F4] border-[#EAE6DF] text-[#5A564F] hover:border-[#D4CEBF] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Clock className={`w-4 h-4 ${isSelected ? "text-[#2E5A44]" : "text-[#8C8880]"}`} />
                      <span className="text-base font-bold">{time}</span>
                    </div>
                    <span className="text-[11px] text-[#7A766F]">
                      {time === "10 min" && "Quick connect"}
                      {time === "15 min" && "Ideal balance"}
                      {time === "30 min" && "Deep exploration"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question 2: Child Age */}
          <div>
            <label className="block text-sm sm:text-base font-semibold text-[#1E3A2B] mb-2">
              Child age
            </label>
            
            {/* Quick age preset pills */}
            <div className="flex flex-wrap gap-2 mb-2.5">
              {agePresets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setChildAge(preset.value)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                    childAge === preset.value
                      ? "bg-[#2E5A44] text-white border-[#2E5A44]"
                      : "bg-[#FAF8F4] text-[#5A564F] border-[#EAE6DF] hover:bg-[#F3EFEA]"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom input for exact age */}
            <div className="relative">
              <input
                id="child-age-input"
                type="text"
                value={childAge}
                onChange={(e) => setChildAge(e.target.value)}
                placeholder="e.g. 6 years old, 4 and a half, 10"
                className="w-full px-4 py-2.5 rounded-xl border border-[#D8D2C7] bg-[#FAF8F4] text-[#2D2825] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E5A44]/20 focus:border-[#2E5A44] transition-all"
                required
              />
            </div>
          </div>

          {/* Question 3: Indoor / Outdoor */}
          <div>
            <label className="block text-sm sm:text-base font-semibold text-[#1E3A2B] mb-2.5">
              Indoor / Outdoor setting
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                id="outdoor-btn"
                type="button"
                onClick={() => setLocationType("outdoor")}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                  locationType === "outdoor"
                    ? "bg-[#EBF2ED] border-[#2E5A44] text-[#1E3A2B] ring-1 ring-[#2E5A44]"
                    : "bg-[#FAF8F4] border-[#EAE6DF] text-[#5A564F] hover:bg-white"
                }`}
              >
                <div className={`p-2 rounded-lg ${locationType === "outdoor" ? "bg-[#2E5A44] text-white" : "bg-[#E5EEE8] text-[#2E5A44]"}`}>
                  <Trees className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">Outdoor</p>
                  <p className="text-xs text-[#7A766F]">Park, yard, or sidewalk</p>
                </div>
              </button>

              <button
                id="indoor-btn"
                type="button"
                onClick={() => setLocationType("indoor")}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                  locationType === "indoor"
                    ? "bg-[#EBF2ED] border-[#2E5A44] text-[#1E3A2B] ring-1 ring-[#2E5A44]"
                    : "bg-[#FAF8F4] border-[#EAE6DF] text-[#5A564F] hover:bg-white"
                }`}
              >
                <div className={`p-2 rounded-lg ${locationType === "indoor" ? "bg-[#2E5A44] text-white" : "bg-[#E5EEE8] text-[#2E5A44]"}`}>
                  <Home className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">Indoor</p>
                  <p className="text-xs text-[#7A766F]">Window, balcony, or room</p>
                </div>
              </button>
            </div>
          </div>

          {/* Question 4: Optional child interest */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm sm:text-base font-semibold text-[#1E3A2B]">
                Optional child interest
              </label>
              <span className="text-xs text-[#8C8880]">Optional</span>
            </div>

            {/* Quick interest tags */}
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {interestPresets.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setInterest(interest === tag ? "" : tag)}
                  className={`text-xs px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                    interest === tag
                      ? "bg-[#2E5A44] text-white border-[#2E5A44]"
                      : "bg-[#FAF8F4] text-[#5A564F] border-[#EAE6DF] hover:bg-[#F3EFEA]"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <input
              id="interest-input"
              type="text"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              placeholder="e.g. dinosaur stones, looking at stars, collecting smooth pebbles..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#D8D2C7] bg-[#FAF8F4] text-[#2D2825] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E5A44]/20 focus:border-[#2E5A44] transition-all"
            />
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-[#FFF1F0] border border-[#FFA39E] text-[#CF1322] text-sm">
              {error}
            </div>
          )}

          {/* Submit CTA Button */}
          <button
            id="create-moment-btn"
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-xl bg-[#2E5A44] hover:bg-[#244736] active:scale-[0.99] text-white font-semibold text-base shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Crafting Your Sahajeevan Moment...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-[#CBE3D3]" />
                <span>✨ Create My Sahajeevan Moment</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Gentle Parent Tip */}
      <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-white border border-[#EAE6DF] text-xs sm:text-sm text-[#5A564F] shadow-xs">
        <Lightbulb className="w-5 h-5 text-[#2E5A44] shrink-0 mt-0.5" />
        <p>
          <strong className="text-[#1E3A2B] font-semibold">Working Parent Note:</strong> You don't need extensive gear or lots of energy. Just being present and sharing a small observation with your child creates a lifetime of trust and wonder.
        </p>
      </div>
    </div>
  );
};
