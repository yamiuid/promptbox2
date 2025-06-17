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
    
    // 尝试从 Assets 中获取资源
    let response = await env.ASSETS.fetch(request);
    
    // 检查是否为 JavaScript 文件
    if (url.pathname.endsWith('.js') || 
        url.pathname.includes('assets/') && !url.pathname.includes('.')) {
      // 对于没有扩展名的资源文件，默认设为 JavaScript 类型
      const newHeaders = new Headers(response.headers);
      newHeaders.set('Content-Type', 'application/javascript; charset=utf-8');
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    }
    
    // 处理网站清单文件
    if (url.pathname.endsWith('/site.webmanifest')) {
      const newHeaders = new Headers(response.headers);
      newHeaders.set('Content-Type', 'application/manifest+json');
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    }
    
    // 处理 SPA 路由 - 如果是 404 但不是资源文件，返回 index.html
    if (response.status === 404 && !url.pathname.includes('.')) {
      response = await env.ASSETS.fetch(`${url.origin}/index.html`);
    }
    
    return response;
  }
} 