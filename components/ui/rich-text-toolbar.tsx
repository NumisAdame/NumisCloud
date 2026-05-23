'use client';

import { Bold, Italic, Underline, List, ListOrdered, ImageIcon, Link, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface RichTextToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}

export function RichTextToolbar({ textareaRef, value, onChange, compact = false }: RichTextToolbarProps) {
  const [showImageInput, setShowImageInput] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  // Read directly from textarea to avoid stale closure issues
  const wrapSelection = (before: string, after: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const currentValue = ta.value;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = currentValue.substring(start, end);
    const replacement = selected || 'texto';
    const newText = currentValue.substring(0, start) + before + replacement + after + currentValue.substring(end);
    onChange(newText);
    // Restore focus and selection after React re-render
    requestAnimationFrame(() => {
      ta.focus();
      const selectStart = start + before.length;
      const selectEnd = selectStart + replacement.length;
      ta.setSelectionRange(selectStart, selectEnd);
    });
  };

  const insertAtCursor = (text: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const currentValue = ta.value;
    const start = ta.selectionStart;
    const newText = currentValue.substring(0, start) + text + currentValue.substring(start);
    onChange(newText);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + text.length, start + text.length);
    });
  };

  const insertList = (ordered: boolean) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const currentValue = ta.value;
    const start = ta.selectionStart;
    const prefix = currentValue.substring(0, start);
    const needsNewline = prefix.length > 0 && !prefix.endsWith('\n') ? '\n' : '';
    const items = ordered
      ? `${needsNewline}1. Elemento 1\n2. Elemento 2\n3. Elemento 3\n`
      : `${needsNewline}- Elemento 1\n- Elemento 2\n- Elemento 3\n`;
    insertAtCursor(items);
  };

  const handleInsertImage = () => {
    if (imageUrl.trim()) {
      insertAtCursor(`\n![imagen](${imageUrl.trim()})\n`);
      setImageUrl('');
      setShowImageInput(false);
    }
  };

  const handleInsertLink = () => {
    if (linkUrl.trim()) {
      insertAtCursor(`[${linkText.trim() || linkUrl.trim()}](${linkUrl.trim()})`);
      setLinkUrl('');
      setLinkText('');
      setShowLinkInput(false);
    }
  };

  const btnClass = compact
    ? 'h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted'
    : 'h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted';
  const iconSize = compact ? 'h-3.5 w-3.5' : 'h-4 w-4';

  // Use onMouseDown + preventDefault to keep textarea focus
  const handleAction = (action: () => void) => (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent textarea from losing focus
    action();
  };

  return (
    <div>
      <div className="flex items-center gap-0.5 flex-wrap">
        <button type="button" className={`inline-flex items-center justify-center rounded-md transition-colors ${btnClass}`} title="Negrita"
          onMouseDown={handleAction(() => wrapSelection('**', '**'))}>
          <Bold className={iconSize} />
        </button>
        <button type="button" className={`inline-flex items-center justify-center rounded-md transition-colors ${btnClass}`} title="Cursiva"
          onMouseDown={handleAction(() => wrapSelection('*', '*'))}>
          <Italic className={iconSize} />
        </button>
        <button type="button" className={`inline-flex items-center justify-center rounded-md transition-colors ${btnClass}`} title="Subrayado"
          onMouseDown={handleAction(() => wrapSelection('<u>', '</u>'))}>
          <Underline className={iconSize} />
        </button>

        <span className="w-px h-5 bg-border mx-1" />

        <button type="button" className={`inline-flex items-center justify-center rounded-md transition-colors ${btnClass}`} title="Lista con viñetas"
          onMouseDown={handleAction(() => insertList(false))}>
          <List className={iconSize} />
        </button>
        <button type="button" className={`inline-flex items-center justify-center rounded-md transition-colors ${btnClass}`} title="Lista numerada"
          onMouseDown={handleAction(() => insertList(true))}>
          <ListOrdered className={iconSize} />
        </button>

        <span className="w-px h-5 bg-border mx-1" />

        <button type="button" className={`inline-flex items-center justify-center rounded-md transition-colors ${btnClass}`} title="Cita"
          onMouseDown={handleAction(() => wrapSelection('\n> ', '\n'))}>
          <Quote className={iconSize} />
        </button>
        <button type="button" className={`inline-flex items-center justify-center rounded-md transition-colors ${btnClass}`} title="Enlace"
          onClick={() => { setShowLinkInput(!showLinkInput); setShowImageInput(false); }}>
          <Link className={iconSize} />
        </button>
        <button type="button" className={`inline-flex items-center justify-center rounded-md transition-colors ${btnClass}`} title="Imagen (URL)"
          onClick={() => { setShowImageInput(!showImageInput); setShowLinkInput(false); }}>
          <ImageIcon className={iconSize} />
        </button>
      </div>

      {showImageInput && (
        <div className="flex items-center gap-2 mt-2 p-2 bg-muted rounded-lg">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="URL de la imagen..."
            className="flex-1 text-sm bg-background border border-border rounded px-2 py-1 focus:outline-none focus:border-gold/40"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleInsertImage(); } }}
          />
          <Button type="button" size="sm" onClick={handleInsertImage}
            className="bg-gold text-graphite hover:bg-gold-dark text-xs h-7 px-3">
            Insertar
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowImageInput(false)}
            className="text-xs h-7 px-2">
            Cancelar
          </Button>
        </div>
      )}

      {showLinkInput && (
        <div className="flex items-center gap-2 mt-2 p-2 bg-muted rounded-lg flex-wrap">
          <input
            type="text"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            placeholder="Texto del enlace"
            className="flex-1 min-w-[120px] text-sm bg-background border border-border rounded px-2 py-1 focus:outline-none focus:border-gold/40"
          />
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="URL del enlace..."
            className="flex-1 min-w-[160px] text-sm bg-background border border-border rounded px-2 py-1 focus:outline-none focus:border-gold/40"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleInsertLink(); } }}
          />
          <Button type="button" size="sm" onClick={handleInsertLink}
            className="bg-gold text-graphite hover:bg-gold-dark text-xs h-7 px-3">
            Insertar
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowLinkInput(false)}
            className="text-xs h-7 px-2">
            Cancelar
          </Button>
        </div>
      )}
    </div>
  );
}
