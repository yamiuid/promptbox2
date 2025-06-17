// Cloudflare Worker - 修正MIME类型问题
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    try {
      // 获取资源
      const response = await env.ASSETS.fetch(request);
      
      // 设置正确的MIME类型
      if (response.status === 200) {
        const pathname = url.pathname;
        const newHeaders = new Headers(response.headers);
        
        // JavaScript文件
        if (pathname.endsWith('.js') || pathname.endsWith('.mjs') || 
            pathname.endsWith('.tsx') || pathname.endsWith('.ts') || 
            pathname.includes('/assets/') && !pathname.includes('.')) {
          newHeaders.set('Content-Type', 'application/javascript; charset=utf-8');
          return new Response(response.body, { 
            status: response.status, 
            headers: newHeaders 
          });
        }
        
        // 网站清单文件
        if (pathname.includes('site.webmanifest') || pathname.includes('manifest.json')) {
          newHeaders.set('Content-Type', 'application/manifest+json; charset=utf-8');
          return new Response(response.body, { 
            status: response.status, 
            headers: newHeaders 
          });
        }
        
        // CSS文件
        if (pathname.endsWith('.css')) {
          newHeaders.set('Content-Type', 'text/css; charset=utf-8');
          return new Response(response.body, { 
            status: response.status, 
            headers: newHeaders 
          });
        }
      }
      
      // SPA路由 - 404时返回index.html
      if (response.status === 404 && !url.pathname.includes('.')) {
        return await env.ASSETS.fetch(`${url.origin}/index.html`);
      }
      
      return response;
    } catch (error) {
      return new Response(
        `<!DOCTYPE html><title>Error</title><h1>Server Error</h1><p>${error.message || 'Unknown error'}</p>`, 
        { status: 500, headers: { 'Content-Type': 'text/html' } }
      );
    }
  }
}; 