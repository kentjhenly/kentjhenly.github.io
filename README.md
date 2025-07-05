This portfolio is a modified version of [dillionverma/portfolio](https://github.com/dillionverma/portfolio).

Built with Next.js, shadcn/ui, and magic ui, originally deployed on Vercel and now fixed to be deployable on GitHub Pages.

## Features

- **GitHub Contribution Graph**: Displays your GitHub activity using the GitHub GraphQL API
- **Responsive Design**: Works seamlessly across all devices
- **Dark/Light Mode**: Built-in theme switching
- **Blog Support**: MDX-based blog with markdown support
- **Smooth Animations**: Powered by Framer Motion and Magic UI

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui
- Magic UI
- Framer Motion
- Lucide React (icons)
- MDX (for blog)
- GitHub Actions (for deployment)
- pnpm (package manager)

## Setup

### GitHub Contribution Graph

To enable the GitHub contribution graph:

1. **Create a GitHub Personal Access Token**:
   - Go to GitHub Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
   - Generate new token with `read:user` and `read:email` scopes
   - Copy the token

2. **For Local Development**:
   - Create a `.env.local` file in the project root
   - Add: `NEXT_PUBLIC_GITHUB_TOKEN=your_token_here`

3. **For GitHub Pages Deployment**:
   - Go to your repository Settings → Secrets and Variables → Actions
   - Create a new repository secret named `PERSONAL_ACCESS_TOKEN`
   - Set the value to your GitHub token

4. **Update Username**:
   - In `src/app/page.tsx`, change the username in `<GitHubContributions username="your_username" />`

### 3D Rubik's Cube Solver

The portfolio features an interactive 3D Rubik's cube solver built with Three.js and React Three Fiber.

**Features:**
- **Interactive 3D Cube**: 3x3x3 Rubik's cube with realistic rendering
- **Mouse Controls**: Drag to rotate the cube freely
- **Solving Animation**: Step-by-step solving process that changes cube colors
- **Scrambled State**: Starts with a randomly scrambled cube
- **Visual Solving**: Watch as faces get solved one by one
- **Final Result**: Properly solved cube with each face having its own color

**How it Works:**
1. **Scrambled Start**: The cube begins in a randomly scrambled state
2. **Step-by-Step Solving**: Each step fixes specific faces:
   - Step 1: Fixes the white face (bottom)
   - Step 2: Fixes both white and yellow faces (top and bottom)
   - Step 3: Fixes all side faces with proper colors
   - Step 4: Final solved state with proper Rubik's cube colors (red, blue, green, yellow, orange, white)
3. **Interactive Controls**: Use mouse to rotate the cube during solving

**Customization:**
- Modify solving steps in `src/components/rubiks-cube.tsx`
- Change colors in the `colors` object
- Adjust animation timing (currently 1000ms per step)
- Add more complex solving algorithms

