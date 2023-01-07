import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from '../components/Navbar'
import { SearchBox } from '../components/SearchBox'
import DrawerContent from '../components/DrawerContent'
import { useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import p5Types from "p5";
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
  const video = useRef<p5Types.Element | null>(null)
  const handpose = useRef<Element | null>(null)
  const handPoses = useRef<any>(null)
  const handPose = useRef<any>(null);
  const handConfidence = useRef<any>(null);
  const [lastGesture, setLastGesture] = useState<string>('middle');
  const [imageIndex, setImageIndex] = useState(-1) // -1 means no image
  const [imageArray, setImageArray] = useState([])




  const ml5ScriptStatus = useScript('https://unpkg.com/ml5@latest/dist/ml5.min.js')
  if (ml5ScriptStatus !== 'ready') {
    return <div>Loading...</div>
  }

  let x = 50;
  const y = 50;

  //See annotations in JS for more information
  const setup = (p5: p5Types, canvasParentRef: Element) => {
    // p5.createCanvas(window.innerWidth*0.7, window.innerHeight*0.7).parent(canvasParentRef);

    let canvas = p5.createCanvas(640, 480).parent(canvasParentRef);
    p5.background(0);
    p5.frameRate(60)

    video.current = p5.createCapture('VIDEO');
    video.current.hide();

    // canvas.drop(gotFile);

    //Initilization of handpose ML model, imported from TFJS port
    handpose.current = window.ml5.handpose(video.current, () => console.log("HandPose model has successfully initialized."));
    // console.log(handpose);


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

  // const draw = (p5: p5Types) => {
  //   p5.background(0);
  //   p5.ellipse(x, y, 70, 70);
  //   x++;
  // };

  function draw(p5: p5Types) {
    p5.image(video.current as any, 0, 0);

    // if(!isHandPoseModelInitialized){
    //     background(100);
    //     push();
    //     textSize(32);
    //     textAlign(CENTER);
    //     fill(255);
    //     noStroke();
    //     text("Waiting for HandPose model to load...", width/2, height/2);
    //     pop();
    //   }

    if (handPose.current) {
      pinkyUp(p5);
      indexUp(p5);
      thumbUp(p5);

      fist(p5);
      // thumbBase(p5);
      shaka(p5);

      // middleUp(p5);

    } else {
      console.log("missing Hand")
    }
  }


  function middleUp(p5: p5Types) {
    if (handPose.current.middleFinger[3] && handConfidence.current > THRESHOLD) {
      // checking if up
      p5.fill(255, 0, 0);
      p5.noStroke();
      //ellipse(handPose.middleFinger[3][0], handPose.middleFinger[3][1], 30, 30);
      if (tallest(handPose.current.middleFinger[3])) {
        // console.log("middle is up");
        // TODO:subhmx
        // p5.action();
        // p5.imageStay();
        return true;;
      }
    }
    return false;
  }


  function shaka(p5: p5Types) {
    if (handPose.current.indexFinger[3] && handConfidence.current > THRESHOLD && tallest(handPose.current.indexFinger[3])) {
      if (handPose.current.pinky[3]) {
        if (handPose.current.pinky[3][1] < handPose.current.middleFinger[3][1] && handPose.current.pinky[3][1] < handPose.current.ringFinger[3][1]) {
          setLastGesture("shaka");
          console.log("shaka");
          return true;
        }
      }
    }
    return false;
  }


  function fist(p5: p5Types) {
    if (handConfidence.current > THRESHOLD) {
      if (!indexUp(p5) && !middleUp(p5) && !pinkyUp(p5) && !thumbUp(p5)) {
        console.log("fist");
        setLastGesture("fist");
        return true;
      }
    }
    return false;
  }

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
        //  TODO: check this
        // p5.imageMode(CENTER);
        // p5.image(imageArray[imageIndex], handPose.indexFinger[3][0], handPose.indexFinger[3][1]);
        // p5.imageMode(CORNER);
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
        return true;
      }
    }
    return false;
  }

  // function thumbBase(p5: p5Types) {
  //   if (handPose.current.thumb[0] && handConfidence.current > .80) {
  //     p5.fill(0, 0, 255);
  //     p5.noStroke();
  //   }
  // }

  function tallest(input: any) {
    if (input[1] <= handPose.current.thumb[3][1] && input[1] <= handPose.current.indexFinger[3][1] && input[1] <= handPose.current.middleFinger[3][1] && input[1] <= handPose.current.ringFinger[3][1] && input[1] <= handPose.current.pinky[3][1]) {
      return true;
    } else {
      return false;
    }
  }


  function action() {
    // this function will call things depending on the last gesture
    // console.log(lastGesture);
    if (lastGesture === "index") {
      // TODO: index action
      //  noImage = false;
      console.log("index action"); // image follows you around
    } else if (lastGesture === "thumb") {
      // Thumb action goes to next image
      if (imageIndex == imageArray.length - 1) {
        console.log("Already at last image")
      } else {
        setImageIndex(imageIndex + 1);
      }
      console.log("thumb action");
    } else if (lastGesture === "shaka") {
      // TODO: subhmx
      // noImage = !noImage;
      console.log("shaka action");
    }
    else if (lastGesture === "fist") {
      // noImage = !noImage;
      console.log("fist action");
    }
    else if (lastGesture === "pinky") {
      // pinky action goes to previous image
      console.log("pinky action");
      if (imageIndex == 0) {
        console.log("Already at first image")
      } else {
        setImageIndex(imageIndex - 1);
      }
    }
    // else if (lastGesture === "spiderMan"){
    //     noImage = !noImage;
    //     console.log("spiderMan action"); // flips an image on and off
    // }
    else {
      // NO ACTION
      //  console.log("no Action")
    }
    // console.log()
    // setLastGesture("middle");

  }


  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Edwiz | Dash</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>


      <main className="w-full">

        <Navbar />

        <div className="drawer drawer-mobile drawer-end">
          <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content px-10">

            <Sketch setup={setup} draw={draw} />;

            {/* PAGE CONTENT */}
            <label htmlFor="my-drawer-4" className="drawer-button btn btn-accent btn-sm">History</label>
            <label htmlFor="my-drawer-4" className="drawer-button btn btn-accent btn-sm">Search</label>


          </div>
          <div className="drawer-side border border-black">
            <label htmlFor="my-drawer-4" className="drawer-overlay"></label>
            <ul className="menu p-4 w-80 bg-gray-100 text-base-content">
              {/* Searchbox */}

              {/* as the user types something we hit the API and fetch the data, and show here */}

              <SearchBox></SearchBox>

              <div className='flex gap-2'>
                <button onClick={() => setCurrentMode('GIPHY')} className={`btn btn-sm lowercase btn-outline ${currentMode === 'GIPHY' && 'btn-active'}`}>GIFs 📸</button>
                <button onClick={() => setCurrentMode('LEXICA')} className={`btn btn-sm lowercase btn-outline ${currentMode === 'LEXICA' && 'btn-active'}`}>AI Gen 🪄</button>
              </div>


              <div className='py-4'>
                {/* <DrawerContent></DrawerContent> */}
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
