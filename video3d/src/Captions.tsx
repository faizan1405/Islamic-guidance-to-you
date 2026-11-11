import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Caption} from '@remotion/captions';

export type {Caption};

export const Captions: React.FC<{captions: Caption[]}> = ({captions}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const timeMs = (frame / fps) * 1000;
  const current = captions.filter((c) => c.startMs <= timeMs);
  if (current.length === 0) return null;

  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 120}}>
      <div style={{fontFamily: 'sans-serif', fontSize: 72, fontWeight: 800, color: 'white', whiteSpace: 'pre'}}>
        {current.map((c) => (
          <span key={c.startMs} style={{color: timeMs < c.endMs ? '#ffd84a' : 'white'}}>
            {c.text}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};
