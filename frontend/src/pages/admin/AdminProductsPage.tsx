import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Box, Sparkles, Loader2, Search } from 'lucide-react';
import { Product } from '../../types';
import { AdminNavbar } from '../../components/admin/AdminNavbar';
import { ProductModal } from '../../components/admin/ProductModal';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';

import { TableSkeleton } from '../../components/common/Skeletons';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToastStore();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products?limit=100');
      setProducts(res.data.data || []);
    } catch (err) {
      console.error('Error fetching admin products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      addToast('Product deleted successfully', 'success');
      fetchProducts();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <AdminNavbar
        title="Product & 3D Asset Management"
        subtitle="Create, update, upload 3D models and manage prices & stock"
      />

      <div className="p-3 xs:p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-art-600" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by title or category..."
              className="w-full bg-white border border-art-700 rounded-xl pl-10 pr-4 py-2.5 sm:py-2 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500"
            />
          </div>

          <button
            onClick={() => {
              setSelectedProduct(null);
              setIsModalOpen(true);
            }}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-art-300 text-xs font-bold shadow-lg glow-brand flex items-center justify-center gap-2 transition-all shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New 3D Product</span>
          </button>
        </div>
        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : (
          <div className="bg-white border border-art-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto touch-pan-x">
              <table className="w-full min-w-[700px] text-left text-xs text-art-400">
                <thead className="bg-art-900 border-b border-art-800 text-art-500 uppercase font-semibold">
                  <tr>
                    <th className="p-3.5 sm:p-4">Product</th>
                    <th className="p-3.5 sm:p-4">Category</th>
                    <th className="p-3.5 sm:p-4">Price</th>
                    <th className="p-3.5 sm:p-4">Stock</th>
                    <th className="p-3.5 sm:p-4">3D Status</th>
                    <th className="p-3.5 sm:p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-art-800/60">
                  {filtered.map((product) => (
                    <tr key={product._id} className="hover:bg-art-900 transition-colors">
                      <td className="p-3.5 sm:p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.thumbnail}
                            alt=""
                            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover bg-art-950 border border-art-800 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-art-300 max-w-[220px] sm:max-w-xs truncate">
                              {product.title}
                            </div>
                            <div className="text-[11px] text-art-600 font-mono truncate">
                              /{product.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 sm:p-4 font-medium">{product.category}</td>

                      <td className="p-3.5 sm:p-4">
                        <span className="font-bold text-art-300 font-mono">
                          ₹{(product.discountPrice || product.price).toFixed(2)}
                        </span>
                        {product.discountPrice && (
                          <span className="text-[10px] text-art-600 line-through block font-mono">
                            ₹{product.price.toFixed(2)}
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 sm:p-4">
                        <span
                          className={`font-semibold ${
                            product.stock <= 5 ? 'text-rose-600 font-bold' : 'text-emerald-600'
                          }`}
                        >
                          {product.stock} units
                        </span>
                      </td>

                      <td className="p-3.5 sm:p-4">
                        {product.model3d?.url ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-50 border border-cyan-500/30 text-cyan-700 font-bold text-[10px]">
                            <Box className="w-3 h-3" />
                            <span>WebGL Enabled</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-art-600">2D Only</span>
                        )}
                      </td>

                      <td className="p-3.5 sm:p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsModalOpen(true);
                            }}
                            className="p-2 sm:p-2.5 rounded-xl bg-art-900 hover:bg-art-800 text-art-400 hover:text-art-300 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="p-2 sm:p-2.5 rounded-xl bg-art-950 hover:bg-rose-50 text-art-500 hover:text-rose-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        onSaved={fetchProducts}
      />
    </div>
  );
};
