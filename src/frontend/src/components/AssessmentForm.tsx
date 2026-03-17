import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Loader2, Stethoscope } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { PatientAssessment } from "../backend.d";
import { useSubmitAssessment } from "../hooks/useQueries";

const FAMILY_HISTORY_OPTIONS = [
  { id: "diabetes", label: "Diabetes" },
  { id: "hypertension", label: "Hypertension" },
  { id: "heart_disease", label: "Heart Disease" },
  { id: "cancer", label: "Cancer" },
  { id: "obesity", label: "Obesity" },
];

interface AssessmentFormProps {
  onResult: (assessment: PatientAssessment) => void;
}

export function AssessmentForm({ onResult }: AssessmentFormProps) {
  const { mutateAsync, isPending, error } = useSubmitAssessment();

  const [form, setForm] = useState({
    patientName: "",
    age: "",
    gender: "",
    bmi: "",
    systolicBP: "",
    diastolicBP: "",
    cholesterolLevel: "",
    bloodSugar: "",
    smokingStatus: "",
    activityLevel: "",
  });
  const [familyHistory, setFamilyHistory] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleFamilyHistory(id: string) {
    setFamilyHistory((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);

    const required = [
      "patientName",
      "age",
      "gender",
      "bmi",
      "systolicBP",
      "diastolicBP",
      "cholesterolLevel",
      "bloodSugar",
      "smokingStatus",
      "activityLevel",
    ];
    for (const field of required) {
      if (!form[field as keyof typeof form]) {
        setValidationError("Please fill in all required fields.");
        return;
      }
    }

    try {
      const result = await mutateAsync({
        patientName: form.patientName,
        age: BigInt(form.age),
        gender: form.gender,
        bmi: Number.parseFloat(form.bmi),
        systolicBP: BigInt(form.systolicBP),
        diastolicBP: BigInt(form.diastolicBP),
        cholesterolLevel: form.cholesterolLevel,
        bloodSugar: BigInt(form.bloodSugar),
        smokingStatus: form.smokingStatus,
        activityLevel: form.activityLevel,
        familyHistory: familyHistory.join(","),
      });
      onResult(result);
    } catch {
      // error handled by mutation state
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-serif text-foreground">
              Patient Health Assessment
            </h1>
            <p className="text-sm text-muted-foreground">
              Complete all fields for an accurate risk prediction
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="patientName">
                Patient Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="patientName"
                data-ocid="form.patient_name.input"
                placeholder="e.g. Jane Smith"
                value={form.patientName}
                onChange={(e) => handleChange("patientName", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="age">
                Age <span className="text-destructive">*</span>
              </Label>
              <Input
                id="age"
                data-ocid="form.age.input"
                type="number"
                min={1}
                max={120}
                placeholder="Years"
                value={form.age}
                onChange={(e) => handleChange("age", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>
                Gender <span className="text-destructive">*</span>
              </Label>
              <Select onValueChange={(v) => handleChange("gender", v)}>
                <SelectTrigger data-ocid="form.gender.select">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bmi">
                BMI <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bmi"
                data-ocid="form.bmi.input"
                type="number"
                step="0.1"
                min={10}
                max={60}
                placeholder="e.g. 24.5"
                value={form.bmi}
                onChange={(e) => handleChange("bmi", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Vitals */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Vital Signs & Lab Results
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="systolicBP">
                Systolic BP{" "}
                <span className="text-muted-foreground text-xs">(mmHg)</span>{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="systolicBP"
                data-ocid="form.systolic.input"
                type="number"
                min={60}
                max={250}
                placeholder="e.g. 120"
                value={form.systolicBP}
                onChange={(e) => handleChange("systolicBP", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="diastolicBP">
                Diastolic BP{" "}
                <span className="text-muted-foreground text-xs">(mmHg)</span>{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="diastolicBP"
                data-ocid="form.diastolic.input"
                type="number"
                min={40}
                max={150}
                placeholder="e.g. 80"
                value={form.diastolicBP}
                onChange={(e) => handleChange("diastolicBP", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>
                Cholesterol Level <span className="text-destructive">*</span>
              </Label>
              <Select
                onValueChange={(v) => handleChange("cholesterolLevel", v)}
              >
                <SelectTrigger data-ocid="form.cholesterol.select">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="borderline">Borderline</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bloodSugar">
                Blood Sugar{" "}
                <span className="text-muted-foreground text-xs">(mg/dL)</span>{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bloodSugar"
                data-ocid="form.blood_sugar.input"
                type="number"
                min={50}
                max={500}
                placeholder="e.g. 95"
                value={form.bloodSugar}
                onChange={(e) => handleChange("bloodSugar", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Lifestyle */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Lifestyle Factors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>
                Smoking Status <span className="text-destructive">*</span>
              </Label>
              <Select onValueChange={(v) => handleChange("smokingStatus", v)}>
                <SelectTrigger data-ocid="form.smoking.select">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never Smoked</SelectItem>
                  <SelectItem value="former">Former Smoker</SelectItem>
                  <SelectItem value="current">Current Smoker</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>
                Physical Activity Level{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Select onValueChange={(v) => handleChange("activityLevel", v)}>
                <SelectTrigger data-ocid="form.activity.select">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary</SelectItem>
                  <SelectItem value="light">Light Activity</SelectItem>
                  <SelectItem value="moderate">Moderate Activity</SelectItem>
                  <SelectItem value="active">Very Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Family History */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Family History
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Select all conditions that occur in your immediate family
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {FAMILY_HISTORY_OPTIONS.map((opt, i) => (
              <label
                htmlFor={opt.id}
                key={opt.id}
                className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all duration-150 ${
                  familyHistory.includes(opt.id)
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-background hover:border-primary/40"
                }`}
              >
                <Checkbox
                  id={opt.id}
                  data-ocid={`form.family_history.checkbox.${i + 1}`}
                  checked={familyHistory.includes(opt.id)}
                  onCheckedChange={() => toggleFamilyHistory(opt.id)}
                  className="mt-0"
                />
                <span className="text-sm font-medium select-none">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Errors */}
        {(validationError || error) && (
          <div
            data-ocid="form.error_state"
            className="flex items-center gap-2.5 p-3.5 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {validationError ??
              (error as Error)?.message ??
              "An error occurred"}
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            type="submit"
            data-ocid="form.submit_button"
            disabled={isPending}
            size="lg"
            className="min-w-40"
          >
            {isPending ? (
              <>
                <Loader2
                  data-ocid="form.loading_state"
                  className="mr-2 h-4 w-4 animate-spin"
                />
                Analyzing...
              </>
            ) : (
              <>
                <Stethoscope className="mr-2 h-4 w-4" />
                Run Assessment
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
