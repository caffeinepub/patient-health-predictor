import { useCallback, useState } from "react";
import type { PatientAssessment } from "../backend.d";

const SESSION_KEY = "healthpredict_session_history";

function loadFromStorage(): PatientAssessment[] {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Restore bigint fields
    return parsed.map((a: PatientAssessment) => ({
      ...a,
      id: BigInt(a.id.toString()),
      age: BigInt(a.age.toString()),
      systolicBP: BigInt(a.systolicBP.toString()),
      diastolicBP: BigInt(a.diastolicBP.toString()),
      bloodSugar: BigInt(a.bloodSugar.toString()),
      timestamp: BigInt(a.timestamp.toString()),
    }));
  } catch {
    return [];
  }
}

function saveToStorage(assessments: PatientAssessment[]) {
  try {
    // Serialize bigints as strings
    const serializable = assessments.map((a) => ({
      ...a,
      id: a.id.toString(),
      age: a.age.toString(),
      systolicBP: a.systolicBP.toString(),
      diastolicBP: a.diastolicBP.toString(),
      bloodSugar: a.bloodSugar.toString(),
      timestamp: a.timestamp.toString(),
    }));
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(serializable));
  } catch {
    // ignore storage errors
  }
}

export function useSessionHistory() {
  const [history, setHistory] = useState<PatientAssessment[]>(loadFromStorage);

  const addAssessment = useCallback((assessment: PatientAssessment) => {
    setHistory((prev) => {
      const next = [assessment, ...prev.filter((a) => a.id !== assessment.id)];
      saveToStorage(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setHistory([]);
  }, []);

  return { history, addAssessment, clearHistory };
}
