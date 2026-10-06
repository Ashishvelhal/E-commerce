import React, { Suspense, useRef, useState, useEffect, Component } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Stage,
  useGLTF,
  Html,
  ContactShadows,
  Float,
} from '@react-three/drei';
import * as THREE from 'three';
import { Loader2, RotateCcw, Play, Pause, Sparkles, Info, Box } from 'lucide-react';
import { Model3DConfig, InteractiveNode } from '../../types';


interface ModelProps {
  url: string;
  scale?: number;
  selectedColor?: string;
  interactiveNodes?: InteractiveNode[];
  activeNodeIndex?: number | null;
  onSelectNode?: (index: number) => void;
}


interface EBState { hasError: boolean; error?: Error }
class ModelErrorBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  EBState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error): EBState {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error) {
    console.warn('[ProductCanvas] 3D model failed to load:', error.message);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}


const ResinOrbFallback: React.FC<{ selectedColor?: string }> = ({ selectedColor }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.35;
      meshRef.current.rotation.x += delta * 0.15;
    }
    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 0.6;
    if (ring2Ref.current) ring2Ref.current.rotation.x += delta * 0.4;
  });

  const color = selectedColor || '#8b5cf6';

  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.8}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.1, 1]} />
        <meshStandardMaterial
          color={color}
          roughness={0.1}
          metalness={0.7}
          transparent
          opacity={0.92}
        />
      </mesh>
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.7, 0.04, 16, 100]} />
        <meshStandardMaterial color="#f59010" emissive="#f59010" emissiveIntensity={0.5} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[2.1, 0.025, 16, 100]} />
        <meshStandardMaterial color="#e11d48" emissive="#e11d48" emissiveIntensity={0.3} />
      </mesh>
    </Float>
  );
};


const ModelRenderer: React.FC<ModelProps> = ({
  url,
  scale = 1,
  selectedColor,
  interactiveNodes = [],
  activeNodeIndex = null,
  onSelectNode,
}) => {
  const modelRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(url);
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    if (selectedColor && clonedScene) {
      clonedScene.traverse((child: any) => {
        if (child.isMesh && child.material) {
          child.material = child.material.clone();
          child.material.color = new THREE.Color(selectedColor);
          child.material.needsUpdate = true;
        }
      });
    }
  }, [selectedColor, clonedScene]);

  return (
    <group ref={modelRef}>
      <primitive object={clonedScene} scale={scale} position={[0, -0.5, 0]} />

      {interactiveNodes.map((node, index) => (
        <group key={index} position={node.position}>
          <Html position={[0, 0, 0]} center distanceFactor={8}>
            <div
              className="relative group cursor-pointer"
              onClick={() => onSelectNode && onSelectNode(index)}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  activeNodeIndex === index
                    ? 'bg-brand-500 text-white ring-4 ring-brand-400/50 scale-125'
                    : 'bg-white/90 text-brand-600 border border-brand-500/40 hover:scale-110'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 bottom-8 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 whitespace-nowrap">
                <div className="bg-white text-art-300 text-xs px-3 py-1.5 rounded-lg border border-art-800 shadow-xl">
                  <div className="font-bold text-brand-700">{node.name}</div>
                  <div className="text-art-500 text-[11px]">{node.description}</div>
                </div>
              </div>
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
};


interface SceneProps {
  modelUrl?: string;
  scale: number;
  selectedColor?: string;
  interactiveNodes: InteractiveNode[];
  activeNode: number | null;
  onSelectNode: (i: number) => void;
}

const Scene3D: React.FC<SceneProps> = ({
  modelUrl,
  scale,
  selectedColor,
  interactiveNodes,
  activeNode,
  onSelectNode,
}) => {
  return (
    <>
      <ambientLight intensity={0.8} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#f59010" />
      <directionalLight position={[0, 5, 5]} intensity={1} color="#ffffff" />

      <Suspense
        fallback={
          <Html center>
            <div className="flex flex-col items-center gap-2 text-brand-600">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-xs font-mono tracking-wider uppercase text-art-500">
                Loading 3D Model...
              </span>
            </div>
          </Html>
        }
      >
        <Stage environment="city" intensity={0.5} adjustCamera={false}>
          {modelUrl ? (
            <ModelErrorBoundary
              fallback={<ResinOrbFallback selectedColor={selectedColor} />}
            >
              <ModelRenderer
                url={modelUrl}
                scale={scale}
                selectedColor={selectedColor}
                interactiveNodes={interactiveNodes}
                activeNodeIndex={activeNode}
                onSelectNode={onSelectNode}
              />
            </ModelErrorBoundary>
          ) : (
            <ResinOrbFallback selectedColor={selectedColor} />
          )}
        </Stage>

        <ContactShadows
          position={[0, -1.2, 0]}
          opacity={0.5}
          scale={10}
          blur={2}
          far={4}
          color="#4a3726"
        />
      </Suspense>
    </>
  );
};


interface ProductCanvasProps {
  modelConfig?: Model3DConfig;
  selectedColor?: string;
  interactiveNodes?: InteractiveNode[];
  className?: string;
  showControls?: boolean;
}

export const ProductCanvas: React.FC<ProductCanvasProps> = ({
  modelConfig,
  selectedColor,
  interactiveNodes = [],
  className = 'h-[420px] w-full',
  showControls = true,
}) => {
  const [autoRotate, setAutoRotate] = useState(true);
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const controlsRef = useRef<any>(null);

  const resetCamera = () => {
    if (controlsRef.current) controlsRef.current.reset();
  };

  const nodes =
    interactiveNodes.length > 0 ? interactiveNodes : modelConfig?.interactiveNodes || [];

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-gradient-to-b from-art-900 via-art-900 to-art-950 border border-art-800 shadow-sm ${className}`}
    >
      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: modelConfig?.cameraPosition || [0, 0, 3.8], fov: 45 }}
        onError={(e) => console.warn('[Canvas] WebGL error:', e)}
      >
        <Scene3D
          modelUrl={modelConfig?.url}
          scale={modelConfig?.initialScale || 1}
          selectedColor={selectedColor}
          interactiveNodes={nodes}
          activeNode={activeNode}
          onSelectNode={setActiveNode}
        />

        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableZoom={true}
          minDistance={1.8}
          maxDistance={6.5}
          autoRotate={autoRotate}
          autoRotateSpeed={1.2}
          makeDefault
        />
      </Canvas>
      {showControls && (
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-art-800 shadow text-xs font-semibold text-art-400">
            <Box className="w-3.5 h-3.5 text-brand-600" />
            <span>3D Interactive</span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => setAutoRotate((v) => !v)}
              title={autoRotate ? 'Pause Rotation' : 'Auto Rotate'}
              className="p-2 rounded-full bg-white/90 backdrop-blur-md border border-art-800 text-art-500 hover:text-brand-600 hover:border-brand-500 transition-all shadow"
            >
              {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={resetCamera}
              title="Reset View"
              className="p-2 rounded-full bg-white/90 backdrop-blur-md border border-art-800 text-art-500 hover:text-brand-600 hover:border-brand-500 transition-all shadow"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      {activeNode !== null && nodes[activeNode] && (
        <div className="absolute bottom-10 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-brand-500/30 shadow-xl flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-brand-50 text-brand-600 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-art-300">{nodes[activeNode].name}</h4>
              <p className="text-xs text-art-500 mt-0.5">{nodes[activeNode].description}</p>
            </div>
          </div>
          <button
            onClick={() => setActiveNode(null)}
            className="text-xs text-art-500 hover:text-brand-600 px-2 py-1 bg-art-950 rounded-md font-semibold border border-art-800"
          >
            ✕
          </button>
        </div>
      )}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none text-[11px] font-medium text-art-600 flex items-center gap-1.5 select-none">
        <span>Drag to rotate · Scroll to zoom</span>
      </div>
    </div>
  );
};
