import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-page-bg flex flex-col items-center justify-between px-6 py-8">
      {/* Top label */}
      <div className="flex items-center gap-2 text-text-muted text-sm font-mono tracking-wider">
        <span className="text-green">✦</span>
        <span>AI + AWS - Amazon Bedrock</span>
      </div>

      {/* Hero section */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-3xl text-center gap-8 py-16">
        {/* Logo */}
        <Image
          src="/logo.png"
          alt="EcoPrompt logo"
          width={64}
          height={64}
          className="rounded-lg"
        />

        {/* Headline */}
        <h1
          className="text-text-primary font-semibold leading-[1.0]"
          style={{
            fontSize: "clamp(32px, 5vw, 48px)",
            letterSpacing: "-2.4px",
          }}
        >
          The most sustainable AI compute is the compute you{" "}
          <span className="font-bold">never run.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-text-secondary text-base leading-relaxed max-w-xl">
          EcoPrompt reduces the environmental cost of AI through semantic
          deduplication, model right-sizing, and real-time cost visibility.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/app"
            className="flex items-center justify-center h-12 px-8 rounded-full bg-near-black text-text-primary border border-text-primary text-sm font-medium transition-colors hover:bg-border-prominent"
          >
            See the demo
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="w-full max-w-4xl border-t border-border-subtle pt-8 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <StatItem value="~10x" label="energy difference between model tiers" />
          <StatItem value="0.65" label="cosine similarity threshold" />
          <StatItem value="300k" label="LLM calls avoided per 1M queries at 30% hit rate" />
          <StatItem value="0 kg" label={"CO\u2082 from a cache-hit response"} />
        </div>
      </div>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-text-primary text-2xl font-semibold tracking-tight">
        {value}
      </span>
      <span className="text-text-muted text-xs leading-snug">{label}</span>
    </div>
  );
}
