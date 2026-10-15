import { motion } from 'framer-motion'
import DetailSidebar from '../layout/DetailSidebar'
import Breadcrumb from '../layout/Breadcrumb'
import AdjacentNav from './AdjacentNav'
import { PAGE_ENTER } from '../../lib/motion'

// Frame shared by every section's detail page: sidebar on the left, then the
// breadcrumb, the page content, and previous/next links.
export default function DetailPageLayout({
  sidebarGroups,
  sidebarTitle,
  activeId,
  breadcrumb,
  prevItem,
  nextItem,
  basePath,
  contentClassName = 'space-y-8',
  children,
}) {
  return (
    <div className="lg:flex lg:items-start lg:gap-8">
      <DetailSidebar groups={sidebarGroups} activeId={activeId} title={sidebarTitle} />
      <motion.div {...PAGE_ENTER} className={`flex-1 min-w-0 ${contentClassName}`}>
        <Breadcrumb trail={breadcrumb} />
        {children}
        <AdjacentNav prevItem={prevItem} nextItem={nextItem} basePath={basePath} />
      </motion.div>
    </div>
  )
}
