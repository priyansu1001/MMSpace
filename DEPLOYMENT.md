# Deployment Guide

This guide covers different deployment options for MMSpace.

## 🚀 Quick Deployment Options

### 1. Heroku Deployment

#### Prerequisites
- Heroku CLI installed
- Git repository initialized

#### Steps
1. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

2. **Add MongoDB Atlas**
   ```bash
   heroku addons:create mongolab:sandbox
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set NODE_ENV=production
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

### 2. Vercel Deployment (Frontend Only)

#### Prerequisites
- Vercel CLI installed or use Vercel dashboard

#### Steps
1. **Build the client**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables**
   - Add `REACT_APP_API_URL` in Vercel dashboard

### 3. Netlify Deployment (Frontend Only)

#### Steps
1. **Build the client**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Netlify**
   - Drag and drop the `build` folder to Netlify
   - Or connect your GitHub repository

3. **Set Environment Variables**
   - Add `REACT_APP_API_URL` in Netlify dashboard

### 4. DigitalOcean App Platform

#### Steps
1. **Connect Repository**
   - Link your GitHub repository

2. **Configure Build Settings**
   - Build Command: `npm run install-all && npm run build`
   - Run Command: `npm start`

3. **Set Environment Variables**
   - Add all required environment variables

### 5. AWS Deployment

#### Using AWS Elastic Beanstalk

1. **Install EB CLI**
   ```bash
   pip install awsebcli
   ```

2. **Initialize EB**
   ```bash
   eb init
   ```

3. **Create Environment**
   ```bash
   eb create production
   ```

4. **Deploy**
   ```bash
   eb deploy
   ```

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
```

### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend-url.com/api
REACT_APP_SOCKET_URL=https://your-backend-url.com
```

## 📊 Database Setup

### MongoDB Atlas (Recommended)

1. **Create Account**
   - Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. **Create Cluster**
   - Choose free tier for development
   - Select region closest to your deployment

3. **Create Database User**
   - Add username and password
   - Grant read/write access

4. **Whitelist IP Addresses**
   - Add `0.0.0.0/0` for all IPs (production should be more restrictive)

5. **Get Connection String**
   - Copy the connection string
   - Replace `<password>` with your database user password

### Local MongoDB

1. **Install MongoDB**
   - Download from [MongoDB website](https://www.mongodb.com/try/download/community)

2. **Start MongoDB Service**
   ```bash
   mongod
   ```

3. **Connection String**
   ```
   mongodb://localhost:27017/mmspace
   ```

## 🔒 Security Considerations

### Production Checklist

- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable CORS only for your domain
- [ ] Use HTTPS in production
- [ ] Restrict MongoDB IP whitelist
- [ ] Enable MongoDB authentication
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting
- [ ] Implement proper error handling
- [ ] Use secure headers (helmet.js)
- [ ] Regular security updates

### Environment Variables Security

- Never commit `.env` files to version control
- Use different secrets for different environments
- Rotate secrets regularly
- Use a secret management service for production

## 📈 Performance Optimization

### Frontend Optimization

1. **Build Optimization**
   ```bash
   npm run build
   ```

2. **Enable Gzip Compression**
   - Configure your web server to enable gzip

3. **CDN Setup**
   - Use CloudFlare or AWS CloudFront
   - Cache static assets

### Backend Optimization

1. **Database Indexing**
   - Add indexes for frequently queried fields

2. **Caching**
   - Implement Redis for session storage
   - Cache frequently accessed data

3. **Load Balancing**
   - Use multiple server instances
   - Implement health checks

## 🔍 Monitoring

### Application Monitoring

1. **Error Tracking**
   - Integrate Sentry for error tracking
   - Set up alerts for critical errors

2. **Performance Monitoring**
   - Use New Relic or DataDog
   - Monitor response times and throughput

3. **Uptime Monitoring**
   - Use Pingdom or UptimeRobot
   - Set up downtime alerts

### Database Monitoring

1. **MongoDB Atlas Monitoring**
   - Use built-in monitoring tools
   - Set up performance alerts

2. **Query Performance**
   - Monitor slow queries
   - Optimize database indexes

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        
    - name: Install dependencies
      run: npm run install-all
      
    - name: Run tests
      run: npm test
      
    - name: Build application
      run: npm run build
      
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "your-app-name"
        heroku_email: "your-email@example.com"
```

## 🆘 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall

2. **Database Connection Issues**
   - Verify connection string
   - Check IP whitelist settings
   - Ensure database user has proper permissions

3. **Environment Variable Issues**
   - Verify all required variables are set
   - Check for typos in variable names
   - Ensure proper escaping of special characters

4. **CORS Issues**
   - Configure CORS for your frontend domain
   - Check if API URL is correct in frontend

### Getting Help

- Check the [Issues](https://github.com/yourusername/mmspace/issues) page
- Join our community Discord
- Email support: support@mmspace.com

---

For more detailed deployment instructions, refer to the specific platform documentation.