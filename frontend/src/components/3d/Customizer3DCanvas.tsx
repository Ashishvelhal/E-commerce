import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Stage,
  Text,
  Center,
  ContactShadows,
  Float,
  Html,
} from '@react-three/drei';
import * as THREE from 'three';
import {
  useCustomizerStore,
  RESIN_FINISHES,
  TextFinish,
  CustomizerShape,
} from '../../store/useCustomizerStore';
import { Loader2, Camera, RotateCcw, Sparkles as SparklesIcon, Sun, Moon, Eye } from 'lucide-react';

const TEXT_MATERIAL_COLORS: Record<TextFinish, { color: string; metalness: number; roughness: number }> = {
  gold: { color: '#f59e0b', metalness: 0.95, roughness: 0.12 },
  silver: { color: '#e2e8f0', metalness: 0.92, roughness: 0.15 },
  'rose-gold': { color: '#fb7185', metalness: 0.9, roughness: 0.18 },
  white: { color: '#ffffff', metalness: 0.2, roughness: 0.3 },
};

// Procedural Flakes Inclusions Component
const GoldFlakesParticles: React.FC<{ density?: number; color?: string; shape: CustomizerShape }> = ({
  density = 60,
  color = '#fbbf24',
  shape,
}) => {
  const points = useMemo(() => {
    const coords: [number, number, number][] = [];
    const count = shape === 'keychain-initial' ? 25 : density;
    const maxRadius = shape === 'keychain-initial' ? 0.6 : shape === 'frame-photo' ? 0.9 : 1.35;

    for (let i = 0; i < count; i++) {
      const radius = Math.random() * maxRadius;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * 0.12;
      coords.push([x, y, z]);
    }
    return coords;
  }, [density, shape]);

  return (
    <group>
      {points.map(([x, y, z], i) => (
        <mesh
          key={i}
          position={[x, y, z]}
          rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
          scale={shape === 'keychain-initial' ? 0.015 + Math.random() * 0.02 : 0.025 + Math.random() * 0.035}
        >
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial
            color={color}
            metalness={0.98}
            roughness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

// Real Dried Botanical Flower Petals Component
const FlowerPetalsInclusion: React.FC<{ shape: CustomizerShape }> = ({ shape }) => {
  const petals = useMemo(() => {
    const list: { pos: [number, number, number]; rot: [number, number, number]; color: string; scale: number }[] = [];
    const petalColors = ['#fda4af', '#f43f5e', '#fed7aa', '#fbcfe8', '#fef08a', '#c084fc'];
    const count = shape === 'keychain-initial' ? 8 : shape === 'frame-photo' ? 24 : 16;

    for (let i = 0; i < count; i++) {
      let x = 0;
      let z = 0;
      if (shape === 'frame-photo') {
        // Form an ornate border around the photo window
        const t = (i / count) * 4;
        if (t < 1) {
          x = -0.85 + t * 1.7;
          z = -1.1;
        } else if (t < 2) {
          x = 0.85;
          z = -1.1 + (t - 1) * 2.2;
        } else if (t < 3) {
          x = 0.85 - (t - 2) * 1.7;
          z = 1.1;
        } else {
          x = -0.85;
          z = 1.1 - (t - 3) * 2.2;
        }
      } else if (shape === 'keychain-initial') {
        const angle = (i / count) * Math.PI * 2;
        x = Math.cos(angle) * 0.4;
        z = Math.sin(angle) * 0.4;
      } else {
        const radius = 0.5 + Math.random() * 0.7;
        const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;
      }

      list.push({
        pos: [x, (Math.random() - 0.5) * 0.08, z],
        rot: [Math.PI / 2 + (Math.random() - 0.5) * 0.2, 0, Math.random() * Math.PI * 2],
        color: petalColors[i % petalColors.length],
        scale: shape === 'keychain-initial' ? 0.04 + Math.random() * 0.03 : 0.07 + Math.random() * 0.05,
      });
    }
    return list;
  }, [shape]);

  return (
    <group>
      {petals.map((p, i) => (
        <mesh key={i} position={p.pos} rotation={p.rot} scale={p.scale}>
          <circleGeometry args={[1, 12]} />
          <meshStandardMaterial
            color={p.color}
            roughness={0.4}
            metalness={0.05}
            side={THREE.DoubleSide}
            transparent
            opacity={0.92}
          />
        </mesh>
      ))}
    </group>
  );
};

// Raw Quartz Crystals Perimeter Component
const QuartzCrystalsRim: React.FC<{ shape: CustomizerShape }> = ({ shape }) => {
  const crystals = useMemo(() => {
    const list: { pos: [number, number, number]; rot: [number, number, number]; scale: [number, number, number] }[] = [];
    const count = shape === 'keychain-initial' ? 14 : 26;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      let x = 0;
      let z = 0;

      if (shape === 'nameplate-rect') {
        const t = (i / count) * 4;
        if (t < 1) {
          x = -1.6 + t * 3.2;
          z = -0.75;
        } else if (t < 2) {
          x = 1.6;
          z = -0.75 + (t - 1) * 1.5;
        } else if (t < 3) {
          x = 1.6 - (t - 2) * 3.2;
          z = 0.75;
        } else {
          x = -1.6;
          z = 0.75 - (t - 3) * 1.5;
        }
      } else if (shape === 'keychain-initial') {
        x = Math.cos(angle) * 0.65;
        z = Math.sin(angle) * 0.65;
      } else {
        const r = 1.42 + (Math.random() - 0.5) * 0.08;
        x = Math.cos(angle) * r;
        z = Math.sin(angle) * r;
      }

      list.push({
        pos: [x, (Math.random() - 0.5) * 0.06, z],
        rot: [Math.random() * 0.4, angle, Math.random() * 0.5],
        scale: shape === 'keychain-initial' ? [0.03, 0.06, 0.03] : [0.06, 0.12, 0.06],
      });
    }
    return list;
  }, [shape]);

  return (
    <group>
      {crystals.map((c, i) => (
        <mesh key={i} position={c.pos} rotation={c.rot} scale={c.scale}>
          <octahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transmission={0.92}
            roughness={0.1}
            ior={1.55}
            reflectivity={0.9}
            transparent
            opacity={0.88}
          />
        </mesh>
      ))}
    </group>
  );
};

// 🪔 Pooja / Wedding Thali Accessories (Brass Katoris & Diya holder)
const ThaliPoojaAccessories: React.FC = () => {
  return (
    <group position={[0, 0.1, 0]}>
      {/* 1. Haldi Brass Katori Cup (Top Left) */}
      <group position={[-0.75, 0, -0.6]}>
        <mesh>
          <cylinderGeometry args={[0.24, 0.18, 0.16, 24]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.95} roughness={0.15} />
        </mesh>
        {/* Kumkum Powder Inside */}
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.02, 24]} />
          <meshStandardMaterial color="#e11d48" roughness={0.9} />
        </mesh>
      </group>

      {/* 2. Chawal Brass Katori Cup (Top Right) */}
      <group position={[0.75, 0, -0.6]}>
        <mesh>
          <cylinderGeometry args={[0.24, 0.18, 0.16, 24]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.95} roughness={0.15} />
        </mesh>
        {/* Akshat Rice Inside */}
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.02, 24]} />
          <meshStandardMaterial color="#fef08a" roughness={0.8} />
        </mesh>
      </group>

      {/* 3. Center Brass Aarti Diya Base */}
      <group position={[0, 0, -0.1]}>
        <mesh>
          <cylinderGeometry args={[0.3, 0.16, 0.18, 24]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.95} roughness={0.15} />
        </mesh>
        {/* Glowing Diya Flame */}
        <mesh position={[0, 0.14, 0]}>
          <coneGeometry args={[0.08, 0.18, 16]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={1.2} />
        </mesh>
        <pointLight position={[0, 0.2, 0]} color="#f59e0b" intensity={0.8} distance={1.5} />
      </group>

      {/* 4. Ornate Pearl Rim Border Beads */}
      {Array.from({ length: 32 }).map((_, i) => {
        const angle = (i / 32) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 1.46, 0.08, Math.sin(angle) * 1.46]}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.1} metalness={0.3} />
          </mesh>
        );
      })}
    </group>
  );
};

// 🖼️ Photo & Flower Memory Preservation Frame Window
const PhotoFrameWindow: React.FC = () => {
  return (
    <group position={[0, 0.08, 0]}>
      {/* Inner Photo Window Area with Gold Border Frame */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[1.35, 0.03, 1.7]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.1} />
      </mesh>
      {/* Gold Beveled Inner Trim */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[1.42, 0.035, 1.78]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.95} roughness={0.15} wireframe />
      </mesh>
      {/* Subsurface Fairy Lights Glow */}
      <pointLight position={[0, 0.08, 0]} color="#fef08a" intensity={0.6} distance={2} />
    </group>
  );
};

// 🔑 Keychain Metallic Hardware Ring & Hanging Tassel
const KeychainHardwareMesh: React.FC<{ textFinish: TextFinish }> = ({ textFinish }) => {
  const mat = TEXT_MATERIAL_COLORS[textFinish];
  return (
    <group position={[0, 0.02, -0.8]}>
      {/* Keychain Top Hole Eyelet */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.1, 0.025, 16, 32]} />
        <meshStandardMaterial color={mat.color} metalness={mat.metalness} roughness={mat.roughness} />
      </mesh>

      {/* Connecting Chain Links */}
      <mesh position={[0, 0, -0.16]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.08, 0.02, 16, 24]} />
        <meshStandardMaterial color={mat.color} metalness={mat.metalness} roughness={mat.roughness} />
      </mesh>

      {/* Main Flat Split Keyring */}
      <mesh position={[0, 0, -0.38]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.26, 0.035, 16, 48]} />
        <meshStandardMaterial color={mat.color} metalness={mat.metalness} roughness={mat.roughness} />
      </mesh>

      {/* Hanging Suede Leather Tassel (Right Side) */}
      <group position={[0.2, 0, -0.32]} rotation={[0, 0, Math.PI / 6]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.08, 16]} />
          <meshStandardMaterial color={mat.color} metalness={mat.metalness} roughness={mat.roughness} />
        </mesh>
        <mesh position={[0, 0, 0.2]}>
          <coneGeometry args={[0.09, 0.35, 16]} />
          <meshStandardMaterial color="#f43f5e" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
};

// ⏱️ Wall Clock Hardware (Ticks, Spindle, Hands)
const ClockHardwareMesh: React.FC<{ textFinish: TextFinish }> = ({ textFinish }) => {
  const mat = TEXT_MATERIAL_COLORS[textFinish];
  const hourHandRef = useRef<THREE.Group>(null);
  const minHandRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (minHandRef.current) minHandRef.current.rotation.y -= delta * 0.1;
    if (hourHandRef.current) hourHandRef.current.rotation.y -= delta * 0.02;
  });

  const ticks = useMemo(() => {
    const list: { pos: [number, number, number]; rot: number; label: string }[] = [];
    const numerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
      list.push({
        pos: [Math.cos(angle) * 1.15, 0.11, Math.sin(angle) * 1.15],
        rot: -angle + Math.PI / 2,
        label: numerals[i],
      });
    }
    return list;
  }, []);

  return (
    <group position={[0, 0.02, 0]}>
      {/* Center Gold Pin Cap */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.06, 24]} />
        <meshStandardMaterial color={mat.color} metalness={mat.metalness} roughness={mat.roughness} />
      </mesh>

      {/* Hour Hand */}
      <group ref={hourHandRef} position={[0, 0.13, 0]} rotation={[0, -Math.PI / 3, 0]}>
        <mesh position={[0.3, 0, 0]}>
          <boxGeometry args={[0.6, 0.015, 0.04]} />
          <meshStandardMaterial color={mat.color} metalness={mat.metalness} roughness={mat.roughness} />
        </mesh>
      </group>

      {/* Minute Hand */}
      <group ref={minHandRef} position={[0, 0.14, 0]} rotation={[0, Math.PI / 6, 0]}>
        <mesh position={[0.45, 0, 0]}>
          <boxGeometry args={[0.9, 0.012, 0.025]} />
          <meshStandardMaterial color={mat.color} metalness={mat.metalness} roughness={mat.roughness} />
        </mesh>
      </group>

      {/* Hour Ticks */}
      {ticks.map((t, i) => (
        <group key={i} position={t.pos}>
          {i % 3 === 0 ? (
            <Text
              position={[0, 0.01, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.16}
              color={mat.color}
              anchorX="center"
              anchorY="middle"
            >
              {t.label}
            </Text>
          ) : (
            <mesh rotation={[0, t.rot, 0]}>
              <boxGeometry args={[0.08, 0.02, 0.02]} />
              <meshStandardMaterial color={mat.color} metalness={mat.metalness} roughness={mat.roughness} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
};

// Stand Hardware (Teak base or brass standoffs)
const StandHardwareMesh: React.FC<{ standOption: string; shape: CustomizerShape }> = ({ standOption, shape }) => {
  if (standOption === 'teak-wood') {
    return (
      <mesh position={[0, -0.65, 0]}>
        <boxGeometry args={[shape === 'frame-photo' ? 1.8 : 2.2, 0.22, 0.8]} />
        <meshStandardMaterial color="#78350f" roughness={0.7} metalness={0.05} />
      </mesh>
    );
  }
  if (standOption === 'walnut-wood') {
    return (
      <mesh position={[0, -0.65, 0]}>
        <boxGeometry args={[shape === 'frame-photo' ? 1.8 : 2.2, 0.22, 0.8]} />
        <meshStandardMaterial color="#451a03" roughness={0.65} metalness={0.05} />
      </mesh>
    );
  }
  if (standOption === 'brass-pegs') {
    return (
      <group>
        {[
          [-1.48, 0.55, -0.05],
          [1.48, 0.55, -0.05],
          [-1.48, -0.55, -0.05],
          [1.48, -0.55, -0.05],
        ].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.25, 16]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.95} roughness={0.15} />
          </mesh>
        ))}
      </group>
    );
  }
  if (standOption === 'acrylic-stand') {
    return (
      <mesh position={[0, -0.65, 0]}>
        <boxGeometry args={[1.8, 0.15, 0.7]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.95} roughness={0.05} ior={1.49} />
      </mesh>
    );
  }
  return null;
};

// Main 3D Procedural Resin Mesh
const ProceduralResinProduct: React.FC = () => {
  const {
    shape,
    resinFinish,
    customText,
    subText,
    textFinish,
    textSize,
    textPosX,
    textPosY,
    textRotation,
    inclusions,
    standOption,
  } = useCustomizerStore();

  const finish = RESIN_FINISHES[resinFinish] || RESIN_FINISHES['sapphire-ocean'];
  const textMat = TEXT_MATERIAL_COLORS[textFinish] || TEXT_MATERIAL_COLORS.gold;

  const hasGoldFlakes = inclusions.some((i) => i.id === 'gold-flakes' && i.active);
  const hasFlowers = inclusions.some((i) => i.id === 'real-flowers' && i.active);
  const hasCrystals = inclusions.some((i) => i.id === 'quartz-crystals' && i.active);
  const hasThaliKatoris = inclusions.some((i) => i.id === 'thali-katoris' && i.active);
  const hasPhotoInsert = inclusions.some((i) => i.id === 'photo-insert' && i.active);
  const hasClockMachine = inclusions.some((i) => i.id === 'clock-machine' && i.active);
  const hasGoldEdge = inclusions.some((i) => i.id === 'gold-gild-edge' && i.active);

  // Procedural resin geometries based on shape
  const resinGeometry = useMemo(() => {
    switch (shape) {
      case 'keychain-initial':
        // Compact rounded tag
        return <cylinderGeometry args={[0.65, 0.65, 0.12, 32]} />;
      case 'nameplate-rect':
        // Wide beveled architectural slab
        return <boxGeometry args={[3.2, 0.18, 1.5]} />;
      case 'thali-puja':
        // Ornate raised rim platter
        return <cylinderGeometry args={[1.5, 1.5, 0.22, 48]} />;
      case 'frame-photo':
        // Tall memory preservation frame
        return <boxGeometry args={[2.0, 0.18, 2.6]} />;
      case 'clock-round-12':
      default:
        return <cylinderGeometry args={[1.5, 1.5, 0.16, 64]} />;
    }
  }, [shape]);

  // Subsurface swirl disc layer
  const swirlDiscGeometry = useMemo(() => {
    switch (shape) {
      case 'keychain-initial':
        return <cylinderGeometry args={[0.6, 0.6, 0.06, 32]} />;
      case 'nameplate-rect':
        return <boxGeometry args={[3.05, 0.08, 1.35]} />;
      case 'thali-puja':
        return <cylinderGeometry args={[1.42, 1.42, 0.1, 48]} />;
      case 'frame-photo':
        return <boxGeometry args={[1.88, 0.08, 2.45]} />;
      case 'clock-round-12':
      default:
        return <cylinderGeometry args={[1.42, 1.42, 0.08, 64]} />;
    }
  }, [shape]);

  // Text vertical / horizontal offsets based on product shape
  const textPosition: [number, number, number] = useMemo(() => {
    if (shape === 'keychain-initial') return [0, 0.08, 0];
    if (shape === 'thali-puja') return [0, 0.12, 0.55]; // in front of diya
    if (shape === 'frame-photo') return [0, 0.11, 0.95]; // below photo
    if (shape === 'clock-round-12') return [0, 0.11, 0.45];
    return [0, 0.11, 0]; // nameplate center
  }, [shape]);

  const textScaleFactor = shape === 'keychain-initial' ? 1.6 : 1.0;

  return (
    <group>
      {/* 1. Base Epoxy Resin Body */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        {resinGeometry}
        <meshPhysicalMaterial
          color={finish.primaryColor}
          roughness={finish.roughness}
          metalness={finish.metalness}
          transmission={finish.transmission}
          transparent
          opacity={finish.opacity}
          ior={1.54}
          clearcoat={1.0}
          clearcoatRoughness={0.04}
          reflectivity={0.9}
        />
      </mesh>

      {/* 2. Subsurface Mica Swirl Wave Core Layer */}
      <mesh position={[0, -0.01, 0]}>
        {swirlDiscGeometry}
        <meshStandardMaterial
          color={finish.secondaryColor}
          roughness={0.2}
          metalness={0.4}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* 3. Gold Gilded Edge Rim (if enabled) */}
      {hasGoldEdge && (
        <mesh position={[0, 0, 0]}>
          {shape === 'nameplate-rect' || shape === 'frame-photo' ? (
            <boxGeometry
              args={[
                shape === 'nameplate-rect' ? 3.24 : 2.04,
                0.185,
                shape === 'nameplate-rect' ? 1.54 : 2.64,
              ]}
            />
          ) : (
            <cylinderGeometry
              args={[
                shape === 'keychain-initial' ? 0.67 : 1.52,
                shape === 'keychain-initial' ? 0.67 : 1.52,
                shape === 'keychain-initial' ? 0.13 : 0.17,
                48,
              ]}
            />
          )}
          <meshStandardMaterial color="#f59e0b" metalness={0.95} roughness={0.12} wireframe />
        </mesh>
      )}

      {/* 4. Active Inclusions Particles */}
      {hasGoldFlakes && <GoldFlakesParticles density={75} color={finish.accentColor} shape={shape} />}
      {hasFlowers && <FlowerPetalsInclusion shape={shape} />}
      {hasCrystals && <QuartzCrystalsRim shape={shape} />}

      {/* 5. Bespoke Hardware per Product Category */}
      {shape === 'keychain-initial' && <KeychainHardwareMesh textFinish={textFinish} />}
      {shape === 'thali-puja' && hasThaliKatoris && <ThaliPoojaAccessories />}
      {shape === 'frame-photo' && hasPhotoInsert && <PhotoFrameWindow />}
      {shape === 'clock-round-12' && hasClockMachine && <ClockHardwareMesh textFinish={textFinish} />}

      {/* 6. Custom 3D Embossed Metallic Text */}
      {customText.trim().length > 0 && (
        <group
          position={[textPosX, 0.11, textPosY]}
          rotation={[-Math.PI / 2, 0, (textRotation * Math.PI) / 180]}
        >
          <Center top>
            <Text
              position={[0, 0, 0]}
              fontSize={0.22 * textSize * textScaleFactor}
              color={textMat.color}
              anchorX="center"
              anchorY="middle"
            >
              {customText}
              <meshStandardMaterial
                color={textMat.color}
                metalness={textMat.metalness}
                roughness={textMat.roughness}
              />
            </Text>
          </Center>

          {subText.trim().length > 0 && shape !== 'keychain-initial' && (
            <Center top position={[0, -0.28, -0.01]}>
              <Text
                fontSize={0.11 * textSize}
                color={textMat.color}
                anchorX="center"
                anchorY="middle"
              >
                {subText}
                <meshStandardMaterial
                  color={textMat.color}
                  metalness={textMat.metalness}
                  roughness={textMat.roughness}
                />
              </Text>
            </Center>
          )}
        </group>
      )}

      {/* 7. Display Stand / Mount Base */}
      {shape !== 'keychain-initial' && <StandHardwareMesh standOption={standOption} shape={shape} />}
    </group>
  );
};

export const Customizer3DCanvas: React.FC<{ className?: string }> = ({
  className = 'h-[500px] w-full',
}) => {
  const {
    autoRotate,
    lightingPreset,
    setLightingPreset,
    cameraPreset,
    setCameraPreset,
  } = useCustomizerStore();

  const controlsRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleCaptureScreenshot = () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `resin-art-customizer-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.warn('Screenshot capture notice:', e);
    }
  };

  const resetCamera = () => {
    if (controlsRef.current) controlsRef.current.reset();
  };

  const cameraPosition: [number, number, number] = useMemo(() => {
    if (cameraPreset === 'top') return [0, 4.2, 0.01];
    if (cameraPreset === 'angle') return [0, 1.8, 3.2];
    return [0, 2.5, 3.2];
  }, [cameraPreset]);

  return (
    <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-b from-art-950 via-art-900 to-art-950 border border-art-800 shadow-2xl ${className}`}>
      <Canvas
        ref={canvasRef}
        shadows
        dpr={[1, 2]}
        gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }}
        camera={{ position: cameraPosition, fov: 45 }}
      >
        {lightingPreset === 'luxury' && (
          <>
            <ambientLight intensity={0.9} />
            <spotLight position={[6, 8, 6]} angle={0.25} penumbra={1} intensity={2.0} color="#fef3c7" castShadow />
            <pointLight position={[-6, -4, -4]} intensity={0.6} color="#fbbf24" />
            <directionalLight position={[0, 6, 4]} intensity={1.2} color="#ffffff" />
          </>
        )}

        {lightingPreset === 'daylight' && (
          <>
            <ambientLight intensity={1.2} />
            <directionalLight position={[5, 10, 5]} intensity={1.8} color="#f8fafc" castShadow />
            <directionalLight position={[-5, 5, -5]} intensity={0.8} color="#e2e8f0" />
          </>
        )}

        {lightingPreset === 'cyber' && (
          <>
            <ambientLight intensity={0.4} />
            <spotLight position={[5, 8, 4]} intensity={2.5} color="#c084fc" />
            <pointLight position={[-5, 2, -3]} intensity={2.0} color="#38bdf8" />
            <pointLight position={[0, -4, 2]} intensity={1.5} color="#ec4899" />
          </>
        )}

        <Suspense
          fallback={
            <Html center>
              <div className="flex flex-col items-center gap-2 text-brand-500">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-xs font-mono tracking-widest uppercase text-art-400">
                  Rendering 3D Resin Studio...
                </span>
              </div>
            </Html>
          }
        >
          <Stage environment="city" intensity={0.4} adjustCamera={false}>
            <Float speed={autoRotate ? 1.2 : 0} rotationIntensity={0.2} floatIntensity={0.3}>
              <ProceduralResinProduct />
            </Float>
          </Stage>

          <ContactShadows
            position={[0, -0.95, 0]}
            opacity={0.6}
            scale={8}
            blur={2.5}
            far={3.5}
            color="#1c1917"
          />
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableZoom={true}
          minDistance={1.6}
          maxDistance={6.0}
          autoRotate={autoRotate}
          autoRotateSpeed={1.5}
          maxPolarAngle={Math.PI / 2 + 0.1}
          makeDefault
        />
      </Canvas>

      {/* Top Floating Action Overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2 pointer-events-auto bg-art-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-art-800 shadow text-xs font-semibold text-art-300">
          <SparklesIcon className="w-3.5 h-3.5 text-brand-500 animate-pulse" />
          <span>3D Live Co-Creator</span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Lighting Mode Selector */}
          <button
            onClick={() => {
              const next =
                lightingPreset === 'luxury'
                  ? 'daylight'
                  : lightingPreset === 'daylight'
                  ? 'cyber'
                  : 'luxury';
              setLightingPreset(next);
            }}
            title="Switch Studio Lighting"
            className="p-2 rounded-xl bg-art-950/90 backdrop-blur-md border border-art-800 text-art-400 hover:text-brand-500 transition-all shadow flex items-center gap-1.5 text-xs font-medium"
          >
            {lightingPreset === 'luxury' && <Sun className="w-4 h-4 text-amber-500" />}
            {lightingPreset === 'daylight' && <Eye className="w-4 h-4 text-blue-400" />}
            {lightingPreset === 'cyber' && <Moon className="w-4 h-4 text-purple-400" />}
            <span className="capitalize hidden sm:inline">{lightingPreset} Light</span>
          </button>

          {/* Camera View Angle Selector */}
          <button
            onClick={() => {
              const next =
                cameraPreset === 'hero' ? 'top' : cameraPreset === 'top' ? 'angle' : 'hero';
              setCameraPreset(next);
            }}
            title="Camera Perspective (Hero / Top-Down / Angled)"
            className="p-2 rounded-xl bg-art-950/90 backdrop-blur-md border border-art-800 text-art-400 hover:text-brand-500 transition-all shadow text-xs font-semibold"
          >
            📐 {cameraPreset === 'hero' ? '45° Hero' : cameraPreset === 'top' ? 'Top-Down' : 'Close-up'}
          </button>

          {/* Snapshot Button */}
          <button
            onClick={handleCaptureScreenshot}
            title="Save HD Snapshot of your custom design"
            className="p-2 rounded-xl bg-art-950/90 backdrop-blur-md border border-art-800 text-art-400 hover:text-brand-500 hover:border-brand-500 transition-all shadow"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Reset Camera Button */}
          <button
            onClick={resetCamera}
            title="Reset View"
            className="p-2 rounded-xl bg-art-950/90 backdrop-blur-md border border-art-800 text-art-400 hover:text-brand-500 transition-all shadow"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none text-[11px] font-medium text-art-500 flex items-center gap-2 select-none bg-art-950/70 backdrop-blur-xs px-3 py-1 rounded-full border border-art-800/60">
        <span>✨ 360° Drag to Orbit · Pinch / Scroll to Zoom · Live Physics</span>
      </div>
    </div>
  );
};
