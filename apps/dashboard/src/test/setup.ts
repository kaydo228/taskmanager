import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(cleanup);

if (!document.elementFromPoint) {
  document.elementFromPoint = () =>
    document.querySelector<HTMLElement>('[contenteditable="true"]');
}
