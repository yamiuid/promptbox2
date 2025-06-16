
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useToast } from '@/hooks/use-toast';
import { Upload as UploadIcon, ImagePlus, ArrowLeft } from 'lucide-react';

const Upload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
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
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUser(user);
    };
    
    checkAuth();
  }, [navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
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

    // 确保获取正确的公共 URL
    const { data: urlData } = supabase.storage
      .from('artworks')
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;
    console.log('Public URL:', publicUrl);
    
    // 验证 URL 是否有效
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
      // 上传图片
      const imageUrl = await uploadImage(imageFile);
      console.log('Final image URL:', imageUrl);

      // 保存作品信息到数据库
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

      const { data, error } = await supabase
        .from('artworks')
        .insert(artworkData)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Artwork created:', data);

      toast({
        title: "上传成功",
        description: "您的作品已成功发布！",
      });

      navigate(`/artwork/${data.id}`);
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回首页
        </Button>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UploadIcon className="h-6 w-6 mr-2" />
                上传AI作品
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 图片上传区域 */}
                <div className="space-y-4">
                  <Label htmlFor="image">作品图片 *</Label>
                  <div className="border-2 border-dashed border-muted rounded-lg p-8">
                    {previewUrl ? (
                      <div className="space-y-4">
                        <img
                          src={previewUrl}
                          alt="预览"
                          className="max-w-full h-64 object-contain mx-auto rounded-lg"
                          onError={(e) => {
                            console.error('Preview image failed to load');
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="text-center">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setImageFile(null);
                              setPreviewUrl('');
                              if (previewUrl) {
                                URL.revokeObjectURL(previewUrl);
                              }
                            }}
                          >
                            重新选择
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center relative">
                        <ImagePlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <div className="space-y-2">
                          <p className="text-muted-foreground">点击选择图片文件</p>
                          <p className="text-sm text-muted-foreground">支持 JPG、PNG、WebP 格式</p>
                        </div>
                        <input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 基本信息 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      rows={4}
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

                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="flex-1"
                  >
                    取消
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? "上传中..." : "发布作品"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Upload;
