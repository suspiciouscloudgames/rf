import type { Language, SignalId } from '../store/experienceStore'

interface FocusCopy {
  title: string
  narration: string
}

const focusContent: Record<Language, Record<SignalId, FocusCopy>> = {
  ja: {
    'signal-01': {
      title: '観測 01 — 二つの椅子とテーブル',
      narration: '向かい合う二つの椅子には、まだ誰かが戻ってくるための距離が残されている。テーブルの表面をたどる光が、そこで交わされた会話をゆっくり再生する。',
    },
    'signal-02': {
      title: '観測 02 — 待機する端末',
      narration: '部屋の隅でスマートフォンだけが起動している。届かなかった通知と途切れた接続が、光の明滅として同じ時間を繰り返している。',
    },
    'signal-03': {
      title: '観測 03 — 建物を支える柱',
      narration: '四角い柱は空間の重さを受け止めながら、室内を二つに分けている。表面に残る細い線が、建物の時間を垂直に記録する。',
    },
    'signal-04': {
      title: '観測 04 — 左側の三つの記録',
      narration: '並べられた小さな額縁は、左側から順に異なる時間を示している。像は失われ、色と傾きだけが出来事の順序を伝える。',
    },
    'signal-05': {
      title: '観測 05 — 右側の三つの記録',
      narration: '残りの三つの額縁には、まだ消えていない温度がある。近づくほど輪郭は薄れ、配置そのものが一つの記憶として現れる。',
    },
  },
  en: {
    'signal-01': {
      title: 'OBSERVATION 01 — TWO CHAIRS AND A TABLE',
      narration: 'The distance between the two facing chairs still leaves room for someone to return. Light crosses the tabletop and slowly replays the conversation once held there.',
    },
    'signal-02': {
      title: 'OBSERVATION 02 — THE WAITING DEVICE',
      narration: 'Only the smartphone remains awake in the corner. Missed notifications and broken connections repeat as pulses of light.',
    },
    'signal-03': {
      title: 'OBSERVATION 03 — THE SUPPORTING COLUMN',
      narration: 'The square column carries the weight of the room while dividing it in two. Fine surface lines record the building vertically through time.',
    },
    'signal-04': {
      title: 'OBSERVATION 04 — THREE RECORDS ON THE LEFT',
      narration: 'The small frames indicate different moments from left to right. Their images are gone; only color and angle preserve the sequence.',
    },
    'signal-05': {
      title: 'OBSERVATION 05 — THREE RECORDS ON THE RIGHT',
      narration: 'The remaining frames retain a trace of warmth. As the camera approaches, their outlines fade and the arrangement itself becomes the memory.',
    },
  },
}

export const getFocusContent = (language: Language, signalId: SignalId | null) =>
  focusContent[language][signalId ?? 'signal-01']
