
import { Upload, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  user: any;
  onUploadClick: () => void;
}

const EmptyState = ({ user, onUploadClick }: EmptyStateProps) => {
  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
          <Sparkles className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold mb-4">还没有作品</h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          成为第一个分享AI艺术作品的用户吧！<br />
          让你的创意在这里闪闪发光
        </p>
        <Button onClick={onUploadClick} size="lg" className="shadow-lg">
          <Upload className="h-5 w-5 mr-2" />
          {user ? "上传您的第一个作品" : "登录后上传作品"}
        </Button>
      </div>
    </div>
  );
};

export default EmptyState;
