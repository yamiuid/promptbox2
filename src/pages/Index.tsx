import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AppHeader from '@/components/AppHeader';
import HeroSection from '@/components/HeroSection';
import TagFilter from '@/components/TagFilter';
import ArtworkGrid from '@/components/ArtworkGrid';
import LoadingGrid from '@/components/LoadingGrid';
import EmptyState from '@/components/EmptyState';
import UploadDialog from '@/components/UploadDialog';
import ArtworkDetailDialog from '@/components/ArtworkDetailDialog';
import SEO from '@/components/SEO';
import { trackTagFilter } from '@/utils/analytics';

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

const Index = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchArtworks();
  }, [selectedTag]);

  const fetchArtworks = async () => {
    setLoading(true);
    try {
      console.log('Fetching artworks for tag:', selectedTag);
      
      if (selectedTag) {
        // When filtering by tag, get artworks that have the selected tag
        const { data, error } = await supabase
          .from('artwork_tags')
          .select(`
            artworks (
              id,
              title,
              description,
              image_url,
              likes_count,
              favorites_count,
              created_at,
              profiles (username)
            )
          `)
          .eq('tag_id', selectedTag);

        if (error) {
          console.error('Error fetching filtered artworks:', error);
          throw error;
        }
        
        const filteredArtworks = data?.map(item => item.artworks).filter(Boolean) || [];
        console.log('Fetched filtered artworks:', filteredArtworks);
        setArtworks(filteredArtworks);
      } else {
        // When no tag is selected, get all artworks
        const { data, error } = await supabase
          .from('artworks')
          .select(`
            id,
            title,
            description,
            image_url,
            likes_count,
            favorites_count,
            created_at,
            profiles (username)
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching all artworks:', error);
          throw error;
        }
        
        console.log('Fetched all artworks:', data);
        setArtworks(data || []);
      }
    } catch (error) {
      console.error('Error fetching artworks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    setUploadDialogOpen(true);
  };

  const handleArtworkClick = (artworkId: string) => {
    setSelectedArtworkId(artworkId);
  };

  const handleTagChange = (tagId: string | null) => {
    setSelectedTag(tagId);
    // 追踪标签筛选事件
    if (tagId) {
      trackTagFilter(tagId);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Prompt Peek Gallery - 探索AI艺术的无限可能"
        description="发现最新的AI艺术作品，浏览由Midjourney、Stable Diffusion、DALL-E等顶级AI模型创作的精美艺术。加入我们的创作者社区，分享你的AI艺术作品。"
        keywords="AI艺术,AI绘画,人工智能艺术,Midjourney,Stable Diffusion,DALL-E,艺术分享,创作社区"
      />
      
      <AppHeader user={user} onUploadClick={handleUploadClick} />

      <main className="container mx-auto px-4 py-8">
        <HeroSection user={user} onUploadClick={handleUploadClick} />
        
        <TagFilter selectedTag={selectedTag} onTagChange={handleTagChange} />

        {loading ? (
          <LoadingGrid />
        ) : artworks.length === 0 ? (
          <EmptyState user={user} onUploadClick={handleUploadClick} />
        ) : (
          <ArtworkGrid artworks={artworks} onArtworkClick={handleArtworkClick} />
        )}
      </main>

      {user && (
        <UploadDialog 
          open={uploadDialogOpen} 
          onOpenChange={setUploadDialogOpen} 
          user={user}
          onUploadSuccess={() => fetchArtworks()}
        />
      )}
      
      <ArtworkDetailDialog 
        artworkId={selectedArtworkId} 
        open={!!selectedArtworkId} 
        onOpenChange={(open) => !open && setSelectedArtworkId(null)}
      />
    </div>
  );
};

export default Index;
