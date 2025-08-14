/**
 * Standard interface for components that might need tooltip context
 */
export interface WithTooltipContextProps {
  /** Skip providing tooltip context (assume parent provides) */
  skipTooltipContext?: boolean;
}

/**
 * Re-export generic utilities from utils package for convenience
 */
export {
  createContextSolution,
  withOptionalContext,
  createContextHook,
  createContextProvider,
  composeContexts,
  useOptionalContext,
  createContextChecker,
  type ContextConfig,
  type ContextSolutionConfig,
  type OptionalContextProps,
} from "@semio/utils";
