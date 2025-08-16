# 🚀 Teranga Foncier - Deployment Guide

## Quick Start Deployment

### 1. **Environment Configuration**
```bash
# Copy the environment template
cp .env.example .env

# Edit .env with your actual values
# Required Variables:
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 2. **Build & Deploy**
```bash
# Final build
npm run build

# Test production build locally
npm run preview
```

### 3. **Deploy to Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## Database Setup (Supabase)

### Required Tables Schema

#### `users` table:
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  full_name VARCHAR NOT NULL,
  type VARCHAR CHECK (type IN ('Administrateur', 'Agent', 'Particulier', 'Vendeur', 'Mairie', 'Banque', 'Notaire', 'Promoteur', 'Agriculteur', 'Investisseur')),
  role VARCHAR DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `parcels` table:
```sql
CREATE TABLE parcels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  reference VARCHAR UNIQUE NOT NULL,
  location_name VARCHAR NOT NULL,
  area_sqm DECIMAL,
  description TEXT,
  status VARCHAR DEFAULT 'Disponible',
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Row Level Security (RLS)
```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcels ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Admin can read all users
CREATE POLICY "Admin can read all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR type = 'Administrateur')
    )
  );
```

## Firebase Setup (Real-time Features)

### 1. **Create Firebase Project**
- Go to [Firebase Console](https://console.firebase.google.com)
- Create new project
- Enable Firestore Database
- Set up security rules

### 2. **Firestore Security Rules**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Conversations - users can access their own conversations
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
    }
    
    // Messages - users can access messages in their conversations
    match /conversations/{conversationId}/messages/{messageId} {
      allow read, write: if request.auth != null;
    }
    
    // Notifications - users can access their own notifications
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

### 3. **Initialize Collections**
```javascript
// Run this in Firebase Console
// Create sample conversation
db.collection('conversations').add({
  participants: ['user1_id', 'user2_id'],
  lastMessage: 'Bonjour, comment puis-je vous aider?',
  updatedAt: new Date(),
  createdAt: new Date()
});

// Create sample notification
db.collection('notifications').add({
  userId: 'user_id',
  title: 'Bienvenue sur Teranga Foncier',
  message: 'Votre compte a été créé avec succès.',
  type: 'welcome',
  read: false,
  createdAt: new Date()
});
```

## AI Integration (Gemini)

### 1. **Get Gemini API Key**
- Go to [Google AI Studio](https://aistudio.google.com)
- Create API key
- Add to environment variables

### 2. **Test AI Features**
- Admin AI Assistant: `/dashboard/admin/ai-assistant`
- Global Chatbot: Available on all pages

## Production Checklist

### ✅ **Security**
- [ ] Environment variables configured
- [ ] Supabase RLS policies enabled
- [ ] Firebase security rules configured
- [ ] HTTPS enabled on domain

### ✅ **Performance**
- [ ] Build optimization completed
- [ ] CDN configured for assets
- [ ] Database indexes created
- [ ] Error monitoring setup

### ✅ **Features**
- [ ] User authentication working
- [ ] Role-based dashboards functional
- [ ] Real-time messaging active
- [ ] AI features operational
- [ ] Admin panels accessible

### ✅ **Monitoring**
- [ ] Error tracking (Sentry recommended)
- [ ] Analytics setup (Google Analytics)
- [ ] Performance monitoring
- [ ] Database monitoring

## Common Deployment Issues

### Issue: Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Environment Variables Not Working
```bash
# Ensure variables start with VITE_
VITE_SUPABASE_URL=...  # ✅ Correct
SUPABASE_URL=...       # ❌ Wrong
```

### Issue: Firebase Connection Fails
- Check Firebase project ID matches
- Verify API keys are correct
- Ensure Firestore is enabled

## Scaling Considerations

### **Database Optimization**
- Add indexes on frequently queried columns
- Implement database caching
- Consider read replicas for heavy read workloads

### **Frontend Optimization**
- Implement lazy loading for routes
- Add service worker for caching
- Consider CDN for static assets

### **Backend Scaling**
- Monitor Supabase usage limits
- Consider upgrading to paid plans
- Implement rate limiting

## Support & Maintenance

### **Regular Tasks**
- Monitor error logs
- Update dependencies monthly
- Backup database regularly
- Review security policies

### **Monitoring Endpoints**
- Health check: `/api/health`
- Build info: `/api/build-info`
- Status page: `/status`

---

**🎯 Your Teranga Foncier platform is now ready for production!**

For technical support, refer to:
- Supabase Documentation
- Firebase Documentation
- React Documentation
- Vite Documentation
