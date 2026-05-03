import { useState, useEffect, useCallback } from 'react';
import { useIdentity } from '../../identity/context/IdentityContext';
import { publishPost, fetchAllPosts, deletePost, uploadImage, uploadVideo, getResourceUrl } from '../../../services/qdn/blogQdnService';
import RichTextEditor from '../components/RichTextEditor';
import TipModal from '../../tip/components/TipModal';

interface Post {
  name: string; identifier: string; title: string; content: string;
  createdAt: number; imageIds?: string[]; videoIds?: string[];
}

const HomePage = () => {
  const { isDeveloper, activeName } = useIdentity();
  const [showEditor, setShowEditor] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try { setPosts(await fetchAllPosts()); } catch { /* */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const handlePublish = async () => {
    if (!title.trim() || !activeName) return;
    setPublishing(true); setStatusMsg('');
    try {
      await publishPost(activeName, title.trim(), content);
      setTitle(''); setContent(''); setShowEditor(false);
      setStatusMsg('✅ Post published!');
      await loadPosts();
    } catch (e: any) { setStatusMsg(`❌ ${e?.message ?? 'Failed to publish'}`); }
    setPublishing(false);
  };

  const handleDelete = async (post: Post) => {
    if (!confirm('Delete this post?')) return;
    try {
      await deletePost(post.name, post.identifier, post.title);
      setStatusMsg('🗑️ Post deleted');
      await loadPosts();
    } catch (e: any) { setStatusMsg(`❌ ${e?.message ?? 'Delete failed'}`); }
  };

  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeName) return;
    setUploading(true);
    try {
      const { identifier } = await uploadImage(activeName, file);
      const url = await getResourceUrl('IMAGE', activeName, identifier);
      setContent(prev => `${prev}<p><img src="${url}" alt="${file.name}" style="max-width:100%" /></p>`);
    } catch (e: any) { setStatusMsg(`❌ ${e?.message ?? 'Upload failed'}`); }
    setUploading(false);
    e.target.value = '';
  };

  const handleAddVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeName) return;
    setUploading(true);
    try {
      const { identifier } = await uploadVideo(activeName, file);
      const url = await getResourceUrl('VIDEO', activeName, identifier);
      setContent(prev => `${prev}<p><video src="${url}" controls style="max-width:100%" /></p>`);
    } catch (e: any) { setStatusMsg(`❌ ${e?.message ?? 'Upload failed'}`); }
    setUploading(false);
    e.target.value = '';
  };


  return (
    <div className="blog-page">
      <div className="blog-page__header">
        <h2>🌲 Wildlife Blog</h2>
        {isDeveloper && (
          <button className="btn btn--primary" onClick={() => setShowEditor(!showEditor)}>
            {showEditor ? '✕ Close' : '✏️ New Post'}
          </button>
        )}
      </div>

      {statusMsg && <div className="blog-status">{statusMsg}</div>}

      {isDeveloper && showEditor && (
        <div className="blog-editor">
          <div className="blog-editor__field">
            <input type="text" placeholder="Post title..." className="blog-editor__input"
              value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="blog-editor__field">
            <RichTextEditor value={content} onChange={setContent} placeholder="Write your blog post..." />
          </div>
          <div className="blog-editor__actions">
            <label className="btn btn--secondary" style={{ cursor: uploading ? 'wait' : 'pointer' }}>
              📷 {uploading ? 'Uploading...' : 'Add Image'}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAddImage} disabled={uploading} />
            </label>
            <label className="btn btn--secondary" style={{ cursor: uploading ? 'wait' : 'pointer' }}>
              🎬 {uploading ? 'Uploading...' : 'Add Video'}
              <input type="file" accept="video/*" style={{ display: 'none' }} onChange={handleAddVideo} disabled={uploading} />
            </label>
            <button className="btn btn--primary" onClick={handlePublish} disabled={publishing || !title.trim()}>
              {publishing ? 'Publishing...' : '📤 Publish'}
            </button>
          </div>
        </div>
      )}

      <div className="blog-posts">
        {loading ? <p className="blog-empty">Loading posts...</p> :
         posts.length === 0 ? <p className="blog-empty">No posts yet. Check back soon!</p> :
         posts.map(post => (
           <article key={post.identifier} className="blog-card">
             <div className="blog-card__header">
               <h3>{post.title}</h3>
               <span className="blog-card__date">{new Date(post.createdAt).toLocaleDateString()}</span>
             </div>
             <div className="blog-card__body" dangerouslySetInnerHTML={{ __html: post.content }} />
             {isDeveloper && post.name === activeName && (
               <button className="blog-card__delete" onClick={() => handleDelete(post)} title="Delete">🗑️</button>
             )}
           </article>
         ))}
      </div>

      <div className="blog-footer">
        <button className="btn btn--outline" onClick={() => setTipOpen(true)}>💚 Support this blog</button>
      </div>

      <TipModal open={tipOpen} onClose={() => setTipOpen(false)} />

      <style>{`
        .blog-page { max-width: 800px; margin: 0 auto; }
        .blog-page__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .blog-page__header h2 { margin: 0; }
        .blog-status { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; background: var(--blog-surface, #FAF8F4); border: 1px solid var(--blog-border, #D6D2C8); font-size: .9rem; }
        .blog-empty { color: #9E9A8E; text-align: center; padding: 48px; font-style: italic; }
        .blog-editor { background: var(--blog-surface, #FAF8F4); border: 1px solid var(--blog-border, #D6D2C8); border-radius: 12px; padding: 24px; margin-bottom: 24px; }
        .blog-editor__field { margin-bottom: 16px; }
        .blog-editor__input { width: 100%; padding: 12px; border: 1px solid var(--blog-border, #D6D2C8); border-radius: 8px; font-size: 1.1rem; font-family: Inter, sans-serif; background: var(--blog-bg, #F5F3EE); color: var(--blog-text, #2C2A26); }
        .blog-editor__actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
        .blog-posts { display: flex; flex-direction: column; gap: 20px; }
        .blog-card { background: var(--blog-surface, #FAF8F4); border: 1px solid var(--blog-border, #D6D2C8); border-radius: 12px; padding: 24px; position: relative; }
        .blog-card__header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .blog-card__header h3 { margin: 0; font-size: 1.3rem; color: var(--blog-primary, #3D5A2E); }
        .blog-card__date { color: var(--blog-text-sec, #5C584E); font-size: .8rem; white-space: nowrap; }
        .blog-card__body { font-size: .95rem; line-height: 1.6; }
        .blog-card__body img, .blog-card__body video { max-width: 100%; border-radius: 8px; margin: 8px 0; }
        .blog-card__delete { position: absolute; top: 8px; right: 8px; background: none; border: none; cursor: pointer; font-size: 1rem; opacity: .5; }
        .blog-card__delete:hover { opacity: 1; }
        .blog-footer { text-align: center; margin-top: 48px; padding: 24px; border-top: 1px solid var(--blog-border, #D6D2C8); }
      `}</style>
    </div>
  );
};

export default HomePage;
