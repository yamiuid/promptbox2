import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import cloudFlareMimePlugin from "./scripts/vite-plugin-cloudflare-mime.js";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    cloudFlareMimePlugin()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-popover', '@radix-ui/react-toast', '@radix-ui/react-tooltip'],
          'supabase': ['@supabase/supabase-js']
        },
        // 确保 JS 文件扩展名已包含，避免 CloudFlare MIME 类型问题
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    },
    // 其他构建选项
    sourcemap: true,
    assetsDir: "assets",
    emptyOutDir: true,
    outDir: "dist",
    // 确保 HTML 文件正确引用 JS 文件
    assetsInlineLimit: 0
  },
  // 添加特定的服务器配置，确保开发时也使用正确的 MIME 类型
  server: {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8'
    }
  }
}); 