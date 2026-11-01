"use client";

import {
  useId,
  useState,
  useTransition,
  type ComponentProps,
  type FormEvent,
} from "react";
import { toast } from "sonner";
import { FormBlock, inputClass } from "@/components/form/form-block";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { fieldErrors } from "@/lib/schemas/field-errors";
import {
  NAME_MAX,
  profileSchema,
  type ProfileValues,
} from "@/lib/schemas/settings";
import { cn } from "@/lib/utils";
import { updateProfile } from "@/server/actions/profile";
import {
  SectionBody,
  SectionFooter,
  SettingsSection,
} from "./settings-section";

type Errors = Partial<Record<keyof ProfileValues, string>>;

function clean(values: ProfileValues): ProfileValues {
  return {
    name: values.name.trim(),
    website: values.website.trim(),
    instagram: values.instagram.trim(),
    x: values.x.trim(),
  };
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
  const [isPending, startTransition] = useTransition();

  const current = clean(values);
  const result = profileSchema.safeParse(current);
  const errors: Errors = result.success
    ? {}
    : fieldErrors<keyof ProfileValues>(result.error);
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
    if (isPending || !dirty) return;

    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;

    startTransition(async () => {
      const outcome = await updateProfile(current);

      if (!outcome.ok) {
        toast.error(outcome.error);
        return;
      }

      setSaved(current);
      setValues(current);
      setSubmitted(false);
      toast.success("Profile saved");
    });
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
              label="Instagram"
              optional
              htmlFor={`${id}-instagram`}
              error={shown.instagram}>
              <PrefixInput
                id={`${id}-instagram`}
                leading="instagram.com/"
                invalid={Boolean(shown.instagram)}
                value={values.instagram}
                placeholder="username"
                onChange={(event) => change({ instagram: event.target.value })}
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
              disabled={!dirty || isPending}>
              {isPending && <Spinner />}
              Save changes
            </Button>
          </div>
        </SectionFooter>
      </form>
    </SettingsSection>
  );
}
