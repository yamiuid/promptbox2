
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthDialog from '@/components/AuthDialog';
import UserAvatar from '@/components/UserAvatar';

interface AppHeaderProps {
  user: any;
  onUploadClick: () => void;
}

const AppHeader = ({ user, onUploadClick }: AppHeaderProps) => {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const handleUploadClick = () => {
    if (!user) {
      setAuthDialogOpen(true);
    } else {
      onUploadClick();
    }
  };

  return (
    <>
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors">
              AI画廊
            </Link>
            
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Button onClick={handleUploadClick} className="shadow-sm">
                    <Upload className="h-4 w-4 mr-2" />
                    上传作品
                  </Button>
                  <UserAvatar user={user} />
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setAuthDialogOpen(true)}>
                    登录
                  </Button>
                  <Button onClick={() => setAuthDialogOpen(true)}>
                    注册
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </>
  );
};

export default AppHeader;
