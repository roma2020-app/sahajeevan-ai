/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, signOutUser, fetchUserMoments, saveCompletedMoment, deleteUserMoment, updateUserMoment, toggleFavoriteMoment, calculateStats } from "./firebase";
import { Navbar } from "./components/Navbar";
import { LandingScreen } from "./components/LandingScreen";
import { MomentGenerator } from "./components/MomentGenerator";
import { ActiveMomentCard, CompleteMomentOptions } from "./components/ActiveMomentCard";
import { MemoriesSection } from "./components/MemoriesSection";
import { ProgressSection } from "./components/ProgressSection";
import { DurationOption, LocationType, MomentActivity, MomentRecord, UserProfile, UserStats } from "./types";
import { Check, Heart, Leaf } from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "memories" | "progress">("dashboard");

  // Active generated moment state
  const [activeMoment, setActiveMoment] = useState<MomentActivity | null>(null);
  const [momentConfig, setMomentConfig] = useState<{
    duration: DurationOption;
    childAge: string;
    locationType: LocationType;
    interest: string;
  } | null>(null);

  // Moments list state from Firestore
  const [moments, setMoments] = useState<MomentRecord[]>([]);
  const [momentsLoading, setMomentsLoading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load user moments from Firestore
  const loadUserMoments = useCallback(async (uid: string) => {
    setMomentsLoading(true);
    try {
      const records = await fetchUserMoments(uid);
      setMoments(records);
    } catch (err) {
      console.error("Failed to load user moments:", err);
    } finally {
      setMomentsLoading(false);
    }
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        const profile: UserProfile = {
          uid: user.uid,
          displayName: user.displayName || (user.isAnonymous ? "Guest Parent" : "Parent"),
          email: user.email,
          photoURL: user.photoURL
        };
        setCurrentUser(profile);
        await loadUserMoments(user.uid);
      } else {
        setCurrentUser(null);
        setMoments([]);
        setActiveMoment(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [loadUserMoments]);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setCurrentUser(null);
      setActiveMoment(null);
      setMoments([]);
      setActiveTab("dashboard");
      showToast("Signed out successfully");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const handleMomentGenerated = (
    moment: MomentActivity,
    config: { duration: DurationOption; childAge: string; locationType: LocationType; interest: string }
  ) => {
    setActiveMoment(moment);
    setMomentConfig(config);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCompleteMoment = async (options?: CompleteMomentOptions | string) => {
    if (!currentUser || !activeMoment || !momentConfig) return;

    setIsSaving(true);
    try {
      const opts = typeof options === "string" ? { reflection: options } : options || {};
      
      const lat = typeof opts.latitude === "number" && Number.isFinite(opts.latitude) 
        ? opts.latitude 
        : typeof opts.latitude === "string" && !isNaN(parseFloat(opts.latitude))
          ? parseFloat(opts.latitude)
          : undefined;
          
      const lng = typeof opts.longitude === "number" && Number.isFinite(opts.longitude)
        ? opts.longitude
        : typeof opts.longitude === "string" && !isNaN(parseFloat(opts.longitude))
          ? parseFloat(opts.longitude)
          : undefined;

      const newRecord: Omit<MomentRecord, "userId"> = {
        activity: activeMoment,
        duration: momentConfig.duration,
        childAge: momentConfig.childAge,
        locationType: momentConfig.locationType,
        interest: momentConfig.interest || "Nature Exploration",
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        reflection: opts.reflection?.trim() || "",
        locationName: opts.locationName?.trim() || (momentConfig.locationType === "outdoor" ? "Neighborhood Green Spot" : "Home Nature Corner"),
        ...(lat !== undefined ? { latitude: lat } : {}),
        ...(lng !== undefined ? { longitude: lng } : {}),
        ...(opts.photoUrl?.trim() ? { photoUrl: opts.photoUrl.trim() } : {}),
        isFavorite: opts.isFavorite ?? false
      };

      const momentId = await saveCompletedMoment(currentUser.uid, newRecord);

      // Add to local state immediately
      setMoments(prev => [{ id: momentId, ...newRecord, userId: currentUser.uid }, ...prev]);
      
      setActiveMoment(null);
      setMomentConfig(null);
      showToast("❤️ Moment saved to your Family Memories & Map!");
      setActiveTab("memories");
    } catch (error) {
      console.error("Error saving moment to Firestore:", error);
      showToast("Saved locally. Could not sync with Firestore.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateMoment = async (momentId: string, updates: Partial<MomentRecord>) => {
    if (!currentUser) return;
    try {
      await updateUserMoment(currentUser.uid, momentId, updates);
      setMoments(prev => prev.map(m => m.id === momentId ? { ...m, ...updates } : m));
      showToast("Memory updated successfully");
    } catch (err) {
      console.error("Error updating moment:", err);
      showToast("Could not update memory.");
    }
  };

  const handleToggleFavorite = async (momentId: string, current: boolean) => {
    if (!currentUser) return;
    try {
      const newStatus = await toggleFavoriteMoment(currentUser.uid, momentId, current);
      setMoments(prev => prev.map(m => m.id === momentId ? { ...m, isFavorite: newStatus } : m));
      showToast(newStatus ? "Added to Favorites ❤️" : "Removed from Favorites");
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  const handleDeleteMoment = async (momentId: string) => {
    if (!currentUser) return;
    try {
      await deleteUserMoment(currentUser.uid, momentId);
      setMoments(prev => prev.filter(m => m.id !== momentId));
      showToast("Memory removed");
    } catch (error) {
      console.error("Error deleting moment:", error);
      showToast("Could not delete memory. Please try again.");
    }
  };

  const stats: UserStats = calculateStats(moments);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FCFAF7] text-[#2D2825]">
        <div className="w-12 h-12 rounded-xl bg-[#F0F5F2] text-[#2E5A44] flex items-center justify-center mb-4 border border-[#DCE8E0] animate-pulse">
          <Leaf className="w-6 h-6" />
        </div>
        <h1 className="font-display font-bold text-xl text-[#1E3A2B] tracking-tight">Sahajeevan</h1>
        <p className="text-xs text-[#7A766F] mt-1">Connecting families and nature...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFAF7] text-[#2D2825] flex flex-col selection:bg-[#E2EBE5] selection:text-[#1E3A2B]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1E3A2B] text-[#FCFAF7] text-sm font-medium px-4 py-3 rounded-xl shadow-md border border-[#2E5A44] flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <Check className="w-4 h-4 text-[#A8D5BA]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onSignOut={handleSignOut}
        stats={stats}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {!currentUser ? (
          /* 1. Landing Screen if not authenticated */
          <LandingScreen onAuthSuccess={() => setActiveTab("dashboard")} />
        ) : (
          /* 2. Authenticated Dashboard Views */
          <div>
            {activeTab === "dashboard" && (
              <>
                {activeMoment && momentConfig ? (
                  /* Active Generated Moment View */
                  <ActiveMomentCard
                    activity={activeMoment}
                    duration={momentConfig.duration}
                    childAge={momentConfig.childAge}
                    locationType={momentConfig.locationType}
                    interest={momentConfig.interest}
                    onComplete={handleCompleteMoment}
                    onReset={() => {
                      setActiveMoment(null);
                      setMomentConfig(null);
                    }}
                    isSaving={isSaving}
                  />
                ) : (
                  /* Moment Generator Form */
                  <MomentGenerator
                    userName={currentUser.displayName}
                    onMomentGenerated={handleMomentGenerated}
                    isLoading={isGenerating}
                    setIsLoading={setIsGenerating}
                  />
                )}
              </>
            )}

            {activeTab === "memories" && (
              <MemoriesSection
                moments={moments}
                onDeleteMoment={handleDeleteMoment}
                onToggleFavorite={handleToggleFavorite}
                onUpdateMoment={handleUpdateMoment}
                onCreateNew={() => {
                  setActiveMoment(null);
                  setActiveTab("dashboard");
                }}
                isLoading={momentsLoading}
              />
            )}

            {activeTab === "progress" && (
              <ProgressSection
                stats={stats}
                onCreateMoment={() => {
                  setActiveMoment(null);
                  setActiveTab("dashboard");
                }}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EAE6DF] py-6 text-center text-xs text-[#7A766F] bg-[#FCFAF7]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-medium text-[#4A4742]">
            Sahajeevan — Small Moments. Strong Families. A Greener Future.
          </p>
          <p className="text-[11px] text-[#8C8880]">
            Harmonizing busy family life with the beauty of our natural world.
          </p>
        </div>
      </footer>
    </div>
  );
}
