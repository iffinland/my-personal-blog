import { useState, useEffect, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import { useIdentity } from '../../identity/context/IdentityContext';
import { searchMedia, getResourceUrl, uploadVideo } from '../../../services/qdn/blogQdnService';

interface MediaItem { name: string; identifier: string; url: string; }

const VideoPage = () => {
  const { isDeveloper, activeName } = useIdentity();
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<MediaItem | null>(null);

  const loadVideos = useCallback(async () => {
    setLoading(true);
    try {
      const results = await searchMedia('VIDEO', 'wb-vid-');
      const items = await Promise.all(results.map(async (r) => {
        try { return { name: r.name, identifier: r.identifier, url: await getResourceUrl('VIDEO', r.name, r.identifier) }; }
        catch { return null; }
      }));
      setVideos(items.filter((i): i is MediaItem => i !== null));
    } catch { /* */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadVideos(); }, [loadVideos]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeName) return;
    setUploading(true);
    try {
      const { identifier } = await uploadVideo(activeName, file);
      const url = await getResourceUrl('VIDEO', activeName, identifier);
      setVideos(prev => [{ name: activeName, identifier, url }, ...prev]);
    } catch { /* */ }
    setUploading(false);
    e.target.value = '';
  };

  return (
    <div className="video-page">
      <div className="video-header">
        <h2>🎬 Videos</h2>
        {isDeveloper && (
          <label className="btn btn--primary" style={{ cursor: uploading ? 'wait' : 'pointer' }}>
            {uploading ? 'Uploading...' : '📤 Upload Video'}
            <input type="file" accept="video/*" style={{ display: 'none' }} onChange={handleUpload} disabled={uploading} />
          </label>
        )}
      </div>
      <div className="video-grid">
        {loading ? <p className="empty-state">Loading...</p> :
         videos.length === 0 ? <p className="empty-state">No videos yet.</p> :
         videos.map(v => (
           <div key={v.identifier} className="video-card" onClick={() => setSelected(v)}>
             <video src={v.url} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8 }} />
             <p className="video-card__title">{v.identifier.slice(8, 20)}...</p>
           </div>
         ))}
      </div>
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="md" fullWidth>
        {selected && <video src={selected.url} controls style={{ width: '100%', maxHeight: '80vh' }} autoPlay />}
      </Dialog>
      <style>{`
        .video-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .video-header h2 { margin: 0; }
        .empty-state { color: #9E9A8E; text-align: center; padding: 48px; font-style: italic; }
        .video-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .video-card { border: 1px solid var(--blog-border, #D6D2C8); border-radius: 8px; overflow: hidden; cursor: pointer; background: var(--blog-surface, #FAF8F4); }
        .video-card__title { padding: 8px 12px; margin: 0; font-size: .85rem; color: var(--blog-text-sec, #5C584E); }
      `}</style>
    </div>
  );
};

export default VideoPage;
