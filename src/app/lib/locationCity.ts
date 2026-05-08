type AddressComponent = {
  long_name?: string;
  short_name?: string;
  types?: string[];
};

type GeocoderLikeResult = {
  address_components?: AddressComponent[];
};

type CanonicalCity = {
  city: string;
  cityNormalized: string;
  aliases: string[];
};

const CANONICAL_CITIES: CanonicalCity[] = [
  {
    city: 'Chișinău',
    cityNormalized: 'chisinau',
    aliases: [
      'chisinau',
      'chișinău',
      'chişinău',
      'кишинев',
      'кишинёв',
      'кишинэу',
      'кишинев мун',
      'municipiul chisinau',
      'municipiul chișinău',
      'municipiul chişinău',
      'chisinau municipality',
      'chișinău municipality',
    ],
  },
];

export function normalizeCityName(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');

  return normalized || null;
}

export function canonicalizeCityName(value: string | null | undefined) {
  const normalized = normalizeCityName(value);

  if (!normalized) {
    return {
      city: null,
      cityNormalized: null,
    };
  }

  const canonicalCity = CANONICAL_CITIES.find(
    (item) =>
      item.cityNormalized === normalized ||
      item.aliases.some((alias) => normalizeCityName(alias) === normalized)
  );

  if (canonicalCity) {
    return {
      city: canonicalCity.city,
      cityNormalized: canonicalCity.cityNormalized,
    };
  }

  const city = value?.trim() || null;

  return {
    city,
    cityNormalized: normalized,
  };
}

export function extractCityFromAddressComponents(components: AddressComponent[] | null | undefined) {
  if (!Array.isArray(components) || components.length === 0) {
    return {
      city: null,
      cityNormalized: null,
    };
  }

  const typePriority = ['locality', 'administrative_area_level_2', 'administrative_area_level_1'];

  for (const type of typePriority) {
    const match = components.find(
      (component) => Array.isArray(component.types) && component.types.includes(type)
    );

    const city = match?.long_name?.trim() || null;

    if (city) {
      return canonicalizeCityName(city);
    }
  }

  return {
    city: null,
    cityNormalized: null,
  };
}

export function extractCityFromGeocoderResults(results: GeocoderLikeResult[] | null | undefined) {
  if (!Array.isArray(results) || results.length === 0) {
    return {
      city: null,
      cityNormalized: null,
    };
  }

  for (const result of results) {
    const extracted = extractCityFromAddressComponents(result?.address_components);

    if (extracted.city) {
      return extracted;
    }
  }

  return {
    city: null,
    cityNormalized: null,
  };
}
