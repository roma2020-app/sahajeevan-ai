import React, { useState } from "react";
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
  BookOpen,
  ArrowRight
} from "lucide-react";
import { MomentRecord } from "../types";

interface MemoriesSectionProps {
  moments: MomentRecord[];
  onDeleteMoment: (momentId: string) => Promise<void>;
  onCreateNew: () => void;
  isLoading: boolean;
}

export const MemoriesSection: React.FC<MemoriesSectionProps> = ({
  moments,
  onDeleteMoment,
  onCreateNew,
  isLoading
}) => {
  const [filter, setFilter] = useState<"all" | "outdoor" | "indoor">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedMomentId, setExpandedMomentId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredMoments = moments.filter((m) => {
    if (filter === "outdoor" && m.locationType !== "outdoor") return false;
    if (filter === "indoor" && m.locationType !== "indoor") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = m.activity.title.toLowerCase().includes(q);
      const lessonMatch = m.activity.natureLesson.toLowerCase().includes(q);
      const reflectionMatch = m.reflection?.toLowerCase().includes(q);
      const interestMatch = m.interest?.toLowerCase().includes(q);
      return titleMatch || lessonMatch || reflectionMatch || interestMatch;
    }
    return true;
  });

  const handleDelete = async (e: React.MouseEvent, id?: string) => {
    e.stopPropagation();
    if (!id) return;
    if (confirm("Are you sure you want to remove this memory?")) {
      setDeletingId(id);
      try {
        await onDeleteMoment(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const formatDate = (isoString: string) => {
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
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
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

        <button
          onClick={onCreateNew}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2E5A44] text-white text-sm font-semibold hover:bg-[#244736] transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-[#CBE3D3]" />
          <span>New Moment</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8C8880] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="memories-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories, lessons, or notes..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#D8D2C7] bg-white text-sm text-[#2D2825] focus:outline-none focus:ring-2 focus:ring-[#2E5A44]/20 focus:border-[#2E5A44]"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#F3EFEA] p-1 rounded-xl shrink-0 border border-[#EAE6DF]">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filter === "all"
                ? "bg-white text-[#1E3A2B] shadow-xs"
                : "text-[#5A564F] hover:text-[#1E3A2B]"
            }`}
          >
            All ({moments.length})
          </button>
          <button
            onClick={() => setFilter("outdoor")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
              filter === "outdoor"
                ? "bg-white text-[#1E3A2B] shadow-xs"
                : "text-[#5A564F] hover:text-[#1E3A2B]"
            }`}
          >
            <Trees className="w-3 h-3 text-[#2E5A44]" />
            <span>Outdoor</span>
          </button>
          <button
            onClick={() => setFilter("indoor")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
              filter === "indoor"
                ? "bg-white text-[#1E3A2B] shadow-xs"
                : "text-[#5A564F] hover:text-[#1E3A2B]"
            }`}
          >
            <Home className="w-3 h-3 text-[#2E5A44]" />
            <span>Indoor</span>
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#EAE6DF] shadow-xs">
          <div className="w-8 h-8 border-3 border-[#2E5A44] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#5A564F]">Loading your family memories...</p>
        </div>
      ) : filteredMoments.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-[#EAE6DF] shadow-xs">
          <div className="w-14 h-14 bg-[#EBF2ED] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#2E5A44] border border-[#D4E3D8]">
            <Heart className="w-7 h-7 stroke-[1.5]" />
          </div>
          <h3 className="font-display text-lg font-bold text-[#1E3A2B] mb-1">
            {searchQuery ? "No matching memories found" : "No completed moments yet"}
          </h3>
          <p className="text-sm text-[#5A564F] max-w-md mx-auto mb-6">
            {searchQuery
              ? "Try clearing your search term to see all memories."
              : "Whenever you complete a 10–15 minute Sahajeevan moment with your child, it will be saved here in your family memories."}
          </p>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 py-3 px-5 rounded-xl bg-[#2E5A44] text-white font-medium text-sm hover:bg-[#244736] transition-colors cursor-pointer shadow-xs"
          >
            <span>Create Your First Moment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Moments Timeline List */
        <div className="space-y-4">
          {filteredMoments.map((moment) => {
            const isExpanded = expandedMomentId === moment.id;
            return (
              <div
                key={moment.id}
                className="bg-white rounded-2xl border border-[#EAE6DF] p-5 sm:p-6 shadow-xs hover:border-[#D8D2C7] transition-all"
              >
                {/* Header & Meta */}
                <div 
                  className="flex items-start justify-between gap-3 cursor-pointer"
                  onClick={() => setExpandedMomentId(isExpanded ? null : moment.id || null)}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#7A766F]">
                      <span className="inline-flex items-center gap-1 font-medium bg-[#FAF8F4] border border-[#EAE6DF] px-2 py-0.5 rounded text-[#2D2825]">
                        <Calendar className="w-3 h-3 text-[#2E5A44]" />
                        {formatDate(moment.completedAt)}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-[#FAF8F4] border border-[#EAE6DF] px-2 py-0.5 rounded">
                        <Clock className="w-3 h-3 text-[#2E5A44]" />
                        {moment.duration}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-[#FAF8F4] border border-[#EAE6DF] px-2 py-0.5 rounded">
                        {moment.locationType === "outdoor" ? (
                          <>
                            <Trees className="w-3 h-3 text-[#2E5A44]" />
                            <span>Outdoor</span>
                          </>
                        ) : (
                          <>
                            <Home className="w-3 h-3 text-[#2E5A44]" />
                            <span>Indoor</span>
                          </>
                        )}
                      </span>
                      <span className="bg-[#FAF8F4] border border-[#EAE6DF] px-2 py-0.5 rounded">
                        Age: {moment.childAge}
                      </span>
                    </div>

                    <h3 className="font-display text-lg sm:text-xl font-bold text-[#1E3A2B] pt-0.5">
                      {moment.activity.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => handleDelete(e, moment.id)}
                      disabled={deletingId === moment.id}
                      title="Delete memory"
                      className="p-2 text-[#8C8880] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-[#7A766F] hover:bg-[#FAF8F4] rounded-lg transition-colors cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Reflection quote (if parent provided one) */}
                {moment.reflection && (
                  <div className="mt-3.5 p-3 rounded-xl bg-[#FDFBF7] border border-[#EAE2D5] flex items-start gap-2.5">
                    <MessageSquare className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-[#4E3F1A] font-serif-quote italic">
                      "{moment.reflection}"
                    </p>
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
  );
};
