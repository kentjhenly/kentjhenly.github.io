# Personal Portfolio & Showcase

This is a highly customized and feature-rich personal portfolio built with a modern tech stack. It's designed not just to be a resume, but an interactive playground showcasing a passion for software engineering, 3D visualization, and data representation.

This portfolio is a modified version of the [dillionverma/portfolio](https://github.com/dillionverma/portfolio) template, optimized for deployment on GitHub Pages and extended with numerous custom interactive features.

## Features

This portfolio is packed with interactive and visually engaging components that demonstrate a wide range of web development skills.

### Interactive 3D Visualizations:

- **Rubik's Cube Solver**: An interactive 3D Rubik's Cube that visualizes the CFOP solving method, breaking it down into Cross, F2L, OLL, and PLL stages.

- **Protein Folding**: An AlphaFold-inspired 3D visualization of a polypeptide chain folding into its functional structure, with colors representing pLDDT confidence scores.

- **Torus-Mug Morph**: A beautiful demonstration of topological equivalence, allowing users to seamlessly morph a 3D torus into a coffee mug using a slider.

### Data-Driven Maps:

- **World Map**: A global map built with react-simple-maps that highlights visited countries and provides tooltips for interactivity.

- **Hong Kong Map**: A detailed, interactive map of Hong Kong created with react-leaflet, featuring custom markers for points of interest categorized by type (e.g., Nature, Urban).

### Dynamic Content & UI:

- **GitHub Contribution Graph**: A real-time visualization of your GitHub activity, fetched directly from the GitHub GraphQL API. It's fully responsive, with a scrollable view on mobile.

- **Aquarium Mode**: A whimsical, toggleable overlay that fills the screen with animated fish and shrimp, built with a custom animation loop using requestAnimationFrame.

- **Fluid Animations**: Smooth, staggered animations on page load and scroll, powered by Framer Motion and Magic UI components like BlurFade and BlurFadeText.

- **Dock Navigation**: A macOS-style dock with a magnification effect on hover for intuitive and aesthetically pleasing navigation.

- **MDX Blog**: A fully-featured blog with support for Markdown and embedded React components, with syntax highlighting provided by rehype-pretty-code.

## Tech Stack

This project leverages a modern, robust, and performant tech stack.

- **Framework**: Next.js 14 (with App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with tailwindcss-animate
- **UI**: shadcn/ui
- **Animations**: Framer Motion & Magic UI
- **3D Graphics**: Three.js & React Three Fiber
- **Maps**: React Leaflet & react-simple-maps
- **Content**: MDX
- **Deployment**: GitHub Pages with GitHub Actions
- **Package Manager**: pnpm

## Getting Started

To get this portfolio up and running on your local machine, follow these steps.

### Fork and Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/heilcheng.github.io.git
cd heilcheng.github.io
```

### Install Dependencies

This project uses pnpm. Install it if you haven't already:

```bash
npm install -g pnpm
```

Then, install the project dependencies:

```bash
pnpm install
```

### Set Up Environment Variables

To fetch your GitHub contribution data, you'll need a GitHub Personal Access Token (PAT).

1. Create a `.env.local` file in the root of the project.
2. Add your token to the file:

```
NEXT_PUBLIC_GITHUB_TOKEN=your_github_pat_here
```

### Run the Development Server

```bash
pnpm dev
```

Open http://localhost:3000 in your browser to see the result.

## Customization Guide

To make this portfolio your own, you'll need to update the content and assets.

### Personal Information

All personal data, including your name, description, work experience, and social links, is centralized in `src/data/resume.tsx`. Modify this file to reflect your own information.

### Maps and Visualizations

- **World Map**: Update the `visitedCountries` array in `src/components/world-map.tsx` with the ISO A3 codes of the countries you've visited.

- **Hong Kong Map**: Modify the `locations` object in `src/components/hong-kong-map.tsx` to add your own points of interest, including their coordinates and descriptions.

- **GitHub Contributions**: Change the `username` prop passed to the `GitHubContributions` component in `src/app/page.tsx` to your GitHub username.

### Blog Posts

To add your own blog posts, create new `.mdx` files in the `content` directory. The frontmatter of each file should include a `title`, `publishedAt`, and `summary`.

## Deployment

This project is configured for seamless deployment to GitHub Pages using the workflow in `.github/workflows/deploy.yml`.

1. **Set Up GitHub Pages**: In your repository settings, navigate to "Pages" and set the build and deployment source to "GitHub Actions."

2. **Add Your PAT as a Secret**: In your repository settings, go to "Secrets and variables" > "Actions" and create a new repository secret named `PERSONAL_ACCESS_TOKEN` with the value of your GitHub PAT.

3. **Push to main**: Any push to the main branch will automatically trigger the GitHub Action, which will build the site and deploy it to your GitHub Pages URL.

