// 简化版 Worker 脚本 - 专注于修复 MIME 类型问题
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    try {
      // 尝试从 Assets 中获取资源
      const response = await env.ASSETS.fetch(request);
      
      // 如果是 JavaScript 文件，强制设置正确的 MIME 类型
      if (url.pathname.endsWith('.js') || url.pathname.endsWith('.mjs') || 
          url.pathname.endsWith('.tsx') || url.pathname.endsWith('.ts') || 
          url.pathname.includes('/assets/') && !url.pathname.includes('.')) {
        
        const newHeaders = new Headers(response.headers);
        newHeaders.set('Content-Type', 'application/javascript; charset=utf-8');
        
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders
        });
      }
      
      // site.webmanifest 文件
      if (url.pathname.includes('site.webmanifest') || url.pathname.includes('manifest.json')) {
        const newHeaders = new Headers(response.headers);
        newHeaders.set('Content-Type', 'application/manifest+json; charset=utf-8');
        return new Response(response.body, {
          status: response.status, 
          headers: newHeaders
        });
      }
      
      // CSS 文件
      if (url.pathname.endsWith('.css')) {
        const newHeaders = new Headers(response.headers);
        newHeaders.set('Content-Type', 'text/css; charset=utf-8');
        return new Response(response.body, {
          status: response.status,
          headers: newHeaders
        });
      }
      
      // 处理 SPA 路由
      if (response.status === 404 && !url.pathname.includes('.')) {
        const indexResponse = await env.ASSETS.fetch(`${url.origin}/index.html`);
        return indexResponse;
      }
      
      return response;
      
    } catch (error) {
      // 返回错误信息，便于调试
      return new Response(`<!DOCTYPE html>
        <html>
          <head>
            <title>Error</title>
            <meta charset="utf-8">
          </head>
          <body>
            <h1>Error</h1>
            <pre>${error.stack || error.message || 'Unknown error'}</pre>
            <p>URL: ${url.pathname}</p>
          </body>
        </html>`,
        {
          status: 500,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        }
      );
    }
  }
}; 