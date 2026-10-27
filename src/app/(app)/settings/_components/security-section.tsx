"use client";

import { useId, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { FormBlock, inputClass } from "@/components/quiz-editor/form-block";
import { SwitchRow } from "@/components/quiz-editor/switch-row";
import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  SectionBody,
  SectionFooter,
  SettingsSection,
} from "./settings-section";

const MIN_PASSWORD = 8;

type Values = { current: string; next: string; confirm: string };
type Errors = Partial<Record<keyof Values, string>>;

const empty: Values = { current: "", next: "", confirm: "" };

function validate(values: Values): Errors {
  const errors: Errors = {};

  if (!values.current) {
    errors.current = "Enter your current password.";
  }
  if (values.next.length < MIN_PASSWORD) {
    errors.next = `Use at least ${MIN_PASSWORD} characters.`;
  } else if (values.next === values.current) {
    errors.next = "Choose a different password from your current one.";
  }
  if (values.confirm !== values.next) {
    errors.confirm = "The passwords don't match.";
  }

  return errors;
}

export function SecuritySection() {
  const id = useId();
  const [values, setValues] = useState(empty);
  const [signOutOthers, setSignOutOthers] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const filled = Boolean(values.current && values.next && values.confirm);
  const errors = validate(values);
  const shown: Errors = submitted ? errors : {};

  function change(patch: Partial<Values>) {
    setValues((previous) => ({ ...previous, ...patch }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!filled || saving) return;

    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);

    // Mock only: the real action checks the current password on the server.
    window.setTimeout(() => {
      setSaving(false);
      setSubmitted(false);
      setValues(empty);
      toast.success(
        signOutOthers
          ? "Password updated. Other devices were signed out."
          : "Password updated",
      );
    }, 700);
  }

  return (
    <SettingsSection
      id="security"
      title="Security"
      description="Change your password to keep your account safe.">
      <form onSubmit={submit} noValidate>
        <SectionBody>
          <FormBlock
            label="Current password"
            htmlFor={`${id}-current`}
            error={shown.current}>
            <PasswordInput
              id={`${id}-current`}
              autoComplete="current-password"
              value={values.current}
              aria-invalid={Boolean(shown.current)}
              onChange={(event) => change({ current: event.target.value })}
              className={inputClass}
            />
          </FormBlock>

          <div className="space-y-2.5">
            <div className="grid gap-6 sm:grid-cols-2">
              <FormBlock
                label="New password"
                htmlFor={`${id}-next`}
                error={shown.next}>
                <PasswordInput
                  id={`${id}-next`}
                  autoComplete="new-password"
                  value={values.next}
                  aria-invalid={Boolean(shown.next)}
                  onChange={(event) => change({ next: event.target.value })}
                  className={inputClass}
                />
              </FormBlock>

              <FormBlock
                label="Confirm new password"
                htmlFor={`${id}-confirm`}
                error={shown.confirm}>
                <PasswordInput
                  id={`${id}-confirm`}
                  autoComplete="new-password"
                  value={values.confirm}
                  aria-invalid={Boolean(shown.confirm)}
                  onChange={(event) => change({ confirm: event.target.value })}
                  className={inputClass}
                />
              </FormBlock>
            </div>

            <p className="text-sm text-muted-foreground">
              Use at least {MIN_PASSWORD} characters.
            </p>
          </div>

          <SwitchRow
            label="Sign out of other devices"
            description="You stay signed in here. Every other session ends."
            checked={signOutOthers}
            onCheckedChange={setSignOutOthers}
          />
        </SectionBody>

        <SectionFooter>
          <p className="text-sm text-muted-foreground">
            Use a password you don&rsquo;t use anywhere else.
          </p>
          <Button
            type="submit"
            className="shadow-primary"
            disabled={!filled || saving}>
            {saving && <Spinner />}
            Update password
          </Button>
        </SectionFooter>
      </form>
    </SettingsSection>
  );
}
