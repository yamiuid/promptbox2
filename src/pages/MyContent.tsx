
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import ArtworkGrid from '@/components/ArtworkGrid';
import LoadingGrid from '@/components/LoadingGrid';
import ArtworkDetailDialog from '@/components/ArtworkDetailDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MyUploadsTab from '@/components/MyUploadsTab';

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

const MyContent = () => {
  const [user, setUser] = useState<any>(null);
  const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [counts, setCounts] = useState({
    uploads: 0,
    favorites: 0,
    likes: 0
  });
  const navigate = useNavigate();

  // Get the active tab from URL params, default to 'uploads'
  const activeTab = searchParams.get('tab') || 'uploads';

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUser(user);
      fetchCounts(user.id);
    };
    
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session?.user) {
          navigate('/auth');
        } else {
          setUser(session.user);
          fetchCounts(session.user.id);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchCounts = async (userId: string) => {
    try {
      // Get uploads count
      const { count: uploadsCount } = await supabase
        .from('artworks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get favorites count
      const { count: favoritesCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get likes count
      const { count: likesCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      setCounts({
        uploads: uploadsCount || 0,
        favorites: favoritesCount || 0,
        likes: likesCount || 0
      });
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  const handleArtworkClick = (artworkId: string) => {
    setSelectedArtworkId(artworkId);
  };

  const handleUploadClick = () => {
    navigate('/upload');
  };

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const handleCountUpdate = (tab: 'uploads' | 'favorites' | 'likes', change: number) => {
    setCounts(prev => ({
      ...prev,
      [tab]: Math.max(0, prev[tab] + change)
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user} onUploadClick={handleUploadClick} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">我的内容</h1>
          <p className="text-muted-foreground">管理您的上传、收藏和喜欢的作品</p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="uploads">
              我的上传 ({counts.uploads})
            </TabsTrigger>
            <TabsTrigger value="favorites">
              我的收藏 ({counts.favorites})
            </TabsTrigger>
            <TabsTrigger value="likes">
              我的喜欢 ({counts.likes})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="uploads" className="mt-6">
            <MyUploadsTab 
              userId={user?.id} 
              onArtworkClick={handleArtworkClick}
              onCountUpdate={(change) => handleCountUpdate('uploads', change)}
            />
          </TabsContent>

          <TabsContent value="favorites" className="mt-6">
            <MyFavoritesTab 
              userId={user?.id} 
              onArtworkClick={handleArtworkClick}
            />
          </TabsContent>

          <TabsContent value="likes" className="mt-6">
            <MyLikesTab 
              userId={user?.id} 
              onArtworkClick={handleArtworkClick}
            />
          </TabsContent>
        </Tabs>
      </main>
      
      <ArtworkDetailDialog 
        artworkId={selectedArtworkId} 
        open={!!selectedArtworkId} 
        onOpenChange={(open) => !open && setSelectedArtworkId(null)}
      />
    </div>
  );
};

// 我的收藏标签页组件
const MyFavoritesTab = ({ userId, onArtworkClick }: { userId: string; onArtworkClick: (id: string) => void }) => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      fetchFavorites(userId);
    }
  }, [userId]);

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

      if (error) throw error;
      
      const favoriteArtworks = data?.map(item => item.artworks).filter(Boolean) || [];
      setArtworks(favoriteArtworks);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingGrid />;

  if (artworks.length === 0) {
    return (
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
    );
  }

  return <ArtworkGrid artworks={artworks} onArtworkClick={onArtworkClick} />;
};

// 我的喜欢标签页组件
const MyLikesTab = ({ userId, onArtworkClick }: { userId: string; onArtworkClick: (id: string) => void }) => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      fetchLikes(userId);
    }
  }, [userId]);

  const fetchLikes = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('likes')
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

      if (error) throw error;
      
      const likedArtworks = data?.map(item => item.artworks).filter(Boolean) || [];
      setArtworks(likedArtworks);
    } catch (error) {
      console.error('Error fetching likes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingGrid />;

  if (artworks.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">暂无喜欢作品</h2>
        <p className="text-muted-foreground mb-4">去发现一些精彩的作品吧</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90"
        >
          浏览作品
        </button>
      </div>
    );
  }

  return <ArtworkGrid artworks={artworks} onArtworkClick={onArtworkClick} />;
};

export default MyContent;
