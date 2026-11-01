"use client";

import { useId, useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { FormBlock, inputClass } from "@/components/form/form-block";
import { PasswordInput } from "@/components/form/password-input";
import { SwitchRow } from "@/components/form/switch-row";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { fieldErrors } from "@/lib/schemas/field-errors";
import { PASSWORD_MIN, changePasswordSchema } from "@/lib/schemas/settings";
import { changePassword } from "@/server/actions/account";
import {
  SectionBody,
  SectionFooter,
  SettingsSection,
} from "./settings-section";

type Values = { current: string; next: string; confirm: string };
type Errors = Partial<Record<keyof Values, string>>;

const empty: Values = { current: "", next: "", confirm: "" };

function validate(values: Values, signOutOthers: boolean): Errors {
  const errors: Errors = {};

  const parsed = changePasswordSchema.safeParse({
    currentPassword: values.current,
    newPassword: values.next,
    revokeOtherSessions: signOutOthers,
  });

  if (!parsed.success) {
    const found = fieldErrors<"currentPassword" | "newPassword">(parsed.error);
    if (found.currentPassword) errors.current = found.currentPassword;
    if (found.newPassword) errors.next = found.newPassword;
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
  const [isPending, startTransition] = useTransition();

  const filled = Boolean(values.current && values.next && values.confirm);
  const errors = validate(values, signOutOthers);
  const shown: Errors = submitted ? errors : {};

  function change(patch: Partial<Values>) {
    setValues((previous) => ({ ...previous, ...patch }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!filled || isPending) return;

    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;

    startTransition(async () => {
      const result = await changePassword({
        currentPassword: values.current,
        newPassword: values.next,
        revokeOtherSessions: signOutOthers,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      setSubmitted(false);
      setValues(empty);
      toast.success(
        signOutOthers
          ? "Password updated. Other devices were signed out."
          : "Password updated",
      );
    });
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
              Use at least {PASSWORD_MIN} characters.
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
            disabled={!filled || isPending}>
            {isPending && <Spinner />}
            Update password
          </Button>
        </SectionFooter>
      </form>
    </SettingsSection>
  );
}
