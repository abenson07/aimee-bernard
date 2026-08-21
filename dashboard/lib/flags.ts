import "server-only";

/**
 * Phase 1 is pure intake: Aimee uploads, nothing gets sorted. Categories and
 * the refinement quiz are defined separately and switched on later, when we
 * come back through the already-uploaded material.
 *
 * Off unless CATEGORIZATION_ENABLED is exactly "true".
 */
export const categorizationEnabled = process.env.CATEGORIZATION_ENABLED === "true";
