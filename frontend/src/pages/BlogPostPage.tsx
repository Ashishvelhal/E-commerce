import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Calendar, User, ArrowLeft, Tag, Loader2, Sparkles } from 'lucide-react';
import { Post } from '../types';
import api from '../services/api';

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/posts/${slug}`);
        setPost(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-amber-700">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-xs font-mono uppercase tracking-widest text-stone-500">
          Loading Article...
        </span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-stone-900" style={{ fontFamily: "'Playfair Display', serif" }}>
          Article Not Found
        </h2>
        <Link to="/blog" className="inline-block text-sm text-amber-700 font-bold hover:underline">
          &larr; Return to Stories
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        to="/blog"
        className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-amber-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to all stories</span>
      </Link>

      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="px-3.5 py-1 rounded-full bg-amber-100/90 text-amber-900 text-xs font-bold border border-amber-300/60 shadow-sm">
            {post.category}
          </span>
          <span className="text-xs text-stone-500 font-medium flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            {new Date(post.createdAt).toLocaleDateString(undefined, {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>

        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 leading-tight tracking-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {post.title}
        </h1>

        <div className="flex items-center gap-3 pt-2">
          <img
            src={post.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt={post.author?.name || 'Artisan'}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-amber-400/60 shadow-sm"
          />
          <div>
            <div className="text-sm sm:text-base font-bold text-stone-900">
              {post.author?.name || 'Rasin Arts Master Artisan'}
            </div>
            <div className="text-xs text-stone-500 font-medium">Master Artisan &bull; Editorial Contributor</div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl overflow-hidden aspect-[16/9] border border-stone-200 shadow-xl bg-stone-100">
        <img src={post.bannerImage} alt={post.title} className="w-full h-full object-cover object-center" />
      </div>

      <div className="prose prose-stone max-w-none text-stone-800 text-base sm:text-lg leading-relaxed whitespace-pre-line font-sans border-b border-stone-200 pb-8">
        {post.content}
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="pt-2 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Tags:</span>
          {post.tags.map((t, i) => (
            <span
              key={i}
              className="px-3.5 py-1 bg-stone-100 hover:bg-amber-50 border border-stone-200 hover:border-amber-300 rounded-xl text-xs font-semibold text-stone-700 transition-colors"
            >
              #{t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
