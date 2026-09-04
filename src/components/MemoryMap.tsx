import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap
} from "@vis.gl/react-google-maps";
import {
  Heart,
  Calendar,
  MapPin,
  Image as ImageIcon,
  Sparkles,
  Info,
  Navigation,
  Compass,
  ExternalLink,
  Layers,
  Trees
} from "lucide-react";
import { MomentRecord } from "../types";

interface MemoryMapProps {
  moments: MomentRecord[];
  selectedMemoryId: string | null;
  onSelectMemory: (moment: MomentRecord) => void;
  onToggleFavorite?: (momentId: string, current: boolean) => Promise<void>;
  onAddLocationToMoment?: (moment: MomentRecord) => void;
}

// Controller to smoothly pan and zoom map when a memory card is clicked
function MapPanController({ targetLocation }: { targetLocation: { lat: number; lng: number } | null }) {
  const map = useMap();

  useEffect(() => {
    if (map && targetLocation) {
      map.panTo(targetLocation);
      map.setZoom(15);
    }
  }, [map, targetLocation]);

  return null;
}

// Fit bounds to show all markers when memories change
function MapBoundsFitter({ points }: { points: { lat: number; lng: number }[] }) {
  const map = useMap();
  const hasFittedRef = useRef(false);

  useEffect(() => {
    if (!map || points.length === 0) return;
    if (hasFittedRef.current) return;

    if (points.length === 1) {
      map.panTo(points[0]);
      map.setZoom(14);
    } else {
      const bounds = new google.maps.LatLngBounds();
      points.forEach(p => bounds.extend(p));
      map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
    }
    hasFittedRef.current = true;
  }, [map, points]);

  return null;
}

export const MemoryMap: React.FC<MemoryMapProps> = ({
  moments,
  selectedMemoryId,
  onSelectMemory,
  onToggleFavorite,
  onAddLocationToMoment
}) => {
  const [apiKey, setApiKey] = useState<string>(
    (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || ""
  );
  const [isKeyLoading, setIsKeyLoading] = useState<boolean>(!apiKey);
  const [selectedMoment, setSelectedMoment] = useState<MomentRecord | null>(null);
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);

  // Fetch API key from backend if not in Vite env
  useEffect(() => {
    if (apiKey) {
      setIsKeyLoading(false);
      return;
    }

    let isMounted = true;
    fetch("/api/config/maps-key")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          if (data.apiKey) {
            setApiKey(data.apiKey);
          }
          setIsKeyLoading(false);
        }
      })
      .catch((err) => {
        console.warn("Could not retrieve maps key from server:", err);
        if (isMounted) setIsKeyLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [apiKey]);

  // Synchronize externally selected memory
  useEffect(() => {
    if (selectedMemoryId) {
      const found = moments.find((m) => m.id === selectedMemoryId);
      if (found && found.latitude != null && found.longitude != null) {
        setSelectedMoment(found);
        setActiveMarkerId(found.id || null);
      }
    }
  }, [selectedMemoryId, moments]);

  // Memories with valid coordinates
  const mappedMemories = useMemo(() => {
    return moments.filter(
      (m) =>
        typeof m.latitude === "number" &&
        !isNaN(m.latitude) &&
        typeof m.longitude === "number" &&
        !isNaN(m.longitude)
    );
  }, [moments]);

  const defaultCenter = useMemo(() => {
    if (mappedMemories.length > 0) {
      return {
        lat: mappedMemories[0].latitude as number,
        lng: mappedMemories[0].longitude as number
      };
    }
    // Default to a green, nature-centered coordinate (San Francisco Presidio Park)
    return { lat: 37.7989, lng: -122.4662 };
  }, [mappedMemories]);

  const targetCoords = useMemo(() => {
    if (selectedMoment && selectedMoment.latitude != null && selectedMoment.longitude != null) {
      return { lat: selectedMoment.latitude, lng: selectedMoment.longitude };
    }
    return null;
  }, [selectedMoment]);

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

  const handleMarkerClick = (moment: MomentRecord) => {
    setSelectedMoment(moment);
    setActiveMarkerId(moment.id || null);
    onSelectMemory(moment);
  };

  // If no Google Maps API key is configured yet, display helpful setup card
  if (!isKeyLoading && !apiKey) {
    return (
      <div className="bg-white rounded-2xl border border-[#EAE6DF] p-6 sm:p-8 shadow-xs">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#EBF2ED] border border-[#D4E3D8] text-[#2E5A44] flex items-center justify-center shrink-0">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-[#1E3A2B]">
              Google Maps Configuration
            </h3>
            <p className="text-sm text-[#5A564F] mt-1">
              To display your family's nature memories on the interactive map, configure your Google Maps Platform API key.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#F8F6F2] border border-[#EAE2D5] space-y-3 mb-6 text-xs sm:text-sm text-[#4E3F1A]">
          <div className="flex items-center gap-2 font-bold text-[#2E5A44]">
            <Sparkles className="w-4 h-4 text-[#2E5A44]" />
            <span>Zero-Cost Prototyping Option: Maps Demo Key</span>
          </div>
          <p className="leading-relaxed">
            You can generate a free <strong>Google Maps Demo Key</strong> with zero billing setup or Google Cloud project required:
          </p>
          <ol className="list-decimal list-inside space-y-1 pl-1 text-[#5A564F]">
            <li>
              Open the{" "}
              <a
                href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
                target="_blank"
                rel="noreferrer"
                className="text-[#2E5A44] font-semibold underline hover:text-[#1E3A2B]"
              >
                Google Maps Demo Key Quickstart
              </a>
            </li>
            <li>Sign in with your Google Account and accept terms.</li>
            <li>Copy the minted demo key and store it in <strong>Google Cloud Secret Manager</strong> as <code className="bg-[#EAE6DF] px-1 py-0.5 rounded text-[#1E3A2B]">GOOGLE_MAPS_API_KEY</code>, or add it to your environment secrets.</li>
          </ol>
        </div>

        {/* Cloud Run Secret Manager Production Instructions */}
        <div className="p-4 rounded-xl bg-[#FAF8F4] border border-[#EAE6DF] space-y-2 mb-6 text-xs text-[#5A564F]">
          <div className="font-bold text-[#1E3A2B] flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#2E5A44]" />
            <span>Google Cloud Secret Manager Integration (Production)</span>
          </div>
          <p>
            Store your restricted Maps key in Secret Manager in project <code className="bg-[#EAE6DF] px-1 rounded text-[#1E3A2B]">peta-idea-jlcf1</code> and attach to Cloud Run service <code className="bg-[#EAE6DF] px-1 rounded text-[#1E3A2B]">sahajeevan</code>:
          </p>
          <pre className="bg-[#1E3A2B] text-[#DCE8E0] p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto">
            echo -n "YOUR_API_KEY" | gcloud secrets create GOOGLE_MAPS_API_KEY --data-file=- --project=peta-idea-jlcf1
          </pre>
        </div>

        {/* Mapped Memories Counter */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-[#FAF8F4] border border-[#EAE6DF]">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1E3A2B]">
            <MapPin className="w-4 h-4 text-[#2E5A44]" />
            <span>{mappedMemories.length} saved memories have geographical coordinates ready to display.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Map Card */}
      <div className="relative rounded-2xl overflow-hidden border border-[#EAE6DF] shadow-xs bg-[#FAF8F4]">
        {/* Map Header Overlay / Counter */}
        <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-xs border border-[#EAE6DF] px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-2 text-xs font-semibold text-[#1E3A2B]">
          <MapPin className="w-3.5 h-3.5 text-[#2E5A44]" />
          <span>{mappedMemories.length} Mapped {mappedMemories.length === 1 ? "Memory" : "Memories"}</span>
        </div>

        {/* Map Container - Height is explicitly set to avoid collapse (CF2) */}
        <div className="h-[480px] sm:h-[540px] w-full">
          <APIProvider apiKey={apiKey}>
            <Map
              defaultCenter={defaultCenter}
              defaultZoom={mappedMemories.length > 0 ? 12 : 11}
              mapId="DEMO_MAP_ID"
              gestureHandling="greedy"
              disableDefaultUI={false}
              fullscreenControl={true}
              zoomControl={true}
              streetViewControl={false}
              mapTypeControl={false}
              internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
              className="w-full h-full"
            >
              {/* Bounds & Pan Controller */}
              <MapBoundsFitter
                points={mappedMemories.map((m) => ({
                  lat: m.latitude as number,
                  lng: m.longitude as number
                }))}
              />
              <MapPanController targetLocation={targetCoords} />

              {/* Advanced Markers for each mapped memory */}
              {mappedMemories.map((moment) => {
                const isSelected = activeMarkerId === moment.id;
                return (
                  <AdvancedMarker
                    key={moment.id}
                    position={{
                      lat: moment.latitude as number,
                      lng: moment.longitude as number
                    }}
                    title={moment.activity.title}
                    onClick={() => handleMarkerClick(moment)}
                  >
                    <Pin
                      background={isSelected ? "#E11D48" : moment.isFavorite ? "#D97706" : "#2E5A44"}
                      borderColor={isSelected ? "#9F1239" : moment.isFavorite ? "#B45309" : "#1E3A2B"}
                      glyphColor="#FFFFFF"
                      scale={isSelected ? 1.3 : 1.1}
                    />
                  </AdvancedMarker>
                );
              })}

              {/* Marker InfoWindow when a memory is clicked */}
              {selectedMoment && selectedMoment.latitude != null && selectedMoment.longitude != null && (
                <InfoWindow
                  position={{
                    lat: selectedMoment.latitude,
                    lng: selectedMoment.longitude
                  }}
                  onCloseClick={() => {
                    setSelectedMoment(null);
                    setActiveMarkerId(null);
                  }}
                  maxWidth={320}
                  headerDisabled={false}
                >
                  <div className="p-1 max-w-[280px] text-[#2D2825] font-sans">
                    {/* Photo (Requirement 3: Photo) */}
                    {selectedMoment.photoUrl ? (
                      <div className="w-full h-36 rounded-lg overflow-hidden mb-2 bg-[#F3EFEA] border border-[#EAE6DF]">
                        <img
                          src={selectedMoment.photoUrl}
                          alt={selectedMoment.activity.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            // Fallback if URL fails
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-24 rounded-lg mb-2 bg-[#EBF2ED] border border-[#D4E3D8] flex flex-col items-center justify-center text-[#2E5A44] gap-1">
                        <Trees className="w-6 h-6 stroke-[1.5]" />
                        <span className="text-[10px] font-medium text-[#2E5A44]">Nature Micro-Moment</span>
                      </div>
                    )}

                    {/* Memory Title (Requirement 3: Memory title) */}
                    <h4 className="font-display font-bold text-sm text-[#1E3A2B] leading-snug mb-1">
                      {selectedMoment.activity.title}
                    </h4>

                    {/* Date & Location (Requirement 3: Date, Location) */}
                    <div className="space-y-1 mb-2 text-[11px] text-[#5A564F]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-[#2E5A44] shrink-0" />
                        <span>{formatDate(selectedMoment.completedAt)}</span>
                        <span className="text-[#8C8880]">•</span>
                        <span>{selectedMoment.duration}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium text-[#2E5A44]">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                          {selectedMoment.locationName || `${selectedMoment.latitude?.toFixed(4)}, ${selectedMoment.longitude?.toFixed(4)}`}
                        </span>
                      </div>
                    </div>

                    {/* Description (Requirement 3: Description) */}
                    <div className="p-2 rounded-md bg-[#FAF8F4] border border-[#EAE6DF] text-[11px] text-[#4A4742] leading-relaxed">
                      <p className="line-clamp-3">
                        {selectedMoment.description || selectedMoment.reflection || selectedMoment.activity.natureLesson}
                      </p>
                    </div>

                    {/* Actions: Favorite */}
                    {onToggleFavorite && selectedMoment.id && (
                      <div className="mt-2.5 pt-2 border-t border-[#EAE6DF] flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => onToggleFavorite(selectedMoment.id!, !!selectedMoment.isFavorite)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5A564F] hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              selectedMoment.isFavorite
                                ? "text-rose-600 fill-rose-600"
                                : "text-[#7A766F]"
                            }`}
                          />
                          <span>{selectedMoment.isFavorite ? "Favorited" : "Favorite"}</span>
                        </button>

                        <span className="text-[10px] text-[#7A766F] bg-[#FAF8F4] px-1.5 py-0.5 rounded">
                          Age: {selectedMoment.childAge}
                        </span>
                      </div>
                    )}
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>
        </div>
      </div>

      {/* When no memories have coordinates yet */}
      {mappedMemories.length === 0 && (
        <div className="p-4 rounded-xl bg-[#FAF8F4] border border-[#EAE6DF] text-xs text-[#5A564F] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#2E5A44] shrink-0" />
            <span>
              None of your saved memories currently have location coordinates. Click on any memory card below to add a location spot or coordinates!
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
