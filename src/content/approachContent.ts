import type { Language, SignalId } from '../store/experienceStore'

interface ApproachRecord {
  title: string
  body: string
}

const approachContent: Record<Language, Record<SignalId, ApproachRecord>> = {
  ko: {
    'signal-01': {
      title: '01 창가',
      body: 'A는 아무 기록도 남기지 않았다. B가 이사 왔을 때 창가에는 A가 남긴 화분이 있었고, 그 부근에서는 이미 일정한 간격으로 되풀이되는 반복형 반려체가 관측되고 있었다. B는 창가에 책상과 의자를 두고 생활했다. 몇 년 뒤 E는 B를 만나러 이 집에 왔다가 그 주변의 반려체를 관측하며 검출기를 처음 경험했다. 이후 D가 살던 시기에는 고양이가 창가의 받침대에 자주 머물렀고, 고양이가 죽은 뒤에도 같은 자리에서 한곳에 오래 머무는 반려체가 관측되었다. 고정형은 애착과 신뢰, 오래된 상실과 자주 겹치는 유형이었다. 월세가 올라 이사한 D는 이 반려체가 아직 남아 있는지 E에게 확인을 부탁했다. 마지막 거주자가 된 E는 창가에 책상을 두고 생활하며 같은 자리를 주기적으로 관측했다. 관측이 이어지자 앱은 고정형 반려체를 새로 등록했다. 처음부터 같은 반려체가 남아 있었던 것인지, 서로 다른 시기의 감응과 반복 관측이 새로운 반려체를 안정시킨 것인지는 확인할 수 없다.',
    },
    'signal-02': {
      title: '02 벽',
      body: 'C가 살던 시기에는 이 벽이 수납장에 가려져 있었다. D는 집에 남아 있던 수납장을 옮기다가 테이프 자국과 작은 낙서를 발견하고 사진을 남겼지만 당시에는 별다른 의미를 두지 않았다. 이후 D는 그 앞에 침대를 놓았다. E는 같은 벽 앞에 책상과 의자를 두고 생활했다. 마지막 이사를 준비하며 책상과 의자를 치운 뒤, E는 흔적 옆에서 거의 움직이지 않는 저진폭형 반려체를 관측했다. 저진폭형은 오랫동안 이어진 피로와 고독, 무감각뿐 아니라 어떤 상태를 조용히 받아들이는 만족감과도 겹친다. 여러 거주자의 시간이 같은 벽 앞에 쌓여 있어, 이 반려체를 어느 한 사람의 생활이나 감정으로 돌릴 수는 없다.',
    },
    'signal-03': {
      title: '03 안쪽',
      body: 'D가 이사할 집을 처음 보러 왔을 때 안쪽에는 가구가 거의 없었다. 이곳에서는 한 지점에 머무르지 않고 빈 공간 전체로 빠르게 퍼지는 확산형 반려체가 관측되었다. 확산형은 불안과 초조뿐 아니라 새로운 상황을 앞둔 기대와 설렘에서도 나타날 수 있었다. D는 입주한 뒤 이 자리에 테이블과 의자를 두고 생활했다. 이후 E는 같은 자리에 침대를 놓았다. 가족과 본국의 일을 걱정하고 이 집을 떠날 가능성을 생각하는 시간이 쌓이면서 침대 가까이에서는 범위가 안쪽으로 모이는 수축형과 일정한 간격으로 되풀이되는 반복형의 특성을 가진 새로운 반려체가 나타났다. 슬픔과 체념, 휴식에서 오는 안도, 떠나야 하는 곳에 대한 애착과 미련이 서로 분리되지 않은 채 겹쳐 있었을 가능성이 있다. 앱은 이를 D가 관측했던 반려체와 별개의 개체로 등록했고, E는 매일 상태를 확인하는 동안 깊은 애착을 갖게 되었다.',
    },
    'signal-04': {
      title: '04 벽장',
      body: 'D는 이사할 집을 보러 왔다가 벽장 안에서 이전 거주자 C가 남긴 상자를 발견했다. 그 안에는 여러 집의 주소와 시간이 적힌 작업 수첩, 고지서와 뒤늦게 도착한 엽서, 봉쇄를 멈추고 죽어가는 아이들을 살리라는 문장이 적힌 손팻말이 들어 있었다. D는 이를 통해 평생 가사노동을 하다가 노년에 혼자 지낸 C의 생활과, 학살을 목격한 뒤 느꼈을 충격과 분노를 짐작했다. 상자를 정리하는 동안에는 위치와 리듬을 예측하기 어려운 불규칙형 반려체가 관측되었다. 물건을 밖으로 옮기자 반려체에는 확산형의 특성이 잠시 나타났지만, 과거의 감응이 변화한 것인지 물건을 발견한 D의 반응이 더해진 것인지는 구분할 수 없었다. 정리가 끝난 뒤 반려체는 점차 약해졌고, E가 입주한 뒤에는 다시 관측되지 않았다.',
    },
    'signal-05': {
      title: '05 집 앞 나무',
      body: 'A가 살던 시기의 기록은 남아 있지 않다. B가 이사 왔을 때 집 앞 나무 주변에는 이미 비슷한 경로를 되풀이하는 반복형 반려체가 관측되고 있었다. 이 반려체가 A와 관련되었는지, 더 오래전부터 나무 주변에 있었는지는 확인할 수 없다. 훗날 나무 아래에 길고양이를 위한 먹이 그릇이 놓였고, 그 가까이에서는 한 자리에 오래 머무는 고정형 반려체가 관측되었다. C가 남긴 물건에서도 길고양이에게 먹이를 주었던 흔적이 발견되었지만, 먹이 그릇을 놓은 사람이 C인지는 알 수 없다. 먹이를 주는 사람과 기다리는 고양이, 그 자리에 계속 서 있던 나무 중 무엇의 감응이 반려체와 연결되었는지도 구분할 수 없다. D가 살던 시기에 나무가 심하게 훼손되어 말라가기 시작하자 반려체도 점차 약해졌고, 마지막 관측에서는 피로와 고독, 체념과 자주 겹치는 저진폭형의 특성만 남았다.',
    },
  },
  ja: {
    'signal-01': {
      title: '01 窓辺',
      body: 'Aは何の記録も残さなかった。Bが越してきたとき、窓辺にはAが残した植木鉢があり、その付近ではすでに一定の間隔で繰り返す反復型の伴侶体が観測されていた。Bは窓辺に机と椅子を置いて暮らした。数年後、EはBを訪ねてこの家に来た際、その周辺の伴侶体を観測し、初めて検出器を体験した。その後Dが暮らした時期には、猫が窓辺の台に頻繁に留まり、猫が死んだ後も同じ場所に長く留まる伴侶体が観測された。固定型は愛着と信頼、古い喪失としばしば重なる型だった。家賃の値上げで転居したDは、この伴侶体がまだ残っているかEに確認を頼んだ。最後の居住者となったEは窓辺に机を置いて暮らし、同じ場所を定期的に観測した。観測が続くと、アプリは固定型の伴侶体を新たに登録した。初めから同じ伴侶体が残っていたのか、異なる時期の感応と反復観測が新たな伴侶体を安定させたのかは確認できない。',
    },
    'signal-02': {
      title: '02 壁',
      body: 'Cが暮らしていた時期、この壁は収納棚に隠れていた。Dは家に残されていた棚を動かす際、テープの跡と小さな落書きを見つけて写真を残したが、そのときは特別な意味を見いださなかった。その後Dは壁の前にベッドを置いた。Eは同じ壁の前に机と椅子を置いて暮らした。最後の引っ越しを準備して机と椅子を片づけた後、Eは痕跡のそばでほとんど動かない低振幅型の伴侶体を観測した。低振幅型は長く続いた疲労、孤独、無感覚だけでなく、ある状態を静かに受け入れる満足感とも重なる。複数の居住者の時間が同じ壁の前に積み重なっているため、この伴侶体を一人の生活や感情に帰すことはできない。',
    },
    'signal-03': {
      title: '03 奥',
      body: 'Dが転居先を初めて見に来たとき、奥には家具がほとんどなかった。ここでは一点に留まらず、空いた空間全体へ素早く広がる拡散型の伴侶体が観測された。拡散型は不安や焦燥だけでなく、新しい状況を前にした期待や高揚にも現れうる。Dは入居後、この場所にテーブルと椅子を置いて暮らした。その後Eは同じ場所にベッドを置いた。家族や故国のことを案じ、この家を離れる可能性を考える時間が積み重なるにつれ、ベッドの近くには範囲が内側へ集まる収縮型と、一定間隔で繰り返す反復型の特徴を持つ新たな伴侶体が現れた。悲しみと諦念、休息の安堵、去らなければならない場所への愛着と未練が、分かれないまま重なっていた可能性がある。アプリはこれをDが観測した伴侶体とは別の個体として登録し、Eは毎日状態を確かめるうちに深い愛着を抱いた。',
    },
    'signal-04': {
      title: '04 クローゼット',
      body: 'Dは転居先を見に来た際、クローゼットの中で以前の居住者Cが残した箱を見つけた。中には複数の家の住所と日時が記された作業手帳、請求書と遅れて届いた葉書、封鎖を止め、死にゆく子どもたちを救えと書かれたプラカードが入っていた。Dはそこから、生涯家事労働に従事し老年を一人で過ごしたCの生活と、虐殺を目撃した後に抱いたであろう衝撃と怒りを想像した。箱を整理する間、位置とリズムを予測しにくい不規則型の伴侶体が観測された。物を外へ運ぶと伴侶体には一時的に拡散型の特徴が現れたが、過去の感応が変化したのか、箱を発見したDの反応が加わったのかは区別できなかった。整理が終わると伴侶体は次第に弱まり、Eの入居後は再び観測されなかった。',
    },
    'signal-05': {
      title: '05 家の前の木',
      body: 'Aが暮らしていた時期の記録は残っていない。Bが越してきたとき、家の前の木の周囲では、すでに似た経路を繰り返す反復型の伴侶体が観測されていた。この伴侶体がAに関係していたのか、さらに以前から木の周辺にいたのかは確認できない。後に木の下には野良猫のための餌皿が置かれ、その近くでは一か所に長く留まる固定型の伴侶体が観測された。Cが残した物からも野良猫に餌を与えていた痕跡が見つかったが、餌皿を置いたのがCかどうかは分からない。餌を与える人、待つ猫、その場所に立ち続けた木のうち、どの感応が伴侶体と結びついたのかも区別できない。Dが暮らした時期に木がひどく傷つけられて枯れ始めると、伴侶体も次第に弱まり、最後の観測では疲労、孤独、諦念としばしば重なる低振幅型の特徴だけが残った。',
    },
  },
  en: {
    'signal-01': {
      title: '01 Window',
      body: 'A left no records. When B moved in, a flowerpot left by A stood at the window, and a repetitive-type companion was already being observed nearby, recurring at regular intervals. B placed a desk and chair by the window and lived there. Several years later, E visited B at the house and encountered a detector for the first time while observing the companion nearby. During D’s residence, a cat often stayed on the window ledge. Even after the cat died, a companion was observed lingering for long periods in the same place. The fixed type often overlapped with attachment, trust, and old loss. When rising rent forced D to move, D asked E to check whether the companion remained. As the final resident, E kept a desk by the window and observed the same place periodically. As observation continued, the app registered a new fixed-type companion. It is impossible to determine whether the same companion had been there from the beginning, or whether resonances from different periods and repeated observation stabilized a new one.',
    },
    'signal-02': {
      title: '02 Wall',
      body: 'During C’s residence, this wall was hidden behind a storage cabinet. While moving the cabinet left in the house, D found tape marks and a small doodle and took a photograph, but attached no particular meaning to them at the time. D later placed a bed in front of the wall. E lived with a desk and chair against the same wall. After removing them in preparation for the final move, E observed a low-amplitude companion beside the marks, almost completely still. The low-amplitude type overlaps not only with prolonged fatigue, solitude, and numbness, but also with the contentment of quietly accepting a condition. The time of several residents accumulated before the same wall, making it impossible to attribute this companion to any one person’s life or emotions.',
    },
    'signal-03': {
      title: '03 Interior',
      body: 'When D first came to view the home, there was almost no furniture in the interior. A diffusive-type companion was observed here, spreading rapidly through the empty space rather than remaining at one point. The diffusive type could appear not only with anxiety and agitation, but also with expectation and excitement before a new situation. After moving in, D placed a table and chairs here. E later put a bed in the same place. As time accumulated around worries about family and the homeland, and the possibility of leaving the house, a new companion appeared near the bed with traits of both the inward-gathering contractive type and the regularly recurring repetitive type. Sorrow and resignation, the relief of rest, and attachment and reluctance toward a place one must leave may have overlapped without separating. The app registered it as an entity distinct from the companion D had observed, and E developed a deep attachment while checking its condition each day.',
    },
    'signal-04': {
      title: '04 Closet',
      body: 'While viewing the home, D found a box left in the closet by the previous resident, C. It contained a work notebook listing the addresses and dates of several homes, bills and a postcard that had arrived late, and a placard demanding an end to the blockade and the rescue of dying children. From these objects, D imagined the life of C, who had spent a lifetime in domestic labor and lived alone in old age, as well as the shock and anger C may have felt after witnessing a massacre. While the box was being sorted, an irregular-type companion appeared whose position and rhythm were difficult to predict. When the objects were moved outside, the companion briefly showed diffusive traits, but it was impossible to distinguish whether an old resonance had changed or D’s response to the discovery had been added. After the sorting was complete, the companion gradually weakened, and it was not observed again after E moved in.',
    },
    'signal-05': {
      title: '05 Tree Outside',
      body: 'No records remain from the period when A lived here. When B moved in, a repetitive-type companion was already being observed around the tree outside the house, retracing a similar path. It cannot be confirmed whether this companion was connected to A or had existed around the tree for much longer. Later, a food bowl for stray cats was placed beneath the tree, and a fixed-type companion was observed lingering nearby. Objects left by C also showed traces of feeding stray cats, but it is unknown whether C placed the bowl. Nor can we distinguish whether the resonance linked to the companion belonged to the person providing food, the waiting cat, or the tree that continued standing there. During D’s residence, the tree was severely damaged and began to wither. The companion gradually weakened as well, and in the final observation only low-amplitude traits remained, often overlapping with fatigue, solitude, and resignation.',
    },
  },
}

export const getApproachContent = (language: Language, signalId: SignalId | null) =>
  approachContent[language][signalId ?? 'signal-01']
