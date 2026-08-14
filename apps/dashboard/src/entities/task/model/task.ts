import { z } from 'zod';

export const taskStatusSchema = z.enum(['todo', 'in-progress', 'done']);
export const taskPrioritySchema = z.enum(['low', 'medium', 'high']);

export const taskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1),
  description: z.string(),
  priority: taskPrioritySchema,
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: taskStatusSchema,
  createdAt: z.string().datetime(),
});

export type Task = z.infer<typeof taskSchema>;
export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;
