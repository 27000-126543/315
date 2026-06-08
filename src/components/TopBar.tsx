import { Bell, Search, User } from "lucide-react";
import { useStore } from "@/store";

export default function TopBar() {
  const warnings = useStore((s) => s.warnings);
  const activeWarnings = warnings.filter((w) => w.status === "ACTIVE").length;

  return (
    <header className="sticky top-0 z-40 h-14 bg-forest-900/60 backdrop-blur-xl border-b border-forest-500/20 flex items-center justify-between px-6">
      <div className="flex items-center gap-3 bg-forest-800/50 rounded-lg px-3 py-1.5 w-80">
        <Search className="w-4 h-4 text-forest-300" />
        <input
          type="text"
          placeholder="搜索物种、任务、报告..."
          className="bg-transparent text-sm text-forest-50 placeholder-forest-400 outline-none w-full"
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-forest-700/40 transition-colors">
          <Bell className="w-5 h-5 text-forest-200" />
          {activeWarnings > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-danger-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
              {activeWarnings}
            </span>
          )}
        </button>
        <div className="flex items-center gap-2 pl-4 border-l border-forest-500/20">
          <div className="w-8 h-8 rounded-full stat-gradient-amber flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-medium text-forest-50">陈生态学家</p>
            <p className="text-[10px] text-forest-400">种群生态学家</p>
          </div>
        </div>
      </div>
    </header>
  );
}
