import { useRef, type FC } from 'react';

interface RTEProps {
  value: string; onChange: (html: string) => void;
  placeholder?: string; minHeight?: string;
}

const RichTextEditor: FC<RTEProps> = ({ value, onChange, placeholder = 'Write something...', minHeight = '200px' }) => {
  const ref = useRef<HTMLDivElement>(null);

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val ?? undefined);
    ref.current?.focus();
    onChange(ref.current?.innerHTML ?? '');
  };

  const handleInput = () => {
    onChange(ref.current?.innerHTML ?? '');
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  return (
    <div className="rte-wrapper">
      <div className="rte-toolbar">
        <button type="button" className="rte-btn" onClick={() => exec('bold')} title="Bold"><b>B</b></button>
        <button type="button" className="rte-btn" onClick={() => exec('italic')} title="Italic"><i>I</i></button>
        <button type="button" className="rte-btn" onClick={() => exec('underline')} title="Underline"><u>U</u></button>
        <span className="rte-sep" />
        <button type="button" className="rte-btn" onClick={() => exec('formatBlock', 'h2')} title="Heading">H</button>
        <button type="button" className="rte-btn" onClick={() => exec('formatBlock', 'p')} title="Paragraph">¶</button>
        <span className="rte-sep" />
        <button type="button" className="rte-btn" onClick={() => exec('insertUnorderedList')} title="Bullet list">•</button>
        <button type="button" className="rte-btn" onClick={() => exec('insertOrderedList')} title="Ordered list">1.</button>
        <span className="rte-sep" />
        <button type="button" className="rte-btn" onClick={() => {
          const url = prompt('Enter link URL:');
          if (url) exec('createLink', url);
        }} title="Link">🔗</button>
        <button type="button" className="rte-btn" onClick={() => exec('unlink')} title="Unlink">✂️</button>
      </div>
      <div ref={ref} className="rte-editor"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        style={{ minHeight }}
        dangerouslySetInnerHTML={{ __html: value || '' }}
      />
      <style>{`
        .rte-wrapper { border: 1px solid var(--blog-border, #D6D2C8); border-radius: 8px; overflow: hidden; }
        .rte-toolbar { display: flex; gap: 2px; padding: 6px 8px; background: var(--blog-surface, #FAF8F4); border-bottom: 1px solid var(--blog-border, #D6D2C8); flex-wrap: wrap; }
        .rte-btn { background: none; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: .9rem; color: var(--blog-text, #2C2A26); }
        .rte-btn:hover { background: var(--blog-border, #D6D2C8); }
        .rte-sep { width: 1px; background: var(--blog-border, #D6D2C8); margin: 2px 4px; }
        .rte-editor { padding: 12px; outline: none; min-height: 200px; font-family: Inter, sans-serif; font-size: .95rem; line-height: 1.6; color: var(--blog-text, #2C2A26); }
        .rte-editor:empty:before { content: attr(data-placeholder); color: #9E9A8E; }
        .rte-editor h2 { font-size: 1.3rem; margin: 8px 0; }
        .rte-editor p { margin: 4px 0; }
        .rte-editor ul, .rte-editor ol { margin: 4px 0; padding-left: 24px; }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
