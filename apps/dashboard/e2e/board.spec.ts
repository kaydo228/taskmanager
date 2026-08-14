import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/board');
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

test('empty board loads demo tasks and persists after reload', async ({
  page,
}) => {
  await expect(page.getByText('Доска пока пуста')).toBeVisible();
  await page.getByRole('button', { name: 'Загрузить демо-данные' }).click();
  await expect(page.getByText('План релиза')).toBeVisible();
  await expect(page.getByText('Демо-задачи загружены')).toBeHidden({
    timeout: 8_000,
  });
  await page.reload();
  await expect(page.getByText('План релиза')).toBeVisible();
  await page.setViewportSize({ width: 360, height: 800 });
  await page.screenshot({
    fullPage: true,
    path: '../../screenshots/submission-board-360.png',
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({
    fullPage: true,
    path: '../../screenshots/submission-board-1440.png',
  });
  await page.reload();
  await expect(page.getByText('План релиза')).toBeVisible();
  await page.getByRole('button', { name: 'Очистить доску' }).click();
  await expect(page.getByText('Доска пока пуста')).toBeVisible();
});

test('drops a task between cards and persists its position', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Загрузить демо-данные' }).click();

  const source = page.getByRole('button', {
    name: 'Перетащить «План релиза»',
  });
  const target = page.locator('.task-card', { hasText: 'Настроить тесты' });
  const sourceBox = await source.boundingBox();
  const targetBox = await target.boundingBox();

  if (!sourceBox || !targetBox)
    throw new Error('Не найдены карточки для drag-and-drop');

  await page.mouse.move(
    sourceBox.x + sourceBox.width / 2,
    sourceBox.y + sourceBox.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    targetBox.x + targetBox.width / 2,
    targetBox.y + targetBox.height / 2 + 20,
    {
      steps: 12,
    },
  );
  await page.mouse.up();

  const inProgressTitles = page.getByLabel('В работе').locator('.task-card h3');
  await expect(inProgressTitles).toHaveText([
    'Настроить тесты',
    'План релиза',
    'Оформить лендинг',
    'Проверить фокус',
  ]);

  await page.reload();
  await expect(page.getByLabel('В работе').locator('.task-card h3')).toHaveText(
    ['Настроить тесты', 'План релиза', 'Оформить лендинг', 'Проверить фокус'],
  );
});

test('creates, persists, and edits a formatted task without horizontal overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.getByRole('link', { name: 'Создать задачу' }).click();
  const titleInput = page.getByLabel('Название задачи');
  await titleInput.fill('Проверить редактор');
  await titleInput.focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Абзац' })).toBeFocused();
  await page.getByLabel('Срок').fill('2026-08-25');
  const editor = page.locator('.task-editor__content');
  await editor.click();
  await page.keyboard.type('Важное описание');
  await editor.selectText();
  const boldButton = page.getByRole('button', { name: 'Жирный' });
  await boldButton.click();
  await expect(boldButton).toHaveAttribute('aria-pressed', 'true');
  await boldButton.focus();
  await page.keyboard.press('Space');
  await expect(boldButton).toHaveAttribute('aria-pressed', 'false');
  await boldButton.focus();
  await page.keyboard.press('Enter');
  await expect(boldButton).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('button', { name: 'Ссылка' }).click();
  const linkInput = page.getByRole('textbox', { name: 'Адрес ссылки' });
  await expect(linkInput).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(linkInput).toBeHidden();
  await editor.press('ArrowRight');

  await expect(editor).toHaveCSS('min-height', '160px');
  expect(
    await page
      .locator('.task-editor__toolbar')
      .evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true);
  await page.screenshot({
    fullPage: true,
    path: '../../sessions/session-9-editor-360.png',
  });

  await page.getByRole('button', { name: 'Сохранить' }).click();
  const card = page.locator('.task-card', { hasText: 'Проверить редактор' });
  await expect(card.locator('strong')).toHaveText('Важное описание');

  await page.reload();
  await expect(card.locator('strong')).toHaveText('Важное описание');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page
    .getByRole('button', {
      name: 'Редактировать «Проверить редактор»',
    })
    .click();
  await expect(page.getByRole('textbox', { name: 'Описание' })).toContainText(
    'Важное описание',
  );
  await expect(page.getByRole('dialog')).toHaveCSS('opacity', '1');
  await page.screenshot({
    fullPage: true,
    path: '../../sessions/session-9-editor-1440.png',
  });
});

test('recovers from malformed storage and exposes the validation error through the UI', async ({
  page,
}) => {
  await page.evaluate(() =>
    window.localStorage.setItem('taskflow.tasks', 'not-json'),
  );
  await page.reload();
  await expect(page.getByText('Доска пока пуста')).toBeVisible();

  await page.getByRole('link', { name: 'Создать задачу' }).click();
  await page.getByRole('button', { name: 'Сохранить' }).click();
  await expect(page.getByText('Введите название')).toBeVisible();
  await expect(page.getByLabel('Название задачи')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('shows a visible focus ring on every populated-board tab stop', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Загрузить демо-данные' }).click();
  await expect(page.getByText('Демо-задачи загружены')).toBeHidden({
    timeout: 8_000,
  });
  await page.reload();
  await expect(page.getByText('План релиза')).toBeVisible();

  const tabStops = page.locator(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  );
  await expect(tabStops).toHaveCount(39);
  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());

  const reachedLabels = new Set<string>();
  for (let index = 0; index < 39; index += 1) {
    await page.keyboard.press('Tab');
    const focusState = await page.evaluate(() => {
      const activeElement = document.activeElement as HTMLElement | null;
      if (!activeElement || activeElement === document.body) return null;
      const styles = window.getComputedStyle(activeElement);
      const bounds = activeElement.getBoundingClientRect();
      return {
        hasVisibleOutline:
          styles.outlineStyle !== 'none' &&
          Number.parseFloat(styles.outlineWidth) > 0,
        isVisible: bounds.width > 0 && bounds.height > 0,
        label:
          activeElement.getAttribute('aria-label') ??
          activeElement.textContent?.trim() ??
          activeElement.tagName,
      };
    });

    expect(focusState).not.toBeNull();
    expect(focusState?.isVisible).toBe(true);
    expect(focusState?.hasVisibleOutline).toBe(true);
    reachedLabels.add(focusState?.label ?? '');
  }

  expect(reachedLabels.size).toBe(39);
});

test('moves and persists a task with keyboard drag', async ({ page }) => {
  await page.getByRole('button', { name: 'Загрузить демо-данные' }).click();
  const dragHandle = page.getByRole('button', {
    name: 'Перетащить «План релиза»',
  });
  await dragHandle.focus();
  await page.keyboard.press('Space');
  const overlay = page.locator('.task-card--overlay');
  await expect(overlay).toBeVisible();
  const liveRegion = page.getByRole('status');
  await expect(liveRegion).toContainText(
    'f0e1d2c3-b4a5-4678-9012-3456789abc01',
  );
  await page.keyboard.press('ArrowDown');
  await expect(liveRegion).toContainText('droppable area todo');
  await page.keyboard.press('ArrowRight');
  await expect(liveRegion).toContainText(
    /droppable area (in-progress|f0e1d2c3-b4a5-4678-9012-3456789abc0[4-6])/,
  );
  await page.keyboard.press('Space');

  const movedCard = page
    .getByLabel('В работе')
    .locator('.task-card', { hasText: 'План релиза' });
  await expect(movedCard).toBeVisible();
  await page.reload();
  await expect(movedCard).toBeVisible();
});
