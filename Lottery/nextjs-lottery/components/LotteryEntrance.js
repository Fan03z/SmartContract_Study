import { useWeb3Contract } from "react-moralis";
// 导入合约abi、地址等信息
import { abi, contractAddresses } from "../constants";
import { useMoralis } from "react-moralis";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNotification } from "web3uikit";

export default function LotteryEntrance() {
  // 此时得到的chainId是其id的16进制,需要转化
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  // 转化
  const chainId = parseInt(chainIdHex);
  const raffleAddress =
    chainId in contractAddresses ? contractAddresses[chainId][0] : null;
  // 为变量设置状态,初始赋值为0
  const [entranceFee, setEntranceFee] = useState("0");
  const [numberOfPlayers, setNumberOfPlayers] = useState("0");
  const [recentWinner, setRecentWinner] = useState("0");

  // 定义调度,即使用通知,弹出提示窗口
  const disPatch = useNotification();

  // runContractFunction既可以发送交易,也可以读取调用合约方法的状态
  const { runContractFunction: enterRaffle } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "enterRaffle",
    params: {},
    msgValue: entranceFee,
  });

  // 通过合约getEntranceFee()获得参与活动的费用最低限制
  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getEntranceFee",
    params: {},
  });

  // 同理
  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getNumberOfPlayers",
    params: {},
  });

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getRecentWinner",
    params: {},
  });

  async function updateUI() {
    // 调用getEntranceFee(),从而使上面的runContractFunction读取数据
    const entranceFeeFromCall = (await getEntranceFee()).toString();
    const numPlayersFromCall = (await getNumberOfPlayers()).toString();
    const recentWinnerFromCall = (await getRecentWinner()).toString();
    // 将entranceFeeFromCall赋予entranceFee,并重新渲染
    // 单位转化为eth
    // setEntranceFee(ethers.utils.formatUnits(entranceFeeFromCall), "ether");
    setEntranceFee(entranceFeeFromCall);
    // 同理
    setNumberOfPlayers(numPlayersFromCall);
    setRecentWinner(recentWinnerFromCall);
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled]);

  const handleSuccess = async function (tx) {
    try {
      await tx.wait(1);
      handleNewNotification(tx);
      updateUI();
    } catch (error) {
      console.log(error);
    }
  };

  const handleNewNotification = function () {
    disPatch({
      type: "info",
      message: "Transaction Complete!",
      title: "Tx Notification",
      position: "topR",
      icon: "bell",
    });
  };

  return (
    <div>
      enterRaffle{" "}
      {raffleAddress ? (
        <div>
          <button
            onClick={async function () {
              // 传入对象,定义调用成功或失败后的反馈
              await enterRaffle({
                onSuccess: handleSuccess,
                onError: (error) => console.log(error),
              });
            }}
          >
            Enter Raffle
          </button>
          Entrance Fee : {ethers.utils.formatUnits(entranceFee, "ether")} ETH
          Number Of Players: {numberOfPlayers}
          Recent Winner: {recentWinner}
        </div>
      ) : (
        <div>No Raffle Address Deteched</div>
      )}
    </div>
  );
}
