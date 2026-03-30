import useSWR from "swr";
import { fetchMilestones } from "../api/milestones";
import type { Milestone } from "../types";

export interface UseMilestonesResult {
  milestones: Milestone[];
  isLoading: boolean;
  isRefreshing: boolean;
  errorMessage: string | null;
  refreshMilestones: () => Promise<Milestone[] | undefined>;
  syncCreatedMilestone: (milestone: Milestone) => Promise<Milestone[] | undefined>;
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

  async function syncCreatedMilestone(
    milestone: Milestone
  ): Promise<Milestone[] | undefined> {
    return await mutate((currentMilestones = []) => {
      return [milestone, ...currentMilestones];
    }, false);
  }

  return {
    milestones: data ?? [],
    isLoading,
    isRefreshing: isValidating && !isLoading,
    errorMessage,
    refreshMilestones,
    syncCreatedMilestone
  };
}
