import { create } from 'zustand';

export type CustomizerShape =
  | 'nameplate-rect'
  | 'thali-puja'
  | 'frame-photo'
  | 'keychain-initial'
  | 'clock-round-12';

export type ResinFinishId =
  | 'sapphire-ocean'
  | 'emerald-gold'
  | 'ruby-sunset'
  | 'galaxy-purple'
  | 'obsidian-sparkle'
  | 'rose-quartz';

export type TextFinish = 'gold' | 'silver' | 'rose-gold' | 'white';
export type TextFont = 'serif' | 'sans' | 'script' | 'gothic';
export type TextPositionPreset = 'center' | 'top' | 'bottom' | 'left' | 'right' | 'custom';
export type StandOption = 'none' | 'teak-wood' | 'walnut-wood' | 'brass-pegs' | 'acrylic-stand' | 'keychain-ring';
export type LightingPreset = 'luxury' | 'daylight' | 'cyber';
export type CameraPreset = 'hero' | 'top' | 'angle';

export interface InclusionOption {
  id: string;
  name: string;
  category: 'flakes' | 'botanical' | 'crystals' | 'hardware' | 'thali' | 'frame';
  price: number;
  active: boolean;
  icon: string;
  description: string;
  applicableShapes?: CustomizerShape[];
}

export interface ResinFinishConfig {
  id: ResinFinishId;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  roughness: number;
  metalness: number;
  transmission: number;
  opacity: number;
  micaShimmer: boolean;
  foilDensity: number;
  swirlScale: number;
}

export interface ShapeConfig {
  id: CustomizerShape;
  name: string;
  categoryLabel: string;
  dimensions: string;
  basePrice: number;
  resinGrams: number;
  recommendedHardware: string;
  aspectRatio: string;
  description: string;
}

export const SHAPE_CONFIGS: Record<CustomizerShape, ShapeConfig> = {
  'nameplate-rect': {
    id: 'nameplate-rect',
    name: 'Luxury Custom Nameplate',
    categoryLabel: '🏡 Nameplate',
    dimensions: '35cm × 15cm × 1.5cm Depth',
    basePrice: 1899,
    resinGrams: 320,
    recommendedHardware: 'Brass Architectural Wall Standoffs (4 pcs)',
    aspectRatio: '7:3',
    description: 'Bespoke house/office nameplate with 3D embossed metallic family name & bungalow/flat number.',
  },
  'thali-puja': {
    id: 'thali-puja',
    name: 'Royal Wedding & Pooja Thali',
    categoryLabel: '🪔 Aarti / Wedding Thali',
    dimensions: '28cm (11") Diameter with Raised Rim',
    basePrice: 2299,
    resinGrams: 360,
    recommendedHardware: '2x Brass Katoris + Diya Holder + Pearl Border',
    aspectRatio: '1:1',
    description: 'Festive & wedding aarti thali with sacred swastik/om gold foil, kumkum cups & diya stand.',
  },
  'frame-photo': {
    id: 'frame-photo',
    name: 'Flower & Photo Preservation Frame',
    categoryLabel: '🖼️ Memory Frame',
    dimensions: '20cm Height × 15cm Width × 2cm Depth',
    basePrice: 1999,
    resinGrams: 290,
    recommendedHardware: 'Crystal Tabletop Stand + Warm Fairy LED Wire',
    aspectRatio: '3:4',
    description: 'Eternal memory frame preserving real wedding varmala flowers, couple photograph, and date.',
  },
  'keychain-initial': {
    id: 'keychain-initial',
    name: 'Custom Initial & Name Keychain',
    categoryLabel: '🔑 Keychain',
    dimensions: '5cm × 4cm × 0.8cm Compact Tag',
    basePrice: 299,
    resinGrams: 35,
    recommendedHardware: 'Gold Keyring + Luxury Suede Leather Tassel',
    aspectRatio: '1:1',
    description: 'Pocket luxury custom alphabet or name keychain with 24K gold foil flakes and velvet tassel.',
  },
  'clock-round-12': {
    id: 'clock-round-12',
    name: '12" Geode Wall Clock',
    categoryLabel: '⏱️ Wall Clock',
    dimensions: '30cm (12") Diameter × 1.2cm Depth',
    basePrice: 2499,
    resinGrams: 380,
    recommendedHardware: 'Silent Sweep Quartz Machine + Gold Needle Set',
    aspectRatio: '1:1',
    description: 'High-gloss geode wall clock with raw quartz border and silent sweep mechanism.',
  },
};

export const RESIN_FINISHES: Record<ResinFinishId, ResinFinishConfig> = {
  'sapphire-ocean': {
    id: 'sapphire-ocean',
    name: 'Sapphire Ocean Swirl',
    description: 'Deep royal blue with seafoam white wave cells and Caribbean turquoise depth.',
    primaryColor: '#0c4a6e',
    secondaryColor: '#0284c7',
    accentColor: '#38bdf8',
    roughness: 0.05,
    metalness: 0.15,
    transmission: 0.85,
    opacity: 0.95,
    micaShimmer: true,
    foilDensity: 0.4,
    swirlScale: 2.5,
  },
  'emerald-gold': {
    id: 'emerald-gold',
    name: 'Emerald Gold Geode',
    description: 'Rich forest emerald green with crushed 24K gold foil veins and jade reflections.',
    primaryColor: '#064e3b',
    secondaryColor: '#047857',
    accentColor: '#fbbf24',
    roughness: 0.04,
    metalness: 0.3,
    transmission: 0.8,
    opacity: 0.94,
    micaShimmer: true,
    foilDensity: 0.7,
    swirlScale: 2.0,
  },
  'ruby-sunset': {
    id: 'ruby-sunset',
    name: 'Ruby Sunset Glow',
    description: 'Passionate crimson red blending into warm amber gold and rose blush shimmer.',
    primaryColor: '#881337',
    secondaryColor: '#e11d48',
    accentColor: '#fbbf24',
    roughness: 0.06,
    metalness: 0.2,
    transmission: 0.82,
    opacity: 0.93,
    micaShimmer: true,
    foilDensity: 0.5,
    swirlScale: 2.2,
  },
  'galaxy-purple': {
    id: 'galaxy-purple',
    name: 'Cosmic Galaxy Amethyst',
    description: 'Deep cosmic amethyst violet with holographic sparkle dust and nebula clouds.',
    primaryColor: '#3b0764',
    secondaryColor: '#7e22ce',
    accentColor: '#c084fc',
    roughness: 0.05,
    metalness: 0.25,
    transmission: 0.88,
    opacity: 0.92,
    micaShimmer: true,
    foilDensity: 0.6,
    swirlScale: 3.0,
  },
  'obsidian-sparkle': {
    id: 'obsidian-sparkle',
    name: 'Obsidian Midnight Gold',
    description: 'Mirror-finish deep jet black contrasted with high-sparkle liquid metallic gold leaf.',
    primaryColor: '#09090b',
    secondaryColor: '#27272a',
    accentColor: '#eab308',
    roughness: 0.03,
    metalness: 0.45,
    transmission: 0.3,
    opacity: 0.99,
    micaShimmer: false,
    foilDensity: 0.85,
    swirlScale: 1.8,
  },
  'rose-quartz': {
    id: 'rose-quartz',
    name: 'Rose Quartz Blossom',
    description: 'Soft pastel blush pink with pearlescent white mica clouds and rose gold flakes.',
    primaryColor: '#9d174d',
    secondaryColor: '#f43f5e',
    accentColor: '#fbcfe8',
    roughness: 0.08,
    metalness: 0.1,
    transmission: 0.9,
    opacity: 0.88,
    micaShimmer: true,
    foilDensity: 0.45,
    swirlScale: 2.0,
  },
};

export const DEFAULT_INCLUSIONS: InclusionOption[] = [
  {
    id: 'gold-flakes',
    name: '24K Metallic Gold Foil Flakes',
    category: 'flakes',
    price: 149,
    active: true,
    icon: '✨',
    description: 'Hand-placed ultra-bright metallic gold leaf veins suspended in crystal resin.',
  },
  {
    id: 'real-flowers',
    name: 'Dried Botanical Real Flowers',
    category: 'botanical',
    price: 249,
    active: true,
    icon: '🌸',
    description: 'Preserved real baby breath & rose petals frozen forever in clear resin.',
  },
  {
    id: 'quartz-crystals',
    name: 'Raw Quartz Crystal Geode Border',
    category: 'crystals',
    price: 299,
    active: false,
    icon: '💎',
    description: 'Genuine raw crushed quartz crystal stones lining the geode rim.',
  },
  {
    id: 'thali-katoris',
    name: 'Brass Kumkum Katoris & Diya Cup',
    category: 'thali',
    price: 349,
    active: false,
    icon: '🪔',
    description: '2 polished brass cups for Haldi-Kumkum + center diya holder embedded in thali.',
    applicableShapes: ['thali-puja'],
  },
  {
    id: 'photo-insert',
    name: 'Custom Photograph Lamination Window',
    category: 'frame',
    price: 199,
    active: false,
    icon: '📷',
    description: 'High-res archival photo print embedded directly under the glossy resin layer.',
    applicableShapes: ['frame-photo'],
  },
  {
    id: 'fairy-led-lights',
    name: 'Embedded Warm Fairy Micro-LEDs',
    category: 'hardware',
    price: 299,
    active: false,
    icon: '💡',
    description: 'Subsurface battery-powered warm fairy string lights with discreet switch.',
  },
  {
    id: 'keychain-tassel',
    name: 'Gold Keyring + Velvet Suede Tassel',
    category: 'hardware',
    price: 49,
    active: true,
    icon: '🔑',
    description: 'Rust-proof alloy golden keyring with color-matching suede tassel.',
    applicableShapes: ['keychain-initial'],
  },
  {
    id: 'clock-machine',
    name: 'Silent Sweep Quartz Mechanism',
    category: 'hardware',
    price: 249,
    active: false,
    icon: '⏱️',
    description: 'Zero-noise sweep quartz machine with gold metal hands.',
    applicableShapes: ['clock-round-12'],
  },
  {
    id: 'gold-gild-edge',
    name: 'Hand-Painted Metallic Edge Gilding',
    category: 'flakes',
    price: 99,
    active: true,
    icon: '🖌️',
    description: 'Waterproof luxury liquid gold metallic painted outer edge.',
  },
];

export interface CustomizerState {
  shape: CustomizerShape;
  setShape: (shape: CustomizerShape) => void;
  resinFinish: ResinFinishId;
  setResinFinish: (finish: ResinFinishId) => void;

  // Custom 3D Text & Typography
  customText: string;
  setCustomText: (text: string) => void;
  subText: string;
  setSubText: (text: string) => void;
  fontFamily: TextFont;
  setFontFamily: (font: TextFont) => void;
  textFinish: TextFinish;
  setTextFinish: (finish: TextFinish) => void;
  textSize: number;
  setTextSize: (size: number) => void;

  // Text Position & Alignment Controls
  textPositionPreset: TextPositionPreset;
  textPosX: number; // Horizontal Offset (-1.2 to 1.2)
  textPosY: number; // Vertical Offset (-1.2 to 1.2)
  textRotation: number; // Rotation in Degrees (-45 to 45)
  setTextPositionPreset: (preset: TextPositionPreset) => void;
  setTextPosX: (x: number) => void;
  setTextPosY: (y: number) => void;
  setTextRotation: (deg: number) => void;
  resetTextPosition: () => void;

  inclusions: InclusionOption[];
  toggleInclusion: (id: string) => void;
  standOption: StandOption;
  setStandOption: (stand: StandOption) => void;

  lightingPreset: LightingPreset;
  setLightingPreset: (preset: LightingPreset) => void;
  cameraPreset: CameraPreset;
  setCameraPreset: (preset: CameraPreset) => void;
  autoRotate: boolean;
  toggleAutoRotate: () => void;
  snapshotTrigger: number;
  triggerSnapshot: () => void;

  calculatePrice: () => number;
  calculateBOM: () => {
    resinPartAGrams: number;
    hardenerPartBGrams: number;
    totalResinGrams: number;
    micaPigmentGrams: number;
    estimatedMaterialCost: number;
    cureTimeHours: number;
    componentsList: string[];
  };

  loadPreset: (presetName: string) => void;
  resetCustomizer: () => void;
}

export const useCustomizerStore = create<CustomizerState>((set, get) => ({
  shape: 'nameplate-rect',
  setShape: (shape) => {
    let defaultText = "The Sharma's";
    let defaultSub = 'Bungalow 42';
    let defaultStand: StandOption = 'brass-pegs';
    let defaultPosY = 0;

    if (shape === 'keychain-initial') {
      defaultText = 'A';
      defaultSub = 'Ashish';
      defaultStand = 'keychain-ring';
      defaultPosY = 0;
    } else if (shape === 'thali-puja') {
      defaultText = 'शुभ लाभ';
      defaultSub = 'Wedding Aarti';
      defaultStand = 'none';
      defaultPosY = 0.55;
    } else if (shape === 'frame-photo') {
      defaultText = 'Always & Forever';
      defaultSub = '14 · 02 · 2024';
      defaultStand = 'acrylic-stand';
      defaultPosY = 0.95;
    } else if (shape === 'clock-round-12') {
      defaultText = 'The Royal Residence';
      defaultSub = 'EST. 2024';
      defaultStand = 'none';
      defaultPosY = 0.45;
    }

    set((state) => ({
      shape,
      customText: defaultText,
      subText: defaultSub,
      standOption: defaultStand,
      textPosX: 0,
      textPosY: defaultPosY,
      textRotation: 0,
      textPositionPreset: 'center',
      inclusions: state.inclusions.map((inc) => {
        if (shape === 'thali-puja' && inc.id === 'thali-katoris') return { ...inc, active: true };
        if (shape === 'frame-photo' && (inc.id === 'photo-insert' || inc.id === 'real-flowers')) return { ...inc, active: true };
        if (shape === 'keychain-initial' && inc.id === 'keychain-tassel') return { ...inc, active: true };
        if (shape === 'clock-round-12' && inc.id === 'clock-machine') return { ...inc, active: true };
        return inc;
      }),
    }));
  },

  resinFinish: 'sapphire-ocean',
  setResinFinish: (resinFinish) => set({ resinFinish }),

  customText: "The Sharma's",
  setCustomText: (customText) => set({ customText }),
  subText: 'Bungalow 42',
  setSubText: (subText) => set({ subText }),
  fontFamily: 'serif',
  setFontFamily: (fontFamily) => set({ fontFamily }),
  textFinish: 'gold',
  setTextFinish: (textFinish) => set({ textFinish }),
  textSize: 1.0,
  setTextSize: (textSize) => set({ textSize }),

  // Positioning Defaults
  textPositionPreset: 'center',
  textPosX: 0,
  textPosY: 0,
  textRotation: 0,

  setTextPositionPreset: (preset) => {
    const { shape } = get();
    let posX = 0;
    let posY = 0;

    if (preset === 'center') {
      posX = 0;
      posY = shape === 'clock-round-12' ? 0.45 : shape === 'frame-photo' ? 0.95 : shape === 'thali-puja' ? 0.55 : 0;
    } else if (preset === 'top') {
      posX = 0;
      posY = shape === 'nameplate-rect' ? -0.45 : -0.6;
    } else if (preset === 'bottom') {
      posX = 0;
      posY = shape === 'nameplate-rect' ? 0.45 : 0.8;
    } else if (preset === 'left') {
      posX = shape === 'nameplate-rect' ? -0.75 : -0.5;
      posY = shape === 'clock-round-12' ? 0.45 : 0;
    } else if (preset === 'right') {
      posX = shape === 'nameplate-rect' ? 0.75 : 0.5;
      posY = shape === 'clock-round-12' ? 0.45 : 0;
    }

    set({ textPositionPreset: preset, textPosX: posX, textPosY: posY });
  },

  setTextPosX: (textPosX) => set({ textPosX, textPositionPreset: 'custom' }),
  setTextPosY: (textPosY) => set({ textPosY, textPositionPreset: 'custom' }),
  setTextRotation: (textRotation) => set({ textRotation, textPositionPreset: 'custom' }),

  resetTextPosition: () => {
    const { shape } = get();
    const defaultY = shape === 'clock-round-12' ? 0.45 : shape === 'frame-photo' ? 0.95 : shape === 'thali-puja' ? 0.55 : 0;
    set({ textPositionPreset: 'center', textPosX: 0, textPosY: defaultY, textRotation: 0 });
  },

  inclusions: DEFAULT_INCLUSIONS,
  toggleInclusion: (id) =>
    set((state) => ({
      inclusions: state.inclusions.map((inc) =>
        inc.id === id ? { ...inc, active: !inc.active } : inc
      ),
    })),

  standOption: 'brass-pegs',
  setStandOption: (standOption) => set({ standOption }),

  lightingPreset: 'luxury',
  setLightingPreset: (lightingPreset) => set({ lightingPreset }),
  cameraPreset: 'hero',
  setCameraPreset: (cameraPreset) => set({ cameraPreset }),
  autoRotate: true,
  toggleAutoRotate: () => set((state) => ({ autoRotate: !state.autoRotate })),
  snapshotTrigger: 0,
  triggerSnapshot: () => set((state) => ({ snapshotTrigger: state.snapshotTrigger + 1 })),

  calculatePrice: () => {
    const { shape, inclusions, standOption, customText } = get();
    const shapeConfig = SHAPE_CONFIGS[shape];
    let total = shapeConfig.basePrice;

    inclusions.forEach((inc) => {
      if (inc.active) {
        if (!inc.applicableShapes || inc.applicableShapes.includes(shape)) {
          total += inc.price;
        }
      }
    });

    if (customText.trim().length > 0 && shape !== 'keychain-initial') {
      total += 149;
    }

    if (standOption === 'teak-wood') total += 399;
    else if (standOption === 'walnut-wood') total += 499;
    else if (standOption === 'brass-pegs') total += 199;
    else if (standOption === 'acrylic-stand') total += 149;

    return Math.round(total);
  },

  calculateBOM: () => {
    const { shape, inclusions, resinFinish, standOption, customText } = get();
    const shapeConfig = SHAPE_CONFIGS[shape];
    const grams = shapeConfig.resinGrams;

    const partA = Number(((grams * 2) / 3).toFixed(1));
    const partB = Number(((grams * 1) / 3).toFixed(1));
    const micaGrams = Number((grams * 0.03).toFixed(1));
    const materialCost = Math.round(grams * 0.85 + micaGrams * 2.5);

    const components: string[] = [
      `${partA}g 2:1 Ultra-Clear Epoxy Resin (Part A)`,
      `${partB}g Hardener (Part B)`,
      `${micaGrams}g ${RESIN_FINISHES[resinFinish].name} Pigment Blend`,
    ];

    inclusions.forEach((inc) => {
      if (inc.active && (!inc.applicableShapes || inc.applicableShapes.includes(shape))) {
        components.push(inc.name);
      }
    });

    if (customText.trim().length > 0) {
      components.push(`Custom 3D Metallic Lettering ("${customText}")`);
    }

    if (standOption !== 'none') {
      components.push(`Hardware (${standOption.replace('-', ' ').toUpperCase()})`);
    }

    return {
      resinPartAGrams: partA,
      hardenerPartBGrams: partB,
      totalResinGrams: grams,
      micaPigmentGrams: micaGrams,
      estimatedMaterialCost: materialCost,
      cureTimeHours: shape === 'keychain-initial' ? 12 : 24,
      componentsList: components,
    };
  },

  loadPreset: (presetName) => {
    if (presetName === 'nameplate') {
      set({
        shape: 'nameplate-rect',
        resinFinish: 'sapphire-ocean',
        customText: "The Sharma's",
        subText: 'Bungalow 42',
        textFinish: 'gold',
        fontFamily: 'serif',
        textPosX: 0,
        textPosY: 0,
        textRotation: 0,
        standOption: 'brass-pegs',
        inclusions: DEFAULT_INCLUSIONS.map((inc) => ({
          ...inc,
          active: inc.id === 'gold-flakes' || inc.id === 'gold-gild-edge',
        })),
      });
    } else if (presetName === 'keychain') {
      set({
        shape: 'keychain-initial',
        resinFinish: 'rose-quartz',
        customText: 'A',
        subText: 'Ananya',
        textFinish: 'rose-gold',
        fontFamily: 'serif',
        textPosX: 0,
        textPosY: 0,
        textRotation: 0,
        standOption: 'keychain-ring',
        inclusions: DEFAULT_INCLUSIONS.map((inc) => ({
          ...inc,
          active: inc.id === 'gold-flakes' || inc.id === 'real-flowers' || inc.id === 'keychain-tassel',
        })),
      });
    } else if (presetName === 'thali') {
      set({
        shape: 'thali-puja',
        resinFinish: 'emerald-gold',
        customText: 'शुभ लाभ',
        subText: 'Wedding Platter',
        textFinish: 'gold',
        fontFamily: 'serif',
        textPosX: 0,
        textPosY: 0.55,
        textRotation: 0,
        standOption: 'none',
        inclusions: DEFAULT_INCLUSIONS.map((inc) => ({
          ...inc,
          active: inc.id === 'thali-katoris' || inc.id === 'gold-flakes' || inc.id === 'gold-gild-edge',
        })),
      });
    } else if (presetName === 'frame') {
      set({
        shape: 'frame-photo',
        resinFinish: 'ruby-sunset',
        customText: 'Always & Forever',
        subText: '14.02.2024',
        textFinish: 'gold',
        fontFamily: 'serif',
        textPosX: 0,
        textPosY: 0.95,
        textRotation: 0,
        standOption: 'acrylic-stand',
        inclusions: DEFAULT_INCLUSIONS.map((inc) => ({
          ...inc,
          active: inc.id === 'photo-insert' || inc.id === 'real-flowers' || inc.id === 'fairy-led-lights',
        })),
      });
    } else if (presetName === 'clock') {
      set({
        shape: 'clock-round-12',
        resinFinish: 'galaxy-purple',
        customText: 'The Royal Residence',
        subText: 'EST. 2024',
        textFinish: 'silver',
        fontFamily: 'serif',
        textPosX: 0,
        textPosY: 0.45,
        textRotation: 0,
        standOption: 'none',
        inclusions: DEFAULT_INCLUSIONS.map((inc) => ({
          ...inc,
          active: inc.id === 'gold-flakes' || inc.id === 'quartz-crystals' || inc.id === 'clock-machine',
        })),
      });
    }
  },

  resetCustomizer: () => {
    set({
      shape: 'nameplate-rect',
      resinFinish: 'sapphire-ocean',
      customText: "The Sharma's",
      subText: 'Bungalow 42',
      fontFamily: 'serif',
      textFinish: 'gold',
      textSize: 1.0,
      textPosX: 0,
      textPosY: 0,
      textRotation: 0,
      textPositionPreset: 'center',
      inclusions: DEFAULT_INCLUSIONS,
      standOption: 'brass-pegs',
      lightingPreset: 'luxury',
      cameraPreset: 'hero',
      autoRotate: true,
    });
  },
}));
