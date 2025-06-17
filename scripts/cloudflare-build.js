#!/usr/bin/env node
// 为 Cloudflare Pages 生成必要的部署文件
import fs from 'fs';
import path from 'path';

const distDir = 'dist';

// 创建 Cloudflare Pages 所需的配置文件
function createCloudflareFiles() {
  console.log('为 Cloudflare Pages 创建配置文件...');
  
  // 确保目录存在
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  // 创建 _redirects 文件
  const redirects = '/*    /index.html   200';
  fs.writeFileSync(path.join(distDir, '_redirects'), redirects);
  console.log('创建了 _redirects 文件');
  
  // 创建 _headers 文件
  const headers = `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/assets/*.js
  Content-Type: application/javascript; charset=utf-8

/*.js
  Content-Type: application/javascript; charset=utf-8

/*.css
  Content-Type: text/css; charset=utf-8

/site.webmanifest
  Content-Type: application/manifest+json; charset=utf-8
`;
  fs.writeFileSync(path.join(distDir, '_headers'), headers);
  console.log('创建了 _headers 文件');
  
  // 创建 .well-known 目录
  const wellKnownDir = path.join(distDir, '.well-known');
  if (!fs.existsSync(wellKnownDir)) {
    fs.mkdirSync(wellKnownDir, { recursive: true });
  }
  
  // 创建 cloudflare-pages.json 文件
  const cloudflarePages = {
    "version": 1,
    "headers": {
      "/*.js": {
        "Content-Type": "application/javascript; charset=utf-8"
      },
      "/assets/*.js": {
        "Content-Type": "application/javascript; charset=utf-8"
      },
      "/*.css": {
        "Content-Type": "text/css; charset=utf-8"
      },
      "/site.webmanifest": {
        "Content-Type": "application/manifest+json; charset=utf-8"
      }
    }
  };
  
  fs.writeFileSync(
    path.join(wellKnownDir, 'cloudflare-pages.json'),
    JSON.stringify(cloudflarePages, null, 2)
  );
  console.log('创建了 .well-known/cloudflare-pages.json 文件');
  
  // 复制 site.webmanifest 文件
  const siteManifest = {
    "name": "Prompt Peek Gallery",
    "short_name": "Prompt Peek",
    "icons": [
      {
        "src": "/android-chrome-192x192.png",
        "sizes": "192x192",
        "type": "image/png"
      },
      {
        "src": "/android-chrome-512x512.png",
        "sizes": "512x512",
        "type": "image/png"
      }
    ],
    "theme_color": "#ffffff",
    "background_color": "#ffffff",
    "display": "standalone"
  };
  
  fs.writeFileSync(
    path.join(distDir, 'site.webmanifest'),
    JSON.stringify(siteManifest, null, 2)
  );
  console.log('创建了 site.webmanifest 文件');
}

// 清理 index.html 中的相对路径
function fixIndexHtml() {
  const indexPath = path.join(distDir, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    console.log('修正 index.html 路径...');
    
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // 替换相对路径为绝对路径
    content = content.replace(/src="\.\//g, 'src="/');
    content = content.replace(/href="\.\//g, 'href="/');
    
    // 添加 SPA 注释
    if (!content.includes('<!-- Cloudflare Pages SPA -->')) {
      content = content.replace('</head>', '<!-- Cloudflare Pages SPA -->\n  </head>');
    }
    
    fs.writeFileSync(indexPath, content);
    console.log('已修复 index.html 中的路径');
  }
}

// 主函数
(async function() {
  try {
    createCloudflareFiles();
    fixIndexHtml();
    console.log('Cloudflare Pages 部署准备完毕!');
  } catch (error) {
    console.error('准备部署文件时出错:', error);
    process.exit(1);
  }
})(); 