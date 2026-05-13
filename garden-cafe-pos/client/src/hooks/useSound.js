import { useCallback } from "react";

export function useSound() {
  const playAlert = useCallback(() => {
    try {
      const ctx = new (window.AudioContext ||
        window.webkitAudioContext)();

      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.frequency.value = 880;
      oscillator.type = "sine";
      gain.gain.value = 0.3;

      oscillator.start();

      setTimeout(() => {
        oscillator.frequency.value = 660;
      }, 150);

      setTimeout(() => {
        oscillator.stop();
        ctx.close();
      }, 400);

    } catch (err) {
      console.log("Sound not supported");
    }
  }, []);

  return { playAlert };
}