# Personal Portfolio

This portfolio is a modified version of [dillionverma/portfolio](https://github.com/dillionverma/portfolio).

Built with Next.js, shadcn/ui, and magic ui, originally deployed on Vercel and now optimized for GitHub Pages deployment.

Includes:
- An interactive world map to highlight countries I've visited
- A real-time GitHub contribution graph
- An interactive 3D Rubik's Cube
- A floating aquarium mode with animated fish and shrimp

## 🎯 How to Use This Template

Want to create your own portfolio using this optimized version? Here's how to get started:

### 1. Fork and Clone
```bash
# Fork this repository to your GitHub account
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/heilcheng.github.io.git
cd heilcheng.github.io
```

### 2. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 3. Personalize Your Information

**Update Personal Data** (`src/data/resume.tsx`):
```typescript
export const DATA = {
  name: "Your Name",
  initials: "YN",
  url: "https://your-username.github.io",
  location: "Your Location",
  locationLink: "https://www.google.com/maps/place/your-location",
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

### 4. Update Images and Assets
- Replace `/me.jpeg` with your profile photo
- Update company logos in `public/` folder
- Add your own project screenshots

### 5. Configure GitHub Pages

**Repository Setup:**
1. Go to your repository Settings → Pages
2. Set Source to "GitHub Actions"
3. Enable GitHub Pages

**GitHub Actions** (`.github/workflows/deploy.yml`):
- The workflow is already configured
- It will automatically deploy when you push to main

### 6. Customize Features

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

**Aquarium Mode**: 
- Already included, just toggle on/off
- Customize colors in `src/components/aquarium.tsx`

### 7. Add Your Content

**Blog Posts** (`content/` folder):
```bash
# Create new blog posts
touch content/your-post.mdx
```

**Example blog post structure:**
```markdown
---
title: "Your Blog Post Title"
publishedAt: "2024-01-01"
summary: "Brief description of your post"
---

Your blog content here...
```

### 8. Customize Styling

**Theme Colors** (`tailwind.config.ts`):
```typescript
// Update your brand colors
colors: {
  primary: {
    // Your primary color
  }
}
```

**Components** (`src/components/`):
- Modify existing components
- Add new components as needed
- Update animations and transitions

### 9. Test and Deploy

**Local Development:**
```bash
npm run dev
# Visit http://localhost:3000
```

**Deploy:**
```bash
git add .
git commit -m "Personalize portfolio"
git push origin main
# GitHub Actions will automatically deploy to GitHub Pages
```

### 10. Optional Customizations

**Remove Features You Don't Want:**
- Delete aquarium component if not needed
- Remove world map section
- Simplify the layout

**Add New Features:**
- Create new interactive components
- Add more sections (skills, testimonials, etc.)
- Integrate with external APIs

## ✨ Features

- **Interactive World Map**: Highlights countries visited, with zoom, pan, and hover effects
- **GitHub Contribution Graph**: Real-time GitHub activity visualization
- **Interactive 3D Rubik's Cube**: Built with Three.js and React Three Fiber
- **Aquarium Mode**: Toggle a floating aquarium overlay with animated fish and shrimp swimming across your site. Fun, non-intrusive, and can be enabled/disabled with a button in the bottom-right corner.
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

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm

### Installation
```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
pnpm install
pnpm dev
```

## ⚙️ Configuration

### World Map

- The map uses a local GeoJSON file: `public/world-countries.json`.
- To highlight countries, edit the `visitedCountries` array in `src/components/world-map.tsx` and add the ISO A3 codes (e.g., "USA", "CHN").
- You can update the GeoJSON file if you want to use a different map or add more features.

### GitHub Contribution Graph

1. **Create Personal Access Token**:
   - GitHub Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
   - Generate token with `read:user` and `read:email` scopes

2. **Local Development**:
   - Create `.env.local` in project root
   - Add: `NEXT_PUBLIC_GITHUB_TOKEN=your_token_here`

3. **GitHub Pages Deployment**:
   - Repository Settings → Secrets and Variables → Actions
   - Create secret: `PERSONAL_ACCESS_TOKEN`
   - Set value to your GitHub token

4. **Update Username**:
   - Edit `src/app/page.tsx`
   - Change username in `<GitHubContributions username="your_username" />`

### 3D Rubik's Cube Solver

**Features:**
- Interactive 3D cube with realistic rendering
- Mouse controls for rotation
- Step-by-step solving animation
- Scrambled state generation
- Visual solving process

**Customization:**
- Modify solving steps in `src/components/rubiks-cube.tsx`
- Adjust colors and animation timing
- Add complex solving algorithms

### Aquarium Mode

**Features:**
- Toggle button in the bottom-right corner (light blue, with a fish icon)
- Animated SVG fish and shrimp swim across the site
- Creatures bounce off edges and change direction for a natural effect
- Overlay is non-intrusive and pointer-events are disabled
- Works on all pages and screen sizes

**How to Use:**
- Click the "Show Aquarium" button (with fish icon) in the bottom-right to enable
- Click "Hide Aquarium" to disable
- The aquarium overlay is purely visual and does not affect site functionality

## 🤝 Contributing

Feel free to fork this project and customize it for your own portfolio. If you make improvements that could benefit others, consider opening a pull request!

## 📝 License

This project is based on [dillionverma/portfolio](https://github.com/dillionverma/portfolio) and modified for personal use.

