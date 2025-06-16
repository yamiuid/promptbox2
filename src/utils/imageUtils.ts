
// 图片处理工具函数
export const processImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // 计算新的尺寸
      let { width, height } = img;
      const maxSize = 1024;
      
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // 绘制调整后的图片
      ctx?.drawImage(img, 0, 0, width, height);
      
      // 转换为Blob并压缩
      const compressImage = (quality: number): Promise<File> => {
        return new Promise((resolve) => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const newFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                });
                resolve(newFile);
              }
            },
            file.type,
            quality
          );
        });
      };
      
      // 检查文件大小并调整压缩质量
      const checkSizeAndCompress = async (quality: number): Promise<File> => {
        const compressed = await compressImage(quality);
        const maxSize = 2 * 1024 * 1024; // 2MB
        
        if (compressed.size > maxSize && quality > 0.1) {
          // 如果还是太大，降低质量继续压缩
          return checkSizeAndCompress(quality - 0.1);
        }
        
        return compressed;
      };
      
      // 开始压缩流程
      checkSizeAndCompress(0.9).then(resolve);
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};
