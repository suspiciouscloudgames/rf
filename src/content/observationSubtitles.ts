import type { Language } from '../store/experienceStore'

export interface ObservationSubtitleCue {
  start: number
  text: string
}

export const depthPortalSubtitles: Record<Language, ObservationSubtitleCue[]> = {
  ja: [
    { start: 10, text: '暗がりの奥で、まだ形にならない記憶が呼吸している。' },
    { start: 15.5, text: '近づくほど、青い幕の向こうから別の時間がにじみ出す。' },
    { start: 21, text: '残された距離が、消えたものの輪郭をゆっくり結び直す。' },
    { start: 26.2, text: '見ることは、いつの間にか触れることへ変わっていく。' },
  ],
  en: [
    { start: 10, text: 'In the dark, a memory without a shape is still breathing.' },
    { start: 15.5, text: 'As we draw closer, another time seeps through the blue curtain.' },
    { start: 21, text: 'The remaining distance slowly reconnects the outline of what disappeared.' },
    { start: 26.2, text: 'Looking quietly becomes a way of touching.' },
  ],
}
