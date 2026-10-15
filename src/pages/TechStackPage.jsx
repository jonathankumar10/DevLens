import { useParams, Navigate } from 'react-router-dom'
import { TECH_STACK_ITEMS, TECH_STACK_COLORS, TECH_STACK_CATEGORY_LABELS } from '../constants/techStackRegistry'
import { NAV_SECTIONS } from '../constants/sections'
import DetailPageLayout from '../components/detail/DetailPageLayout'
import DetailHero from '../components/detail/DetailHero'
import { InfoPanel, HeaderPanel, NumberedList, BulletList, Badge } from '../components/detail/Panels'
import { groupByCategory } from '../lib/groupByCategory'
import { findWithNeighbors } from '../lib/findWithNeighbors'

const BASE_PATH = '/tech-stack'
const SIDEBAR_GROUPS = groupByCategory(TECH_STACK_ITEMS, TECH_STACK_CATEGORY_LABELS, BASE_PATH)

export default function TechStackPage() {
  const { id } = useParams()
  const { item, prevItem, nextItem } = findWithNeighbors(TECH_STACK_ITEMS, id)

  if (!item) return <Navigate to={BASE_PATH} replace />

  const palette = TECH_STACK_COLORS[item.color]

  return (
    <DetailPageLayout
      sidebarGroups={SIDEBAR_GROUPS}
      sidebarTitle="Tech Stack"
      activeId={item.id}
      breadcrumb={[{ label: 'Home', to: '/' }, NAV_SECTIONS.techStack, { label: item.title }]}
      prevItem={prevItem}
      nextItem={nextItem}
      basePath={BASE_PATH}
    >
      <DetailHero
        title={item.title}
        tagline={item.tagline}
        description={item.description}
        palette={palette}
        badges={
          <Badge className={`${palette.badgeBg} ${palette.badgeBorder} ${palette.text}`}>
            {TECH_STACK_CATEGORY_LABELS[item.category]}
          </Badge>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-5">
          <InfoPanel title="How it works">
            <NumberedList items={item.howItWorks} palette={palette} />
          </InfoPanel>
          <InfoPanel title="Interview angles">
            <BulletList items={item.interviewAngles} marker="?" markerClassName={`font-bold ${palette.text}`} />
          </InfoPanel>
        </div>

        <div className="lg:sticky lg:top-20 space-y-5">
          <HeaderPanel title="Inferences & key learnings" palette={palette}>
            <div className="p-5">
              <BulletList items={item.keyLearnings} markerClassName={palette.text} />
            </div>
          </HeaderPanel>
        </div>
      </div>
    </DetailPageLayout>
  )
}
