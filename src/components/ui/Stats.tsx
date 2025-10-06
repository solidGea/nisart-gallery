import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import getApiBase from '../../lib/api';
import { Skeleton } from './skeleton';

type StatsData = {
  totalImages: number;
  totalCategories: number;
  totalTags: number;
  featuredAlbums: number;
  topCategories: Array<{ name: string; image_count: number }>;
  recentUploads?: Array<{ id: string; title: string; filename: string; created_at: string }>;
};

// Use centralized API base resolver
const useApiBase = () => getApiBase();

function useAnimatedNumber(value: number, duration = 600) {
  const [num, setNum] = useState(0);

  useEffect(() => {
    let rafId: number;
    const start = performance.now();
    const from = 0;
    const to = value;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOutQuad-like
      setNum(Math.floor(from + (to - from) * eased));
      if (t < 1) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [value, duration]);

  return num;
}

export const Stats: React.FC = () => {
  const API_BASE = useApiBase();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const url = `${API_BASE}/stats`;

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (!mounted) return;
        if (json && json.success && json.data) {
          setStats(json.data as StatsData);
        } else {
          setError('Failed to load stats');
        }
      })
      .catch((err) => {
        console.error('Stats fetch error', err);
        if (mounted) setError(err.message || 'Network error');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [API_BASE]);

  const totalImagesAnim = useAnimatedNumber(stats?.totalImages || 0);
  const totalCategoriesAnim = useAnimatedNumber(stats?.totalCategories || 0);
  // const featuredAlbumsAnim = useAnimatedNumber(stats?.featuredAlbums || 0);

  if (loading) {
    return (
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-black/20 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="mt-12 text-center text-sm text-red-400">Unable to load stats. {error}</div>
    );
  }

  return (
    <div className="mt-12">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="p-6 bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 text-center">
        <div className="text-4xl font-extrabold text-white drop-shadow-lg">{totalImagesAnim}+</div>
        <div className="text-sm text-gray-300">Epic Images</div>
      </div>

      <div className="p-6 bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 text-center">
        <div className="text-4xl font-extrabold text-white drop-shadow-lg">{totalCategoriesAnim}</div>
        <div className="text-sm text-gray-300">Cool Categories</div>
      </div>

      {/* <div className="p-6 bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 text-center">
        <div className="text-4xl font-extrabold text-white drop-shadow-lg">{featuredAlbumsAnim}</div>
        <div className="text-sm text-gray-300">Featured Albums</div>
      </div> */}

      <div className="p-6 bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10">
        <div className="text-lg font-bold text-white mb-2">Top Categories</div>
        <div className="flex flex-col gap-2">
          {stats.topCategories && stats.topCategories.length > 0 ? (
            stats.topCategories.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-400 to-purple-400" />
                  <div className="font-medium">{c.name}</div>
                </div>
                <div className="text-xs text-cyan-300 font-bold">{c.image_count}</div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-400">No categories yet</div>
          )}
        </div>
      </div>
      </div>
      {/* Recent uploads carousel */}
      <div className="mt-6">
        <h3 className="text-lg font-bold text-white mb-3">Recent Uploads</h3>
        {loading ? (
          <div className="flex space-x-4 overflow-x-auto pb-4 -mx-2 px-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="relative w-44 flex-shrink-0 rounded-2xl overflow-hidden bg-black/20 border border-white/10">
                <Skeleton className="w-full h-28" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : stats.recentUploads && stats.recentUploads.length > 0 ? (
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll-right-to-left">
              {/* Duplicate the items for seamless loop */}
              {[...stats.recentUploads, ...stats.recentUploads].map((u, index) => (
                <Link
                  to={`/image/${u.id}`}
                  key={`${u.id}-${index}`}
                  className="relative w-44 flex-shrink-0 mx-2 rounded-2xl overflow-hidden bg-black/20 border border-white/10 hover:border-purple-400/50 transition-all duration-300"
                >
                  <img
                    src={`${getApiBase()}/images/${u.id}/thumbnail`}
                    alt={u.title}
                    className="w-full h-28 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGR5PSIuM2VtIiBmaWxsPSIjODg4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE0Ij5Ob8gaW1hZ2U8L3RleHQ+PC9zdmc+';
                    }}
                  />
                  <div className="p-3">
                    <div className="text-sm font-semibold text-white truncate">{u.title || 'Untitled'}</div>
                    <div className="text-xs text-gray-400">{new Date(u.created_at).toLocaleDateString()}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-400">No recent uploads yet.</div>
        )}
      </div>
    </div>
  );
};

export default Stats;
