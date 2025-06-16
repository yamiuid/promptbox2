import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Heart, BookmarkPlus, User, Calendar, Settings, Copy } from 'lucide-react';

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

interface ArtworkDetailDialogProps {
  artworkId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ArtworkDetailDialog = ({ artworkId, open, onOpenChange }: ArtworkDetailDialogProps) => {
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
    if (artworkId && open) {
      fetchArtwork();
      if (user) {
        checkUserInteractions();
      }
    }
  }, [artworkId, open, user]);

  const fetchArtwork = async () => {
    if (!artworkId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('artworks')
        .select(`
          *,
          profiles (username, avatar_url)
        `)
        .eq('id', artworkId)
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
    } finally {
      setLoading(false);
    }
  };

  const checkUserInteractions = async () => {
    if (!user || !artworkId) return;

    try {
      const [likesResult, favoritesResult] = await Promise.all([
        supabase
          .from('likes')
          .select('id')
          .eq('artwork_id', artworkId)
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('favorites')
          .select('id')
          .eq('artwork_id', artworkId)
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
          .eq('artwork_id', artworkId)
          .eq('user_id', user.id);
        
        setIsLiked(false);
        if (artwork) {
          setArtwork({ ...artwork, likes_count: artwork.likes_count - 1 });
        }
      } else {
        await supabase
          .from('likes')
          .insert({ artwork_id: artworkId, user_id: user.id });
        
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
          .eq('artwork_id', artworkId)
          .eq('user_id', user.id);
        
        setIsFavorited(false);
        if (artwork) {
          setArtwork({ ...artwork, favorites_count: artwork.favorites_count - 1 });
        }
      } else {
        await supabase
          .from('favorites')
          .insert({ artwork_id: artworkId, user_id: user.id });
        
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

  const copyPrompt = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "复制成功",
        description: "提示词已复制到剪贴板",
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "复制失败",
        description: "无法复制到剪贴板",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!artwork) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">作品未找到</h2>
            <Button onClick={() => onOpenChange(false)}>关闭</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-0 shadow-2xl">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-3xl font-medium text-gray-900">{artwork.title}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：图片区域 */}
          <div className="space-y-6">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 shadow-lg">
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

          {/* 右侧：详情区域 */}
          <div className="space-y-6">
            {artwork.description && (
              <p className="text-gray-600 text-lg leading-relaxed">{artwork.description}</p>
            )}
            
            {/* 作者信息 - 苹果风格卡片 */}
            <div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                {artwork.profiles.avatar_url ? (
                  <img
                    src={artwork.profiles.avatar_url}
                    alt={artwork.profiles.username}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{artwork.profiles.username}</p>
                <p className="text-sm text-gray-500 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(artwork.created_at).toLocaleDateString('zh-CN')}
                </p>
              </div>
            </div>

            {/* 生成参数 - 苹果风格卡片 */}
            <Card className="border-0 bg-gray-50/50 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-6 flex items-center text-gray-900">
                  <Settings className="h-5 w-5 mr-3 text-gray-600" />
                  生成参数
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">提示词</label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyPrompt(artwork.prompt)}
                        className="h-8 w-8 p-0 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Copy className="h-4 w-4 text-gray-600" />
                      </Button>
                    </div>
                    <p className="p-4 bg-white rounded-xl text-sm leading-relaxed border border-gray-100 shadow-sm">{artwork.prompt}</p>
                  </div>
                  
                  {artwork.negative_prompt && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-gray-700">负面提示词</label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyPrompt(artwork.negative_prompt || '')}
                          className="h-8 w-8 p-0 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Copy className="h-4 w-4 text-gray-600" />
                        </Button>
                      </div>
                      <p className="p-4 bg-white rounded-xl text-sm leading-relaxed border border-gray-100 shadow-sm">{artwork.negative_prompt}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    {artwork.model_name && (
                      <div className="p-3 bg-white rounded-xl border border-gray-100">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">模型</label>
                        <p className="text-sm font-medium text-gray-900 mt-1">{artwork.model_name}</p>
                      </div>
                    )}
                    
                    {artwork.steps && (
                      <div className="p-3 bg-white rounded-xl border border-gray-100">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">步数</label>
                        <p className="text-sm font-medium text-gray-900 mt-1">{artwork.steps}</p>
                      </div>
                    )}
                    
                    {artwork.cfg_scale && (
                      <div className="p-3 bg-white rounded-xl border border-gray-100">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">CFG Scale</label>
                        <p className="text-sm font-medium text-gray-900 mt-1">{artwork.cfg_scale}</p>
                      </div>
                    )}
                    
                    {artwork.seed && (
                      <div className="p-3 bg-white rounded-xl border border-gray-100">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">种子</label>
                        <p className="text-sm font-medium text-gray-900 mt-1">{artwork.seed}</p>
                      </div>
                    )}
                    
                    {artwork.width && artwork.height && (
                      <div className="p-3 bg-white rounded-xl border border-gray-100 col-span-2">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">尺寸</label>
                        <p className="text-sm font-medium text-gray-900 mt-1">{artwork.width} × {artwork.height}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArtworkDetailDialog;
