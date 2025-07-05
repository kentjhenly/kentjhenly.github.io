This portfolio is a modified version of [dillionverma/portfolio](https://github.com/dillionverma/portfolio).

Built with Next.js, shadcn/ui, and magic ui, originally deployed on Vercel and now fixed to be deployable on GitHub Pages.

## Features

- **GitHub Contribution Graph**: Displays your GitHub activity using the GitHub GraphQL API
- **Responsive Design**: Works seamlessly across all devices
- **Dark/Light Mode**: Built-in theme switching
- **Blog Support**: MDX-based blog with markdown support
- **Smooth Animations**: Powered by Framer Motion and Magic UI

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

To customize the 3D Rubik's cube solver:

1. **Install Dependencies** (if not already installed):
   ```bash
   npm install three @types/three @react-three/fiber @react-three/drei --legacy-peer-deps
   ```

2. **Customize the Solving Algorithm**:
   - Open `src/components/rubiks-cube.tsx`
   - Modify the `solvingSteps` array to add your own moves
   - Example: `{ rotation: "R", axis: "y", angle: Math.PI / 2 }`

3. **Change Cube Colors**:
   - Update the `colors` object in the component
   - Modify the color assignment logic in the cube generation loop

4. **Adjust Animation Speed**:
   - Change the `duration` value (currently 1000ms per move)
   - Modify the `useFrame` rotation speed for idle animation

5. **Add More Features**:
   - Implement scramble functionality
   - Add more complex solving algorithms (CFOP, Roux)
   - Include sound effects for moves
   - Add statistics tracking

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

