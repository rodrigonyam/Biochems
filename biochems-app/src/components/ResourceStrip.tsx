import type { FC } from 'react'
import type { ResourceLink } from '../types/study'

type ResourceStripProps = {
  resources: ResourceLink[]
}

const ResourceStrip: FC<ResourceStripProps> = ({ resources }) => (
  <div className="resource-strip">
    {resources.map((resource) => (
      <a className="resource-card" href={resource.url} key={resource.label}>
        <p className="resource-card__label">{resource.label}</p>
        <p className="resource-card__description">{resource.description}</p>
      </a>
    ))}
  </div>
)

export default ResourceStrip
