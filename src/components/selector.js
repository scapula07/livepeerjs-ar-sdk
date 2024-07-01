import React,{useState,useEffect} from 'react'


export default function Selector({
                            selected,
                            videoRef,
                            videoElement,
                            canvasRef,
                            img,
                            deepAR,
                            net,
                            opt
                                }) {
        let data
        const [bgImage,setImage]=useState("")
        const backgroundImage = new Image(480, 270);
        
    
        switch (selected) {
            case 'Virtual backgrounds':
            console.log('You selected apple.');
            const background = opt.find(item => item.mode === "BACKGROUND");
            data=background?.data
            break;
            case 'DeepAR filters':
            console.log('You selected banana.');
            const filters = opt.find(item => item.mode === "DEEPAR");
            data=filters?.data
            break;
    
            default:
            console.log('Unknown fruit.');
            const backgroundI = opt.find(item => item.mode === "BACKGROUND");
            data=backgroundI?.data
        }

        // useEffect(()=>{
        //   img=image
        // },[])
    
    
        const change=(src)=>{
            img=""
            switch (selected) {
                case 'Virtual backgrounds':
                console.log('You selected apple.');
                img=src
                startVirtualBackground(img)
                setImage(src)
                break;
                case 'DeepAR filters':
                console.log('You selected banana.');
                switchFilter(src?.mdl)
                setImage(src?.img)
                break;
        
                default:
                console.log('Unknown fruit.');
                data=backgrounds
            }
    
    
    
        }
                                
                                
        async function startVirtualBackground(img) {
                videoElement = videoRef.current;
                backgroundImage.src =img;
    
                
            try{
                async function updateCanvas() {
                    
                    const segmentation = await net.segmentPerson(videoElement, {
                    flipHorizontal: false, 
                    internalResolution: 'medium', 
                    segmentationThreshold: 0.7, 
                    maxDetections: 10,
                    scoreThreshold: 0.2, 
                    nmsRadius: 20, 
                    minKeypointScore: 0.3, 
                    refineSteps: 10, 
                    opacity:0.7
                    
                });
    
    
    
                const background = { r: 0, g: 0, b: 0, a: 0 };
                const mask = bodyPix.toMask(segmentation, background, { r: 0, g: 0, b: 0, a: 255 });
    
                
                
    
                const canvasElement = canvasRef.current; 
                canvasElement.width = videoElement.videoWidth;
                canvasElement.height = videoElement.videoHeight;
    
                const ctx = canvasElement?.getContext("2d")
                    
                const maskBlurAmount = 5; 
                const opacity = 0.5; 
    
                if (mask) {
                        
                    ctx.putImageData(mask, 0, 0);
                    ctx.globalCompositeOperation = 'source-in';
    
                    
                    if (backgroundImage.complete) {
                        ctx.drawImage(backgroundImage, 0, 0, canvasElement.width, canvasElement.height);
                    } else {
                        
                        backgroundImage.onload = () => {
                            ctx.drawImage(backgroundImage, 0, 0, canvasElement.width, canvasElement.height);
                        };
                    }
    
                    
                    ctx.globalCompositeOperation = 'destination-over';
                    ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
                    ctx.globalCompositeOperation = 'source-over';
    
                    const stream = canvasElement.captureStream(30); 
                    console.log(stream,"Canvas")
    
                    
                    await new Promise((resolve) => setTimeout(resolve, 100));
    
                    
                }
                requestAnimationFrame(updateCanvas);
    
                }
                updateCanvas();
    
            }catch(e){
                console.log(e)
            }
            }
    
    
    
            const switchFilter=async(mdl)=>{
                try{
                    await deepAR.switchEffect(mdl);
                }catch(e){
                    console.log(e)
                }
            }
                                     
                                      
                                    
                                  
    return(
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
            rowGap: '1.5rem'  
            }}
        >
                {data?.map((src)=>{
                        return(
                    <div 
                        style={{
                            border: bgImage === src || bgImage === src?.img ? '2px solid green' : '1px solid white',
                            padding: bgImage === src || bgImage === src?.img ? '0.25rem' : '0.125rem',
                            borderRadius: '0.375rem',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '100%'
                        }}
                        onClick={()=>change(src)}
                        
                        >
                            {src?.img?.length != undefined?
                                    <img 
                                        src={src?.img}
                                        style={{
                                        height: '2.25rem',    
                                        width: '2rem',       
                                        borderRadius: '50%'   
                                        }}
                                    />
                                    :
                                    <img 
                                        src={src}
                                        style={{
                                        height: img === src ? '1.5rem' : '2.5rem', 
                                        width: img === src ? '1.5rem' : 'auto',    
                                        borderRadius: img === src ? '50%' : '0' 
                                        }}
                                    />
    
        
                                    }
                        
                        
                        
    
                        </div>
                        )
                    })
    
                }
    
    </div>
  )
}
