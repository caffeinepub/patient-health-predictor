import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface RiskScores {
    cardiovascularRisk: string;
    diabetesRisk: string;
    obesityRisk: string;
    hypertensionRisk: string;
}
export type Time = bigint;
export interface PatientAssessment {
    id: bigint;
    age: bigint;
    bmi: number;
    activityLevel: string;
    recommendations: string;
    cholesterolLevel: string;
    submittedBy: Principal;
    systolicBP: bigint;
    bloodSugar: bigint;
    diastolicBP: bigint;
    gender: string;
    smokingStatus: string;
    timestamp: Time;
    familyHistory: string;
    patientName: string;
    riskScores: RiskScores;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAssessment(id: bigint): Promise<PatientAssessment | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyAssessments(): Promise<Array<PatientAssessment>>;
    isCallerAdmin(): Promise<boolean>;
    submitAssessment(patientName: string, age: bigint, gender: string, bmi: number, systolicBP: bigint, diastolicBP: bigint, cholesterolLevel: string, bloodSugar: bigint, smokingStatus: string, activityLevel: string, familyHistory: string): Promise<PatientAssessment>;
}
