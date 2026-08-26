import type { Language, SignalId } from '../store/experienceStore'

export interface ObservationMemo {
  id: string
  resident: string
  title: string
  body: string
}

const memo = (id: string, resident: string, title: string, body: string): ObservationMemo => ({
  id,
  resident,
  title,
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
    memo('resident-a', '居住者 A', '鉢植えと伴侶', 'Aが残した鉢植えとその周囲の伴侶体は、その後、Bがこの場所を経験するための条件となった。互いを認識することもなく、同じ時間を生きてもいない存在たちが、一つの場所を通して互いの生を変えるのなら、彼らはすでに互いにとって伴侶になっていたと言えるだろうか？'),
    memo('resident-b', '居住者 B', '待つことの解釈', 'Bは反復型の伴侶体を、何かを待っている存在として理解した。その瞬間から、その後の動きもすべて待つことの証しとして読まれ、そうした解釈にもとづく観測が伴侶体の特性を次第に固定していくとすれば、最初の解釈が間違っていたかどうかは、依然として重要なのだろうか？　たとえ誤った認識の仕方であっても、一つの存在を実際に変化させうるのなら、その変化に対する責任は誰にあるのだろうか？'),
    memo('resident-d', '居住者 D', '死のあと', '猫の死によって一つの生は終わりを迎えたが、猫が留まっていた場所には伴侶体が残っていた。ともに生きてきた存在がいなくなった後も、その存在によって生じた感応が別の存在や場所を変化させ続けるのなら、死とは何の終わりであり、その後も残るものは誰の生に属すると言えるのだろうか？'),
    memo('resident-e', '居住者 E', '同じ存在', '反復型から固定型へと動きも特性もすべて変わったにもかかわらず、Eは同じ伴侶体が残っている可能性を考えた。一つの存在が同じ存在であり続けるためには、何が変わらずにいなければならないのだろうか？　その同一性を伴侶体の内側に見いだせないのなら、同じ場所で続いてきた観測と記憶が、一つの存在を持続させているのではないだろうか？'),
  ],
  en: [
    memo('resident-a', 'RESIDENT A', 'The Pot and Companionship', 'The potted plant A left behind, and the companion around it, later became the conditions through which B experienced this place. If beings who never recognized one another and did not live through the same time nevertheless change one another’s lives through a shared place, could we say that they had already become companions to one another?'),
    memo('resident-b', 'RESIDENT B', 'Interpreting Waiting', 'B understood the repetitive-type companion as a being that was waiting. From that moment on, every subsequent movement was read as evidence of waiting. If observation shaped by that interpretation gradually fixes the companion’s characteristics, does it still matter whether the first interpretation was wrong? If even a mistaken way of recognizing a being can actually change it, who bears responsibility for that change?'),
    memo('resident-d', 'RESIDENT D', 'After Death', 'One life ended with the cat’s death, yet a companion remained in the place where the cat used to stay. If the resonance created by a being continues to change other beings and places after the being with whom we lived has disappeared, what does death bring to an end, and to whose life does what remains afterward belong?'),
    memo('resident-e', 'RESIDENT E', 'The Same Being', 'Although both its movement and characteristics changed from the repetitive type to the fixed type, E considered the possibility that the same companion remained. What must remain unchanged for a being to continue being the same being? If that identity cannot be found within the companion itself, might the observation and memory continued in the same place be what sustains a single being?'),
  ],
}

const signal02Memos: Record<Language, ObservationMemo[]> = {
  ko: [
    memo('resident-c', '거주자 C', '흔적과 서사', 'C가 살던 동안 이 벽은 수납장에 가려져 있었고, 피켓을 누가 만들고 붙였는지도 확인할 수 없다. 어떤 흔적이 한 사람이 살던 곳에서 발견되었다는 이유만으로 그것을 그 사람과 연결한다면, 우리는 사라진 삶을 복원하는 것일까, 아니면 남은 물건들 사이에 존재하지 않았을지도 모르는 이야기를 만들어내는 것일까?'),
    memo('resident-d', '거주자 D', '과거를 불러오기', 'D가 수납장을 옮기지 않았다면 벽의 테이프 자국과 피켓은 계속 보이지 않은 채 남아 있었을 것이다. 우연히 가려진 흔적을 발견하고 다시 바라보는 행위는 이미 존재하던 과거를 드러내는 것일까, 아니면 과거를 현재로 불러들여 이전과는 다른 의미를 갖게 하는 것일까?'),
    memo('resident-e', '거주자 E', '바라본 감정', '거의 움직이지 않는 반려체는 담담함과 체념, 피로와 감각이 무뎌진 절망처럼 서로 다른 상태와 겹칠 수 있다. 같은 움직임을 보고도 전혀 다른 감정을 떠올릴 수 있다면, E가 알아본 것은 반려체의 상태였을까, 아니면 반려체를 통해 바라본 자신의 감정이었을까?'),
  ],
  ja: [
    memo('resident-c', '居住者 C', '痕跡と物語', 'Cが住んでいた間、この壁は収納棚に隠されており、プラカードを誰が作り、貼ったのかも確認できない。ある痕跡が一人の人間の暮らしていた場所で見つかったという理由だけで、その痕跡をその人と結びつけるなら、私たちは失われた生を復元しているのだろうか、それとも残された物の間に、存在しなかったかもしれない物語を作り出しているのだろうか？'),
    memo('resident-d', '居住者 D', '過去を呼び込む', 'Dが収納棚を動かさなければ、壁のテープ跡とプラカードは、見えないまま残り続けていただろう。偶然、隠されていた痕跡を発見し、あらためて見つめる行為は、すでに存在していた過去を明らかにすることなのだろうか、それとも過去を現在へと呼び込み、以前とは異なる意味を持たせることなのだろうか？'),
    memo('resident-e', '居住者 E', '見つめた感情', 'ほとんど動かない伴侶体は、静かな落ち着きや諦念、疲労、そして感覚が麻痺した絶望のような、互いに異なる状態と重なりうる。同じ動きを見てもまったく異なる感情を思い浮かべることができるのなら、Eが見いだしたのは伴侶体の状態だったのだろうか、それとも伴侶体を通して見つめた自分自身の感情だったのだろうか？'),
  ],
  en: [
    memo('resident-c', 'RESIDENT C', 'Trace and Narrative', 'While C lived here, this wall was hidden behind a storage cabinet, and it is impossible to confirm who made and attached the placard. If we connect a trace to a person merely because it was found where that person once lived, are we reconstructing a vanished life, or creating among the remaining objects a story that may never have existed?'),
    memo('resident-d', 'RESIDENT D', 'Calling the Past Forward', 'Had D not moved the storage cabinet, the tape marks and placard on the wall would have remained unseen. Does the act of discovering a trace hidden by chance and looking at it anew reveal a past that already existed, or does it summon the past into the present and give it a meaning different from before?'),
    memo('resident-e', 'RESIDENT E', 'The Feeling Observed', 'A companion that barely moves may overlap with very different states: composure and resignation, fatigue, or a despair in which sensation has grown numb. If the same movement can evoke entirely different emotions, did E recognize the companion’s condition, or E’s own feelings viewed through the companion?'),
  ],
}

const signal03Memos: Record<Language, ObservationMemo[]> = {
  ko: [
    memo('resident-d', '거주자 D', '장소에 남는 순간', 'D는 아직 이곳에 살기 전이었지만, 빈 공간을 바라보며 앞으로의 생활을 상상하고 있었다. 그때 빠르게 퍼져 나가던 반려체는 이전 거주자가 남긴 감응이었을까, 새로운 생활을 앞둔 D의 기대와 불안이었을까? 한 사람의 감응은 실제로 살아가기 시작한 뒤에야 장소에 남는 것일까, 자신이 그곳에서 살아갈 모습을 상상하는 순간부터 시작되는 것일까?'),
    memo('resident-e', '거주자 E', '개체의 경계', '앱은 E가 관측한 반려체를 D가 기록한 것과 별개의 개체로 구분했다. 그러나 이전의 감응이 완전히 사라지지 않고 새로운 감응과 섞이며 다른 모습으로 변할 수 있다면, 무엇을 기준으로 하나의 반려체가 끝나고 다른 반려체가 시작되었다고 판단할 수 있을까?'),
  ],
  ja: [
    memo('resident-d', '居住者 D', '場所に残る瞬間', 'Dはまだここに住み始める前だったが、何もない空間を見つめながら、これからの暮らしを想像していた。そのとき急速に広がっていた伴侶体は、以前の居住者が残した感応だったのだろうか、それとも新しい生活を目前にしたDの期待と不安だったのだろうか？　一人の人間の感応は、実際に暮らし始めてから初めて場所に残るのだろうか、それとも自分がそこで暮らす姿を想像した瞬間から始まるのだろうか？'),
    memo('resident-e', '居住者 E', '個体の境界', 'アプリは、Eが観測した伴侶体を、Dが記録したものとは別の個体として区別した。しかし、以前の感応が完全には消えず、新しい感応と混ざりながら別の姿へ変わりうるのなら、何を基準に一つの伴侶体が終わり、別の伴侶体が始まったと判断できるのだろうか？'),
  ],
  en: [
    memo('resident-d', 'RESIDENT D', 'When Resonance Enters a Place', 'D did not yet live here, but while looking into the empty space, imagined the life that would unfold there. Was the companion spreading rapidly at that moment a resonance left by a previous resident, or D’s expectation and anxiety before a new life? Does a person’s resonance begin to remain in a place only after they actually start living there, or from the moment they imagine themself living there?'),
    memo('resident-e', 'RESIDENT E', 'The Boundary of an Individual', 'The app classified the companion E observed as an individual distinct from the one D had recorded. Yet if an earlier resonance can remain, mingle with a new one, and change into another form, by what standard can we decide that one companion has ended and another has begun?'),
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
    memo('resident-b', 'RESIDENT B', 'Labor Made into Emotion', 'The merchandise B was left to carry was both goods to be sold and the cost of unresolved labor, and the companion appeared where those boxes were stacked. The impatience and helplessness that seemed to overlap with the companion were feelings B experienced, but they were produced by conditions of labor B could not resolve. The moment we understand that resonance as B’s companion, do we transform a problem of labor into a problem of emotion that one person must manage alone?'),
    memo('resident-c', 'RESIDENT C', 'An Event Far Away', 'Through the media, C repeatedly watched violence taking place in a distant region C had never visited. Does an event occur only in the place where it happens, or does it continue to occur in the bodies and living spaces of those who watch it, remember it, and try to respond?'),
    memo('resident-d', 'RESIDENT D', 'Mail That Never Arrived', 'While keeping mail that continued to arrive for someone who had already left, D confronted C’s unfinished affairs without ever having known C. How far can the resonance surrounding objects that failed to reach their owner remain connected to that person’s unfinished time?'),
    memo('resident-e', 'RESIDENT E', 'The Vanished Conditions', 'After every object in the closet was discarded, the companion was no longer observed. Did the companion disappear, or did only the conditions that made it recognizable vanish, leaving it there in a state that could no longer be detected?'),
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
    memo('resident-b', 'RESIDENT B', 'A Being Made Together', 'If a single companion is observed where the resonances of the person who leaves food, the cat that waits for it, and the tree that has long stood in the same place cannot be separated, is that companion one being made together by many beings? Or is it the result of humans gathering distinct resonances they cannot distinguish and recognizing them as a single individual?'),
    memo('resident-e', 'RESIDENT E', 'Observation That Holds On', 'If neither the person who left the food nor the cat that waited for it appears anymore, and the tree is dying, yet someone’s observation allows the companion to remain, is the observer holding a vanishing being in place? Or are they adding to that place a new resonance that takes the place of beings already gone?'),
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
