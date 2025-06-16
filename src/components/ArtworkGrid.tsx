
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, BookmarkPlus, User } from 'lucide-react';

interface Artwork {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  likes_count: number;
  favorites_count: number;
  created_at: string;
  profiles: {
    username: string;
  };
}

interface ArtworkGridProps {
  artworks: Artwork[];
  onArtworkClick: (artworkId: string) => void;
}

const ArtworkGrid = ({ artworks, onArtworkClick }: ArtworkGridProps) => {
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset loaded state when artworks change
    setImageLoaded({});
    setImageError({});
  }, [artworks]);

  const handleImageLoad = (artworkId: string) => {
    setImageLoaded(prev => ({ ...prev, [artworkId]: true }));
    setImageError(prev => ({ ...prev, [artworkId]: false }));
  };

  const handleImageError = (artworkId: string) => {
    console.error('Image failed to load for artwork:', artworkId);
    setImageError(prev => ({ ...prev, [artworkId]: true }));
    setImageLoaded(prev => ({ ...prev, [artworkId]: false }));
  };

  return (
    <div 
      ref={gridRef}
      className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-4 space-y-0"
      style={{ columnFill: 'balance' }}
    >
      {artworks.map((artwork) => (
        <div key={artwork.id} className="break-inside-avoid mb-4">
          <Card 
            className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group border-0 shadow-sm hover:shadow-xl"
            onClick={() => onArtworkClick(artwork.id)}
          >
            <div className="bg-muted relative overflow-hidden">
              {!imageLoaded[artwork.id] && !imageError[artwork.id] && (
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-500 text-sm z-10">
                  图片加载中...
                </div>
              )}
              
              {imageError[artwork.id] && (
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-500 text-sm z-10">
                  图片加载失败
                </div>
              )}
              
              <img
                src={artwork.image_url}
                alt={artwork.title}
                className={`w-full object-cover transition-all duration-300 group-hover:scale-105 ${
                  imageLoaded[artwork.id] ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => handleImageLoad(artwork.id)}
                onError={() => handleImageError(artwork.id)}
                loading="lazy"
                crossOrigin="anonymous"
                style={{
                  display: 'block',
                  height: 'auto',
                  minHeight: imageLoaded[artwork.id] ? 'auto' : '200px'
                }}
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors line-clamp-1 group-hover:text-primary">
                {artwork.title}
              </h3>
              
              {artwork.description && (
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                  {artwork.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1 hover:text-primary transition-colors">
                  <User className="h-3 w-3" />
                  <span className="truncate">{artwork.profiles.username}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 hover:text-red-500 transition-colors">
                    <Heart className="h-3 w-3" />
                    <span>{artwork.likes_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 hover:text-yellow-500 transition-colors">
                    <BookmarkPlus className="h-3 w-3" />
                    <span>{artwork.favorites_count || 0}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default ArtworkGrid;
