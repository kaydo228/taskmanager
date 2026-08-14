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
  const target = page.getByText('Настроить тесты');
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
    targetBox.y + targetBox.height - 4,
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
