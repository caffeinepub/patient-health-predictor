import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Activity,
  ClipboardList,
  LogIn,
  LogOut,
  Menu,
  Stethoscope,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { PatientAssessment } from "./backend.d";
import { AssessmentForm } from "./components/AssessmentForm";
import { AssessmentHistory } from "./components/AssessmentHistory";
import { AssessmentResults } from "./components/AssessmentResults";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useSessionHistory } from "./hooks/useSessionHistory";

const queryClient = new QueryClient();

type Page = "assessment" | "history";

function AppContent() {
  const { login, clear, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const { history: sessionHistory, addAssessment } = useSessionHistory();
  const [page, setPage] = useState<Page>("assessment");
  const [result, setResult] = useState<PatientAssessment | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLoggedIn = loginStatus === "success" && !!identity;

  function handleResult(assessment: PatientAssessment) {
    addAssessment(assessment);
    setResult(assessment);
  }

  function handleNewAssessment() {
    setResult(null);
  }

  function handleHistorySelect(assessment: PatientAssessment) {
    setResult(assessment);
    setPage("assessment");
  }

  function navigateTo(p: Page) {
    setPage(p);
    if (p === "assessment") setResult(null);
    setMobileMenuOpen(false);
  }

  const navItems = [
    {
      id: "assessment" as Page,
      label: "New Assessment",
      icon: Stethoscope,
      ocid: "nav.assessment.link",
    },
    {
      id: "history" as Page,
      label: "History",
      icon: ClipboardList,
      ocid: "nav.history.link",
    },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-sidebar text-sidebar-foreground">
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sidebar-primary flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-serif text-lg leading-tight text-white">
                HealthPredict
              </p>
              <p className="text-xs text-sidebar-foreground/50">
                AI Risk Assessment
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.id}
              data-ocid={item.ocid}
              onClick={() => navigateTo(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                page === item.id
                  ? "bg-sidebar-accent text-white"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Auth */}
        <div className="p-4 border-t border-sidebar-border">
          {isInitializing ? (
            <div className="h-9 rounded-lg bg-sidebar-accent/40 animate-pulse" />
          ) : isLoggedIn ? (
            <div className="space-y-2">
              <p className="text-xs text-sidebar-foreground/50 px-1 truncate">
                {identity.getPrincipal().toString().slice(0, 20)}...
              </p>
              <Button
                data-ocid="auth.logout.button"
                variant="ghost"
                size="sm"
                onClick={clear}
                className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button
              data-ocid="auth.login.button"
              onClick={login}
              disabled={loginStatus === "logging-in"}
              className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-white"
              size="sm"
            >
              <LogIn className="mr-2 h-4 w-4" />
              {loginStatus === "logging-in" ? "Connecting..." : "Sign In"}
            </Button>
          )}
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar text-sidebar-foreground px-4 py-3 flex items-center justify-between border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="font-serif text-base text-white">HealthPredict</span>
        </div>
        <button
          type="button"
          data-ocid="nav.mobile_menu.button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg hover:bg-sidebar-accent/60"
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="lg:hidden fixed top-14 left-0 right-0 z-40 bg-sidebar border-b border-sidebar-border p-4 space-y-1"
          >
            {navItems.map((item) => (
              <button
                type="button"
                key={item.id}
                data-ocid={item.ocid}
                onClick={() => navigateTo(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  page === item.id
                    ? "bg-sidebar-accent text-white"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
            <div className="pt-2 border-t border-sidebar-border mt-2">
              {isLoggedIn ? (
                <Button
                  data-ocid="auth.logout.button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    clear();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start text-sidebar-foreground/70"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </Button>
              ) : (
                <Button
                  data-ocid="auth.login.button"
                  onClick={() => {
                    login();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-sidebar-primary text-white"
                  size="sm"
                >
                  <LogIn className="mr-2 h-4 w-4" /> Sign In
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col">
        <div className="flex-1 p-6 pt-6 lg:pt-6 mt-14 lg:mt-0 max-w-3xl mx-auto w-full">
          <AnimatePresence mode="wait">
            {page === "history" ? (
              <motion.div
                key="history"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <AssessmentHistory
                  onSelect={handleHistorySelect}
                  sessionAssessments={sessionHistory}
                  isLoggedIn={isLoggedIn}
                />
              </motion.div>
            ) : !isLoggedIn ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[60vh] text-center"
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto">
                    <Activity className="w-10 h-10 text-primary" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                    <span className="text-white text-xs font-bold">AI</span>
                  </div>
                </div>
                <h2 className="text-3xl font-serif text-foreground mb-3">
                  HealthPredict
                </h2>
                <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed">
                  Sign in to access AI-powered patient health risk assessment
                  and personalized recommendations.
                </p>
                <Button
                  data-ocid="auth.login.button"
                  onClick={login}
                  disabled={loginStatus === "logging-in"}
                  size="lg"
                  className="min-w-40"
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  {loginStatus === "logging-in"
                    ? "Connecting..."
                    : "Sign In to Continue"}
                </Button>
                {loginStatus === "loginError" && (
                  <p
                    data-ocid="auth.error_state"
                    className="mt-3 text-sm text-destructive"
                  >
                    Login failed. Please try again.
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="assessment"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {result ? (
                  <AssessmentResults
                    assessment={result}
                    onNewAssessment={handleNewAssessment}
                  />
                ) : (
                  <AssessmentForm onResult={handleResult} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="mt-auto py-4 px-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </main>

      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
