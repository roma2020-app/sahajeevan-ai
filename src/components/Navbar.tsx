import React from "react";
import { Leaf, LogOut, Sparkles, Heart, Flame, Compass } from "lucide-react";
import { UserProfile, UserStats } from "../types";

interface NavbarProps {
  user: UserProfile | null;
  activeTab: "dashboard" | "memories" | "progress";
  setActiveTab: (tab: "dashboard" | "memories" | "progress") => void;
  onSignOut: () => void;
  stats: UserStats;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onSignOut,
  stats
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FCFAF7]/90 backdrop-blur-md border-b border-[#EAE6DF]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Brand */}
        <div 
          id="nav-brand"
          onClick={() => setActiveTab("dashboard")}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#2E5A44] flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-102">
            <Leaf className="w-5 h-5 text-[#CBE3D3]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-xl tracking-tight text-[#1E3A2B]">
                Sahajeevan
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase bg-[#EBF2ED] text-[#2E5A44] rounded-full border border-[#D4E3D8]">
                Family & Nature
              </span>
            </div>
            <p className="text-[11px] text-[#7A766F] hidden md:block leading-tight font-serif-quote italic">
              Small Moments. Strong Families. A Greener Future.
            </p>
          </div>
        </div>

        {/* Navigation Tabs (if signed in) */}
        {user && (
          <nav className="flex items-center gap-1 sm:gap-1.5">
            <button
              id="tab-dashboard-btn"
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "dashboard"
                  ? "bg-[#2E5A44] text-white shadow-xs"
                  : "text-[#5A564F] hover:bg-[#F3EFEA] hover:text-[#1E3A2B]"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Create Moment</span>
            </button>

            <button
              id="tab-memories-btn"
              onClick={() => setActiveTab("memories")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "memories"
                  ? "bg-[#2E5A44] text-white shadow-xs"
                  : "text-[#5A564F] hover:bg-[#F3EFEA] hover:text-[#1E3A2B]"
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>Memories</span>
              {stats.totalMoments > 0 && (
                <span className={`text-xs px-1.5 py-0.2 rounded-full ${
                  activeTab === "memories" ? "bg-white/20 text-white" : "bg-[#E2EDE5] text-[#2E5A44]"
                }`}>
                  {stats.totalMoments}
                </span>
              )}
            </button>

            <button
              id="tab-progress-btn"
              onClick={() => setActiveTab("progress")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "progress"
                  ? "bg-[#2E5A44] text-white shadow-xs"
                  : "text-[#5A564F] hover:bg-[#F3EFEA] hover:text-[#1E3A2B]"
              }`}
            >
              <Flame className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">Progress</span>
              {stats.currentStreak > 0 && (
                <span className="text-xs font-semibold text-amber-600 sm:inline hidden">
                  {stats.currentStreak}d
                </span>
              )}
            </button>
          </nav>
        )}

        {/* User profile & sign out */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 pl-2 border-l border-[#E2DDD5]">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="w-8 h-8 rounded-full border border-[#DCE8E0] object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#EBF2ED] text-[#2E5A44] font-bold text-xs flex items-center justify-center border border-[#D4E3D8]">
                  {(user.displayName?.[0] || user.email?.[0] || "P").toUpperCase()}
                </div>
              )}
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-[#1E3A2B] leading-tight truncate max-w-[110px]">
                  {user.displayName || "Parent"}
                </p>
                <p className="text-[10px] text-[#7A766F] truncate max-w-[110px]">
                  {user.email || "Active"}
                </p>
              </div>
            </div>

            <button
              id="sign-out-button"
              onClick={onSignOut}
              title="Sign Out"
              className="p-2 text-[#7A766F] hover:text-[#B91C1C] hover:bg-[#FEE2E2]/60 rounded-lg transition-colors cursor-pointer"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
