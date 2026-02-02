'use client';
import { handleDownload } from "@/lib/handle-downloads";
import ArticleFields from "./ArticleFields";
import ArticleTags from "./ArticleTags";
import Dompurify from "./Dompurify";
import type { Article } from "@/lib/types";
import styles from './ArticleView.module.css'
import ImageSlide from "./ImageSlide";
import CodeField from "./CodeField";
import LinkField from "./LinkField";

export default function ArticleView({article}: { article: Article }) {
  if (!article) {
    return <></>;
  }
  const images = article.fields ? article.fields.filter((field) => field.type === 'image') : [];
  const codeFields = article.fields ? article.fields.filter((field) => field.type === 'code') : [];
  const linkFields = article.fields ? article.fields.filter((field) => field.type === 'link') : [];
  return (
          <article className={`${styles['article__container']} ${article?.published ? styles['article__container--published'] : styles['article__container--draft']}`}>
            <div className={styles['article__header']}>
              {images.length > 0 && (
                <div className={styles['article__header-images']}>
                  <ImageSlide images={images} layout="landscape" />
                </div>
              )}
              <h1 className={styles['article__title']}>
                {article?.title}
              </h1>
              <div className={styles['article__meta']}>
                <span>By {article?.author?.name}</span>
                <span className={styles['article__meta__dot']}>•</span>
                <span>{new Date(article?.createdAt || '').toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className={styles['article__divider']}>
              <div className={styles['article__body-container']}>
                <div className={styles['article__body']} onClick={handleDownload}>
                  <Dompurify html={article?.body || ''} />
                </div>
                {codeFields.length > 0 && 
                <div className={styles['article__code-container']}>
                  {codeFields.map((field) => (
                    <div key={field.id} className={styles['article__code-field']}>
                      <CodeField article={article as any} field={field} />
                    </div>
                  ))}
                </div>
                }
              </div>
              {linkFields.length > 0 && 
              <div className={styles['article__link-container']}>
                {linkFields.map((field) => (
                  <div key={field.id} className={styles['article__link-field']}>
                    <LinkField field={field} />
                  </div>
                ))}
              </div>
              }
              <ArticleTags article={article} />
            </div>
          </article>
  )
}