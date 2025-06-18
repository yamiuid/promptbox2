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
      // 输出生成的文件信息，便于调试
      console.log('生成的文件:', Object.keys(bundle));
      
      // 为所有JS资源添加正确的mime类型
      Object.keys(bundle).forEach(fileName => {
        const asset = bundle[fileName];
        if (fileName.endsWith('.js')) {
          if (asset.type === 'asset' || asset.type === 'chunk') {
            asset.fileName = fileName;
          }
        }
      });
    },
    transformIndexHtml(html) {
      // 修改index.html中的引用，确保它们指向正确的文件
      // 在生产环境中，所有TypeScript文件都会被编译成JS
      let modifiedHtml = html;
      
      // 处理.tsx引用
      modifiedHtml = modifiedHtml.replace(
        /src="\/src\/main\.tsx"/g, 
        'src="./assets/main.js"'
      );
      
      // 处理.js引用(也可能在源码中出现)
      modifiedHtml = modifiedHtml.replace(
        /src="\/src\/main\.js"/g, 
        'src="./assets/main.js"'
      );
      
      return modifiedHtml;
    }
  };
}
