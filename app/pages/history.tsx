import HistoryItem, { HistoryProps } from "../components/HistoryItem"
import { useEffect, useRef, useState } from "react"

import Head from 'next/head'
import { Navbar } from '../components/Navbar'
import type { NextPage } from 'next'
import axios from "axios"

const History: NextPage = () => {
  const [searches, setSearches] = useState<HistoryProps[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      const res = await axios.get("/api/history");
      setSearches(res.data.history)
      setIsLoading(() => false)
    }
    fetchData()
  }, [setIsLoading]);

  return (
    <div className="flex bg-gradient-to-r from-purple-600 via-purple-700 to-purple-900 min-h-screen flex-col items-center justify-center h-screen" >
      <Head>
        <title>Edwiz | History</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <div className="text-3xl text-amber-400 font-extrabold text-left mt-10 pl-16">History</div>

      <div className="flex w-full flex-1 flex-col justify-start mt-10 px-10 mb-0 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800 hover:scrollbar-thumb-slate-600 scrollbar-thumb-rounded" >
        {isLoading && (<div className='alert text-green-500 font-bold flex justify-center mt-3 border-green-300 border-2'>Loading...</div>)}
        {!isLoading && searches.length===0 && (<div className='alert text-green-500 font-bold flex justify-center mt-3 border-green-300 border-2'>No results found...</div>)}

        <div className="flex flex-wrap lg:grid lg:grid-cols-2 xl:grid-cols-3 justify-center  gap-4">
          {
            searches.map((search, index) => {
              return (
                <HistoryItem key={index} {...search} />
              )
            })
          }
        </div>
      </div>

    </div>
  )
}

// TODO: Add auth guard...
export default History
