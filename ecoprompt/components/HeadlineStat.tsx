type HeadlineStatProps = {
  callsAvoided: number;
  energySaved: number;
  co2Saved: number;
};

export default function HeadlineStat({
  callsAvoided,
  energySaved,
  co2Saved,
}: HeadlineStatProps) {
  return (
    <div className="bg-surface rounded-lg border border-green-border p-5 text-center">
      <p className="text-3xl font-semibold text-green tracking-tight">
        {callsAvoided}{" "}
        <span className="text-lg font-normal text-text-secondary">
          LLM call{callsAvoided !== 1 ? "s" : ""} avoided
        </span>
      </p>
      <p className="text-sm text-green/80 mt-1.5">
        saving ~{energySaved.toFixed(4)} kWh / {co2Saved.toFixed(4)} kg CO₂
      </p>
    </div>
  );
}
