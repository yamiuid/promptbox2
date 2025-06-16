#!/bin/bash

# 显示当前环境
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# 使用 npm 安装依赖，不使用 --frozen-lockfile 标志
npm install

# 构建项目
npm run build

echo "Build completed successfully!" 