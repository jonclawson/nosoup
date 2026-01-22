'use client'
import type { Article, Field, Author } from '@/lib/types'
import Dompurify from './Dompurify';
import styles from './ArticleFields.module.css' 
import ImageField from './ImageField';
import ImageSlide from './ImageSlide';
import CodeField from './CodeField';
import LinkField from './LinkField';

export default function ArticleFields({ article }: { article: Article | null }) {

  const images = article?.fields ? article.fields.filter((field) => field.type === 'image') : [];
  const otherFields = article?.fields ? article.fields.filter((field) => field.type !== 'image') : [];

  return  <>
            {images.length > 0 && <div className={`${styles['article-fields__field']} ${styles['article-fields__field--image']}`}>
              <ImageSlide images={images} />
            </div>}
            {otherFields && otherFields.length > 0 && otherFields.map((field) => (
              <div key={field.id} className={`${styles['article-fields__field']} ${styles['article-fields__field--' + field.type]}`}>
                {
                    (() => {
                    switch (field.type) {
                      case 'image':
                        return field.value && <div className={styles['article-fields__image-container']}>
                          <ImageField
                            src={field.value}
                            alt=""
                            className={styles['article-fields__image']}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                      case 'code':
                        return <div className={styles['article-fields__code']}>
                          <CodeField article={article as any} field={field} />
                        </div>
                      case 'link':
                        return <div className={styles['article-fields__link']}>
                                <LinkField field={field} />
                              </div>;
                      default:
                        return ''
                  }
                })()
              }
              </div>
            ))}
        </>;
}