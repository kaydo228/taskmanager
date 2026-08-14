# Landing Section Animations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Добавить всем четырём секциям лендинга однократное редакционное появление с каскадом внутренних элементов и корректной поддержкой `prefers-reduced-motion`.

**Architecture:** Существующая страница становится синхронным Client Component и использует уже установленный `motion/react`. Общие варианты контейнера, группы и элемента задают единый ритм, а один набор reveal-пропсов переключает viewport-анимацию на немедленное отображение при reduced motion.

**Tech Stack:** Next.js 16.3.0 App Router, React 19.2.8, TypeScript 5.9.3, Motion 13.1.0, Vitest 4.1.10, React Testing Library 16.3.2.

## Global Constraints

- Анимируются ровно четыре существующие секции: hero, preview-доска, «Как это работает» и финальный CTA.
- Каждая viewport-анимация запускается один раз с `once: true` и порогом `amount: 0.2`.
- Используются только `opacity` и `transform`; раскладка, текст, классы и семантические теги сохраняются.
- При `prefers-reduced-motion` контент сразу получает состояние `visible`, без начального скрытия и viewport-перехода.
- Новые зависимости не добавляются; закреплённые версии, localStorage и dashboard не меняются.
- Навигация остаётся статичной; карточки preview не получают отдельную вложенную анимацию.
- Текущая папка не является Git-репозиторием, поэтому шаги коммита заменены фиксацией результатов в `sessions/session-8.md`.

---

### Task 1: Контракт однократного появления и reduced motion

**Files:**

- Modify: `apps/landing/src/app/page.test.tsx`
- Modify: `apps/landing/src/app/page.tsx`

**Interfaces:**

- Consumes: `motion`, `useReducedMotion` и `Variants` из `motion/react`; существующие `dashboardUrl`, `steps` и CSS-классы страницы.
- Produces: четыре `motion.section` с normal-mode props `{ initial: 'hidden', whileInView: 'visible', viewport: { once: true, amount: 0.2 } }` или reduced-mode props `{ initial: false, animate: 'visible' }`.

- [ ] **Step 1: Добавить управляемую подмену Motion в тест страницы**

В начало `apps/landing/src/app/page.test.tsx` добавить mock до импортов компонента. Он сохраняет нужные Motion-пропсы как `data-*`, но рендерит обычные HTML-теги:

```tsx
import type { ElementType, ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('motion/react', async () => {
  const React = await vi.importActual<typeof import('react')>('react');
  const components = new Map<string, ElementType>();

  const motion = new Proxy(
    {},
    {
      get: (_target, tag: string) => {
        if (!components.has(tag)) {
          components.set(
            tag,
            React.forwardRef<HTMLElement, Record<string, unknown>>(
              (
                {
                  animate,
                  children,
                  initial,
                  variants: _variants,
                  viewport,
                  whileInView,
                  ...props
                },
                ref,
              ) =>
                React.createElement(
                  tag,
                  {
                    ...props,
                    ref,
                    ...(animate !== undefined && {
                      'data-motion-animate': String(animate),
                    }),
                    ...(initial !== undefined && {
                      'data-motion-initial': String(initial),
                    }),
                    ...(whileInView !== undefined && {
                      'data-motion-while-in-view': String(whileInView),
                    }),
                    ...(viewport !== undefined && {
                      'data-motion-amount': String(
                        (viewport as { amount?: number }).amount,
                      ),
                      'data-motion-once': String(
                        (viewport as { once?: boolean }).once,
                      ),
                    }),
                  },
                  children as ReactNode,
                ),
            ),
          );
        }

        return components.get(tag);
      },
    },
  );

  return {
    motion,
    useReducedMotion: vi.fn(() => false),
  };
});

import { useReducedMotion } from 'motion/react';
import Home, { dashboardUrl } from './page';

afterEach(() => {
  vi.mocked(useReducedMotion).mockReturnValue(false);
});
```

- [ ] **Step 2: Написать падающие тесты двух motion-контрактов**

В существующий `describe('Home')` после теста CTA добавить:

```tsx
it('reveals every landing section only once', () => {
  const { container } = render(<Home />);
  const sections = container.querySelectorAll('main > section');

  expect(sections).toHaveLength(4);

  sections.forEach((section) => {
    expect(section).toHaveAttribute('data-motion-initial', 'hidden');
    expect(section).toHaveAttribute('data-motion-while-in-view', 'visible');
    expect(section).toHaveAttribute('data-motion-once', 'true');
    expect(section).toHaveAttribute('data-motion-amount', '0.2');
  });
});

it('shows every section immediately when reduced motion is requested', () => {
  vi.mocked(useReducedMotion).mockReturnValue(true);

  const { container } = render(<Home />);
  const sections = container.querySelectorAll('main > section');

  sections.forEach((section) => {
    expect(section).toHaveAttribute('data-motion-initial', 'false');
    expect(section).toHaveAttribute('data-motion-animate', 'visible');
    expect(section).not.toHaveAttribute('data-motion-while-in-view');
  });
});
```

- [ ] **Step 3: Запустить точечный тест и подтвердить ожидаемое падение**

Run:

```bash
pnpm --filter @taskflow/landing test -- src/app/page.test.tsx
```

Expected: существующий CTA-тест проходит; два новых теста падают, потому что обычные `<section>` не имеют `data-motion-*` атрибутов.

- [ ] **Step 4: Добавить общие Motion-варианты и переключатель reduced motion**

В начало `apps/landing/src/app/page.tsx`, перед `dashboardUrl`, добавить:

```tsx
'use client';

import { motion, useReducedMotion, type Variants } from 'motion/react';

const easing = [0.22, 1, 0.36, 1] as const;

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: easing,
      staggerChildren: 0.09,
    },
  },
};

const groupVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.52, ease: easing },
  },
};

const sectionViewport = { once: true, amount: 0.2 } as const;
```

В начале `Home` вычислить единый набор пропсов:

```tsx
export default function Home() {
  const shouldReduceMotion = useReducedMotion();
  const revealProps = shouldReduceMotion
    ? ({ initial: false, animate: 'visible' } as const)
    : ({
        initial: 'hidden',
        whileInView: 'visible',
        viewport: sectionViewport,
      } as const);

  return (
```

- [ ] **Step 5: Подключить редакционный каскад к четырём секциям**

Сохранить существующий контент и классы, заменив только анимируемые теги и добавив варианты:

```tsx
<motion.section
  className="hero"
  id="top"
  variants={sectionVariants}
  {...revealProps}
>
  <motion.p className="kicker" variants={itemVariants}>
    Локальная доска задач
  </motion.p>
  <motion.h1 variants={itemVariants}>
    Дела в движении,
    <br />
    <em>голова свободна.</em>
  </motion.h1>
  <motion.p className="hero-copy" variants={itemVariants}>
    Мини-доска для личных задач: без регистрации, лишних вкладок и
    обещаний. Всё остаётся в твоём браузере.
  </motion.p>
  <motion.div className="hero-actions" variants={itemVariants}>
    <a aria-label="Открыть доску" className="cta" href={dashboardUrl}>
      Открыть доску <span aria-hidden="true">→</span>
    </a>
    <a className="text-link" href="#how-it-works">
      Как это работает
    </a>
  </motion.div>
  <motion.div
    className="hero-signal"
    aria-hidden="true"
    variants={itemVariants}
  >
    <span>●</span> офлайн · localStorage · без аккаунта
  </motion.div>
</motion.section>

<motion.section
  className="preview"
  aria-label="Пример доски"
  variants={sectionVariants}
  {...revealProps}
>
  <motion.div className="preview-column" variants={itemVariants}>
    <b>Нужно сделать</b>
    <article>
      <i className="tag high">Высокий</i>
      <strong>Проверить адаптив</strong>
      <small>до 16 авг.</small>
    </article>
    <article>
      <i className="tag medium">Средний</i>
      <strong>Собрать обратную связь</strong>
      <small>до 17 авг.</small>
    </article>
  </motion.div>
  <motion.div className="preview-column active" variants={itemVariants}>
    <b>В работе</b>
    <article>
      <i className="tag high">Высокий</i>
      <strong>Настроить тесты</strong>
      <small>до 14 авг.</small>
    </article>
  </motion.div>
  <motion.div className="preview-column" variants={itemVariants}>
    <b>Готово</b>
    <article>
      <i className="tag low">Низкий</i>
      <strong>Выбрать палитру</strong>
      <small>сделано</small>
    </article>
  </motion.div>
</motion.section>

<motion.section
  className="how"
  id="how-it-works"
  variants={sectionVariants}
  {...revealProps}
>
  <motion.p className="kicker" variants={itemVariants}>
    Простой ритм
  </motion.p>
  <motion.div className="how-header" variants={itemVariants}>
    <h2>
      Три действия.
      <br />
      Ноль трения.
    </h2>
    <p>
      Taskflow не пытается заменить весь менеджмент. Он держит твой
      следующий шаг на виду.
    </p>
  </motion.div>
  <motion.div className="steps" variants={groupVariants}>
    {steps.map(([number, title, text]) => (
      <motion.article key={number} variants={itemVariants}>
        <span>{number}</span>
        <h3>{title}</h3>
        <p>{text}</p>
      </motion.article>
    ))}
  </motion.div>
</motion.section>

<motion.section
  className="closing"
  variants={sectionVariants}
  {...revealProps}
>
  <motion.p className="kicker" variants={itemVariants}>
    Начни с пустого
  </motion.p>
  <motion.h2 variants={itemVariants}>
    Порядок — это
    <br />
    видимый <em>следующий шаг.</em>
  </motion.h2>
  <motion.a className="cta" href={dashboardUrl} variants={itemVariants}>
    Перейти к задачам <span>→</span>
  </motion.a>
</motion.section>
```

- [ ] **Step 6: Запустить точечный тест и подтвердить зелёный цикл**

Run:

```bash
pnpm --filter @taskflow/landing test -- src/app/page.test.tsx
```

Expected: три теста `Home` проходят; в stderr нет предупреждений о неизвестных Motion-пропсах на DOM.

- [ ] **Step 7: Запустить локальные проверки лендинга**

Run:

```bash
pnpm --filter @taskflow/landing lint
pnpm --filter @taskflow/landing build
```

Expected: обе команды завершаются с кодом 0; TypeScript принимает типы variants/reveal props, а Next.js собирает маршрут `/`.

### Task 2: Полная регрессия и визуальная приёмка

**Files:**

- Modify: `sessions/session-8.md`
- Modify: `sessions/STATE.md`
- Create: `sessions/session-8-landing-1440.png`
- Create: `sessions/session-8-landing-360.png`

**Interfaces:**

- Consumes: собранный лендинг на `http://localhost:3001`, корневые workspace-скрипты и критерии приёмки из `AGENTS.md`.
- Produces: два скриншота, полный журнал проверок и актуальное состояние проекта.

- [ ] **Step 1: Запустить полный обязательный набор команд**

Run последовательно из корня проекта:

```bash
pnpm build
pnpm test
pnpm lint
pnpm format:check
```

Expected: каждая команда завершается с кодом 0. Полный вывод, включая предупреждения или падения, записывается в разделы «Использованные инструменты» и «Финальный вердикт» `sessions/session-8.md`.

- [ ] **Step 2: Запустить лендинг для браузерной проверки**

Run:

```bash
pnpm --filter @taskflow/landing dev
```

Expected: Next.js сообщает готовность на `http://localhost:3001`; сервер остаётся запущенным до окончания визуальной проверки.

- [ ] **Step 3: Проверить desktop 1440 px**

В браузере открыть `http://localhost:3001`, установить viewport 1440 px по ширине и последовательно прокрутить страницу от hero до closing:

- hero появляется каскадом при загрузке;
- колонки preview появляются слева направо;
- шаги появляются `01 → 02 → 03`;
- финальный CTA появляется последним;
- после прокрутки вверх и повторного спуска ни одна секция не исчезает и не запускается заново;
- консоль не содержит ошибок и hydration warnings.

Сохранить снимок полной страницы как `sessions/session-8-landing-1440.png`.

- [ ] **Step 4: Проверить mobile 360 px и клавиатуру**

Установить viewport 360 px и повторить прокрутку. Проверить, что каскад идёт в вертикальном DOM-порядке, контент не обрезается, а ссылки навигации и CTA получают фокус через Tab и активируются Enter. Сохранить снимок полной страницы как `sessions/session-8-landing-360.png`.

- [ ] **Step 5: Проверить reduced motion**

Включить эмуляцию `prefers-reduced-motion: reduce`, перезагрузить страницу и прокрутить все четыре секции. Expected: весь контент видим сразу; opacity/transform-переходы и каскад отсутствуют; ссылки остаются фокусируемыми.

- [ ] **Step 6: Закрыть журнал и обновить состояние проекта**

В `sessions/session-8.md`:

- перечислить изменённые файлы и два скриншота;
- записать фактические результаты каждой команды и браузерной проверки;
- установить статус `завершена` только если все критерии выполнены;
- в вердикте явно указать, закрыт ли пункт про однократные анимации всех секций.

В `sessions/STATE.md` обновить текущее состояние лендинга, результаты проверок, известные проблемы и следующий шаг. Не переписывать историю предыдущих сессий.
