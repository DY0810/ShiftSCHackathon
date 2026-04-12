import ChatPanel from "@/components/ChatPanel";
import DashboardPanel from "@/components/DashboardPanel";

export default function AppPage() {
  return (
    <div className="h-screen flex flex-col lg:flex-row bg-page-bg">
      {/* Chat Panel — left ~55% */}
      <div className="lg:w-[55%] w-full h-1/2 lg:h-full border-b lg:border-b-0 lg:border-r border-border-subtle">
        <ChatPanel />
      </div>

      {/* Dashboard Panel — right ~45% */}
      <div className="lg:w-[45%] w-full h-1/2 lg:h-full bg-surface/30">
        <DashboardPanel />
      </div>
    </div>
  );
}
