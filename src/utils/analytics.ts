
// Google Analytics 事件追踪工具

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void;
  }
}

export const GA_MEASUREMENT_ID = 'G-M9J0Y94Y7G'; // 你的实际GA ID

// 页面浏览事件
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// 自定义事件
export const event = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// 艺术作品相关事件
export const trackArtworkView = (artworkId: string, artworkTitle: string) => {
  event('view_artwork', 'artwork', `${artworkId}-${artworkTitle}`);
};

export const trackArtworkLike = (artworkId: string) => {
  event('like_artwork', 'engagement', artworkId);
};

export const trackArtworkFavorite = (artworkId: string) => {
  event('favorite_artwork', 'engagement', artworkId);
};

export const trackArtworkUpload = (modelName: string) => {
  event('upload_artwork', 'content', modelName);
};

export const trackSearch = (searchTerm: string) => {
  event('search', 'navigation', searchTerm);
};

export const trackTagFilter = (tagName: string) => {
  event('filter_by_tag', 'navigation', tagName);
};

export const trackUserAuth = (action: 'login' | 'register' | 'logout') => {
  event(action, 'auth');
};
