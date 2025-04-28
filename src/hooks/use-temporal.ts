interface TemporalProps {
  ms?: number;
  framerate: number;
  onChange?: (value: number) => void;
}

interface TemporalState {
  seconds: number;
  frames: number;
  secondsAndFrames: {
    seconds: number;
    frames: number;
  };
  updateSeconds: (seconds: number) => void;
  updateFrames: (frames: number) => void;
  updatePairedSeconds: (seconds: number) => void;
  updatePairedFrames: (frames: number) => void;
}

export const useTemporal = ({
  ms = 0,
  framerate,
  onChange = () => {},
}: TemporalProps): TemporalState => {
  return {
    ...msToFields(ms, framerate),
    updateSeconds(seconds: number) {
      onChange(seconds * 1000);
    },
    updateFrames(frames: number) {
      onChange((frames / framerate) * 1000);
    },
    updatePairedSeconds(seconds: number) {
      const { frames: prevFrames } = msToFields(ms, framerate);
      onChange(seconds * 1000 + (prevFrames / framerate) * 1000);
    },
    updatePairedFrames(frames: number) {
      const { seconds: prevSeconds } = msToFields(ms, framerate);
      onChange(prevSeconds * 1000 + (frames / framerate) * 1000);
    },
  };
};

const msToFields = (ms: number, framerate: number) => ({
  seconds: ms / 1000,
  frames: (ms / 1000) * framerate,
  secondsAndFrames: {
    seconds: Math.floor(ms / 1000),
    frames: (ms / 1000 - Math.floor(ms / 1000)) * framerate,
  },
});
