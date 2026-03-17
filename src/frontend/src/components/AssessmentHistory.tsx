import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  ChevronRight,
  ClipboardList,
  Info,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import type { PatientAssessment } from "../backend.d";
import { useGetMyAssessments } from "../hooks/useQueries";

interface AssessmentHistoryProps {
  onSelect: (assessment: PatientAssessment) => void;
  sessionAssessments?: PatientAssessment[];
  isLoggedIn?: boolean;
}

function RiskBadge({ risk }: { risk: string }) {
  const level = risk?.toLowerCase();
  if (level === "high")
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
        High
      </Badge>
    );
  if (level === "medium")
    return (
      <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
        Medium
      </Badge>
    );
  return (
    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
      Low
    </Badge>
  );
}

function getOverallRisk(assessment: PatientAssessment): string {
  const scores = Object.values(assessment.riskScores);
  if (scores.some((s) => s.toLowerCase() === "high")) return "high";
  if (scores.some((s) => s.toLowerCase() === "medium")) return "medium";
  return "low";
}

function formatDate(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function mergeAndDedupe(
  backend: PatientAssessment[],
  session: PatientAssessment[],
): PatientAssessment[] {
  const map = new Map<string, PatientAssessment>();
  for (const a of [...backend, ...session]) {
    map.set(a.id.toString(), a);
  }
  return Array.from(map.values()).sort(
    (a, b) => Number(b.timestamp) - Number(a.timestamp),
  );
}

export function AssessmentHistory({
  onSelect,
  sessionAssessments = [],
  isLoggedIn = false,
}: AssessmentHistoryProps) {
  const {
    data: backendAssessments,
    isLoading,
    isError,
  } = useGetMyAssessments();

  const combined = isLoggedIn
    ? mergeAndDedupe(backendAssessments ?? [], sessionAssessments)
    : sessionAssessments
        .slice()
        .sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

  const totalCount = combined.length;
  const highCount = combined.filter((a) => getOverallRisk(a) === "high").length;
  const mediumCount = combined.filter(
    (a) => getOverallRisk(a) === "medium",
  ).length;
  const lowCount = combined.filter((a) => getOverallRisk(a) === "low").length;

  if (isLoggedIn && isLoading) {
    return (
      <div data-ocid="history.loading_state" className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (isLoggedIn && isError) {
    return (
      <div
        data-ocid="history.error_state"
        className="flex items-center gap-2.5 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm"
      >
        Failed to load assessment history. Please try again.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-serif text-foreground">
              Assessment History
            </h1>
            <p className="text-sm text-muted-foreground">
              {totalCount} assessment{totalCount !== 1 ? "s" : ""} on record
            </p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      {totalCount > 0 && (
        <motion.div
          data-ocid="history.stats.panel"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-wrap gap-3 mb-5"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted border border-border text-sm font-medium">
            <span className="text-foreground/60">Total</span>
            <span className="text-foreground font-bold">{totalCount}</span>
          </div>
          {highCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-red-700">High Risk</span>
              <span className="text-red-700 font-bold">{highCount}</span>
            </div>
          )}
          {mediumCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-amber-700">Medium Risk</span>
              <span className="text-amber-700 font-bold">{mediumCount}</span>
            </div>
          )}
          {lowCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-emerald-700">Low Risk</span>
              <span className="text-emerald-700 font-bold">{lowCount}</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Session-only note */}
      {!isLoggedIn && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-700 mb-5"
        >
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Showing session history — sign in to save assessments permanently
          </span>
        </motion.div>
      )}

      {combined.length === 0 ? (
        <motion.div
          data-ocid="history.empty_state"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <ClipboardList className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">
            No assessments yet
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Submit your first patient health assessment to see results here.
          </p>
        </motion.div>
      ) : (
        <div data-ocid="history.list" className="space-y-3">
          {combined.map((assessment, index) => (
            <motion.button
              key={assessment.id.toString()}
              data-ocid={`history.item.${index + 1}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(assessment)}
              className="w-full text-left bg-card rounded-xl border border-border p-5 shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground truncate">
                      {assessment.patientName}
                    </h3>
                    <RiskBadge risk={getOverallRisk(assessment)} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      Age {assessment.age.toString()} · {assessment.gender}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(assessment.timestamp)}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2.5">
                    {Object.entries(assessment.riskScores).map(([key, val]) => (
                      <span
                        key={key}
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          val.toLowerCase() === "high"
                            ? "bg-red-50 text-red-600"
                            : val.toLowerCase() === "medium"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {key
                          .replace("Risk", "")
                          .replace(/([A-Z])/g, " $1")
                          .trim()}
                      </span>
                    ))}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
