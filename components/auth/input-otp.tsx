'use client'

import { useRef, useEffect } from "react";

interface OTPInputProps {
  value: string[];
  onChange: (otp: string[]) => void;
}

export default function OTPInput({ value, onChange }: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, inputValue: string) => {
    if (!/^[0-9]?$/.test(inputValue)) return;

    const newOtp = [...value];
    newOtp[index] = inputValue;
    onChange(newOtp);

    if (inputValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text/plain").trim();

    // Only process if it looks like a 6-digit code
    if (/^\d{6}$/.test(pasteData)) {
      const newOtp = pasteData.split("").slice(0, 6);
      onChange(newOtp);
    }
  };

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <div className="flex gap-2">
      {value.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          className="w-12 h-12 text-center border rounded-md text-lg focus:border-primary focus:ring-1 focus:ring-primary"
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={index === 0 ? handlePaste : undefined}
          aria-label={`digit ${index + 1}`}
        />
      ))}
    </div>
  );
}