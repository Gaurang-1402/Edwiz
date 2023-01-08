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

  //drawer
  const [openDrawer, setOpenDrawer] = useState<boolean>(false)

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

    const width = window.innerWidth * 0.55
    const height = window.innerHeight * 0.60
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
    <div className="flex bg-[url('/images/Landing_bg.png')] flex-col items-center justify-center">
      <Head>
        <title>Edwiz | Dash</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="w-full min-h-screen overflow-x-hidden">
        <Navbar />
        <div className="px-5 h-full relative flex justify-between">
          <div className='flex flex-col items-center justify-between p-5' style={{flex:"4.5"}}>
            <div className={`flex flex-col items-center justify-center rounded-[10px] overflow-hidden`}>
              <Sketch setup={setup} draw={draw} />
            </div>
            <div className='text-xl pt-5 pb-0  mr-4 font-bold text-transparent bg-clip-text bg-gradient-to-br from-pink-400 to-red-600'>
                Configured Gestures
              </div>
            <div className='flex gap-2 items-center justify-around flex-1 w-3/4 px-5' style={{margin:"1.5rem 0rem 0rem 0rem"}}>
  
              {gestures.map((e, indx) => (
                <div key={indx} className={`${e.color} w-36 h-36 relative rounded`} style={{boxSizing: "border-box"}}>
                  <img src={e.icon} className='absolute p-3 border-2 bg-gray-600 rounded mr-10 w-16' style={{left:"-10px", top: "-10px"}}/>
                  <img src={configuredGestures[indx] ? configuredGestures[indx].url : '/icons/icons8-no-image-100.png'} className='h-full w-40 '  style={{padding: "2rem"}}/>
                </div>
              ))}

            </div>
          </div>

          
          {/* {
            openDrawer ? (
              <div id="drawer-right-example" className="right-0 fixed z-40 h-screen p-4 overflow-y-auto bg-slate-800 w-80 dark:bg-gray-800" tabIndex={-1} aria-labelledby="drawer-right-label">
                <h5 id="drawer-right-label" className="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400"><svg className="w-5 h-5 mr-2" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>Search</h5>
              <button type="button" data-drawer-hide="drawer-right-example" aria-controls="drawer-right-example" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 absolute top-2.5 right-2.5 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" >
                  <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                  <span className="sr-only">Close menu</span>
              </button>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Supercharge your hiring by taking advantage of our <a href="#" className="text-blue-600 underline dark:text-blue-500 hover:no-underline">limited-time sale</a> for Flowbite Docs + Job Board. Unlimited access to over 190K top-ranked candidates and the #1 design job board.</p>
              <div className="grid grid-cols-2 gap-4">
                  <a href="#" className="px-4 py-2 text-sm font-medium text-center text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Learn more</a>
                  <a href="#" className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Get access <svg className="w-4 h-4 ml-2" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg></a>
              </div>
            </div>
            )
            : null  
          } */}

          <div className="drawer absolute drawer-end ">
            <input id="my-drawer" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content absolute right-0 top-[10%]">
              {/* <!-- Page content here --> */}
              <label htmlFor="my-drawer" className="btn btn-primary border-none bg-warning drawer-button"><svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"> <g filter="url(#filter0_iii_18_20461)"> <rect x="17.4141" y="22.8672" width="7.51302" height="12.2086" rx="3.75651" transform="rotate(-45 17.4141 22.8672)" fill="url(#paint0_linear_18_20461)"/> <rect x="17.4141" y="22.8672" width="7.51302" height="12.2086" rx="3.75651" transform="rotate(-45 17.4141 22.8672)" fill="url(#paint1_linear_18_20461)"/> <rect x="17.4141" y="22.8672" width="7.51302" height="12.2086" rx="3.75651" transform="rotate(-45 17.4141 22.8672)" fill="url(#paint2_linear_18_20461)"/> </g> <rect x="17.4141" y="22.8672" width="7.51302" height="12.2086" rx="3.75651" transform="rotate(-45 17.4141 22.8672)" fill="url(#paint3_radial_18_20461)"/> <path fill-rule="evenodd" clip-rule="evenodd" d="M12.9062 23.7969C18.8778 23.7969 23.7188 18.956 23.7188 12.9844C23.7188 7.01279 18.8778 2.17188 12.9062 2.17188C6.93466 2.17188 2.09375 7.01279 2.09375 12.9844C2.09375 18.956 6.93466 23.7969 12.9062 23.7969ZM12.9062 22.0469C17.9113 22.0469 21.9688 17.9894 21.9688 12.9844C21.9688 7.97931 17.9113 3.92188 12.9062 3.92188C7.90118 3.92188 3.84375 7.97931 3.84375 12.9844C3.84375 17.9894 7.90118 22.0469 12.9062 22.0469Z" fill="url(#paint4_linear_18_20461)"/> <g filter="url(#filter1_f_18_20461)"> <path fill-rule="evenodd" clip-rule="evenodd" d="M12.9062 23.5523C18.7428 23.5523 23.4742 18.8209 23.4742 12.9844C23.4742 7.14782 18.7428 2.41638 12.9062 2.41638C7.06969 2.41638 2.33826 7.14782 2.33826 12.9844C2.33826 18.8209 7.06969 23.5523 12.9062 23.5523ZM12.9062 21.8419C17.7981 21.8419 21.7638 17.8762 21.7638 12.9844C21.7638 8.09248 17.7981 4.12681 12.9062 4.12681C8.01436 4.12681 4.04868 8.09248 4.04868 12.9844C4.04868 17.8762 8.01436 21.8419 12.9062 21.8419Z" fill="url(#paint5_linear_18_20461)"/> <path fill-rule="evenodd" clip-rule="evenodd" d="M12.9062 23.5523C18.7428 23.5523 23.4742 18.8209 23.4742 12.9844C23.4742 7.14782 18.7428 2.41638 12.9062 2.41638C7.06969 2.41638 2.33826 7.14782 2.33826 12.9844C2.33826 18.8209 7.06969 23.5523 12.9062 23.5523ZM12.9062 21.8419C17.7981 21.8419 21.7638 17.8762 21.7638 12.9844C21.7638 8.09248 17.7981 4.12681 12.9062 4.12681C8.01436 4.12681 4.04868 8.09248 4.04868 12.9844C4.04868 17.8762 8.01436 21.8419 12.9062 21.8419Z" fill="url(#paint6_radial_18_20461)"/> </g> <g filter="url(#filter2_f_18_20461)"> <circle cx="12.9063" cy="12.9844" r="9.29505" fill="url(#paint7_linear_18_20461)"/> </g> <g filter="url(#filter3_ii_18_20461)"> <circle cx="12.9062" cy="12.9844" r="9.0625" fill="#64D0EA"/> </g> <ellipse cx="16.9896" cy="8.44251" rx="1.65124" ry="2.03343" transform="rotate(-38.8957 16.9896 8.44251)" fill="url(#paint8_linear_18_20461)"/> <defs> <filter id="filter0_iii_18_20461" x="17.9701" y="18.8607" width="11.8333" height="12.0833" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"> <feFlood flood-opacity="0" result="BackgroundImageFix"/> <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/> <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/> <feOffset dx="-1" dy="1"/> <feGaussianBlur stdDeviation="1.5"/> <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/> <feColorMatrix type="matrix" values="0 0 0 0 0.4 0 0 0 0 0.239216 0 0 0 0 0.439216 0 0 0 1 0"/> <feBlend mode="normal" in2="shape" result="effect1_innerShadow_18_20461"/> <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/> <feOffset dy="-0.25"/> <feGaussianBlur stdDeviation="0.375"/> <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/> <feColorMatrix type="matrix" values="0 0 0 0 0.639216 0 0 0 0 0.490196 0 0 0 0 0.643137 0 0 0 1 0"/> <feBlend mode="normal" in2="effect1_innerShadow_18_20461" result="effect2_innerShadow_18_20461"/> <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/> <feOffset dy="1"/> <feGaussianBlur stdDeviation="0.75"/> <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/> <feColorMatrix type="matrix" values="0 0 0 0 0.333333 0 0 0 0 0.27451 0 0 0 0 0.380392 0 0 0 1 0"/> <feBlend mode="normal" in2="effect2_innerShadow_18_20461" result="effect3_innerShadow_18_20461"/> </filter> <filter id="filter1_f_18_20461" x="2.03826" y="2.11638" width="21.736" height="21.736" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"> <feFlood flood-opacity="0" result="BackgroundImageFix"/> <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/> <feGaussianBlur stdDeviation="0.15" result="effect1_foregroundBlur_18_20461"/> </filter> <filter id="filter2_f_18_20461" x="3.41121" y="3.48933" width="18.9901" height="18.9901" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"> <feFlood flood-opacity="0" result="BackgroundImageFix"/> <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/> <feGaussianBlur stdDeviation="0.1" result="effect1_foregroundBlur_18_20461"/> </filter> <filter id="filter3_ii_18_20461" x="3.84375" y="3.77187" width="18.125" height="19.275" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"> <feFlood flood-opacity="0" result="BackgroundImageFix"/> <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/> <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/> <feOffset dy="1"/> <feGaussianBlur stdDeviation="1"/> <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/> <feColorMatrix type="matrix" values="0 0 0 0 0.168627 0 0 0 0 0.603922 0 0 0 0 0.956863 0 0 0 1 0"/> <feBlend mode="normal" in2="shape" result="effect1_innerShadow_18_20461"/> <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/> <feOffset dy="-0.15"/> <feGaussianBlur stdDeviation="0.15"/> <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/> <feColorMatrix type="matrix" values="0 0 0 0 0.137255 0 0 0 0 0.607843 0 0 0 0 0.984314 0 0 0 1 0"/> <feBlend mode="normal" in2="effect1_innerShadow_18_20461" result="effect2_innerShadow_18_20461"/> </filter> <linearGradient id="paint0_linear_18_20461" x1="18.0438" y1="33.2307" x2="22.3749" y2="24.7012" gradientUnits="userSpaceOnUse"> <stop stop-color="#A0659C"/> <stop offset="1" stop-color="#895792"/> </linearGradient> <linearGradient id="paint1_linear_18_20461" x1="21.1595" y1="23.3975" x2="21.1706" y2="27.6844" gradientUnits="userSpaceOnUse"> <stop stop-color="#6C3B74"/> <stop offset="1" stop-color="#845590" stop-opacity="0"/> </linearGradient> <linearGradient id="paint2_linear_18_20461" x1="25.0265" y1="31.1978" x2="19.8779" y2="31.0431" gradientUnits="userSpaceOnUse"> <stop offset="0.115168" stop-color="#703D7A"/> <stop offset="1" stop-color="#703D7A" stop-opacity="0"/> </linearGradient> <radialGradient id="paint3_radial_18_20461" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(21.2148 22.6794) rotate(92.4424) scale(2.33336 5.42286)"> <stop stop-color="#2F1A3D"/> <stop offset="1" stop-color="#532D64" stop-opacity="0"/> </radialGradient> <linearGradient id="paint4_linear_18_20461" x1="12.9062" y1="2.17187" x2="12.9063" y2="23.7969" gradientUnits="userSpaceOnUse"> <stop offset="0.378529" stop-color="#344A7D"/> <stop offset="0.633316" stop-color="#785790"/> <stop offset="0.837142" stop-color="#785790"/> <stop offset="1" stop-color="#9872A2"/> </linearGradient> <linearGradient id="paint5_linear_18_20461" x1="12.9062" y1="2.41638" x2="12.9062" y2="23.5523" gradientUnits="userSpaceOnUse"> <stop stop-color="#475890"/> <stop offset="1" stop-color="#7A4D87"/> </linearGradient> <radialGradient id="paint6_radial_18_20461" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(12.9062 7.40622) rotate(-90.0001) scale(5.125 9.53123)"> <stop offset="0.704268" stop-color="#566298"/> <stop offset="0.786585" stop-color="#566298" stop-opacity="0"/> </radialGradient> <linearGradient id="paint7_linear_18_20461" x1="12.9063" y1="3.68933" x2="12.9063" y2="22.2794" gradientUnits="userSpaceOnUse"> <stop stop-color="#204083"/> <stop offset="1" stop-color="#523573"/> </linearGradient> <linearGradient id="paint8_linear_18_20461" x1="16.9896" y1="6.40908" x2="16.9896" y2="10.4759" gradientUnits="userSpaceOnUse"> <stop stop-color="#DCDBF2"/> <stop offset="0.209118" stop-color="#DCDBF2" stop-opacity="0.84797"/> <stop offset="1" stop-color="#DCDBF2" stop-opacity="0"/> </linearGradient> </defs> </svg></label>
            </div> 
            <div className="drawer-side">
              <label htmlFor="my-drawer" className="drawer-overlay"></label>
              <div className="menu p-4 w-80 bg-base-100 text-base-content">
                <div className='flex flex-row h-full border-l border-gray-600 h-auto overflow-x-hidden ' style={{flex:"1"}}>
                  <div className="menu flex flex-col p-4 pr-0 h-[90vh] overflow-y-auto overflow-x-hidden bg-base-200 text-base-content justify-between ">
                    {/* Searchbox */}

                    {/* as the user types something we hit the API and fetch the data, and show here */}

                    {currentPane === 'history' ?
                      <div className='h-[45rem] pr-5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800 hover:scrollbar-thumb-slate-600 scrollbar-thumb-rounded scroll-pl-16'>
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

                      <div className='h-[45rem] pr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800 hover:scrollbar-thumb-slate-600 scrollbar-thumb-rounded scroll-pl-16 flex flex-col gap-2'>
                        <div className='flex gap-1 mr-3'>
                          <input onKeyUp={(e) => (e.key === 'Enter' && fetchResources())} onChange={(e) => setCurrentQValue(e.target.value)} type="text" placeholder="Type and see the magic 🦄... " className="input input-bordered input-accent w-full max-w-xs"  style={{fontSize:"15px"}}/>
                        </div>


                        <div className='flex gap-2 mr-3'>
                          <button onClick={() => setCurrentMode('GIPHY')} className={`btn btn-sm lowercase btn-outline ${currentMode === 'GIPHY' && 'btn-active'}`}>GIFs 📸</button>
                          <button onClick={() => setCurrentMode('LEXICA')} className={`btn btn-sm lowercase btn-outline ${currentMode === 'LEXICA' && 'btn-active'}`}>AI Gen 🪄</button>
                        </div>

                        <div className='mr-3'>

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
