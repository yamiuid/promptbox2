#!/usr/bin/env node
// Cloudflare部署构建脚本
import fs from 'fs';
import path from 'path';

const publicDir = 'public';
const distDir = 'dist';

// 确保目录存在
function ensureDirectoryExistence(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// 复制文件
function copyFile(source, target) {
  try {
    fs.copyFileSync(source, target);
    console.log(`已复制: ${path.basename(source)}`);
  } catch (err) {
    console.error(`错误: ${path.basename(source)}:`, err.message);
  }
}

// 递归复制目录
function copyDir(source, target) {
  ensureDirectoryExistence(target);
  
  const files = fs.readdirSync(source);
  
  for (const file of files) {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);
    
    const stat = fs.statSync(sourcePath);
    
    if (stat.isDirectory()) {
      copyDir(sourcePath, targetPath);
    } else {
      copyFile(sourcePath, targetPath);
    }
  }
}

// 关键文件列表
const filesToCopy = ['_redirects', '_headers', '_routes.json', '_worker.js', 'site.webmanifest'];
const dirsToCopy = ['.well-known'];

// 复制关键文件
for (const file of filesToCopy) {
  const sourcePath = path.join(publicDir, file);
  const targetPath = path.join(distDir, file);
  
  if (fs.existsSync(sourcePath)) {
    copyFile(sourcePath, targetPath);
  }
}

// 复制特殊目录
for (const dir of dirsToCopy) {
  const sourcePath = path.join(publicDir, dir);
  const targetPath = path.join(distDir, dir);
  
  if (fs.existsSync(sourcePath)) {
    copyDir(sourcePath, targetPath);
  }
}

// 创建Cloudflare Pages配置文件
const pagesFile = path.join(distDir, '.well-known', 'cloudflare-pages.json');
ensureDirectoryExistence(path.join(distDir, '.well-known'));

fs.writeFileSync(pagesFile, JSON.stringify({
  "spa": true,
  "routes": [
    { "pattern": "/", "script": "index.html" },
    { "pattern": "/*", "script": "index.html" }
  ],
  "mimeTypes": {
    ".js": "application/javascript",
    ".mjs": "application/javascript",
    ".css": "text/css", 
    ".json": "application/json",
    ".webmanifest": "application/manifest+json"
  }
}, null, 2));

// 修复index.html
const indexPath = path.join(distDir, 'index.html');
if (fs.existsSync(indexPath)) {
  let content = fs.readFileSync(indexPath, 'utf8');
  
  if (!content.includes('<!-- Cloudflare Pages SPA -->')) {
    content = content.replace('</head>', '<!-- Cloudflare Pages SPA -->\n  </head>');
    fs.writeFileSync(indexPath, content);
  }
}

console.log('Cloudflare构建完成!'); 