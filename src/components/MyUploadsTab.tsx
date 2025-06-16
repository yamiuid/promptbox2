
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import ArtworkGrid from '@/components/ArtworkGrid';
import LoadingGrid from '@/components/LoadingGrid';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Edit, Trash2, Upload as UploadIcon } from 'lucide-react';
import { processImage } from '@/utils/imageUtils';

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
  profiles: {
    username: string;
  };
}

interface MyUploadsTabProps {
  userId: string;
  onArtworkClick: (id: string) => void;
  onCountUpdate?: (change: number) => void;
}

const MyUploadsTab = ({ userId, onArtworkClick, onCountUpdate }: MyUploadsTabProps) => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    prompt: '',
    negative_prompt: '',
    model_name: '',
    steps: '',
    cfg_scale: '',
    seed: '',
    width: '',
    height: '',
    image_url: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const modelOptions = [
    // 国际主流模型
    'SDXL',
    'Stable Diffusion 1.5',
    'Midjourney',
    'DALL-E 3',
    'DALL-E 2',
    'Flux',
    'ComfyUI',
    'Leonardo AI',
    'Firefly',
    'NovelAI',
    // 中国主流AI绘画模型
    '文心一格',
    '通义万相',
    '6pen',
    '盗梦师',
    'Tiamat',
    '无界AI',
    '画宇宙',
    '秒画',
    'Pixso AI',
    '鹿班设计',
    '创客贴AI',
    '稿定AI',
    '美图AI绘画',
    '轻抖AI绘画',
    '其他'
  ];

  useEffect(() => {
    if (userId) {
      fetchMyUploads(userId);
    }
  }, [userId]);

  const fetchMyUploads = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('artworks')
        .select(`
          id,
          title,
          description,
          image_url,
          prompt,
          negative_prompt,
          model_name,
          steps,
          cfg_scale,
          seed,
          width,
          height,
          likes_count,
          favorites_count,
          created_at,
          profiles (username)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArtworks(data || []);
    } catch (error) {
      console.error('Error fetching uploads:', error);
      toast({
        title: "加载失败",
        description: "无法加载您的上传作品",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (artwork: Artwork) => {
    setEditingArtwork(artwork);
    setEditForm({
      title: artwork.title,
      prompt: artwork.prompt,
      negative_prompt: artwork.negative_prompt || '',
      model_name: artwork.model_name || '',
      steps: artwork.steps?.toString() || '',
      cfg_scale: artwork.cfg_scale?.toString() || '',
      seed: artwork.seed?.toString() || '',
      width: artwork.width?.toString() || '',
      height: artwork.height?.toString() || '',
      image_url: artwork.image_url
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const processedFile = await processImage(file);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `artworks/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('artworks')
        .upload(filePath, processedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('artworks')
        .getPublicUrl(filePath);

      setEditForm(prev => ({ ...prev, image_url: publicUrl }));
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "上传失败",
        description: "图片上传失败，请重试",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingArtwork) return;

    setIsEditing(true);
    try {
      const updateData: any = {
        title: editForm.title,
        prompt: editForm.prompt,
        negative_prompt: editForm.negative_prompt || null,
        model_name: editForm.model_name || null,
        updated_at: new Date().toISOString()
      };

      if (editForm.steps) updateData.steps = parseInt(editForm.steps);
      if (editForm.cfg_scale) updateData.cfg_scale = parseFloat(editForm.cfg_scale);
      if (editForm.seed) updateData.seed = parseInt(editForm.seed);
      if (editForm.width) updateData.width = parseInt(editForm.width);
      if (editForm.height) updateData.height = parseInt(editForm.height);
      if (editForm.image_url !== editingArtwork.image_url) {
        updateData.image_url = editForm.image_url;
      }

      const { error } = await supabase
        .from('artworks')
        .update(updateData)
        .eq('id', editingArtwork.id)
        .eq('user_id', userId);

      if (error) throw error;

      // 更新本地状态
      setArtworks(prev => prev.map(artwork => 
        artwork.id === editingArtwork.id 
          ? { ...artwork, ...updateData }
          : artwork
      ));

      setEditingArtwork(null);
      toast({
        title: "更新成功",
        description: "作品信息已更新"
      });
    } catch (error) {
      console.error('Error updating artwork:', error);
      toast({
        title: "更新失败",
        description: "无法更新作品信息",
        variant: "destructive"
      });
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async (artworkId: string) => {
    if (!confirm('确定要删除这个作品吗？此操作无法撤销。')) return;

    setIsDeleting(true);
    try {
      // 先删除相关的点赞和收藏记录
      await supabase.from('likes').delete().eq('artwork_id', artworkId);
      await supabase.from('favorites').delete().eq('artwork_id', artworkId);
      
      // 删除作品
      const { error } = await supabase
        .from('artworks')
        .delete()
        .eq('id', artworkId)
        .eq('user_id', userId);

      if (error) throw error;

      // 更新本地状态
      setArtworks(prev => prev.filter(artwork => artwork.id !== artworkId));
      
      // 更新计数
      if (onCountUpdate) {
        onCountUpdate(-1);
      }
      
      toast({
        title: "删除成功",
        description: "作品已删除"
      });
    } catch (error) {
      console.error('Error deleting artwork:', error);
      toast({
        title: "删除失败",
        description: "无法删除作品",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <LoadingGrid />;

  if (artworks.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">还没有上传作品</h2>
        <p className="text-muted-foreground mb-4">开始创作您的第一个作品吧</p>
        <button 
          onClick={() => navigate('/upload')}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90"
        >
          上传作品
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {artworks.map((artwork) => (
          <div key={artwork.id} className="group relative">
            <div 
              className="aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer"
              onClick={() => onArtworkClick(artwork.id)}
            >
              <img
                src={artwork.image_url}
                alt={artwork.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(artwork);
                  }}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(artwork.id);
                  }}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="mt-3">
              <h3 className="font-medium text-sm line-clamp-1">{artwork.title}</h3>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span>❤️ {artwork.likes_count}</span>
                <span>⭐ {artwork.favorites_count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 编辑对话框 - 左右布局 */}
      <Dialog open={!!editingArtwork} onOpenChange={() => setEditingArtwork(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑作品</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左侧：图片预览和上传 */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">作品预览</Label>
                <div className="mt-2">
                  {editForm.image_url ? (
                    <div className="relative">
                      <img 
                        src={editForm.image_url} 
                        alt="Preview" 
                        className="w-full rounded-lg border object-cover"
                        style={{ aspectRatio: 'auto' }}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => document.getElementById('edit-image-upload')?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? '上传中...' : '更换图片'}
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors aspect-square flex flex-col items-center justify-center"
                      onClick={() => document.getElementById('edit-image-upload')?.click()}
                    >
                      <UploadIcon className="h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">点击上传图片</p>
                    </div>
                  )}
                  <input
                    id="edit-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* 右侧：表单内容 */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>标题 *</Label>
                  <Input
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="输入作品标题"
                  />
                </div>
                <div>
                  <Label>模型名称</Label>
                  <Select 
                    value={editForm.model_name} 
                    onValueChange={(value) => setEditForm(prev => ({ ...prev, model_name: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择AI模型" />
                    </SelectTrigger>
                    <SelectContent>
                      {modelOptions.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>提示词 *</Label>
                <Textarea
                  value={editForm.prompt}
                  onChange={(e) => setEditForm(prev => ({ ...prev, prompt: e.target.value }))}
                  placeholder="输入生成图片的提示词"
                  rows={4}
                />
              </div>

              <div>
                <Label>负面提示词</Label>
                <Textarea
                  value={editForm.negative_prompt}
                  onChange={(e) => setEditForm(prev => ({ ...prev, negative_prompt: e.target.value }))}
                  placeholder="输入负面提示词（可选）"
                  rows={3}
                />
              </div>

              {/* 生成参数 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>步数</Label>
                  <Input
                    type="number"
                    value={editForm.steps}
                    onChange={(e) => setEditForm(prev => ({ ...prev, steps: e.target.value }))}
                    placeholder="20"
                  />
                </div>
                <div>
                  <Label>CFG Scale</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editForm.cfg_scale}
                    onChange={(e) => setEditForm(prev => ({ ...prev, cfg_scale: e.target.value }))}
                    placeholder="7.5"
                  />
                </div>
                <div>
                  <Label>宽度</Label>
                  <Input
                    type="number"
                    value={editForm.width}
                    onChange={(e) => setEditForm(prev => ({ ...prev, width: e.target.value }))}
                    placeholder="512"
                  />
                </div>
                <div>
                  <Label>高度</Label>
                  <Input
                    type="number"
                    value={editForm.height}
                    onChange={(e) => setEditForm(prev => ({ ...prev, height: e.target.value }))}
                    placeholder="512"
                  />
                </div>
              </div>

              <div>
                <Label>种子值</Label>
                <Input
                  type="number"
                  value={editForm.seed}
                  onChange={(e) => setEditForm(prev => ({ ...prev, seed: e.target.value }))}
                  placeholder="随机"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingArtwork(null)}>
              取消
            </Button>
            <Button 
              onClick={handleSaveEdit} 
              disabled={isEditing || !editForm.title || !editForm.prompt}
            >
              {isEditing ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MyUploadsTab;
