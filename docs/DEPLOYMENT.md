
# FunnelCraft Deployment Guide

## Overview

This guide covers deploying FunnelCraft to production environments using Supabase and modern deployment practices.

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Domain name (optional but recommended)
- SSL certificate (handled by hosting provider)

## Environment Setup

### Supabase Configuration

1. **Create Supabase Project**
   ```bash
   npx supabase init
   npx supabase login
   npx supabase link --project-ref your-project-ref
   ```

2. **Deploy Database Schema**
   ```bash
   npx supabase db push
   ```

3. **Deploy Edge Functions**
   ```bash
   npx supabase functions deploy
   ```

4. **Configure Secrets**
   Set up required secrets in Supabase Dashboard:
   - `OPENAI_API_KEY`
   - `RESEND_API_KEY`
   - `STRIPE_SECRET_KEY` (if using payments)

### Frontend Deployment

#### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Environment Variables**
   Configure in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

#### Option 2: Netlify

1. **Build Command**
   ```bash
   npm run build
   ```

2. **Publish Directory**
   ```
   dist
   ```

3. **Environment Variables**
   Set in Netlify dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

#### Option 3: Custom Server

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Serve Static Files**
   ```bash
   npx serve dist
   ```

## Database Migration

### Production Database Setup

1. **Run Migrations**
   ```sql
   -- Execute all migration files in order
   -- Available in supabase/migrations/
   ```

2. **Set Up RLS Policies**
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE funnels ENABLE ROW LEVEL SECURITY;
   ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
   ```

3. **Create Indexes**
   ```sql
   -- Performance optimization indexes
   CREATE INDEX idx_leads_user_id ON leads(user_id);
   CREATE INDEX idx_funnels_user_id ON funnels(user_id);
   ```

### Data Seeding

1. **Default Subscription Plans**
   ```sql
   INSERT INTO subscription_plans (name, tier, price_monthly) VALUES
   ('Free', 'starter', 0),
   ('Professional', 'professional', 79),
   ('Enterprise', 'enterprise', 199);
   ```

2. **Email Templates**
   ```sql
   -- Insert default email templates
   -- See migration files for details
   ```

## Security Configuration

### Authentication Settings

1. **Email Configuration**
   - Enable email confirmations
   - Set up email templates
   - Configure redirect URLs

2. **OAuth Providers**
   - Configure Google OAuth
   - Set up GitHub authentication
   - LinkedIn integration

### API Security

1. **Rate Limiting**
   - Configure in Supabase dashboard
   - Set per-user limits
   - Monitor usage patterns

2. **CORS Configuration**
   - Allow production domain
   - Restrict development origins
   - Configure headers

## Monitoring & Observability

### Application Monitoring

1. **Error Tracking**
   - Set up Sentry or similar
   - Monitor Edge Function errors
   - Track API failures

2. **Performance Monitoring**
   - Monitor page load times
   - Track API response times
   - Database query performance

### Infrastructure Monitoring

1. **Supabase Dashboard**
   - Monitor database performance
   - Track API usage
   - Review security logs

2. **External Tools**
   - Uptime monitoring
   - SSL certificate monitoring
   - DNS monitoring

## Backup & Recovery

### Database Backups

1. **Automated Backups**
   - Supabase provides automatic backups
   - Point-in-time recovery available
   - Cross-region replication

2. **Custom Backups**
   ```bash
   pg_dump -h db.project.supabase.co -U postgres -d postgres > backup.sql
   ```

### File Storage Backups

1. **Supabase Storage**
   - Automatic replication
   - Versioning enabled
   - Cross-region backup

## Performance Optimization

### Frontend Optimization

1. **Code Splitting**
   - Lazy load routes
   - Component-level splitting
   - Vendor chunk optimization

2. **Asset Optimization**
   - Image compression
   - Font optimization
   - CSS minification

### Backend Optimization

1. **Database Optimization**
   - Query optimization
   - Index maintenance
   - Connection pooling

2. **Edge Function Optimization**
   - Cold start reduction
   - Memory optimization
   - Caching strategies

## Scaling Considerations

### Horizontal Scaling

1. **Database Scaling**
   - Read replicas
   - Connection pooling
   - Query optimization

2. **CDN Integration**
   - Static asset distribution
   - Edge caching
   - Global distribution

### Vertical Scaling

1. **Resource Monitoring**
   - CPU utilization
   - Memory usage
   - Database connections

2. **Auto-scaling**
   - Database auto-scaling
   - Function scaling
   - Load balancing

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check connection limits
   - Verify RLS policies
   - Review authentication

2. **Edge Function Failures**
   - Check function logs
   - Verify secrets configuration
   - Review timeout settings

3. **Authentication Problems**
   - Verify JWT configuration
   - Check email settings
   - Review OAuth setup

### Debugging Tools

1. **Supabase CLI**
   ```bash
   supabase logs
   supabase status
   ```

2. **Browser Developer Tools**
   - Network tab for API calls
   - Console for JavaScript errors
   - Application tab for storage

## Maintenance

### Regular Tasks

1. **Database Maintenance**
   - Vacuum operations
   - Index rebuilding
   - Statistics updates

2. **Security Updates**
   - Dependency updates
   - Security patches
   - Vulnerability scanning

### Health Checks

1. **Automated Monitoring**
   - Uptime checks
   - API health endpoints
   - Database connectivity

2. **Manual Reviews**
   - Performance metrics
   - Error rates
   - User feedback

## Rollback Procedures

### Application Rollback

1. **Version Control**
   - Tag releases
   - Maintain deployment history
   - Quick rollback procedures

2. **Database Rollback**
   - Point-in-time recovery
   - Migration rollback
   - Data consistency checks

### Emergency Procedures

1. **Incident Response**
   - Escalation procedures
   - Communication plan
   - Recovery checklist

2. **Disaster Recovery**
   - Backup restoration
   - Service migration
   - Data validation
