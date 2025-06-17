#!/usr/bin/env node
// CloudFlare 专用构建脚本
import fs from 'fs';
import path from 'path';

const publicDir = 'public';
const distDir = 'dist';

// 确保目录存在
function ensureDirectoryExistence(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`创建目录: ${dirPath}`);
  }
}

// 复制文件
function copyFile(source, target) {
  try {
    fs.copyFileSync(source, target);
    console.log(`文件 ${path.basename(source)} 复制成功`);
  } catch (err) {
    console.error(`复制文件 ${source} 失败:`, err);
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
  
  console.log(`目录 ${path.basename(source)} 复制成功`);
}

// CloudFlare Pages 关键文件
const filesToCopy = [
  '_redirects',
  '_headers',
  '_routes.json',
  '_worker.js',
  'site.webmanifest'
];

// 特殊目录
const dirsToCopy = [
  '.well-known'
];

// 复制关键文件
for (const file of filesToCopy) {
  const sourcePath = path.join(publicDir, file);
  const targetPath = path.join(distDir, file);
  
  if (fs.existsSync(sourcePath)) {
    console.log(`复制 ${sourcePath} 到 ${targetPath}`);
    copyFile(sourcePath, targetPath);
  } else {
    console.warn(`警告: 文件 ${sourcePath} 不存在，跳过`);
  }
}

// 复制特殊目录
for (const dir of dirsToCopy) {
  const sourcePath = path.join(publicDir, dir);
  const targetPath = path.join(distDir, dir);
  
  if (fs.existsSync(sourcePath)) {
    console.log(`复制目录 ${sourcePath} 到 ${targetPath}`);
    copyDir(sourcePath, targetPath);
  } else {
    console.warn(`警告: 目录 ${sourcePath} 不存在，跳过`);
  }
}

// 创建 Cloudflare Pages 识别文件
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
console.log('创建 Cloudflare Pages 配置文件');

// 修复 index.html 中的引用
const indexPath = path.join(distDir, 'index.html');
if (fs.existsSync(indexPath)) {
  let content = fs.readFileSync(indexPath, 'utf8');
  
  // 确保有 Cloudflare Pages SPA 注释
  if (!content.includes('<!-- Cloudflare Pages SPA -->')) {
    content = content.replace('</head>', '<!-- Cloudflare Pages SPA -->\n  </head>');
    fs.writeFileSync(indexPath, content);
    console.log('添加 Cloudflare Pages SPA 注释到 index.html');
  }
}

console.log('Cloudflare 构建后处理完成！'); 