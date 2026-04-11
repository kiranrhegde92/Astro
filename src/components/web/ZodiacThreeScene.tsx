import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

const canvasStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  display: 'block',
  pointerEvents: 'none',
};

export function ZodiacThreeScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || !canvasRef.current) return;

    let cancelled = false;
    let stop: (() => void) | undefined;

    import('three').then((THREE) => {
      if (cancelled || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
      camera.position.set(0, 0.2, 5.6);

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

      const root = new THREE.Group();
      root.rotation.x = -0.34;
      root.rotation.z = -0.08;
      scene.add(root);

      const amber = new THREE.Color('#ff8a5b');
      const iris = new THREE.Color('#7367ff');
      const tide = new THREE.Color('#12c8b2');
      const ink = new THREE.Color('#17182d');
      const paper = new THREE.Color('#fff8f2');

      const keyLight = new THREE.PointLight(0xffd5a3, 3.2, 10);
      keyLight.position.set(2.5, 3.2, 4.5);
      scene.add(keyLight);

      const rimLight = new THREE.PointLight(0x7367ff, 2.2, 8);
      rimLight.position.set(-3.5, -1.5, 3);
      scene.add(rimLight);

      scene.add(new THREE.AmbientLight(0xffffff, 1.25));

      const orbMaterial = new THREE.MeshPhysicalMaterial({
        color: ink,
        metalness: 0.38,
        roughness: 0.28,
        clearcoat: 0.8,
        clearcoatRoughness: 0.2,
        emissive: new THREE.Color('#24284a'),
        emissiveIntensity: 0.28,
      });
      const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.72, 3), orbMaterial);
      root.add(orb);

      const ringMaterials = [
        new THREE.MeshBasicMaterial({ color: iris, transparent: true, opacity: 0.72 }),
        new THREE.MeshBasicMaterial({ color: amber, transparent: true, opacity: 0.64 }),
        new THREE.MeshBasicMaterial({ color: tide, transparent: true, opacity: 0.58 }),
        new THREE.MeshBasicMaterial({ color: ink, transparent: true, opacity: 0.18 }),
      ];

      const rings = [
        new THREE.Mesh(new THREE.TorusGeometry(1.52, 0.012, 16, 180), ringMaterials[0]),
        new THREE.Mesh(new THREE.TorusGeometry(2.02, 0.01, 16, 180), ringMaterials[1]),
        new THREE.Mesh(new THREE.TorusGeometry(2.46, 0.008, 12, 180), ringMaterials[2]),
        new THREE.Mesh(new THREE.TorusGeometry(2.88, 0.006, 12, 180), ringMaterials[3]),
      ];

      rings[0].rotation.x = Math.PI / 2.15;
      rings[1].rotation.x = Math.PI / 2.7;
      rings[1].rotation.y = 0.42;
      rings[2].rotation.x = Math.PI / 1.95;
      rings[2].rotation.y = -0.34;
      rings[3].rotation.x = Math.PI / 2.2;
      rings[3].rotation.z = 0.18;
      rings.forEach((ring) => root.add(ring));

      const beadGeo = new THREE.SphereGeometry(0.065, 20, 20);
      const beadMaterials = [
        new THREE.MeshStandardMaterial({ color: amber, emissive: amber, emissiveIntensity: 0.22 }),
        new THREE.MeshStandardMaterial({ color: iris, emissive: iris, emissiveIntensity: 0.18 }),
        new THREE.MeshStandardMaterial({ color: tide, emissive: tide, emissiveIntensity: 0.2 }),
        new THREE.MeshStandardMaterial({ color: paper, emissive: paper, emissiveIntensity: 0.12 }),
      ];

      const beads = beadMaterials.map((material, index) => {
        const bead = new THREE.Mesh(beadGeo, material);
        const angle = index * Math.PI * 0.5 + 0.4;
        const radius = 2.02 + index * 0.18;
        bead.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.22, Math.sin(angle) * radius);
        root.add(bead);
        return bead;
      });

      const starCount = 140;
      const starPositions = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i += 1) {
        const spread = 5.2;
        starPositions[i * 3] = (Math.random() - 0.5) * spread;
        starPositions[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.68;
        starPositions[i * 3 + 2] = -1.2 - Math.random() * 2.4;
      }
      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.018,
        transparent: true,
        opacity: 0.6,
      });
      const stars = new THREE.Points(starGeo, starMaterial);
      scene.add(stars);

      const resize = () => {
        const bounds = canvas.parentElement?.getBoundingClientRect();
        const width = Math.max(1, Math.floor(bounds?.width || 1));
        const height = Math.max(1, Math.floor(bounds?.height || 1));
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };

      const resizeObserver = new ResizeObserver(resize);
      if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);
      resize();

      let frame = 0;
      let raf = 0;
      const animate = () => {
        frame += 0.01;
        root.rotation.y = frame * 0.38;
        root.rotation.z = -0.08 + Math.sin(frame * 0.9) * 0.035;
        orb.rotation.x += 0.006;
        orb.rotation.y += 0.01;
        rings[0].rotation.z -= 0.0038;
        rings[1].rotation.z += 0.0028;
        rings[2].rotation.z -= 0.0022;
        rings[3].rotation.z += 0.0016;
        beads.forEach((bead, index) => {
          bead.scale.setScalar(1 + Math.sin(frame * 2.2 + index) * 0.18);
        });
        stars.rotation.z += 0.0007;
        renderer.render(scene, camera);
        raf = window.requestAnimationFrame(animate);
      };
      animate();

      stop = () => {
        window.cancelAnimationFrame(raf);
        resizeObserver.disconnect();
        renderer.dispose();
        orb.geometry.dispose();
        orbMaterial.dispose();
        rings.forEach((ring) => {
          ring.geometry.dispose();
        });
        ringMaterials.forEach((material) => material.dispose());
        beadGeo.dispose();
        beadMaterials.forEach((material) => material.dispose());
        starGeo.dispose();
        starMaterial.dispose();
      };
    });

    return () => {
      cancelled = true;
      stop?.();
    };
  }, []);

  if (Platform.OS !== 'web') return null;

  return React.createElement('canvas' as any, {
    ref: canvasRef,
    style: canvasStyle,
    'aria-hidden': true,
  });
}
