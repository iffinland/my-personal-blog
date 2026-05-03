import { useState, useEffect, useCallback, useRef } from 'react';
import { useIdentity } from '../../identity/context/IdentityContext';
import { postMessage, fetchAllMessages, type GuestbookMessage } from '../../../services/qdn/guestbookQdnService';

const GuestbookPage = () => {
  const { activeName } = useIdentity();
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [_text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setMessages(await fetchAllMessages()); } catch { /* */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    setText(editorRef.current?.innerHTML ?? '');
  };

  const handlePost = async () => {
    const html = editorRef.current?.innerHTML ?? '';
    if (!html.trim() || !activeName) return;
    setSending(true); setStatus('');
    try {
      await postMessage(activeName, html);
      if (editorRef.current) editorRef.current.innerHTML = '';
      setText('');
      setStatus('✅ Message posted!');
      await load();
    } catch (e: any) { setStatus(`❌ ${e?.message ?? 'Failed'}`); }
    setSending(false);
  };

  return (
    <div className="gb-page">
      <h2>📖 Guestbook</h2>
      <p>Leave a message for the wildlife explorer!</p>

      {status && <div className="gb-status">{status}</div>}

      <div className="gb-form">
        <div className="gb-toolbar">
          <button type="button" className="gb-btn" onClick={() => exec('bold')}><b>B</b></button>
          <button type="button" className="gb-btn" onClick={() => exec('italic')}><i>I</i></button>
          <span className="gb-sep" />
          <button type="button" className="gb-btn" onClick={() => exec('formatBlock', 'p')}>¶</button>
        </div>
        <div ref={editorRef} className="gb-editor" contentEditable
          suppressContentEditableWarning data-placeholder="Write your message..."
          style={{ minHeight: 120 }}
          onInput={() => setText(editorRef.current?.innerHTML ?? '')}
        />
        <button className="btn btn--primary" onClick={handlePost} disabled={sending || !activeName}>
          {sending ? 'Posting...' : '📮 Post'}
        </button>
        {!activeName && <p className="gb-hint">Please log in with Qortal to post.</p>}
      </div>

      <div className="gb-messages">
        {loading ? <p className="empty-state">Loading...</p> :
         messages.length === 0 ? <p className="empty-state">No messages yet. Be the first!</p> :
         messages.map((m, i) => (
           <div key={`${m.id}-${i}`} className="gb-msg">
             <div className="gb-msg__header">
               <strong>{m.userName}</strong>
               <span>{new Date(m.createdAt).toLocaleString()}</span>
             </div>
             <div className="gb-msg__body" dangerouslySetInnerHTML={{ __html: m.message }} />
           </div>
         ))}
      </div>

      <style>{`
        .gb-page { max-width: 700px; margin: 0 auto; }
        .gb-page h2 { margin: 0 0 8px; }
        .gb-page > p { color: var(--blog-text-sec, #5C584E); margin: 0 0 24px; }
        .gb-status { padding: 8px 16px; border-radius: 8px; margin-bottom: 16px; background: var(--blog-surface, #FAF8F4); border: 1px solid var(--blog-border, #D6D2C8); font-size: .9rem; }
        .gb-form { background: var(--blog-surface, #FAF8F4); border: 1px solid var(--blog-border, #D6D2C8); border-radius: 12px; padding: 16px; margin-bottom: 32px; }
        .gb-toolbar { display: flex; gap: 2px; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid var(--blog-border, #D6D2C8); }
        .gb-btn { background: none; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: .9rem; }
        .gb-btn:hover { background: var(--blog-border, #D6D2C8); }
        .gb-sep { width: 1px; background: var(--blog-border, #D6D2C8); margin: 2px 8px; }
        .gb-editor { outline: none; padding: 8px 0; min-height: 120px; font-family: Inter, sans-serif; font-size: .95rem; line-height: 1.6; }
        .gb-editor:empty:before { content: attr(data-placeholder); color: #9E9A8E; }
        .gb-form .btn { margin-top: 12px; }
        .gb-hint { color: #9E9A8E; font-size: .8rem; margin: 8px 0 0; }
        .empty-state { color: #9E9A8E; text-align: center; padding: 48px; font-style: italic; }
        .gb-msg { border: 1px solid var(--blog-border, #D6D2C8); border-radius: 8px; padding: 16px; margin-bottom: 12px; background: var(--blog-surface, #FAF8F4); }
        .gb-msg__header { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: .85rem; }
        .gb-msg__header strong { color: var(--blog-primary, #3D5A2E); }
        .gb-msg__header span { color: var(--blog-text-sec, #5C584E); }
        .gb-msg__body { font-size: .95rem; line-height: 1.5; }
        .gb-msg__body p { margin: 4px 0; }
      `}</style>
    </div>
  );
};

export default GuestbookPage;
