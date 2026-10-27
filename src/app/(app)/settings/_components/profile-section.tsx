"use client";

import { useId, useState, type ComponentProps, type FormEvent } from "react";
import { toast } from "sonner";
import { FormBlock, inputClass } from "@/components/quiz-editor/form-block";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  SectionBody,
  SectionFooter,
  SettingsSection,
} from "./settings-section";

export type ProfileValues = {
  name: string;
  website: string;
  github: string;
  x: string;
};

type Errors = Partial<Record<keyof ProfileValues, string>>;

const NAME_MIN = 2;
const NAME_MAX = 40;

function clean(values: ProfileValues): ProfileValues {
  return {
    name: values.name.trim(),
    website: values.website.trim(),
    github: values.github.trim(),
    x: values.x.trim(),
  };
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function validate(values: ProfileValues): Errors {
  const errors: Errors = {};

  if (values.name.length < NAME_MIN) {
    errors.name = `Use at least ${NAME_MIN} characters.`;
  }
  if (values.website && !isHttpUrl(values.website)) {
    errors.website = "Enter the full link, starting with https://.";
  }
  if (values.github && !/^[a-z\d][a-z\d-]{0,38}$/i.test(values.github)) {
    errors.github = "Use just your GitHub username, without the link.";
  }
  if (values.x && !/^[a-z\d_]{1,15}$/i.test(values.x)) {
    errors.x = "Use just your X username, without the @.";
  }

  return errors;
}

function PrefixInput({
  leading,
  invalid,
  ...props
}: ComponentProps<"input"> & { leading: string; invalid: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center rounded-xl border border-input bg-card shadow-xs transition-colors focus-within:border-ring focus-within:outline-2 focus-within:outline-ring/40",
        invalid && "border-incorrect",
      )}>
      <span
        aria-hidden
        className="pl-4 text-base text-muted-foreground select-none">
        {leading}
      </span>
      <input
        {...props}
        aria-invalid={invalid}
        autoCapitalize="none"
        spellCheck={false}
        className="min-w-0 flex-1 bg-transparent py-3 pr-4 pl-0.5 text-base outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

export function ProfileSection({
  email,
  initial,
}: {
  email: string;
  initial: ProfileValues;
}) {
  const id = useId();
  const [saved, setSaved] = useState(initial);
  const [values, setValues] = useState(initial);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const current = clean(values);
  const errors = validate(current);
  const shown: Errors = submitted ? errors : {};
  const dirty = (Object.keys(current) as (keyof ProfileValues)[]).some(
    (key) => current[key] !== saved[key],
  );

  function change(patch: Partial<ProfileValues>) {
    setValues((previous) => ({ ...previous, ...patch }));
  }

  function discard() {
    setValues(saved);
    setSubmitted(false);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || !dirty) return;

    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);

    // Mock only: the real action validates again on the server and saves.
    window.setTimeout(() => {
      setSaved(current);
      setValues(current);
      setSaving(false);
      setSubmitted(false);
      toast.success("Profile saved");
    }, 600);
  }

  return (
    <SettingsSection
      id="profile"
      title="Profile"
      description="Your name shows on quizzes you publish and on leaderboards.">
      <form onSubmit={submit} noValidate>
        <SectionBody>
          <FormBlock
            label="Display name"
            htmlFor={`${id}-name`}
            error={shown.name}>
            <input
              id={`${id}-name`}
              value={values.name}
              maxLength={NAME_MAX}
              autoComplete="name"
              aria-invalid={Boolean(shown.name)}
              onChange={(event) => change({ name: event.target.value })}
              className={inputClass}
            />
          </FormBlock>

          <FormBlock
            label="Email"
            htmlFor={`${id}-email`}
            hint="You sign in with this address. Changing it isn't available yet.">
            <input
              id={`${id}-email`}
              type="email"
              value={email}
              readOnly
              className={cn(inputClass, "bg-muted/50 text-muted-foreground")}
            />
          </FormBlock>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FormBlock
                label="Website"
                optional
                htmlFor={`${id}-website`}
                error={shown.website}>
                <input
                  id={`${id}-website`}
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  value={values.website}
                  placeholder="https://yoursite.com"
                  aria-invalid={Boolean(shown.website)}
                  onChange={(event) => change({ website: event.target.value })}
                  className={inputClass}
                />
              </FormBlock>
            </div>

            <FormBlock
              label="GitHub"
              optional
              htmlFor={`${id}-github`}
              error={shown.github}>
              <PrefixInput
                id={`${id}-github`}
                leading="github.com/"
                invalid={Boolean(shown.github)}
                value={values.github}
                placeholder="username"
                onChange={(event) => change({ github: event.target.value })}
              />
            </FormBlock>

            <FormBlock label="X" optional htmlFor={`${id}-x`} error={shown.x}>
              <PrefixInput
                id={`${id}-x`}
                leading="x.com/"
                invalid={Boolean(shown.x)}
                value={values.x}
                placeholder="username"
                onChange={(event) => change({ x: event.target.value })}
              />
            </FormBlock>
          </div>
        </SectionBody>

        <SectionFooter>
          <p role="status" className="text-sm text-muted-foreground">
            {dirty ? "Unsaved changes" : "Nothing to save"}
          </p>
          <div className="flex items-center gap-2">
            {dirty && (
              <Button type="button" variant="ghost" onClick={discard}>
                Discard
              </Button>
            )}
            <Button
              type="submit"
              className="shadow-primary"
              disabled={!dirty || saving}>
              {saving && <Spinner />}
              Save changes
            </Button>
          </div>
        </SectionFooter>
      </form>
    </SettingsSection>
  );
}
