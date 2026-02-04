
import SkeletonArticle from './SkeletonArticle';
import SkeletonLine from './SkeletonLine';
import SkeletonBody from './SkeletonBody';
import SkeletonHeading from './SkeletonHeading';
import SkeletonFooter from './SkeletonFooter';

export default function Skeleton({type}: {type?: 'article' | 'line' | 'body' | 'heading' | 'footer' | any}) {
  switch(type) {
    case 'article':
      return <SkeletonArticle />;
    case 'line':
      return <SkeletonLine />;
    case 'body':
      return <SkeletonBody />;
    case 'heading':
      return <SkeletonHeading />;
    case 'footer':
      return <SkeletonFooter />;
    default:
      return <SkeletonLine />;
  }
}
