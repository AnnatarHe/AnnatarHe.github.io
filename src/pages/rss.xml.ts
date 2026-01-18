import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { getContainerRenderer as getMDXRenderer } from '@astrojs/mdx';
import sanitizeHtml from 'sanitize-html';

export async function GET(context: APIContext) {
  const posts = await getCollection('posts');

  const publishedPosts = posts
    .filter(post => !post.data.draft)
    .sort((a, b) => {
      const dateA = a.data.date || new Date(a.slug.slice(0, 10));
      const dateB = b.data.date || new Date(b.slug.slice(0, 10));
      return dateB.getTime() - dateA.getTime();
    });

  // Set up container for rendering MDX
  const renderers = await loadRenderers([getMDXRenderer()]);
  const container = await AstroContainer.create({ renderers });

  const items = await Promise.all(
    publishedPosts.map(async (post) => {
      const { Content } = await post.render();
      const rawHtml = await container.renderToString(Content);

      // Sanitize HTML for RSS
      const content = sanitizeHtml(rawHtml, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
      });

      return {
        title: post.data.title,
        pubDate: post.data.date || new Date(post.slug.slice(0, 10)),
        link: `/posts/${post.slug}/`,
        content,
      };
    })
  );

  return rss({
    title: "AnnatarHe's Blog",
    description: "Personal blog by AnnatarHe",
    site: context.site!,
    items,
  });
}
