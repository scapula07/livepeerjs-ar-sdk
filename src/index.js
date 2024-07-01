import React,{useRef,useEffect,useState} from 'react'
import styles from './styles.module.css'
import {RiArrowRightWideFill,RiArrowLeftWideFill} from "react-icons/ri";
import { TbBackground } from "react-icons/tb";
import { MdFace } from "react-icons/md";
import { FaMasksTheater } from "react-icons/fa6";
import { ClipLoader } from 'react-spinners';
import * as deepar from 'deepar';
import { PiVirtualRealityFill } from "react-icons/pi";
import  './output.css'
import  './index.css'
import { livepeerAR } from './lib';
import Selector from './components/selector';
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

async function loadScriptsSequentially(scripts) {
  for (const script of scripts) {
    try {
      await loadScript(script);
    } catch (error) {
      console.error(error);
      break; // Stop loading if any script fails
    }
  }
}

const scripts = [
  'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs/dist/tf.min.js',
  'https://cdn.jsdelivr.net/npm/@tensorflow-models/body-pix/dist/body-pix.min.js',
  'https://cdn.tailwindcss.com'
  // Add more scripts here as needed
];

loadScriptsSequentially(scripts).then(() => {
  console.log(bodyPix, "pix");
  // Your code that depends on the scripts being loaded
}).catch((error) => {
  console.error('Error loading scripts:', error);
});


let net=null
let img=""
let deepAR;
let faceLandmarker;
let lastVideoTime = -1;
let blendshapes = [];
let rotation;
let headMesh= [];

const options = {
  baseOptions: {
    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
    delegate: "GPU"
  },
  numFaces: 1,
  runningMode: "VIDEO",
  outputFaceBlendshapes: true,
  outputFacialTransformationMatrixes: true,
};

const styleCollapsed = {
  position: 'absolute',
  backgroundColor: 'rgb(148 163 184)',
  opacity: 0.5,
  borderTopRightRadius: '1rem',
  borderBottomRightRadius: '1rem',
  width: '1.5rem',
  height: '5rem',
  top: 0,
  paddingTop: '0.125rem',
  paddingBottom: '0.125rem'
};

const styleExpanded = {
  position: 'absolute',
  backgroundColor: 'rgb(148 163 184)',
  opacity: 0.5,
  width: '3.5rem',
  height: '60%',
  top: 0,
  paddingTop: '0.5rem',
  paddingBottom: '0.5rem',
  overflowY: 'hidden'
};


export const BroadcastAR = ({ 
              children,
              videoRef,
              opt,
              className,
              isSelect,
              setisSelected
            }) => {


          const optModes = opt.map(optItem => optItem.mode);
          var videoElement  = videoRef.current;
         
          console.log(videoRef.current,"Curr")

          const canvasRef = useRef(null);
          const [isLoading,setLoading]=useState(true)
          const [isCollapse,setCollapseTab]=useState(true)
          const [selectVr,setSelectedVr]=useState("")


          async function setUpBodyPix() {
               setLoading(true)
           try{
                net =  await livepeerAR.setupBodyPix()
                setLoading(false)
            }catch(e){

             console.log(e)
             setLoading(false)
             setisSelected("")
            //  toast.error("Error loading model",{duration:3000})
            }

          }   

          const setUpDeeepAr=async()=>{
               setLoading(true)
               const item = opt.find(item => item.mode === "DEEPAR");
            try{
                deepAR = await livepeerAR.setUpDeeepAr(item?.liscence_key,canvasRef)
               
                setLoading(false)
            }catch(e){
                console.log(e)
                setLoading(false)
                setisSelected("")
                // toast.error("Error loading model",{duration:3000})
            }
        
        
         }
  return (
    <div  style={{width:"50%",position:"relative"}}>
         
            {children}

           <canvas id="canvas"  ref={canvasRef}  
            style={{
              position: 'absolute',
              top: '0',
              width: '100%',
              height: '100%',
              zIndex: '-10'
            }}
            >

         </canvas>
          <div 
                style={isCollapse
                  ? {
                      position: 'absolute',
                      backgroundColor: 'rgba(148, 163, 184, 0.5)',
                      borderTopRightRadius: '1rem',
                      borderBottomRightRadius: '1rem',
                      width: '1.5rem',
                      height: '5rem',
                      top: '0',
                      paddingTop: '0.125rem',
                      paddingBottom: '0.125rem'
                    }
                  : {
                      position: 'absolute',
                      backgroundColor: 'rgba(148, 163, 184, 0.5)',
                      width: '3.5rem',
                      height: '100%',
                      top: '0',
                      paddingTop: '0.5rem',
                      paddingBottom: '0.5rem',
                      overflowY: 'hidden'
                    }
                }
              
           >
                  <h5 
                       style={isCollapse
                        ? {
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            height: '100%'
                          }
                        : {
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'flex-end'
                          }
                      }
                    
                  >
                        {isCollapse?
                            <RiArrowRightWideFill
                          
                                onClick={()=>setCollapseTab(false)}
                                data-tooltip-id="my-tooltip-1"
                                style={{
                                   color: 'white',
                                  fontWeight: '600',
                                  fontSize: '2rem',  
                                  lineHeight: '2.5rem'
                                }}
                                />
                                :
                              
                              <RiArrowLeftWideFill
                              
                                  onClick={()=>isSelect?.length >0 ?setisSelected(""):setCollapseTab(true)}
                                  style={{
                                    color: 'white',
                                   fontWeight: '600',
                                   fontSize: '2rem',  
                                   lineHeight: '2.5rem'
                                 }}
                                  />
                            
                              
                        }
                    
                   </h5>

                          {!isCollapse&&isSelect?.length ===0&&
                                    <div
                                       style={{
                                        width: '100%',
                                        height: '100%',
                                        paddingTop: '1rem',
                                        paddingBottom: '1rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        overflowY: 'scroll',
                                        paddingLeft: '0.5rem',
                                        paddingRight: '0.5rem',
                                        rowGap:'1rem'
                                      }}
                                  
                                      
                                      >
                                        {
                                            [  
                                            {
                                                icon:<TbBackground />,
                                                title: "Virtual backgrounds",
                                                mode:"BACKGROUND",
                                                click:()=>setUpBodyPix()
                                                

                                            },
                                            {
                                                icon:<PiVirtualRealityFill 
                                                        style={{color:"blue"}} 
                                                       />,
                                                title: "DeepAR filters",
                                                mode:"DEEPAR",
                                                click:()=>setUpDeeepAr()

                                            },
                                            {
                                                icon:<FaMasksTheater />,
                                                title:"Mask filters",
                                                mode:"FACE",
                                                click:()=>{}

                                            },
                                            {
                                                icon:<MdFace  />,
                                                title:"Faceless streaming",
                                                mode:"FACE",
                                                click:()=>{}

                                            },

                                            
                                        
                                                

                                            ]?.filter(item => optModes.includes(item?.mode))?.map((tab)=>{
                                                return(
                                                <div 
                                                    style={{
                                                      borderWidth: '1px',
                                                      borderColor: 'white',
                                                      padding: '0.375rem',
                                                      borderRadius: '0.5rem',
                                                      display: 'flex',
                                                      justifyContent: 'center',
                                                      alignItems: 'center',
                                                      width: '100%'
                                                    }}
                                                    data-tooltip-id={tab?.title}
                                                    onMouseOver={()=>setSelectedVr(tab?.title)}
                                                    onMouseOut={()=>setSelectedVr("")}
                                                    
                                                    >
                                                    <h5 
                                                      style={{
                                                        fontSize: '1.25rem',
                                                        color: 'white'
                                                      }}
                                                      onClick={()=>setisSelected(tab?.title) ||tab?.click()}
                                                    >
                                                       {tab?.icon}

                                                    </h5>
                                                

                                                </div>
                                                )
                                            })

                                        }

                                    </div>
                                    }


                                 {!isCollapse&&isSelect?.length >0&&
                                        <div>
                                               {!isLoading?
                                                   
                                                    <div>
                                                      {["Virtual backgrounds","DeepAR filters","Mask filters"]?.includes(isSelect)?
                                                          <Selector
                                                             selected={isSelect}
                                                             videoElement={videoElement}
                                                             videoRef={videoRef}
                                                             canvasRef={ canvasRef }
                                                             opt={opt}
                                                             img={img}
                                                             net={net}
                                                             deepAR={deepAR}   
                                                          />
                                                          :
                                                          <div>
                                                          </div>
                                                        }
                                                      
                                                     </div>
                                              
                                                     :
                                                    <div className='w-full flex justify-center py-2'>
                                                        <ClipLoader color='white' size={10}/>
                                                   </div>
                                                

                                               } 
                                        </div>
                                      
                         
                                    }
                </div>
            </div>
  )

}



//   const Selector=({selected,videoRef,videoElement,canvasRef,opt })=>{
//     let data
//     const [bgImage,setImage]=useState("")
//     const backgroundImage = new Image(480, 270);
  

//    switch (selected) {
//       case 'Virtual backgrounds':
//         console.log('You selected apple.');
//         const background = opt.find(item => item.mode === "BACKGROUND");
//         data=background?.data
//         break;
//       case 'DeepAR filters':
//         console.log('You selected banana.');
//         const filters = opt.find(item => item.mode === "DEEPAR");
//         data=filters?.data
//         break;

//       default:
//         console.log('Unknown fruit.');
//         const backgroundI = opt.find(item => item.mode === "BACKGROUND");
//         data=backgroundI?.data
//     }

//     // useEffect(()=>{
//     //   img=image
//     // },[])


//     const change=(src)=>{
//       img=""
//        switch (selected) {
//           case 'Virtual backgrounds':
//             console.log('You selected apple.');
//             img=src
//             startVirtualBackground(img)
//             setImage(src)
//             break;
//           case 'DeepAR filters':
//             console.log('You selected banana.');
//             switchFilter(src?.mdl)
//             setImage(src?.img)
//             break;
    
//           default:
//             console.log('Unknown fruit.');
//             data=backgrounds
//         }



//     }


//     async function startVirtualBackground(img) {
//           videoElement = videoRef.current;
//           backgroundImage.src =img;

          
//       try{
//           async function updateCanvas() {
              
//               const segmentation = await net.segmentPerson(videoElement, {
//                 flipHorizontal: false, 
//                 internalResolution: 'medium', 
//                 segmentationThreshold: 0.7, 
//                 maxDetections: 10,
//                 scoreThreshold: 0.2, 
//                 nmsRadius: 20, 
//                 minKeypointScore: 0.3, 
//                 refineSteps: 10, 
//                 opacity:0.7
                
//             });



//             const background = { r: 0, g: 0, b: 0, a: 0 };
//             const mask = bodyPix.toMask(segmentation, background, { r: 0, g: 0, b: 0, a: 255 });

            
         

//             const canvasElement = canvasRef.current; 
//             canvasElement.width = videoElement.videoWidth;
//             canvasElement.height = videoElement.videoHeight;

//             const ctx = canvasElement?.getContext("2d")
             
//             const maskBlurAmount = 5; 
//             const opacity = 0.5; 

//             if (mask) {
                  
//                 ctx.putImageData(mask, 0, 0);
//                 ctx.globalCompositeOperation = 'source-in';

             
//                 if (backgroundImage.complete) {
//                     ctx.drawImage(backgroundImage, 0, 0, canvasElement.width, canvasElement.height);
//                 } else {
                  
//                     backgroundImage.onload = () => {
//                         ctx.drawImage(backgroundImage, 0, 0, canvasElement.width, canvasElement.height);
//                     };
//                 }

               
//                 ctx.globalCompositeOperation = 'destination-over';
//                 ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
//                 ctx.globalCompositeOperation = 'source-over';

//                 const stream = canvasElement.captureStream(30); 
//                 console.log(stream,"Canvas")

             
//                 await new Promise((resolve) => setTimeout(resolve, 100));

              
//             }
//             requestAnimationFrame(updateCanvas);

//             }
//             updateCanvas();

//       }catch(e){
//           console.log(e)
//       }
//      }



//      const switchFilter=async(mdl)=>{
//           try{
//               await deepAR.switchEffect(mdl);
//           }catch(e){
//               console.log(e)
//           }
//      }
     
      
    
  
// return(
//   <div 
//       style={{
//         width: '100%',
//         height: '100%',
//         paddingTop: '1rem',
//         paddingBottom: '1rem',
//         display: 'flex',
//         flexDirection: 'column',
//         overflowY: 'scroll',
//         paddingLeft: '0.5rem',
//         paddingRight: '0.5rem',
//         rowGap: '1.5rem'  
//       }}
//    >
//           {data?.map((src)=>{
//                   return(
//                <div 
//                     style={{
//                       border: bgImage === src || bgImage === src?.img ? '2px solid green' : '1px solid white',
//                       padding: bgImage === src || bgImage === src?.img ? '0.25rem' : '0.125rem',
//                       borderRadius: '0.375rem',
//                       display: 'flex',
//                       justifyContent: 'center',
//                       alignItems: 'center',
//                       width: '100%'
//                     }}
//                    onClick={()=>change(src)}
                  
//                   >
//                       {src?.img?.length != undefined?
//                               <img 
//                                  src={src?.img}
//                                   style={{
//                                     height: '2.25rem',    
//                                     width: '2rem',       
//                                     borderRadius: '50%'   
//                                   }}
//                               />
//                               :
//                               <img 
//                                   src={src}
//                                   style={{
//                                     height: img === src ? '1.5rem' : '2.5rem', 
//                                     width: img === src ? '1.5rem' : 'auto',    
//                                     borderRadius: img === src ? '50%' : '0' 
//                                    }}
//                               />

    
//                               }
                 
                  
                  

//                   </div>
//                   )
//               })

//           }

// </div>
// )
// }