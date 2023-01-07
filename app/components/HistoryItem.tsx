import React from 'react'

export interface HistoryProps {
   image?: string;
   name?: string;
}

export default function HistoryItem({ image = "https://t3.ftcdn.net/jpg/02/48/42/64/360_F_248426448_NVKLywWqArG2ADUxDq6QprtIzsF82dMF.jpg", name = "search" }: HistoryProps) {
      
   return (
      <div className="flex flex-col bg-gray-200 p-4 rounded-md m-5">
         <div className="flex flex-col justify-center items-center">
            <img className="w-auto max-h-56" src={image} />
         </div>
         <div className="flex flex-col">
            <p className="text-md pt-2">{name}</p>
         </div>
      </div>
   )
}
