import { DASHBOARD, GOOGLE_AUTH_START } from '../config/routes'

import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from '../components/Navbar'
import landingPageImage from "../images/landing_page_placeholder.png"

const Home = () => {
  return (
    <div className="flex bg-[url('/images/Landing_bg.png')] min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Edwiz</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">

        <main className="relative overflow-hidden ">
          <header className="z-30 flex items-center w-full h-20 sm:h-30"/>
          <div className="relative z-20 flex items-center overflow-hidden">
              <div className="container relative flex px-6 py-16 mx-auto">
                  <div className="relative z-20 flex flex-col sm:w-2/3 lg:w-2/5 w-fit">
                      <h1 className="flex flex-col text-6xl font-black leading-none text-gray-800 uppercase font-bebas-neue text-left sm:text-8xl ">
                        Gestures 
                        
                      </h1>
                      <h2 className="flex flex-col text-5xl font-black font-normal leading-none text-gray-800 uppercase font-bebas-neue text-left sm:text-7xl w-fit pl-2">to images</h2>
                      <p className="text-sm text-gray-700 text-left sm:text-base pt-5 pl-1">
                        Enhance your online classes by creating GIFs or AI generated images using your gestures. Atoms on your palm, DNA on your fist, fire on your index finger. 
                        Edwiz is here to make your class a magical experience.
                      </p>
                      <div className="flex mt-8">
                          <a href="#" className="px-4 py-2 mr-4 text-white uppercase bg-green-500 border-2 border-transparent rounded-lg text-md hover:bg-green-400">
                              Get started
                          </a>
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
