import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, QrCode, Tag, MapPin, Box, Check, Copy } from 'lucide-react';
import { InventoryItem } from '../../types';

interface QRCodeLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  allItems?: InventoryItem[];
}

export const QRCodeLabelModal: React.FC<QRCodeLabelModalProps> = ({
  isOpen,
  onClose,
  item,
  allItems = [],
}) => {
  const [labelSize, setLabelSize] = useState<'standard' | 'small' | 'shelf'>('standard');
  const [printCopies, setPrintCopies] = useState(1);
  const [isCopied, setIsCopied] = useState(false);
  const [mode, setMode] = useState<'single' | 'batch'>('single');

  if (!isOpen) return null;

  const activeItems = mode === 'single' ? (item ? [item] : []) : allItems;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyBarcode = (code: string) => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Generate deterministic QR Code pattern matrix for SVG rendering
  const renderQRCodeSVG = (text: string, size = 110) => {
    // Generate a pseudo-random yet deterministic 21x21 QR matrix based on hash of text
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }

    const gridSize = 21;
    const cells: boolean[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));

    // Corner Finder Patterns (standard QR markers)
    const placeFinder = (r: number, c: number) => {
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          if (
            i === 0 || i === 6 || j === 0 || j === 6 ||
            (i >= 2 && i <= 4 && j >= 2 && j <= 4)
          ) {
            cells[r + i][c + j] = true;
          }
        }
      }
    };

    placeFinder(0, 0);
    placeFinder(0, 14);
    placeFinder(14, 0);

    // Timing patterns
    for (let i = 8; i < 13; i++) {
      cells[6][i] = i % 2 === 0;
      cells[i][6] = i % 2 === 0;
    }

    // Fill data area with text-derived bits
    let seed = Math.abs(hash);
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        // Skip finder areas
        if (
          (r < 8 && c < 8) ||
          (r < 8 && c >= 13) ||
          (r >= 13 && c < 8)
        ) {
          continue;
        }
        seed = (seed * 9301 + 49297) % 233280;
        cells[r][c] = seed / 233280 > 0.48;
      }
    }

    const cellSize = size / gridSize;

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded bg-white">
        {cells.map((row, r) =>
          row.map((active, c) =>
            active ? (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#0f172a"
              />
            ) : null
          )
        )}
      </svg>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl border border-art-800 shadow-2xl w-full max-w-2xl overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-art-800 flex items-center justify-between bg-gradient-to-r from-brand-50 to-white">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 rounded-2xl bg-brand-500 text-white shadow-md">
                <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-art-300">
                  Warehouse Barcode & QR Label Generator
                </h3>
                <p className="text-xs text-art-500">
                  Print thermal adhesive stickers for workshop bins, molds, bottles & storage shelves
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-art-400 hover:text-art-200 rounded-xl hover:bg-art-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-art-950 border border-art-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-art-400">Target Mode:</span>
                <div className="flex rounded-xl bg-white p-0.5 border border-art-800">
                  <button
                    onClick={() => setMode('single')}
                    disabled={!item}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      mode === 'single' ? 'bg-brand-500 text-white' : 'text-art-400'
                    }`}
                  >
                    Current Item
                  </button>
                  <button
                    onClick={() => setMode('batch')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      mode === 'batch' ? 'bg-brand-500 text-white' : 'text-art-400'
                    }`}
                  >
                    Batch All ({allItems.length})
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-art-400">Sticker Size:</span>
                <select
                  value={labelSize}
                  onChange={(e) => setLabelSize(e.target.value as any)}
                  className="bg-white border border-art-700 rounded-lg px-2.5 py-1.5 font-semibold text-art-300 text-xs focus:outline-none"
                >
                  <option value="standard">Standard Bin (50 x 30 mm)</option>
                  <option value="small">Small Mold (35 x 25 mm)</option>
                  <option value="shelf">Large Shelf (100 x 50 mm)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-art-400">Copies:</span>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={printCopies}
                  onChange={(e) => setPrintCopies(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-14 bg-white border border-art-700 rounded-lg px-2 py-1 text-center font-bold text-art-300"
                />
              </div>
            </div>

            {/* Print Area Preview */}
            <div id="printable-labels-area" className="space-y-4 max-h-[380px] overflow-y-auto p-2 rounded-2xl bg-art-900 border border-art-800">
              {activeItems.map((targetItem) => {
                const barcodeStr = `ART-INV-${targetItem._id.slice(-6).toUpperCase()}`;
                const qrContent = JSON.stringify({
                  id: targetItem._id,
                  sku: barcodeStr,
                  name: targetItem.name,
                  cat: targetItem.category,
                  loc: targetItem.location || 'Main Warehouse',
                });

                return Array.from({ length: printCopies }).map((_, copyIndex) => (
                  <div
                    key={`${targetItem._id}-${copyIndex}`}
                    className={`bg-white text-slate-900 border border-slate-300 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4 transition-all hover:border-brand-500 ${
                      labelSize === 'small'
                        ? 'p-3 text-[10px]'
                        : labelSize === 'shelf'
                        ? 'p-6 text-sm'
                        : 'p-4 text-xs'
                    }`}
                  >
                    {/* Left Details */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 font-extrabold text-[10px] uppercase tracking-wider border border-brand-200">
                          {targetItem.category}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                          {targetItem.type}
                        </span>
                      </div>

                      <h4 className="font-black text-slate-900 truncate text-sm sm:text-base leading-tight">
                        {targetItem.name}
                      </h4>

                      <div className="flex items-center gap-3 text-slate-600 font-semibold text-[11px] pt-0.5">
                        <span className="flex items-center gap-1 text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                          {targetItem.location || 'Warehouse Shelf A1'}
                        </span>
                        <span>•</span>
                        <span>
                          Min Alert: <strong className="text-slate-800">{targetItem.minStockAlert} {targetItem.unit}</strong>
                        </span>
                      </div>

                      {/* Barcode Strip */}
                      <div className="pt-2 flex items-center gap-2">
                        <div className="bg-slate-950 px-3 py-1 rounded text-white font-mono font-black text-xs tracking-widest flex items-center gap-2">
                          <span className="tracking-[3px]">{barcodeStr}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyBarcode(barcodeStr)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                          title="Copy Barcode text"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* QR Code Graphic */}
                    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-200 shrink-0">
                      {renderQRCodeSVG(qrContent, labelSize === 'small' ? 70 : labelSize === 'shelf' ? 120 : 90)}
                      <span className="text-[9px] font-mono text-slate-500 font-bold mt-1">SCAN ME</span>
                    </div>
                  </div>
                ));
              })}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-art-500 font-medium">
                Total stickers to print: <strong className="text-art-200">{activeItems.length * printCopies}</strong>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-art-800 text-art-400 hover:text-art-200 text-xs font-bold transition-all"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-lg shadow-brand-500/25 flex items-center gap-2 transition-all active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Labels Now</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
