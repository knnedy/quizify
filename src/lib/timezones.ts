export type TimezoneGroup = {
  region: string;
  zones: { value: string; label: string }[];
};

const raw: [region: string, zones: [value: string, label: string][]][] = [
  ["Universal", [["UTC", "UTC"]]],
  [
    "Africa",
    [
      ["Africa/Accra", "Accra"],
      ["Africa/Addis_Ababa", "Addis Ababa"],
      ["Africa/Cairo", "Cairo"],
      ["Africa/Dar_es_Salaam", "Dar es Salaam"],
      ["Africa/Johannesburg", "Johannesburg"],
      ["Africa/Kampala", "Kampala"],
      ["Africa/Lagos", "Lagos"],
      ["Africa/Nairobi", "Nairobi"],
    ],
  ],
  [
    "Americas",
    [
      ["America/Los_Angeles", "Los Angeles"],
      ["America/Denver", "Denver"],
      ["America/Chicago", "Chicago"],
      ["America/New_York", "New York"],
      ["America/Toronto", "Toronto"],
      ["America/Mexico_City", "Mexico City"],
      ["America/Sao_Paulo", "São Paulo"],
      ["America/Argentina/Buenos_Aires", "Buenos Aires"],
    ],
  ],
  [
    "Europe",
    [
      ["Europe/London", "London"],
      ["Europe/Lisbon", "Lisbon"],
      ["Europe/Paris", "Paris"],
      ["Europe/Berlin", "Berlin"],
      ["Europe/Madrid", "Madrid"],
      ["Europe/Istanbul", "Istanbul"],
      ["Europe/Moscow", "Moscow"],
    ],
  ],
  [
    "Asia",
    [
      ["Asia/Dubai", "Dubai"],
      ["Asia/Karachi", "Karachi"],
      ["Asia/Kolkata", "Kolkata"],
      ["Asia/Dhaka", "Dhaka"],
      ["Asia/Bangkok", "Bangkok"],
      ["Asia/Singapore", "Singapore"],
      ["Asia/Shanghai", "Shanghai"],
      ["Asia/Tokyo", "Tokyo"],
      ["Asia/Seoul", "Seoul"],
    ],
  ],
  [
    "Oceania",
    [
      ["Australia/Sydney", "Sydney"],
      ["Pacific/Auckland", "Auckland"],
    ],
  ],
];

export const timezoneGroups: TimezoneGroup[] = raw.map(([region, zones]) => ({
  region,
  zones: zones.map(([value, label]) => ({ value, label })),
}));

// A saved or detected timezone that isn't in the list still has to show up
// in the select, so it goes into its own group at the top.
export function withCurrentTimezones(...current: string[]): TimezoneGroup[] {
  const known = new Set(
    timezoneGroups.flatMap((group) => group.zones.map((zone) => zone.value)),
  );
  const extra = [...new Set(current)].filter(
    (value) => value && !known.has(value),
  );

  if (extra.length === 0) return timezoneGroups;

  return [
    {
      region: "Current",
      zones: extra.map((value) => ({ value, label: value })),
    },
    ...timezoneGroups,
  ];
}

export function getDeviceTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}
