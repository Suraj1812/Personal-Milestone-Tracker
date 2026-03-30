import type {
  CreateMilestoneInput,
  Milestone,
  UpdateMilestoneInput
} from "../types";

interface ApiErrorPayload {
  message?: string;
}

interface DeleteMilestoneResponse {
  id: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";

function buildUrl(pathname: string): string {
  return `${apiBaseUrl}${pathname}`;
}

async function parseError(response: Response): Promise<ApiError> {
  let message = "Something went wrong. Please try again.";

  try {
    const payload = (await response.json()) as ApiErrorPayload;

    if (payload.message) {
      message = payload.message;
    }
  } catch {
    if (response.status >= 500) {
      message = "The server could not save your milestone. Please try again.";
    }
  }

  return new ApiError(message, response.status);
}

export async function fetchMilestones(): Promise<Milestone[]> {
  const response = await fetch(buildUrl("/milestones"));

  if (!response.ok) {
    throw await parseError(response);
  }

  return (await response.json()) as Milestone[];
}

export async function createMilestone(
  payload: CreateMilestoneInput
): Promise<Milestone> {
  const response = await fetch(buildUrl("/milestones"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  return (await response.json()) as Milestone;
}

export async function updateMilestone(
  id: string,
  payload: UpdateMilestoneInput
): Promise<Milestone> {
  const response = await fetch(buildUrl(`/milestones/${id}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  return (await response.json()) as Milestone;
}

export async function deleteMilestone(id: string): Promise<DeleteMilestoneResponse> {
  const response = await fetch(buildUrl(`/milestones/${id}`), {
    method: "DELETE"
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  return (await response.json()) as DeleteMilestoneResponse;
}
