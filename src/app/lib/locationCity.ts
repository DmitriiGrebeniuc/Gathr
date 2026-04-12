type AddressComponent = {
  long_name?: string;
  short_name?: string;
  types?: string[];
};

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
      return {
        city,
        cityNormalized: normalizeCityName(city),
      };
    }
  }

  return {
    city: null,
    cityNormalized: null,
  };
}
