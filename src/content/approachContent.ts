import type { Language, SignalId } from '../store/experienceStore'

interface ApproachRecord {
  title: string
  body: string
}

const approachContent: Record<Language, Record<SignalId, ApproachRecord>> = {
  ko: {
    'signal-01': {
      title: "01 창가",
      body: "A에 대해서는 별다른 기록이 남아 있지 않다. B의 친구였던 E는 이사를 도와주러 이 집에 왔다가 B가 가지고 있던 검출기를 처음 경험했다. 창가에는 이전 거주자인 A가 남긴 화분 하나가 있었다. 화분은 이미 죽은 것처럼 보였지만, 그 부근에서 반복형 반려체를 발견했다. B는 반복형이 거듭되는 기다림과 자주 겹치는 유형이라고 설명해주었다. 이 반려체가 언제부터 있었고 얼마나 오래 지속되었는지는 알 수 없었다.\n몇 년 뒤 D가 이곳에 살던 시기에는 고양이가 창가의 받침대에 자주 머물렀다. 고양이가 죽은 뒤, 같은 자리에서는 한곳에 오래 머무는 고정형 반려체가 관측되었다. 고정형은 애착과 신뢰, 오래된 상실과 연관된 유형이었다. 이사를 나간 뒤 D는 이 반려체가 아직 남아 있는지 다음 거주자인 E에게 확인을 부탁했다. E도 그 자리에 반려체가 있다는 것을 알고 있었다. 서로 다른 감응이 겹치고 반복해서 관측되면서 처음부터 같은 반려체가 변화를 거치며 남아 있었던 것인지, 거주자들이 서로 다른 종류의 반려체들을 불러들인 것인지 알고 싶어졌다.",
    },
    'signal-02': {
      title: "02 벽",
      body: "D가 이사 왔을 때 이 벽은 거대한 수납장에 가려져 있었다고 한다. D는 침대를 놓으려고 수납장을 치우다가 벽에 남은 테이프 자국과 수납장 뒤로 떨어져 있던 피켓을 발견했다. 피켓에는 학살을 멈추고 아이들을 죽이는 공격을 중단하라는 내용이 적혀 있었다. 아마도 벽 위쪽에 붙어 있다가 수납장 뒤로 떨어진 듯했다. E는 이곳에서 거의 움직이지 않는 저진폭형 반려체를 발견했다. 저진폭형은 오랫동안 이어진 피로와 고독, 어떤 상태를 받아들이는 데서 오는 담담함이나 체념과도 겹친다. 이 반려체를 불러들인 것은 담담함이었을까, 감각이 무뎌진 절망이었을까. 여러 거주자의 시간이 같은 벽 앞에 쌓여 있어, 이 반려체를 어느 한 사람의 생활이나 감정으로 돌릴 수는 없을 것 같았다.",
    },
    'signal-03': {
      title: "03 안쪽",
      body: "D가 이사할 집을 처음 보러 왔을 때, 안쪽의 빈 공간에는 빠르게 퍼져 나가는 확산형 반려체가 있었다고 한다. 확산형은 아직 일어나지 않은 일을 향해 마음이 여러 방향으로 뻗어 나갈 때 나타난다. 침대가 놓여 있었던 것으로 보이는 이 자리에 D가 테이블과 의자를 두고 생활하기 시작한 뒤에는 반려체가 차츰 약해지다가 사라졌다고 했다.\nE가 이곳에 침대를 놓자 확산형 반려체가 다시 나타났다. 비자를 연장하기 위해 애썼던 지난 1년 동안 점점 강해져, 어느 순간 이 집에서 가장 변화가 뚜렷한 반려체가 되었다. 이곳을 떠날 가능성이 점점 높아질 수록, 넓게 퍼지던 모습은 침대 위로 오므라들었고, 같은 움직임을 되풀이하기 시작했다. 수축형과 반복형의 특성을 함께 가진 모습이었다. 슬픔과 불안으로 움츠러들고, 쉽게 놓이지 않는 기대와 미련이 같은 자리를 맴도는 것처럼 보였다. 앱은 D가 기록한 반려체와 별개의 개체로 등록했지만, E는 이 반려체가 정말 새로운 존재인지 의심하게 되었다. 이전의 반려체가 완전히 사라지지 않고 남아 있다가 다른 모습으로 변해온 것은 아닐까. 이곳에 대한 애증과 미련과 기대가 분리되지 않은 채 섞이게 된 것은 아닐까. E는 간절히 자신의 집이라 부르고 싶었지만 결코 그렇게 되지 않을 이곳에서, 자신처럼 이곳에 살면서도 정착하지 못하는 반려체와 함께 누워 있었다.",
    },
    'signal-04': {
      title: "04 벽장",
      body: "B는 비정규직으로 일하던 곳에 문제가 생기면서 제대로 정산받지 못한 채 상품 재고를 잔뜩 떠안게 되었다. 어떻게든 팔 수 없을까 궁리하다가 E에게 전화를 걸었다. 벽장 안에 상자를 잔뜩 쌓아두었는데, 그 사이에서 반려체가 생겼다고 머쓱하게 말했다. 잠잠히 있다가도 이리저리 뛰어다닌다고 했다. E는 달리 도와줄 방법이 없었고, 그것이 두 사람의 마지막 연락이었다.\n몇 년 뒤 D가 이사 왔을 때, 벽장 안에는 이전 거주자 C가 남긴 작은 수첩이 있었다고 한다. 수첩에는 C가 자주 보던 인터넷 방송의 목록과 이곳에서 멀리 떨어진 어느 지역의 역사가 조각조각 정리되어 있었다. 추방, 봉쇄 같은 단어에는 종이가 눌릴 만큼 분노가 들어가 있었다. 가끔 C 앞으로 고지서나 안내문이 도착하면 D는 전해줄 곳을 알지 못해 수첩 위에 차곡차곡 쌓아두었다. 당시 벽장에는 불규칙형 반려체가 살고 있었다고 한다. 불규칙형은 어떻게든 해야 한다는 조급함과 아무것도 할 수 없다는 무력감 사이를 무작정 오가는 마음과 닮아 있었다. 잠시 잊은 듯하다가도 어떤 일이 불쑥 다시 마음에 걸리는 것 같은 상태. D는 이사를 나가기 전 벽장 구석에 남아 있던 물건들을 모두 정리했다. E가 입주했을 때 그곳에는 더 이상 반려체는 없었다.",
    },
    'signal-05': {
      title: "05 집 앞 나무",
      body: "B가 살고 있었을 때도 집 앞 나무 주변에는 이미 반복형 반려체가 관측되고 있었다. 반복형은 무언가를 기다리거나 되풀이되는 상황을 기대할 때, 되돌아오는 감정과 연관된다. 이 반려체가 언제부터 나무 주변에 머물렀는지는 확인할 수 없다. 나무 아래에는 누가 놓았는지 모를 길고양이의 먹이 그릇이 있었지만, 먹이를 가져다 놓은 사람과 그것을 기다리던 고양이, 그 자리에 계속 서 있던 나무 중 무엇의 감응이 반려체와 연결되어 있었는지는 구분할 수 없었다.\nE가 살기 시작한 뒤에도 그릇은 늘 비슷한 시간에 채워져 있었지만, 먹이를 놓는 사람과 마주친 적은 없었다. 어느 날 나무에 이곳에 오던 고양이를 찾고 있다는 전단지가 누군가의 연락처와 함께 붙어있었다. 이후 그릇은 몇 번 사라졌다가 다시 놓였고, 고양이는 나타나지 않았다. 그 무렵 반려체는 이전과 같은 경로를 고수하면서도 나무 아래에서 멈춰 서는 시간이 길어져, 반복형과 고정형의 특성을 함께 보이기 시작했다.\n전단지가 없어진 이후로도 꽤 오랫동안 반려체는 이전의 움직임을 되풀이했을 것이다. 한참을 잊고 있다가 E가 검출기를 켰을 때 아직 거기 있었기 때문이다. 이제 아무도 오지 않는 것 같은데 반려체가 사라지지 않는 것이 신기했다. 누군가 이 반려체를 등록했고 계속 관측 중이니까 계속 누군가의 감응장에 남아있는 것일테니 말이다. 그런데 어느날부터인가 나무가 말라가기 시작했다. 반려체는 그대로 버티고 있었다. E의 마지막 관측에서는 고독한 저진폭형의 특성만이 남아 있었다.",
    },
  },
  ja: {
    'signal-01': {
      title: "01 窓辺",
      body: "Aについては、これといった記録が残っていない。Bの友人だったEは、引っ越しを手伝うためにこの家を訪れ、そのとき初めてBが持っていた検出器を使った。窓辺には、以前ここに住んでいたAが残した植木鉢が一つあった。すでに枯れているように見えたが、その近くで「反復型伴侶体」が見つかった。Bによると、反復型は、何度も繰り返される「待つ」という行為と重なって現れることが多いらしい。この伴侶体がいつからそこにいたのか、どれほど長く留まっていたのかはわからない。数年後、Dがここに住んでいた頃には、猫は窓辺の台の上でよく時間を過ごした。猫が死んだあとは、その場所で、一か所に長く留まる「固定型伴侶体」が観測された。固定型は、愛着や信頼、長い時間を経た喪失と結びついて現れる型だという。その後、Dはこの家を離れたが、この伴侶体がまだそこに残っているか気になり、次の居住者であるEに確かめてもらった。Eも、その場所に伴侶体がいることを知っていた。異なる感応が、重なるようにして、繰り返し観測されるなかで、初めからそこにいた伴侶体が少しずつ姿を変えながら残っているものなのか、それとも、ここで暮らしてきた人たちが、それぞれに伴侶体を呼び寄せてきたのか、気になり始めた。",
    },
    'signal-02': {
      title: "02 壁",
      body: "Dが引っ越してきたとき、この壁は大きなキャビネットによって隠れていたらしい。ベッドを置こうと動かしたところ、壁に残ったテープの跡と、キャビネットの裏に落ちていた一枚のプラカードを見つけた。そこには、虐殺を止め、子どもたちへの攻撃をやめるよう訴える言葉が書かれていた。おそらく、壁の上の方に貼られていたものが、裏に落ちたのだろう。ここで見つけたのは、ほとんど動かない「低振幅型伴侶体」だった。この低振幅型は、長く続いた疲労や孤独、ある状態を受け入れることから生まれる淡々とした感覚や諦めとも重なる。この伴侶体を呼び寄せたのは淡々とした感覚だったのだろうか。それとも、感覚が麻痺してしまうほどの絶望だっただろうか。この壁には、ここで暮らした人たちの時間がいくつも積み重なっている。だから、この伴侶体を特定の誰かの生活や感情に結びつけることはできないように思えた。",
    },
    'signal-03': {
      title: "03 奥",
      body: "Dがこの家を初めて見に来たとき、奥の何もないスペースに勢いよく広がっていく「拡散型伴侶体」がいたという。拡散型は、まだ起きていないことをあれこれ想像し、気持ちが先へ先へと広がっていくときに現れる。もともとベッドが置かれていたと思われるこの場所に、Dがテーブルと椅子を置いて暮らし始めると、伴侶体は少しずつ弱まり、やがて姿を消したという。その後、Eがここにベッドを置くと、「拡散型伴侶体」が再び現れた。ビザを延長するため労苦したこの1年間、伴侶体はだんだんと存在を強く現し、気づけばこの家にいる伴侶体のなかで、いちばん大きな変化を見せるようになった。この家を離れる可能性が高まるにつれ、広く拡散していた姿はベッドの上へと縮こまっていき、同じ動きを繰り返すようになった。収縮型と反復型、両方の特徴をもっているようだった。悲しみや不安に身を縮めながら、それでも捨てきれない期待と未練が、同じ場所をぐるぐると巡っているようにも見えた。それは、Dが記録した伴侶体とは別の個体としてアプリに登録されたが、Eはこれが本当に新しい伴侶体なのか疑っていた。以前からいた伴侶体が完全には消えることなく、この場所に残りながら、少しずつ別の姿へと変化してきたのではないか。この場所への愛憎も、未練も、期待も、いつの間にか切り離せないほどに混ざり合ってしまったのではないか。Eは自分の家と呼びたいが、完全にそうはならないこの場所で、自分と同じようにここにいながらもここに留まることのできない伴侶体とベッドに横になっていた。",
    },
    'signal-04': {
      title: "04 クローゼット",
      body: "Bは、非正規雇用で働いていた職場でトラブルがあり、給料をきちんと支払ってもらえないまま、大量の商品在庫を抱え込むことになった。どうにか売れないかと思い、Eに電話をかけた。押し入れには在庫の箱が山積みになっていて、その隙間に伴侶体が現れたのだと、困ったように話した。じっとしているかと思えば、急にあちこちを走り回るらしい。Eには特に助けとなる手立てが見出せず、それが二人が交わした最後の連絡だった。\n数年後、Dがここに引っ越してきたとき、押し入れには前に住んでいたCが残した小さなノートがあったという。Cがよく見ていたネット配信の一覧と、ここから遠く離れたある地域の歴史が、ところどころに書き留められていた。「追放」や「封鎖」といった言葉は、紙がへこむほどの怒りが込められていた。C宛ての請求書や案内文が時々届いたが、Dは届け先が分からずノートの上に重ねていった。当時、押し入れには「不規則型伴侶体」がいたらしい。不規則型は、何とかしなければという焦りと、何もできないという無力感のあいだを行ったり来たりするような心と似ていた。忘れたと思っていたが、ふいにまた気になってしまうような状態。Dは引っ越す前に、押し入れの隅に残っていた物をすべて処分した。Eがここに住み始めたとき、伴侶体はその場所に見当たらなかった。",
    },
    'signal-05': {
      title: "05 家の前の木",
      body: "Bが住んでいた頃にも、家の前の木のまわりには「反復型伴侶体」が観測されていた。反復型は、何かを待っていたり、繰り返される状況を予期したりするときに生まれる感情と関係している。この伴侶体がいつからそこにいたのかは分からない。木の下には、誰が置いたのか分からない野良猫用の皿があったが、餌を置いた人、それを待っていた猫、そしてずっとそこに立っていた木、どの存在の感応がこの伴侶体と結びついていたのかを区別することはできなかった。\nEが住み始めてからも、いつも大体同じ時間に餌が置かれたが、餌を置くその人に出会ったことは一度もなかった。ある日、木に一枚のチラシが貼られていた。ここに通っていた猫を探しているらしく、連絡先も書かれていた。その後、その皿はなくなったり、また置かれたりを何度か繰り返したが、猫が戻ってくることはなかった。その頃から、伴侶体は以前と同じ道を行き来しながらも、木の下で立ち止まる時間がだんだん長くなり、反復型だけでなく、固定型の特徴も見せるようになっていった。\nチラシがなくなってからも、伴侶体はしばらく同じ動きを繰り返していたことだろう。しばらく忘れていたが、Eが久しぶりに検出器を起動させると、まだそこにいたのだから。もう誰も来ていないだろうに、どうして消えずにいるのか不思議だった。誰かがこの伴侶体を見つけ、今も観測し続けているのだろうか。そうやって、まだ誰かの感応場に残り続けているのかもしれない。しかし、いつの日からか木が枯れ始めた。それでも伴侶体は、そこに留まり続けていた。Eが最後に観測したときには、低振幅型の特徴だけが残っていた。",
    },
  },
  en: {
    'signal-01': {
      title: "01 Window",
      body: "Very little record of A. \nE, B’s friend, first encountered the detector while helping B move into the house. There is a potted plant by the window. Likely left by the previous resident, A. The plant appeared to be dead already, but a recurrent-type companion entity was detected nearby. B explained that this type often coincides with the state of prolonged waiting that is repeated. It was unclear when this companion entity first appeared or how long it had been there.\nSeveral years later, when D lived there, D’s cat often rested on the window ledge. After the cat died, a fixed-type companion entity—one that remains in a single location for an extended period—was detected in the same spot, remaining there for long periods of time. This type was associated with attachment, trust, and enduring loss. After moving out, D asked the next resident, E, to check whether the entity was still there. E, too, was aware of its presence. As different resonances and entities overlapped and were detected repeatedly, E began to wonder: had one and the same companion entity remained there from the beginning, transforming over time? Or had the residents drawn in different kinds of companion entities to the spot?",
    },
    'signal-02': {
      title: "02 Wall",
      body: "D said that when they moved in, this wall was hidden behind a large storage cabinet. While moving the cabinet to make room for a bed, D found tape marks on the wall and a protest sign that had fallen behind it. The sign called for an end to the massacre and attacks that kill children. It appears to have once been attached higher up on the wall before it fell behind the cabinet. \nE detected a low-amplitude-type companion entity here that barely moves. This type is associated with prolonged fatigue and solitude, as well as the composure or resignation that comes with accepting a given condition or situation. Was it composure that drew this companion entity here, or a despair dulled by numbness? The lives of several residents had accumulated before this same wall, making it difficult to attribute the companion entity to any one person’s life or emotions.",
    },
    'signal-03': {
      title: "03 Interior",
      body: "When D came to view the house before moving in, a diffusion-type companion entity—one that spreads quickly throughout a space—occupied the empty space at the back. This diffusion type of entity emerges when the mind extends in many different directions toward events that have not yet occurred. After D began living there and placed a table and chairs in the spot where a bed had probably been placed previously, the diffusion-type companion entity gradually weakened and disappeared.\n\nAfterwards, when E placed a bed there, a diffusion-type companion entity reappeared. During the past year, as E struggled to renew E’s visa, the diffusion-type companion entity steadily intensified and eventually became the companion entity that showed that changed the most among others detected in the home. As the prospect of leaving this home grew, its once-expansive form drew inward over the bed, settling into a repeated pattern of movement. It came to exhibit characteristics of both the contractive-type and recurrent-type of companion entities: as if sorrow and anxiety had made it draw inward, while expectations and lingering attachment circled the same spot. \nAlthough the app registered it as a separate companion entity from the one D had recorded, E began to wonder whether it was truly so. Could the earlier entity have remained without completely disappearing and gradually taken on another form? Could love, resentment, and hope—all forms of attachment—to this place have become entangled and inseparable? \nE desperately wanted to call this place home, but never could. So E laid beside the companion entity that, like E, resided in the space. but could never quite settle in.",
    },
    'signal-04': {
      title: "04 Closet",
      body: "B had encountered problem at work where B was temporarily employed: B was left with boxes and boxes of unsold inventory without proper compensation. Wondering if there was any way to sell the product, B called E for advice. B said, a little sheepishly, that B stacked the boxes in the closet and a companion entity had appeared among them. It would remain still for a while, then suddenly dart in different directions. E couldn’t think of a way to help, and that was the last time they spoke.\nSeveral years later, when D moved in, there was a small notebook in the closet, likely left by the previous resident, C. In it, C had compiled a list of online broadcasts C frequently watched and fragmentary notes on the history of a region far away. Terms such as “expulsion” and “blockade” were written with such force that the pen left deep indentations on following pages. When bills or notices addressed to C arrived, D had no way of forwarding them, so stacked them neatly on top of the notebook. \nAt the time, an irregular-type companion entity was said to inhabit the closet. This type resembled a mind moving aimlessly between the urgency to do something and the powerlessness of being unable to do anything; a state in which something seems briefly forgotten, only to suddenly weigh on one’s mind again. Before moving out, D cleared away everything that was left in the corner of the closet. By the time E moved in, the companion entity was no longer detected.",
    },
    'signal-05': {
      title: "05 Tree Outside",
      body: "Even when B lived there, a recurrent-type companion entity had already been detected around the tree in front of the house. This recurrent type is associated with emotions that return and resurface when waiting for something or anticipating a recurring event. It is impossible to determine when this companion entity emerged and from when it has remained in the vicinity of the tree. \nSomeone had left a food bowl underneath the tree for the stray cats. However, it was impossible to tell whether this recurrent-type  companion entity was connected to the resonance of the person who kept bringing the food, the cat that waited for it, or the tree that continued to watch over them.\nEven after E moved in, the bowl continued to be filled at roughly the same time each day, but E never saw or met the person who left the cat food. \nThen, one day, a flyer was attached to the tree: someone was looking for a cat that used to come here, along with the contact information. After that, the bowl disappeared and reappeared several times, but the cat didn’t return. Around this time, the companion entity continued to follow its previous route, but began to pause underneath the tree for longer periods of time; it began to display characteristics of both the recurrent and fixed-type companion entities.\nEven after the flyer was removed, the companion entity likely continued repeating its former movements for quite some time. When E eventually turned on the detector after having forgotten about it for a while, it was still there. E found it strange that the companion entity had not disappeared; no one seemed to visit anymore. Perhaps it remained because someone had registered it and continued to observe it—because it still remained within that person’s resonant field.\nThen, one day, the tree began to wither. The companion entity held its ground. In E’s final observation, only the characteristics of a solitary, low-amplitude-type remained.",
    },
  },
}

export const getApproachContent = (language: Language, signalId: SignalId | null) =>
  approachContent[language][signalId ?? 'signal-01']
