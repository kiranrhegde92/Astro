import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

type ZodiacThreeSceneProps = {
  variant?: 'console' | 'page';
};

const canvasStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  display: 'block',
  pointerEvents: 'none',
};

const pageCanvasStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  width: '100vw',
  height: '100vh',
  display: 'block',
  pointerEvents: 'none',
  zIndex: 0,
};

export function ZodiacThreeScene({ variant = 'console' }: ZodiacThreeSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isPageScene = variant === 'page';

  useEffect(() => {
    if (Platform.OS !== 'web' || !canvasRef.current) return;

    let cancelled = false;
    let stop: (() => void) | undefined;

    import('three').then((THREE) => {
      if (cancelled || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(isPageScene ? 42 : 38, 1, 0.1, 100);
      camera.position.set(isPageScene ? 0.15 : 0, isPageScene ? 0.18 : 0.2, isPageScene ? 7.2 : 5.6);

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isPageScene ? 1.35 : 1.5));

      const geometries: { dispose: () => void }[] = [];
      const materials: { dispose: () => void }[] = [];
      const rememberGeometry = <T extends { dispose: () => void }>(geometry: T) => {
        geometries.push(geometry);
        return geometry;
      };
      const rememberMaterial = <T extends { dispose: () => void }>(material: T) => {
        materials.push(material);
        return material;
      };

      const stage = new THREE.Group();
      scene.add(stage);

      const root = new THREE.Group();
      root.position.set(isPageScene ? 1.75 : 0, isPageScene ? 0.12 : 0, isPageScene ? -0.35 : 0);
      root.scale.setScalar(isPageScene ? 1.16 : 1);
      root.rotation.x = isPageScene ? -0.42 : -0.34;
      root.rotation.z = -0.08;
      stage.add(root);

      const amber = new THREE.Color('#ff8a5b');
      const iris = new THREE.Color('#7367ff');
      const tide = new THREE.Color('#12c8b2');
      const ink = new THREE.Color('#17182d');
      const paper = new THREE.Color('#fff8f2');

      const keyLight = new THREE.PointLight(0xffd5a3, isPageScene ? 4.4 : 3.2, 12);
      keyLight.position.set(2.5, 3.2, 4.5);
      scene.add(keyLight);

      const rimLight = new THREE.PointLight(0x7367ff, isPageScene ? 3 : 2.2, 10);
      rimLight.position.set(-3.5, -1.5, 3);
      scene.add(rimLight);

      const tealLight = new THREE.PointLight(0x12c8b2, isPageScene ? 2.1 : 0.6, 12);
      tealLight.position.set(-3.9, 2.4, 1.7);
      scene.add(tealLight);

      scene.add(new THREE.AmbientLight(0xffffff, isPageScene ? 1.05 : 1.25));

      const orbMaterial = rememberMaterial(new THREE.MeshPhysicalMaterial({
        color: ink,
        metalness: 0.38,
        roughness: 0.28,
        clearcoat: 0.8,
        clearcoatRoughness: 0.2,
        emissive: new THREE.Color('#24284a'),
        emissiveIntensity: 0.28,
      }));
      const orb = new THREE.Mesh(rememberGeometry(new THREE.IcosahedronGeometry(0.72, 3)), orbMaterial);
      root.add(orb);

      const ringMaterials = [
        rememberMaterial(new THREE.MeshBasicMaterial({ color: iris, transparent: true, opacity: isPageScene ? 0.86 : 0.72 })),
        rememberMaterial(new THREE.MeshBasicMaterial({ color: amber, transparent: true, opacity: isPageScene ? 0.76 : 0.64 })),
        rememberMaterial(new THREE.MeshBasicMaterial({ color: tide, transparent: true, opacity: isPageScene ? 0.68 : 0.58 })),
        rememberMaterial(new THREE.MeshBasicMaterial({ color: ink, transparent: true, opacity: isPageScene ? 0.26 : 0.18 })),
      ];

      const rings = [
        new THREE.Mesh(rememberGeometry(new THREE.TorusGeometry(1.52, 0.012, 16, 180)), ringMaterials[0]),
        new THREE.Mesh(rememberGeometry(new THREE.TorusGeometry(2.02, 0.01, 16, 180)), ringMaterials[1]),
        new THREE.Mesh(rememberGeometry(new THREE.TorusGeometry(2.46, 0.008, 12, 180)), ringMaterials[2]),
        new THREE.Mesh(rememberGeometry(new THREE.TorusGeometry(2.88, 0.006, 12, 180)), ringMaterials[3]),
      ];

      rings[0].rotation.x = Math.PI / 2.15;
      rings[1].rotation.x = Math.PI / 2.7;
      rings[1].rotation.y = 0.42;
      rings[2].rotation.x = Math.PI / 1.95;
      rings[2].rotation.y = -0.34;
      rings[3].rotation.x = Math.PI / 2.2;
      rings[3].rotation.z = 0.18;
      rings.forEach((ring) => root.add(ring));

      const beadGeo = rememberGeometry(new THREE.SphereGeometry(0.065, 20, 20));
      const beadMaterials = [
        rememberMaterial(new THREE.MeshStandardMaterial({ color: amber, emissive: amber, emissiveIntensity: 0.22 })),
        rememberMaterial(new THREE.MeshStandardMaterial({ color: iris, emissive: iris, emissiveIntensity: 0.18 })),
        rememberMaterial(new THREE.MeshStandardMaterial({ color: tide, emissive: tide, emissiveIntensity: 0.2 })),
        rememberMaterial(new THREE.MeshStandardMaterial({ color: paper, emissive: paper, emissiveIntensity: 0.12 })),
      ];

      const beads = beadMaterials.map((material, index) => {
        const bead = new THREE.Mesh(beadGeo, material);
        const angle = index * Math.PI * 0.5 + 0.4;
        const radius = 2.02 + index * 0.18;
        bead.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.22, Math.sin(angle) * radius);
        root.add(bead);
        return bead;
      });

      const markerGeometry = rememberGeometry(new THREE.OctahedronGeometry(0.075, 1));
      const markerMaterial = rememberMaterial(
        new THREE.MeshStandardMaterial({
          color: paper,
          emissive: amber,
          emissiveIntensity: 0.16,
          roughness: 0.32,
          metalness: 0.18,
          transparent: true,
          opacity: isPageScene ? 0.82 : 0.46,
        }),
      );
      const markers = Array.from({ length: isPageScene ? 12 : 6 }, (_, index) => {
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        const angle = (index / (isPageScene ? 12 : 6)) * Math.PI * 2;
        marker.position.set(Math.cos(angle) * 3.28, Math.sin(angle) * 0.36, Math.sin(angle) * 3.28);
        marker.rotation.set(angle * 0.28, angle, -angle * 0.18);
        root.add(marker);
        return marker;
      });

      const lowerRing = new THREE.Group();
      lowerRing.position.set(-2.75, -2.08, -1.25);
      lowerRing.rotation.set(-0.58, 0.2, 0.35);
      lowerRing.scale.setScalar(1.1);
      if (isPageScene) {
        stage.add(lowerRing);
        const lowerMaterials = [
          rememberMaterial(new THREE.MeshBasicMaterial({ color: amber, transparent: true, opacity: 0.22 })),
          rememberMaterial(new THREE.MeshBasicMaterial({ color: tide, transparent: true, opacity: 0.18 })),
        ];
        const lowerRings = [
          new THREE.Mesh(rememberGeometry(new THREE.TorusGeometry(1.7, 0.01, 14, 180)), lowerMaterials[0]),
          new THREE.Mesh(rememberGeometry(new THREE.TorusGeometry(2.18, 0.008, 14, 180)), lowerMaterials[1]),
          new THREE.Mesh(rememberGeometry(new THREE.TorusGeometry(2.72, 0.006, 12, 180)), lowerMaterials[0]),
        ];
        lowerRings[0].rotation.x = Math.PI / 2.4;
        lowerRings[1].rotation.x = Math.PI / 2.05;
        lowerRings[1].rotation.y = -0.3;
        lowerRings[2].rotation.x = Math.PI / 2.8;
        lowerRings.forEach((ring) => lowerRing.add(ring));
      }

      const starCount = isPageScene ? 320 : 140;
      const starPositions = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i += 1) {
        const spread = isPageScene ? 10.8 : 5.2;
        starPositions[i * 3] = (Math.random() - 0.5) * spread;
        starPositions[i * 3 + 1] = (Math.random() - 0.5) * spread * (isPageScene ? 0.86 : 0.68);
        starPositions[i * 3 + 2] = -1.2 - Math.random() * (isPageScene ? 5.4 : 2.4);
      }
      const starGeo = rememberGeometry(new THREE.BufferGeometry());
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      const starMaterial = rememberMaterial(new THREE.PointsMaterial({
        color: 0xffffff,
        size: isPageScene ? 0.016 : 0.018,
        transparent: true,
        opacity: isPageScene ? 0.72 : 0.6,
      }));
      const stars = new THREE.Points(starGeo, starMaterial);
      stage.add(stars);

      let constellation: { rotation: { z: number } } | undefined;
      if (isPageScene) {
        const lineCount = 26;
        const linePositions = new Float32Array(lineCount * 6);
        for (let i = 0; i < lineCount; i += 1) {
          const x = -4.8 + Math.random() * 9.6;
          const y = -2.2 + Math.random() * 4.4;
          const z = -3.6 - Math.random() * 2.8;
          linePositions[i * 6] = x;
          linePositions[i * 6 + 1] = y;
          linePositions[i * 6 + 2] = z;
          linePositions[i * 6 + 3] = x + (Math.random() - 0.5) * 1.2;
          linePositions[i * 6 + 4] = y + (Math.random() - 0.5) * 0.7;
          linePositions[i * 6 + 5] = z + (Math.random() - 0.5) * 0.5;
        }
        const lineGeo = rememberGeometry(new THREE.BufferGeometry());
        lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
        const lineMaterial = rememberMaterial(
          new THREE.LineBasicMaterial({ color: 0xffd5a3, transparent: true, opacity: 0.16 }),
        );
        const constellationLine = new THREE.LineSegments(lineGeo, lineMaterial);
        constellation = constellationLine;
        stage.add(constellationLine);
      }

      const resize = () => {
        const bounds = canvas.parentElement?.getBoundingClientRect();
        const width = Math.max(1, Math.floor(isPageScene ? window.innerWidth : bounds?.width || 1));
        const height = Math.max(1, Math.floor(isPageScene ? window.innerHeight : bounds?.height || 1));
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };

      const resizeObserver = new ResizeObserver(resize);
      if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);
      window.addEventListener('resize', resize);
      resize();

      const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      let frame = 0;
      let raf = 0;
      const animate = () => {
        frame += prefersReducedMotion ? 0.002 : isPageScene ? 0.0065 : 0.01;
        const scrollProgress = isPageScene
          ? Math.min(1, window.scrollY / Math.max(1, window.innerHeight * 1.35))
          : 0;

        stage.rotation.x = isPageScene ? -0.03 + scrollProgress * 0.09 : 0;
        stage.rotation.y = isPageScene ? -0.06 + scrollProgress * 0.12 : 0;
        root.rotation.y = frame * (isPageScene ? 0.26 : 0.38) + scrollProgress * 0.55;
        root.rotation.z = -0.08 + Math.sin(frame * 0.9) * 0.035;
        orb.rotation.x += prefersReducedMotion ? 0.001 : 0.006;
        orb.rotation.y += prefersReducedMotion ? 0.0015 : 0.01;
        rings[0].rotation.z -= prefersReducedMotion ? 0.001 : 0.0038;
        rings[1].rotation.z += prefersReducedMotion ? 0.0008 : 0.0028;
        rings[2].rotation.z -= prefersReducedMotion ? 0.0006 : 0.0022;
        rings[3].rotation.z += prefersReducedMotion ? 0.0005 : 0.0016;
        beads.forEach((bead, index) => {
          bead.scale.setScalar(1 + Math.sin(frame * 2.2 + index) * 0.18);
        });
        markers.forEach((marker, index) => {
          marker.rotation.y += 0.002 + index * 0.00008;
        });
        lowerRing.rotation.z += isPageScene ? 0.0012 : 0;
        if (constellation) constellation.rotation.z -= 0.00028;
        stars.rotation.z += isPageScene ? 0.00036 : 0.0007;
        if (isPageScene) {
          camera.position.x = 0.15 + scrollProgress * 0.24;
          camera.position.y = 0.18 - scrollProgress * 0.56;
          camera.lookAt(0.15, -0.08 - scrollProgress * 0.32, -0.25);
        }
        renderer.render(scene, camera);
        raf = window.requestAnimationFrame(animate);
      };
      animate();

      stop = () => {
        window.cancelAnimationFrame(raf);
        resizeObserver.disconnect();
        window.removeEventListener('resize', resize);
        renderer.dispose();
        geometries.forEach((geometry) => geometry.dispose());
        materials.forEach((material) => material.dispose());
      };
    });

    return () => {
      cancelled = true;
      stop?.();
    };
  }, [isPageScene]);

  if (Platform.OS !== 'web') return null;

  return React.createElement('canvas' as any, {
    ref: canvasRef,
    style: isPageScene ? pageCanvasStyle : canvasStyle,
    'aria-hidden': true,
  });
}
