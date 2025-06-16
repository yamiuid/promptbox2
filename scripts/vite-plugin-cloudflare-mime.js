// CloudFlare MIME 类型修复插件
export default function cloudFlareMimePlugin() {
  return {
    name: 'vite-plugin-cloudflare-mime',
    apply: 'build',
    generateBundle(options, bundle) {
      // 遍历所有构建产物
      Object.keys(bundle).forEach(fileName => {
        const asset = bundle[fileName];
        
        // 给 JavaScript 文件添加 .js 扩展名（如果尚未有）
        if (asset.type === 'chunk' && !fileName.endsWith('.js')) {
          const newFileName = fileName + '.js';
          bundle[newFileName] = asset;
          delete bundle[fileName];
        }
      });
    },
    transformIndexHtml(html) {
      // 修改 index.html 中的引用，确保使用正确的 MIME 类型
      return html.replace(
        /<script type="module" crossorigin src="\/(.+?)"><\/script>/g,
        '<script type="module" crossorigin src="/$1.js"></script>'
      );
    }
  };
} 