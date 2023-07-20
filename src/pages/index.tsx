import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/home.module.css'
import heroImg from '../../public/assets/hero.png'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Tarefas+ | Organize suas tarefas de forma fácil</title>
      </Head>
      
      <main className={styles.main}>
        <div className={styles.logoContent}>
          <Image className={styles.hero} alt='Logo Tarefas -+' src={heroImg} priority/>
        </div>

        <h1 className={styles.title}>
          Sistema feito para você organzar <br /> seus estudos e tarefas
        </h1>
      </main>
    </div>
  )
}
