import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PatientAssessment } from "../backend.d";
import { useActor } from "./useActor";

export function useGetMyAssessments() {
  const { actor, isFetching } = useActor();
  return useQuery<PatientAssessment[]>({
    queryKey: ["myAssessments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyAssessments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAssessment(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<PatientAssessment | null>({
    queryKey: ["assessment", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getAssessment(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export interface SubmitAssessmentParams {
  patientName: string;
  age: bigint;
  gender: string;
  bmi: number;
  systolicBP: bigint;
  diastolicBP: bigint;
  cholesterolLevel: string;
  bloodSugar: bigint;
  smokingStatus: string;
  activityLevel: string;
  familyHistory: string;
}

export function useSubmitAssessment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<PatientAssessment, Error, SubmitAssessmentParams>({
    mutationFn: async (params) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitAssessment(
        params.patientName,
        params.age,
        params.gender,
        params.bmi,
        params.systolicBP,
        params.diastolicBP,
        params.cholesterolLevel,
        params.bloodSugar,
        params.smokingStatus,
        params.activityLevel,
        params.familyHistory,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myAssessments"] });
    },
  });
}
