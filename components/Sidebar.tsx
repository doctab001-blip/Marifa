// The dashboard already owns the richer collapsible navigation implementation.
// This stable entry point keeps the shell component discoverable without
// introducing a second sidebar or duplicating its navigation state.
export { WorkspaceSidebar as Sidebar } from "@/components/app-navigation";
