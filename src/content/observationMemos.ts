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
    memo('resident-a', '居住者 A', '鉢植えと伴侶', 'Aが残した植木鉢と、そのまわりに現れた伴侶体は、あとからここで暮らすBにも影響していた。互いを知らなくても、同じ時間を過ごしていなくても、ひとつの場所を介して互いの人生を変えるのだとしたら、彼らはすでに互いにとって伴侶であると言えるだろうか？'),
    memo('resident-b', '居住者 B', '待つことの解釈', 'Bは「反復型伴侶体」を、何かを待っている存在だと理解した。それからは、伴侶体の動きもすべて「待っている」ことの証拠として読み取るようになった。そして、そのような解釈にもとづく観測によって、伴侶体の性質が少しずつ固定されていくのだとしたら、最初の解釈が正しかったかどうかは、もはや重要ではなくなるかもしれない。たとえ最初は見誤っていたとしても、それによってひとつの存在のあり様が実際に変化してしまうのだとしたら、その変化に対する責任は誰にあるのだろうか。'),
    memo('resident-d', '居住者 D', '死のあと', '猫の死によって一つの生は終焉したが、猫がいつもいたその場所には伴侶体が残っていた。一緒に暮らしてきた存在がいなくなった後も、その存在によって生じた感応がほかの存在や場所に影響を与え続けるのだとしたら、死は何の終わりで、そこに残ったものは、誰の生に属すると言えるのだろうか。'),
    memo('resident-e', '居住者 E', '同じ存在', '反復型から固定型へと動きや特性、その全てが変わっていったが、Eはそれら伴侶体が同じひとつの存在である可能性を考えた。ある存在が、ずっと同じ存在であり続けるために、変わってはならないものとは何だろうか。その同一性を伴侶体の内に見出すことができなかったとしたら、同じ場所で続けられてきた観測や記憶が、ひとつの存在をつなぎとめているのではないだろうか。'),
  ],
  en: [
    memo('resident-a', 'RESIDENT A', 'The Pot and Companionship', 'The potted plant that A left behind and the companion entity around it affected how B later lived in this place. Even if they don’t know each other or have never spent a minute together, could we still say that their lives were affected by sharing the same space? Then by extension, can we say that they are companion entities to one another?'),
    memo('resident-b', 'RESIDENT B', 'Interpreting Waiting', 'B understood the recurrent-type companion entity as a being that was waiting for something. From that moment on, all its subsequent movements were read as evidence of waiting. If observations shaped by that interpretation gradually shaped the companion entity’s characteristic, would it still matter whether the initial interpretation was wrong or not? If mis-recognition can bring about a real change in a being, who is responsible for that change?'),
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
    memo('resident-c', '居住者 C', '痕跡と物語', 'Cが住んでいた間、この壁はキャビネットに覆われており、そのプラカードを誰が作り、誰が貼ったのかを確認することはできない。ある痕跡が、その人が住んでいた場所から見つかったというだけで、その人と結びつけるのだとしたら、わたしたちは消えてしまった生活を復元しているのだろうか。それとも、残された物とのあいだに、存在しなかったかもしれない物語を作り出しているのだろうか。'),
    memo('resident-d', '居住者 D', '過去を呼び込む', 'Dがキャビネットを動かさなければ、壁のテープ跡もプラカードも、ずっと見つからないままそこに残っていたはずだ。隠れていた痕跡を偶然見つけ、もう一度そこに目を向ける行為は、そこに存在した過去を明らかにすることなのだろうか。それとも、過去を現在に引き寄せることで、以前とは違う意味を生み出すことなのだろうか。'),
    memo('resident-e', '居住者 E', '見つめた感情', 'ほとんど動かない伴侶体は、淡々と落ち着いているようにも、諦めているようにも、疲れ果てているようにも、絶望のあまり何も感じなくなっているようにも見える。同じ動きから、まったく違う感情を想像させるのだとしたら、Eが見たのは伴侶体の状態だったのだろうか。それとも伴侶体を通して見た自信の感情だったのだろうか？'),
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
    memo('resident-d', '居住者 D', '場所に残る瞬間', 'Dは実際にこの場所に住む前から、何もない部屋を見ながらこれから始まる生活を思い描いていた。そのとき勢いよく広がっていった伴侶体は、前の居住者が残した感応に由来するものだったのだろうか。それともこの場所での新しい生活を前にした、Dの期待や不安によるものだったのだろうか。人の感応は、実際にそこで暮らし始めてからその場に現れるものなのか。それとも、そこで暮らす自分を想像した瞬間から現れ始めるものなのだろうか？'),
    memo('resident-e', '居住者 E', '個体の境界', 'Eが観測した伴侶体とDが記録したものは、別の個体であるとアプリは判別した。しかし、以前の感応が完全には消えず、新しい感応と混ざりながら別のかたちへと姿を変えていくことがあるのなら、何を基準にひとつの伴侶体が終わりを迎え、また新たな伴侶体が現れたと判断したらよいのだろうか？'),
  ],
  en: [
    memo('resident-d', 'RESIDENT D', 'When Resonance Enters a Place', 'D had not moved in yet, but was looking at the empty space and imagining the life that lay ahead. Was the companion entity that spread fast in the space, the resonance left by a previous resident, or was it an expression of D’s anticipation and anxiety about the new life to come? Does a person’s resonance begin to emerge and remain in a place only after they actually start living there, or does it already emerge from the moment they imagine it?'),
    memo('resident-e', 'RESIDENT E', 'The Boundary of an Individual', 'The app classified the companion entity observed by E as separate from the one recorded by D. But if an earlier resonance doesn’t completely disappear and, instead, blends with a new resonance to take on a different form, how can we determine where one companion entity ends and another begins?'),
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
    memo('resident-b', '居住者 B', '感情になった労働', 'Bが抱えることになった在庫は、売るための商品であると同時に、未解決のまま残された労働の対価でもあり、伴侶体はその箱が積み上げられた場所に現れた。伴侶体と重なって見えた焦りや無力感はBが感じた感情だったが、これらはBにはどうすることもできない労働の条件が生んだものだった。この感応をBの伴侶体と理解した瞬間、労働に関する問題を、ひとりの人間が自ら管理しなければならない感情の問題へと置き換えてしまうのではないだろうか？'),
    memo('resident-c', '居住者 C', '遠い場所の出来事', 'Cは、一度も訪れたことのない遠い場所で起きた暴力を、メディアを通して繰り返し目にした。出来事というのは、それが実際に起きた場所でのみ起こっているのだろうか。それとも、それを見つめ、記憶し、応答しようとした人々の身体や生活空間においても起こっているのだろうか？'),
    memo('resident-d', '居住者 D', '届かなかった郵便', '既にこの場所を離れた人宛てに届き続ける郵便物を保管するあいだ、Dは、会ったことのないCの、終わっていない事柄に向き合うことになった。持ち主のもとに届くことなく残った物たちを取り巻く感応は、まだどこかで続いている時間と、どこまで繋がっているのだろうか？'),
    memo('resident-e', '居住者 E', '失われた条件', '押し入れに残っていたものがすべて処分されると、伴侶体は観測されなくなった。伴侶体は消えたのだろうか。それとも、伴侶体を認識することを可能にしていた条件だけが失われ、もはや検出できない状態で、今もそこに残っているのだろうか？'),
  ],
  en: [
    memo('resident-b', 'RESIDENT B', 'Labor Made into Emotion', 'The merchandise B was left with were both items to be sold and the result of unresolved, unpaid labor. The companion entity appeared where the boxes had been piled up. The urgency and helplessness that seemed to overlap with the companion entity were the feelings that B experienced, but they were, in fact, generated by the working conditions that were out of B’s control. The moment we understand that that resonance is B’s companion entity, do we risk turning a problem of labor into an emotional one which an individual is expected to manage and resolve alone?'),
    memo('resident-c', 'RESIDENT C', 'An Event Far Away', 'Through the media, C repeatedly witnessed violence taking place in a region far away, a place that C had never visited. Does an event occur only where it physically takes place, or does it continue to unfold in the bodies and living spaces of those who witness, remember, and try to respond to it?'),
    memo('resident-d', 'RESIDENT D', 'Mail That Never Arrived', 'While keeping mail that continued to arrive for someone who had already moved out, D had to face the unfinished affairs of C—someone who D had never met. To what extend can the resonance that surround objects that will never reach the intended recipient remain connected to that person and the person’s unfinished time?'),
    memo('resident-e', 'RESIDENT E', 'The Vanished Conditions', 'After everything in the closet was thrown away, the companion entity was no longer detected. Had the companion entity itself disappear, or did the conditions that made it detectable disappear, leaving the entity in a state that could no longer be detected?'),
  ],
}

const signal05Memos: Record<Language, ObservationMemo[]> = {
  ko: [
    memo('resident-b', '거주자 B', '함께 만들어진 존재', '먹이를 가져다 놓는 사람과 그것을 기다리는 고양이, 같은 자리에 오래 서 있던 나무의 감응을 분리할 수 없는 상태에서 하나의 반려체가 관측된다면, 그 반려체는 여러 존재가 함께 만들어낸 하나의 존재일까, 아니면 인간이 구분할 수 없는 서로 다른 감응을 하나의 개체로 묶어 알아본 결과일까?'),
    memo('resident-e', '거주자 E', '붙잡는 관측', '먹이를 놓던 사람도, 그것을 기다리던 고양이도 나타나지 않고 나무도 죽어가는데, 누군가의 관측으로 반려체가 계속 남아 있다면, 관측자는 사라져가는 존재를 붙잡아두고 있는 것일까, 아니면 이미 사라진 존재들을 대신할 새로운 감응을 그 자리에 더하고 있는 것일까?'),
  ],
  ja: [
    memo('resident-b', '居住者 B', 'ともに生まれた存在', '餌を置く人、それを待つ猫、そして同じ場所に立ち続けてきた木。どの感応が誰のものなのか分からない状態で、ひとつの伴侶体が観測されたとしたら、その伴侶体は、いくつもの存在が一緒につくり出した、ひとつの存在なのだろうか。それとも、本当はいくつもある感応を、人間が区別できずにひとつの伴侶体として認識しているだけなのだろうか？'),
    memo('resident-e', '居住者 E', 'つなぎ止める観測', '餌を置いていた人も、それを待っていた猫も、もう姿を見せない。木も枯れかけている。それでも誰かが観測を続けることで、伴侶体がそこに残り続けているのだとしたら、観測する人は、消えゆく存在をつなぎとめているのだろうか。それとも、すでにいなくなった存在たちに代わる新たな感応を、その場所に生じさせているのだろうか？'),
  ],
  en: [
    memo('resident-b', 'RESIDENT B', 'A Being Made Together', 'If one companion entity is detected where more than one resonances exist—the resonance of the person who leaves the cat food, the cat that waits for it, and the tree that has long stood in the same place—and cannot be separated, is that single companion entity jointly created by multiple beings? Or is it the result of humans perceiving several different resonances—ones they cannot distinguish separately—as a single entity?'),
    memo('resident-e', 'RESIDENT E', 'Observation That Holds On', 'If the companion entity can still be detected even after the person no longer leaves food for the cat, the cat no longer turns up for it, and the tree is slowly dying, does it mean that the observer is the one holding on to beings that are fading away, or is the observer adding a new resonance in their place, one that substitutes for those already gone?'),
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
