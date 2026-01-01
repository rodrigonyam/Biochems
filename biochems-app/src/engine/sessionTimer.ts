type TimerState = 'idle' | 'running' | 'paused' | 'completed'

type TimerSnapshot = {
  sessionId: string
  state: TimerState
  durationSeconds: number
  elapsedSeconds: number
  remainingSeconds: number
  lastUpdated: number
}

type TimerHook = (snapshot: TimerSnapshot) => void

type NetworkSyncHandler = (snapshot: TimerSnapshot) => Promise<void> | void

type TimerOptions = {
  sessionId: string
  durationSeconds: number
  tickIntervalMs?: number
  onTick?: TimerHook
  onStateChange?: TimerHook
  onDriftDetected?: (driftSeconds: number, snapshot: TimerSnapshot) => void
}

type TimerController = {
  start: () => void
  pause: () => void
  resume: () => void
  reset: (durationSeconds?: number) => void
  syncWithServer: (authoritativeElapsed: number) => void
  registerUiHook: (listener: TimerHook) => () => void
  registerNetworkHook: (handler: NetworkSyncHandler) => () => void
  getSnapshot: () => TimerSnapshot
}

const now = () => Date.now()

export const createSessionTimer = ({
  sessionId,
  durationSeconds,
  tickIntervalMs = 1000,
  onTick,
  onStateChange,
  onDriftDetected,
}: TimerOptions): TimerController => {
  let elapsedSeconds = 0
  let intervalHandle: number | null = null
  let state: TimerState = 'idle'
  let lastTick = now()

  const uiHooks = new Set<TimerHook>()
  const networkHooks = new Set<NetworkSyncHandler>()

  const emit = (snapshot: TimerSnapshot, opts?: { ui?: boolean; network?: boolean }) => {
    if (opts?.ui !== false) {
      uiHooks.forEach((listener) => listener(snapshot))
      onTick?.(snapshot)
    }
    if (opts?.network !== false) {
      networkHooks.forEach((handler) => handler(snapshot))
    }
  }

  const getSnapshot = (): TimerSnapshot => {
    const remainingSeconds = Math.max(durationSeconds - elapsedSeconds, 0)
    return {
      sessionId,
      state,
      durationSeconds,
      elapsedSeconds,
      remainingSeconds,
      lastUpdated: now(),
    }
  }

  const updateState = (nextState: TimerState) => {
    if (state === nextState) return
    state = nextState
    onStateChange?.(getSnapshot())
  }

  const tick = () => {
    const current = now()
    const delta = (current - lastTick) / 1000
    lastTick = current
    elapsedSeconds = Math.min(elapsedSeconds + delta, durationSeconds)
    emit(getSnapshot())
    if (elapsedSeconds >= durationSeconds) {
      stopInternal()
      updateState('completed')
    }
  }

  const startInternal = () => {
    if (intervalHandle !== null) return
    lastTick = now()
    intervalHandle = window.setInterval(tick, tickIntervalMs)
  }

  const stopInternal = () => {
    if (intervalHandle === null) return
    window.clearInterval(intervalHandle)
    intervalHandle = null
  }

  const controller: TimerController = {
    start: () => {
      if (state !== 'idle') return
      updateState('running')
      startInternal()
      emit(getSnapshot())
    },
    pause: () => {
      if (state !== 'running') return
      stopInternal()
      updateState('paused')
      emit(getSnapshot())
    },
    resume: () => {
      if (state !== 'paused') return
      updateState('running')
      startInternal()
      emit(getSnapshot())
    },
    reset: (nextDuration) => {
      stopInternal()
      durationSeconds = nextDuration ?? durationSeconds
      elapsedSeconds = 0
      updateState('idle')
      emit(getSnapshot())
    },
    syncWithServer: (authoritativeElapsed) => {
      const drift = authoritativeElapsed - elapsedSeconds
      elapsedSeconds = Math.min(Math.max(authoritativeElapsed, 0), durationSeconds)
      if (Math.abs(drift) > 1 && onDriftDetected) {
        onDriftDetected(drift, getSnapshot())
      }
      emit(getSnapshot(), { network: false })
    },
    registerUiHook: (listener) => {
      uiHooks.add(listener)
      return () => uiHooks.delete(listener)
    },
    registerNetworkHook: (handler) => {
      networkHooks.add(handler)
      return () => networkHooks.delete(handler)
    },
    getSnapshot,
  }

  if (onTick) uiHooks.add(onTick)
  return controller
}
