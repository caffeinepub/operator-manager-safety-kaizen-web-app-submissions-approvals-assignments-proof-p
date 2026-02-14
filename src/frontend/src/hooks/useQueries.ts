import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Observation, Kaizen, KaizenStatus, Photo, OperatorActivity, OperatorProfileActivity, UserProfile } from '../backend';
import { UserRole } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';
import { ExternalBlob } from '../backend';

// Observations
export function useGetAllObservations() {
  const { actor, isFetching } = useActor();

  return useQuery<Observation[]>({
    queryKey: ['observations'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllObservations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetObservation(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Observation>({
    queryKey: ['observation', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getObservation(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useSubmitObservation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      obsType,
      title,
      description,
      area,
    }: {
      obsType: string;
      title: string;
      description: string;
      area?: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitObservation(obsType, title, description, area || null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['observations'] });
    },
  });
}

// Kaizens
export function useGetAllKaizens() {
  const { actor, isFetching } = useActor();

  return useQuery<Kaizen[]>({
    queryKey: ['kaizens'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllKaizens();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetKaizen(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Kaizen>({
    queryKey: ['kaizen', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getKaizen(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useSubmitKaizen() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      problemStatement,
      improvement,
      benefit,
      department,
    }: {
      title: string;
      problemStatement: string;
      improvement: string;
      benefit: string;
      department?: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitKaizen(title, problemStatement, improvement, benefit, department || null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kaizens'] });
    },
  });
}

export function useApproveKaizen() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ kaizenId, comment }: { kaizenId: string; comment: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.approveKaizen(kaizenId, comment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kaizens'] });
    },
  });
}

export function useRejectKaizen() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ kaizenId, reason }: { kaizenId: string; reason: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.rejectKaizen(kaizenId, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kaizens'] });
    },
  });
}

export function useAssignDepartment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ kaizenId, department, tools }: { kaizenId: string; department: string; tools: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignDepartment(kaizenId, department, tools);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kaizens'] });
    },
  });
}

export function useUpdateKaizenStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ kaizenId, newStatus }: { kaizenId: string; newStatus: KaizenStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateKaizenStatus(kaizenId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kaizens'] });
    },
  });
}

// Photos
export function useGetPhotosForKaizen(kaizenId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Photo[]>({
    queryKey: ['photos', kaizenId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPhotosForKaizen(kaizenId);
    },
    enabled: !!actor && !isFetching && !!kaizenId,
  });
}

export function useUploadPhoto() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      kaizenId,
      filename,
      contentType,
      blob,
    }: {
      kaizenId: string;
      filename: string;
      contentType: string;
      blob: ExternalBlob;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadPhoto(kaizenId, filename, contentType, blob);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['photos', variables.kaizenId] });
    },
  });
}

// Activity
export function useGetInactiveOperators(days: number) {
  const { actor, isFetching } = useActor();

  return useQuery<OperatorActivity[]>({
    queryKey: ['inactiveOperators', days],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getInactiveOperators(BigInt(days));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllOperatorActivity() {
  const { actor, isFetching } = useActor();

  return useQuery<OperatorProfileActivity[]>({
    queryKey: ['allOperatorActivity'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOperatorActivity();
    },
    enabled: !!actor && !isFetching,
  });
}

// User Profile
export function useGetUserProfile(user: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return null;
      return actor.getUserProfile(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useAssignCallerUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, role }: { user: Principal; role: UserRole }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignCallerUserRole(user, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
    },
  });
}

// Maintenance Mode
export function useGetMaintenanceMode() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['maintenanceMode'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.getMaintenanceMode();
    },
    enabled: !!actor && !isFetching,
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Refetch every 30 seconds to catch mode changes
  });
}

export function useSetMaintenanceMode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setMaintenanceMode(enabled);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceMode'] });
    },
  });
}

// Admin Bootstrap
export function useHasAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['hasAdmin'],
    queryFn: async () => {
      if (!actor) return true; // Assume admin exists if actor not ready
      return actor.hasAdmin();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useBootstrapAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.bootstrapAdminIfNeeded();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['hasAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
