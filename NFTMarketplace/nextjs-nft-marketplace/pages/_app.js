import Head from "next/head";
import "../styles/globals.css";
// 从react-moralis中导入MoralisProvider
import { MoralisProvider } from "react-moralis";
// 导入Headers
import Header from "../components/Header";

export default function App({ Component, pageProps }) {
  return (
    <div>
      <Head>
        <title>NFT Marketplace</title>
        <meta name="description" content="NFT Marketplace" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MoralisProvider initializeOnMount={false}>
        <Header />
        <Component {...pageProps} />
      </MoralisProvider>
    </div>
  );
}
