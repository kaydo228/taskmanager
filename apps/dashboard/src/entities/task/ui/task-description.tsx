import { renderToReactElement } from '@tiptap/static-renderer/pm/react';
import StarterKit from '@tiptap/starter-kit';
import { toTaskDescriptionDocument } from '@/entities/task';

const taskDescriptionExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    link: {
      HTMLAttributes: {
        rel: 'noopener noreferrer',
        target: '_blank',
      },
    },
  }),
];

export function TaskDescription({ description }: { description: string }) {
  if (!description) return null;

  try {
    return (
      <div className="task-description">
        {renderToReactElement({
          content: toTaskDescriptionDocument(description),
          extensions: taskDescriptionExtensions,
        })}
      </div>
    );
  } catch {
    return (
      <p className="task-description task-description--fallback">
        {description}
      </p>
    );
  }
}
