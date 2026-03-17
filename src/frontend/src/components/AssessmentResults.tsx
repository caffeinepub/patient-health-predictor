import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Droplets,
  FileDown,
  Heart,
  RotateCcw,
  ShieldCheck,
  User,
  Weight,
} from "lucide-react";
import { motion } from "motion/react";
import type { PatientAssessment } from "../backend.d";
import { RiskCard } from "./RiskCard";

interface AssessmentResultsProps {
  assessment: PatientAssessment;
  onNewAssessment: () => void;
}

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function computeOverallRisk(
  riskScores: PatientAssessment["riskScores"],
): "high" | "medium" | "low" {
  const scores = Object.values(riskScores).map((s) => s.toLowerCase());
  if (scores.some((s) => s === "high")) return "high";
  if (scores.some((s) => s === "medium")) return "medium";
  return "low";
}

const overallRiskConfig = {
  high: {
    label: "High",
    message: "One or more risk factors require immediate attention",
    badgeClass: "bg-red-100 text-red-700 border border-red-200",
    bannerClass: "bg-red-50 border-red-200",
    icon: AlertTriangle,
    iconClass: "text-red-500",
    dotClass: "bg-red-500",
  },
  medium: {
    label: "Medium",
    message: "Some risk factors present — monitoring recommended",
    badgeClass: "bg-amber-100 text-amber-700 border border-amber-200",
    bannerClass: "bg-amber-50 border-amber-200",
    icon: AlertTriangle,
    iconClass: "text-amber-500",
    dotClass: "bg-amber-500",
  },
  low: {
    label: "Low",
    message: "All risk factors within normal range",
    badgeClass: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    bannerClass: "bg-emerald-50 border-emerald-200",
    icon: ShieldCheck,
    iconClass: "text-emerald-500",
    dotClass: "bg-emerald-500",
  },
};

export function AssessmentResults({
  assessment,
  onNewAssessment,
}: AssessmentResultsProps) {
  const recommendations = assessment.recommendations
    ? assessment.recommendations
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean)
    : [];

  const familyHistoryList = assessment.familyHistory
    ? assessment.familyHistory
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean)
    : [];

  const overallRisk = computeOverallRisk(assessment.riskScores);
  const riskConfig = overallRiskConfig[overallRisk];
  const RiskIcon = riskConfig.icon;

  function handleDownloadPDF() {
    window.print();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border">
        <img
          src="/assets/generated/health-hero-bg.dim_1200x400.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="relative z-10 p-6 bg-gradient-to-r from-sidebar/80 to-sidebar/40">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-sidebar-primary uppercase tracking-widest mb-1">
                Assessment Complete
              </p>
              <h1 className="text-2xl font-serif text-white">
                {assessment.patientName}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-white/70">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Age {assessment.age.toString()} · {assessment.gender}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatTimestamp(assessment.timestamp)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                data-ocid="results.download_pdf.button"
                variant="outline"
                onClick={handleDownloadPDF}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <FileDown className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Button
                data-ocid="results.new_assessment.button"
                variant="outline"
                onClick={onNewAssessment}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                New Assessment
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Risk Banner */}
      <motion.div
        data-ocid="results.overall_risk.panel"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className={`rounded-2xl border p-5 flex items-center gap-5 ${riskConfig.bannerClass}`}
      >
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${overallRisk === "high" ? "bg-red-100" : overallRisk === "medium" ? "bg-amber-100" : "bg-emerald-100"}`}
        >
          <RiskIcon className={`w-6 h-6 ${riskConfig.iconClass}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">
              Overall Risk
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-sm font-semibold ${riskConfig.badgeClass}`}
            >
              <span className={`w-2 h-2 rounded-full ${riskConfig.dotClass}`} />
              {riskConfig.label}
            </span>
          </div>
          <p className="text-sm text-foreground/70 leading-relaxed">
            {riskConfig.message}
          </p>
        </div>
      </motion.div>

      {/* Risk Scores */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Risk Analysis
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <RiskCard
            data-ocid="results.diabetes.card"
            title="Diabetes Risk"
            risk={assessment.riskScores.diabetesRisk}
            icon={<Droplets className="w-4 h-4" />}
          />
          <RiskCard
            data-ocid="results.hypertension.card"
            title="Hypertension Risk"
            risk={assessment.riskScores.hypertensionRisk}
            icon={<Activity className="w-4 h-4" />}
          />
          <RiskCard
            data-ocid="results.cardiovascular.card"
            title="Cardiovascular Risk"
            risk={assessment.riskScores.cardiovascularRisk}
            icon={<Heart className="w-4 h-4" />}
          />
          <RiskCard
            data-ocid="results.obesity.card"
            title="Obesity Risk"
            risk={assessment.riskScores.obesityRisk}
            icon={<Weight className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Recommendations */}
      <div
        data-ocid="results.recommendations.panel"
        className="bg-card rounded-xl border border-border p-6 shadow-card"
      >
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">
            Personalized Recommendations
          </h2>
        </div>
        {recommendations.length > 0 ? (
          <ul className="space-y-2.5">
            {recommendations.map((rec) => (
              <motion.li
                key={rec}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05, duration: 0.3 }}
                className="flex items-start gap-3 text-sm"
              >
                <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                  {recommendations.indexOf(rec) + 1}
                </span>
                <span className="text-foreground/80 leading-relaxed">
                  {rec}
                </span>
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            No specific recommendations at this time.
          </p>
        )}
      </div>

      {/* Detail Summary */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-card">
        <h2 className="font-semibold text-foreground mb-4">
          Assessment Details
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 text-sm">
          {[
            { label: "BMI", value: assessment.bmi.toFixed(1) },
            {
              label: "Blood Pressure",
              value: `${assessment.systolicBP}/${assessment.diastolicBP} mmHg`,
            },
            { label: "Blood Sugar", value: `${assessment.bloodSugar} mg/dL` },
            { label: "Cholesterol", value: assessment.cholesterolLevel },
            { label: "Smoking", value: assessment.smokingStatus },
            { label: "Activity", value: assessment.activityLevel },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-muted-foreground text-xs uppercase tracking-wide">
                {label}
              </p>
              <p className="font-medium capitalize mt-0.5">{value}</p>
            </div>
          ))}
        </div>
        {familyHistoryList.length > 0 && (
          <>
            <Separator className="my-4" />
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-2">
                Family History
              </p>
              <div className="flex flex-wrap gap-2">
                {familyHistoryList.map((item) => (
                  <span
                    key={item}
                    className="px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium capitalize"
                  >
                    {item.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
