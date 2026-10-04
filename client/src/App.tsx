import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Sidebar } from "./components/layout/Sidebar";
import { Navbar } from "./components/layout/Navbar";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { BusinessProfile } from "./pages/BusinessProfile";
import { ProductMaster } from "./pages/ProductMaster";
import { CreateInvoice } from "./pages/CreateInvoice";
import { InvoiceHistory } from "./pages/InvoiceHistory";
import { AnomalyDashboard } from "./pages/AnomalyDashboard";
import { Reports } from "./pages/Reports";
import { AdminRules } from "./pages/AdminRules";
import { LandingPage } from "./pages/LandingPage";
import { AuthenticatedAgentWorkspace } from "./components/agent/AuthenticatedAgentWorkspace";
import { ToastContainer, ToastMessage } from "./components/common/Toast";
import { Logo3D } from "./components/common/Logo3D";

const MainApp: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [viewMode, setViewMode] = useState<"landing" | "app" | "login">("landing");
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [agentPanelCollapsed, setAgentPanelCollapsed] = useState(true);
  const [globalSearch, setGlobalSearch] = useState("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [syncedWorkspaceState, setSyncedWorkspaceState] = useState<any>(null);

  const addToast = (type: "success" | "warning" | "error" | "info", title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07111F] flex flex-col items-center justify-center text-white font-sans gap-4">
        <Logo3D size="lg" />
        <div className="text-center">
          <h2 className="text-base font-black uppercase tracking-tight">GSTSAHAYAK</h2>
          <p className="text-xs text-zinc-400 mt-1 font-mono">Initializing Agentic Workspace & Rule Engine...</p>
        </div>
      </div>
    );
  }

  // Pre-Login Public Mode
  if (viewMode === "landing" && !user) {
    return (
      <LandingPage
        onGetStarted={() => setViewMode("login")}
        onLogin={() => setViewMode("login")}
      />
    );
  }

  if (viewMode === "login" && !user) {
    return <Login onBackToLanding={() => setViewMode("landing")} />;
  }

  if (!user) {
    return (
      <LandingPage
        onGetStarted={() => setViewMode("login")}
        onLogin={() => setViewMode("login")}
      />
    );
  }

  // Authenticated 3-Pane Agentic Workspace
  return (
    <div className="min-h-screen bg-[#07111F] text-[#F7F8F6] flex flex-col font-sans relative overflow-x-hidden">
      {/* Ambient Top & Bottom Glows */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-[#00A878]/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-[#E67E22]/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === "landing") {
            setViewMode("landing");
          } else {
            setCurrentTab(tab);
          }
        }}
        isOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Layout Area */}
      <div className="lg:pl-64 flex-1 flex flex-col min-h-screen">
        <Navbar
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onNavigateTab={setCurrentTab}
          globalSearch={globalSearch}
          onSearchChange={setGlobalSearch}
        />

        {/* Main Workspace Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fadeIn overflow-y-auto">
          {currentTab === "dashboard" && (
            <Dashboard
              onNavigateTab={setCurrentTab}
            />
          )}
          {currentTab === "agent" && (
            <AuthenticatedAgentWorkspace
              currentTab={currentTab}
              onNavigateTab={setCurrentTab}
              onSyncWorkspaceState={setSyncedWorkspaceState}
            />
          )}
          {currentTab === "business" && <BusinessProfile />}
          {currentTab === "products" && <ProductMaster />}
          {currentTab === "create-invoice" && (
            <CreateInvoice
              onNavigateTab={setCurrentTab}
              initialSyncedState={syncedWorkspaceState}
            />
          )}
          {currentTab === "invoice-history" && <InvoiceHistory />}
          {currentTab === "anomalies" && <AnomalyDashboard />}
          {currentTab === "reports" && <Reports />}
          {currentTab === "rules" && <AdminRules />}
        </main>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
