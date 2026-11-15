import type * as Three from 'three';

type ThreeModule = typeof import('three');

const SCULPTURE_TURN_DURATION_SECONDS = 28;
const LARGE_BLOCK_TURN_DURATION_SECONDS = 12;
const SMALL_BLOCK_TURN_DURATION_SECONDS = 8;

function createRoundedBlockGeometry(
  THREE: ThreeModule,
  width: number,
  height: number,
  depth: number,
  radius: number,
) {
  const shape = new THREE.Shape();
  const left = -width / 2;
  const bottom = -height / 2;
  const right = left + width;
  const top = bottom + height;

  shape.moveTo(left + radius, bottom);
  shape.lineTo(right - radius, bottom);
  shape.quadraticCurveTo(right, bottom, right, bottom + radius);
  shape.lineTo(right, top - radius);
  shape.quadraticCurveTo(right, top, right - radius, top);
  shape.lineTo(left + radius, top);
  shape.quadraticCurveTo(left, top, left, top - radius);
  shape.lineTo(left, bottom + radius);
  shape.quadraticCurveTo(left, bottom, left + radius, bottom);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.07,
    bevelThickness: 0.07,
    curveSegments: 16,
  });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

export function createAuthScene(
  container: HTMLDivElement,
  THREE: ThreeModule,
  onFallback: () => void,
): () => void {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 40);
  const sculpture = new THREE.Group();
  const geometries: Three.BufferGeometry[] = [];
  const materials: Three.Material[] = [];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let renderer: Three.WebGLRenderer | undefined;
  let resizeObserver: ResizeObserver | undefined;
  let visibilityObserver: IntersectionObserver | undefined;
  let largeBlock: Three.Mesh | undefined;
  let smallBlock: Three.Mesh | undefined;
  let animationFrame = 0;
  let previousFrameTime: number | null = null;
  let elapsedSeconds = 0;
  let visible = false;
  let hasSize = false;
  let disposed = false;

  function draw() {
    if (renderer && hasSize && !disposed) {
      renderer.render(scene, camera);
    }
  }

  function updatePose(time: number) {
    const fullTurn = Math.PI * 2;
    const sculptureRotation =
      (time / SCULPTURE_TURN_DURATION_SECONDS) * fullTurn;
    sculpture.rotation.set(0.05, -0.12 + sculptureRotation, 0.02);

    // Each block spins around its fixed center while the parent sculpture turns.
    if (largeBlock) {
      const largeBlockRotation =
        (time / LARGE_BLOCK_TURN_DURATION_SECONDS) * fullTurn;
      largeBlock.rotation.set(0.2, -0.35 + largeBlockRotation, -0.19);
    }

    if (smallBlock) {
      const smallBlockRotation =
        (time / SMALL_BLOCK_TURN_DURATION_SECONDS) * fullTurn;
      smallBlock.rotation.set(-0.25, 0.35 - smallBlockRotation, 0.2);
    }
  }

  function canAnimate() {
    return (
      !disposed &&
      visible &&
      hasSize &&
      !document.hidden &&
      !reducedMotion.matches
    );
  }

  function animate(timestamp: number) {
    animationFrame = 0;
    if (!canAnimate()) {
      previousFrameTime = null;
      return;
    }

    if (previousFrameTime !== null) {
      elapsedSeconds += Math.min((timestamp - previousFrameTime) / 1000, 0.05);
    }
    previousFrameTime = timestamp;
    updatePose(elapsedSeconds);
    draw();
    animationFrame = window.requestAnimationFrame(animate);
  }

  function syncAnimation() {
    window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    // Reset the clock when resuming so tab changes cannot make the scene jump.
    previousFrameTime = null;
    if (canAnimate()) {
      animationFrame = window.requestAnimationFrame(animate);
    }
  }

  function resize() {
    if (!renderer || disposed) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    hasSize = width > 0 && height > 0;
    if (hasSize) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(width, height, false);
      draw();
    }
    syncAnimation();
  }

  function handleMotionPreference() {
    if (reducedMotion.matches) {
      elapsedSeconds = 0;
      updatePose(0);
      draw();
    }
    syncAnimation();
  }

  function dispose() {
    if (disposed) return;
    disposed = true;

    window.cancelAnimationFrame(animationFrame);
    resizeObserver?.disconnect();
    visibilityObserver?.disconnect();
    document.removeEventListener('visibilitychange', syncAnimation);
    reducedMotion.removeEventListener('change', handleMotionPreference);
    renderer?.domElement.removeEventListener(
      'webglcontextlost',
      handleContextLost,
    );

    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    scene.clear();
    renderer?.dispose();
    renderer?.forceContextLoss();
    renderer?.domElement.remove();
  }

  function handleContextLost(event: Event) {
    event.preventDefault();
    dispose();
    onFallback();
  }

  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    renderer.domElement.className = 'absolute inset-0 h-full w-full';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    container.appendChild(renderer.domElement);

    camera.position.set(0.2, 0.6, 7.2);
    camera.lookAt(0, 0, 0);
    scene.add(new THREE.HemisphereLight(0xc6e0ff, 0x142238, 2.8));

    const keyLight = new THREE.DirectionalLight(0xe6f1ff, 5);
    keyLight.position.set(-3, 5, 5);
    scene.add(keyLight);

    const edgeLight = new THREE.DirectionalLight(0x547dff, 4);
    edgeLight.position.set(4, 1, -2);
    scene.add(edgeLight);

    const glass = new THREE.MeshPhysicalMaterial({
      color: 0x96b7ef,
      metalness: 0.25,
      roughness: 0.16,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      transparent: true,
      opacity: 0.91,
    });
    materials.push(glass);

    const blue = new THREE.MeshPhysicalMaterial({
      color: 0x345edb,
      metalness: 0.36,
      roughness: 0.2,
      clearcoat: 1,
    });
    materials.push(blue);

    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0x6d95e6,
      metalness: 0.6,
      roughness: 0.24,
    });
    materials.push(ringMaterial);

    const blockGeometry = createRoundedBlockGeometry(THREE, 0.9, 1, 0.4, 0.16);
    geometries.push(blockGeometry);
    largeBlock = new THREE.Mesh(blockGeometry, glass);
    largeBlock.position.set(-0.5, 0.28, 0);
    largeBlock.rotation.set(0.2, -0.35, -0.19);
    sculpture.add(largeBlock);

    const smallBlockGeometry = createRoundedBlockGeometry(
      THREE,
      0.48,
      0.58,
      0.28,
      0.12,
    );
    geometries.push(smallBlockGeometry);
    smallBlock = new THREE.Mesh(smallBlockGeometry, blue);
    smallBlock.position.set(0.7, -0.43, 0);
    smallBlock.rotation.set(-0.25, 0.35, 0.2);
    sculpture.add(smallBlock);

    const ringGeometry = new THREE.TorusGeometry(1.55, 0.13, 24, 96);
    geometries.push(ringGeometry);
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.set(0.35, -0.1, 0.05);
    ring.position.set(0, 0, 0);
    sculpture.add(ring);
    scene.add(sculpture);
    updatePose(0);

    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      syncAnimation();
    });
    visibilityObserver.observe(container);
    document.addEventListener('visibilitychange', syncAnimation);
    reducedMotion.addEventListener('change', handleMotionPreference);
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    resize();

    return dispose;
  } catch (error) {
    dispose();
    throw error;
  }
}
