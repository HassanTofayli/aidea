# AIDEA - Private Links Management Platform

A modern, AI-powered private links management platform built with React, TypeScript, and Material-UI. Features ultra-modern UI design with glassmorphism effects, smart recommendations, and advanced analytics.

![AIDEA Platform](https://img.shields.io/badge/React-18+-blue.svg) ![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue.svg) ![Material-UI](https://img.shields.io/badge/MUI-7.3+-purple.svg) ![Supabase](https://img.shields.io/badge/Supabase-Database-green.svg)

## ✨ Features

### 🎨 Ultra-Modern UI
- **Glassmorphism Design**: Beautiful glass-like effects with backdrop blur
- **Gradient Animations**: Smooth, GPU-accelerated animations
- **Particle Background**: Dynamic floating particles with interactive effects
- **RTL Support**: Full Arabic language support with right-to-left layout
- **Dark/Light Themes**: Responsive design with multiple color schemes

### 🤖 AI-Powered Intelligence
- **Smart Recommendations**: AI algorithms analyze user behavior for personalized suggestions
- **Advanced Analytics**: Real-time performance metrics and data visualization
- **Intelligent Filtering**: Context-aware search and categorization
- **User Behavior Analysis**: Track access patterns and engagement rates

### 🛠️ Core Functionality
- **Private Link Management**: Secure access control for premium content
- **Category Organization**: Hierarchical content categorization
- **User Access Control**: Role-based permissions (Admin/User)
- **Subscription Management**: Track user subscriptions and notifications
- **WhatsApp Integration**: Direct access requests via WhatsApp

### 📊 Admin Dashboard
- **Complete CRUD Operations**: Manage items, categories, and users
- **Access Requests**: Handle user access requests efficiently
- **Real-time Statistics**: Monitor platform usage and performance
- **User Management**: Control user permissions and access levels

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/HassanTofayli/aidea.git
cd aidea
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env.local` file in the root directory:
```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
REACT_APP_WHATSAPP_NUMBER=your_whatsapp_number
REACT_APP_WHATSAPP_MESSAGE=your_default_message
```

4. **Run development server**
```bash
npm start
```

The application will open at `http://localhost:3000`

## 🏗️ Build & Deployment

### Local Build
```bash
# Create production build
npm run build

# Test production build locally
npx serve -s build
```

### 📦 GitHub Pages Deployment

#### Method 1: Using GitHub Actions (Recommended)

1. **Install gh-pages package**
```bash
npm install --save-dev gh-pages
```

2. **Add deployment scripts to package.json**
```json
{
  "homepage": "https://HassanTofayli.github.io/aidea",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

3. **Deploy to GitHub Pages**
```bash
npm run deploy
```

#### Method 2: Manual GitHub Actions Setup

1. **Create `.github/workflows/deploy.yml`**
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout
      uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build
      run: npm run build
      env:
        REACT_APP_SUPABASE_URL: ${{ secrets.REACT_APP_SUPABASE_URL }}
        REACT_APP_SUPABASE_ANON_KEY: ${{ secrets.REACT_APP_SUPABASE_ANON_KEY }}
        REACT_APP_SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.REACT_APP_SUPABASE_SERVICE_ROLE_KEY }}
        REACT_APP_WHATSAPP_NUMBER: ${{ secrets.REACT_APP_WHATSAPP_NUMBER }}
        REACT_APP_WHATSAPP_MESSAGE: ${{ secrets.REACT_APP_WHATSAPP_MESSAGE }}

    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./build
```

2. **Add secrets to GitHub repository**
   - Go to your GitHub repository
   - Settings → Secrets and variables → Actions
   - Add all environment variables as secrets

3. **Enable GitHub Pages**
   - Repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: gh-pages / root

### 🌐 Other Deployment Options

#### Vercel
```bash
npm i -g vercel
vercel --prod
```

#### Netlify
```bash
npm run build
# Upload build folder to Netlify or connect GitHub repo
```

#### Heroku
```bash
# Add buildpack for Create React App
git push heroku main
```

## 🛠️ Development

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ItemCard.tsx    # Individual item display
│   ├── CategoryFilter.tsx
│   ├── SmartRecommendations.tsx
│   ├── AdvancedAnalytics.tsx
│   └── dialogs/        # Modal dialogs
├── pages/              # Main application pages
│   ├── HomePage.tsx    # Primary interface
│   ├── SecondDesignPage.tsx  # Alternative design
│   └── AdminDashboard.tsx
├── contexts/           # React Context providers
├── services/           # API and external services
├── types/             # TypeScript type definitions
├── styles/            # CSS and animations
└── admin/             # Admin-only components
```

### Available Scripts

```bash
npm start          # Development server
npm run build      # Production build
npm test           # Run tests
npm run eject      # Eject from Create React App
npm run deploy     # Deploy to GitHub Pages
```

### 🎨 Design System

#### Color Palette
- **Primary**: `#667eea` to `#764ba2` (Gradient)
- **Secondary**: `#4facfe` to `#00f2fe` (Gradient)
- **Success**: `#43e97b` to `#38f9d7` (Gradient)
- **Warning**: `#fa709a` to `#fee140` (Gradient)

#### Typography
- **Font Family**: Tajawal (Arabic), Roboto (Latin)
- **RTL Support**: Full right-to-left layout
- **Font Weights**: 400, 600, 700, 800

## 🗄️ Database Setup (Supabase)

### Required Tables

1. **categories**
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

2. **items**
```sql
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  status TEXT DEFAULT 'active',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

3. **user_access**
```sql
CREATE TABLE user_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_id UUID REFERENCES items(id),
  granted_at TIMESTAMP DEFAULT NOW()
);
```

4. **subscriptions**
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_id UUID REFERENCES items(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Row Level Security (RLS)
Enable RLS and create appropriate policies for each table based on user roles.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- 📧 Email: [your-email@example.com]
- 💬 WhatsApp: [Your WhatsApp Number]
- 🐛 Issues: [GitHub Issues](https://github.com/HassanTofayli/aidea/issues)

## 🙏 Acknowledgments

- Material-UI for the component library
- Supabase for backend services
- React team for the amazing framework
- All contributors and users

---

**Built with ❤️ using React + TypeScript + Material-UI**

🚀 **Status**: Successfully deployed to GitHub Pages!
