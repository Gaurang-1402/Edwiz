import { FETCH_GIFS, FETCH_WIZS, LIST_HISTORY, REGISTER_BLOB } from '../config/api-routes'
import { useEffect, useRef, useState } from 'react'

import DrawerContent from '../components/DrawerContent'
import Head from 'next/head'
import Image from 'next/image'
import { ImagesOrGifsInstance } from './api/wizs'
import Link from 'next/link'
import { Navbar } from '../components/Navbar'
import type { NextPage } from 'next'
import { SearchBox } from '../components/SearchBox'
import axios from 'axios'
import dynamic from 'next/dynamic'
import p5Types from "p5";
import { toast } from 'react-toastify'
import { useScript } from '../utils/useScript'

const THRESHOLD = 0.80;


// Will only import `react-p5` on client-side
const Sketch = dynamic(() => import("react-p5").then((mod) => {
  // importing sound lib ONLY AFTER REACT-P5 is loaded
  require('p5/lib/addons/p5.sound');
  // returning react-p5 default export
  return mod.default
}), {
  ssr: false
});

declare global {
  interface Window { ml5: any; }
}

const Dash: NextPage = () => {
  // const currentMode: 'LEXICA'|'GIPHY'='GIPHY'

  const [currentMode, setCurrentMode] = useState<'LEXICA' | 'GIPHY' | null>('GIPHY')
  const [currentPane, setCurrentPane] = useState<'history' | 'search' | null>('search')

  const video = useRef<p5Types.Element | null>(null)
  const handpose = useRef<Element | null>(null)
  const handPoses = useRef<any>(null)
  const handPose = useRef<any>(null);
  const handConfidence = useRef<any>(null);
  const [lastGesture, setLastGesture] = useState<'none' | 'pinky' | 'index' | 'thumb'>('none');
  // const [imageIndex, setImageIndex] = useState(-1) // -1 means no image
  const [imageObj, setImageObj] = useState<Record<'pinky' | 'index' | 'thumb', { url: string, image: any } | null>>({ pinky: null, index: null, thumb: null })

  const ml5ScriptStatus = useScript('https://unpkg.com/ml5@latest/dist/ml5.min.js')

  const [lastTimeFetchedAt, setLastTimeFetchedAt] = useState(-1)
  const [queriedResoruces, setQueriedResoruces] = useState<ImagesOrGifsInstance[]>([])
  const [currentQValue, setCurrentQValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [cache, setCache] = useState<Record<string, ImagesOrGifsInstance[]>>({})
  const [configuredGestures, setConfiguredGestures] = useState<Record<number, { url: string }>>({})
  const [historyData, setHistoryData] = useState<ImagesOrGifsInstance[]>([])
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)

  useEffect(() => {
    fetchResources()
  }, [currentMode, currentQValue])

  if (ml5ScriptStatus !== 'ready') {
    return <div>Loading...</div>
  }

  // const configuredGestures = [
  //   {
  //     url: '/icons/icons8-no-image-100.png'
  //   },
  //   {
  //     url: '/icons/icons8-no-image-100.png'
  //   },
  //   {
  //     url: '/icons/icons8-no-image-100.png'
  //   }
  // ]

  const gestures = [
    {
      icon: '/icons/thumb-up.svg',
      color: 'bg-amber-400'
    },
    {
      icon: '/icons/down.svg',
      color: 'bg-purple-400'
    },
    {
      icon: '/icons/finger.svg',
      color: 'bg-orange-400'
    }
  ]

  async function fetchResources() {

    const genKey = (query: string) => {
      console.log(`${query}_${currentMode}`)
      return `${query}_${currentMode}`
    }

    const query = currentQValue;
    if (query.length < 3) {
      setQueriedResoruces([])
      return;
    }

    // TODO: Fix this.....
    // const cachedData = cache[genKey(query)]
    // console.log(cachedData)
    // if (cachedData) return cachedData;

    const currentNow = Date.now()
    if (currentNow - lastTimeFetchedAt >= 300) {
      setIsLoading(true)


      try {
        // fetch
        if (currentMode === 'GIPHY') {
          // fetch from 
          const e = await axios.post(FETCH_GIFS, {
            q: query
          });


          setQueriedResoruces(e.data.gifs)

          if (!e.data.gifs || e.data.gifs.length === 0) {
            throw new Error(`Query: ${query}, resulted in 0 results! 😭`)
          }
          setCache({ ...cache, [genKey(query)]: e.data.gifs })

        } else {
          // lexica
          const e = await axios.post(FETCH_WIZS, {
            q: query
          })
          setQueriedResoruces(e.data.wizs)
          if (!e.data.wizs || e.data.wizs.length === 0) {
            throw new Error(`Query: ${query}, resulted in 0 results! 😭`)
          }
          setCache({ ...cache, [genKey(query)]: e.data.wizs })
        }
      } catch (err: any) {
        toast.error(err.message)
      }
      setLastTimeFetchedAt(currentNow)
      setIsLoading(false)
    }
  }

  // P5JS

  let x = 50;
  const y = 50;

  //See annotations in JS for more information
  const setup = (p5: p5Types, canvasParentRef: Element) => {
    // p5.createCanvas(window.innerWidth*0.7, window.innerHeight*0.7).parent(canvasParentRef);

    const width = window.innerWidth * 0.60
    const height = window.innerHeight * 0.65
    p5.createCanvas(width, height).parent(canvasParentRef);
    p5.background(0);
    // p5.frameRate(60)

    video.current = p5.createCapture(p5.VIDEO);
    video.current.size(width, height)

    p5.tint(255, 255, 255)
    video.current.hide();

    //Initilization of handpose ML model, imported from TFJS port
    handpose.current = window.ml5.handpose(video.current, () => console.log("HandPose model has successfully initialized."));
    (handpose.current as any).on("predict", gotHandPoses);


  };


  function gotHandPoses(results: any) {
    handPoses.current = results;
    if (handPoses.current.length > 0) {
      handPose.current = handPoses.current[0].annotations;
      handConfidence.current = handPoses.current[0].handInViewConfidence;
    } else {
      handPose.current = null
    }
  }

  function draw(p5: p5Types) {
    p5.image(video.current as any, 0, 0);

    ['index', 'thumb', 'pinky'].forEach((finger) => {
      let url = null;
      if (finger === 'index') {
        url = configuredGestures[1]?.url
      } else if (finger === 'thumb') {
        url = configuredGestures[0]?.url
      } else if (finger === 'pinky') {
        url = configuredGestures[2]?.url
      }
      if (url) {
        const oldInstance = (imageObj as any)[finger]
        if (oldInstance?.url !== url) {
          setImageObj({ ...imageObj, [finger]: { url: url, image: p5.loadImage(url) } })
        }
      }
    })

    if (handPose.current) {
      pinkyUp(p5);
      indexUp(p5);
      thumbUp(p5);
      // fist(p5);
      // thumbBase(p5);
      // shaka(p5);

      // middleUp(p5);

    } else {
      setLastGesture('none')
      // console.log("missing Hand")
    }
  }


  function imageStay(p5: p5Types, x: number, y: number) {
    // checks variable value
    // if input is -1
    // display no image
    // if in
    console.log("function called")
    if (lastGesture === 'none') {
      // don't display an image;
      return;
    } else {
      p5.imageMode(p5.CENTER);
      let image = imageObj[lastGesture];

      if (image) {
        p5.image(image.image, x, y);
      } else {
        toast.info('Please map images to gestures by clicking on the image and showing a valid gesture.. 🤗', { toastId: 1 })
      }
      p5.imageMode(p5.CORNER);

    }
  }


  // function middleUp(p5: p5Types) {
  //   if (handPose.current.middleFinger[3] && handConfidence.current > THRESHOLD) {
  //     // checking if up
  //     p5.fill(255, 0, 0);
  //     p5.noStroke();
  //     //ellipse(handPose.middleFinger[3][0], handPose.middleFinger[3][1], 30, 30);
  //     if (tallest(handPose.current.middleFinger[3])) {
  //       // console.log("middle is up");
  //       // TODO:subhmx
  //       // p5.action();
  //       // p5.imageStay();
  //       return true;;
  //     }
  //   }
  //   return false;
  // }


  // function shaka(p5: p5Types) {
  //   if (handPose.current.indexFinger[3] && handConfidence.current > THRESHOLD && tallest(handPose.current.indexFinger[3])) {
  //     if (handPose.current.pinky[3]) {
  //       if (handPose.current.pinky[3][1] < handPose.current.middleFinger[3][1] && handPose.current.pinky[3][1] < handPose.current.ringFinger[3][1]) {
  //         setLastGesture("shaka");
  //         console.log("shaka");
  //         return true;
  //       }
  //     }
  //   }
  //   return false;
  // }


  // function fist(p5: p5Types) {
  //   if (handConfidence.current > THRESHOLD) {
  //     if (!indexUp(p5) && !middleUp(p5) && !pinkyUp(p5) && !thumbUp(p5)) {
  //       console.log("fist");
  //       setLastGesture("fist");
  //       return true;
  //     }
  //   }
  //   return false;
  // }

  function pinkyUp(p5: p5Types) {
    // console.log('aaa', handPose.current)
    if (handPose.current.pinky[3] && handConfidence.current > THRESHOLD) {
      // checking if up


      p5.fill(0, 0, 255);
      p5.noStroke();
      //ellipse(handPose.pinky[3][0], handPose.pinky[3][1], 30, 30);

      if (tallest(handPose.current.pinky[3])) {
        //  console.log("pinky is up");
        console.log('pinky')
        // imageMode(CENTER);
        // imageMode(CORNER);
        imageStay(p5, handPose.current.pinky[3][0], handPose.current.pinky[3][1])

        setLastGesture("pinky");
        return true;;
      }
    }
    return false;
  }


  function indexUp(p5: p5Types) {
    if (handPose.current.indexFinger[3] && handConfidence.current > THRESHOLD) {
      // checking if up
      p5.fill(0, 255, 0);
      p5.noStroke();
      if (tallest(handPose.current.indexFinger[3])) {
        console.log('index')
        setLastGesture("index");
        imageStay(p5, handPose.current.indexFinger[3][0], handPose.current.indexFinger[3][1])
        return true;;
      }
    }
    return false;
  }



  function thumbUp(p5: p5Types) {
    if (handPose.current.thumb[3] && handConfidence.current > THRESHOLD) {
      // checking if up
      p5.fill(255, 0, 255);
      p5.noStroke();
      if (tallest(handPose.current.thumb[3])) {
        console.log('thumb')
        setLastGesture("thumb");
        imageStay(p5, handPose.current.thumb[3][0], handPose.current.thumb[3][1])
        return true;
      }
    }
    return false;
  }



  function tallest(input: any) {
    if (input[1] <= handPose.current.thumb[3][1] && input[1] <= handPose.current.indexFinger[3][1] && input[1] <= handPose.current.middleFinger[3][1] && input[1] <= handPose.current.ringFinger[3][1] && input[1] <= handPose.current.pinky[3][1]) {
      return true;
    } else {
      return false;
    }
  }


  // function action() {
  //   // this function will call things depending on the last gesture
  //   // console.log(lastGesture);
  //   if (lastGesture === "index") {
  //     // TODO: index action
  //     //  noImage = false;
  //     console.log("index action"); // image follows you around
  //   } else if (lastGesture === "thumb") {
  //     // Thumb action goes to next image
  //     if (imageIndex == imageArray.length - 1) {
  //       console.log("Already at last image")
  //     } else {
  //       setImageIndex(imageIndex + 1);
  //     }
  //     console.log("thumb action");
  //   } else if (lastGesture === "shaka") {
  //     // TODO: subhmx
  //     // noImage = !noImage;
  //     console.log("shaka action");
  //   }
  //   else if (lastGesture === "fist") {
  //     // noImage = !noImage;
  //     console.log("fist action");
  //   }
  //   else if (lastGesture === "pinky") {
  //     // pinky action goes to previous image
  //     console.log("pinky action");
  //     if (imageIndex == 0) {
  //       console.log("Already at first image")
  //     } else {
  //       setImageIndex(imageIndex - 1);
  //     }
  //   }
  //   // else if (lastGesture === "spiderMan"){
  //   //     noImage = !noImage;
  //   //     console.log("spiderMan action"); // flips an image on and off
  //   // }
  //   else {
  //     // NO ACTION
  //     //  console.log("no Action")
  //   }
  //   // console.log()
  //   // setLastGesture("middle");

  // }



  const fetchHistoryData = async () => {
    setIsHistoryLoading(true)
    setHistoryData([])
    try {
      const result = await axios.get(LIST_HISTORY);
      console.log(result.data.history)

      setHistoryData(result.data.history)

    } catch (err: any) {
      toast.error(err.message)
    }
    setIsHistoryLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <Head>
        <title>Edwiz | Dash</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="w-full min-h-screen">
        <Navbar />
        <div className="px-5 h-full relative flex justify-between">
          <div className='flex flex-col items-center justify-between p-5' style={{flex:"4.5"}}>
            <div className={`flex flex-col items-center justify-center rounded-[10px] overflow-hidden`}>
              <Sketch setup={setup} draw={draw} />
            </div>
            <div className='text-xl pt-5 pb-0  mr-4 font-bold text-transparent bg-clip-text bg-gradient-to-br from-pink-400 to-red-600'>
                Configured Gestures
              </div>
            <div className='flex gap-2 items-center justify-between flex-1 w-3/4 px-5' style={{margin:"1.5rem 0rem 0rem 0rem"}}>
  
              {gestures.map((e, indx) => (
                <div key={indx} className={`${e.color} w-36 h-36 relative rounded`}>
                  <img src={e.icon} className='absolute p-2 border-2 bg-gray-600 rounded mr-10 w-16' style={{left:"-10px", top: "-10px"}}/>
                  <img src={configuredGestures[indx] ? configuredGestures[indx].url : '/icons/icons8-no-image-100.png'} className='h-full w-40 '  />
                </div>
              ))}

              {/* <div className='bg-red-400 w-40 h-40 relative border-gray-200 border'>
                <img src='/icons/thumb-up.svg' className='absolute left-0 w-16'/>
                <img src='/icons/icons8-no-image-100.png' className='w-40'/>
              </div>

              <div className='bg-purple-400 w-40 h-40'>
              </div>

              <div className='bg-green-400 w-40 h-40'>
              </div> */}
            </div>
          </div>


          <div className='flex flex-row h-full border-l border-gray-600 h-auto overflow-x-hidden ' style={{flex:"1"}}>
            <div className="menu flex flex-col p-4 h-[90vh] overflow-y-auto overflow-x-hidden bg-base-200 text-base-content justify-between ">
              {/* Searchbox */}

              {/* as the user types something we hit the API and fetch the data, and show here */}

              {currentPane === 'history' ?
                <div className='h-[45rem] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800 hover:scrollbar-thumb-slate-600 scrollbar-thumb-rounded scroll-pl-16'>
                  <div className="text-l font-bold text-amber-300">Recently Used</div>
                  {(currentQValue.length > 3 && !historyData.length && !isLoading) ? <img src='/icons/ezgif-5-672dfdd7b6.gif' className='rounded-lg border-2 mt-3 border-green-300' /> : null}
                  {isHistoryLoading && (<div className='alert text-green-500 font-bold flex justify-center mt-3 border-green-300 border-2'>Loading...</div>)}
                  {historyData.map(e => (
                    <img onClick={() => {
                      if (lastGesture === 'none') {
                        toast.error(`Sorry we couldn't find any hand gesture.. 😥`, { toastId: 10202 })
                      } else if (lastGesture === 'index') {
                        setConfiguredGestures({ ...configuredGestures, 1: { url: e.url } })
                      } else if (lastGesture === 'thumb') {
                        setConfiguredGestures({ ...configuredGestures, 0: { url: e.url } })
                      } else if (lastGesture === 'pinky') {
                        setConfiguredGestures({ ...configuredGestures, 2: { url: e.url } })
                      }
                    }} key={e.id} src={e.url} className='cursor-pointer rounded-lg border-2 hover:border-4 mt-3 hover:border-green-500 border-green-300 min-h-12 bg-purple-500 w-full' />
                  ))}
                </div> :

                <div className='h-[45rem] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800 hover:scrollbar-thumb-slate-600 scrollbar-thumb-rounded scroll-pl-16 flex flex-col gap-2'>
                  <div className='flex gap-1'>
                    <input onKeyUp={(e) => (e.key === 'Enter' && fetchResources())} onChange={(e) => setCurrentQValue(e.target.value)} type="text" placeholder="Type something and see the magic 🦄... " className="input input-bordered input-accent w-full max-w-xs" />
                  </div>


                  <div className='flex gap-2'>
                    <button onClick={() => setCurrentMode('GIPHY')} className={`btn btn-sm lowercase btn-outline ${currentMode === 'GIPHY' && 'btn-active'}`}>GIFs 📸</button>
                    <button onClick={() => setCurrentMode('LEXICA')} className={`btn btn-sm lowercase btn-outline ${currentMode === 'LEXICA' && 'btn-active'}`}>AI Gen 🪄</button>
                  </div>

                  <div className=''>

                    {!currentQValue.length && <img src='/icons/ezgif-5-71cd6b5364.gif' className='rounded-lg border-2 mt-3 border-green-300' />}
                    {(currentQValue.length && currentQValue.length < 3) ? (<div className='alert text-green-500 font-bold flex justify-center mt-3 border-green-300 border-2'>Type 3 chars or more 🥺...</div>) : null}
                    {(currentQValue.length > 3 && !queriedResoruces.length && !isLoading) ? <img src='/icons/ezgif-5-672dfdd7b6.gif' className='rounded-lg border-2 mt-3 border-green-300' /> : null}
                    {isLoading && (<div className='alert text-green-500 font-bold flex justify-center mt-3 border-green-300 border-2'>Loading...</div>)}
                    {queriedResoruces.map(e => (
                      <img onClick={() => {
                        if (lastGesture === 'none') {
                          toast.error(`Sorry we couldn't find any hand gesture.. 😥`, { toastId: 10202 })
                        } else if (lastGesture === 'index') {
                          setConfiguredGestures({ ...configuredGestures, 1: { url: e.url } })
                        } else if (lastGesture === 'thumb') {
                          setConfiguredGestures({ ...configuredGestures, 0: { url: e.url } })
                        } else if (lastGesture === 'pinky') {
                          setConfiguredGestures({ ...configuredGestures, 2: { url: e.url } })
                        }

                        axios.post(REGISTER_BLOB, {
                          "id": e.id,
                          "url": e.url,
                          "query": currentQValue,
                          "source": currentMode
                        }).then(f => {
                          console.log(f.data)
                        }).catch(err => {
                          toast.error(err.message)
                        })
                      }} key={e.id} src={e.url} className='cursor-pointer rounded-lg border-2 hover:border-4 mt-3 hover:border-green-500 border-green-300 min-h-12 bg-purple-500 w-full' />
                    ))}
                  </div>
                </div>}
              {/* <div className='py-4'>
            </div> */}
              {/* <DrawerContent></DrawerContent> */}

              <div className='h-[2vh] mx-auto flex justify-center gap-4 bottom-0'>
                <label onClick={() => {setCurrentPane('history'), fetchHistoryData()}} htmlFor="my-drawer-4" className={`drawer-button btn gap-2 btn-sm ${currentPane === 'history' ? 'btn-warning' : 'btn-ghost border-white border'}`}><img className='w-7' src='/icons/Time Machine.svg' />History</label>
                <label onClick={() => setCurrentPane('search')} htmlFor="my-drawer-4" className={`drawer-button btn  gap-2 btn-sm ${currentPane === 'search' ? 'btn-warning' : 'btn-ghost border-white border'}`}><img className='w-7' src='/icons/Compass.svg' />Search</label>
              </div>
            </div>

            
          </div>

          {/* PAGE CONTENT */}

        </div>

        {/* <div className="drawer h-[calc(100%)] drawer-mobile drawer-end">
          <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />

          <div className="drawer-side h-[85vh] w-[30vw] border border-black">
            <label htmlFor="my-drawer-4" className="drawer-overlay"></label>
           
          </div>
        </div> */}
      </main>

    </div>
  )

}


// TODO: Add auth guard...
export default Dash
