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

// Define category configurations
const CATEGORIES = {
  "Website Development": {
    icon: Code,
    description: "Technical tutorials and implementation guides",
    color: "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
  },
  "Life & Thoughts": {
    icon: MessageSquare,
    description: "Personal reflections and experiences",
    color: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300"
  },
  "Medium Articles": {
    icon: Globe,
    description: "External articles and publications",
    color: "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300"
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
    <section className="max-w-4xl mx-auto">
      <BlurFade delay={BLUR_FADE_DELAY}>
        <div className="mb-12">
          <h1 className="font-medium text-3xl mb-4 tracking-tighter">Blog</h1>
          <p className="text-muted-foreground">
            Thoughts on software development, technology, and life in Hong Kong.
          </p>
        </div>
      </BlurFade>
      
      <div className="space-y-12">
        {Object.entries(postsByCategory).map(([category, posts], categoryIndex) => {
          const categoryConfig = CATEGORIES[category as keyof typeof CATEGORIES];
          const IconComponent = categoryConfig?.icon || BookOpen;
          
          return (
            <BlurFade key={category} delay={BLUR_FADE_DELAY * 2 + categoryIndex * 0.1}>
              <div className="space-y-6">
                {/* Category Header */}
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${categoryConfig?.color}`}>
                    <IconComponent className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-medium tracking-tight">{category}</h2>
                    <p className="text-sm text-muted-foreground">{categoryConfig?.description}</p>
                  </div>
                </div>
                
                {/* Posts in this category */}
                <div className="space-y-4">
                  {posts.map((post, postIndex) => (
                    <BlurFade 
                      key={post.type === 'local' ? post.slug : post.url} 
                      delay={BLUR_FADE_DELAY * 3 + categoryIndex * 0.1 + postIndex * 0.05}
                    >
                      <Link
                        className="group block p-6 rounded-lg border border-transparent hover:border-border transition-colors duration-200"
                        href={post.url}
                        target={post.isExternal ? "_blank" : undefined}
                        rel={post.isExternal ? "noopener noreferrer" : undefined}
                      >
                        <article className="space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <h3 className="text-lg font-medium tracking-tight group-hover:text-foreground transition-colors flex-1">
                                {post.title}
                              </h3>
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
                                <span className="text-xs px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300">
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
              </div>
            </BlurFade>
          );
        })}
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
