// Tiny, dependency-free tones using the Web Audio API. Nothing plays
// until the user has already interacted with the page (browser autoplay
// rules are respected automatically since this only runs inside click
// handlers). Toggle is persisted so it stays off if the user turns it off.
const STORAGE_KEY = "oppSoundEnabled";

export const isSoundEnabled = () => localStorage.getItem(STORAGE_KEY) !== "off";

export const toggleSound = () => {
  const next = isSoundEnabled() ? "off" : "on";
  localStorage.setItem(STORAGE_KEY, next);
  return next === "on";
};

const playTone = (freq, duration = 0.12, type = "sine", volume = 0.05) => {
  if (!isSoundEnabled()) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
    setTimeout(() => ctx.close(), (duration + 0.05) * 1000);
  } catch (error) {
    // Web Audio unsupported/blocked — fail silently, never break the UI
  }
};

export const playSavedSound = () => playTone(660, 0.1, "sine", 0.04);
export const playAlertSound = () => playTone(880, 0.15, "triangle", 0.05);
export const playNewOpportunitySound = () => playTone(520, 0.08, "sine", 0.03);
