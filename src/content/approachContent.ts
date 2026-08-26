import type { Language, SignalId } from '../store/experienceStore'

interface ApproachRecord {
  title: string
  body: string
}

const approachContent: Record<Language, Record<SignalId, ApproachRecord>> = {
  ko: {
    'signal-01': {
      title: '01 창가',
      body: 'A에 대해서는 별다른 기록이 남아 있지 않다. B의 친구였던 E는 이사를 도와주러 이 집에 왔다가 B가 가지고 있던 검출기를 처음 경험했다. 창가에는 이전 거주자인 A가 남긴 화분 하나가 있었다. 화분은 이미 죽은 것처럼 보였지만, 그 부근에서 반복형 반려체를 발견했다. B는 반복형이 거듭되는 기다림과 자주 겹치는 유형이라고 설명해주었다. 이 반려체가 언제부터 있었고 얼마나 오래 지속되었는지는 알 수 없었다. 몇 년 뒤 D가 이곳에 살던 시기에는 고양이가 창가의 받침대에 자주 머물렀다. 고양이가 죽은 뒤, 같은 자리에서는 한곳에 오래 머무는 고정형 반려체가 관측되었다. 고정형은 애착과 신뢰, 오래된 상실과 연관된 유형이었다. 이사를 나간 뒤 D는 이 반려체가 아직 남아 있는지 다음 거주자인 E에게 확인을 부탁했다. E도 그 자리에 반려체가 있다는 것을 알고 있었다. 서로 다른 감응이 겹치고 반복해서 관측되면서 처음부터 같은 반려체가 변화를 거치며 남아 있었던 것인지, 거주자들이 서로 다른 종류의 반려체들을 불러들인 것인지 알고 싶어졌다.',
    },
    'signal-02': {
      title: '02 벽',
      body: 'D가 이사 왔을 때 이 벽은 거대한 수납장에 가려져 있었다고 한다. D는 침대를 놓으려고 수납장을 치우다가 벽에 남은 테이프 자국과 수납장 뒤로 떨어져 있던 피켓을 발견했다. 피켓에는 학살을 멈추고 아이들을 죽이는 공격을 중단하라는 내용이 적혀 있었다. 아마도 벽 위쪽에 붙어 있다가 수납장 뒤로 떨어진 듯했다. E는 이곳에서 거의 움직이지 않는 저진폭형 반려체를 발견했다. 저진폭형은 오랫동안 이어진 피로와 고독, 어떤 상태를 받아들이는 데서 오는 담담함이나 체념과도 겹친다. 이 반려체를 불러들인 것은 담담함이었을까, 감각이 무뎌진 절망이었을까. 여러 거주자의 시간이 같은 벽 앞에 쌓여 있어, 이 반려체를 어느 한 사람의 생활이나 감정으로 돌릴 수는 없을 것 같았다.',
    },
    'signal-03': {
      title: '03 안쪽',
      body: 'D가 이사할 집을 처음 보러 왔을 때, 안쪽의 빈 공간에는 빠르게 퍼져 나가는 확산형 반려체가 있었다고 한다. 확산형은 아직 일어나지 않은 일을 향해 마음이 여러 방향으로 뻗어 나갈 때 나타난다. 침대가 놓여 있었던 것으로 보이는 이 자리에 D가 테이블과 의자를 두고 생활하기 시작한 뒤에는 반려체가 차츰 약해지다가 사라졌다고 했다. E가 이곳에 침대를 놓자 확산형 반려체가 다시 나타났다. 비자를 연장하기 위해 애썼던 지난 1년 동안 점점 강해져, 어느 순간 이 집에서 가장 변화가 뚜렷한 반려체가 되었다. 이곳을 떠날 가능성이 점점 높아질 수록, 넓게 퍼지던 모습은 침대 위로 오므라들었고, 같은 움직임을 되풀이하기 시작했다. 수축형과 반복형의 특성을 함께 가진 모습이었다. 슬픔과 불안으로 움츠러들고, 쉽게 놓이지 않는 기대와 미련이 같은 자리를 맴도는 것처럼 보였다. 앱은 D가 기록한 반려체와 별개의 개체로 등록했지만, E는 이 반려체가 정말 새로운 존재인지 의심하게 되었다. 이전의 반려체가 완전히 사라지지 않고 남아 있다가 다른 모습으로 변해온 것은 아닐까. 이곳에 대한 애증과 미련과 기대가 분리되지 않은 채 섞이게 된 것은 아닐까. E는 간절히 자신의 집이라 부르고 싶었지만 결코 그렇게 되지 않을 이곳에서, 자신처럼 이곳에 살면서도 정착하지 못하는 반려체와 함께 누워 있었다.',
    },
    'signal-04': {
      title: '04 벽장',
      body: 'B는 비정규직으로 일하던 곳에 문제가 생기면서 제대로 정산받지 못한 채 상품 재고를 잔뜩 떠안게 되었다. 어떻게든 팔 수 없을까 궁리하다가 E에게 전화를 걸었다. 벽장 안에 상자를 잔뜩 쌓아두었는데, 그 사이에서 반려체가 생겼다고 머쓱하게 말했다. 잠잠히 있다가도 이리저리 뛰어다닌다고 했다. E는 달리 도와줄 방법이 없었고, 그것이 두 사람의 마지막 연락이었다. 몇 년 뒤 D가 이사 왔을 때, 벽장 안에는 이전 거주자 C가 남긴 작은 수첩이 있었다고 한다. 수첩에는 C가 자주 보던 인터넷 방송의 목록과 이곳에서 멀리 떨어진 어느 지역의 역사가 조각조각 정리되어 있었다. 추방, 봉쇄 같은 단어에는 종이가 눌릴 만큼 분노가 들어가 있었다. 가끔 C 앞으로 고지서나 안내문이 도착하면 D는 전해줄 곳을 알지 못해 수첩 위에 차곡차곡 쌓아두었다. 당시 벽장에는 불규칙형 반려체가 살고 있었다고 한다. 불규칙형은 어떻게든 해야 한다는 조급함과 아무것도 할 수 없다는 무력감 사이를 무작정 오가는 마음과 닮아 있었다. 잠시 잊은 듯하다가도 어떤 일이 불쑥 다시 마음에 걸리는 것 같은 상태. D는 이사를 나가기 전 벽장 구석에 남아 있던 물건들을 모두 정리했다. E가 입주했을 때 그곳에는 더 이상 반려체는 없었다.',
    },
    'signal-05': {
      title: '05 집 앞 나무',
      body: 'B가 살고 있었을 때도 집 앞 나무 주변에는 이미 반복형 반려체가 관측되고 있었다. 반복형은 무언가를 기다리거나 되풀이되는 상황을 기대할 때, 되돌아오는 감정과 연관된다. 이 반려체가 언제부터 나무 주변에 머물렀는지는 확인할 수 없다. 나무 아래에는 누가 놓았는지 모를 길고양이의 먹이 그릇이 있었지만, 먹이를 가져다 놓은 사람과 그것을 기다리던 고양이, 그 자리에 계속 서 있던 나무 중 무엇의 감응이 반려체와 연결되어 있었는지는 구분할 수 없었다. E가 살기 시작한 뒤에도 그릇은 늘 비슷한 시간에 채워져 있었지만, 먹이를 놓는 사람과 마주친 적은 없었다. 어느 날 나무에 이곳에 오던 고양이를 찾고 있다는 전단지가 누군가의 연락처와 함께 붙어있었다. 이후 그릇은 몇 번 사라졌다가 다시 놓였고, 고양이는 나타나지 않았다. 그 무렵 반려체는 이전과 같은 경로를 고수하면서도 나무 아래에서 멈춰 서는 시간이 길어져, 반복형과 고정형의 특성을 함께 보이기 시작했다. 전단지가 없어진 이후로도 꽤 오랫동안 반려체는 이전의 움직임을 되풀이했을 것이다. 한참을 잊고 있다가 E가 검출기를 켰을 때 아직 거기 있었기 때문이다. 이제 아무도 오지 않는 것 같은데 반려체가 사라지지 않는 것이 신기했다. 누군가 이 반려체를 등록했고 계속 관측 중이니까 계속 누군가의 감응장에 남아있는 것일테니 말이다. 그런데 어느날부터인가 나무가 말라가기 시작했다. 반려체는 그대로 버티고 있었다. E의 마지막 관측에서는 고독한 저진폭형의 특성만이 남아 있었다.',
    },
  },
  ja: {
    'signal-01': {
      title: '01 窓辺',
      body: 'Aについては、特に記録が残されていない。Bの友人だったEは、引っ越しを手伝うためにこの家を訪れ、Bが持っていた検出器を初めて体験した。窓辺には、以前の居住者であるAが残した鉢植えが一つあった。鉢植えはすでに枯れているように見えたが、その付近で反復型の伴侶体が発見された。Bは、反復型は繰り返される待ちの感情としばしば重なる型だと説明した。この伴侶体がいつから存在し、どれほど長く持続していたのかは分からなかった。数年後、Dがここに住んでいた頃、猫は窓辺の台の上によく留まっていた。猫が死んだ後、同じ場所では一か所に長く留まる固定型の伴侶体が観測された。固定型は、愛着や信頼、長く残る喪失と関わる型だった。引っ越した後、Dはこの伴侶体がまだ残っているかどうか、次の居住者であるEに確認を頼んだ。Eも、その場所に伴侶体がいることを知っていた。異なる感応が重なり、繰り返し観測されるなかで、初めから同じ伴侶体が変化を経ながら残っていたのか、それとも居住者たちがそれぞれ異なる種類の伴侶体を呼び寄せたのか、知りたくなった。',
    },
    'signal-02': {
      title: '02 壁',
      body: 'Dが引っ越してきたとき、この壁は巨大な収納棚に隠されていたという。Dはベッドを置くために収納棚を動かし、壁に残されたテープの跡と、棚の裏に落ちていたプラカードを発見した。プラカードには、虐殺を止め、子どもたちを殺す攻撃を中止せよと書かれていた。おそらく壁の上部に貼られていたものが、収納棚の裏に落ちたのだろう。Eはここで、ほとんど動かない低振幅型の伴侶体を発見した。低振幅型は、長く続いた疲労や孤独、ある状態を受け入れることから生じる静かな落ち着きや諦念とも重なる。この伴侶体を呼び寄せたのは、静かな落ち着きだったのだろうか。それとも、感覚が麻痺した絶望だったのだろうか。複数の居住者の時間が同じ壁の前に積み重なっているため、この伴侶体を特定の一人の暮らしや感情に帰することはできないように思えた。',
    },
    'signal-03': {
      title: '03 奥',
      body: 'Dが引っ越す家を初めて見に来たとき、奥の空いた空間には、素早く広がっていく拡散型の伴侶体がいたという。拡散型は、まだ起きていないことへ向かって、心がいくつもの方向に伸びていくときに現れる。かつてベッドが置かれていたと思われるこの場所に、Dがテーブルと椅子を置いて暮らし始めると、伴侶体は次第に弱まり、やがて消えたという。Eがここにベッドを置くと、拡散型の伴侶体が再び現れた。ビザを延長するために奔走したこの一年のあいだに次第に強まり、いつしかこの家で最も変化の際立つ伴侶体になった。ここを離れなければならない可能性が高まるにつれ、広く拡散していた姿はベッドの上へと縮まり、同じ動きを繰り返すようになった。収縮型と反復型の特徴を併せ持つ姿だった。悲しみと不安によって身を縮め、簡単には手放せない期待と未練が同じ場所を巡っているように見えた。アプリは、Dが記録した伴侶体とは別の個体として登録したが、Eはこの伴侶体が本当に新しい存在なのか疑うようになった。以前の伴侶体が完全には消えずに残り、別の姿へと変わってきたのではないか。この場所に対する愛憎と未練と期待が、切り離されないまま混ざり合ったのではないか。Eはここを自分の家と呼びたいと切実に願っていたが、決してそうはならないこの場所で、自分と同じようにここで暮らしながらも定着できない伴侶体とともに横たわっていた。',
    },
    'signal-04': {
      title: '04 クローゼット',
      body: 'Bは、非正規雇用で働いていた職場で問題が起き、十分な精算を受けられないまま、大量の商品在庫を抱え込むことになった。どうにか売ることはできないかと考え、Eに電話をかけた。クローゼットの中に箱を積み上げていたところ、その隙間から伴侶体が現れたと、きまり悪そうに話した。おとなしくしていたかと思えば、あちこちを走り回るという。Eにはほかに助ける方法がなく、それが二人の最後の連絡となった。数年後、Dが引っ越してきたとき、クローゼットの中には以前の居住者Cが残した小さなノートがあったという。ノートには、Cがよく見ていたインターネット配信の一覧と、ここから遠く離れたある地域の歴史が断片的にまとめられていた。「追放」「封鎖」といった言葉には、紙がへこむほどの怒りが込められていた。ときおりC宛ての請求書や案内文が届くと、Dは届け先が分からず、ノートの上に一枚ずつ重ねて置いた。当時、クローゼットには不規則型の伴侶体が棲んでいたという。不規則型は、どうにかしなければならないという焦りと、何もできないという無力感のあいだを、あてもなく行き来する心に似ていた。いったん忘れたように思えても、何かが不意にまた気にかかるような状態。Dは引っ越す前に、クローゼットの隅に残されていた物をすべて片づけた。Eが入居したとき、そこにはもう伴侶体はいなかった。',
    },
    'signal-05': {
      title: '05 家の前の木',
      body: 'Bが住んでいた頃にも、家の前の木の周囲では、すでに反復型の伴侶体が観測されていた。反復型は、何かを待ったり、繰り返される状況を期待したりするときに立ち戻ってくる感情と関わっている。この伴侶体がいつから木の周囲に留まっていたのかは確認できない。木の下には、誰が置いたのか分からない野良猫の餌皿があった。しかし、餌を置いた人、それを待っていた猫、その場所に立ち続けていた木のうち、何の感応が伴侶体と結びついていたのかは区別できなかった。Eが住み始めた後も、皿にはいつも同じような時間に餌が補充されていたが、餌を置く人に会ったことはなかった。ある日、この場所に来ていた猫を捜しているというチラシが、誰かの連絡先とともに木に貼られていた。その後、皿は何度か消えては再び置かれたが、猫は姿を現さなかった。その頃、伴侶体は以前と同じ経路を保ちながらも、木の下で立ち止まる時間が長くなり、反復型と固定型の特徴を併せ持つようになった。チラシがなくなった後も、伴侶体はかなり長いあいだ、以前の動きを繰り返していたのだろう。長いあいだ忘れていたEが検出器を起動したときにも、まだそこにいたからだ。もう誰も来ていないようなのに、伴侶体が消えずにいることを不思議に思った。誰かがこの伴侶体を登録し、観測し続けているのだから、今も誰かの感応場に残っているはずだった。ところが、ある頃から木が枯れ始めた。伴侶体はそれでも、その場所に留まり続けていた。Eによる最後の観測では、孤独を帯びた低振幅型の特徴だけが残されていた。',
    },
  },
  en: {
    'signal-01': {
      title: '01 Window',
      body: 'Very little record of A remains. E, who was B’s friend, came to help with the move and encountered the detector B owned for the first time. A single potted plant left by the previous resident, A, stood by the window. It looked as though it had already died, yet a repetitive-type companion was discovered nearby. B explained that the repetitive type often overlaps with a recurring sense of waiting. No one knew when this companion had first appeared or how long it had persisted. Several years later, while D lived here, a cat often stayed on the window ledge. After the cat died, a fixed-type companion was observed lingering in that same place. The fixed type was associated with attachment, trust, and long-held loss. After moving out, D asked the next resident, E, to check whether the companion was still there. E already knew that a companion occupied the spot. As different resonances overlapped and observations were repeated, E began to wonder whether the same companion had remained from the beginning and changed over time, or whether the residents had drawn in different kinds of companions.',
    },
    'signal-02': {
      title: '02 Wall',
      body: 'When D moved in, this wall was said to have been hidden behind an enormous storage cabinet. While moving the cabinet to make room for a bed, D found tape marks on the wall and a placard that had fallen behind it. The placard called for an end to the massacre and to the attacks killing children. It appeared to have once been attached higher on the wall before falling behind the cabinet. Here E discovered a low-amplitude companion that barely moved. The low-amplitude type overlaps with long-lasting fatigue and solitude, as well as the quiet composure or resignation that comes from accepting a condition. Was it composure that drew this companion here, or despair dulled into numbness? The time of several residents had accumulated before the same wall, and it seemed impossible to attribute the companion to the life or feelings of any one person.',
    },
    'signal-03': {
      title: '03 Interior',
      body: 'When D first came to view the house, a diffusive-type companion was said to be spreading rapidly through the empty space at the back. The diffusive type appears when the mind reaches in several directions toward events that have not yet happened. This spot seemed to have once held a bed. After D placed a table and chairs here and began living in the room, the companion gradually weakened and eventually disappeared. When E put a bed here, a diffusive-type companion appeared again. Over the past year, while E struggled to extend a visa, it grew steadily stronger until it became the companion showing the clearest changes in the house. As the likelihood of having to leave increased, its widely dispersed form drew inward over the bed and began repeating the same movement. It displayed traits of both the contractive and repetitive types. It seemed to shrink with sorrow and anxiety, while hopes and lingering attachments that could not easily be released circled the same place. The app registered it as an entity separate from the companion D had recorded, but E began to doubt that it was truly new. Perhaps the earlier companion had never completely disappeared and had instead remained and changed form. Perhaps love and resentment toward this place, lingering attachment, and hope had become mixed without ever separating. In a place E desperately wanted to call home but never could, E lay beside a companion that, like E, lived there without ever being able to settle.',
    },
    'signal-04': {
      title: '04 Closet',
      body: 'After trouble arose at the place where B worked a temporary job, B was left with a large amount of unsold stock without being properly paid. Wondering whether there was any way to sell it, B called E. With some embarrassment, B said that boxes had been piled high inside the closet and that a companion had appeared among them. It would sit quietly, then suddenly dart about. E had no other way to help, and that was the last time the two spoke. Several years later, when D moved in, a small notebook left by the previous resident, C, was said to be inside the closet. It contained a list of online broadcasts C often watched and fragmentary notes on the history of a region far from here. Words such as “expulsion” and “blockade” were pressed into the paper with enough anger to leave indentations. When bills or notices addressed to C occasionally arrived, D did not know where to forward them and stacked them one by one on top of the notebook. At the time, an irregular-type companion was said to live in the closet. The irregular type resembled a mind moving aimlessly between the urgency to do something and the helplessness of being unable to do anything: a state in which something suddenly troubles the mind again after seeming briefly forgotten. Before moving out, D cleared away everything left in the corner of the closet. When E moved in, no companion remained there.',
    },
    'signal-05': {
      title: '05 Tree Outside',
      body: 'Even while B lived here, a repetitive-type companion was already being observed around the tree in front of the house. The repetitive type is associated with feelings that return when one waits for something or expects a recurring situation. It cannot be determined how long this companion had remained around the tree. Beneath it stood a food bowl for stray cats, left by someone unknown, but it was impossible to distinguish whether the resonance connected to the companion belonged to the person who brought the food, the cat that waited for it, or the tree that continued standing there. After E moved in, the bowl was still filled at roughly the same time each day, although E never encountered the person who left the food. One day, a flyer bearing someone’s contact details was attached to the tree, asking for help finding a cat that used to come there. Afterward, the bowl disappeared and returned several times, but the cat did not. Around then, while the companion continued to follow its old route, it began pausing for longer beneath the tree and showing traits of both the repetitive and fixed types. It must have repeated its former movement for quite some time after the flyer disappeared, because it was still there when E, having forgotten about it for a long while, switched on the detector again. E found it strange that the companion had not vanished even though no one seemed to come anymore. Someone had registered it and continued observing it, so perhaps it remained within someone’s field of resonance. Then, one day, the tree began to wither. The companion held its place. In E’s final observation, only the traits of a solitary low-amplitude type remained.',
    },
  },
}

export const getApproachContent = (language: Language, signalId: SignalId | null) =>
  approachContent[language][signalId ?? 'signal-01']
