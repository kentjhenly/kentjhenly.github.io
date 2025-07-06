# Personal Portfolio

This portfolio is a modified version of [dillionverma/portfolio](https://github.com/dillionverma/portfolio).

Built with Next.js, shadcn/ui, and magic ui, originally deployed on Vercel and now optimized for GitHub Pages deployment.

**Optimized:**
- For GitHub Pages deployment
- Interactive World Map: Highlights countries visited, with zoom, pan, and hover effects
- Hong Kong Map: Interactive map with points of interest and clustering
- GitHub Contribution Graph: Real-time GitHub activity visualization
- Interactive 3D Rubik's Cube: Built with Three.js and React Three Fiber
- Protein Folding Visualization: AlphaFold-inspired 3D protein structure with pLDDT confidence scoring
- Torus-Mug Morph: Interactive 3D morphing between topological equivalents
- Aquarium Mode: Toggle a floating aquarium overlay with animated fish

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [How to Use This Template](#how-to-use-this-template)
- [Remove Unwanted Features](#remove-unwanted-features)
- [Quick Start](#quick-start)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Interactive World Map**: Highlights countries visited, with zoom, pan, and hover effects using react-simple-maps
- **Hong Kong Map**: Interactive map with custom markers, clustering, and points of interest using React Leaflet
- **GitHub Contribution Graph**: Real-time GitHub activity visualization
- **Professional CFOP Solver**: Interactive 3D visualization of the CFOP method used by professional speed-cubers, featuring Cross, F2L, OLL, and PLL stages with algorithm names, trigger moves, and color neutrality
- **Protein Folding Visualization**: AlphaFold-inspired 3D protein structure with smooth tube geometry, pLDDT confidence scoring, PAE plots, and realistic secondary structure
- **Torus-Mug Morph**: Interactive 3D morphing between a torus and coffee mug, demonstrating topological equivalence
- **Aquarium Mode**: Toggle a floating aquarium overlay with animated fish and shrimp
- **Responsive Design**: Optimized for all devices
- **Dark/Light Mode**: Built-in theme switching
- **Blog Support**: MDX-based blog with markdown support
- **Smooth Animations**: Powered by Framer Motion and Magic UI

## Tech Stack

- **Framework**: Next.js 14, React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Animations**: Framer Motion, Magic UI
- **3D Graphics**: Three.js, React Three Fiber, @react-three/drei
- **Maps**: React Leaflet, react-simple-maps
- **Icons**: Lucide React
- **Content**: MDX
- **Deployment**: GitHub Actions
- **Package Manager**: pnpm

## How to Use This Template

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

### 3. Configure Features

**World Map** (`src/components/world-map.tsx`):
```typescript
const visitedCountries = [
  "USA", // Add your visited countries
  "CHN", // Use ISO A3 codes
  // ... more countries
];
```

**Hong Kong Map** (`src/components/hong-kong-map.tsx`):
```typescript
const pointsOfInterest = [
  {
    name: "Your Location",
    type: "urban", // or "nature"
    coordinates: [22.3193, 114.1694], // [lat, lng]
    description: "Your description"
  }
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

**Showcase Page** (`src/app/showcase/page.tsx`):
- Customize the 3D visualizations or remove them entirely
- Update descriptions and titles

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

## Remove Unwanted Features

Don't want all the features? Here's how to remove them:

### Remove World Map
1. Delete `src/components/world-map.tsx`
2. Remove from `src/app/page.tsx`:
```typescript
// Delete this line:
<WorldMap delay={BLUR_FADE_DELAY * 19} />
```

### Remove Hong Kong Map
1. Delete `src/components/hong-kong-map.tsx`
2. Remove from `src/app/page.tsx`:
```typescript
// Delete this line:
<HongKongMap delay={BLUR_FADE_DELAY * 20} />
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

### Remove Protein Folding Visualization
1. Delete `src/components/protein-folding.tsx`
2. Remove from `src/app/showcase/page.tsx`:
```typescript
// Delete the protein folding section
```

### Remove Torus-Mug Morph
1. Delete `src/components/torus-mug-morph.tsx`
2. Remove from `src/app/showcase/page.tsx`:
```typescript
// Delete the torus-mug morph section
```

### Remove Showcase Page Entirely
1. Delete `src/app/showcase/` folder
2. Remove showcase link from `src/data/resume.tsx`:
```typescript
navbar: [
  { href: "/", icon: HomeIcon, label: "Home" },
  // Delete this line:
  // { href: "/showcase", icon: SparklesIcon, label: "Showcase" },
],
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

## Quick Start

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
npm install
npm run dev
# Visit http://localhost:3000
```

## Contributing

Feel free to fork this project and customize it for your own portfolio. If you make improvements that could benefit others, consider opening a pull request!

## License

This project is based on [dillionverma/portfolio](https://github.com/dillionverma/portfolio) and modified for personal use.

