import { Button } from '@taskflow/shared/ui';

export function EmptyBoard({ onLoadDemo }: { onLoadDemo: () => void }) {
  return (
    <section className="empty-board">
      <span aria-hidden="true">✦</span>
      <h2>Доска пока пуста</h2>
      <p>
        Создай первую задачу или загрузи набор из девяти задач для проверки всех
        колонок.
      </p>
      <Button onClick={onLoadDemo}>Загрузить демо-данные</Button>
    </section>
  );
}
