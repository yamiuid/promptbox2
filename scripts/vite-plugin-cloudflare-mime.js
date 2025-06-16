// CloudFlare MIME 类型修复插件
export default function cloudFlareMimePlugin() {
  return {
    name: 'vite-plugin-cloudflare-mime',
    // 修改 apply 的值为有效的枚举值
    apply: 'build',
    configResolved(config) {
      // 记录构建配置信息，便于调试
      console.log('构建模式:', config.mode);
      console.log('输出路径:', config.build.outDir);
    },
    configureServer(server) {
      // 在开发服务器中设置正确的 MIME 类型
      server.middlewares.use((req, res, next) => {
        if (req.url?.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript');
        }
        next();
      });
    },
    // 此函数确保所有 JavaScript 文件都有 .js 扩展名
    generateBundle(options, bundle) {
      // 不再需要手动添加 .js 扩展名，因为我们在 vite.config.prod.ts 中已经指定了
      console.log('生成的文件:', Object.keys(bundle));
    },
    transformIndexHtml(html) {
      // 不再需要修改 HTML，因为我们已经在构建配置中指定了正确的扩展名
      return html;
    }
  };
} 