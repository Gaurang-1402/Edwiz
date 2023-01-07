import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from '../components/Navbar'
import { SearchBox }  from '../components/SearchBox'
import  DrawerContent  from '../components/DrawerContent'

const Dash: NextPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Edwiz | Dash</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
      <div className="drawer drawer-end">
  <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
  <div className="drawer-content">
    <label htmlFor="my-drawer-4" className="drawer-button btn btn-primary">Open drawer</label>
  </div> 
  <div className="drawer-side">
    <label htmlFor="my-drawer-4" className="drawer-overlay"></label>
    <ul className="menu p-4 w-80 bg-gray-100 text-base-content">
<SearchBox></SearchBox>
<div className='py-4'>
<DrawerContent></DrawerContent>
</div>
    </ul>
  </div>
</div>
      </main>

    </div>
  )
}


// TODO: Add auth guard...
export default Dash
