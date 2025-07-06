import BlurFade from "@/components/magicui/blur-fade";
import { getBlogPosts } from "@/data/blog";
import { getMediumPosts } from "@/data/medium-posts";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { ExternalLink, Code, Globe, BookOpen, MessageSquare } from "lucide-react";

export const metadata = {
  title: "Blog",
  description: "My thoughts on software development, life, and more.",
};

const BLUR_FADE_DELAY = 0.04;

// Define category configurations with Apple-style design
const CATEGORIES = {
  "Website Development": {
    icon: Code,
    description: "Technical tutorials and implementation guides",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30"
  },
  "Life & Thoughts": {
    icon: MessageSquare,
    description: "Personal reflections and experiences",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/30"
  },
  "Medium Articles": {
    icon: Globe,
    description: "External articles and publications",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/30"
  }
};

// Function to categorize posts
function categorizePost(post: any) {
  const tags = post.tags || [];
  const title = post.title.toLowerCase();
  
  // Check for Medium posts first
  if (post.type === 'medium') {
    return "Medium Articles";
  }
  
  // Check for website development related posts
  if (tags.some((tag: string) => 
    ['Web Development', 'React', 'Next.js', 'TypeScript', 'Three.js', '3D Graphics', 'Maps', 'GitHub', 'API', 'Tutorial'].includes(tag)
  ) || title.includes('rubik') || title.includes('github') || title.includes('map') || title.includes('technical') || title.includes('architecture')) {
    return "Website Development";
  }
  
  // Default to Life & Thoughts
  return "Life & Thoughts";
}

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

  // Group posts by category
  const postsByCategory = allPosts.reduce((acc, post) => {
    const category = categorizePost(post);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(post);
    return acc;
  }, {} as Record<string, typeof allPosts>);

  // Sort posts within each category by date
  Object.keys(postsByCategory).forEach(category => {
    postsByCategory[category].sort((a, b) => {
      if (new Date(a.publishedAt) > new Date(b.publishedAt)) {
        return -1;
      }
      return 1;
    });
  });

  return (
    <section className="max-w-3xl mx-auto px-4">
      <BlurFade delay={BLUR_FADE_DELAY}>
        <div className="mb-16 text-center">
          <h1 className="font-semibold text-4xl mb-3 tracking-tight">Blog</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Thoughts on software development, technology, and life in Hong Kong.
          </p>
        </div>
      </BlurFade>
      
      <div className="space-y-16">
        {Object.entries(postsByCategory).map(([category, posts], categoryIndex) => {
          const categoryConfig = CATEGORIES[category as keyof typeof CATEGORIES];
          const IconComponent = categoryConfig?.icon || BookOpen;
          
          return (
            <BlurFade key={category} delay={BLUR_FADE_DELAY * 2 + categoryIndex * 0.1}>
              <div className="space-y-8">
                {/* Category Header */}
                <div className="text-center space-y-2">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${categoryConfig?.bgColor} ${categoryConfig?.color} mb-4`}>
                    <IconComponent className="size-6" />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight">{category}</h2>
                  <p className="text-muted-foreground text-base">{categoryConfig?.description}</p>
                </div>
                
                {/* Posts in this category */}
                <div className="space-y-6">
                  {posts.map((post, postIndex) => (
                    <BlurFade 
                      key={post.type === 'local' ? post.slug : post.url} 
                      delay={BLUR_FADE_DELAY * 3 + categoryIndex * 0.1 + postIndex * 0.05}
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
                                  <span className="text-xs px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 font-medium">
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
              </div>
            </BlurFade>
          );
        })}
      </div>
      
      {allPosts.length === 0 && (
        <BlurFade delay={BLUR_FADE_DELAY * 2}>
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted/50 mx-auto mb-4 flex items-center justify-center">
              <BookOpen className="size-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg">No blog posts yet. Check back soon!</p>
          </div>
        </BlurFade>
      )}
    </section>
  );
}
