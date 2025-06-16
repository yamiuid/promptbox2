
// 站点地图生成工具

export const generateSitemap = (artworks: any[]) => {
  const baseUrl = 'https://promptbox.art';
  const currentDate = new Date().toISOString().split('T')[0];
  
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/auth', priority: '0.8', changefreq: 'monthly' },
    { url: '/upload', priority: '0.9', changefreq: 'monthly' },
    { url: '/my-content', priority: '0.7', changefreq: 'weekly' },
    { url: '/my-favorites', priority: '0.7', changefreq: 'weekly' },
    { url: '/my-likes', priority: '0.7', changefreq: 'weekly' },
  ];

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // 添加静态页面
  staticPages.forEach(page => {
    sitemap += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  });

  // 添加艺术作品页面
  artworks.forEach(artwork => {
    sitemap += `
  <url>
    <loc>${baseUrl}/artwork/${artwork.id}</loc>
    <lastmod>${artwork.created_at.split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  sitemap += `
</urlset>`;

  return sitemap;
};

export const generateRobotsTxt = () => {
  return `User-agent: *
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

Sitemap: https://promptbox.art/sitemap.xml

# 禁止访问管理页面
Disallow: /admin/
Disallow: /api/
Disallow: /*.json$
`;
};
