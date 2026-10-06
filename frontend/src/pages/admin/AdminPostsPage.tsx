import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, FileText, Loader2, Search } from 'lucide-react';
import { Post } from '../../types';
import { AdminNavbar } from '../../components/admin/AdminNavbar';
import { PostModal } from '../../components/admin/PostModal';
import { useToastStore } from '../../store/useToastStore';
import api from '../../services/api';

export const AdminPostsPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToastStore();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/posts?all=true');
      setPosts(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/posts/${id}`);
      addToast('Post deleted successfully', 'success');
      fetchPosts();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <AdminNavbar
        title="Dynamic Posts & Editorial Content"
        subtitle="Publish store announcements, product launch articles, and design updates"
      />

      <div className="p-3 xs:p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-art-600" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts..."
              className="w-full bg-white border border-art-700 rounded-xl pl-10 pr-4 py-2.5 sm:py-2 text-xs text-art-300 placeholder-art-600 focus:outline-none focus:border-brand-500"
            />
          </div>

          <button
            onClick={() => {
              setSelectedPost(null);
              setIsModalOpen(true);
            }}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-art-300 text-xs font-bold shadow-lg glow-brand flex items-center justify-center gap-2 transition-all shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Article</span>
          </button>
        </div>

        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 text-brand-700">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-mono uppercase tracking-widest text-art-500">
              Loading Posts...
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((post) => (
              <div
                key={post._id}
                className="rounded-2xl bg-art-950 border border-art-800 overflow-hidden flex flex-col justify-between shadow-xl hover:border-brand-500/30 transition-all"
              >
                <div>
                  <div className="aspect-video bg-art-950">
                    <img src={post.bannerImage} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 sm:p-5 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-bold">
                        {post.category}
                      </span>
                      <span className="text-[10px] text-art-600">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-art-300 line-clamp-1">{post.title}</h3>
                    <p className="text-xs text-art-500 line-clamp-2">{post.summary || post.content}</p>
                  </div>
                </div>

                <div className="p-3 sm:p-4 bg-art-900 border-t border-art-800 flex items-center justify-between">
                  <span className="text-xs text-art-500 truncate max-w-[150px]">
                    By {post.author?.name || 'Admin'}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setSelectedPost(post);
                        setIsModalOpen(true);
                      }}
                      className="p-2 sm:p-1.5 bg-art-900 hover:bg-art-800 text-art-400 hover:text-art-300 rounded-lg transition-colors"
                      title="Edit Article"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(post._id)}
                      className="p-2 sm:p-1.5 bg-art-950 hover:bg-rose-50 text-art-500 hover:text-rose-600 rounded-lg transition-colors"
                      title="Delete Article"
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

      <PostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        post={selectedPost}
        onSaved={fetchPosts}
      />
    </div>
  );
};
