import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Layers, Loader2, Search, LayoutGrid, LayoutList } from 'lucide-react';
import { Category } from '../../types';
import { AdminNavbar } from '../../components/admin/AdminNavbar';
import { CategoryModal } from '../../components/admin/CategoryModal';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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

          <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
            {/* View Mode Toggle Switch */}
            <div className="flex items-center gap-1 p-1 bg-white border border-art-800 rounded-xl shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'grid'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-art-500 hover:text-art-300 hover:bg-art-900'
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'list'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-art-500 hover:text-art-300 hover:bg-art-900'
                }`}
                title="Table List View"
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
            </div>

            <button
              onClick={() => {
                setSelectedCategory(null);
                setIsModalOpen(true);
              }}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg glow-brand flex items-center justify-center gap-2 transition-all shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 text-brand-700">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-mono uppercase tracking-widest text-art-500">
              Loading Categories...
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center bg-white border border-art-800 rounded-3xl text-art-500 space-y-2">
            <Layers className="w-8 h-8 mx-auto text-art-600" />
            <h3 className="text-base font-bold text-art-300">No Categories Found</h3>
            <p className="text-xs">No categories match your search keyword &quot;{search}&quot;.</p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Cards Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((cat) => (
              <div
                key={cat._id}
                className="rounded-3xl bg-white border border-art-800 overflow-hidden flex flex-col justify-between shadow-md hover:border-brand-500/40 transition-all group"
              >
                <div>
                  <div className="aspect-[4/3] bg-art-950 relative overflow-hidden">
                    <img
                      src={cat.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-bold">
                        /{cat.slug}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 space-y-1.5">
                    <h3 className="text-sm font-bold text-art-300 group-hover:text-brand-700 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-art-500 line-clamp-2 leading-relaxed">
                      {cat.description || 'No description provided'}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-art-950 border-t border-art-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setSelectedCategory(cat);
                      setIsModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-800 text-xs font-bold transition-colors flex items-center gap-1.5"
                    title="Edit Category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="p-1.5 rounded-xl text-art-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table / List View */
          <div className="bg-white border border-art-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto touch-pan-x">
              <table className="w-full min-w-[700px] text-left text-xs text-art-400">
                <thead className="bg-art-900 border-b border-art-800 text-art-500 uppercase font-semibold">
                  <tr>
                    <th className="p-3.5 sm:p-4">Category</th>
                    <th className="p-3.5 sm:p-4">Slug URL</th>
                    <th className="p-3.5 sm:p-4">Description</th>
                    <th className="p-3.5 sm:p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-art-800/60">
                  {filtered.map((cat) => (
                    <tr key={cat._id} className="hover:bg-art-900 transition-colors">
                      <td className="p-3.5 sm:p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={cat.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover bg-art-950 border border-art-800 shrink-0"
                          />
                          <div className="font-bold text-art-300 text-sm">
                            {cat.name}
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 sm:p-4">
                        <span className="font-mono text-xs text-brand-700 font-bold">
                          /{cat.slug}
                        </span>
                      </td>

                      <td className="p-3.5 sm:p-4 max-w-md">
                        <p className="text-xs text-art-500 line-clamp-2">
                          {cat.description || 'No description provided'}
                        </p>
                      </td>

                      <td className="p-3.5 sm:p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                          <button
                            onClick={() => {
                              setSelectedCategory(cat);
                              setIsModalOpen(true);
                            }}
                            className="p-2 sm:p-2.5 rounded-xl bg-art-900 hover:bg-art-800 text-art-400 hover:text-art-300 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat._id)}
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

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
        onSaved={fetchCategories}
      />
    </div>
  );
};
