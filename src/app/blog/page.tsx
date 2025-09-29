import BlurFade from "@/components/magicui/blur-fade";
import { getBlogPosts } from "@/data/blog";
import { getMediumPosts } from "@/data/medium-posts";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { ExternalLink, Search } from "lucide-react";

export const metadata = {
  title: "Blog",
  description: "Thoughts and reflections on my lived experience, topics may vary.",
};

const BLUR_FADE_DELAY = 0.04;


export default async function BlogPage() {
  const posts = await getBlogPosts();
  const mediumPosts = getMediumPosts();

  // Combine and categorize all posts
  const allPosts = [
    ...posts.map(post => ({
      ...post,
      type: 'local' as const,
      url: `/blog/${post.slug}`,
      isExternal: false,
      publishedAt: post.metadata.publishedAt,
      title: post.metadata.title,
      summary: post.metadata.summary,
      tags: post.metadata.tags
    })),
    ...mediumPosts.map(post => ({
      ...post,
      type: 'medium' as const,
      url: post.url,
      isExternal: true
    }))
  ];

  // Sort posts by date
  const sortedPosts = allPosts.sort((a, b) => {
    if (new Date(a.publishedAt) > new Date(b.publishedAt)) {
      return -1;
    }
    return 1;
  });

  return (
    <section className="max-w-3xl mx-auto px-4 py-16">
      <BlurFade delay={BLUR_FADE_DELAY}>
        <div className="mb-16 text-center">
          <h1 className="font-semibold text-4xl mb-3 tracking-tight">Blog</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Thoughts and reflections on my lived experience, topics may vary.
          </p>
        </div>
      </BlurFade>

      
      {/* Posts Grid */}
      <BlurFade delay={BLUR_FADE_DELAY * 2}>
        <div className="space-y-6" id="posts-container">
          {sortedPosts.map((post, index) => (
            <BlurFade 
              key={post.type === 'local' ? post.slug : post.url} 
              delay={BLUR_FADE_DELAY * 3 + index * 0.05}
            >
              <Link
                className="group block"
                href={post.url}
                target={post.isExternal ? "_blank" : undefined}
                rel={post.isExternal ? "noopener noreferrer" : undefined}
              >
                <article className="p-8 rounded-2xl border border-border/50 hover:border-border transition-all duration-300 hover:shadow-sm hover:shadow-border/20">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="text-xl font-medium tracking-tight group-hover:text-foreground transition-colors duration-200 flex-1 leading-relaxed">
                          {post.title}
                        </h3>
                        {post.isExternal && (
                          <ExternalLink className="size-4 text-muted-foreground mt-1 ml-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        )}
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {post.summary}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <time className="text-sm text-muted-foreground font-medium">
                        {formatDate(post.publishedAt)}
                      </time>
                      <div className="flex items-center space-x-2">
                        {post.tags && post.tags.slice(0, 2).map((tag: string) => (
                          <span
                            key={tag}
                            className="text-xs px-3 py-1 rounded-full bg-muted/50 text-muted-foreground font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                        {post.isExternal && (
                          <span className="text-xs px-3 py-1 rounded-full bg-muted/50 text-muted-foreground font-medium">
                            Medium
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            </BlurFade>
          ))}
        </div>
      </BlurFade>
      
      {sortedPosts.length === 0 && (
        <BlurFade delay={BLUR_FADE_DELAY * 2}>
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted/50 mx-auto mb-4 flex items-center justify-center">
              <Search className="size-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg">No blog posts found.</p>
          </div>
        </BlurFade>
      )}

    </section>
  );
}
