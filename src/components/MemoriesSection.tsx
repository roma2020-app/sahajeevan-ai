import React, { useState, useMemo } from "react";
import { 
  Heart, 
  Calendar, 
  Clock, 
  Trees, 
  Home, 
  Search, 
  Trash2, 
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  MessageSquare,
  MapPin,
  Map as MapIcon,
  List as ListIcon,
  Compass,
  Camera,
  Edit3,
  X,
  Plus
} from "lucide-react";
import { MomentRecord, MemoryFilter } from "../types";
import { MemoryMap } from "./MemoryMap";

interface MemoriesSectionProps {
  moments: MomentRecord[];
  onDeleteMoment: (momentId: string) => Promise<void>;
  onToggleFavorite?: (momentId: string, current: boolean) => Promise<void>;
  onUpdateMoment?: (momentId: string, updates: Partial<MomentRecord>) => Promise<void>;
  onCreateNew: () => void;
  isLoading: boolean;
}

export const MemoriesSection: React.FC<MemoriesSectionProps> = ({
  moments,
  onDeleteMoment,
  onToggleFavorite,
  onUpdateMoment,
  onCreateNew,
  isLoading
}) => {
  // Map / List view toggle (Requirement 6)
  const [viewMode, setViewMode] = useState<"list" | "map">("map");

  // Filters (Requirement 5: All memories, 1 year ago, 2 years ago, 3+ years ago, Favorites)
  const [activeFilter, setActiveFilter] = useState<MemoryFilter>("all");
  const [locationTypeFilter, setLocationTypeFilter] = useState<"all" | "outdoor" | "indoor">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [expandedMomentId, setExpandedMomentId] = useState<string | null>(null);
  const [selectedMemoryId, setSelectedMemoryId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit / Tag Location & Photo Modal state
  const [editingMoment, setEditingMoment] = useState<MomentRecord | null>(null);
  const [editLocationName, setEditLocationName] = useState("");
  const [editLat, setEditLat] = useState<string>("");
  const [editLng, setEditLng] = useState<string>("");
  const [editPhotoUrl, setEditPhotoUrl] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);

  // Filter matching logic adhering to Requirement 5
  const isMatchingFilter = (moment: MomentRecord, filter: MemoryFilter) => {
    if (filter === "all") return true;
    if (filter === "favorites") return !!moment.isFavorite;

    const now = new Date();
    const currentYear = now.getFullYear();
    const momentDate = new Date(moment.completedAt || moment.createdAt);
    const momentYear = momentDate.getFullYear();
    const diffYears = currentYear - momentYear;

    const diffTime = Math.abs(now.getTime() - momentDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (filter === "1_year_ago") {
      return diffYears === 1 || (diffDays >= 300 && diffDays <= 730);
    }
    if (filter === "2_years_ago") {
      return diffYears === 2 || (diffDays > 730 && diffDays <= 1095);
    }
    if (filter === "3_plus_years_ago") {
      return diffYears >= 3 || diffDays > 1095;
    }
    return true;
  };

  const filteredMoments = useMemo(() => {
    return moments.filter((m) => {
      // 1. Time / Favorites filter
      if (!isMatchingFilter(m, activeFilter)) return false;

      // 2. Indoor / Outdoor filter
      if (locationTypeFilter === "outdoor" && m.locationType !== "outdoor") return false;
      if (locationTypeFilter === "indoor" && m.locationType !== "indoor") return false;

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = m.activity.title.toLowerCase().includes(q);
        const lessonMatch = m.activity.natureLesson.toLowerCase().includes(q);
        const reflectionMatch = m.reflection?.toLowerCase().includes(q);
        const locationMatch = m.locationName?.toLowerCase().includes(q);
        const interestMatch = m.interest?.toLowerCase().includes(q);
        return titleMatch || lessonMatch || reflectionMatch || locationMatch || interestMatch;
      }
      return true;
    });
  }, [moments, activeFilter, locationTypeFilter, searchQuery]);

  // Counts for filters
  const filterCounts = useMemo(() => {
    return {
      all: moments.length,
      "1_year_ago": moments.filter((m) => isMatchingFilter(m, "1_year_ago")).length,
      "2_years_ago": moments.filter((m) => isMatchingFilter(m, "2_years_ago")).length,
      "3_plus_years_ago": moments.filter((m) => isMatchingFilter(m, "3_plus_years_ago")).length,
      favorites: moments.filter((m) => !!m.isFavorite).length
    };
  }, [moments]);

  const handleDelete = async (e: React.MouseEvent, id?: string) => {
    e.stopPropagation();
    if (!id) return;
    if (confirm("Are you sure you want to remove this memory?")) {
      setDeletingId(id);
      try {
        await onDeleteMoment(id);
        if (selectedMemoryId === id) setSelectedMemoryId(null);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleCardClick = (moment: MomentRecord) => {
    // Requirement 4: Clicking a memory card should center the map on its location
    setSelectedMemoryId(moment.id || null);
    if (viewMode === "list" && moment.latitude != null && moment.longitude != null) {
      setViewMode("map");
    }
  };

  const handleOpenEditModal = (e: React.MouseEvent, moment: MomentRecord) => {
    e.stopPropagation();
    setEditingMoment(moment);
    setEditLocationName(moment.locationName || "");
    setEditLat(moment.latitude != null ? moment.latitude.toString() : "");
    setEditLng(moment.longitude != null ? moment.longitude.toString() : "");
    setEditPhotoUrl(moment.photoUrl || "");
    setEditDescription(moment.description || moment.reflection || "");
  };

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setEditLat(pos.coords.latitude.toFixed(5));
        setEditLng(pos.coords.longitude.toFixed(5));
        setDetectingGps(false);
      },
      (err) => {
        console.warn("Location error:", err);
        // Scenic default coordinates (San Francisco Golden Gate Park)
        setEditLat("37.7694");
        setEditLng("-122.4862");
        setDetectingGps(false);
      },
      { timeout: 6000 }
    );
  };

  const handleSaveEdit = async () => {
    if (!editingMoment?.id || !onUpdateMoment) return;
    setIsSavingEdit(true);
    try {
      const latNum = parseFloat(editLat);
      const lngNum = parseFloat(editLng);
      await onUpdateMoment(editingMoment.id, {
        locationName: editLocationName.trim(),
        latitude: !isNaN(latNum) ? latNum : undefined,
        longitude: !isNaN(lngNum) ? lngNum : undefined,
        photoUrl: editPhotoUrl.trim() || undefined,
        description: editDescription.trim() || undefined
      });
      setEditingMoment(null);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Quick helper to tag a sample nature spot to memories that don't have coordinates
  const handleQuickTagSample = async (moment: MomentRecord, spotName: string, lat: number, lng: number) => {
    if (!moment.id || !onUpdateMoment) return;
    await onUpdateMoment(moment.id, {
      locationName: spotName,
      latitude: lat,
      longitude: lng,
      photoUrl: moment.photoUrl || "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&auto=format&fit=crop&q=80"
    });
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "Recently";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1E3A2B] flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-600 fill-rose-600" />
            <span>Family Memories</span>
          </h2>
          <p className="text-sm text-[#5A564F] mt-0.5">
            Your sacred timeline of shared moments and nature adventures.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Map / List Toggle (Requirement 6) */}
          <div className="flex items-center p-1 rounded-xl bg-[#F0ECE6] border border-[#E0DBD1] text-xs font-semibold">
            <button
              id="view-toggle-list"
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-white text-[#1E3A2B] shadow-xs"
                  : "text-[#6B665E] hover:text-[#1E3A2B]"
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              id="view-toggle-map"
              type="button"
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "map"
                  ? "bg-white text-[#1E3A2B] shadow-xs"
                  : "text-[#6B665E] hover:text-[#1E3A2B]"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5 text-[#2E5A44]" />
              <span>Memory Map</span>
            </button>
          </div>

          <button
            onClick={onCreateNew}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#2E5A44] text-white text-xs sm:text-sm font-semibold hover:bg-[#244736] transition-colors cursor-pointer shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-[#CBE3D3]" />
            <span>New Moment</span>
          </button>
        </div>
      </div>

      {/* Filter Bars (Requirement 5: All memories, 1 year ago, 2 years ago, 3+ years ago, Favorites) */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              activeFilter === "all"
                ? "bg-[#1E3A2B] text-white border-[#1E3A2B] shadow-xs"
                : "bg-white text-[#5A564F] border-[#EAE6DF] hover:border-[#D8D2C7] hover:bg-[#FAF8F4]"
            }`}
          >
            All memories ({filterCounts.all})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("1_year_ago")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              activeFilter === "1_year_ago"
                ? "bg-[#1E3A2B] text-white border-[#1E3A2B] shadow-xs"
                : "bg-white text-[#5A564F] border-[#EAE6DF] hover:border-[#D8D2C7] hover:bg-[#FAF8F4]"
            }`}
          >
            1 year ago ({filterCounts["1_year_ago"]})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("2_years_ago")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              activeFilter === "2_years_ago"
                ? "bg-[#1E3A2B] text-white border-[#1E3A2B] shadow-xs"
                : "bg-white text-[#5A564F] border-[#EAE6DF] hover:border-[#D8D2C7] hover:bg-[#FAF8F4]"
            }`}
          >
            2 years ago ({filterCounts["2_years_ago"]})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("3_plus_years_ago")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              activeFilter === "3_plus_years_ago"
                ? "bg-[#1E3A2B] text-white border-[#1E3A2B] shadow-xs"
                : "bg-white text-[#5A564F] border-[#EAE6DF] hover:border-[#D8D2C7] hover:bg-[#FAF8F4]"
            }`}
          >
            3+ years ago ({filterCounts["3_plus_years_ago"]})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("favorites")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              activeFilter === "favorites"
                ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                : "bg-white text-[#5A564F] border-[#EAE6DF] hover:border-[#D8D2C7] hover:bg-[#FAF8F4]"
            }`}
          >
            <Heart className={`w-3 h-3 ${activeFilter === "favorites" ? "fill-white text-white" : "fill-rose-500 text-rose-500"}`} />
            <span>Favorites ({filterCounts.favorites})</span>
          </button>
        </div>

        {/* Search & Environment sub-filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8C8880] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="memories-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories, locations, lessons, or notes..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#D8D2C7] bg-white text-xs sm:text-sm text-[#2D2825] focus:outline-none focus:ring-2 focus:ring-[#2E5A44]/20 focus:border-[#2E5A44]"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#F3EFEA] p-1 rounded-xl shrink-0 border border-[#EAE6DF] self-start sm:self-auto">
            <button
              onClick={() => setLocationTypeFilter("all")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                locationTypeFilter === "all" ? "bg-white text-[#1E3A2B] shadow-xs" : "text-[#5A564F]"
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setLocationTypeFilter("outdoor")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                locationTypeFilter === "outdoor" ? "bg-white text-[#1E3A2B] shadow-xs" : "text-[#5A564F]"
              }`}
            >
              <Trees className="w-3 h-3 text-[#2E5A44]" />
              <span>Outdoor</span>
            </button>
            <button
              onClick={() => setLocationTypeFilter("indoor")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                locationTypeFilter === "indoor" ? "bg-white text-[#1E3A2B] shadow-xs" : "text-[#5A564F]"
              }`}
            >
              <Home className="w-3 h-3 text-[#2E5A44]" />
              <span>Indoor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#EAE6DF] shadow-xs">
          <div className="w-8 h-8 border-3 border-[#2E5A44] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#5A564F]">Loading your family memories...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Interactive Google Map (Requirements 1, 2, 3, 4) */}
          {viewMode === "map" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <MemoryMap
                moments={filteredMoments}
                selectedMemoryId={selectedMemoryId}
                onSelectMemory={(m) => {
                  setSelectedMemoryId(m.id || null);
                  setExpandedMomentId(m.id || null);
                }}
                onToggleFavorite={onToggleFavorite}
              />
              <p className="text-[11px] text-[#7A766F] italic text-center sm:text-left flex items-center justify-center sm:justify-start gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#2E5A44]" />
                <span>Tip: Click any memory card below to center the map on its location.</span>
              </p>
            </div>
          )}

          {/* Moments List */}
          {filteredMoments.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-[#EAE6DF] shadow-xs">
              <div className="w-14 h-14 bg-[#EBF2ED] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#2E5A44] border border-[#D4E3D8]">
                <Heart className="w-7 h-7 stroke-[1.5]" />
              </div>
              <h3 className="font-display text-lg font-bold text-[#1E3A2B] mb-1">
                {searchQuery || activeFilter !== "all"
                  ? "No memories match your active filter"
                  : "No completed moments yet"}
              </h3>
              <p className="text-sm text-[#5A564F] max-w-md mx-auto mb-6">
                {searchQuery || activeFilter !== "all"
                  ? "Try adjusting your filter or search query to see other family memories."
                  : "Whenever you complete a 10–15 minute Sahajeevan moment with your child, it will be saved here."}
              </p>
              {searchQuery || activeFilter !== "all" ? (
                <button
                  onClick={() => {
                    setActiveFilter("all");
                    setLocationTypeFilter("all");
                    setSearchQuery("");
                  }}
                  className="inline-flex items-center gap-2 py-2 px-4 rounded-xl border border-[#D8D2C7] bg-white text-xs font-semibold text-[#1E3A2B] hover:bg-[#FAF8F4] transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              ) : (
                <button
                  onClick={onCreateNew}
                  className="inline-flex items-center gap-2 py-3 px-5 rounded-xl bg-[#2E5A44] text-white font-medium text-sm hover:bg-[#244736] transition-colors cursor-pointer shadow-xs"
                >
                  <span>Create Your First Moment</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMoments.map((moment) => {
                const isExpanded = expandedMomentId === moment.id;
                const isSelectedOnMap = selectedMemoryId === moment.id;
                const hasCoordinates = moment.latitude != null && moment.longitude != null;

                return (
                  <div
                    key={moment.id}
                    onClick={() => handleCardClick(moment)}
                    className={`bg-white rounded-2xl border transition-all cursor-pointer p-5 sm:p-6 shadow-xs ${
                      isSelectedOnMap
                        ? "border-[#2E5A44] ring-2 ring-[#2E5A44]/20 bg-[#FAFBF9]"
                        : "border-[#EAE6DF] hover:border-[#D8D2C7]"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      {/* Left: Thumbnail & Details */}
                      <div className="flex items-start gap-4 flex-1">
                        {/* Photo thumbnail if available */}
                        {moment.photoUrl ? (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-[#F3EFEA] border border-[#EAE6DF]">
                            <img
                              src={moment.photoUrl}
                              alt={moment.activity.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl shrink-0 bg-[#EBF2ED] border border-[#D4E3D8] flex items-center justify-center text-[#2E5A44]">
                            <Trees className="w-7 h-7 stroke-[1.5]" />
                          </div>
                        )}

                        <div className="space-y-1.5 flex-1 min-w-0">
                          {/* Tags: Date, duration, environment, location */}
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#7A766F]">
                            <span className="inline-flex items-center gap-1 font-medium bg-[#FAF8F4] border border-[#EAE6DF] px-2 py-0.5 rounded text-[#2D2825]">
                              <Calendar className="w-3 h-3 text-[#2E5A44]" />
                              {formatDate(moment.completedAt)}
                            </span>
                            <span className="inline-flex items-center gap-1 bg-[#FAF8F4] border border-[#EAE6DF] px-2 py-0.5 rounded">
                              <Clock className="w-3 h-3 text-[#2E5A44]" />
                              {moment.duration}
                            </span>
                            <span className="bg-[#FAF8F4] border border-[#EAE6DF] px-2 py-0.5 rounded">
                              Age: {moment.childAge}
                            </span>

                            {/* Location badge */}
                            {hasCoordinates ? (
                              <span className="inline-flex items-center gap-1 font-semibold text-[#2E5A44] bg-[#EBF2ED] border border-[#D4E3D8] px-2 py-0.5 rounded">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate max-w-[140px]">
                                  {moment.locationName || `${moment.latitude?.toFixed(2)}, ${moment.longitude?.toFixed(2)}`}
                                </span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => handleOpenEditModal(e, moment)}
                                className="inline-flex items-center gap-1 text-[11px] text-[#7A766F] hover:text-[#2E5A44] bg-[#FAF8F4] border border-dashed border-[#D8D2C7] px-2 py-0.5 rounded cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add Location</span>
                              </button>
                            )}
                          </div>

                          <h3 className="font-display text-lg sm:text-xl font-bold text-[#1E3A2B] pt-0.5">
                            {moment.activity.title}
                          </h3>

                          {/* Quick Reflection or Description snippet */}
                          {(moment.description || moment.reflection) && (
                            <p className="text-xs sm:text-sm text-[#5A564F] line-clamp-2">
                              "{moment.description || moment.reflection}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1 sm:gap-1.5 self-end sm:self-start shrink-0">
                        {/* Favorite Button */}
                        {onToggleFavorite && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (moment.id) onToggleFavorite(moment.id, !!moment.isFavorite);
                            }}
                            title={moment.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                            className="p-2 rounded-lg text-[#7A766F] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                moment.isFavorite ? "text-rose-600 fill-rose-600" : ""
                              }`}
                            />
                          </button>
                        )}

                        {/* Edit Location & Photo Button */}
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditModal(e, moment)}
                          title="Edit Location & Photo"
                          className="p-2 text-[#7A766F] hover:text-[#1E3A2B] hover:bg-[#FAF8F4] rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, moment.id)}
                          disabled={deletingId === moment.id}
                          title="Delete memory"
                          className="p-2 text-[#8C8880] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {/* Expand/Collapse Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedMomentId(isExpanded ? null : moment.id || null);
                          }}
                          className="p-2 text-[#7A766F] hover:bg-[#FAF8F4] rounded-lg transition-colors cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Quick helper to tag a sample nature spot if no coordinates */}
                    {!hasCoordinates && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="mt-3 pt-3 border-t border-[#F0ECE6] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#7A766F]"
                      >
                        <span>Tag on Map:</span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleQuickTagSample(moment, "Central Botanical Garden", 37.7694, -122.4862)}
                            className="px-2 py-0.5 bg-[#F0F5F2] text-[#2E5A44] rounded hover:bg-[#DCE8E0] transition-colors cursor-pointer font-medium"
                          >
                            + Botanical Garden
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickTagSample(moment, "Neighborhood Oak Park", 37.7989, -122.4662)}
                            className="px-2 py-0.5 bg-[#F0F5F2] text-[#2E5A44] rounded hover:bg-[#DCE8E0] transition-colors cursor-pointer font-medium"
                          >
                            + Oak Park
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickTagSample(moment, "Riverside Grove Trail", 37.7500, -122.4400)}
                            className="px-2 py-0.5 bg-[#F0F5F2] text-[#2E5A44] rounded hover:bg-[#DCE8E0] transition-colors cursor-pointer font-medium"
                          >
                            + Riverside Trail
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-[#EAE6DF] space-y-3.5 animate-in fade-in duration-150">
                        {/* Steps taken */}
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A766F] mb-2">
                            Activity Steps
                          </h4>
                          <ul className="space-y-1.5 text-xs sm:text-sm text-[#4A4742]">
                            {moment.activity.steps.map((step, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="w-4 h-4 rounded-full bg-[#EBF2ED] text-[#2E5A44] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                  {idx + 1}
                                </span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Nature Lesson */}
                        <div className="p-3.5 rounded-xl bg-[#F0F5F2] border border-[#D4E3D8]">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E3A2B] mb-1">
                            <span>🌍</span>
                            <span>Nature Lesson Learned</span>
                          </div>
                          <p className="text-xs sm:text-sm text-[#2E4A35]">
                            {moment.activity.natureLesson}
                          </p>
                        </div>

                        {moment.activity.parentPrompt && (
                          <p className="text-xs text-[#7A766F] italic">
                            <strong>Discussion spark:</strong> "{moment.activity.parentPrompt}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Edit Location & Photo Modal */}
      {editingMoment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-md w-full border border-[#EAE6DF] shadow-xl animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-[#1E3A2B] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#2E5A44]" />
                <span>Memory Location & Photo</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingMoment(null)}
                className="p-1.5 text-[#7A766F] hover:bg-[#FAF8F4] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#5A564F]">
              Tag where you and your child enjoyed <strong>"{editingMoment.activity.title}"</strong> so it shows up on your interactive Memory Map.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#7A766F] mb-1">
                  Location Spot Name
                </label>
                <input
                  type="text"
                  value={editLocationName}
                  onChange={(e) => setEditLocationName(e.target.value)}
                  placeholder="e.g. Presidio Pine Grove, City Botanical Garden"
                  className="w-full p-2.5 rounded-xl border border-[#D8D2C7] bg-[#FAF8F4] focus:outline-none focus:border-[#2E5A44]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold uppercase tracking-wider text-[#7A766F]">
                    Coordinates (Lat / Lng)
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectGps}
                    disabled={detectingGps}
                    className="text-[#2E5A44] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Compass className="w-3 h-3" />
                    <span>{detectingGps ? "Detecting GPS..." : "Detect Current GPS"}</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={editLat}
                    onChange={(e) => setEditLat(e.target.value)}
                    placeholder="Latitude (e.g. 37.7749)"
                    className="w-full p-2 rounded-lg border border-[#D8D2C7] bg-[#FAF8F4] focus:outline-none focus:border-[#2E5A44]"
                  />
                  <input
                    type="text"
                    value={editLng}
                    onChange={(e) => setEditLng(e.target.value)}
                    placeholder="Longitude (e.g. -122.4194)"
                    className="w-full p-2 rounded-lg border border-[#D8D2C7] bg-[#FAF8F4] focus:outline-none focus:border-[#2E5A44]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#7A766F] mb-1">
                  Photo URL
                </label>
                <div className="relative">
                  <Camera className="w-4 h-4 text-[#8C8880] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={editPhotoUrl}
                    onChange={(e) => setEditPhotoUrl(e.target.value)}
                    placeholder="https://... (direct image link)"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D8D2C7] bg-[#FAF8F4] focus:outline-none focus:border-[#2E5A44]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#7A766F] mb-1">
                  Description / Memory Story
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="What made this moment special?"
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-[#D8D2C7] bg-[#FAF8F4] focus:outline-none focus:border-[#2E5A44]"
                />
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setEditingMoment(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-[#D8D2C7] text-xs font-semibold text-[#5A564F] hover:bg-[#FAF8F4] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSavingEdit}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#2E5A44] hover:bg-[#244736] text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60"
              >
                {isSavingEdit ? "Saving..." : "Save to Memory Map"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
