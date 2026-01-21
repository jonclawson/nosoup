import { useState } from "react";
import ImageField from "./ImageField";
import styles from './ImageSlide.module.css'

export default function ImageSlide({ images }: { images: any[] }) {
  const [imageState, setImages] = useState(images || []);
  const [loaded, setLoaded] = useState(false);
  const swapImage = (index: number) => {
    if (imageState.length > 1) {
      const newImages = [...imageState];
      newImages[index] = imageState[0];
      newImages[0] = imageState[index];
      setImages(newImages);
    }
  }


  return <>
      {(imageState && imageState.length > 0) ? (   
        <div className={styles['image-slide']}>
        {imageState.map((image, index) => (
          <div className={styles['image-slide__image-container'] + ' ' + styles['image-slide__image-container--' + index]} key={index}>
                <ImageField
                  key={image.value}
                  src={image.value}
                  onLoad={() => setLoaded(true)}
                  alt=""
                  className={styles['image-slide__image'] + ' ' + styles['image-slide__image--' + index]}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onClick={() => swapImage(index)}
                />
              </div>
          ))}
        </div>
        ) : ''}
    </>
}