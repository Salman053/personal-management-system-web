"use client";

import { Button } from "@/components/ui/button";
import { useCooldownButton } from "@/hooks/useCoolDownButton";

interface CooldownButtonProps {
  label: string;
  cooldownMs: number;
  storageKey: string;
  onClick: () => Promise<void> | void;
}

export function CooldownButton({
  label,
  cooldownMs,
  storageKey,
  onClick,
}: CooldownButtonProps) {
  const { isDisabled, remaining, trigger } = useCooldownButton(
    storageKey,
    cooldownMs
  );

  const handleClick = async () => {
    await onClick();
    trigger(); // start cooldown
  };

  return (
    <Button onClick={handleClick} disabled={isDisabled}>
      {isDisabled ? `Wait ${Math.ceil(remaining / 60)} min` : label}
    </Button>
  );
}
