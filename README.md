# Personal Portfolio

This portfolio is a modified version of [dillionverma/portfolio](https://github.com/dillionverma/portfolio).

Built with Next.js, shadcn/ui, and magic ui, originally deployed on Vercel and now optimized for GitHub Pages deployment.

## ✨ Features

- **Interactive World Map**: Highlights countries visited, with zoom, pan, and hover effects
- **GitHub Contribution Graph**: Real-time GitHub activity visualization
- **Interactive 3D Rubik's Cube**: Built with Three.js and React Three Fiber
- **Aquarium Mode**: Toggle a floating aquarium overlay with animated fish and shrimp
- **Responsive Design**: Optimized for all devices
- **Dark/Light Mode**: Built-in theme switching
- **Blog Support**: MDX-based blog with markdown support
- **Smooth Animations**: Powered by Framer Motion and Magic UI

## 🛠️ Tech Stack

- **Framework**: Next.js 14, React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Animations**: Framer Motion, Magic UI
- **Icons**: Lucide React
- **Content**: MDX
- **Deployment**: GitHub Actions
- **Package Manager**: pnpm

## 🎯 How to Use This Template

Want to create your own portfolio using this optimized version? Here's how to get started:

### 1. Fork and Clone
```bash
# Fork this repository to your GitHub account
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/heilcheng.github.io.git
cd heilcheng.github.io
npm install
```

### 2. Personalize Your Information

**Update Personal Data** (`src/data/resume.tsx`):
```typescript
export const DATA = {
  name: "Your Name",
  initials: "YN",
  url: "https://your-username.github.io",
  location: "Your Location",
  description: "Your personal description",
  summary: "Your summary",
  avatarUrl: "/your-photo.jpg",
  // ... update contact info, experience, education, projects
}
```

**Key Sections to Customize:**
- **Contact Information**: Update email, phone, social links
- **Technical Experience**: Add your work history
- **Education**: Update your academic background
- **Projects**: Showcase your best work
- **Books**: Replace with your own reading list (or remove this section)

### 3. Configure Features

**World Map** (`src/components/world-map.tsx`):
```typescript
const visitedCountries = [
  "USA", // Add your visited countries
  "CHN", // Use ISO A3 codes
  // ... more countries
];
```

**GitHub Contributions** (`src/app/page.tsx`):
```typescript
<GitHubContributions username="your-github-username" />
```

**GitHub Token Setup** (for contribution graph):
1. Create Personal Access Token: GitHub Settings → Developer Settings → Personal Access Tokens
2. Generate token with `read:user` and `read:email` scopes
3. For local development: Create `.env.local` with `NEXT_PUBLIC_GITHUB_TOKEN=your_token_here`
4. For GitHub Pages: Repository Settings → Secrets → Create `PERSONAL_ACCESS_TOKEN`

**Aquarium Mode**: 
- Already included, just toggle on/off
- Customize colors in `src/components/aquarium.tsx`

### 4. Update Assets and Deploy

**Replace Assets:**
- Replace `/me.jpeg` with your profile photo
- Update company logos in `public/` folder
- Add your own project screenshots

**Deploy to GitHub Pages:**
1. Repository Settings → Pages → Set Source to "GitHub Actions"
2. Push your changes:
```bash
git add .
git commit -m "Personalize portfolio"
git push origin main
```

### 5. Add Content (Optional)

**Blog Posts** (`content/` folder):
```markdown
---
title: "Your Blog Post Title"
publishedAt: "2024-01-01"
summary: "Brief description of your post"
---

Your blog content here...
```

**Customize Styling** (`tailwind.config.ts`):
```typescript
colors: {
  primary: {
    // Your primary color
  }
}
```

## 🗑️ Remove Unwanted Features

Don't want all the features? Here's how to remove them:

### Remove World Map
1. Delete `src/components/world-map.tsx`
2. Remove from `src/app/page.tsx`:
```typescript
// Delete this line:
<WorldMap delay={BLUR_FADE_DELAY * 19} />
```

### Remove GitHub Contributions
1. Delete `src/components/github-contributions.tsx`
2. Remove from `src/app/page.tsx`:
```typescript
// Delete this line:
<GitHubContributions username="heilcheng" delay={BLUR_FADE_DELAY * 13} />
```

### Remove Aquarium Mode
1. Delete `src/components/aquarium.tsx`
2. Remove from `src/app/layout.tsx`:
```typescript
// Delete this line:
<Aquarium />
```

### Remove 3D Rubik's Cube
1. Delete `src/components/rubiks-cube.tsx`
2. Remove from `src/app/page.tsx`:
```typescript
// Delete this line:
<RubiksCube delay={BLUR_FADE_DELAY * 22} />
```

### Remove Commonplace Book
1. Delete `src/components/book-card.tsx`
2. Remove from `src/app/page.tsx`:
```typescript
// Delete the entire books section
```

### Remove Blog
1. Delete `content/` folder
2. Delete `src/app/blog/` folder
3. Remove blog link from `src/data/resume.tsx`:
```typescript
navbar: [
  { href: "/", icon: HomeIcon, label: "Home" },
  // Delete this line:
  // { href: "/blog", icon: NotebookIcon, label: "Blog" },
],
```

### Simplify Layout
Want a minimal version? Keep only:
- Personal info section
- Experience section
- Education section
- Projects section

## 🚀 Quick Start

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
npm install
npm run dev
# Visit http://localhost:3000
```

## 🤝 Contributing

Feel free to fork this project and customize it for your own portfolio. If you make improvements that could benefit others, consider opening a pull request!

## 📝 License

This project is based on [dillionverma/portfolio](https://github.com/dillionverma/portfolio) and modified for personal use.

