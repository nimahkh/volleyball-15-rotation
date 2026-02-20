import { useState } from "react";
import type { Players, RoleKey } from "../constants/roles";

const DEFAULT_FORM: Record<RoleKey, string> = {
  OH1: "OH1",
  OH2: "OH2",
  Opp: "Opp",
  Setter: "Setter",
  MB1: "MB1",
  MB2: "MB2",
  Libero: "Libero",
};

export function useLineupForm(onSubmitPlayers: (players: Players) => void) {
  const [form, setForm] = useState<Record<RoleKey, string>>(DEFAULT_FORM);

  function submitForm(event: React.FormEvent) {
    event.preventDefault();
    const allFilled = (Object.keys(form) as RoleKey[]).every(
      (key) => form[key].trim().length > 0,
    );

    if (!allFilled) {
      alert("Please enter all 7 player names.");
      return;
    }

    onSubmitPlayers(form);
  }

  return {
    form,
    setForm,
    submitForm,
  };
}
