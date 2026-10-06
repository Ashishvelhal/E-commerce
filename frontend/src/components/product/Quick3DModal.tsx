import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ArrowRight, Palette, Check } from 'lucide-react';
import { Product } from '../../types';
import { ProductCanvas } from '../3d/ProductCanvas';
import { useCartStore } from '../../store/useCartStore';
import { useToastStore } from '../../store/useToastStore';

interface Quick3DModalProps {
  product: Product | null;
  onClose: () => void;
}

export const Quick3DModal: React.FC<Quick3DModalProps> = ({ product, onClose }) => {
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product?.model3d?.availableColors?.[0]?.hex
  );
  const [selectedColorName, setSelectedColorName] = useState<string | undefined>(
    product?.model3d?.availableColors?.[0]?.name
  );
  const { addItem } = useCartStore();
  const { addToast } = useToastStore();

  if (!product) return null;

  const handleAddToCart = () => {
    addItem(product, 1, selectedColorName);
    addToast(`Added "${product.title}" to cart!`, 'success');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-art-950/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="relative w-full max-w-3xl bg-art-950 border border-art-800 rounded-3xl shadow-2xl overflow-hidden z-10 my-8"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-art-950/80 text-art-500 hover:text-white border border-art-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-4 bg-art-950 flex flex-col justify-center">
              <ProductCanvas
                modelConfig={product.model3d}
                selectedColor={selectedColor}
                className="h-[360px] w-full"
              />
            </div>
            <div className="p-6 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">
                  {product.category}
                </span>
                <h2 className="text-xl font-bold text-white mt-1">{product.title}</h2>
                <p className="text-xs text-art-500 mt-2 line-clamp-3 leading-relaxed">
                  {product.description}
                </p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white font-mono">
                    ${(product.discountPrice || product.price).toFixed(2)}
                  </span>
                  {product.discountPrice && (
                    <span className="text-sm text-art-600 line-through font-mono">
                      ${product.price.toFixed(2)}
                    </span>
                  )}
                </div>
                {product.model3d?.availableColors && product.model3d.availableColors.length > 0 && (
                  <div className="mt-5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-art-400 mb-2">
                      <Palette className="w-3.5 h-3.5 text-brand-400" />
                      <span>Live 3D Color Customizer:</span>
                      <span className="text-brand-400">{selectedColorName}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {product.model3d.availableColors.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => {
                            setSelectedColor(color.hex);
                            setSelectedColorName(color.name);
                          }}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                            selectedColor === color.hex
                              ? 'ring-2 ring-brand-400 ring-offset-2 ring-offset-slate-900 scale-110'
                              : 'opacity-70 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        >
                          {selectedColor === color.hex && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2.5 pt-4 border-t border-art-800">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg glow-brand transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add To Cart</span>
                </button>

                <Link
                  to={`/product/${product.slug}`}
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-art-900 hover:bg-art-850 text-art-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>View Full Product Page & Reviews</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
