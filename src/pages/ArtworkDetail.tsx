import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Heart, BookmarkPlus, ArrowLeft, User, Calendar, Settings } from 'lucide-react';

interface Artwork {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  prompt: string;
  negative_prompt: string | null;
  model_name: string | null;
  steps: number | null;
  cfg_scale: number | null;
  seed: number | null;
  width: number | null;
  height: number | null;
  likes_count: number;
  favorites_count: number;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

const ArtworkDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (id) {
      fetchArtwork();
      if (user) {
        checkUserInteractions();
      }
    }
  }, [id, user]);

  const fetchArtwork = async () => {
    try {
      const { data, error } = await supabase
        .from('artworks')
        .select(`
          *,
          profiles (username, avatar_url)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setArtwork(data);
    } catch (error: any) {
      console.error('Error fetching artwork:', error);
      toast({
        title: "错误",
        description: "无法加载作品详情",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const checkUserInteractions = async () => {
    if (!user || !id) return;

    try {
      const [likesResult, favoritesResult] = await Promise.all([
        supabase
          .from('likes')
          .select('id')
          .eq('artwork_id', id)
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('favorites')
          .select('id')
          .eq('artwork_id', id)
          .eq('user_id', user.id)
          .single()
      ]);

      setIsLiked(!!likesResult.data);
      setIsFavorited(!!favoritesResult.data);
    } catch (error) {
      console.error('Error checking user interactions:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "请先登录",
        description: "登录后才能点赞作品",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('artwork_id', id)
          .eq('user_id', user.id);
        
        setIsLiked(false);
        if (artwork) {
          setArtwork({ ...artwork, likes_count: artwork.likes_count - 1 });
        }
      } else {
        await supabase
          .from('likes')
          .insert({ artwork_id: id, user_id: user.id });
        
        setIsLiked(true);
        if (artwork) {
          setArtwork({ ...artwork, likes_count: artwork.likes_count + 1 });
        }
      }
    } catch (error: any) {
      console.error('Error handling like:', error);
      toast({
        title: "操作失败",
        description: "无法更新点赞状态",
        variant: "destructive",
      });
    }
  };

  const handleFavorite = async () => {
    if (!user) {
      toast({
        title: "请先登录",
        description: "登录后才能收藏作品",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isFavorited) {
        await supabase
          .from('favorites')
          .delete()
          .eq('artwork_id', id)
          .eq('user_id', user.id);
        
        setIsFavorited(false);
        if (artwork) {
          setArtwork({ ...artwork, favorites_count: artwork.favorites_count - 1 });
        }
      } else {
        await supabase
          .from('favorites')
          .insert({ artwork_id: id, user_id: user.id });
        
        setIsFavorited(true);
        if (artwork) {
          setArtwork({ ...artwork, favorites_count: artwork.favorites_count + 1 });
        }
      }
    } catch (error: any) {
      console.error('Error handling favorite:', error);
      toast({
        title: "操作失败",
        description: "无法更新收藏状态",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">作品未找到</h1>
          <Button onClick={() => navigate('/')}>返回首页</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 rounded-xl"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 图片区域 */}
          <div className="space-y-6">
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted shadow-lg">
              <img
                src={artwork.image_url}
                alt={artwork.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* 互动按钮 - 苹果风格设计 */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={handleLike}
                className="flex-1 h-12 rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm hover:bg-white hover:scale-[1.02] transition-all duration-200 shadow-sm"
              >
                <Heart 
                  className={`h-5 w-5 mr-3 transition-colors duration-200 ${
                    isLiked ? 'text-red-500 fill-red-500' : 'text-gray-600'
                  }`} 
                />
                <span className="text-gray-900 font-medium">点赞 ({artwork.likes_count})</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleFavorite}
                className="flex-1 h-12 rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm hover:bg-white hover:scale-[1.02] transition-all duration-200 shadow-sm"
              >
                <BookmarkPlus 
                  className={`h-5 w-5 mr-3 transition-colors duration-200 ${
                    isFavorited ? 'text-orange-500 fill-orange-500' : 'text-gray-600'
                  }`} 
                />
                <span className="text-gray-900 font-medium">收藏 ({artwork.favorites_count})</span>
              </Button>
            </div>
          </div>

          {/* 详情区域 */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{artwork.title}</h1>
              {artwork.description && (
                <p className="text-muted-foreground mb-4">{artwork.description}</p>
              )}
              
              {/* 作者信息 */}
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {artwork.profiles.avatar_url ? (
                    <img
                      src={artwork.profiles.avatar_url}
                      alt={artwork.profiles.username}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{artwork.profiles.username}</p>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(artwork.created_at).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              </div>
            </div>

            {/* 生成参数 */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  生成参数
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">提示词</label>
                    <p className="mt-1 p-3 bg-muted rounded-md text-sm">{artwork.prompt}</p>
                  </div>
                  
                  {artwork.negative_prompt && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">负面提示词</label>
                      <p className="mt-1 p-3 bg-muted rounded-md text-sm">{artwork.negative_prompt}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    {artwork.model_name && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">模型</label>
                        <p className="text-sm">{artwork.model_name}</p>
                      </div>
                    )}
                    
                    {artwork.steps && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">步数</label>
                        <p className="text-sm">{artwork.steps}</p>
                      </div>
                    )}
                    
                    {artwork.cfg_scale && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">CFG Scale</label>
                        <p className="text-sm">{artwork.cfg_scale}</p>
                      </div>
                    )}
                    
                    {artwork.seed && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">种子</label>
                        <p className="text-sm">{artwork.seed}</p>
                      </div>
                    )}
                    
                    {artwork.width && artwork.height && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">尺寸</label>
                        <p className="text-sm">{artwork.width} × {artwork.height}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtworkDetail;
