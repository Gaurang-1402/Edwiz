import HistoryItem, { HistoryProps } from "../components/HistoryItem"
import { useEffect, useState } from "react"

import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from '../components/Navbar'
import type { NextPage } from 'next'

// Dummy data for history
const history: HistoryProps[] = [
  {
    image: "https://t3.ftcdn.net/jpg/02/48/42/64/360_F_248426448_NVKLywWqArG2ADUxDq6QprtIzsF82dMF.jpg",
    name: "search"
  },
  {
    image: "https://t3.ftcdn.net/jpg/02/48/42/64/360_F_248426448_NVKLywWqArG2ADUxDq6QprtIzsF82dMF.jpg",
    name: "search 2"
  },
  {
    image: "https://t3.ftcdn.net/jpg/02/48/42/64/360_F_248426448_NVKLywWqArG2ADUxDq6QprtIzsF82dMF.jpg",
    name: "search 3"
  },
  {
    image: "https://t3.ftcdn.net/jpg/02/48/42/64/360_F_248426448_NVKLywWqArG2ADUxDq6QprtIzsF82dMF.jpg",
    name: "search"
  },
  {
    image: "https://t3.ftcdn.net/jpg/02/48/42/64/360_F_248426448_NVKLywWqArG2ADUxDq6QprtIzsF82dMF.jpg",
    name: "search 2"
  },
  {
    image: "https://t3.ftcdn.net/jpg/02/48/42/64/360_F_248426448_NVKLywWqArG2ADUxDq6QprtIzsF82dMF.jpg",
    name: "search 3"
  },
  {
    image: "https://t3.ftcdn.net/jpg/02/48/42/64/360_F_248426448_NVKLywWqArG2ADUxDq6QprtIzsF82dMF.jpg",
    name: "search"
  },
  {
    image: "https://t3.ftcdn.net/jpg/02/48/42/64/360_F_248426448_NVKLywWqArG2ADUxDq6QprtIzsF82dMF.jpg",
    name: "search 2"
  },
  {
    image: "https://t3.ftcdn.net/jpg/02/48/42/64/360_F_248426448_NVKLywWqArG2ADUxDq6QprtIzsF82dMF.jpg",
    name: "search 3"
  },
  {
    image: "https://t3.ftcdn.net/jpg/02/48/42/64/360_F_248426448_NVKLywWqArG2ADUxDq6QprtIzsF82dMF.jpg",
    name: "search"
  },
  {
    image: "https://t3.ftcdn.net/jpg/02/48/42/64/360_F_248426448_NVKLywWqArG2ADUxDq6QprtIzsF82dMF.jpg",
    name: "search 2"
  },
  {
    image: "https://t3.ftcdn.net/jpg/02/48/42/64/360_F_248426448_NVKLywWqArG2ADUxDq6QprtIzsF82dMF.jpg",
    name: "search 3"
  },
]

const History: NextPage = () => {
  const [searches, setSearches] = useState<HistoryProps[]>([])

  useEffect(() => {
    setSearches(history)
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center h-screen">
      <Head>
        <title>Edwiz | History</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <div className="flex w-full flex-1 flex-col items-start justify-start text-center mt-10 mb-0 overflow-y-auto">
        <div className="flex-row flex flex-wrap justify-center ">
          {
            searches.map((search, index) => {
              return (
                <HistoryItem key={index} image={search.image} name={search.name} />
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
