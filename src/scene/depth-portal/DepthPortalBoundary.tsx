import { Component, Suspense, useCallback, useEffect, type ErrorInfo, type ReactNode } from 'react'
import { useExperienceStore } from '../../store/experienceStore'
import { getDepthPortalConfig } from '../../signals/signalData'
import { preloadDepthPortalAssets } from './DepthPortalAssets'

interface ErrorBoundaryProps {
  children: ReactNode
  onError?: () => void
}

interface ErrorBoundaryState {
  failed: boolean
}

class PortalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Depth portal rendering failed', error, info)
    this.props.onError?.()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

export function DepthPortalPreloader() {
  const selectedSignalId = useExperienceStore((store) => store.selectedSignalId)
  const config = getDepthPortalConfig(selectedSignalId)

  useEffect(() => {
    if (config) preloadDepthPortalAssets(config.assetId)
  }, [config])

  return null
}

export function DepthPortalBoundary({ children, onError }: ErrorBoundaryProps) {
  const selectedSignalId = useExperienceStore((store) => store.selectedSignalId)
  const stage = useExperienceStore((store) => store.stage)
  const visualStatus = useExperienceStore((store) => store.observationVisualStatus)
  const setVisualStatus = useExperienceStore((store) => store.setObservationVisualStatus)
  const config = getDepthPortalConfig(selectedSignalId)
  const handleError = useCallback(() => {
    setVisualStatus('fallback')
    onError?.()
  }, [onError, setVisualStatus])

  useEffect(() => {
    if (!config || stage !== 'observation' || visualStatus !== 'loading') return
    const timeout = window.setTimeout(() => setVisualStatus('fallback'), 1_500)
    return () => window.clearTimeout(timeout)
  }, [config, setVisualStatus, stage, visualStatus])

  return (
    <PortalErrorBoundary key={`${selectedSignalId ?? 'no-signal'}-${visualStatus}`} onError={handleError}>
      <Suspense fallback={null}>{children}</Suspense>
    </PortalErrorBoundary>
  )
}
