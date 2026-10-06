import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Image, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Banner } from '../../types';
import { AdminNavbar } from '../../components/admin/AdminNavbar';
import { BannerModal } from '../../components/admin/BannerModal';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';

export const AdminBannersPage: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToastStore();

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await api.get('/banners/admin');
      setBanners(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      await api.delete(`/banners/${id}`);
      addToast('Banner deleted successfully', 'success');
      fetchBanners();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Delete failed', 'error');
    }
  };

  return (
    <div>
      <AdminNavbar
        title="Banners & Promotions Manager"
        subtitle="Manage storefront hero slides, promo cards, and call-to-action banners"
      />

      <div className="p-3 xs:p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div className="text-xs text-art-500 font-medium">
            Total Banners: <span className="font-bold text-art-300">{banners.length}</span>
          </div>

          <button
            onClick={() => {
              setSelectedBanner(null);
              setIsModalOpen(true);
            }}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-art-300 text-xs font-bold shadow-lg glow-brand flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Banner</span>
          </button>
        </div>

        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 text-brand-700">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-mono uppercase tracking-widest text-art-500">
              Loading Banners...
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {banners.map((banner) => (
              <div
                key={banner._id}
                className="rounded-2xl bg-art-950 border border-art-800 overflow-hidden flex flex-col justify-between shadow-xl hover:border-brand-500/30 transition-all"
              >
                <div>
                  <div className="aspect-[16/9] bg-art-950 relative">
                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 text-[10px] font-bold text-cyan-700 border border-cyan-500/30 uppercase">
                        {banner.position}
                      </span>
                      {banner.isActive ? (
                        <span className="px-2 py-0.5 rounded-full bg-green-50 text-[10px] font-bold text-green-700 border border-green-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-white text-[10px] font-bold text-art-500 border border-art-700">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    {banner.badge && (
                      <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider block">
                        {banner.badge}
                      </span>
                    )}
                    <h3 className="text-sm font-bold text-art-300 line-clamp-1">{banner.title}</h3>
                    <p className="text-xs text-art-500 line-clamp-2">{banner.subtitle}</p>
                    <div className="text-[11px] text-art-600 font-mono truncate">
                      Link: {banner.linkUrl}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-art-900 border-t border-art-800 flex items-center justify-between">
                  <span className="text-xs text-art-500 font-medium">
                    Order: #{banner.order}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedBanner(banner);
                        setIsModalOpen(true);
                      }}
                      className="p-2 sm:p-1.5 bg-art-900 hover:bg-art-800 text-art-400 hover:text-art-300 rounded-lg transition-colors"
                      title="Edit Banner"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(banner._id)}
                      className="p-2 sm:p-1.5 bg-art-950 hover:bg-rose-50 text-art-500 hover:text-rose-600 rounded-lg transition-colors"
                      title="Delete Banner"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BannerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        banner={selectedBanner}
        onSaved={fetchBanners}
      />
    </div>
  );
};
