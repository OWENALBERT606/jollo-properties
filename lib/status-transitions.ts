import type {
  PropertyStatus,
  TransactionStatus,
  DisputeStatus,
  WorkflowStatus,
} from "@prisma/client";

export const PROPERTY_TRANSITIONS: Record<PropertyStatus, PropertyStatus[]> = {
  DRAFT: ["PENDING_APPROVAL"],
  PENDING_APPROVAL: ["ACTIVE", "DRAFT"],
  ACTIVE: ["TRANSFERRED", "DISPUTED", "ARCHIVED"],
  TRANSFERRED: [],
  DISPUTED: ["ACTIVE", "ARCHIVED"],
  ARCHIVED: [],
};

export const TRANSACTION_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  INITIATED: ["UNDER_REVIEW", "CANCELLED"],
  UNDER_REVIEW: ["APPROVED", "REJECTED", "CANCELLED"],
  APPROVED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
};

export const DISPUTE_TRANSITIONS: Record<DisputeStatus, DisputeStatus[]> = {
  FILED: ["UNDER_INVESTIGATION", "DISMISSED"],
  UNDER_INVESTIGATION: ["HEARING", "DISMISSED"],
  HEARING: ["RESOLVED", "DISMISSED"],
  RESOLVED: [],
  DISMISSED: [],
};

export const WORKFLOW_TRANSITIONS: Record<WorkflowStatus, WorkflowStatus[]> = {
  PENDING: ["APPROVED", "REJECTED", "SKIPPED"],
  APPROVED: [],
  REJECTED: [],
  SKIPPED: [],
};

/** Returns true if the (from → to) transition is allowed in the given map */
export function isValidTransition(
  map: Record<string, string[]>,
  from: string,
  to: string
): boolean {
  return (map[from] ?? []).includes(to);
}

/** Terminal statuses that should set a timestamp field */
export const WORKFLOW_TERMINAL: WorkflowStatus[] = ["APPROVED", "REJECTED", "SKIPPED"];
export const TRANSACTION_TERMINAL: TransactionStatus[] = ["COMPLETED", "REJECTED", "CANCELLED"];
export const DISPUTE_TERMINAL: DisputeStatus[] = ["RESOLVED", "DISMISSED"];
