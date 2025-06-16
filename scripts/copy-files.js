// 复制文件脚本
import { cpSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const publicDir = './public';
const distDir = './dist';

// 要复制的文件和目录
const filesToCopy = [
  '_redirects',
  '_headers',
  '_routes.json',
  '_worker.js',
  'site.webmanifest'
];

// 要复制的目录
const directoriesToCopy = [
  '.well-known'
];

console.log('开始复制文件到 dist 目录...');

// 复制文件
filesToCopy.forEach(file => {
  const sourcePath = join(publicDir, file);
  const targetPath = join(distDir, file);
  
  try {
    console.log(`复制 ${sourcePath} 到 ${targetPath}`);
    cpSync(sourcePath, targetPath, { force: true });
    console.log(`文件 ${file} 复制成功`);
  } catch (error) {
    console.error(`复制文件 ${file} 时出错:`, error.message);
  }
});

// 复制目录
directoriesToCopy.forEach(dir => {
  const sourcePath = join(publicDir, dir);
  const targetPath = join(distDir, dir);
  
  try {
    // 确保目标目录存在
    if (!existsSync(targetPath)) {
      console.log(`创建目录 ${targetPath}`);
      mkdirSync(targetPath, { recursive: true });
    }
    
    console.log(`复制目录 ${sourcePath} 到 ${targetPath}`);
    cpSync(sourcePath, targetPath, { recursive: true, force: true });
    console.log(`目录 ${dir} 复制成功`);
  } catch (error) {
    console.error(`复制目录 ${dir} 时出错:`, error.message);
  }
});

console.log('文件复制完成！'); 