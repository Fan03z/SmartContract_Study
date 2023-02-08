/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

// 加上images,取消默认第三方图像优化,不然yarn next export报错
module.exports = {
  images: {
    unoptimized: true,
  },
  nextConfig,
};
