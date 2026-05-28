# Oyster Amusement Park 牡蛎游乐园

一个可以探访文学城市记忆的小型静态网站。直接打开 `index.html` 即可预览，也可以部署到 GitHub Pages。

## 文件

- `index.html`：页面结构
- `styles.css`：全屏背景、加载动画、响应式布局
- `script.js`：旋转地球、城市点亮、雪花、音乐控制
- `背景图.jpg`：全屏背景图
- `music.mp3`：循环背景音乐

## GitHub Pages 部署

1. 在 GitHub 新建一个仓库。
2. 上传本文件夹里的全部文件到仓库根目录。
3. 进入仓库 `Settings` -> `Pages`。
4. `Build and deployment` 选择 `Deploy from a branch`。
5. Branch 选择 `main` 和 `/root`，保存。
6. 等待 GitHub Pages 构建完成，即可通过生成的网址访问。

现代浏览器可能会限制带声音的自动播放；页面会在加载结束后尝试自动播放，也提供右上角音乐按钮供用户手动开启或暂停。
