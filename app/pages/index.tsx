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
    <div className="flex bg-gradient-to-r from-gray-700 via-gray-900 to-black min-h-screen flex-col items-center justify-center " style={{ backdropFilter: "blur(10px)" }}>
      <Head>
        <title>Edwiz</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center px-10">
        <main className="relative overflow-hidden ">
          <div className="relative z-20 flex items-center justify-center overflow-hidden">
            <div className="relative flex flex-col md:flex-row gap-5 px-6 mx-auto" style={{ transition: "ease-in" }}>
              <div className="relative flex flex-col m-20 items-center justify-center z-20">
                <Typist
                  cursor={{ show: false }}
                  avgTypingDelay={100}
                  startDelay={1000}
                >
                  <h1 className="flex flex-col text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-600 uppercase text-left sm:text-7xl w-fit  ">
                    Interactive visualizations
                  </h1>
                  <Typist.Delay ms={500} />
                  <h2 className="flex flex-col text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-600 uppercase text-left sm:text-6xl w-fit pl-1">
                    on your fingertips 🪄
                  </h2>
                </Typist>
                <Typist
                  cursor={{ show: false }}
                  avgTypingDelay={25}
                  startDelay={4000}
                  onTypingDone={() => setHidden(false)}
                >
                  <p className="text-sm text-gray-400 text-left pt-5 pl-1 font-bold">
                    Remote teaching just got an upgrade. Configure gestures to match visualizations so that you can teach more effectively during Zoom classes. Replace video editing with live generated visualizations.
                  </p>
                  <p className='font-bold text-2xl pt-3 text-left'>
                    Gestures → Visualizations
                  </p>
                </Typist>

                <div className="flex mt-8 " style={{ opacity: hidden ? "0" : "1", alignSelf: "start", transition: "all 500ms ease-in-out 0s" }} >
                  {!!user ? <Link href={DASHBOARD} className="text-white bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 bg-info border-transparent text-md">
                    Go to Dashboard
                  </Link> : <Link href={GOOGLE_AUTH_START} className="text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 bg-info border-transparent text-md">
                    Get started
                  </Link>}
                </div>
              </div>
              <div className="relative flex flex-row m-20 justify-center">
                <img
                  alt=""
                  src="/images/atom.gif"
                  className="max-w-xs mr-10 md:max-w-sm animate-bounce"
                  style={{ opacity: hidden ? "0" : "1", transition: "all 500ms ease-in-out 0s", maxHeight: "200px", width: "auto" }}
                />
                <img
                  alt=""
                  src="/images/backhand_index_pointing_left_3d_default.png"
                  className="max-w-xs md:max-w-sm animate-bounce"
                  style={{ opacity: hidden ? "0" : "1", transition: "all 500ms ease-in-out 0s", maxHeight: "200px", width: "auto" }}
                />
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
