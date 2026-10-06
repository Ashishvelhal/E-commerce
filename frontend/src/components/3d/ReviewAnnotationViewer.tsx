import React, { Suspense, useRef, Component } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF, Html, ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Loader2, MessageSquare, Sparkles, CheckCircle2 } from 'lucide-react';
import { Review } from '../../types';

interface ReviewAnnotationViewerProps {
  modelUrl?: string;
  reviews: Review[];
  selectedReviewId?: string | null;
  onSelectReview?: (review: Review) => void;
}


class ModelLoadBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: Error) {
    console.warn('[ReviewAnnotationViewer] Model load failed:', err.message);
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}


const OrbFallback: React.FC = () => {
  const ref = useRef<THREE.Mesh>(null);
  return (
    <Float speed={1.5} floatIntensity={0.6}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#8b5cf6" roughness={0.15} metalness={0.7} />
      </mesh>
    </Float>
  );
};


const AnnotatedModel: React.FC<{
  url: string;
  reviews: Review[];
  selectedReviewId?: string | null;
  onSelectReview?: (review: Review) => void;
}> = ({ url, reviews, selectedReviewId, onSelectReview }) => {
  const { scene } = useGLTF(url);
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);
  const annotatedReviews = reviews.filter((r) => r.modelAnnotation?.point);

  return (
    <group>
      <primitive object={clonedScene} scale={1.2} position={[0, -0.4, 0]} />

      {annotatedReviews.map((review) => {
        const point = review.modelAnnotation!.point;
        const isSelected = selectedReviewId === review._id;

        return (
          <group key={review._id} position={point}>
            <Html position={[0, 0, 0]} center distanceFactor={7}>
              <div
                onClick={() => onSelectReview && onSelectReview(review)}
                className="relative group cursor-pointer"
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
                    isSelected
                      ? 'bg-brand-500 text-white ring-4 ring-brand-400/40 scale-125'
                      : 'bg-white/90 text-brand-600 border border-brand-500/50 hover:scale-110'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-9 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 w-48">
                  <div className="bg-white text-art-300 p-2.5 rounded-xl border border-art-800 shadow-xl">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-brand-700">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{review.user?.name || 'Verified Buyer'}</span>
                    </div>
                    <p className="text-[11px] text-art-500 mt-1 font-medium line-clamp-2">
                      &ldquo;{review.modelAnnotation?.label || review.title}&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};


export const ReviewAnnotationViewer: React.FC<ReviewAnnotationViewerProps> = ({
  modelUrl,
  reviews,
  selectedReviewId,
  onSelectReview,
}) => {
  if (!modelUrl) {
    return (
      <div className="p-8 text-center text-art-500 font-medium border border-dashed border-art-800 rounded-2xl bg-art-950">
        3D spatial review inspection is not available for this item — no 3D model attached.
      </div>
    );
  }

  return (
    <div className="relative h-[380px] w-full rounded-2xl overflow-hidden bg-gradient-to-b from-art-900 via-art-900 to-art-950 border border-art-800 shadow-sm">
      <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-art-800 shadow text-xs font-semibold text-art-400 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-brand-600" />
        <span>3D Customer Review Hotspots</span>
      </div>

      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 3.8], fov: 45 }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, -5, -5]} intensity={0.4} color="#f59010" />

        <Suspense
          fallback={
            <Html center>
              <div className="flex flex-col items-center gap-2 text-brand-600">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs font-mono tracking-wider text-art-500">Loading 3D...</span>
              </div>
            </Html>
          }
        >
          <Stage environment="city" intensity={0.5} adjustCamera={false}>
            <ModelLoadBoundary fallback={<OrbFallback />}>
              <AnnotatedModel
                url={modelUrl}
                reviews={reviews}
                selectedReviewId={selectedReviewId}
                onSelectReview={onSelectReview}
              />
            </ModelLoadBoundary>
          </Stage>
          <ContactShadows position={[0, -1.2, 0]} opacity={0.4} scale={8} blur={2} color="#4a3726" />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={1.8}
          maxDistance={5.5}
          autoRotate
          autoRotateSpeed={0.8}
        />
      </Canvas>
    </div>
  );
};
