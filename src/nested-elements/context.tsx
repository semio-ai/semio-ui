import { createContext, useContext } from "react";
import { NestedParent } from "../types";

export const NestedParentContext = createContext<NestedParent>(NestedParent.Dropdown);

export const NestedParentProvider = NestedParentContext.Provider;

export const useNestedParent = (): NestedParent => {
  const nestedParent = useContext(NestedParentContext);
  if (!nestedParent) {
    throw new Error("useNestedParent must be used within a NestedParentProvider");
  }
  return nestedParent;
};
