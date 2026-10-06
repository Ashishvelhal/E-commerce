import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Layers, Loader2, Search } from 'lucide-react';
import { Category } from '../../types';
import { AdminNavbar } from '../../components/admin/AdminNavbar';
import { CategoryModal } from '../../components/admin/CategoryModal';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToastStore();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products/categories');
      setCategories(res.data.data.all || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/products/categories/${id}`);
      addToast('Category deleted successfully', 'success');
      fetchCategories();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <AdminNavbar
        title="Store Categories Manager"
        subtitle="Manage product departments, taxonomy, and category images"
      />

      <div className="p-3 xs:p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-art-600" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search category name..."
              className="w-full bg-white border border-art-700 rounded-xl pl-10 pr-4 py-2.5 sm:py-2 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500"
            />
          </div>

          <button
            onClick={() => {
              setSelectedCategory(null);
              setIsModalOpen(true);
            }}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-art-300 text-xs font-bold shadow-lg glow-brand flex items-center justify-center gap-2 transition-all shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Category</span>
          </button>
        </div>

        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 text-brand-700">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-mono uppercase tracking-widest text-art-500">
              Loading Categories...
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((cat) => (
              <div
                key={cat._id}
                className="rounded-2xl bg-art-950 border border-art-800 overflow-hidden flex flex-col justify-between shadow-xl hover:border-brand-500/30 transition-all"
              >
                <div>
                  <div className="aspect-[4/3] bg-art-950">
                    <img
                      src={cat.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 space-y-1.5">
                    <h3 className="text-sm font-bold text-art-300">{cat.name}</h3>
                    <p className="text-xs text-art-500 line-clamp-2">
                      {cat.description || 'No description provided'}
                    </p>
                    <span className="text-[10px] font-mono text-cyan-700">
                      slug: /{cat.slug}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-art-900 border-t border-art-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setSelectedCategory(cat);
                      setIsModalOpen(true);
                    }}
                    className="p-2 sm:p-1.5 bg-art-900 hover:bg-art-800 text-art-400 hover:text-art-300 rounded-lg transition-colors"
                    title="Edit Category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="p-2 sm:p-1.5 bg-art-950 hover:bg-rose-50 text-art-500 hover:text-rose-600 rounded-lg transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
        onSaved={fetchCategories}
      />
    </div>
  );
};
