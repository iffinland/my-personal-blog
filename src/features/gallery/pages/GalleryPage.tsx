import { useState, useEffect, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import { useIdentity } from '../../identity/context/IdentityContext';
import { searchMedia, getResourceUrl, uploadImage } from '../../../services/qdn/blogQdnService';

interface MediaItem { name: string; identifier: string; url: string; }

const GalleryPage = () => {
  const { isDeveloper, activeName } = useIdentity();
  const [images, setImages] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<MediaItem | null>(null);

  const loadImages = useCallback(async () => {
    setLoading(true);
    try {
      const results = await searchMedia('IMAGE', 'wb-img-');
      const items = await Promise.all(results.map(async (r) => {
        try { return { name: r.name, identifier: r.identifier, url: await getResourceUrl('IMAGE', r.name, r.identifier) }; }
        catch { return null; }
      }));
      setImages(items.filter((i): i is MediaItem => i !== null));
    } catch { /* */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadImages(); }, [loadImages]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !activeName) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      try {
        const { identifier } = await uploadImage(activeName, file);
        const url = await getResourceUrl('IMAGE', activeName, identifier);
        setImages(prev => [{ name: activeName, identifier, url }, ...prev]);
      } catch { /* */ }
    }
    setUploading(false);
    e.target.value = '';
  };

  return (
    <div className="gallery-page">
      <div className="gallery-header">
        <h2>📷 Photo Gallery</h2>
        {isDeveloper && (
          <label className="btn btn--primary" style={{ cursor: uploading ? 'wait' : 'pointer' }}>
            {uploading ? 'Uploading...' : '📤 Upload Photos'}
            <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleUpload} disabled={uploading} />
          </label>
        )}
      </div>
      <div className="gallery-grid">
        {loading ? <p className="empty-state">Loading...</p> :
         images.length === 0 ? <p className="empty-state">No photos yet.</p> :
         images.map(img => (
           <div key={img.identifier} className="gallery-item" onClick={() => setSelected(img)}>
             <img src={img.url} alt={img.identifier} loading="lazy" />
           </div>
         ))}
      </div>
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="lg">
        {selected && <img src={selected.url} alt="" style={{ maxWidth: '100%', maxHeight: '90vh' }} />}
      </Dialog>
      <style>{`
        .gallery-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .gallery-header h2 { margin: 0; }
        .edit-banner { background: var(--blog-accent, #5A7F3E); color: #fff; text-align: center; padding: 8px; border-radius: 8px; margin-bottom: 16px; font-size: .85rem; }
        .empty-state { color: #9E9A8E; text-align: center; padding: 48px; font-style: italic; }
        .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
        .gallery-item { border-radius: 8px; overflow: hidden; cursor: pointer; border: 1px solid var(--blog-border, #D6D2C8); aspect-ratio: 1; }
        .gallery-item img { width: 100%; height: 100%; object-fit: cover; transition: transform .2s; }
        .gallery-item img:hover { transform: scale(1.05); }
      `}</style>
    </div>
  );
};

export default GalleryPage;
