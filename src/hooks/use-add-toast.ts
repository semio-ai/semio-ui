import { useContext } from "react";
import { ToastContext, ToastData } from "../floating/toast";

/**
 * A hook used to add a toast to the toast context. Must be used within a ToastManager context.
 * @returns A function that adds a toast to the toast context.
 */
export function useAddToast(): (data: ToastData) => void {
  const { addToast } = useContext(ToastContext);
  if (!addToast) throw new Error("Missing ToastContext Provider in the tree");
  return addToast;
}
