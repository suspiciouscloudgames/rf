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

const signal02Memos: Record<Language, ObservationMemo[]> = {
  ko: [
    { id: 'resident-c', resident: '거주자 C', title: '가려졌던 벽', body: 'C가 살던 동안 이 벽은 수납장에 가려져 있었다. C가 남긴 반려체 기록은 없으며, 당시 벽의 상태도 확인할 수 없다. D가 촬영한 실내 사진을 통해 이 자리가 오랫동안 드러나지 않았다는 사실만 알 수 있다.' },
    { id: 'resident-d', resident: '거주자 D', title: '흔적', body: 'D는 집에 남아 있던 수납장을 옮기다가 벽의 테이프 자국과 작은 낙서를 발견했다. 당시에는 별다른 의미를 두지 않은 채 그 앞에 침대를 놓았고, 반려체도 기록하지 않았다. D가 촬영한 사진은 이후 E가 같은 자리에서 반려체를 관측하면서 이전 상태를 확인하는 자료가 되었다.' },
    { id: 'resident-e', resident: '거주자 E', title: '안녕', body: 'E는 이 벽 앞에 책상과 의자를 두고 생활했다. 이사를 준비하며 자리를 비운 뒤, 테이프 자국과 낙서 옆에서 거의 움직이지 않는 저진폭형 반려체를 관측했다. 저진폭형은 오랜 피로와 고독, 무감각뿐 아니라 어떤 상태를 조용히 받아들이는 만족감과도 겹친다. 여러 거주자의 시간이 쌓인 자리여서 이를 특정한 한 사람의 상태로 돌릴 수는 없었다.' },
  ],
  ja: [
    { id: 'resident-c', resident: '居住者 C', title: '隠されていた壁', body: 'Cが暮らしていたあいだ、この壁は収納棚に隠されていた。Cが残した伴侶体の記録はなく、当時の壁の状態も確認できない。Dが撮影した室内写真から、この場所が長いあいだ表に出ていなかったことだけがわかる。' },
    { id: 'resident-d', resident: '居住者 D', title: '痕跡', body: 'Dは家に残されていた収納棚を動かした際、壁のテープ跡と小さな落書きを見つけた。当時は特別な意味を見いださず、その前にベッドを置き、伴侶体の記録も残さなかった。Dが撮影した写真は、のちにEが同じ場所で伴侶体を観測したとき、以前の状態を確かめる資料になった。' },
    { id: 'resident-e', resident: '居住者 E', title: 'さようなら', body: 'Eはこの壁の前に机と椅子を置いて暮らした。引っ越しの準備で場所を空けたあと、テープ跡と落書きのそばにほとんど動かない低振幅型伴侶体を観測した。低振幅型は長い疲労や孤独、無感覚だけでなく、ある状態を静かに受け入れる満足感とも重なる。複数の居住者の時間が積み重なった場所であり、特定の一人の状態に帰すことはできなかった。' },
  ],
  en: [
    { id: 'resident-c', resident: 'RESIDENT C', title: 'The Hidden Wall', body: 'While C lived here, this wall was concealed behind a storage cabinet. C left no record of a companion, and the condition of the wall at the time cannot be confirmed. An interior photograph taken by D tells us only that this place remained hidden for a long time.' },
    { id: 'resident-d', resident: 'RESIDENT D', title: 'Traces', body: 'While moving the cabinet left in the house, D found tape marks and a small doodle on the wall. D attached no particular meaning to them, placed a bed in front of the wall, and made no record of a companion. The photograph D took later became evidence of the earlier state when E observed a companion in the same place.' },
    { id: 'resident-e', resident: 'RESIDENT E', title: 'Goodbye', body: 'E lived with a desk and chair in front of this wall. After clearing the place in preparation for moving, E observed a low-amplitude companion beside the tape marks and doodle, almost completely still. The low-amplitude type overlaps not only with prolonged fatigue, solitude, and numbness, but also with the contentment of quietly accepting a condition. Because the time of several residents had accumulated there, it could not be attributed to any one person.' },
  ],
}

const signal03Memos: Record<Language, ObservationMemo[]> = {
  ko: [
    { id: 'resident-d', resident: '거주자 D', title: '누군가의 반려체', body: 'D가 이사할 집을 처음 보러 왔을 때 안쪽은 비어 있었다. 이곳에서는 한 지점에 머무르지 않고 공간 전체로 빠르게 퍼지는 확산형 반려체가 관측되었다. 확산형은 불안과 초조뿐 아니라 새로운 상황을 앞둔 기대와 설렘에서도 나타날 수 있어, 당시 누구의 어떤 감정과 관련되었는지는 판단하지 못했다.' },
    { id: 'resident-e', resident: '거주자 E', title: '애착', body: 'E는 D가 테이블을 두었던 안쪽에 침대를 놓았다. 이곳을 떠날 가능성을 생각하는 시간이 쌓이면서 침대 가까이에서 수축형과 반복형의 특성을 가진 반려체가 관측되었다. 슬픔과 체념, 휴식에서 오는 안도, 떠나야 하는 곳에 대한 애착과 미련이 겹쳐 있었을 가능성이 있다. 앱은 이전 기록과 별개의 반려체로 등록했고, E는 매일 상태를 확인하며 애착을 갖게 되었다.' },
  ],
  ja: [
    { id: 'resident-d', resident: '居住者 D', title: '誰かの伴侶体', body: 'Dが初めて内見に来たとき、奥の空間は空いていた。ここでは一か所に留まらず、空間全体へ素早く広がる拡散型伴侶体が観測された。拡散型は不安や焦燥だけでなく、新しい状況を前にした期待や高揚にも現れるため、当時誰のどの感情と関係していたかは判断できなかった。' },
    { id: 'resident-e', resident: '居住者 E', title: '愛着', body: 'EはDがテーブルを置いていた奥にベッドを置いた。ここを離れる可能性について考える時間が重なるにつれ、ベッドの近くで収縮型と反復型の特徴を持つ伴侶体が観測された。悲しみと諦め、休息による安堵、去らなければならない場所への愛着と未練が重なっていた可能性がある。アプリは以前の記録とは別の伴侶体として登録し、Eは毎日状態を確かめながら愛着を抱くようになった。' },
  ],
  en: [
    { id: 'resident-d', resident: 'RESIDENT D', title: 'Someone’s Companion', body: 'When D first came to view the house, the inner area was empty. A diffusive-type companion was observed here, spreading rapidly through the entire space rather than remaining at one point. Because the diffusive type may arise not only with anxiety and agitation but also with expectation and excitement before a new situation, whose feelings it reflected could not be determined.' },
    { id: 'resident-e', resident: 'RESIDENT E', title: 'Attachment', body: 'E placed a bed in the inner area where D had kept a table. As time accumulated around the possibility of leaving, a companion with traits of the contractive and repetitive types was observed near the bed. Sorrow and resignation, the relief of rest, and attachment and reluctance toward a place one must leave may have overlapped. The app registered it as separate from the earlier record, and E became attached while checking its condition each day.' },
  ],
}

const signal04Memos: Record<Language, ObservationMemo[]> = {
  ko: [
    { id: 'resident-c', resident: '거주자 C', title: '남겨진 상자', body: 'C가 남긴 상자에는 여러 집의 주소와 시간이 적힌 작업 수첩, 고지서와 뒤늦게 도착한 우편물, 얼기설기 만든 손팻말이 들어 있었다. 손팻말에는 봉쇄를 멈추고 죽어가는 아이들을 살리라는 문장이 적혀 있었다. D는 이를 통해 평생 가사노동을 하다가 노년에 혼자 지낸 C의 생활을 짐작했다.' },
    { id: 'resident-d', resident: '거주자 D', title: '벽장', body: 'D가 지내는 동안 벽장 안에서는 위치와 리듬을 예측하기 어려운 불규칙형 반려체가 관측되었다. 불규칙형은 충격과 혼란, 공포뿐 아니라 이해하기 어려운 일을 마주했을 때의 경이로움과도 겹친다. 물건을 밖으로 옮기자 반려체에는 확산형의 특성이 잠시 나타났다.' },
    { id: 'resident-e', resident: '거주자 E', title: '비워진 벽장', body: 'E가 입주했을 때 벽장은 거의 비어 있었다. D의 이야기를 듣고 같은 곳을 여러 번 관측했지만 반려체는 다시 나타나지 않았다. 사라진 것인지, 물건이 정리되면서 관측 조건이 달라진 것인지는 알 수 없다.' },
  ],
  ja: [
    { id: 'resident-c', resident: '居住者 C', title: '残された箱', body: 'Cが残した箱には、いくつもの家の住所と日時が書かれた作業手帳、請求書と遅れて届いた郵便物、粗末に作られたプラカードが入っていた。プラカードには封鎖を止め、死にゆく子どもたちを救えと書かれていた。Dはそこから、生涯家事労働を続け、老年を一人で過ごしたCの暮らしを想像した。' },
    { id: 'resident-d', resident: '居住者 D', title: '物置', body: 'Dが暮らしていたあいだ、物置の中では位置もリズムも予測しにくい不規則型伴侶体が観測された。不規則型は衝撃や混乱、恐怖だけでなく、理解しがたい出来事に直面したときの驚異とも重なる。物を外へ運び出すと、伴侶体には一時的に拡散型の特徴が現れた。' },
    { id: 'resident-e', resident: '居住者 E', title: '空になった物置', body: 'Eが入居したとき、物置はほとんど空だった。Dの話を聞いて同じ場所を何度も観測したが、伴侶体は再び現れなかった。消えたのか、物が片づけられて観測条件が変わったのかはわからない。' },
  ],
  en: [
    { id: 'resident-c', resident: 'RESIDENT C', title: 'The Box Left Behind', body: 'The box C left contained a work notebook listing addresses and dates for several homes, bills and mail that had arrived late, and a roughly made placard. The placard demanded an end to the blockade and the rescue of dying children. From these objects, D imagined the life of C, who had spent a lifetime in domestic labor and lived alone in old age.' },
    { id: 'resident-d', resident: 'RESIDENT D', title: 'The Closet', body: 'While D lived here, an irregular-type companion was observed inside the closet, its position and rhythm difficult to predict. The irregular type overlaps not only with shock, confusion, and fear, but also with wonder when confronting something difficult to understand. When the objects were moved outside, the companion briefly showed diffusive traits.' },
    { id: 'resident-e', resident: 'RESIDENT E', title: 'The Empty Closet', body: 'When E moved in, the closet was almost empty. After hearing D’s account, E observed the same place several times, but the companion never appeared again. Whether it had disappeared or the removal of the objects had changed the conditions of observation is unknown.' },
  ],
}

const signal05Memos: Record<Language, ObservationMemo[]> = {
  ko: [
    { id: 'resident-a', resident: '거주자 A', title: '오래된 경로', body: 'A가 이곳에 살던 시기의 기록은 없다. B가 입주했을 때 집 앞 나무 주변에는 이미 반복형 반려체가 관측되고 있었다. 이 반려체가 A와 관련되었는지, 더 오래전부터 나무 주변에 있었는지는 확인할 수 없다.' },
    { id: 'resident-c', resident: '거주자 C', title: '오래된 먹이 그릇', body: 'D가 집을 보러 왔을 때 나무 아래에는 길고양이를 위한 오래된 먹이 그릇이 놓여 있었다. C가 남긴 물건에서도 길고양이에게 먹이를 주었던 흔적이 발견되었지만, 그릇을 놓은 사람이 C인지는 알 수 없었다. 그릇 가까이에서는 애착과 신뢰, 오래된 상실과 자주 겹치는 고정형 반려체가 관측되었다.' },
    { id: 'resident-d', resident: '거주자 D', title: '죽어가는 나무', body: 'D가 살던 시기에 누군가 나무를 심하게 훼손했고 잎과 가지가 서서히 말라갔다. 같은 시기에 고정형 반려체도 점차 약해졌으며, 마지막 관측에서는 피로와 고독, 체념과 자주 겹치는 저진폭형의 특성만 남았다. 나무의 변화 때문인지, 길고양이가 더 이상 찾아오지 않았기 때문인지, 돌봄이 중단된 자리의 변화인지는 구분할 수 없었다.' },
  ],
  ja: [
    { id: 'resident-a', resident: '居住者 A', title: '古い経路', body: 'Aがここで暮らしていた時期の記録はない。Bが入居したとき、家の前の木の周囲ではすでに反復型伴侶体が観測されていた。この伴侶体がAと関係していたのか、それともさらに昔から木の周囲にいたのかは確認できない。' },
    { id: 'resident-c', resident: '居住者 C', title: '古い餌皿', body: 'Dが内見に来たとき、木の下には野良猫のための古い餌皿が置かれていた。Cが残した物からも野良猫に餌を与えていた痕跡が見つかったが、皿を置いたのがCかどうかはわからない。皿の近くでは、愛着や信頼、古い喪失と重なることの多い固定型伴侶体が観測された。' },
    { id: 'resident-d', resident: '居住者 D', title: '枯れていく木', body: 'Dが暮らしていた時期、誰かが木をひどく傷つけ、葉と枝は徐々に枯れていった。同じ時期に固定型伴侶体も弱まり、最後の観測では疲労や孤独、諦めと重なる低振幅型の特徴だけが残った。木の変化によるものか、野良猫が来なくなったためか、世話が途絶えた場所の変化なのかは区別できなかった。' },
  ],
  en: [
    { id: 'resident-a', resident: 'RESIDENT A', title: 'An Old Route', body: 'No record remains from the period when A lived here. When B moved in, a repetitive-type companion was already being observed around the tree outside the house. Whether it was connected to A or had existed around the tree for much longer cannot be confirmed.' },
    { id: 'resident-c', resident: 'RESIDENT C', title: 'The Old Food Bowl', body: 'When D came to view the house, an old food bowl for stray cats stood beneath the tree. Objects left by C also showed traces of feeding stray cats, but whether C had placed the bowl was unknown. Near it, a fixed-type companion was observed, a type often overlapping with attachment, trust, and old loss.' },
    { id: 'resident-d', resident: 'RESIDENT D', title: 'The Dying Tree', body: 'While D lived here, someone severely damaged the tree, and its leaves and branches slowly dried. During the same period, the fixed-type companion gradually weakened. In the final observation, only low-amplitude traits remained, often overlapping with fatigue, solitude, and resignation. Whether this followed the change in the tree, the disappearance of the stray cats, or the transformation of a place where care had ceased could not be distinguished.' },
  ],
}

const signalMemos: Record<SignalId, Record<Language, ObservationMemo[]>> = {
  'signal-01': signal01Memos,
  'signal-02': signal02Memos,
  'signal-03': signal03Memos,
  'signal-04': signal04Memos,
  'signal-05': signal05Memos,
}

export const getObservationMemos = (language: Language, signalId: SignalId | null) =>
  signalId ? signalMemos[signalId][language] : null
