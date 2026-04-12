"use client";

import { useEffect, useRef, useState } from "react";

type MetricsCounterProps = {
  label: string;
  value: string;
  subtitle: string;
  unit?: string;
};

export default function MetricsCounter({
  label,
  value,
  subtitle,
  unit,
}: MetricsCounterProps) {
  const numericValue = parseFloat(value);
  const isNumeric = !isNaN(numericValue);
  const [displayValue, setDisplayValue] = useState(value);
  const prevRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!isNumeric) {
      setDisplayValue(value);
      return;
    }

    const from = prevRef.current;
    const to = numericValue;
    prevRef.current = to;

    if (from === to) {
      setDisplayValue(value);
      return;
    }

    const duration = 600;
    const startTime = performance.now();
    const decimals = value.includes(".") ? value.split(".")[1].length : 0;

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;
      setDisplayValue(current.toFixed(decimals));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, numericValue, isNumeric]);

  return (
    <div className="bg-surface rounded-lg border border-border-standard p-4 flex flex-col gap-1">
      <span className="text-xs font-mono tracking-wider text-text-muted uppercase">
        {label}
      </span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-semibold text-text-primary tracking-tight transition-all">
          {displayValue}
        </span>
        {unit && (
          <span className="text-sm text-text-secondary">{unit}</span>
        )}
      </div>
      <span className="text-xs text-green flex items-center gap-1">
        <span className="text-green">↑</span> {subtitle}
      </span>
    </div>
  );
}
