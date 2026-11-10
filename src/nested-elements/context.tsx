import { createContext, type ReactNode } from "react";
import { NestedParent } from "./types";

/** @deprecated One item set now serves every menu; parent selection has no effect. */
export const NestedParentContext = createContext<NestedParent>(NestedParent.Dropdown);

/** @deprecated One item set now serves every menu; this provider passes children through. */
export function NestedParentProvider({ children }: { value: NestedParent; children?: ReactNode }) {
  return <>{children}</>;
}

/** @deprecated One item set now serves every menu; this hook returns the inert default. */
export const useNestedParent = (): NestedParent => NestedParent.Dropdown;
