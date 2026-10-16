"use client";

import { useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

export function CollapsibleShell({ children, primaryColor }: { children: React.ReactNode; primaryColor: string }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className={`app-shell${collapsed ? " sidebar-collapsed" : ""}`} style={{ "--royal": primaryColor } as React.CSSProperties}>
      <button type="button" className="sidebar-toggle" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!collapsed} aria-controls="workspace-sidebar" onClick={() => setCollapsed((value) => !value)}>
        {collapsed ? <PanelLeftOpen size={18} aria-hidden="true" /> : <PanelLeftClose size={18} aria-hidden="true" />}
      </button>
      {children}
    </div>
  );
}
