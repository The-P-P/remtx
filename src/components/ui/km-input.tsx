"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import {
  cn,
  formatKmInputFromDigits,
  parseKmInputFromDigits,
  resolveDigitsAfterMaskedInput,
} from "@/lib/utils";

type KmInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "type" | "value" | "defaultValue" | "onChange"
> & {
  name?: string;
  defaultValue?: number;
  value?: number;
  onValueChange?: (value: number | undefined) => void;
  allowEmpty?: boolean;
};

function digitsFromNumber(
  value: number | undefined,
  allowEmpty: boolean
): string {
  if (value == null || Number.isNaN(value)) {
    return allowEmpty ? "" : "0";
  }
  return String(Math.trunc(value));
}

export function KmInput({
  name,
  id,
  className,
  defaultValue,
  value: controlledValue,
  onValueChange,
  required,
  allowEmpty = !required,
  disabled,
  placeholder = "0 km",
  ...props
}: KmInputProps) {
  const isControlled = controlledValue !== undefined;
  const [digits, setDigits] = React.useState(() =>
    digitsFromNumber(isControlled ? controlledValue : defaultValue, allowEmpty)
  );

  React.useEffect(() => {
    if (isControlled) {
      setDigits(digitsFromNumber(controlledValue, allowEmpty));
    }
  }, [controlledValue, isControlled, allowEmpty]);

  const display = digits ? formatKmInputFromDigits(digits) : "";
  const numeric = digits
    ? parseKmInputFromDigits(digits)
    : allowEmpty
      ? undefined
      : 0;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setDigits((previousDigits) => {
      const previousDisplay = previousDigits
        ? formatKmInputFromDigits(previousDigits)
        : "";
      const nextDigits = resolveDigitsAfterMaskedInput(
        previousDigits,
        raw,
        previousDisplay
      );
      const nextNumeric = nextDigits
        ? parseKmInputFromDigits(nextDigits)
        : allowEmpty
          ? undefined
          : 0;
      onValueChange?.(nextNumeric);
      return nextDigits;
    });
  }

  const hiddenValue =
    numeric != null && !Number.isNaN(numeric) ? String(numeric) : "";

  return (
    <>
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn("tabular-nums", className)}
        {...props}
      />
      {name && (
        <input
          type="hidden"
          name={name}
          value={hiddenValue}
          required={required}
        />
      )}
    </>
  );
}
