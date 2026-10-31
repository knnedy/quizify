"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import { useTheme } from "next-themes";
import { MapPinIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { toast } from "sonner";
import { FormBlock } from "@/components/form/form-block";
import { Segmented } from "@/components/form/segmented";
import { TimezonePicker } from "@/components/form/timezone-picker";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useMounted } from "@/hooks/use-mounted";
import { getDeviceTimezone } from "@/lib/timezone-list";
import {
  SectionBody,
  SectionFooter,
  SettingsSection,
} from "./settings-section";

type ThemeChoice = "light" | "dark" | "system";

const themeOptions: { value: ThemeChoice; label: ReactNode }[] = [
  {
    value: "light",
    label: (
      <>
        <SunIcon aria-hidden className="size-4" />
        Light
      </>
    ),
  },
  {
    value: "dark",
    label: (
      <>
        <MoonIcon aria-hidden className="size-4" />
        Dark
      </>
    ),
  },
  {
    value: "system",
    label: (
      <>
        <MonitorIcon aria-hidden className="size-4" />
        System
      </>
    ),
  },
];

function toChoice(theme: string | undefined): ThemeChoice {
  return theme === "light" || theme === "dark" ? theme : "system";
}

export function PreferencesSection({
  initialTimezone,
}: {
  initialTimezone: string;
}) {
  const timezoneId = useId();
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const [saved, setSaved] = useState(initialTimezone);
  const [timezone, setTimezone] = useState(initialTimezone);
  const [saving, setSaving] = useState(false);

  const dirty = timezone !== saved;

  function pickDeviceTimezone() {
    const device = getDeviceTimezone();

    if (!device) {
      toast.error("Couldn't read your device's timezone");
      return;
    }
    setTimezone(device);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dirty || saving) return;

    setSaving(true);

    // Mock only: the real action saves users.timezone.
    window.setTimeout(() => {
      setSaved(timezone);
      setSaving(false);
      toast.success("Timezone saved");
    }, 600);
  }

  return (
    <SettingsSection
      id="preferences"
      title="Preferences"
      description="How Quizify looks for you, and when your day starts.">
      <form onSubmit={submit}>
        <SectionBody>
          <FormBlock
            label="Theme"
            hint="Applies right away and is remembered on this device.">
            <Segmented<ThemeChoice | null>
              label="Theme"
              value={mounted ? toChoice(theme) : null}
              options={themeOptions}
              onChange={(value) => {
                if (value) setTheme(value);
              }}
            />
          </FormBlock>

          <FormBlock
            label="Timezone"
            htmlFor={timezoneId}
            hint="Your streak and daily resets follow this timezone.">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <TimezonePicker
                id={timezoneId}
                value={timezone}
                onChange={setTimezone}
                className="sm:max-w-sm"
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={pickDeviceTimezone}>
                <MapPinIcon />
                Use this device
              </Button>
            </div>
          </FormBlock>
        </SectionBody>

        <SectionFooter>
          <p role="status" className="text-sm text-muted-foreground">
            {dirty ? "Unsaved timezone" : "Timezone is up to date"}
          </p>
          <Button
            type="submit"
            className="shadow-primary"
            disabled={!dirty || saving}>
            {saving && <Spinner />}
            Save timezone
          </Button>
        </SectionFooter>
      </form>
    </SettingsSection>
  );
}
