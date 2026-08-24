import type { Language, SignalId } from '../store/experienceStore'

export interface ObservationMemo {
  id: string
  resident: string
  title: string
  body: string
}

const signal01Memos: Record<Language, ObservationMemo[]> = {
  ko: [
    {
      id: 'resident-a', resident: '거주자 A', title: '기록 없는 사람',
      body: 'A는 이 집에서의 생활이나 반려체에 관한 기록을 남기지 않았다. B가 집을 보러 왔을 때 창가에는 화분 하나가 남아 있었고, 그 부근에서는 이미 일정한 간격으로 되풀이되는 반복형 반려체가 관측되고 있었다. A에 관한 다른 기록은 없다.',
    },
    {
      id: 'resident-b', resident: '거주자 B', title: '첫 관측기',
      body: 'B는 비정규직 아르바이트를 하며 다소 우울한 시기를 보냈고, 일이 없는 날에는 창가의 책상에 앉아 게임에 몰두했다. 당시 집에 놀러 온 E와 함께 그 주변을 관측했고, 일정한 간격으로 나타났다 사라지는 반복형 반려체를 발견했다. 반복형은 기다림이나 미련, 다정함과 자주 겹치지만 B의 상태와 직접 관련되었는지는 알 수 없다. E가 검출기를 처음 경험한 날이었다.',
    },
    {
      id: 'resident-d', resident: '거주자 D', title: '고양이',
      body: 'D가 살던 시기에는 고양이 한 마리가 창가의 받침대에 자주 올라가 밖을 바라보았다. 고양이가 죽은 뒤에도 그 자리에서는 한곳에 오래 머무는 반려체가 관측되었다. 고정형은 애착과 신뢰, 오래된 상실과 자주 겹치는 유형이었다. 고양이가 남긴 감응인지, 고양이를 지켜보던 사람들의 감정과 관련된 것인지는 알 수 없다. D는 이사한 뒤 E에게 반려체의 상태를 확인해달라고 메시지를 보냈다.',
    },
    {
      id: 'resident-e', resident: '거주자 E', title: '남아있는 자리',
      body: 'E는 창가에 책상을 두고 생활하며 D가 알려준 자리를 주기적으로 관측했다. 관측이 이어지자 앱은 이곳의 반려체를 고정형으로 새로 등록했다. D가 관측했던 반려체가 계속 남아 있었던 것일까, 별개의 반려체일까.',
    },
  ],
  ja: [
    {
      id: 'resident-a', resident: '居住者 A', title: '記録のない人',
      body: 'Aはこの家での暮らしや伴侶体について、何の記録も残さなかった。Bが内見に来たとき、窓辺には鉢植えがひとつ残されており、その付近ではすでに一定の間隔で繰り返し現れる反復型伴侶体が観測されていた。Aについてのほかの記録はない。',
    },
    {
      id: 'resident-b', resident: '居住者 B', title: '最初の検出器',
      body: 'Bは非正規のアルバイトをしながら、やや憂鬱な時期を過ごしていた。仕事のない日は窓辺の机に座り、ゲームに没頭した。当時、家を訪れたEと一緒に周辺を観測し、一定の間隔で現れては消える反復型伴侶体を発見した。反復型は待つことや未練、親愛と重なることが多いが、Bの状態と直接関係していたかはわからない。Eが初めて検出器を体験した日だった。',
    },
    {
      id: 'resident-d', resident: '居住者 D', title: '猫',
      body: 'Dが暮らしていた時期、一匹の猫が窓辺の台によく上がり、外を眺めていた。猫が死んだあとも、その場所では一か所に長く留まる伴侶体が観測された。固定型は愛着や信頼、古い喪失と重なることが多い。猫が残した感応なのか、猫を見守っていた人々の感情と関係するのかはわからない。Dは引っ越したあと、Eに伴侶体の状態を確かめてほしいとメッセージを送った。',
    },
    {
      id: 'resident-e', resident: '居住者 E', title: '残された場所',
      body: 'Eは窓辺に机を置いて暮らし、Dから教えられた場所を定期的に観測した。観測が続くと、アプリはここにいる伴侶体を固定型として新たに登録した。Dが観測していた伴侶体が残り続けていたのか、それとも別の伴侶体なのだろうか。',
    },
  ],
  en: [
    {
      id: 'resident-a', resident: 'RESIDENT A', title: 'The Person Without a Record',
      body: 'A left no record of life in this house or of any companion. When B came to view the house, a single flowerpot had been left by the window, and a repetitive-type companion was already being observed nearby at regular intervals. No other record of A remains.',
    },
    {
      id: 'resident-b', resident: 'RESIDENT B', title: 'The First Detector',
      body: 'B worked irregular part-time jobs and went through a somewhat depressed period. On days without work, B sat at the desk by the window and immersed themself in games. Together with E, who was visiting the house, B observed the area and found a repetitive-type companion that appeared and disappeared at regular intervals. The repetitive type often overlaps with waiting, lingering attachment, and tenderness, but whether it was directly related to B’s condition is unknown. It was E’s first experience with a detector.',
    },
    {
      id: 'resident-d', resident: 'RESIDENT D', title: 'The Cat',
      body: 'While D lived here, a cat often climbed onto the ledge by the window and looked outside. Even after the cat died, a companion was observed lingering for long periods in that same place. The fixed type often overlaps with attachment, trust, and old loss. Whether the resonance was left by the cat or related to the feelings of those who watched over it is unknown. After moving out, D messaged E and asked them to check on the companion.',
    },
    {
      id: 'resident-e', resident: 'RESIDENT E', title: 'The Place That Remains',
      body: 'E lived with a desk by the window and periodically observed the place D had described. As observation continued, the app newly registered the companion there as a fixed type. Had the companion observed by D remained all along, or was this a different companion?',
    },
  ],
}

export const getObservationMemos = (language: Language, signalId: SignalId | null) =>
  signalId === 'signal-01' ? signal01Memos[language] : null
