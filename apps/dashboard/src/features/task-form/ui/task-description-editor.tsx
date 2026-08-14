import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import {
  isSafeTaskLink,
  serializeTaskDescription,
  toTaskDescriptionDocument,
  type TaskDescriptionDocument,
} from '@/entities/task';

const editorExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    link: {
      autolink: false,
      openOnClick: false,
      HTMLAttributes: {
        rel: 'noopener noreferrer',
        target: '_blank',
      },
    },
  }),
];

type TaskDescriptionEditorProps = {
  onBlur?: () => void;
  onChange: (value: string) => void;
  value: string;
};

type EditorIconName =
  | 'bold'
  | 'bullet-list'
  | 'code'
  | 'code-block'
  | 'heading-2'
  | 'heading-3'
  | 'italic'
  | 'link'
  | 'ordered-list'
  | 'paragraph'
  | 'quote'
  | 'redo'
  | 'strike'
  | 'underline'
  | 'undo';

function EditorIcon({ name }: { name: EditorIconName }) {
  const textIcons: Partial<Record<EditorIconName, string>> = {
    bold: 'B',
    'heading-2': 'H₂',
    'heading-3': 'H₃',
    italic: 'I',
    paragraph: '¶',
    strike: 'S',
    underline: 'U',
  };

  if (textIcons[name]) {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <text
          dominantBaseline="central"
          fontSize={name.startsWith('heading') ? 13 : 16}
          fontStyle={name === 'italic' ? 'italic' : undefined}
          fontWeight={name === 'bold' ? 800 : 700}
          textAnchor="middle"
          textDecoration={
            name === 'underline'
              ? 'underline'
              : name === 'strike'
                ? 'line-through'
                : undefined
          }
          x="12"
          y="12"
        >
          {textIcons[name]}
        </text>
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
      viewBox="0 0 24 24"
    >
      {name === 'bullet-list' ? (
        <>
          <circle cx="5" cy="7" fill="currentColor" r="1" stroke="none" />
          <circle cx="5" cy="12" fill="currentColor" r="1" stroke="none" />
          <circle cx="5" cy="17" fill="currentColor" r="1" stroke="none" />
          <path d="M9 7h10M9 12h10M9 17h10" />
        </>
      ) : null}
      {name === 'ordered-list' ? (
        <>
          <path d="M4 6h1v3M3.8 9h2M4 14c.2-.7 1.7-.9 1.8.1.1.7-1.8 1.7-1.8 2.9h2M9 7h10M9 12h10M9 17h10" />
        </>
      ) : null}
      {name === 'quote' ? (
        <path d="M5 17h4l2-5V7H5v6h4M14 17h4l2-5V7h-6v6h4" />
      ) : null}
      {name === 'code' ? <path d="m9 7-5 5 5 5M15 7l5 5-5 5" /> : null}
      {name === 'code-block' ? (
        <>
          <rect height="16" rx="2" width="20" x="2" y="4" />
          <path d="m9 9-3 3 3 3M15 9l3 3-3 3" />
        </>
      ) : null}
      {name === 'link' ? (
        <path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.1 1.1M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1.1" />
      ) : null}
      {name === 'undo' ? <path d="M9 8 5 12l4 4M5 12h8a6 6 0 0 1 6 6" /> : null}
      {name === 'redo' ? (
        <path d="m15 8 4 4-4 4M19 12h-8a6 6 0 0 0-6 6" />
      ) : null}
    </svg>
  );
}

type ToolbarButtonProps = {
  children: ReactNode;
  disabled?: boolean;
  icon: EditorIconName;
  onClick: () => void;
  pressed?: boolean;
};

function ToolbarButton({
  children,
  disabled,
  icon,
  onClick,
  pressed,
}: ToolbarButtonProps) {
  const label = String(children);

  return (
    <button
      aria-label={label}
      aria-pressed={pressed}
      className="task-editor__button"
      disabled={disabled}
      onClick={onClick}
      title={label}
      type="button"
    >
      <EditorIcon name={icon} />
    </button>
  );
}

export function TaskDescriptionEditor({
  onBlur,
  onChange,
  value,
}: TaskDescriptionEditorProps) {
  const linkErrorId = useId();
  const linkInputRef = useRef<HTMLInputElement>(null);
  const onBlurRef = useRef(onBlur);
  const onChangeRef = useRef(onChange);
  const [linkError, setLinkError] = useState('');
  const [linkPanelOpen, setLinkPanelOpen] = useState(false);
  const [linkValue, setLinkValue] = useState('');

  useEffect(() => {
    onBlurRef.current = onBlur;
    onChangeRef.current = onChange;
  }, [onBlur, onChange]);

  const editor = useEditor({
    content: toTaskDescriptionDocument(value),
    editorProps: {
      attributes: {
        'aria-label': 'Описание',
        'aria-multiline': 'true',
        class: 'task-editor__content',
        id: 'task-description',
        role: 'textbox',
      },
    },
    extensions: editorExtensions,
    immediatelyRender: false,
    onBlur: () => onBlurRef.current?.(),
    onUpdate: ({ editor: currentEditor }) => {
      onChangeRef.current(
        currentEditor.isEmpty
          ? ''
          : serializeTaskDescription(
              currentEditor.getJSON() as TaskDescriptionDocument,
            ),
      );
    },
    shouldRerenderOnTransaction: true,
  });

  useEffect(() => {
    if (!editor) return;

    const currentValue = editor.isEmpty
      ? ''
      : serializeTaskDescription(editor.getJSON() as TaskDescriptionDocument);

    if (currentValue !== value) {
      editor.commands.setContent(toTaskDescriptionDocument(value), {
        emitUpdate: false,
      });
    }
  }, [editor, value]);

  useEffect(() => {
    if (linkPanelOpen) linkInputRef.current?.focus();
  }, [linkPanelOpen]);

  if (!editor) return null;

  function closeLinkPanel() {
    setLinkError('');
    setLinkPanelOpen(false);
    editor?.commands.focus();
  }

  function openLinkPanel() {
    setLinkError('');
    setLinkValue(String(editor?.getAttributes('link').href ?? ''));
    setLinkPanelOpen(true);
  }

  function applyLink() {
    const href = linkValue.trim();

    if (!isSafeTaskLink(href)) {
      setLinkError('Введите полный адрес с http:// или https://');
      return;
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href }).run();
    closeLinkPanel();
  }

  function removeLink() {
    editor?.chain().focus().extendMarkRange('link').unsetLink().run();
    closeLinkPanel();
  }

  function handleLinkKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      applyLink();
    }
  }

  function handleLinkPanelKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeLinkPanel();
    }
  }

  return (
    <div className="task-editor">
      <div
        aria-label="Форматирование описания"
        className="task-editor__toolbar"
        role="toolbar"
      >
        <ToolbarButton
          icon="paragraph"
          onClick={() => editor.chain().focus().setParagraph().run()}
          pressed={editor.isActive('paragraph')}
        >
          Абзац
        </ToolbarButton>
        <ToolbarButton
          icon="heading-2"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          pressed={editor.isActive('heading', { level: 2 })}
        >
          Заголовок 2
        </ToolbarButton>
        <ToolbarButton
          icon="heading-3"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          pressed={editor.isActive('heading', { level: 3 })}
        >
          Заголовок 3
        </ToolbarButton>
        <span aria-hidden="true" className="task-editor__divider" />
        <ToolbarButton
          disabled={!editor.can().chain().focus().toggleBold().run()}
          icon="bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          pressed={editor.isActive('bold')}
        >
          Жирный
        </ToolbarButton>
        <ToolbarButton
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          icon="italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          pressed={editor.isActive('italic')}
        >
          Курсив
        </ToolbarButton>
        <ToolbarButton
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          icon="underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          pressed={editor.isActive('underline')}
        >
          Подчёркнутый
        </ToolbarButton>
        <ToolbarButton
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          icon="strike"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          pressed={editor.isActive('strike')}
        >
          Зачёркнутый
        </ToolbarButton>
        <span aria-hidden="true" className="task-editor__divider" />
        <ToolbarButton
          icon="bullet-list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          pressed={editor.isActive('bulletList')}
        >
          Маркированный список
        </ToolbarButton>
        <ToolbarButton
          icon="ordered-list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          pressed={editor.isActive('orderedList')}
        >
          Нумерованный список
        </ToolbarButton>
        <ToolbarButton
          icon="quote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          pressed={editor.isActive('blockquote')}
        >
          Цитата
        </ToolbarButton>
        <ToolbarButton
          icon="code"
          onClick={() => editor.chain().focus().toggleCode().run()}
          pressed={editor.isActive('code')}
        >
          Строчный код
        </ToolbarButton>
        <ToolbarButton
          icon="code-block"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          pressed={editor.isActive('codeBlock')}
        >
          Блок кода
        </ToolbarButton>
        <ToolbarButton
          icon="link"
          onClick={openLinkPanel}
          pressed={editor.isActive('link') || linkPanelOpen}
        >
          Ссылка
        </ToolbarButton>
        <span aria-hidden="true" className="task-editor__divider" />
        <ToolbarButton
          disabled={!editor.can().chain().focus().undo().run()}
          icon="undo"
          onClick={() => editor.chain().focus().undo().run()}
        >
          Отменить
        </ToolbarButton>
        <ToolbarButton
          disabled={!editor.can().chain().focus().redo().run()}
          icon="redo"
          onClick={() => editor.chain().focus().redo().run()}
        >
          Повторить
        </ToolbarButton>
      </div>

      {linkPanelOpen ? (
        <div
          aria-label="Настройка ссылки"
          className="task-editor__link-panel"
          onKeyDown={handleLinkPanelKeyDown}
          role="group"
        >
          <div className="task-editor__link-field">
            <input
              aria-describedby={linkError ? linkErrorId : undefined}
              aria-invalid={Boolean(linkError)}
              aria-label="Адрес ссылки"
              onChange={(event) => {
                setLinkError('');
                setLinkValue(event.target.value);
              }}
              onKeyDown={handleLinkKeyDown}
              placeholder="https://example.com"
              ref={linkInputRef}
              type="url"
              value={linkValue}
            />
            {linkError ? <small id={linkErrorId}>{linkError}</small> : null}
          </div>
          <button
            className="task-editor__link-action"
            onClick={applyLink}
            type="button"
          >
            Применить ссылку
          </button>
          <button
            className="task-editor__link-action task-editor__link-action--muted"
            onClick={removeLink}
            type="button"
          >
            Удалить ссылку
          </button>
        </div>
      ) : null}

      <EditorContent editor={editor} />
    </div>
  );
}
