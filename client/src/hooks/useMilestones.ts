import useSWR from "swr";
import {
  createMilestone as createMilestoneRequest,
  deleteMilestone as deleteMilestoneRequest,
  fetchMilestones,
  updateMilestone as updateMilestoneRequest
} from "../api/milestones";
import { sortMilestones } from "../lib/milestone-utils";
import type {
  CreateMilestoneInput,
  Milestone,
  UpdateMilestoneInput
} from "../types";

export interface UseMilestonesResult {
  milestones: Milestone[];
  isLoading: boolean;
  isRefreshing: boolean;
  errorMessage: string | null;
  refreshMilestones: () => Promise<Milestone[] | undefined>;
  createMilestoneOptimistic: (payload: CreateMilestoneInput) => Promise<Milestone>;
  updateMilestoneOptimistic: (id: string, payload: UpdateMilestoneInput) => Promise<Milestone>;
  deleteMilestoneOptimistic: (id: string) => Promise<void>;
}

export function useMilestones(): UseMilestonesResult {
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate
  } = useSWR("/milestones", fetchMilestones, {
    revalidateOnFocus: true,
    shouldRetryOnError: false
  });

  const errorMessage = error instanceof Error ? error.message : null;

  async function refreshMilestones(): Promise<Milestone[] | undefined> {
    return await mutate();
  }

  async function createMilestoneOptimistic(
    payload: CreateMilestoneInput
  ): Promise<Milestone> {
    const previousMilestones = data ?? [];
    const optimisticTimestamp = new Date().toISOString();
    const optimisticMilestone: Milestone = {
      id: `temp-${optimisticTimestamp}`,
      title: payload.title.trim(),
      category: payload.category,
      date: payload.date,
      createdAt: optimisticTimestamp,
      updatedAt: optimisticTimestamp
    };

    await mutate(sortMilestones([optimisticMilestone, ...previousMilestones]), false);

    try {
      const createdMilestone = await createMilestoneRequest(payload);

      await mutate((currentMilestones = []) => {
        return sortMilestones([
          createdMilestone,
          ...currentMilestones.filter((milestone) => milestone.id !== optimisticMilestone.id)
        ]);
      }, false);

      return createdMilestone;
    } catch (error) {
      await mutate(previousMilestones, false);
      throw error;
    }
  }

  async function updateMilestoneOptimistic(
    id: string,
    payload: UpdateMilestoneInput
  ): Promise<Milestone> {
    const previousMilestones = data ?? [];
    const existingMilestone = previousMilestones.find((milestone) => milestone.id === id);

    if (!existingMilestone) {
      const updatedMilestone = await updateMilestoneRequest(id, payload);
      await mutate(sortMilestones(previousMilestones), false);
      return updatedMilestone;
    }

    const optimisticMilestone: Milestone = {
      ...existingMilestone,
      title: payload.title.trim(),
      category: payload.category,
      date: payload.date,
      updatedAt: new Date().toISOString()
    };

    await mutate(
      sortMilestones(
        previousMilestones.map((milestone) => {
          return milestone.id === id ? optimisticMilestone : milestone;
        })
      ),
      false
    );

    try {
      const updatedMilestone = await updateMilestoneRequest(id, payload);

      await mutate((currentMilestones = []) => {
        return sortMilestones(
          currentMilestones.map((milestone) => {
            return milestone.id === id ? updatedMilestone : milestone;
          })
        );
      }, false);

      return updatedMilestone;
    } catch (error) {
      await mutate(previousMilestones, false);
      throw error;
    }
  }

  async function deleteMilestoneOptimistic(id: string): Promise<void> {
    const previousMilestones = data ?? [];

    await mutate(
      previousMilestones.filter((milestone) => milestone.id !== id),
      false
    );

    try {
      await deleteMilestoneRequest(id);
    } catch (error) {
      await mutate(previousMilestones, false);
      throw error;
    }
  }

  return {
    milestones: data ?? [],
    isLoading,
    isRefreshing: isValidating && !isLoading,
    errorMessage,
    refreshMilestones,
    createMilestoneOptimistic,
    updateMilestoneOptimistic,
    deleteMilestoneOptimistic
  };
}
