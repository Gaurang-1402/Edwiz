import { GOOGLE_AUTH_START } from '../config/routes'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from '../components/Navbar'
import type { NextPage } from 'next'

const Home: NextPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2 overflow-hidden">
      <Head>
        <title>Edwiz</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">

        This is the landing page....
      </main>

    </div>
  )
}

export default Home
