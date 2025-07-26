import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    layout: z.string().optional(),
    tags: z.string().optional(),
    date: z.date().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = {
  posts,
};