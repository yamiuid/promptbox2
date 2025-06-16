export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let response;

    // 处理 JavaScript 文件
    if (url.pathname.endsWith('.js') || url.pathname.endsWith('.mjs')) {
      response = await fetch(request);
      if (response.ok) {
        const headers = new Headers(response.headers);
        headers.set('Content-Type', 'application/javascript; charset=UTF-8');
        return new Response(response.body, {
          status: response.status,
          headers
        });
      }
      return response;
    }

    // 处理 CSS 文件
    if (url.pathname.endsWith('.css')) {
      response = await fetch(request);
      if (response.ok) {
        const headers = new Headers(response.headers);
        headers.set('Content-Type', 'text/css; charset=UTF-8');
        return new Response(response.body, {
          status: response.status,
          headers
        });
      }
      return response;
    }
    
    // 处理 JSON 文件
    if (url.pathname.endsWith('.json')) {
      response = await fetch(request);
      if (response.ok) {
        const headers = new Headers(response.headers);
        headers.set('Content-Type', 'application/json; charset=UTF-8');
        return new Response(response.body, {
          status: response.status,
          headers
        });
      }
      return response;
    }
    
    // 检查是否正在请求静态资产
    if (url.pathname.startsWith('/assets/') || 
        url.pathname.endsWith('.ico') || 
        url.pathname.endsWith('.png') || 
        url.pathname.endsWith('.jpg') || 
        url.pathname.endsWith('.svg')) {
      // 如果是静态资源，让 CloudFlare 正常处理
      return fetch(request);
    }
    
    // 处理所有其他路径返回 index.html
    if (!url.pathname.includes('.')) {
      response = await fetch(`${url.origin}/index.html`, request);
      return new Response(response.body, {
        headers: {
          ...Object.fromEntries(response.headers),
          'content-type': 'text/html; charset=UTF-8',
        },
      });
    }
    
    // 所有其他请求直接通过
    return fetch(request);
  }
}; 