export type SoundEvent = "click" | "purchase" | "unlock";

export interface AudioController {
  play: (event: SoundEvent, enabled: boolean) => void;
}

// Structure for a future WebAudio layer. It is intentionally a no-op for now.
export function createAudioController(): AudioController {
  return {
    play: (event: SoundEvent, enabled: boolean) => {
      void event;
      void enabled;
      // Reserved for future sound implementation.
    },
  };
}
