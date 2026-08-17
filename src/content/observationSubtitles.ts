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
  ko: [
    { start: 10, text: '어둠 속에서 아직 형태를 갖추지 못한 기억이 숨 쉬고 있습니다.' },
    { start: 15.5, text: '가까이 다가갈수록 푸른 장막 너머로 다른 시간이 스며 나옵니다.' },
    { start: 21, text: '남겨진 거리가 사라진 것의 윤곽을 천천히 다시 이어 붙입니다.' },
    { start: 26.2, text: '바라보는 일은 어느새 만지는 일이 됩니다.' },
  ],
  en: [
    { start: 10, text: 'In the dark, a memory without a shape is still breathing.' },
    { start: 15.5, text: 'As we draw closer, another time seeps through the blue curtain.' },
    { start: 21, text: 'The remaining distance slowly reconnects the outline of what disappeared.' },
    { start: 26.2, text: 'Looking quietly becomes a way of touching.' },
  ],
}
