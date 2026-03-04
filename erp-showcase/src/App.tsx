import Hero from "./components/Hero";
import StatsSection from "./components/StatsSection";
import ChatSection from "./components/ChatSection";
import TableSection from "./components/TableSection";
import FeaturesSection from "./components/FeaturesSection";

export default function App() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Hero />
      <StatsSection />
      <ChatSection />
      <TableSection />
      <FeaturesSection />
      <footer className="py-12 text-center text-sm text-slate-400">
        © 2026 FlowERP — Showcase
      </footer>
    </div>
  );
}
