import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface UserProfile {
    name: string;
    role: string;
}
export type Time = bigint;
export interface OperatorProfileActivity {
    operator: Principal;
    lastActivity: Time;
    name?: string;
    role?: Role;
}
export interface Observation {
    id: string;
    status: string;
    title: string;
    submitter: Principal;
    area?: string;
    description: string;
    obsType: string;
    timestamp: Time;
}
export type HashedPassword = string;
export interface Kaizen {
    id: string;
    status: KaizenStatus;
    title: string;
    improvement: string;
    submitter: Principal;
    lastUpdate: Time;
    timestamp: Time;
    assignedDepartment?: string;
    managerComment?: string;
    department?: string;
    requiredTools?: string;
    benefit: string;
    problemStatement: string;
}
export interface Credential {
    id: LoginId;
    password: HashedPassword;
    role: Role;
    enabled: boolean;
}
export interface OperatorActivity {
    operator: Principal;
    lastActivity: Time;
}
export type LoginId = string;
export interface AuthorizationToken {
    loginId: LoginId;
    isAdmin: boolean;
}
export interface Photo {
    id: string;
    kaizenId: string;
    contentType: string;
    blob: ExternalBlob;
    filename: string;
    timestamp: Time;
    uploader: Principal;
}
export enum KaizenStatus {
    closed = "closed",
    assigned = "assigned",
    submitted = "submitted",
    approved = "approved",
    implemented = "implemented",
    rejected = "rejected",
    inProgress = "inProgress"
}
export enum Role {
    manager = "manager",
    admin = "admin",
    operator = "operator"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    approveKaizen(kaizenId: string, comment: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignDepartment(kaizenId: string, department: string, tools: string): Promise<void>;
    authorizeAdmin(loginId: LoginId, password: HashedPassword): Promise<AuthorizationToken>;
    createCredentialWithToken(token: AuthorizationToken, loginId: LoginId, password: HashedPassword, role: Role, enabled: boolean): Promise<void>;
    getAllKaizens(): Promise<Array<Kaizen>>;
    getAllObservations(): Promise<Array<Observation>>;
    getAllOperatorActivity(): Promise<Array<OperatorProfileActivity>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getInactiveOperators(days: bigint): Promise<Array<OperatorActivity>>;
    getKaizen(id: string): Promise<Kaizen>;
    getKaizensByStatus(status: KaizenStatus): Promise<Array<Kaizen>>;
    getMaintenanceMode(): Promise<boolean>;
    getObservation(id: string): Promise<Observation>;
    getObservationsByDate(start: Time, end: Time): Promise<Array<Observation>>;
    getObservationsByType(obsType: string): Promise<Array<Observation>>;
    getPhotosForKaizen(kaizenId: string): Promise<Array<Photo>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listCredentials(token: AuthorizationToken): Promise<Array<Credential>>;
    pingActivity(): Promise<void>;
    rejectKaizen(kaizenId: string, reason: string): Promise<void>;
    resetPasswordWithToken(token: AuthorizationToken, loginId: LoginId, newPassword: HashedPassword): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setCredentialStatusWithToken(token: AuthorizationToken, loginId: LoginId, enabled: boolean): Promise<void>;
    setMaintenanceMode(enabled: boolean): Promise<void>;
    submitKaizen(title: string, problemStatement: string, improvement: string, benefit: string, department: string | null): Promise<void>;
    submitObservation(obsType: string, title: string, description: string, area: string | null): Promise<void>;
    updateKaizenStatus(kaizenId: string, newStatus: KaizenStatus): Promise<void>;
    uploadPhoto(kaizenId: string, filename: string, contentType: string, blob: ExternalBlob): Promise<void>;
    validateCredentials(loginId: LoginId, password: HashedPassword, selectedRole: Role): Promise<void>;
}
