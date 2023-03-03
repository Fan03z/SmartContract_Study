import "../styles/globals.css";
// 从react-moralis中导入MoralisProvider
import { MoralisProvider } from "react-moralis";
// 导入Headers
import Header from "../components/Header";

export default function App({ Component, pageProps }) {
  return (
    // 不使用其服务器
    <MoralisProvider initializeOnMount={false}>
      <Header />
      <Component {...pageProps} />
    </MoralisProvider>
  );
}
