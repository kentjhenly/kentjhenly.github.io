# Hailey Cheng - Portfolio

Personal portfolio website built with Next.js, showcasing my work in AI/ML, mathematical biology research, and software engineering experience.

## 🚀 Features

- **Modern Design**: Clean, responsive design with dark/light mode
- **AI/ML Focus**: Highlighting experience at Google DeepMind and Coglix.ai
- **Research Showcase**: Mathematical biology and AI in biomedicine projects
- **Interactive Elements**: Smooth animations and transitions
- **Blog Support**: MDX-based blog system
- **GitHub Pages Ready**: Optimized for static hosting

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI, Magic UI
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Deployment**: GitHub Pages

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/heilcheng/heilcheng.github.io.git
cd heilcheng.github.io
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Deployment

### GitHub Pages (Modified for Static Export)

This project has been modified from the original Vercel-optimized template to work with GitHub Pages:

1. **Static Export**: Configured Next.js for static site generation
2. **GitHub Actions**: Automated build and deployment workflow
3. **Base Path**: Optimized for GitHub Pages URL structure
4. **Image Handling**: Unoptimized images for static hosting compatibility

### Manual Build

```bash
pnpm build
```

The static files will be generated in the `out/` directory.

## 📝 Customization

### Update Personal Information

Edit `src/data/resume.tsx` to update:
- Personal details
- Technical experience
- Education
- Projects
- Contact information

### Add Blog Posts

1. Create new `.mdx` files in the `content/` directory
2. Add frontmatter with title, date, and description
3. Write your content in Markdown/MDX format

### Styling

- **Colors**: Update Tailwind CSS classes in components
- **Layout**: Modify components in `src/components/`
- **Animations**: Adjust Framer Motion configurations

## 📁 Project Structure

```
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── data/            # Resume and site data
│   └── lib/             # Utility functions
├── content/             # Blog posts (MDX)
├── public/              # Static assets
└── .github/workflows/   # GitHub Actions
```

## 🔧 Modifications from Original Template

This portfolio is based on a Next.js template but has been significantly modified for GitHub Pages deployment:

- **Static Export**: Added `output: 'export'` configuration
- **GitHub Actions**: Custom deployment workflow for GitHub Pages
- **Base Path**: Configured for GitHub Pages URL structure
- **Image Optimization**: Disabled for static hosting compatibility
- **Content**: Completely customized with personal information and projects

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Links

- **Portfolio**: [https://heilcheng.github.io](https://heilcheng.github.io)
- **GitHub**: [https://github.com/heilcheng](https://github.com/heilcheng)
- **LinkedIn**: [https://linkedin.com/in/hailey-cheng](https://linkedin.com/in/hailey-cheng)

---

Built with ❤️ by Hailey Cheng
