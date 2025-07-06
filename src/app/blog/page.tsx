import BlurFade from "@/components/magicui/blur-fade";
import { getBlogPosts } from "@/data/blog";
import { getMediumPosts } from "@/data/medium-posts";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export const metadata = {
  title: "Blog",
  description: "My thoughts on software development, life, and more.",
};

const BLUR_FADE_DELAY = 0.04;

export default async function BlogPage() {
  const posts = await getBlogPosts();
  const mediumPosts = getMediumPosts();

  // Combine and sort all posts by date
  const allPosts = [
    ...posts.map(post => ({
      ...post,
      type: 'local' as const,
      url: `/blog/${post.slug}`,
      isExternal: false
    })),
    ...mediumPosts.map(post => ({
      ...post,
      type: 'medium' as const,
      url: post.url,
      isExternal: true
    }))
  ].sort((a, b) => {
    if (new Date(a.publishedAt) > new Date(b.publishedAt)) {
      return -1;
    }
    return 1;
  });

  return (
    <section className="max-w-4xl mx-auto">
      <BlurFade delay={BLUR_FADE_DELAY}>
        <div className="mb-12">
          <h1 className="font-medium text-3xl mb-4 tracking-tighter">Blog</h1>
          <p className="text-muted-foreground">
            Thoughts on software development, technology, and life in Hong Kong.
          </p>
        </div>
      </BlurFade>
      
      <div className="space-y-8">
        {allPosts.map((post, id) => (
          <BlurFade delay={BLUR_FADE_DELAY * 2 + id * 0.05} key={post.type === 'local' ? post.slug : post.url}>
            <Link
              className="group block p-6 rounded-lg border border-transparent hover:border-border transition-colors duration-200"
              href={post.url}
              target={post.isExternal ? "_blank" : undefined}
              rel={post.isExternal ? "noopener noreferrer" : undefined}
            >
              <article className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h2 className="text-xl font-medium tracking-tight group-hover:text-foreground transition-colors flex-1">
                      {post.title}
                    </h2>
                    {post.isExternal && (
                      <ExternalLink className="size-4 text-muted-foreground mt-1 ml-2 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {post.summary}
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <time className="text-xs text-muted-foreground">
                    {formatDate(post.publishedAt)}
                  </time>
                  <div className="flex items-center space-x-2">
                    {post.tags && post.tags.slice(0, 2).map((tag: string) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                    {post.isExternal && (
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                        Medium
                      </span>
                    )}
                  </div>
                </div>
              </article>
            </Link>
          </BlurFade>
        ))}
      </div>
      
      {allPosts.length === 0 && (
        <BlurFade delay={BLUR_FADE_DELAY * 2}>
          <div className="text-center py-12">
            <p className="text-muted-foreground">No blog posts yet. Check back soon!</p>
          </div>
        </BlurFade>
      )}
    </section>
  );
}
