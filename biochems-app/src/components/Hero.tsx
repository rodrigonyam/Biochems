import type { FC } from 'react'

export type HeroProps = {
  nextExamDate: string
  focusBlock: string
  objective: string
}

const Hero: FC<HeroProps> = ({ nextExamDate, focusBlock, objective }) => {
  const examDate = new Date(nextExamDate)
  const msInDay = 1000 * 60 * 60 * 24
  const daysRemaining = Math.max(0, Math.ceil((examDate.getTime() - Date.now()) / msInDay))
  const dateLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
  }).format(examDate)

  return (
    <header className="hero">
      <p className="hero__eyebrow">Biomedical Sciences • Exam sprint</p>
      <h1>Curated prep for the systems-integration practical</h1>
      <p className="hero__objective">{objective}</p>

      <div className="hero__meta">
        <div>
          <span className="hero__meta-label">Focus block</span>
          <p className="hero__meta-value">{focusBlock}</p>
        </div>
        <div>
          <span className="hero__meta-label">Next checkpoint</span>
          <p className="hero__meta-value">{dateLabel}</p>
        </div>
        <div>
          <span className="hero__meta-label">Days remaining</span>
          <p className="hero__meta-value hero__meta-value--accent">{daysRemaining}</p>
        </div>
      </div>

      <div className="hero__cta">
        <button className="btn btn--primary">Launch adaptive quiz</button>
        <button className="btn btn--ghost">Download study brief</button>
      </div>
    </header>
  )
}

export default Hero
