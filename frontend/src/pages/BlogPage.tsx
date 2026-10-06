import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { Post } from '../types';
import api from '../services/api';

export const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get('/posts?all=false');
        setPosts(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-brand-600">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-xs font-mono uppercase tracking-widest text-art-500">
          Loading Stories &amp; Articles...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-10 space-y-10">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Artist Insights</span>
        </div>
        <h1
          className="text-3xl sm:text-4xl font-black text-stone-900"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Stories &amp; Innovation Notes
        </h1>
        <p className="text-sm text-stone-600 max-w-xl">
          Deep dives on resin art techniques, creative processes, and behind-the-scenes from our studio.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-stone-300 text-stone-500 text-sm bg-stone-50">
          No stories published yet — check back soon!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post._id}
              className="group rounded-3xl bg-white border border-stone-200 hover:border-amber-400 transition-all duration-300 overflow-hidden flex flex-col shadow-sm hover:shadow-lg"
            >
              <div className="aspect-[16/10] overflow-hidden bg-stone-100">
                <img
                  src={post.bannerImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="flex flex-col flex-1 p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                    {post.category}
                  </span>
                  <span className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-stone-400" />
                    {new Date(post.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <Link to={`/blog/${post.slug}`} className="block">
                  <h2
                    className="text-base font-bold text-stone-900 line-clamp-2 group-hover:text-amber-700 transition-colors"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {post.title}
                  </h2>
                </Link>
                <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed flex-1">
                  {post.summary || post.content}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-stone-200 mt-auto">
                  <div className="flex items-center gap-2 text-xs text-stone-600">
                    <img
                      src={
                        post.author?.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                      }
                      alt=""
                      className="w-6 h-6 rounded-full object-cover border border-amber-200 ring-1 ring-amber-300"
                    />
                    <span className="truncate font-medium text-stone-800">{post.author?.name || 'Studio Team'}</span>
                  </div>

                  <Link
                    to={`/blog/${post.slug}`}
                    className="text-xs font-bold text-amber-700 hover:text-amber-600 flex items-center gap-1 shrink-0"
                  >
                    <span>Read Story</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
