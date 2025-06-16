
import { Card, CardContent } from '@/components/ui/card';

const LoadingGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="overflow-hidden shadow-sm">
          <div className="aspect-square bg-muted animate-pulse"></div>
          <CardContent className="p-4">
            <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
            <div className="h-3 bg-muted rounded animate-pulse w-2/3 mb-3"></div>
            <div className="flex justify-between">
              <div className="h-3 bg-muted rounded animate-pulse w-1/3"></div>
              <div className="h-3 bg-muted rounded animate-pulse w-1/4"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LoadingGrid;
