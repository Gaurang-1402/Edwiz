import { DASHBOARD, GOOGLE_AUTH_START } from '../config/routes'

import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from '../components/Navbar'
import Typist from 'react-typist';
import landingPageImage from "../images/landing_page_placeholder.png"
import { useAuthStore } from '../utils/useAuthStore'
import { useState } from "react"

const Home = () => {
  const [hidden, setHidden] = useState(true)
  const { user } = useAuthStore()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center ">
      <Head>
        <title>Edwiz</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">

        <main className="relative overflow-hidden ">
          <header className="z-30 flex items-center w-full h-20 sm:h-30" />
          <div className="relative z-20 flex items-center overflow-hidden">
            <div className="container relative flex px-6 py-16 mx-auto" style={{transition: "ease-in"}}>
              <div className="relative z-20 flex min-w-[500px] flex-col sm:w-2/3 lg:w-2/5 w-fit">
                <Typist 
                  cursor={{show: false}}
                  avgTypingDelay={100}
                  startDelay={2000}
                >
                  <h1 className="flex flex-col text-6xl font-black leading-none uppercase text-left sm:text-8xl ">
                    Gestures
                  </h1>
                  <Typist.Delay ms={500} />
                  <h2 className="flex flex-col text-5xl font-black leading-none uppercase text-left sm:text-7xl w-fit pl-2">
                    to images
                  </h2>
                </Typist>
                <Typist
                  cursor={{show: false}}
                  avgTypingDelay={25}
                  startDelay={4000}
                  onTypingDone={() => setHidden(false)}
                >
                  <p className="text-sm text-gray-400 text-left sm:text-base pt-5 pl-1">
                    Enhance your online classes by creating GIFs or AI generated images using your gestures. Atoms on your palm, DNA on your fist, fire on your index finger.
                    Edwiz is here to make your class a magical experience.
                  </p>
                </Typist>
               
                <div className="flex mt-8 " style={{opacity: hidden ? "0" : "1", alignSelf:"start", transition: "all 500ms ease-in-out 0s"}} >
                  {!!user ? <Link href={DASHBOARD} className="text-white bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 bg-info border-2 border-transparent text-md">
                    Go to Dashboard
                  </Link> : <Link href={GOOGLE_AUTH_START} className="text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 bg-info border-2 border-transparent text-md">
                    Get started
                  </Link>}
                </div>
                  
                
              </div>
              <div className="relative hidden sm:block sm:w-1/3 lg:w-3/5">
                {/* <img src={landingPageImage} className="max-w-xs m-auto md:max-w-sm"/> */}
              </div>
            </div>
          </div>
        </main>
      </main>
    </div>
  )
}

export default Home
