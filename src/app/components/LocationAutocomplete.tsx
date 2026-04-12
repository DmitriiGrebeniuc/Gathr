import { useEffect, useRef, useState } from 'react';
import { LoadScriptNext } from '@react-google-maps/api';
import { useLanguage } from '../context/LanguageContext';
import { extractCityFromAddressComponents } from '../lib/locationCity';

const GOOGLE_LIBRARIES: ('places')[] = ['places'];

export type LocationValue = {
  address: string;
  placeId: string | null;
  lat: number | null;
  lng: number | null;
  city: string | null;
  cityNormalized: string | null;
};

type LocationAutocompleteProps = {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
  label: string;
  placeholder: string;
  disabled?: boolean;
};

const EMPTY_LOCATION: LocationValue = {
  address: '',
  placeId: null,
  lat: null,
  lng: null,
  city: null,
  cityNormalized: null,
};

const isCapacitorNativeApp = () => {
  return typeof window !== 'undefined' && !!(window as any).Capacitor?.isNativePlatform?.();
};

const getGoogleMapsApiKey = () => {
  const isNativeApp = isCapacitorNativeApp();

  return isNativeApp
    ? import.meta.env.VITE_GOOGLE_MAPS_API_KEY_ANDROID ?? ''
    : import.meta.env.VITE_GOOGLE_MAPS_API_KEY_WEB ?? '';
};

function PlainLocationInput({
  value,
  onChange,
  placeholder,
  disabled = false,
}: Omit<LocationAutocompleteProps, 'label'>) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value.address}
      onChange={(e) => {
        const nextAddress = e.target.value;

        if (!nextAddress.trim()) {
          onChange(EMPTY_LOCATION);
          return;
        }

        onChange({
          address: nextAddress,
          placeId: null,
          lat: null,
          lng: null,
          city: null,
          cityNormalized: null,
        });
      }}
      disabled={disabled}
      autoComplete="off"
      className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-accent outline-none transition-colors"
      style={{
        backgroundColor: '#1A1A1A',
        borderColor: 'rgba(255, 255, 255, 0.1)',
      }}
    />
  );
}

function GoogleAutocompleteInput({
  value,
  onChange,
  placeholder,
  disabled = false,
}: Omit<LocationAutocompleteProps, 'label'>) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<any>(null);
  const [inputValue, setInputValue] = useState(value.address);

  useEffect(() => {
    setInputValue(value.address);
  }, [value.address]);

  useEffect(() => {
    if (!inputRef.current) {
      return;
    }

    if (!(window as any).google?.maps?.places) {
      return;
    }

    if (autocompleteRef.current) {
      return;
    }

    autocompleteRef.current = new (window as any).google.maps.places.Autocomplete(
      inputRef.current,
      {
        fields: ['formatted_address', 'geometry', 'place_id', 'address_components'],
        types: ['geocode'],
      }
    );

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace?.();

      const address = place?.formatted_address || inputRef.current?.value || '';
      const placeId = place?.place_id || null;
      const lat =
        typeof place?.geometry?.location?.lat === 'function'
          ? place.geometry.location.lat()
          : null;
      const lng =
        typeof place?.geometry?.location?.lng === 'function'
          ? place.geometry.location.lng()
          : null;
      const { city, cityNormalized } = extractCityFromAddressComponents(
        place?.address_components
      );

      const nextValue: LocationValue = {
        address,
        placeId,
        lat,
        lng,
        city,
        cityNormalized,
      };

      setInputValue(address);
      onChange(nextValue);
    });
  }, [onChange]);

  const handleManualChange = (nextAddress: string) => {
    setInputValue(nextAddress);

    if (!nextAddress.trim()) {
      onChange(EMPTY_LOCATION);
      return;
    }

    onChange({
      address: nextAddress,
      placeId: null,
      lat: null,
      lng: null,
      city: null,
      cityNormalized: null,
    });
  };

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder={placeholder}
      value={inputValue}
      onChange={(e) => handleManualChange(e.target.value)}
      disabled={disabled}
      autoComplete="off"
      className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-accent outline-none transition-colors"
      style={{
        backgroundColor: '#1A1A1A',
        borderColor: 'rgba(255, 255, 255, 0.1)',
      }}
    />
  );
}

export function LocationAutocomplete({
  value,
  onChange,
  label,
  placeholder,
  disabled = false,
}: LocationAutocompleteProps) {
  const { translate } = useLanguage();
  const apiKey = getGoogleMapsApiKey();
  const shouldUsePlainInput = isCapacitorNativeApp();

  if (!apiKey) {
    return (
      <div>
        <label className="block mb-2 text-sm text-muted-foreground">{label}</label>

        <PlainLocationInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
        />

        <p className="mt-2 text-xs text-muted-foreground">
          {translate('create.locationApiKeyMissing')}
        </p>
      </div>
    );
  }

  if (shouldUsePlainInput) {
    return (
      <div>
        <label className="block mb-2 text-sm text-muted-foreground">{label}</label>

        <PlainLocationInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
        />
      </div>
    );
  }

  return (
    <div>
      <label className="block mb-2 text-sm text-muted-foreground">{label}</label>

      <LoadScriptNext googleMapsApiKey={apiKey} libraries={GOOGLE_LIBRARIES}>
        <GoogleAutocompleteInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
        />
      </LoadScriptNext>
    </div>
  );
}
