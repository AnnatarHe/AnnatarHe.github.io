import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/posts' }),
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