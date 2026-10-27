export type TimezoneOption = {
  value: string;
  city: string;
  region: string;
  offset: string;
  search: string;
};

const regionLabels: Record<string, string> = {
  America: "Americas",
  Indian: "Indian Ocean",
};

function getOffset(value: string, date: Date) {
  try {
    const part = new Intl.DateTimeFormat("en-US", {
      timeZone: value,
      timeZoneName: "shortOffset",
    })
      .formatToParts(date)
      .find((item) => item.type === "timeZoneName");

    return part ? part.value.replace("GMT", "UTC") : "";
  } catch {
    return "";
  }
}

export function describeTimezone(
  value: string,
  date = new Date(),
): TimezoneOption {
  const parts = value.split("/");
  const rawRegion = parts.length > 1 ? parts[0] : "Universal";
  const region = regionLabels[rawRegion] ?? rawRegion;
  const city = parts[parts.length - 1].replace(/_/g, " ");
  const offset = getOffset(value, date);

  return {
    value,
    city,
    region,
    offset,
    search:
      `${city} ${region} ${value.replace(/_/g, " ")} ${offset}`.toLowerCase(),
  };
}

function readSupported() {
  try {
    const list = Intl.supportedValuesOf("timeZone");
    return list.includes("UTC") ? list : ["UTC", ...list];
  } catch {
    return ["UTC"];
  }
}

function compare(a: TimezoneOption, b: TimezoneOption) {
  if (a.region !== b.region) {
    if (a.region === "Universal") return -1;
    if (b.region === "Universal") return 1;
    return a.region.localeCompare(b.region);
  }
  return a.city.localeCompare(b.city);
}

let cache: TimezoneOption[] | null = null;

export function listTimezones() {
  if (cache) return cache;

  const now = new Date();
  cache = readSupported()
    .map((value) => describeTimezone(value, now))
    .sort(compare);

  return cache;
}

// A saved timezone the browser doesn't list still has to be selectable, so it
// goes into its own group at the top.
export function listTimezonesWith(value: string) {
  const base = listTimezones();
  if (base.some((option) => option.value === value)) return base;

  return [{ ...describeTimezone(value), region: "Current" }, ...base];
}

export function getDeviceTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}
