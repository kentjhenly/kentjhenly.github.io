# Hailey Cheng - Portfolio

Personal portfolio website built with Next.js, showcasing my work in AI/ML, software engineering, and research experience.

## 🚀 Features

- **Modern Design**: Clean, responsive design with dark/light mode
- **AI/ML Focus**: Highlighting experience at Google DeepMind and Coglix.ai
- **Interactive Elements**: Smooth animations and transitions
- **Blog Support**: MDX-based blog system
- **GitHub Pages Ready**: Optimized for static hosting

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
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
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Deployment

### GitHub Pages (Recommended)

This project is configured for automatic deployment to GitHub Pages:

1. **Push to main branch**: The GitHub Actions workflow will automatically build and deploy your site
2. **Enable GitHub Pages**: Go to your repository settings → Pages → Source: Deploy from a branch → gh-pages branch
3. **Your site will be available at**: `https://heilcheng.github.io`

### Manual Build

```bash
npm run build
```

The static files will be generated in the `out/` directory.

## 📝 Customization

### Update Personal Information

Edit `src/data/resume.tsx` to update:
- Personal details
- Work experience
- Education
- Projects
- Skills
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
