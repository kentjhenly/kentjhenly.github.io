import BlurFade from "@/components/magicui/blur-fade";
import { getBlogPosts } from "@/data/blog";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export const metadata = {
  title: "Blog",
  description: "My thoughts on software development, life, and more.",
};

const BLUR_FADE_DELAY = 0.04;

export default async function BlogPage() {
  const posts = await getBlogPosts();

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
        {posts
          .sort((a, b) => {
            if (
              new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
            ) {
              return -1;
            }
            return 1;
          })
          .map((post, id) => (
            <BlurFade delay={BLUR_FADE_DELAY * 2 + id * 0.05} key={post.slug}>
              <Link
                className="group block p-6 rounded-lg border border-transparent hover:border-border transition-colors duration-200"
                href={`/blog/${post.slug}`}
              >
                <article className="space-y-3">
                  <div className="space-y-2">
                    <h2 className="text-xl font-medium tracking-tight group-hover:text-foreground transition-colors">
                      {post.metadata.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {post.metadata.summary}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <time className="text-xs text-muted-foreground">
                      {formatDate(post.metadata.publishedAt)}
                    </time>
                    <div className="flex items-center space-x-2">
                      {post.metadata.tags && post.metadata.tags.slice(0, 2).map((tag: string) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              </Link>
            </BlurFade>
          ))}
      </div>
      
      {posts.length === 0 && (
        <BlurFade delay={BLUR_FADE_DELAY * 2}>
          <div className="text-center py-12">
            <p className="text-muted-foreground">No blog posts yet. Check back soon!</p>
          </div>
        </BlurFade>
      )}
    </section>
  );
}
