import React from 'react'

export interface HistoryProps {
   id: string,
   query: string,
   resource_id: string,
   selected_at: string,
   source: string,
   url: string,
   user_id: string
}

export default function HistoryItem({ id, query, resource_id, selected_at, source, url, user_id }: HistoryProps) {
   const [lastUsed, setLastUsed] = React.useState<Date>(new Date(selected_at))

   return (
      <>

         {/* // <div className="flex flex-col p-4 rounded-md m-5 h-64 w-64 justify-between bg-slate-300"> */}
         {/* <div className="flex flex-col justify-center items-center flex-1 ">
            <img className="max-h-32 w-auto" src={url} />
         </div>
         <div className="flex flex-col text-[#0F1729]">
            <p className="text-md pt-2">{query}</p>
            <p className="text-sm pt-2">Last used: {lastUsed.toLocaleDateString()}</p>
            <p className="text-sm pt-2">Source: {source}</p>
         </div> */}



         < div className="card card-compact w-full bg-base-100 shadow-xl" >
               <img src={url} className='max-h-[200px] object-scale-down' alt="Shoes" />
            <div className="card-body flex">
               <h2 className="card-title mt-auto"><span className='text-purple-400 lowercase'>Query:</span> {query}</h2>
               <div className='text-left'><span className='text-purple-400 lowercase'>Last used:</span> {lastUsed.toLocaleString()}</div>
               <div className='text-left'><span className='text-purple-400 lowercase'>Source:</span> {source}</div>
            </div>
         </div >
         {/* // </div> */}
      </>
   )
}
