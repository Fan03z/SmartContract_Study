> NextJS 前端框架安装命令: yarn create next-app .
>
> 项目运行命令: yarn run dev

> 添加 react-moralis: yarn add moralis react-moralis

> 若出现错误 Can't resolve 'moralis-v1' ,则需添加包 moralis-v1 : yarn add --dev moralis-v1

> Tailwind 操作参考: https://tailwindcss.com/docs/guides/nextjs
>
> NextJS 项目安装 Tailwind: yarn add --dev tailwindcss postcss autoprefixer
>
> 初始化项目中 Tailwind 配置: yarn tailwindcss init -p

> 将前端代码 host 到 ipfs 上托管:
>
> 1、ipfs 没有运行代码的能力,要生成静态的 HTML: yarn next build
>
> 2、将静态的 HTML 整合到生成的 out 文件夹中,注意有非静态代码存在时不会成功: yarn next export
>
> 注意: 要在 next.config.js 上的
> `module.exports = {
images: {
  unoptimized: true,
},
nextConfig,
};`
> 加上 images,取消默认第三方图像优化,不然 yarn next export 报错
