import Image from "next/image";
import { useState } from "react";

export default function ImageField({ ...props }: React.ComponentProps<typeof Image>) {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  return  <Image 
            {...props}
            alt="" 
            placeholder={props.placeholder || "blur"}
            blurDataURL="/placeholder.png"
            loading="lazy"
            className={`transition-opacity ${dimensions.width != 0 ? props.className : 'opacity-0'}`}
            {...(dimensions.width === 0 
              ? { 
                width: props.width || 300, height: props.height || 300,
                onLoadingComplete: (img) => setDimensions({ width: img.naturalWidth, height: img.naturalHeight }) 
              }
              : { width: dimensions.width, height: dimensions.height }
            )}                          
          />
}