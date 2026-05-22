import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { parseWKBPoint } from "@/lib/wkb";
import {
  MapZoomControl,
  MapLayers,
  MapLayersControl,
  MapTileLayer,
  MapSearchControl,
  MapControlContainer,
  MapLayerGroup,
  MapBoundaryLayer,
} from "@/components/ui/map";
import { useAuthStore } from "@/stores/auth-store";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DAVAO_CENTER: [number, number] = [7.0633, 125.608];

const pulseIcon = L.divIcon({
  className: "!bg-transparent border-none",
  html: `<div style="position:relative;width:24px;height:24px"><div style="position:absolute;inset:-4px;border-radius:50%;background:oklch(0.65 0.14 185);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;opacity:0.75"></div><div style="position:relative;width:24px;height:24px;border-radius:50%;background:oklch(0.65 0.14 185);border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

type FormMapProps = {
  markerPos: [number, number];
  onMarkerMove: (pos: [number, number]) => void;
  onSearchSelect: (pos: [number, number], label: string) => void;
};

function pointInPolygon(point: [number, number], vs: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];
    if ((yi > point[1]) !== (yj > point[1]) && point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function extractRings(geom: { type: string; coordinates: number[][][][] }): [number, number][] {
  const out: [number, number][] = [];
  const polys = geom.type === "MultiPolygon" ? geom.coordinates : [geom.coordinates];
  for (const poly of polys) for (const ring of poly) out.push(...(ring.map((p) => [p[1], p[0]]) as [number, number][]));
  return out;
}

function DraggableMarker({ position, onMove }: { position: [number, number]; onMove: (p: [number, number]) => void }) {
  useMapEvents({ click(e) { onMove([e.latlng.lat, e.latlng.lng]); } });
  return <Marker position={position} draggable icon={pulseIcon} eventHandlers={{ dragend: (e) => { const p = e.target.getLatLng(); onMove([p.lat, p.lng]); } }} />;
}

function LocateButton({ onLocated }: { onLocated: (pos: [number, number]) => void }) {
  const map = useMap();
  return (
    <MapControlContainer className="top-5 right-5">
      <button type="button" onClick={() => { map.locate(); map.once("locationfound", (e: { latlng: { lat: number; lng: number } }) => { const p: [number, number] = [e.latlng.lat, e.latlng.lng]; map.flyTo(p, Math.max(map.getZoom(), 15), { duration: 1 }); onLocated(p); }); }}
        className="flex size-9 items-center justify-center rounded-lg border bg-card shadow-lg text-muted-foreground hover:bg-muted" title="Use current location">
        <Navigation className="size-4" />
      </button>
    </MapControlContainer>
  );
}

/** Flies to the barangay centroid once when data resolves, then never again. */
function AutoCenter({ centroid }: { centroid: [number, number] | null | undefined }) {
  const map = useMap();
  const hasFlown = useRef(false);
  useEffect(() => {
    if (hasFlown.current || !centroid) return;
    map.setView(centroid, 14, { animate: true, duration: 1 });
    hasFlown.current = true;
  }, [centroid]);
  return null;
}

/** Search control that flies to the selected place. Must be inside MapContainer. */
function SearchWithFly({ onMove, onSelect }: { onMove: (pos: [number, number]) => void; onSelect: (pos: [number, number], label: string) => void }) {
  const map = useMap();
  return (
    <MapSearchControl position="top-3 left-4 z-[1001] w-[260px]" limit={3} debounceMs={300} lang="en"
      onPlaceSelect={(place) => {
        const pos: [number, number] = [place.geometry.coordinates[1], place.geometry.coordinates[0]];
        map.flyTo(pos, 16, { duration: 1 });
        onMove(pos);
        onSelect(pos, "");
      }}
    />
  );
}

export function FormMap({ markerPos, onMarkerMove, onSearchSelect }: FormMapProps) {
  const [isOutside, setIsOutside] = useState(false);
  const { profile } = useAuthStore();
  const isBarangayUser = profile?.role === "barangay_official";

  const { data: boundaryFeatures } = useQuery({
    queryKey: ["map", "boundaries"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_barangay_boundaries" as never);
      if (error) throw error;
      return (data as { features?: Record<string, unknown>[] })?.features ?? null;
    },
    staleTime: 300_000,
  });

  // Find the user's barangay boundary polygon
  const userBoundary = useMemo(() => {
    if (!isBarangayUser || !profile?.barangay_id || !boundaryFeatures) return null;
    const match = boundaryFeatures.find((f: Record<string, unknown>) => {
      const props = f.properties as Record<string, unknown> | null;
      return props?.id === profile.barangay_id;
    });
    if (!match) return null;
    const geom = match.geometry as { type: string; coordinates: number[][][][] } | null;
    if (!geom?.coordinates) return null;
    return extractRings(geom);
  }, [isBarangayUser, profile?.barangay_id, boundaryFeatures]);

  // Fetch just the centroid directly from barangays table (fast, single row by PK)
  const { data: centroid } = useQuery({
    queryKey: ["map", "centroid", profile?.barangay_id],
    queryFn: async () => {
      if (!profile?.barangay_id) return null;
      const { data, error } = await supabase
        .from("barangays")
        .select("centroid")
        .eq("id", profile.barangay_id)
        .single();
      if (error) throw error;
      return data?.centroid ? parseWKBPoint(data.centroid as string) : null;
    },
    enabled: !!profile?.barangay_id,
    staleTime: 600_000,
  });

  // Move marker to barangay centroid when boundary first loads
  useEffect(() => {
    if (centroid && profile?.barangay_id) {
      onMarkerMove(centroid);
    }
  }, [!!centroid]);

  const handleMove = (pos: [number, number]) => {
    if (userBoundary) {
      setIsOutside(!pointInPolygon(pos, userBoundary));
    }
    onMarkerMove(pos);
  };

  return (
    <div className="relative h-72 overflow-hidden rounded-lg border" style={{ cursor: "crosshair" }}>
      {isOutside && isBarangayUser && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute bottom-0 left-0 right-0 z-[1001] bg-destructive/90 px-3 py-1.5 text-[11px] font-medium text-destructive-foreground text-center"
        >
          Pin outside your assigned barangay boundary
        </motion.div>
      )}
      <MapContainer center={DAVAO_CENTER} zoom={13} className="z-0 h-full w-full" zoomControl={false}>
        <MapLayers defaultTileLayer="Street" defaultLayerGroups={["Barangay Boundaries"]}>
          <MapTileLayer name="Street" />
          <MapTileLayer name="Satellite" url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="&copy; Esri" />
          <MapTileLayer name="Dark" url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png" attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>' />
          <MapLayerGroup name="Barangay Boundaries">
            <MapBoundaryLayer features={boundaryFeatures} highlightId={profile?.barangay_id ?? undefined} />
          </MapLayerGroup>
          <MapZoomControl position="bottom-5 right-5" />
          <MapLayersControl position="bottom-28 right-5" />
          <SearchWithFly onMove={handleMove} onSelect={onSearchSelect} />
          <LocateButton onLocated={(pos) => handleMove(pos)} />
        </MapLayers>
        <DraggableMarker position={markerPos} onMove={handleMove} />
        <AutoCenter centroid={centroid} />
      </MapContainer>
    </div>
  );
}
