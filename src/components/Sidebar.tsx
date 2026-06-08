import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Database,
  FlaskConical,
  ShieldAlert,
  TreePine,
  CheckCircle,
  FileBarChart,
  Leaf,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/store";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "仪表盘" },
  { to: "/data", icon: Database, label: "数据管理" },
  { to: "/tasks", icon: FlaskConical, label: "模拟任务" },
  { to: "/risk", icon: ShieldAlert, label: "风险监控" },
  { to: "/conservation", icon: TreePine, label: "保护策略" },
  { to: "/approval", icon: CheckCircle, label: "审批中心" },
  { to: "/reports", icon: FileBarChart, label: "报告中心" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const warnings = useStore((s) => s.warnings);
  const activeWarnings = warnings.filter((w) => w.status === "ACTIVE").length;
  const pendingApprovals = useStore((s) => s.approvals).filter((a) => a.status === "PENDING").length;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-forest-900/80 backdrop-blur-xl border-r border-forest-500/20 z-50 transition-all duration-300 flex flex-col",
        collapsed ? "w-[68px]" : "w-[220px]"
      )}
    >
      <div className={cn("flex items-center gap-3 px-4 h-16 border-b border-forest-500/20", collapsed && "justify-center px-2")}>
        <div className="w-8 h-8 rounded-lg stat-gradient-green flex items-center justify-center flex-shrink-0">
          <Leaf className="w-5 h-5 text-forest-50" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-display text-sm font-bold text-forest-50 leading-tight truncate">BioDiversity</h1>
            <p className="text-[10px] text-forest-300 leading-tight">模拟与保护规划</p>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));
          const badge = item.to === "/risk" ? activeWarnings : item.to === "/approval" ? pendingApprovals : 0;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                isActive
                  ? "bg-forest-600/40 text-amber-400"
                  : "text-forest-200 hover:bg-forest-700/40 hover:text-forest-50"
              )}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-amber-400")} />
              {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
              {badge > 0 && (
                <span className={cn("absolute bg-danger-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1", collapsed ? "top-1 right-1" : "right-3")}>
                  {badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <button
        onClick={onToggle}
        className="flex items-center justify-center h-10 border-t border-forest-500/20 text-forest-300 hover:text-forest-50 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
