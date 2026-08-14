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
  visible: { transition: { staggerChildren: 0.09 } },
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

export const dashboardUrl =
  process.env.NEXT_PUBLIC_DASHBOARD_URL ?? 'http://localhost:5173/board';

const steps = [
  [
    '01',
    'Запиши',
    'Добавь задачу, описание, приоритет и срок за несколько секунд.',
  ],
  ['02', 'Сдвинь', 'Перетащи карточку или измени статус с клавиатуры.'],
  ['03', 'Закрой', 'Видишь движение работы — не нужно держать всё в голове.'],
];

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
    <main>
      <nav className="landing-nav" aria-label="Основная навигация">
        <a className="logo" href="#top">
          taskflow<span>.</span>
        </a>
        <a className="nav-link" href={dashboardUrl}>
          Открыть доску ↗
        </a>
      </nav>

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
    </main>
  );
}
