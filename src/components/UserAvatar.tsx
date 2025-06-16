
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LogOut, User, Heart, Bookmark, Upload } from 'lucide-react';

interface UserAvatarProps {
  user: any;
}

const UserAvatar = ({ user }: UserAvatarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
  };

  const handleMyUploads = () => {
    navigate('/my-content?tab=uploads');
    setIsOpen(false);
  };

  const handleMyFavorites = () => {
    navigate('/my-content?tab=favorites');
    setIsOpen(false);
  };

  const handleMyLikes = () => {
    navigate('/my-content?tab=likes');
    setIsOpen(false);
  };

  const username = user?.user_metadata?.username || '用户';
  const initials = username.charAt(0).toUpperCase();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 p-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline-block text-sm">{username}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48" align="end">
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-2 py-1">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">{username}</span>
          </div>
          <div className="border-t pt-2 space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={handleMyUploads}
            >
              <Upload className="h-4 w-4 mr-2" />
              我的上传
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={handleMyFavorites}
            >
              <Bookmark className="h-4 w-4 mr-2" />
              我的收藏
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={handleMyLikes}
            >
              <Heart className="h-4 w-4 mr-2" />
              我的喜欢
            </Button>
            <div className="border-t pt-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                退出登录
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserAvatar;
