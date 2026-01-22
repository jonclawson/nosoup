import styles from './ArticleFields.module.css' 

export default function LinkField({ field }: { field: any }) {
    try {
      const linkData = JSON.parse(field.value || '{}');
      if (linkData.url) {
        return <a href={linkData.url} >{linkData.title || linkData.url}</a>
      }
    } catch (e) {
      return <a href={field.value} >{field.value}</a>
    }
}