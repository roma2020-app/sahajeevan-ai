import React from "react";
import { Heart, Trees, Flame, Clock, Sparkles, Sprout, ArrowRight } from "lucide-react";
import { UserStats } from "../types";

interface ProgressSectionProps {
  stats: UserStats;
  onCreateMoment: () => void;
}

export const ProgressSection: React.FC<ProgressSectionProps> = ({
  stats,
  onCreateMoment
}) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Section Header */}
      <div className="text-center sm:text-left">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1E3A2B]">
          Family Progress
        </h2>
        <p className="text-sm text-[#5A564F] mt-1">
          Simple milestones of your shared time and connection with the Earth.
        </p>
      </div>

      {/* Main 3 Metrics as Requested in Prompt */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Family Moments */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#EAE6DF] shadow-xs text-center sm:text-left flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-[#EBF2ED] text-[#2E5A44] border border-[#D4E3D8] flex items-center justify-center mb-3 mx-auto sm:mx-0">
            <Heart className="w-5 h-5 fill-[#2E5A44]" />
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-display font-bold text-[#1E3A2B]">
              {stats.totalMoments}
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#5A564F] mt-1">
              Family Moments
            </p>
            <p className="text-[11px] text-[#7A766F] mt-0.5">
              Completed together
            </p>
          </div>
        </div>

        {/* Metric 2: Nature Activities */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#EAE6DF] shadow-xs text-center sm:text-left flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-[#EBF2ED] text-[#2E5A44] border border-[#D4E3D8] flex items-center justify-center mb-3 mx-auto sm:mx-0">
            <Trees className="w-5 h-5" />
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-display font-bold text-[#1E3A2B]">
              {stats.outdoorMoments}
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#5A564F] mt-1">
              Nature Activities
            </p>
            <p className="text-[11px] text-[#7A766F] mt-0.5">
              Outdoor explorations
            </p>
          </div>
        </div>

        {/* Metric 3: Current Streak */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#EAE6DF] shadow-xs text-center sm:text-left flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-amber-600 border border-[#FDE68A] flex items-center justify-center mb-3 mx-auto sm:mx-0">
            <Flame className="w-5 h-5 fill-amber-500" />
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-display font-bold text-[#1E3A2B]">
              {stats.currentStreak} <span className="text-lg font-normal text-[#7A766F]">days</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#5A564F] mt-1">
              Current Streak
            </p>
            <p className="text-[11px] text-[#7A766F] mt-0.5">
              Daily habit of bonding
            </p>
          </div>
        </div>
      </div>

      {/* Bonus Quality Time Overview Card */}
      <div className="bg-white rounded-2xl p-6 border border-[#EAE6DF] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF8F4] border border-[#EAE6DF] text-[#2E5A44] flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-[#1E3A2B]">
              {stats.totalMinutes} Minutes of Quality Presence
            </h3>
            <p className="text-xs sm:text-sm text-[#5A564F]">
              Every single minute spent observing nature together strengthens your child's emotional wellbeing.
            </p>
          </div>
        </div>

        <button
          onClick={onCreateMoment}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2E5A44] text-white text-sm font-semibold hover:bg-[#244736] transition-colors cursor-pointer shrink-0 shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-[#CBE3D3]" />
          <span>New Moment</span>
        </button>
      </div>

      {/* Core Philosophy Banner (Requested requirement) */}
      <div className="p-6 rounded-2xl bg-[#F0F5F2] border border-[#D4E3D8] text-center sm:text-left relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#2E5A44] border border-[#D4E3D8] text-xs font-semibold uppercase tracking-wider mb-3 shadow-xs">
            <Sprout className="w-3.5 h-3.5 text-[#2E5A44]" />
            <span>The Sahajeevan Promise</span>
          </div>
          <p className="font-serif-quote italic text-lg sm:text-xl text-[#1E3A2B] leading-relaxed mb-3">
            "15 minutes with your child can become a meaningful family memory and a small step toward caring for nature."
          </p>
          <p className="text-xs text-[#5A564F]">
            No pressure, no long lectures—just gentle curiosity and shared wonder.
          </p>
        </div>
      </div>
    </div>
  );
};
