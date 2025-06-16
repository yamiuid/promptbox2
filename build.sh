#!/bin/bash

# 安装依赖
npm install

# 构建项目
npm run build

# 确保 CloudFlare Pages 所需的文件被复制到构建目录
if [ -d "dist" ]; then
  cp public/_redirects dist/ || true
  cp public/_headers dist/ || true
  cp public/_routes.json dist/ || true
  cp public/_worker.js dist/ || true
  echo "Static files copied to dist directory"
else
  echo "Error: dist directory not found"
  exit 1
fi

echo "Build completed successfully" 