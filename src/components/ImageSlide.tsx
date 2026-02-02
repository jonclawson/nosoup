import { useState } from "react";
import ImageField from "./ImageField";
import styles from './ImageSlide.module.css'
import Image from "next/image";

export default function ImageSlide({ images, layout }: { images: any[], layout?: string }) {
  const [imageMain, setImage] = useState(images[0] || null);
  const [loaded, setLoaded] = useState(false);
  const swapImage = (index: number) => {
    if (images.length > 1) {
      setImage(images[index]);
    }
  }


  return <>
      {(images && images.length > 0) && (   
        <div className={styles['image-slide'] + ' ' + (layout ? styles['image-slide--' + layout] : '') + ' ' + (loaded ? styles['image-slide--loaded'] : '')}>
          <div className={styles['image-slide__image-container'] + ' ' + styles['image-slide__image-container--main']}>
            <ImageField
              key={imageMain.value}
              src={imageMain.value}
              onLoad={() => setLoaded(true)}
              alt=""
              className={styles['image-slide__image'] + ' ' + styles['image-slide__image--main']}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          {images.length > 1 && (
          <div className={styles['image-slide--container-thumbs']}>
          {images.map((image, index) => (
            <div className={styles['image-slide__image-container'] + ' ' + styles['image-slide__image-container--' + index]} key={index}>
                <Image
                  key={image.value}
                  src={image.value}
                  onLoad={() => setLoaded(true)}
                  alt=""
                  className={styles['image-slide__image'] + ' ' + styles['image-slide__image--' + index]}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onClick={() => swapImage(index)}
                  fill={true}
                  // {...(layout === 'landscape' ? { fill: true } : {})}
                  // {...(layout === 'landscape' 
                  //   ? { }
                  //   : { width: 100, height: 100}
                  // )}   
                />
              </div>
            ))}
          </div>
          )}
        </div>
        )}
    </>
}