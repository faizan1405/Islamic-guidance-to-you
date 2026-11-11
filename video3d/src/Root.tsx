import {Composition} from 'remotion';
import {Scene3D} from './Scene3D';

export const Root: React.FC = () => (
  <>
    <Composition
      id="Scene3D"
      component={Scene3D}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
