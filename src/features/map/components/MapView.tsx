import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { formatDistanceToNow } from "date-fns";

import { Separator } from "@/components/ui/separator";
import {
  Map as LeafletMapComponent,
  MapTileLayer,
  MapZoomControl,
  MapLayers,
  MapLayersControl,
  MapLayerGroup,
  MapSearchControl,
  MapBoundaryLayer,
  MapMarker,
  MapPopup,
} from "@/components/ui/map";
import type { MapReport } from "@/features/map/hooks/useMapData";

const SEVERITY_STYLE = {
  low: { bg: "bg-green-100", text: "text-green-700", label: "Low", marker: "#4CAF50" },
  moderate: { bg: "bg-amber-100", text: "text-amber-700", label: "Moderate", marker: "#FFC107" },
  high: { bg: "bg-red-100", text: "text-red-700", label: "High", marker: "#E53935" },
} as const;

const DAVAO_CENTER: [number, number] = [7.0633, 125.608];

type MapViewProps = { reports: MapReport[]; selectedSeverity: string | null };

function SeveritySvgIcon({ color }: { color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, background: color, border: "2px solid white", borderRadius: "50%", boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
        <path d="M12 2L2 22h20L12 2z" /><line x1="12" y1="10" x2="12" y2="16" /><line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    </div>
  );
}

function SearchWithFly() {
  const map = useMap();
  return (
    <MapSearchControl position="top-4 left-1/2 z-[1001] w-[300px] -translate-x-1/2" limit={5} debounceMs={300} lang="en"
      onPlaceSelect={(place) => { const c = place.geometry.coordinates; map.flyTo([c[1], c[0]] as LatLngExpression, 16, { duration: 1 }); }} />
  );
}

function timeAgo(dateStr: string) { try { return formatDistanceToNow(new Date(dateStr), { addSuffix: true }); } catch { return ""; } }

export function MapView({ reports, selectedSeverity }: MapViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Severity score per barangay for choropleth coloring
  const barangayScore = useMemo(() => {
    const scores = new Map<string, number>();
    for (const r of reports) {
      const score = r.humanSeverity === "high" ? 3 : r.humanSeverity === "moderate" ? 2 : 1;
      scores.set(r.barangayName, Math.max(scores.get(r.barangayName) ?? 0, score));
    }
    return scores;
  }, [reports]);

  const { data: boundaryFeatures } = useQuery({
    queryKey: ["map", "boundaries"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_barangay_boundaries" as never);
      if (error) throw error;
      return (data as { features?: Record<string, unknown>[] })?.features ?? null;
    },
    staleTime: 300_000,
  });

  const filtered = selectedSeverity ? reports.filter((r) => r.humanSeverity === selectedSeverity) : reports;

  return (
    <div className="absolute inset-0">
      <LeafletMapComponent center={DAVAO_CENTER} zoom={12} maxZoom={18}>
        <MapLayers defaultTileLayer="Street" defaultLayerGroups={["Barangay Boundaries"]}>
          <MapTileLayer name="Street" />
          <MapTileLayer name="Satellite" url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="&copy; Esri" />
          <MapTileLayer name="Dark" url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png" attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>' />

          <MapLayerGroup name="Barangay Boundaries">
            <MapBoundaryLayer
              features={boundaryFeatures}
              colorMap={(name) => {
                const score = barangayScore.get(name) ?? 0;
                return score === 3 ? "rgba(229,57,53,0.25)" : score === 2 ? "rgba(255,193,7,0.2)" : score === 1 ? "rgba(76,175,80,0.15)" : null;
              }}
            />
          </MapLayerGroup>

          <MapZoomControl position="bottom-14 right-4" />
          <MapLayersControl position="bottom-4 right-4" />
          <SearchWithFly />
        </MapLayers>

        {filtered.map((r) => (
          <MapMarker key={r.id} position={r.position} iconAnchor={[16, 16]} popupAnchor={[0, -16]} icon={<SeveritySvgIcon color={SEVERITY_STYLE[r.humanSeverity].marker} />}>
            <MapPopup>
              <div className="min-w-56 space-y-2 font-sans text-xs">
                <div className="flex items-start justify-between gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${SEVERITY_STYLE[r.humanSeverity].bg} ${SEVERITY_STYLE[r.humanSeverity].text}`}>{SEVERITY_STYLE[r.humanSeverity].label}</span>
                  <span className="font-data text-[10px] text-muted-foreground">{r.postId}</span>
                </div>
                <Separator />
                <p className="text-xs">
                  <span className="font-semibold">{r.barangayName.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ")}</span>
                  {r.districtName && <><span className="mx-1 text-muted-foreground/50">·</span><span className="text-[11px] text-muted-foreground">{r.districtName.charAt(0).toUpperCase() + r.districtName.slice(1).toLowerCase()} District</span></>}
                </p>
                {r.streetAddress && (
                  <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                    {r.streetAddress}
                  </p>
                )}
                <Separator />
                <div>
                  <div style={{ display: expandedId === r.id ? "block" : "-webkit-box", WebkitLineClamp: expandedId === r.id ? "unset" : "3", WebkitBoxOrient: "vertical", overflow: "hidden" }} className="text-xs leading-relaxed text-muted-foreground">{r.postContent}</div>
                  {r.postContent.length > 120 && <button onClick={(e) => { e.stopPropagation(); setExpandedId(expandedId === r.id ? null : r.id); }} className="mt-0.5 text-[11px] font-medium text-accent hover:underline">{expandedId === r.id ? "Show less" : "See more"}</button>}
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-border/40 pt-1.5 text-[11px] text-muted-foreground">
                  <span className="truncate font-medium">{r.authorName}</span>
                  <span className="shrink-0">{timeAgo(r.validatedAt)}</span>
                </div>
              </div>
            </MapPopup>
          </MapMarker>
        ))}
      </LeafletMapComponent>
    </div>
  );
}
