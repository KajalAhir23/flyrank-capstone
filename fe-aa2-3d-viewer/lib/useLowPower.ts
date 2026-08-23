'use client';

import { useEffect, useState } from 'react';

/**
 * Cheap heuristic for "this device probably shouldn't render WebGL by default":
 * low core count, low reported memory, or the user has Data Saver on.
 * Not exact — just enough signal to default to the static fallback.
 */
export function useLowPower(): boolean {
  const [lowPower, setLowPower] = useState(false);

  useEffect(() => {
    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
    };

    const lowCores = (nav.hardwareConcurrency ?? 8) <= 2;
    const lowMemory = (nav.deviceMemory ?? 8) <= 2;
    const saveData = Boolean(nav.connection?.saveData);

    setLowPower(lowCores || lowMemory || saveData);
  }, []);

  return lowPower;
}
