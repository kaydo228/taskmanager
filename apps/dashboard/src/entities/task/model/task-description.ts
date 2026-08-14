const NODE_TYPES = new Set([
  'doc',
  'paragraph',
  'text',
  'heading',
  'bulletList',
  'orderedList',
  'listItem',
  'blockquote',
  'codeBlock',
  'hardBreak',
  'horizontalRule',
]);

const MARK_TYPES = new Set([
  'bold',
  'italic',
  'underline',
  'strike',
  'code',
  'link',
]);

const DESCRIPTION_PREFIX = 'tiptap:';

type TaskDescriptionMark = {
  attrs?: Record<string, unknown>;
  type: string;
};

export type TaskDescriptionNode = {
  attrs?: Record<string, unknown>;
  content?: TaskDescriptionNode[];
  marks?: TaskDescriptionMark[];
  text?: string;
  type: string;
};

export type TaskDescriptionDocument = TaskDescriptionNode & { type: 'doc' };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isSafeTaskLink(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isTaskDescriptionMark(value: unknown): value is TaskDescriptionMark {
  if (!isRecord(value) || typeof value.type !== 'string') return false;
  if (!MARK_TYPES.has(value.type)) return false;
  if (value.attrs !== undefined && !isRecord(value.attrs)) return false;

  if (value.type === 'link') {
    return (
      isRecord(value.attrs) &&
      typeof value.attrs.href === 'string' &&
      isSafeTaskLink(value.attrs.href)
    );
  }

  return true;
}

function isTaskDescriptionNode(
  value: unknown,
  isRoot = false,
): value is TaskDescriptionNode {
  if (!isRecord(value) || typeof value.type !== 'string') return false;
  if (!NODE_TYPES.has(value.type)) return false;
  if ((value.type === 'doc') !== isRoot) return false;
  if (value.attrs !== undefined && !isRecord(value.attrs)) return false;

  if (
    value.type === 'heading' &&
    (!isRecord(value.attrs) ||
      (value.attrs.level !== 2 && value.attrs.level !== 3))
  ) {
    return false;
  }

  if (value.type === 'text') {
    if (typeof value.text !== 'string' || value.content !== undefined) {
      return false;
    }
  } else if (value.text !== undefined || value.marks !== undefined) {
    return false;
  }

  if (
    value.marks !== undefined &&
    (!Array.isArray(value.marks) || !value.marks.every(isTaskDescriptionMark))
  ) {
    return false;
  }

  if (
    value.content !== undefined &&
    (!Array.isArray(value.content) ||
      !value.content.every((node) => isTaskDescriptionNode(node)))
  ) {
    return false;
  }

  return true;
}

function isTaskDescriptionDocument(
  value: unknown,
): value is TaskDescriptionDocument {
  return isTaskDescriptionNode(value, true) && Array.isArray(value.content);
}

function plainTextDocument(value: string): TaskDescriptionDocument {
  return {
    type: 'doc',
    content: [
      value
        ? {
            type: 'paragraph',
            content: [{ type: 'text', text: value }],
          }
        : { type: 'paragraph' },
    ],
  };
}

export function serializeTaskDescription(document: TaskDescriptionDocument) {
  return `${DESCRIPTION_PREFIX}${JSON.stringify(document)}`;
}

export function toTaskDescriptionDocument(
  value: string,
): TaskDescriptionDocument {
  if (value.startsWith(DESCRIPTION_PREFIX)) {
    try {
      const candidate: unknown = JSON.parse(
        value.slice(DESCRIPTION_PREFIX.length),
      );

      if (isTaskDescriptionDocument(candidate)) return candidate;
    } catch {
      // Preserve malformed input through the plain-text fallback.
    }
  }

  return plainTextDocument(value);
}
