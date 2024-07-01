import * as deepar from 'deepar';

export const livepeerAR= {
    setupBodyPix:async function () {
           try{
            const net = await bodyPix.load({
                architecture: 'MobileNetV1',
                outputStride: 16, 
                multiplier: 0.75, 
                quantBytes: 2,
                });

                return net

            }catch(e){
             throw new Error(e)  
            }

     },
     setUpDeeepAr:async function (liscence_key,canvasRef) {
        try{

           const deepAR = await deepar.initialize({
                licenseKey:liscence_key, 
                canvas:canvasRef.current,
                effect: 'https://cdn.jsdelivr.net/npm/deepar/effects/aviators' 
             });
             return deepAR

         }catch(e){
            throw new Error(e)  
         }

     }

 }