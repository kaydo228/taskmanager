import { Controller, useForm } from 'react-hook-form';
import { Button, Dropdown } from '@taskflow/shared/ui';
import type { TaskPriority } from '@/entities/task';

const priorityOptions = [
  { label: 'Низкий', value: 'low' },
  { label: 'Средний', value: 'medium' },
  { label: 'Высокий', value: 'high' },
] as const;

export type TaskFormValues = {
  description: string;
  dueDate: string;
  priority: TaskPriority;
  title: string;
};

type TaskFormProps = {
  defaultValues?: Partial<TaskFormValues>;
  onSubmit: (values: TaskFormValues) => void;
};

export function TaskForm({ defaultValues, onSubmit }: TaskFormProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<TaskFormValues>({
    defaultValues: {
      description: '',
      dueDate: '',
      priority: 'medium',
      title: '',
      ...defaultValues,
    },
  });

  return (
    <form className="task-form" noValidate onSubmit={handleSubmit(onSubmit)}>
      <label className="ui-field" htmlFor="task-title">
        <span>Название задачи</span>
        <input
          aria-describedby={errors.title ? 'task-title-error' : undefined}
          aria-invalid={Boolean(errors.title)}
          id="task-title"
          {...register('title', { required: 'Введите название задачи' })}
        />
        {errors.title ? (
          <small id="task-title-error">{errors.title.message}</small>
        ) : null}
      </label>

      <label className="ui-field" htmlFor="task-description">
        <span>Описание</span>
        <textarea id="task-description" rows={4} {...register('description')} />
      </label>

      <div className="task-form__grid">
        <Controller
          control={control}
          name="priority"
          render={({ field }) => (
            <Dropdown
              label="Приоритет"
              onChange={field.onChange}
              options={priorityOptions}
              value={field.value}
            />
          )}
        />

        <label className="ui-field" htmlFor="task-due-date">
          <span>Срок</span>
          <input
            id="task-due-date"
            type="date"
            {...register('dueDate', { required: 'Выберите срок' })}
          />
          {errors.dueDate ? <small>{errors.dueDate.message}</small> : null}
        </label>
      </div>

      <Button type="submit">Сохранить</Button>
    </form>
  );
}
