import { describe, expect, it } from 'vitest';
import {
  isSafeTaskLink,
  serializeTaskDescription,
  toTaskDescriptionDocument,
} from './task-description';

describe('task description codec', () => {
  it('turns legacy text into an editable paragraph', () => {
    expect(toTaskDescriptionDocument('Старое описание')).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Старое описание' }],
        },
      ],
    });
  });

  it('does not mistake plain JSON-looking text for a document', () => {
    expect(toTaskDescriptionDocument('{"type":"doc"}')).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '{"type":"doc"}' }],
        },
      ],
    });
  });

  it('round-trips a prefixed formatted document', () => {
    const document = {
      type: 'doc' as const,
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Важно', marks: [{ type: 'bold' }] }],
        },
      ],
    };

    const stored = serializeTaskDescription(document);

    expect(stored).toBe(
      'tiptap:{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Важно","marks":[{"type":"bold"}]}]}]}',
    );
    expect(toTaskDescriptionDocument(stored)).toEqual(document);
  });

  it('falls back to text for malformed or unknown prefixed content', () => {
    expect(toTaskDescriptionDocument('tiptap:{broken')).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'tiptap:{broken' }],
        },
      ],
    });
    expect(
      toTaskDescriptionDocument(
        'tiptap:{"type":"doc","content":[{"type":"script"}]}',
      ),
    ).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'tiptap:{"type":"doc","content":[{"type":"script"}]}',
            },
          ],
        },
      ],
    });
  });

  it('accepts only absolute HTTP and HTTPS links', () => {
    expect(isSafeTaskLink('https://example.com/docs')).toBe(true);
    expect(isSafeTaskLink('http://localhost:5173/help')).toBe(true);
    expect(isSafeTaskLink('javascript:alert(1)')).toBe(false);
    expect(isSafeTaskLink('/relative')).toBe(false);
  });
});
