
import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEO = ({ 
  title = "Prompt Peek Gallery - AI艺术作品分享平台",
  description = "Prompt Peek Gallery是一个专业的AI艺术作品分享平台，用户可以上传、浏览和收藏AI生成的艺术作品，支持多种AI绘画模型。",
  keywords = "AI艺术,AI绘画,人工智能艺术,作品分享,艺术画廊,Midjourney,Stable Diffusion,DALL-E",
  image = "https://promptbox.art/og-image.jpg",
  url = "https://promptbox.art",
  type = "website"
}: SEOProps) => {
  useEffect(() => {
    // 更新页面标题
    document.title = title;

    // 更新或创建meta标签
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // 基本SEO标签
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // Open Graph标签
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:type', type, true);

    // Twitter标签
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    updateMetaTag('twitter:url', url);

    // 更新canonical链接
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
  }, [title, description, keywords, image, url, type]);

  return null;
};

export default SEO;
