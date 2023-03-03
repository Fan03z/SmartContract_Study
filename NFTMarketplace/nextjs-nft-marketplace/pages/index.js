import Head from "next/head";
import Image from "next/image";
// 路径@/有问题的话,试试../
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>HI</main>
    </div>
  );
}
