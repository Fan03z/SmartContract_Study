// 先要安装Web3组件库包: yarn add web3uikit
// 源码地址: https://github.com/web3ui/web3uikit
import { ConnectButton } from "web3uikit";

export default function Header() {
  return (
    <div>
      Lottery
      <ConnectButton moralisAuth={false} />
    </div>
  );
}
