let suppressNextSignalTap = false

export const suppressSignalTap = () => {
  suppressNextSignalTap = true
}

export const consumeSignalTapSuppression = () => {
  const suppressed = suppressNextSignalTap
  suppressNextSignalTap = false
  return suppressed
}
