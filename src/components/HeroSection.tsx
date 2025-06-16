
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  user: any;
  onUploadClick: () => void;
}

const HeroSection = ({ user, onUploadClick }: HeroSectionProps) => {
  return (
    <div className="text-center mb-12 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          探索AI艺术世界
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl mb-8 leading-relaxed">
          发现和分享令人惊艳的AI生成艺术作品，释放你的创造力
        </p>
        {!user && (
          <p className="text-muted-foreground">
            登录后即可上传和分享您的AI艺术作品
          </p>
        )}
      </div>
    </div>
  );
};

export default HeroSection;
