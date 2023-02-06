// 需要添加 moralis 和 react-moralis 包
import { useMoralis } from "react-moralis";
import { useEffect } from "react";

export default function ManualHeader() {
  // useMoralis()是react中的一种hook,用来跟踪状态的方法
  // enableWeb3()调用时isWeb3Enabled会由false变为true
  const {
    enableWeb3,
    account,
    isWeb3Enabled,
    Moralis,
    deactivateWeb3,
    isWeb3EnableLoading,
  } = useMoralis();

  // useEffect钩子会在[]内值改变时调用
  // 若不提供[]的话,则函数会在任何时候调用并重新渲染;
  // 若提供空[]的话,则函数只会在开始时调用
  // 由于react的严格模式,函数在开始时就会被调用两次
  useEffect(() => {
    if (isWeb3Enabled) return;
    if (typeof window !== "undefined") {
      if (window.localStorage.getItem("connected")) {
        enableWeb3();
      }
    }
  }, [isWeb3Enabled]);

  useEffect(() => {
    Moralis.onAccountChanged((newAccount) => {
      console.log(`Account changed to ${newAccount}`);
      if (newAccount == null) {
        window.localStorage.removeItem("connected");
        deactivateWeb3();
        console.log("Null account found");
      }
    });
  }, []);

  return (
    <div>
      {account ? (
        <div>
          Connected to {account.slice(0, 6)}...
          {account.slice(account.length - 4)}
        </div>
      ) : (
        <button
          onClick={async () => {
            await enableWeb3();
            if (typeof window !== "undefined") {
              // 在本地存储上记录下已经尝试连接了
              window.localStorage.setItem("connected", "injected");
            }
          }}
          disabled={isWeb3EnableLoading}
        >
          Connect
        </button>
      )}
    </div>
  );
}
