import { useState } from 'react'
import type { FC } from 'react'
import type { Flashcard } from '../types/study'

type FlashcardCarouselProps = {
  flashcards: Flashcard[]
}

const FlashcardCarousel: FC<FlashcardCarouselProps> = ({ flashcards }) => {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  if (flashcards.length === 0) {
    return <div className="flashcard">Upload flashcards to begin.</div>
  }

  const current = flashcards[index]

  const cycle = (direction: 1 | -1) => {
    const nextIndex = (index + direction + flashcards.length) % flashcards.length
    setIndex(nextIndex)
    setFlipped(false)
  }

  return (
    <div className="flashcards">
      <div
        className={`flashcard ${flipped ? 'flashcard--flipped' : ''}`}
        onClick={() => setFlipped((prev) => !prev)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setFlipped((prev) => !prev)
          }
        }}
        role="button"
        tabIndex={0}
      >
        {flipped ? (
          <div>
            <p className="flashcard__label">Answer</p>
            <p className="flashcard__text">{current.back}</p>
          </div>
        ) : (
          <div>
            <p className="flashcard__label">Prompt</p>
            <p className="flashcard__text">{current.front}</p>
            {current.hint && <span className="flashcard__hint">Hint · {current.hint}</span>}
          </div>
        )}
      </div>
      <div className="flashcards__controls">
        <button className="btn btn--ghost" onClick={() => cycle(-1)}>
          Prev
        </button>
        <p>
          Card {index + 1} / {flashcards.length}
        </p>
        <button className="btn btn--ghost" onClick={() => cycle(1)}>
          Next
        </button>
      </div>
    </div>
  )
}

export default FlashcardCarousel
