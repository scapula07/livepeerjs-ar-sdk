import React,{useRef,useEffect,useState} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {BroadcastAR} from 'livepeerjs-player-filters'
import * as Broadcast from "@livepeer/react/broadcast";
import { getIngest } from "@livepeer/react/external";
import { EnableVideoIcon, StopIcon } from "@livepeer/react/assets";
import { useBroadcastContext, useStore } from "@livepeer/react/broadcast";
import { backgrounds } from './data/backgrounds';
import {filters} from "./data/filters"

function App() {
  const [count, setCount] = useState(0)
  const videoRef = useRef(null);
  const [isSelect,setisSelected]=useState("")


  const opt=[
      {
        mode:"BACKGROUND",
        data:backgrounds
      },
     {
       mode:"FACE",
       data:backgrounds
      },
      {
        mode:"DEEPAR",
        data:filters,
        liscence_key:""

      }
   ]

  return (
    <div className='w-full h-screen'>
          <BroadcastAR
               videoRef={videoRef}
               isSelect={isSelect}
               setisSelected={setisSelected}
               opt={opt}
               className="w-1/2 h-full"
             >
                  <Broadcast.Root ingestUrl={getIngest("1606-8tzu-37cl-1wsj")}>
                          <Broadcast.Container className='w-full'>
                          
                                  <Broadcast.Video
                                      title="Livestream"
                                      style={{ height: "100%", width: "100%" }}
                                      className={isSelect?.length>0?"hidden":"relative "}
                                      ref={videoRef} 
                                      
                                      
                                  />
                            </Broadcast.Container>
                      </Broadcast.Root>
              
          </BroadcastAR>
    </div>
  )
}

export default App
