import React, { useState } from 'react'

const DrawerContent = () => {
    const [isLexica, setIsLexica] = useState(false)
    return (
        <>
            <div className="flex pb-4 w-full">
                <button onClick={() => setIsLexica(false)} className="btn btn-outline">Giphy</button>
                <div className="divider divider-horizontal"></div>
                <button onClick={() => setIsLexica(true)} className="btn btn-outline">Lexica</button>

            </div>
            <div className='w-full h-[32rem] pb-4 bg-slate-400 border-2 border-black'>hello</div>
            <div className='w-full h-[12rem] bg-slate-400 border-2 border-black'>current mappings</div>
        </>

    )
}

export default DrawerContent