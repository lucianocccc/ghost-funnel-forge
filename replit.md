# GhostFunnel - AI-Powered Marketing Funnel Platform

## Overview

GhostFunnel is an advanced marketing funnel management platform that leverages AI to create, optimize, and manage high-converting sales funnels. The platform combines React-based frontend with Supabase backend services to deliver intelligent funnel generation, lead analysis, and automated marketing workflows. Core features include AI-powered funnel creation using GPT-4, smart lead scoring, behavioral analytics, and enterprise-grade subscription management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application uses a modern React 18 architecture with TypeScript and component-based design patterns:

- **React Router** for client-side navigation with protected routes for authenticated users
- **Shadcn/ui** component library with Radix UI primitives for consistent, accessible UI components
- **Tailwind CSS** for utility-first styling with custom brand theming system
- **TanStack Query** for server state management, caching, and data synchronization
- **Framer Motion** for advanced animations and micro-interactions
- **Custom hook pattern** for business logic separation and reusability

The codebase follows a modular structure with clear separation between pages, components, hooks, and services. Brand styling is implemented through a dynamic theming system supporting multiple brand personalities (Apple, Nike, Amazon).

### Backend Architecture
Built on Supabase as a Backend-as-a-Service platform providing:

- **PostgreSQL database** with Row Level Security (RLS) for data protection
- **Supabase Auth** for user authentication with JWT tokens
- **Edge Functions** for serverless compute operations, particularly AI integrations
- **Real-time subscriptions** for live updates and collaborative features
- **File storage** for document uploads and media assets

The database schema includes complex relationships between users, funnels, leads, conversations, and analytics data. Role-based access control is implemented at both application and database levels.

### AI and Content Generation
The platform integrates multiple AI capabilities:

- **OpenAI GPT-4** for content generation, funnel creation, and lead analysis
- **Conversational AI system** with memory persistence for chatbot functionality
- **Smart funnel generator** that creates personalized marketing flows based on business context
- **Behavioral intelligence** tracking user interactions for optimization insights
- **Advanced creative system** for generating high-converting marketing copy

AI operations are handled through serverless Edge Functions to ensure scalability and cost-effectiveness.

### Data Management and Analytics
Comprehensive data layer supporting:

- **Lead management** with AI-powered analysis and scoring
- **Funnel performance tracking** with real-time analytics
- **User behavior analytics** for conversion optimization
- **Subscription and billing management** with tiered feature access
- **Email campaign management** with template system and delivery tracking

The system implements efficient caching strategies and optimistic updates for responsive user experience.

## External Dependencies

### Core Infrastructure
- **Supabase** - Backend-as-a-Service providing database, authentication, real-time features, and Edge Functions
- **Vercel** - Frontend hosting and deployment platform with automatic CI/CD

### AI and Machine Learning
- **OpenAI GPT-4** - Primary AI engine for content generation, funnel creation, and intelligent analysis
- **OpenAI API** - Integration for chat completions, embeddings, and advanced language processing

### Email and Communications
- **Resend** - Transactional email delivery service for notifications, campaigns, and automated sequences

### Payments and Subscriptions
- **Stripe** - Payment processing and subscription management for premium features and billing

### UI and Frontend Libraries
- **Radix UI** - Unstyled, accessible UI primitives
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library for enhanced user experience
- **React Hook Form** - Form state management and validation
- **Date-fns** - Date utility library for temporal operations

### Development and Build Tools
- **Vite** - Build tool and development server
- **TypeScript** - Type safety and enhanced developer experience
- **ESLint** - Code linting and style enforcement

### Additional Services
- **Neon Database** - Serverless PostgreSQL for potential database scaling (server/db.ts configuration present)
- **Drizzle ORM** - Type-safe database operations and migrations