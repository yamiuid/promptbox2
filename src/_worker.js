// CloudFlare Worker 脚本，用于处理 SPA 应用程序的请求
// 和修正 MIME 类型问题

/**
 * 定义不同文件扩展名对应的 MIME 类型
 */
const mimeTypes = {
  js: 'application/javascript; charset=utf-8',
  mjs: 'application/javascript; charset=utf-8',
  css: 'text/css; charset=utf-8',
  html: 'text/html; charset=utf-8',
  json: 'application/json; charset=utf-8',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  svg: 'image/svg+xml',
  webmanifest: 'application/manifest+json',
  ico: 'image/x-icon'
};

/**
 * 根据文件路径确定 MIME 类型
 */
function getMimeType(path) {
  const extension = path.split('.').pop()?.toLowerCase();
  return mimeTypes[extension] || 'application/octet-stream';
}

/**
 * Worker 的主请求处理函数
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    try {
      // 获取原始响应
      let response;
      
      try {
        response = await env.ASSETS.fetch(request);
      } catch (err) {
        console.error("获取资源失败:", err);
        // 如果是SPA路由，返回index.html
        if (!url.pathname.includes('.')) {
          return await env.ASSETS.fetch(`${url.origin}/index.html`);
        }
        throw err;
      }
      
      // 设置正确的MIME类型
      const pathname = url.pathname;
      const newHeaders = new Headers(response.headers);
      
      // JavaScript文件 - 处理所有可能的JS文件
      if (pathname.endsWith('.js') || 
          pathname.endsWith('.mjs') || 
          pathname.endsWith('.tsx') || 
          pathname.endsWith('.ts') || 
          pathname.endsWith('.jsx') || 
          (pathname.includes('/assets/') && !pathname.includes('.'))) {
        
        newHeaders.set('Content-Type', 'application/javascript; charset=utf-8');
        console.log(`设置JavaScript MIME类型: ${pathname}`);
        return new Response(response.body, { 
          status: response.status, 
          headers: newHeaders 
        });
      }
      
      // 网站清单文件
      if (pathname.endsWith('.webmanifest') || pathname.includes('manifest.json')) {
        newHeaders.set('Content-Type', 'application/manifest+json; charset=utf-8');
        console.log(`设置Manifest MIME类型: ${pathname}`);
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
      
      // SPA路由 - 404时返回index.html
      if (response.status === 404 && !url.pathname.includes('.')) {
        return await env.ASSETS.fetch(`${url.origin}/index.html`);
      }
      
      return response;
    } catch (error) {
      return new Response(
        `<!DOCTYPE html><html><head><title>Error</title></head><body><h1>Server Error</h1><p>${error.message || 'Unknown error'}</p></body></html>`, 
        { 
          status: 500, 
          headers: { 'Content-Type': 'text/html' } 
        }
      );
    }
  }
} 