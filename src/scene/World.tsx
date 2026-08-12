import { Suspense } from 'react'
import { Environment } from './Environment'
import { House } from './House'
import { ObservationLayer } from './ObservationLayer'

export function World() {
  return (
    <>
      <Environment />
      <House />
      <Suspense fallback={null}>
        <ObservationLayer />
      </Suspense>
    </>
  )
}
