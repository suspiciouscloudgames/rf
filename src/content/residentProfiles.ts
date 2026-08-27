import type { Language } from '../store/experienceStore'

const residentProfiles: Record<Language, Record<string, string>> = {
  ko: {
    'resident-a': '아무 기록도 남아있지 않다. 이사 온 초기에 남아있던 반려체들만 B의 기억 속에 남아 있다.',
    'resident-b': '비정규직 아르바이트를 하던 사람. 면접을 보러 다니다가 다소 우울한 시기에 들어서게 되었다. 밖에 잘 나오지 않고 집 안에서 게임에 몰두했다. E는 B의 친구였으며, 그 당시 이 집에 놀러 왔다가 검출기를 처음 경험했다. 현재는 서로 연락을 하지는 않고 있다.',
    'resident-c': '평생 가사노동자였고, 노년에 혼자 살았다. 가까운 사람은 없었고, 집에 있는 시간이 많았다. 인터넷 방송에서 먼 나라에서 벌어지는 봉쇄와 학살을 목도하고 충격을 받아 이에 항의하는 팻말을 들고 혼자 거리에 선 적이 있다.',
    'resident-d': '이사 후 집에 남아있던 물건 몇 개와 우편물을 통해 이전 거주자인 C의 생활을 짐작했다. 이곳에 같이 살던 고양이가 죽고난 후, 월세가 올라서 떠났다. 고양이가 있던 자리에 남아있던 반려체의 상태를 확인하려고 이후 거주자였던 E에게 메시지를 보냈다.',
    'resident-e': '외국인 노동자로서 가장 최근에 이곳을 떠나야 했던 거주자이다. 이곳에 남아있을 반려체가 마음이 쓰여서 다음 거주자에게 관측을 부탁하는 이 웹사이트를 남겼다. 반려체들의 변화를 추적하기 위해 아는 선에서 이전 거주자들에 대한 이야기를 정리했다.',
  },
  ja: {
    'resident-a': '記録は何も残っていない。Bが入居した当初に残っていたAの伴侶体だけが、Bの記憶の中に残っている。',
    'resident-b': '非正規のアルバイトとして働いていたEの友人。仕事の面接を受けて回るうちに、やや気分の落ち込む時期に入った。ほとんど外出せず、家の中でゲームに没頭した。Eは当時この家を訪れた際、初めて検出器を体験した。現在は互いに連絡を取っていない。',
    'resident-c': '生涯にわたり家事労働に従事し、老年期には一人で暮らしていた。親しい人はおらず、家で過ごす時間が長かった。インターネット配信で遠い国における封鎖と虐殺を目の当たりにして衝撃を受け、それに抗議するプラカードを手に、一人で路上に立ったことがある。',
    'resident-d': '入居後、家に残されていたいくつかの物と郵便物から、以前の居住者Cの暮らしを推測した。この場所で一緒に暮らしていた猫が死んだ後、家賃が上がったため退去した。猫がいた場所に残っていた伴侶体の状態を確かめるため、後の居住者Eにメッセージを送った。',
    'resident-e': '外国人労働者であり、この場所を最も最近離れなければならなかった最後の居住者である。ここに残っているはずの伴侶体が気がかりだったため、次の居住者に観測を託すこのウェブサイトを残した。伴侶体たちの変化を追跡するため、自分に分かる範囲で以前の居住者たちについての話を整理した。',
  },
  en: {
    'resident-a': 'No records remain. Only the companion entities that were still present when B first moved in remain in B’s memory.',
    'resident-b': 'Worked temporary, part-time jobs. After a period of going from one job interview to another, B fell into a somewhat depressed state. B rarely went out and immersed themselves in games at home. E was B’s friend and first encountered the detector while visiting the house during this period. They are no longer in contact.',
    'resident-c': 'Spent a lifetime doing domestic labor and lived alone in old age. C had few close relationships and spent most of their time at home. Shocked by online broadcasts showing a blockade and massacre in a distant country, C once stood alone in the street holding a protest sign.',
    'resident-d': 'D pieced together aspects of the previous resident C’s life from a few belongings and pieces of mail left in the house. After the cat that lived here with D died, the rent increased and D moved out. D later messaged E, the next resident, asking them to check the state of the companion entity that had remained in the cat’s spot.',
    'resident-e': 'A migrant worker and the last resident to leave this place. Concerned about the companion entities that might remain here, E left this website to ask the next resident to observe them. To trace the changes in the entities, E compiled what they knew about the previous residents.',
  },
}

export const getResidentProfile = (language: Language, residentId: string) =>
  residentProfiles[language][residentId] ?? ''
