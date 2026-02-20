import { useContext } from "react";
import { RotationContext } from "./RotationContext";

export function useRotation() {
  const context = useContext(RotationContext);
  if (!context) {
    throw new Error("useRotation must be used within <Rotation.provider>");
  }
  return context;
}
