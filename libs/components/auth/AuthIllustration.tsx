import { useEffect, useRef, useState } from 'react';
import { createAuthScene } from './createAuthScene';

interface AuthIllustrationProps {
  className?: string;
}

export default function AuthIllustration({
  className = '',
}: AuthIllustrationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const desktop = window.matchMedia('(min-width: 768px)');
    let unmounted = false;
    let requestVersion = 0;
    let disposeScene: (() => void) | undefined;

    async function initializeScene() {
      if (!container || !desktop.matches) return;
      const version = ++requestVersion;

      try {
        const THREE = await import('three');
        if (unmounted || version !== requestVersion || !desktop.matches) return;

        disposeScene = createAuthScene(container, THREE, () => {
          if (!unmounted && version === requestVersion) {
            setSceneReady(false);
          }
        });
        setSceneReady(true);
      } catch {
        if (!unmounted && version === requestVersion) {
          setSceneReady(false);
        }
      }
    }

    function handleViewportChange() {
      requestVersion += 1;
      disposeScene?.();
      disposeScene = undefined;
      setSceneReady(false);
      void initializeScene();
    }

    desktop.addEventListener('change', handleViewportChange);
    void initializeScene();

    return () => {
      unmounted = true;
      requestVersion += 1;
      desktop.removeEventListener('change', handleViewportChange);
      disposeScene?.();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative h-full min-h-[320px] w-full ${className}`}
    >
      <div
        className={`absolute inset-0 overflow-hidden transition-opacity duration-500 motion-reduce:transition-none ${sceneReady ? 'opacity-0' : 'opacity-100'}`}
      >
        <div
          className="absolute top-1/2 left-1/2 size-[220px] rounded-full border-[19px] border-[#7fa4ec] border-t-[#c3d7ff] border-b-[#304b7e] shadow-[0_20px_48px_rgb(4_17_36/34%),inset_0_3px_14px_rgb(15_31_61/30%)]"
          style={{
            transform: 'translate(-50%, -50%) rotateX(20deg) rotateZ(8deg)',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 h-[92px] w-[82px] rounded-[18px] border border-[#dfebff]/50 bg-linear-140 from-[#daeaff]/95 via-[#6a97e4]/75 to-[#3159a4]/85 shadow-[16px_25px_35px_rgb(4_15_38/30%),inset_0_2px_1px_rgb(255_255_255/35%)]"
          style={{
            transform: 'translate(-91%, -76%) rotate(-10deg)',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 h-[58px] w-[50px] rounded-[13px] border border-[#dfebff]/50 bg-linear-145 from-[#698de4] via-[#365da7] to-[#244678] shadow-[16px_25px_35px_rgb(4_15_38/30%)]"
          style={{
            transform: 'translate(45%, 5%) rotate(10deg)',
          }}
        />
      </div>
      <div ref={containerRef} className="absolute inset-0" />
    </div>
  );
}
