import { motion } from "motion/react";

type RiskLevel = "low" | "medium" | "high";

interface RiskCardProps {
  title: string;
  risk: string;
  icon: React.ReactNode;
  "data-ocid"?: string;
}

const riskConfig: Record<
  RiskLevel,
  {
    label: string;
    dotClass: string;
    bgClass: string;
    barWidth: string;
    barColor: string;
  }
> = {
  low: {
    label: "Low Risk",
    dotClass: "risk-dot-low",
    bgClass: "risk-low",
    barWidth: "w-1/4",
    barColor: "bg-emerald-500",
  },
  medium: {
    label: "Medium Risk",
    dotClass: "risk-dot-medium",
    bgClass: "risk-medium",
    barWidth: "w-2/4",
    barColor: "bg-amber-500",
  },
  high: {
    label: "High Risk",
    dotClass: "risk-dot-high",
    bgClass: "risk-high",
    barWidth: "w-3/4",
    barColor: "bg-red-500",
  },
};

export function RiskCard({
  title,
  risk,
  icon,
  "data-ocid": dataOcid,
}: RiskCardProps) {
  const level = (risk?.toLowerCase() as RiskLevel) ?? "low";
  const config = riskConfig[level] ?? riskConfig.low;

  return (
    <motion.div
      data-ocid={dataOcid}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="bg-card rounded-xl border border-border p-5 shadow-card flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="text-primary/80">{icon}</span>
          {title}
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.bgClass}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
          {config.label}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${config.barColor}`}
          initial={{ width: 0 }}
          animate={{
            width: config.barWidth.replace("w-", "").replace("/", "/"),
          }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          style={{
            width: level === "low" ? "25%" : level === "medium" ? "55%" : "85%",
          }}
        />
      </div>
    </motion.div>
  );
}
