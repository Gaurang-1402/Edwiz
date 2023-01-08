import HistoryItem, { HistoryProps } from "../components/HistoryItem"
import { useEffect, useRef, useState } from "react"

import Head from 'next/head'
import { Navbar } from '../components/Navbar'
import type { NextPage } from 'next'
import axios from "axios"

const History: NextPage = () => {
  const [searches, setSearches] = useState<HistoryProps[]>([])

  useEffect(() => {
    axios.get("/api/history").then((res) => {
      setSearches(res.data.history)
    })
  });

  return (
    <div className="flex bg-[url('/images/Landing_bg.png')] min-h-screen flex-col items-center justify-center h-screen" >
      <Head>
        <title>Edwiz | History</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <div className="flex w-full flex-1 flex-col items-center justify-start text-center mt-10 mb-0 overflow-y-auto w-[80%] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800 hover:scrollbar-thumb-slate-600 scrollbar-thumb-rounded" >
        <div className="flex-row flex flex-wrap justify-start ">
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
