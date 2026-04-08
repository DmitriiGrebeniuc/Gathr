import { useCallback, useEffect, useMemo, useState } from 'react';
import { GoogleMap, LoadScriptNext, Marker } from '@react-google-maps/api';

const GOOGLE_LIBRARIES: ('places')[] = ['places'];

type EventLocationMapProps = {
  lat: number | null;
  lng: number | null;
  editable?: boolean;
  height?: number;
  onPick?: (payload: {
    lat: number;
    lng: number;
    address: string;
    placeId: string | null;
  }) => void;
};

const DEFAULT_CENTER = {
  lat: 47.0105,
  lng: 28.8638,
};

const mapContainerStyleBase = {
  width: '100%',
  borderRadius: '16px',
  overflow: 'hidden',
};

const isCapacitorNativeApp = () => {
  return typeof window !== 'undefined' && !!(window as any).Capacitor?.isNativePlatform?.();
};

const getGoogleMapsApiKey = () => {
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY_WEB ?? '';
};

export function EventLocationMap({
  lat,
  lng,
  editable = false,
  height = 220,
  onPick,
}: EventLocationMapProps) {
  const isNativeApp = isCapacitorNativeApp();
  const apiKey = getGoogleMapsApiKey();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(
    lat !== null && lng !== null ? { lat, lng } : null
  );
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);

  useEffect(() => {
    if (lat !== null && lng !== null) {
      const nextPosition = { lat, lng };
      setMarkerPosition(nextPosition);

      if (map) {
        map.panTo(nextPosition);
      }
    } else {
      setMarkerPosition(null);
    }
  }, [lat, lng, map]);

  const center = useMemo(() => {
    if (markerPosition) {
      return markerPosition;
    }

    if (lat !== null && lng !== null) {
      return { lat, lng };
    }

    return DEFAULT_CENTER;
  }, [lat, lng, markerPosition]);

  const mapContainerStyle = useMemo(
    () => ({
      ...mapContainerStyleBase,
      height: `${height}px`,
    }),
    [height]
  );

  const resolveAddress = useCallback(
    async (nextLat: number, nextLng: number) => {
      if (!(window as any).google?.maps?.Geocoder) {
        onPick?.({
          lat: nextLat,
          lng: nextLng,
          address: '',
          placeId: null,
        });
        return;
      }

      setIsResolvingAddress(true);

      try {
        const geocoder = new (window as any).google.maps.Geocoder();

        geocoder.geocode(
          {
            location: { lat: nextLat, lng: nextLng },
          },
          (results: any) => {
            const firstResult = Array.isArray(results) && results.length > 0 ? results[0] : null;

            const address = firstResult?.formatted_address || '';
            const placeId = firstResult?.place_id || null;

            onPick?.({
              lat: nextLat,
              lng: nextLng,
              address,
              placeId,
            });

            setIsResolvingAddress(false);
          }
        );
      } catch (error) {
        console.error('Reverse geocoding error:', error);

        onPick?.({
          lat: nextLat,
          lng: nextLng,
          address: '',
          placeId: null,
        });

        setIsResolvingAddress(false);
      }
    },
    [onPick]
  );

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!editable) return;

      const nextLat = e.latLng?.lat();
      const nextLng = e.latLng?.lng();

      if (typeof nextLat !== 'number' || typeof nextLng !== 'number') {
        return;
      }

      const nextPosition = { lat: nextLat, lng: nextLng };
      setMarkerPosition(nextPosition);

      if (map) {
        map.panTo(nextPosition);
      }

      resolveAddress(nextLat, nextLng);
    },
    [editable, map, resolveAddress]
  );

  const handleMapLoad = useCallback((instance: google.maps.Map) => {
    setMap(instance);
  }, []);

  const displayMarker = markerPosition || (lat !== null && lng !== null ? { lat, lng } : null);

  if (isNativeApp) {
    return (
      <div
        className="rounded-2xl border border-border flex items-center justify-center text-sm text-muted-foreground text-center px-4"
        style={{
          height: `${height}px`,
          backgroundColor: '#1A1A1A',
        }}
      >
        Карта временно доступна только в веб-версии. На телефоне укажи адрес вручную.
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div
        className="rounded-2xl border border-border flex items-center justify-center text-sm text-muted-foreground"
        style={{
          height: `${height}px`,
          backgroundColor: '#1A1A1A',
        }}
      >
        Google Maps API key is missing
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <LoadScriptNext googleMapsApiKey={apiKey} libraries={GOOGLE_LIBRARIES}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={displayMarker ? 15 : 12}
          onLoad={handleMapLoad}
          onClick={handleMapClick}
          options={{
            disableDefaultUI: false,
            clickableIcons: editable,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          {displayMarker && <Marker position={displayMarker} />}
        </GoogleMap>
      </LoadScriptNext>

      {editable && (
        <p className="text-xs text-muted-foreground px-1">
          {isResolvingAddress
            ? 'Определяем адрес по точке на карте...'
            : 'Нажми на карту, чтобы выбрать место'}
        </p>
      )}
    </div>
  );
}