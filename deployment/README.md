# NisArt Gallery - Deployment Instructions

This folder contains server configuration files for deploying the NisArt Gallery application.

## 📁 Files in this folder:
- `.htaccess` - Apache server configuration
- `nginx.conf` - Nginx server configuration
- `README.md` - This file with deployment instructions

## 🚀 Deployment Steps

### 1. Build the Application
```bash
npm run build
```

### 2. Deploy to Server

#### For Apache Servers:
1. Copy the contents of the `dist/` folder to your web server document root
2. Copy `deployment/.htaccess` to the same directory as `index.html`
3. Ensure Apache has `mod_rewrite`, `mod_expires`, `mod_headers`, and `mod_deflate` enabled

**File structure on server:**
```
/var/www/html/nisart/
├── index.html
├── .htaccess          <- Copy from deployment/.htaccess
├── assets/
│   ├── index-*.css
│   └── index-*.js
└── other static files...
```

#### For Nginx Servers:
1. Copy the contents of the `dist/` folder to your web server document root
2. Add the configuration from `deployment/nginx.conf` to your Nginx server block
3. Update the paths in the configuration:
   - Update `root` path to point to your dist folder
   - Update SSL certificate paths if using HTTPS
   - Update `server_name` if using different domain
4. Reload Nginx: `sudo nginx -s reload`

### 3. Environment Variables
Make sure your `.env` file has the correct API base URL:
```env
VITE_API_BASE=https://nisa.blockdev.my.id/api/v1
```

## 🔧 Configuration Details

### Apache (.htaccess)
- **SPA Routing**: Redirects all non-file requests to `index.html`
- **Caching**: Static assets cached for 1 year, HTML for 1 hour
- **Compression**: Gzip compression for better performance
- **Security**: Various security headers to protect against attacks

### Nginx
- **SPA Routing**: `try_files $uri $uri/ /index.html;`
- **SSL Support**: Complete HTTPS configuration with security headers
- **Caching**: Optimized caching for different file types
- **Compression**: Gzip compression for text-based files
- **Security**: Headers to prevent XSS, clickjacking, etc.

## 🌐 URL Testing
After deployment, test these URLs to ensure they work:
- ✅ `https://nisart.blockdev.my.id/` (Home)
- ✅ `https://nisart.blockdev.my.id/gallery` (Gallery)
- ✅ `https://nisart.blockdev.my.id/search` (Search)
- ✅ `https://nisart.blockdev.my.id/upload` (Upload)
- ✅ `https://nisart.blockdev.my.id/image/123` (Image Detail)

## 🐛 Troubleshooting

### 404 Errors on Direct URLs
- **Apache**: Ensure `.htaccess` is in the correct location and `mod_rewrite` is enabled
- **Nginx**: Ensure the `try_files` directive is properly configured

### CSS/JS Not Loading
- Check file paths in the built `index.html`
- Ensure static assets are accessible
- Check browser dev tools for 404 errors on assets

### API Requests Failing
- Verify `VITE_API_BASE` environment variable
- Check CORS settings on your API server
- Ensure API server is accessible from the frontend domain

## 📋 Pre-deployment Checklist
- [ ] Run `npm run build` successfully
- [ ] Copy dist files to server
- [ ] Copy appropriate server configuration (`.htaccess` or nginx config)
- [ ] Update server configuration paths/domains
- [ ] Test all routes work without 404 errors
- [ ] Verify API endpoints are accessible
- [ ] Check browser console for any errors

## 🔄 Automated Deployment
Consider setting up automated deployment with:
- GitHub Actions
- CI/CD pipelines
- Deploy scripts that automatically copy files and configurations

---

**Note**: This deployment folder is preserved across builds, unlike the `dist/` folder which gets recreated each time.