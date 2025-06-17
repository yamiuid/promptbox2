// Cloudflare 部署专用脚本
import fs from 'fs';
import path from 'path';

const distDir = 'dist';

console.log('开始 Cloudflare 专用部署配置');

// 确保 _headers 文件存在且格式正确
const headersPath = path.join(distDir, '_headers');
if (fs.existsSync(headersPath)) {
  console.log('检查 _headers 文件...');
  const headersContent = fs.readFileSync(headersPath, 'utf8');
  
  // 创建备份
  fs.writeFileSync(path.join(distDir, '_headers.txt'), headersContent, 'utf8');
  console.log('创建了 _headers.txt 备份文件');
  
  // 确保每行没有多余的空格和 Windows 回车符
  const cleanedContent = headersContent
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => line.trimRight())
    .join('\n');
  
  fs.writeFileSync(headersPath, cleanedContent, 'utf8');
  console.log('已清理 _headers 文件格式');
}

// 确保 _routes.json 文件存在且格式正确
const routesPath = path.join(distDir, '_routes.json');
if (fs.existsSync(routesPath)) {
  console.log('检查 _routes.json 文件...');
  try {
    const routesContent = fs.readFileSync(routesPath, 'utf8');
    const routes = JSON.parse(routesContent);
    fs.writeFileSync(routesPath, JSON.stringify(routes, null, 2), 'utf8');
    console.log('_routes.json 文件格式正确');
  } catch (err) {
    console.error('_routes.json 文件解析失败:', err);
  }
}

// 确保 site.webmanifest 文件有正确的格式和内容类型
const manifestPath = path.join(distDir, 'site.webmanifest');
if (fs.existsSync(manifestPath)) {
  console.log('检查 site.webmanifest 文件...');
  try {
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    console.log('site.webmanifest 文件格式正确');
  } catch (err) {
    console.error('site.webmanifest 文件解析失败:', err);
    
    // 如果解析失败，创建一个新的有效清单文件
    const defaultManifest = {
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
    
    fs.writeFileSync(manifestPath, JSON.stringify(defaultManifest, null, 2), 'utf8');
    console.log('已创建新的 site.webmanifest 文件');
  }
}

// 确保 index.html 文件中的模块脚本路径正确
const indexPath = path.join(distDir, 'index.html');
if (fs.existsSync(indexPath)) {
  console.log('检查 index.html 文件...');
  let indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // 添加 Cloudflare Pages SPA 注释
  if (!indexContent.includes('<!-- Cloudflare Pages SPA -->')) {
    indexContent = indexContent.replace('</head>', '<!-- Cloudflare Pages SPA -->\n  </head>');
    console.log('已添加 Cloudflare Pages SPA 注释');
  }
  
  // 确保引用了绝对路径的脚本
  indexContent = indexContent.replace(/src="\.\/([^"]+)"/g, 'src="/$1"');
  
  fs.writeFileSync(indexPath, indexContent, 'utf8');
  console.log('已更新 index.html 文件');
}

console.log('Cloudflare 专用部署配置完成'); 