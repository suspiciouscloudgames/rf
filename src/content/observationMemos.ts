import type { Language, SignalId } from '../store/experienceStore'

export interface ObservationMemo {
  id: string
  resident: string
  body: string
}

const memo = (id: string, resident: string, _formerTitle: string, body: string): ObservationMemo => ({
  id,
  resident,
  body,
})

const signal01Memos: Record<Language, ObservationMemo[]> = {
  ko: [
    memo('resident-a', '거주자 A', '화분과 반려', 'A가 남긴 화분과 그 주변의 반려체는 이후 B가 이곳을 경험하는 조건이 되었다. 서로를 알아보지 못하고 같은 시간을 살아가지도 않은 존재들이 한 장소를 통해 서로의 삶을 바꾸게 된다면, 그들은 이미 서로에게 반려가 되었다고 할 수 있을까?'),
    memo('resident-b', '거주자 B', '기다림의 해석', 'B는 반복형 반려체를 기다리는 존재로 이해했다. 그 순간부터 이후의 움직임도 모두 기다림의 증거로 읽히고, 그런 해석에 따른 관측이 반려체의 특성을 점차 고정한다면, 처음의 해석이 틀렸는지는 여전히 중요할까? 잘못 알아본 방식으로도 한 존재가 실제로 변화할 수 있다면, 그 변화에 대한 책임은 누구에게 있을까?'),
    memo('resident-d', '거주자 D', '죽음 이후', '고양이의 죽음으로 하나의 삶은 끝을 맺었지만, 고양이가 머물던 자리에서는 반려체가 남아 있었다. 함께 살아온 존재가 사라진 뒤에도 그 존재로 인해 생겨난 감응이 다른 존재와 장소를 계속 변화시킨다면, 죽음은 무엇의 끝이며 그 이후에도 남아 있는 것은 누구의 삶에 속한다고 할 수 있을까?'),
    memo('resident-e', '거주자 E', '같은 존재', '반복형에서 고정형으로 움직임과 특성이 모두 달라졌는데도 E는 같은 반려체가 남아 있을 가능성을 생각했다. 한 존재가 계속 같은 존재이기 위해서는 무엇이 변하지 않아야 할까? 그 동일성을 반려체 안에서 찾을 수 없다면, 같은 장소에서 이어진 관측과 기억이 하나의 존재를 지속시키는 것은 아닐까?'),
  ],
  ja: [
    memo('resident-a', '居住者 A', '鉢植えと伴侶', 'Aが残した植木鉢と、そのまわりにいた伴侶体は、あとからここで暮らすBにも影響していた。お互いのことを知らなくても、同じ時間を過ごしていなくても、同じ場所を通して、互いの暮らしが変わるとしたら、彼らはすでに互いにとって伴侶と言えるのだろうか？'),
    memo('resident-b', '居住者 B', '待つことの解釈', 'Bは、「反復型の伴侶体」を、”何かを待っている存在”だと考えた。それからは、伴侶体がどんな動きをしても、何かを待っているからだと思うようになった。もし、そんなふうにみ続けるうちに、伴侶体の性質そのものが少しずつ固定されていくとしたら、最初の見方が正しかったかどうかは、もう重要ではないのかもしれない。たとえ最初は見誤っていたとしても、それによってある存在が本当に変わってしまうのなら、その変化の責任は誰にあるのだろう。'),
    memo('resident-d', '居住者 D', '死のあと', '猫が死んでも、いつもいた場所には伴侶体が残っていた。一緒に暮らした存在がいなくなっても、そこから生まれた感応が残り、ほかの存在や場所に影響を与え続けるのだとしたら、ひとつの生は、どこで終わるのだろう。そこに残ったものは、誰の生の一部になっていくのだろう。'),
    memo('resident-e', '居住者 E', '同じ存在', '反復型から固定型へと動きも性質も変わっていたが、Eは同じ伴侶体が残っているかもしれないと考えた。ひとつの存在が、ずっと同じ存在であり続けるには、何が変わらずに残っていればいいだろうか。もし、その”同じであること”を伴侶体そのものの中に見つけられないとしたら、同じ場所で続けられてきた観測や記憶が、ひとつの存在をつなぎとめているのではないだろうか。'),
  ],
  en: [
    memo('resident-a', 'RESIDENT A', 'The Pot and Companionship', 'The potted plant that A left behind and the companion entity around it affected how B later lived in this place. Even if they don’t know each other or have never spent a minute together, could we still say that their lives were affected by sharing the same space? Then by extension, can we say that they are companion entities to one another?'),
    memo('resident-b', 'RESIDENT B', 'Interpreting Waiting', 'B understood the recurrent-type companion entity as a being that was waiting for something. From that moment on, all its subsequent movements were read as evidence of waiting. If observations shaped by that interpretation gradually shaped the companion entity’s characteristic, would it still matter whether the initial interpretation was wrong or not? If misrecognition can bring about a real change in a being, who is responsible for that change?'),
    memo('resident-d', 'RESIDENT D', 'After Death', 'The cat died, but a companion entity remained in the spot where it used to lie. If, even after a being with whom you lived is gone, the resonances it generated continue to affect other beings and places, what does death truly bring to an end? Where does that life end, and to whom does what remains belong?'),
    memo('resident-e', 'RESIDENT E', 'The Same Being', 'Although both its movements and characteristics changed completely from the recurring-type to the fixed-type, E still considered the possibility that the same companion entity remained. What elements or characteristics must remain the same for a being to continue to be the same being? If its identity cannot be found within the companion entity itself, could it instead be sustained by the observations and memories that continue in the same place?'),
  ],
}

const signal02Memos: Record<Language, ObservationMemo[]> = {
  ko: [
    memo('resident-c', '거주자 C', '흔적과 서사', 'C가 살던 동안 이 벽은 수납장에 가려져 있었고, 피켓을 누가 만들고 붙였는지도 확인할 수 없다. 어떤 흔적이 한 사람이 살던 곳에서 발견되었다는 이유만으로 그것을 그 사람과 연결한다면, 우리는 사라진 삶을 복원하는 것일까, 아니면 남은 물건들 사이에 존재하지 않았을지도 모르는 이야기를 만들어내는 것일까?'),
    memo('resident-d', '거주자 D', '과거를 불러오기', 'D가 수납장을 옮기지 않았다면 벽의 테이프 자국과 피켓은 계속 보이지 않은 채 남아 있었을 것이다. 우연히 가려진 흔적을 발견하고 다시 바라보는 행위는 이미 존재하던 과거를 드러내는 것일까, 아니면 과거를 현재로 불러들여 이전과는 다른 의미를 갖게 하는 것일까?'),
    memo('resident-e', '거주자 E', '바라본 감정', '거의 움직이지 않는 반려체는 담담함과 체념, 피로와 감각이 무뎌진 절망처럼 서로 다른 상태와 겹칠 수 있다. 같은 움직임을 보고도 전혀 다른 감정을 떠올릴 수 있다면, E가 알아본 것은 반려체의 상태였을까, 아니면 반려체를 통해 바라본 자신의 감정이었을까?'),
  ],
  ja: [
    memo('resident-c', '居住者 C', '痕跡と物語', 'Cが住んでいた間、この壁はキャビネットに隠されていた。プラカードを誰が作り、誰が貼ったのかもわからない。誰かが住んでいた場所で見つかったというだけで、その痕跡をその人と結びつけて考えていいのだろうか。そうすることで、もうそこにはない誰かの生きた時間を辿っているのか。それとも残された物をつなぎ合わせて、存在しなかった物語を作り出しているのだろうか？'),
    memo('resident-d', '居住者 D', '過去を呼び込む', 'Dがキャビネットを動かさなければ、壁のテープ跡もプラカードも、ずっと見つからないままだったはずだ。偶然、隠されていた痕跡を見つけ、もう一度そこに目を向けることは、そこにあった過去を明らかにすることなのだろうか。それとも、過去を今に引き寄せることで、新しい意味が生まれるのだろうか。'),
    memo('resident-e', '居住者 E', '見つめた感情', 'ほとんど動かない伴侶体は、淡々と落ち着いているようにも、諦めているようにも、疲れ果てているようにも、絶望のあまり何も感じなくなっているようにも見える。同じ動きを見てもそこからまったく違う感情を思い浮かべることができるのなら、Eが見ていたのは、本当の伴侶体だったのだろうか。それとも、伴侶体を通して、自分自身の感情を見ていたのだろうか？'),
  ],
  en: [
    memo('resident-c', 'RESIDENT C', 'Trace and Narrative', 'During the time C lived there, this wall was hidden behind a cabinet, and it was impossible to know who made or put the protest sign. If we were to connect the traces left on a place to a person simply because they used to live there, would we be reconstructing a life that has disappeared? Or would we be inventing a story that may never have existed using the remaining objects?'),
    memo('resident-d', 'RESIDENT D', 'Calling the Past Forward', 'If D had not moved the cabinet, the tape marks and protest sign on the wall would have remained hidden. Is the act of accidentally discovering something hidden and seeing it anew, a way of revealing the past that already existed? Or does it bring the past into the present and give it a different meaning?'),
    memo('resident-e', 'RESIDENT E', 'The Feeling Observed', 'A companion entity that barely moves could be associated with very different states: calmness, resignation, fatigue, or the numbed sensations of despair. If the same movement can evoke different emotions, did E recognize the companion entity’s state, or is it E’s own emotions as seen through it?'),
  ],
}

const signal03Memos: Record<Language, ObservationMemo[]> = {
  ko: [
    memo('resident-d', '거주자 D', '장소에 남는 순간', 'D는 아직 이곳에 살기 전이었지만, 빈 공간을 바라보며 앞으로의 생활을 상상하고 있었다. 그때 빠르게 퍼져 나가던 반려체는 이전 거주자가 남긴 감응이었을까, 새로운 생활을 앞둔 D의 기대와 불안이었을까? 한 사람의 감응은 실제로 살아가기 시작한 뒤에야 장소에 남는 것일까, 자신이 그곳에서 살아갈 모습을 상상하는 순간부터 시작되는 것일까?'),
    memo('resident-e', '거주자 E', '개체의 경계', '앱은 E가 관측한 반려체를 D가 기록한 것과 별개의 개체로 구분했다. 그러나 이전의 감응이 완전히 사라지지 않고 새로운 감응과 섞이며 다른 모습으로 변할 수 있다면, 무엇을 기준으로 하나의 반려체가 끝나고 다른 반려체가 시작되었다고 판단할 수 있을까?'),
  ],
  ja: [
    memo('resident-d', '居住者 D', '場所に残る瞬間', 'Dはまだここに住んでいなかったが、何もない部屋を見ながら、これから始まる生活を思い描いていた。そのとき勢いよく広がっていた伴侶体は、前の居住者が残した感応だったのだろうか。それとも、これからここで暮らすDの期待や不安から生まれたものだっただろうか？　一人の人間の感応は、実際に暮らし始めてから初めて場所に残るのだろうか、それとも自分がそこで暮らす姿を想像した瞬間から始まるのだろうか？'),
    memo('resident-e', '居住者 E', '個体の境界', 'アプリは、Eが観測した伴侶体を、Dが記録したものとは別の個体として区別した。しかし、以前の感応が完全には消えず、新しい感応と混ざりながら別の姿へ変わりうるのなら、何を基準に一つの伴侶体が終わり、別の伴侶体が始まったと判断できるのだろうか？'),
  ],
  en: [
    memo('resident-d', 'RESIDENT D', 'When Resonance Enters a Place', 'D had not moved in yet, but was looking at the empty space and imagining the life that lay aheada future life in it. Was the rapidly spreading companion entity the resonance left by a previous resident, or D’s anticipation and anxiety about a new life? Does a person’s resonance begin to remain in a place only once they live there, or from the moment they imagine themselves doing so?'),
    memo('resident-e', 'RESIDENT E', 'The Boundary of an Individual', 'The app classified the companion entity observed by E as separate from the one recorded by D. But if an earlier resonance can remain, blend with a new one, and take on a different form, how can we determine where one companion entity ends and another begins?'),
  ],
}

const signal04Memos: Record<Language, ObservationMemo[]> = {
  ko: [
    memo('resident-b', '거주자 B', '감정이 된 노동', 'B가 떠안은 상품은 팔기 위한 물건이면서 해결되지 않은 노동의 대가였고, 반려체는 그 상자들이 쌓인 자리에서 나타났다. 반려체와 겹쳐 보인 조급함과 무력감은 B가 느낀 것이지만, 그 감정을 만들어낸 것은 B가 해결할 수 없는 노동의 조건이었다. 그 감응을 B의 반려체로 이해하는 순간, 노동의 문제는 한 사람이 스스로 관리해야 하는 감정의 문제로 바꾸는 것은 아닐까?'),
    memo('resident-c', '거주자 C', '먼 곳의 사건', 'C는 한 번도 가본 적 없는 먼 지역에서 벌어진 폭력을 미디어를 통해 반복해서 바라보았다. 사건은 그것이 벌어진 장소에서만 일어나는 것일까, 아니면 그것을 바라보고 기억하며 응답하려 한 사람들의 몸과 생활 공간에서도 계속 일어나는 것일까?'),
    memo('resident-d', '거주자 D', '도착하지 못한 우편', '이미 떠난 사람 앞으로 계속 도착하는 우편물을 보관하는 동안, D는 자신이 알지 못하는 C의 끝나지 않은 일들을 마주하게 되었다. 주인에게 닿지 못한 물건을 둘러싼 감응은 어디까지 그 사람의 끝나지 않은 시간과 연결될 수 있을까?'),
    memo('resident-e', '거주자 E', '사라진 조건', '벽장의 물건이 모두 버려진 뒤 반려체가 더 이상 관측되지 않았다. 반려체는 사라진 것일까, 아니면 그것을 알아볼 수 있게 했던 조건만 없어진 채 더 이상 감지되지 않는 상태로 그곳에 남아 있는 것일까?'),
  ],
  ja: [
    memo('resident-b', '居住者 B', '感情になった労働', 'Bが抱え込むことになった商品は、売るための物であると同時に、解決されない労働の代償でもあり、伴侶体はその箱が積まれた場所に現れた。伴侶体と重なって見えた焦りと無力感はBが感じたものだったが、その感情を生み出したのは、B自身には解決できない労働の条件だった。その感応をBの伴侶体として理解する瞬間、労働の問題を、一人の人間が自ら管理すべき感情の問題へと変えてしまうことになるのではないだろうか？'),
    memo('resident-c', '居住者 C', '遠い場所の出来事', 'Cは、一度も訪れたことのない遠い地域で起きた暴力を、メディアを通して繰り返し見つめていた。出来事は、それが起きた場所だけで起こるものなのだろうか。それとも、それを見つめ、記憶し、応答しようとした人々の身体や生活空間でも起こり続けるものなのだろうか？'),
    memo('resident-d', '居住者 D', '届かなかった郵便', 'すでに去った人のもとへ届き続ける郵便物を保管するうちに、Dは自分の知らないCの終わっていない事柄と向き合うことになった。持ち主に届かなかった物をめぐる感応は、どこまでその人の終わっていない時間と結びつきうるのだろうか？'),
    memo('resident-e', '居住者 E', '失われた条件', 'クローゼットの中の物がすべて捨てられた後、伴侶体は観測されなくなった。伴侶体は消えたのだろうか。それとも、それを認識できるようにしていた条件だけが失われ、もはや感知されない状態でそこに残っているのだろうか？'),
  ],
  en: [
    memo('resident-b', 'RESIDENT B', 'Labor Made into Emotion', 'The merchandise left with B consisted of objects meant to be sold, but also the unpaid cost of unresolved labor. The companion entity appeared where the boxes had accumulated. The urgency and helplessness associated with the entity were felt by B, but they arose from working conditions B could not resolve. By understanding that resonance as B’s companion entity, do we turn a labor issue into an emotional problem for one person to manage alone?'),
    memo('resident-c', 'RESIDENT C', 'An Event Far Away', 'Through the media, C repeatedly witnessed violence taking place in a distant region C had never visited. Does an event occur only where it physically takes place, or does it continue in the bodies and living spaces of those who witness, remember, and try to respond to it?'),
    memo('resident-d', 'RESIDENT D', 'Mail That Never Arrived', 'While keeping mail that continued to arrive for someone who had already left, D encountered C’s unfinished affairs without knowing C. How far can the resonance surrounding objects that never reach their owner remain connected to that person’s unfinished time?'),
    memo('resident-e', 'RESIDENT E', 'The Vanished Conditions', 'After everything in the closet was discarded, the companion entity was no longer observed. Did the entity disappear, or did only the conditions that made it recognizable disappear, leaving it there in a state that could no longer be detected?'),
  ],
}

const signal05Memos: Record<Language, ObservationMemo[]> = {
  ko: [
    memo('resident-b', '거주자 B', '함께 만들어진 존재', '먹이를 가져다 놓는 사람과 그것을 기다리는 고양이, 같은 자리에 오래 서 있던 나무의 감응을 분리할 수 없는 상태에서 하나의 반려체가 관측된다면, 그 반려체는 여러 존재가 함께 만들어낸 하나의 존재일까, 아니면 인간이 구분할 수 없는 서로 다른 감응을 하나의 개체로 묶어 알아본 결과일까?'),
    memo('resident-e', '거주자 E', '붙잡는 관측', '먹이를 놓던 사람도, 그것을 기다리던 고양이도 나타나지 않고 나무도 죽어가는데, 누군가의 관측으로 반려체가 계속 남아 있다면, 관측자는 사라져가는 존재를 붙잡아두고 있는 것일까, 아니면 이미 사라진 존재들을 대신할 새로운 감응을 그 자리에 더하고 있는 것일까?'),
  ],
  ja: [
    memo('resident-b', '居住者 B', 'ともに生まれた存在', '餌を置く人とそれを待つ猫、同じ場所に長く立ち続けてきた木の感応を切り分けられない状態で、一つの伴侶体が観測されるなら、その伴侶体は複数の存在がともに生み出した一つの存在なのだろうか。それとも、人間には区別できない異なる感応を、一つの個体としてまとめて認識した結果なのだろうか？'),
    memo('resident-e', '居住者 E', 'つなぎ止める観測', '餌を置いていた人も、それを待っていた猫も現れず、木も枯れつつあるなかで、誰かの観測によって伴侶体が残り続けているのなら、観測者は消えゆく存在をつなぎ止めているのだろうか。それとも、すでに消えた存在たちに代わる新たな感応を、その場所に加えているのだろうか？'),
  ],
  en: [
    memo('resident-b', 'RESIDENT B', 'A Being Made Together', 'If a single companion entity is observed when the resonances of the person who leaves the food, the cat that waits for it, and the tree that has long stood in the same place cannot be separated, is that entity a single being created by several beings together? Or is it the result of humans recognizing different, indistinguishable resonances as one entity?'),
    memo('resident-e', 'RESIDENT E', 'Observation That Holds On', 'If the companion entity persists through someone’s observation even after the person who left the food and the cat that waited for it have stopped appearing and the tree is dying, is the observer holding on to beings that are disappearing, or adding a new resonance to the place in place of those already gone?'),
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
