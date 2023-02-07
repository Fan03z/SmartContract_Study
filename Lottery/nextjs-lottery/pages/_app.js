import "@/styles/globals.css";
import { MoralisProvider } from "react-moralis";
// 通知提示组件
import { NotificationProvider } from "web3uikit";

export default function App({ Component, pageProps }) {
  return (
    <MoralisProvider initializeOnMount={false}>
      {/* 用提示组件包装起来 */}
      <NotificationProvider>
        <Component {...pageProps} />
      </NotificationProvider>
    </MoralisProvider>
  );
}
