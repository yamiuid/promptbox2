export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // 检查是否正在请求静态资产
    if (url.pathname.startsWith('/assets/') || 
        url.pathname.endsWith('.js') || 
        url.pathname.endsWith('.css') || 
        url.pathname.endsWith('.ico') || 
        url.pathname.endsWith('.png') || 
        url.pathname.endsWith('.jpg') || 
        url.pathname.endsWith('.svg')) {
      // 如果是静态资源，让 CloudFlare 正常处理
      return fetch(request);
    }
    
    // 处理所有其他路由，返回 index.html
    const response = await fetch(`${url.origin}/index.html`, request);
    return new Response(response.body, {
      headers: {
        ...Object.fromEntries(response.headers),
        'content-type': 'text/html; charset=utf-8',
      },
    });
  }
}; 