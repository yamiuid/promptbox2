import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload as UploadIcon, ImagePlus, X, Tags } from 'lucide-react';
import { processImage } from '@/utils/imageUtils';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  onUploadSuccess?: () => void;
}

const UploadDialog = ({ open, onOpenChange, user, onUploadSuccess }: UploadDialogProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isCheckingImage, setIsCheckingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    prompt: '',
    negative_prompt: '',
    model_name: '',
    steps: '',
    cfg_scale: '',
    seed: '',
    width: '',
    height: ''
  });

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
    if (open) {
      fetchTags();
    }
  }, [open]);

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  // 简单的图像内容检测
  const checkImageContent = async (file: File): Promise<boolean> => {
    setIsCheckingImage(true);
    try {
      // 这里可以集成更专业的图像审核API
      // 目前只做基本的文件类型和大小检查
      
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        throw new Error('只能上传图片文件');
      }

      // 检查文件大小 (限制为10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('图片文件不能超过10MB');
      }

      // 可以在这里添加更多检测逻辑
      // 比如调用百度、腾讯等内容审核API
      
      return true;
    } catch (error) {
      throw error;
    } finally {
      setIsCheckingImage(false);
    }
  };

  const handleImageChange = async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      try {
        console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
        
        // 内容检测
        await checkImageContent(file);
        
        // 处理图片
        const processedFile = await processImage(file);
        console.log('Processed file size:', (processedFile.size / 1024 / 1024).toFixed(2), 'MB');
        
        setImageFile(processedFile);
        const url = URL.createObjectURL(processedFile);
        setPreviewUrl(url);
        
        toast({
          title: "图片上传成功",
          description: "图片已准备好发布",
        });
      } catch (error: any) {
        console.error('Error processing image:', error);
        toast({
          title: "图片处理失败",
          description: error.message || "请重新选择图片",
          variant: "destructive",
        });
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleImageChange(files[0]);
    }
  };

  const handleAreaClick = () => {
    document.getElementById('file-input')?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleModelChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      model_name: value
    }));
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    console.log('Uploading file:', fileName);
    
    const { data, error: uploadError } = await supabase.storage
      .from('artworks')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    console.log('Upload successful:', data);

    const { data: urlData } = supabase.storage
      .from('artworks')
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;
    console.log('Public URL:', publicUrl);
    
    if (!publicUrl || !publicUrl.includes('supabase.co')) {
      throw new Error('Failed to generate valid public URL');
    }
    
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageFile) {
      toast({
        title: "错误",
        description: "请选择要上传的图片",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title.trim() || !formData.prompt.trim()) {
      toast({
        title: "错误",
        description: "标题和提示词为必填项",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const imageUrl = await uploadImage(imageFile);
      console.log('Final image URL:', imageUrl);

      const artworkData = {
        title: formData.title.trim(),
        description: null,
        prompt: formData.prompt.trim(),
        negative_prompt: formData.negative_prompt.trim() || null,
        model_name: formData.model_name.trim() || null,
        steps: formData.steps ? parseInt(formData.steps) : null,
        cfg_scale: formData.cfg_scale ? parseFloat(formData.cfg_scale) : null,
        seed: formData.seed ? parseInt(formData.seed) : null,
        width: formData.width ? parseInt(formData.width) : null,
        height: formData.height ? parseInt(formData.height) : null,
        image_url: imageUrl,
        user_id: user.id
      };

      console.log('Inserting artwork data:', artworkData);

      const { data: artwork, error } = await supabase
        .from('artworks')
        .insert(artworkData)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      // 添加标签关联
      if (selectedTags.length > 0) {
        const tagRelations = selectedTags.map(tagId => ({
          artwork_id: artwork.id,
          tag_id: tagId
        }));

        const { error: tagError } = await supabase
          .from('artwork_tags')
          .insert(tagRelations);

        if (tagError) {
          console.error('Tag relation error:', tagError);
        }
      }

      console.log('Artwork created:', artwork);

      toast({
        title: "上传成功",
        description: "您的作品已成功发布！",
      });

      // 重置表单
      setFormData({
        title: '',
        prompt: '',
        negative_prompt: '',
        model_name: '',
        steps: '',
        cfg_scale: '',
        seed: '',
        width: '',
        height: ''
      });
      setImageFile(null);
      setPreviewUrl('');
      setSelectedTags([]);
      
      onOpenChange(false);
      onUploadSuccess?.();
    } catch (error: any) {
      console.error('Error uploading artwork:', error);
      toast({
        title: "上传失败",
        description: error.message || "上传过程中出现错误",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <UploadIcon className="h-6 w-6 mr-2" />
            上传AI作品
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：图片上传区域 */}
          <div className="space-y-4">
            <Label>作品图片 *</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 transition-colors h-96 cursor-pointer ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-primary/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleAreaClick}
            >
              {isCheckingImage ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                  <p className="text-muted-foreground">正在检测图片内容...</p>
                </div>
              ) : previewUrl ? (
                <div className="h-full flex flex-col">
                  <div className="relative flex-1">
                    <img
                      src={previewUrl}
                      alt="预览"
                      className="w-full h-full object-contain rounded-lg"
                      onError={(e) => {
                        console.error('Preview image failed to load');
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-center mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAreaClick();
                      }}
                    >
                      重新选择
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <ImagePlus className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <div className="space-y-2">
                    <p className="text-muted-foreground">
                      点击选择图片或拖拽图片到此处
                    </p>
                    <p className="text-sm text-muted-foreground">
                      支持 JPG、PNG、WebP 格式<br/>
                      图片将自动调整至1024px以内，压缩至2MB以下<br/>
                      <span className="text-red-500">不允许上传色情、暴力等不当内容</span>
                    </p>
                  </div>
                </div>
              )}
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          </div>

          {/* 右侧：表单信息 */}
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">作品标题 *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="为您的作品起个名字"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model_name">使用模型</Label>
                  <Select value={formData.model_name} onValueChange={handleModelChange}>
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

              {/* 标签选择 */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Tags className="h-4 w-4" />
                  选择标签
                </Label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[60px]">
                  {tags.length > 0 ? (
                    tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/10 transition-colors"
                        onClick={() => toggleTag(tag.id)}
                      >
                        {tag.name}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">暂无可选标签</p>
                  )}
                </div>
              </div>
            </div>

            {/* 生成参数 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">生成参数</h3>
              
              <div className="space-y-2">
                <Label htmlFor="prompt">提示词 *</Label>
                <Textarea
                  id="prompt"
                  name="prompt"
                  value={formData.prompt}
                  onChange={handleInputChange}
                  placeholder="输入生成这个作品的提示词..."
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="negative_prompt">负面提示词</Label>
                <Textarea
                  id="negative_prompt"
                  name="negative_prompt"
                  value={formData.negative_prompt}
                  onChange={handleInputChange}
                  placeholder="输入负面提示词..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="steps">步数</Label>
                  <Input
                    id="steps"
                    name="steps"
                    type="number"
                    value={formData.steps}
                    onChange={handleInputChange}
                    placeholder="20"
                    min="1"
                    max="150"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cfg_scale">CFG Scale</Label>
                  <Input
                    id="cfg_scale"
                    name="cfg_scale"
                    type="number"
                    step="0.1"
                    value={formData.cfg_scale}
                    onChange={handleInputChange}
                    placeholder="7.5"
                    min="1"
                    max="20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="width">宽度</Label>
                  <Input
                    id="width"
                    name="width"
                    type="number"
                    value={formData.width}
                    onChange={handleInputChange}
                    placeholder="512"
                    min="64"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">高度</Label>
                  <Input
                    id="height"
                    name="height"
                    type="number"
                    value={formData.height}
                    onChange={handleInputChange}
                    placeholder="512"
                    min="64"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seed">种子值</Label>
                <Input
                  id="seed"
                  name="seed"
                  type="number"
                  value={formData.seed}
                  onChange={handleInputChange}
                  placeholder="随机种子值"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={loading || isCheckingImage}
                className="flex-1"
              >
                {loading ? "发布中..." : "发布作品"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDialog;
