# Krishik Agri Business Hub

A comprehensive web platform for the Krishik Agri Business Incubator, showcasing innovative agricultural products and startups from the University of Agricultural Sciences, Dharwad.

## 🚀 Features

- **Product Showcase**: Browse and purchase innovative agricultural products
- **Startup Directory**: Explore incubated startups and their innovations
- **Focus Areas**: Comprehensive coverage of agricultural innovation domains
- **Contact Management**: Easy communication with startups and the incubator
- **Responsive Design**: Optimized for all devices and screen sizes
- **Form Validation**: Robust form handling with real-time validation
- **SEO Optimized**: Built-in SEO features for better discoverability
- **Analytics**: User interaction tracking and insights
- **Authentication**: User management system (ready for backend integration)

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query for server state
- **Forms**: React Hook Form with Yup validation
- **Routing**: React Router v6
- **SEO**: React Helmet Async
- **Analytics**: Google Analytics 4 ready
- **Icons**: Lucide React

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd krishik-agri
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
npm run dev
```

4. **Open your browser**
   Navigate to `http://localhost:8080`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── ProductCard.tsx # Product display component
│   ├── StartupCard.tsx # Startup display component
│   ├── ContactForm.tsx # Contact form with validation
│   └── ...
├── data/               # Centralized data files
│   ├── products.ts     # Product data
│   ├── startups.ts     # Startup data
│   └── focusAreas.ts   # Focus area data
├── hooks/              # Custom React hooks
│   └── useAuth.ts      # Authentication hook
├── pages/              # Page components
│   ├── Index.tsx       # Home page
│   ├── Products.tsx    # Products listing
│   ├── Startups.tsx    # Startups listing
│   └── ...
├── types/              # TypeScript type definitions
│   └── index.ts        # Centralized types
└── App.tsx             # Main application component
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
VITE_API_BASE_URL=https://api.yourbackend.com
```

### Customization

1. **Colors**: Update `tailwind.config.ts` for brand colors
2. **Data**: Modify files in `src/data/` to update content
3. **Styling**: Customize components in `src/components/`

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy Options

1. **Vercel** (Recommended)
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Netlify**
   - Connect your repository
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Static Hosting**
   - Upload `dist/` folder to your hosting provider
   - Configure SPA routing (all routes redirect to index.html)

## 📝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Add tests** (if applicable)
5. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful commit messages
- Add JSDoc comments for complex functions

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:coverage
```

## 🔒 Security

- All forms include CSRF protection
- Input validation on both client and server
- Secure authentication flow
- HTTPS enforcement in production

## 📊 Analytics

The application includes Google Analytics 4 integration:

- Page view tracking
- Custom event tracking
- Form submission tracking
- User interaction analytics

## 🌐 SEO

- Meta tags optimization
- Open Graph support
- Twitter Card support
- Structured data markup
- Sitemap generation ready

## 🤝 Support

For support and questions:

- **Email**: info@krishikagri.com
- **Phone**: +91 836 221 5284
- **Address**: University of Agricultural Sciences, Dharwad, Karnataka 580005

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- University of Agricultural Sciences, Dharwad
- RKVY-Innovation and Agri-Entrepreneurship Programme
- Ministry of Agriculture & Farmers' Welfare, Government of India
- All participating startups and innovators

---

**Built with ❤️ for Agricultural Innovation**
