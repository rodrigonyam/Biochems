import type { FC } from 'react'
import type { ModuleDefinition } from '../types/study'

type ModuleGridProps = {
  modules: ModuleDefinition[]
}

const ModuleGrid: FC<ModuleGridProps> = ({ modules }) => (
  <div className="module-grid">
    {modules.map((module) => (
      <article className="module-card" key={module.id}>
        <div className="module-card__header">
          <span className={`pill pill--${module.difficulty === 'Advanced' ? 'amber' : 'teal'}`}>
            {module.difficulty}
          </span>
          <span className="module-card__hours">{module.hoursPlanned} hrs planned</span>
        </div>
        <h3>{module.title}</h3>
        <p className="module-card__summary">{module.summary}</p>
        <div className="module-card__lists">
          <div>
            <p className="module-card__label">Focus threads</p>
            <ul>
              {module.focusAreas.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="module-card__label">Lab skills</p>
            <ul>
              {module.labSkills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="module-card__footer">
          <span>{module.upcomingCheck}</span>
          <p>{module.callout}</p>
        </div>
      </article>
    ))}
  </div>
)

export default ModuleGrid
