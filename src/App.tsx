
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { pageview } from "@/utils/analytics";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ArtworkDetail from "./pages/ArtworkDetail";
import Upload from "./pages/Upload";
import MyContent from "./pages/MyContent";
import MyFavorites from "./pages/MyFavorites";
import MyLikes from "./pages/MyLikes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// 页面追踪组件
const PageTracker = () => {
  const location = useLocation();

  useEffect(() => {
    pageview(location.pathname + location.search);
  }, [location]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PageTracker />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/artwork/:id" element={<ArtworkDetail />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/my-content" element={<MyContent />} />
          <Route path="/my-favorites" element={<MyFavorites />} />
          <Route path="/my-likes" element={<MyLikes />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
