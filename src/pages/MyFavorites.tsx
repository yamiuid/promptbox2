
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import ArtworkGrid from '@/components/ArtworkGrid';
import LoadingGrid from '@/components/LoadingGrid';
import EmptyState from '@/components/EmptyState';
import ArtworkDetailDialog from '@/components/ArtworkDetailDialog';

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

const MyFavorites = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUser(user);
      fetchFavorites(user.id);
    };
    
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session?.user) {
          navigate('/auth');
        } else {
          setUser(session.user);
          fetchFavorites(session.user.id);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchFavorites = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
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
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching favorites:', error);
        throw error;
      }
      
      const favoriteArtworks = data?.map(item => item.artworks).filter(Boolean) || [];
      setArtworks(favoriteArtworks);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArtworkClick = (artworkId: string) => {
    setSelectedArtworkId(artworkId);
  };

  const handleUploadClick = () => {
    navigate('/upload');
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user} onUploadClick={handleUploadClick} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">我的收藏</h1>
          <p className="text-muted-foreground">这里是您收藏的所有作品</p>
        </div>

        {loading ? (
          <LoadingGrid />
        ) : artworks.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">暂无收藏作品</h2>
            <p className="text-muted-foreground mb-4">去发现一些精彩的作品吧</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90"
            >
              浏览作品
            </button>
          </div>
        ) : (
          <ArtworkGrid artworks={artworks} onArtworkClick={handleArtworkClick} />
        )}
      </main>
      
      <ArtworkDetailDialog 
        artworkId={selectedArtworkId} 
        open={!!selectedArtworkId} 
        onOpenChange={(open) => !open && setSelectedArtworkId(null)}
      />
    </div>
  );
};

export default MyFavorites;
