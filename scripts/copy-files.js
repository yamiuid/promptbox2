// 复制文件脚本
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

// 创建常用清单文件（如果不存在）
const manifestFiles = [
  { path: 'site.webmanifest', content: JSON.stringify({
    name: "Prompt Peek Gallery",
    short_name: "Prompt Peek",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ],
    theme_color: "#ffffff",
    background_color: "#ffffff",
    display: "standalone"
  }, null, 2) }
];

// 确保清单文件存在
for (const file of manifestFiles) {
  const targetPath = path.join(distDir, file.path);
  
  if (!fs.existsSync(targetPath) && file.content) {
    console.log(`创建文件 ${targetPath}`);
    fs.writeFileSync(targetPath, file.content);
  }
}

console.log('文件复制完成！'); 