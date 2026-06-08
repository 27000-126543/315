import { useState, createContext, useContext } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

const SidebarContext = createContext<{ collapsed: boolean }>({ collapsed: false });

export const useSidebarContext = () => useContext(SidebarContext);

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed }}>
      <div className="flex min-h-screen topo-bg">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <div
          className="flex-1 transition-all duration-300"
          style={{ marginLeft: collapsed ? 68 : 220 }}
        >
          <TopBar />
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
