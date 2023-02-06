import { useWeb3Contract } from "react-moralis";

export default function LotteryEntrance() {
  const { runContractFunction: enterRaffle } = useWeb3Contract({
    abi: usdcEthPoolAbi,
    contractAddress: usdcEthPoolAddress,
    functionName: "observe",
    params: {
      secondsAgos: [0, 10],
    },
    msgValue: "",
  });
  return <div></div>;
}
