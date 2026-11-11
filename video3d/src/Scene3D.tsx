import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Captions, type Caption} from './Captions';

// Sample captions. Replace with output from Whisper (see README).
const captions: Caption[] = [
  {text: 'Hello, ', startMs: 0, endMs: 800, timestampMs: null, confidence: null},
  {text: 'this ', startMs: 800, endMs: 1200, timestampMs: null, confidence: null},
  {text: 'is ', startMs: 1200, endMs: 1500, timestampMs: null, confidence: null},
  {text: '3D ', startMs: 1500, endMs: 2300, timestampMs: null, confidence: null},
  {text: 'with Remotion!', startMs: 2300, endMs: 4500, timestampMs: null, confidence: null},
];

const Cube: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scale = spring({frame, fps, config: {damping: 12}});
  return (
    <mesh rotation={[frame * 0.03, frame * 0.04, 0]} scale={scale * 1.5}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#4f8cff" />
    </mesh>
  );
};

export const Scene3D: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const opacity = interpolate(frame, [0, 15], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: '#0b0f1a', opacity}}>
      <ThreeCanvas width={width} height={height} camera={{position: [0, 0, 5], fov: 50}}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 5, 4]} intensity={2} />
        <Cube />
      </ThreeCanvas>
      <Captions captions={captions} />
      {/* Audio: put a file in public/ and add <Audio src={staticFile('music.mp3')} /> from @remotion/media */}
    </AbsoluteFill>
  );
};
