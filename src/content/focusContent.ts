import type { Language, SignalId } from '../store/experienceStore'

interface FocusCopy {
  title: string
  narration: string
}

const focusContent: Record<Language, Record<SignalId, FocusCopy>> = {
  ja: {
    'signal-01': { title: '観測 01 — 二つの椅子とテーブル', narration: '向かい合う二つの椅子には、まだ誰かが戻ってくるための距離が残されている。テーブルの表面をたどる光が、そこで交わされた会話をゆっくり再生する。' },
    'signal-02': { title: '観測 02 — 待機する端末', narration: '部屋の隅でスマートフォンだけが起動している。届かなかった通知と途切れた接続が、光の明滅として同じ時間を繰り返している。' },
    'signal-03': { title: '観測 03 — 建物を支える柱', narration: '四角い柱は空間の重さを受け止めながら、室内を二つに分けている。表面に残る細い線が、建物の時間を垂直に記録する。' },
    'signal-04': { title: '観測 04 — 左側の三つの記録', narration: '並べられた小さな額縁は、左側から順に異なる時間を示している。像は失われ、色と傾きだけが出来事の順序を伝える。' },
    'signal-05': { title: '観測 05 — 右側の三つの記録', narration: '残りの三つの額縁には、まだ消えていない温度がある。近づくほど輪郭は薄れ、配置そのものが一つの記憶として現れる。' },
  },
  ko: {
    'signal-01': {
      title: '관찰 01 — 두 개의 의자와 테이블',
      narration: '마주 보는 두 의자 사이에는 아직 누군가 돌아올 수 있는 거리가 남아 있습니다. 테이블 표면을 가로지르는 빛이 그곳에서 나누었던 대화를 천천히 재생합니다.',
    },
    'signal-02': {
      title: '관찰 02 — 기다리는 기기',
      narration: '방 한구석에서 스마트폰만 깨어 있습니다. 도착하지 못한 알림과 끊어진 연결이 빛의 깜박임으로 같은 시간을 반복합니다.',
    },
    'signal-03': {
      title: '관찰 03 — 건물을 지탱하는 기둥',
      narration: '네모난 기둥은 공간의 무게를 받치면서 실내를 둘로 나눕니다. 표면에 남은 가는 선이 건물의 시간을 수직으로 기록합니다.',
    },
    'signal-04': {
      title: '관찰 04 — 왼쪽의 세 기록',
      narration: '나란히 놓인 작은 액자들은 왼쪽부터 서로 다른 시간을 보여줍니다. 이미지는 사라지고 색과 기울기만 사건의 순서를 전합니다.',
    },
    'signal-05': {
      title: '관찰 05 — 오른쪽의 세 기록',
      narration: '나머지 세 액자에는 아직 사라지지 않은 온기가 남아 있습니다. 가까이 다가갈수록 윤곽은 흐려지고, 배치 자체가 하나의 기억으로 나타납니다.',
    },
  },
  en: {
    'signal-01': { title: 'OBSERVATION 01 — TWO CHAIRS AND A TABLE', narration: 'The distance between the two facing chairs still leaves room for someone to return. Light crosses the tabletop and slowly replays the conversation once held there.' },
    'signal-02': { title: 'OBSERVATION 02 — THE WAITING DEVICE', narration: 'Only the smartphone remains awake in the corner. Missed notifications and broken connections repeat as pulses of light.' },
    'signal-03': { title: 'OBSERVATION 03 — THE SUPPORTING COLUMN', narration: 'The square column carries the weight of the room while dividing it in two. Fine surface lines record the building vertically through time.' },
    'signal-04': { title: 'OBSERVATION 04 — THREE RECORDS ON THE LEFT', narration: 'The small frames indicate different moments from left to right. Their images are gone; only color and angle preserve the sequence.' },
    'signal-05': { title: 'OBSERVATION 05 — THREE RECORDS ON THE RIGHT', narration: 'The remaining frames retain a trace of warmth. As the camera approaches, their outlines fade and the arrangement itself becomes the memory.' },
  },
}

export const getFocusContent = (language: Language, signalId: SignalId | null) =>
  focusContent[language][signalId ?? 'signal-01']
