# 🎓 The Academy - LMS Template Installation Guide

## Overview

**The Academy** is a modern, full-featured Learning Management System built with Next.js 15, TypeScript, and Supabase. It includes everything you need to create, sell, and manage online courses.

## 🌟 Key Features

### **Core LMS Features**

- ✅ **Course Management** - Create, organize, and publish courses
- ✅ **Video Learning** - YouTube, Vimeo, and direct video support
- ✅ **Progress Tracking** - Real-time student progress analytics
- ✅ **Quiz System** - Interactive assessments with auto-grading
- ✅ **User Roles** - Admin, Instructor, and Student management
- ✅ **Payment Integration** - Stripe payment processing
- ✅ **Certificate System** - Automated certificate generation

### **Admin Features**

- ✅ **Template Manager** - No-code customization system
- ✅ **Branding Control** - Logo, colors, and theme customization
- ✅ **Content CMS** - Dynamic landing page editor
- ✅ **Analytics Dashboard** - Comprehensive reporting
- ✅ **User Management** - Role-based access control

### **Modern Tech Stack**

- ✅ **Next.js 15** - Latest React framework with App Router
- ✅ **TypeScript** - Type-safe development
- ✅ **Supabase** - PostgreSQL database with real-time features
- ✅ **Prisma ORM** - Type-safe database queries
- ✅ **NextAuth** - Secure authentication
- ✅ **Tailwind CSS** - Utility-first styling
- ✅ **Vercel Ready** - Optimized for serverless deployment

---

## 🚀 Quick Installation

### Prerequisites

- Node.js 18+ installed
- Git installed
- Supabase account (free tier available)
- Vercel account for deployment (optional)

### 1. Download & Setup

```bash
# Clone the repository
git clone https://github.com/your-username/lms-template.git
cd lms-template

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://user:password@host:5432/database"
DIRECT_URL="postgresql://user:password@host:5432/database"

# NextAuth Configuration
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Supabase Configuration (Optional - for additional features)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# Stripe Configuration (Optional - for payments)
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
```

### 3. Database Setup

```bash
# Push database schema to Supabase
npx prisma db push

# Generate Prisma client
npx prisma generate

# Create demo content (optional)
npx tsx create-demo-content.ts
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your LMS!

---

## 🗄️ Database Configuration

### Option 1: Supabase (Recommended)

1. **Create a Supabase Project**

   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization and set project details

2. **Get Database URLs**

   - Go to Settings → Database
   - Copy the Connection String (replace `[YOUR-PASSWORD]` with your password)
   - Use the direct connection for `DIRECT_URL`
   - Use the pooled connection for `DATABASE_URL`

3. **Configure Environment Variables**
   ```env
   DATABASE_URL="postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-1-eu-north-1.pooler.supabase.com:6543/postgres"
   DIRECT_URL="postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-1-eu-north-1.pooler.supabase.com:5432/postgres"
   ```

### Option 2: Other PostgreSQL Providers

The system works with any PostgreSQL database:

- **Railway**
- **PlanetScale** (MySQL with adapter)
- **Neon**
- **Local PostgreSQL**

---

## 🎨 Customization Guide

### Landing Page Customization

1. **Login as Admin**

   ```
   Email: admin@academy.com
   Password: demo123
   ```

2. **Access Template Manager**

   - Navigate to `/admin/templates`
   - Choose "Landing Page Editor"

3. **Customize Content**
   - **Hero Section**: Title, subtitle, CTAs
   - **Statistics**: Student count, courses, completion rate
   - **Features**: Add/edit feature cards
   - **Demo Section**: Trial account information

### Branding Customization

1. **Access Branding Settings**

   - Go to `/admin/templates/branding`

2. **Customize Brand Elements**
   - **Logo**: Upload custom logo or use text
   - **Colors**: Primary and secondary brand colors
   - **Typography**: Font families and styles
   - **Favicon**: Custom favicon upload

### Course Creation

1. **Login as Instructor**

   ```
   Email: john.instructor@academy.com
   Password: demo123
   ```

2. **Create Course**

   - Navigate to `/instructor/courses`
   - Click "Create New Course"
   - Add title, description, thumbnail

3. **Add Content**
   - Create modules to organize lessons
   - Add video lessons (YouTube/Vimeo URLs)
   - Create quizzes and assessments
   - Set pricing and publish

---

## 🔐 User Roles & Permissions

### Admin Role

- **Full System Access**
- Template and branding management
- User management and analytics
- Course oversight and moderation
- Payment and subscription management

### Instructor Role

- **Course Creation & Management**
- Student progress monitoring
- Content upload and organization
- Quiz and assessment creation
- Revenue tracking (if enabled)

### Student Role

- **Learning Experience**
- Course enrollment and access
- Progress tracking and certificates
- Quiz taking and results
- Profile and account management

---

## 💳 Payment Integration

### Stripe Setup (Optional)

1. **Create Stripe Account**

   - Sign up at [stripe.com](https://stripe.com)
   - Get API keys from dashboard

2. **Configure Environment**

   ```env
   STRIPE_SECRET_KEY="sk_test_your_secret_key"
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key"
   ```

3. **Test Payments**
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC

---

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**

   - Push code to GitHub
   - Connect Vercel to your repository

2. **Environment Variables**

   - Add all `.env.local` variables to Vercel
   - Ensure `NEXTAUTH_URL` points to your domain

3. **Deploy**
   - Vercel automatically deploys on git push
   - Domain will be available instantly

### Other Deployment Options

- **Netlify**: Supports Next.js applications
- **Railway**: Full-stack deployments
- **DigitalOcean**: App Platform
- **AWS**: Amplify or EC2

---

## 📱 Demo Accounts

After running the demo content script, use these accounts:

| Role           | Email                       | Password | Access              |
| -------------- | --------------------------- | -------- | ------------------- |
| **Admin**      | admin@academy.com           | demo123  | Full system access  |
| **Instructor** | john.instructor@academy.com | demo123  | Course creation     |
| **Instructor** | maria.garcia@academy.com    | demo123  | Course creation     |
| **Student**    | alex.student@academy.com    | demo123  | Learning experience |
| **Student**    | emma.wilson@academy.com     | demo123  | Learning experience |

---

## 🛠️ Development

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin interface
│   ├── instructor/        # Instructor dashboard
│   ├── courses/           # Course pages
│   └── api/               # API endpoints
├── components/            # Reusable components
├── lib/                   # Utilities and configs
└── shared/                # Shared types and utils

prisma/
└── schema.prisma          # Database schema

public/
└── uploads/               # File uploads
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript checking
```

### Database Commands

```bash
npx prisma studio    # Open database browser
npx prisma db push   # Apply schema changes
npx prisma generate  # Regenerate client
npx prisma migrate   # Create migrations
```

---

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Error**

   ```
   Solution: Check DATABASE_URL and DIRECT_URL in .env.local
   Ensure Supabase project is active and credentials are correct
   ```

2. **NextAuth Session Error**

   ```
   Solution: Verify NEXTAUTH_SECRET and NEXTAUTH_URL
   Clear browser cookies and try again
   ```

3. **Prisma Client Error**

   ```
   Solution: Run 'npx prisma generate' after schema changes
   Delete node_modules and reinstall dependencies
   ```

4. **File Upload Issues**
   ```
   Solution: Check public/uploads directory permissions
   Ensure Vercel deployment uses base64 for serverless
   ```

### Performance Optimization

1. **Database Queries**

   - Use Prisma's `include` carefully
   - Implement pagination for large datasets
   - Add database indexes for frequently queried fields

2. **Next.js Optimization**
   - Enable ISR for dynamic content
   - Use Next.js Image component
   - Implement proper caching strategies

---

## 📞 Support

### Documentation

- **API Reference**: `/docs/api`
- **Component Library**: `/docs/components`
- **Database Schema**: `/docs/database`

### Community

- **GitHub Issues**: Report bugs and feature requests
- **Discord Community**: Real-time support and discussions
- **Email Support**: support@your-domain.com

### Professional Services

- **Custom Development**: Tailored features and integrations
- **Migration Services**: Data migration from other platforms
- **Training & Consultation**: Implementation guidance

---

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

### Commercial Use

- ✅ **Unlimited Projects**: Use for any number of projects
- ✅ **Client Work**: Build solutions for clients
- ✅ **Reselling**: Create your own LMS products
- ✅ **SaaS Applications**: Build commercial SaaS platforms

---

## 🎯 What's Next?

### Upcoming Features

- **Mobile App**: React Native companion app
- **Advanced Analytics**: AI-powered insights
- **Marketplace**: Course marketplace functionality
- **Live Streaming**: Real-time class sessions
- **Gamification**: Points, badges, and leaderboards

### Community Roadmap

Vote on features and contribute to development at:
**[GitHub Discussions](https://github.com/your-repo/discussions)**

---

**Ready to transform education? Start building with The Academy today!** 🚀
