import type { Language } from '../store/experienceStore'

const residentProfiles: Record<Language, Record<string, string>> = {
  ko: {
    'resident-a': '아무 기록도 남아있지 않다. 이사 온 초기에 남아있던 그의 반려체들만 B의 기억 속에 남아 있다.',
    'resident-b': '비정규직 아르바이트를 하던 E의 친구. 면접을 보러 다니다가 다소 우울한 시기에 들어서게 되었다. 밖에 잘 나오지 않고 집 안에서 게임에 몰두했다. E는 당시 이 집에 놀러 왔다가 검출기를 처음 경험했다. 현재는 서로 연락을 하지는 않고 있다.',
    'resident-c': '평생 가사노동자였고, 노년에 혼자 살았다. 가까운 사람은 없었고, 집에 있는 시간이 많았다. 인터넷 방송에서 먼 나라에서 벌어지는 봉쇄와 학살을 목도하고 충격을 받아 이에 항의하는 팻말을 들고 혼자 거리에 선 적이 있다.',
    'resident-d': '이사 후 집에 남아있던 물건 몇 개와 우편물을 통해 이전 거주자인 C의 생활을 짐작했다. 이곳에 같이 살던 고양이가 죽고난 후, 월세가 올라서 떠났다. 고양이가 있던 자리에 남아있던 반려체의 상태를 확인하려고 이후 거주자였던 E에게 메시지를 보냈다.',
    'resident-e': '외국인 노동자로서 가장 최근에 이곳을 떠나야 했던 마지막 거주자이다. 이곳에 남아있을 반려체가 마음이 쓰여서 다음 거주자에게 관측을 부탁하는 이 웹사이트를 남겼다. 반려체들의 변화를 추적하기 위해 아는 선에서 이전 거주자들에 대한 이야기를 정리했다.',
  },
  ja: {
    'resident-a': '記録は何も残されていない。入居した当初からそこにいた伴侶体だけが、Bの記憶に残っている。',
    'resident-b': '非正規のアルバイトをしていたEの友人。面接を受けて回るうち、やや憂鬱な時期に入った。外に出ることが減り、家でゲームに没頭した。Eは当時この家を訪れ、初めて検出器を体験した。現在、二人は連絡を取っていない。',
    'resident-c': '生涯家事労働に従事し、老年を一人で暮らした。親しい人はおらず、家で過ごす時間が長かった。インターネット配信で遠い国に起きている封鎖と虐殺を目撃して衝撃を受け、抗議のプラカードを持って一人で街頭に立ったことがある。',
    'resident-d': '入居後、家に残された物と郵便物から前の居住者Cの暮らしを想像した。この家で一緒に暮らしていた猫が死んだあと、家賃が上がったためここを去った。猫がいた場所に残る伴侶体の状態を確かめるため、次の居住者Eにメッセージを送った。',
    'resident-e': '外国人労働者として、最も最近この場所を去らなければならなかった最後の居住者。ここに残る伴侶体のことが気がかりで、次の居住者に観測を託すこのウェブサイトを残した。伴侶体たちの変化を追うため、知る限りの過去の居住者の話を整理した。',
  },
  en: {
    'resident-a': 'No record remains. Only the companions already present when B first moved in survive in B’s memory.',
    'resident-b': 'A friend of E who worked irregular part-time jobs. After going from interview to interview, B entered a somewhat depressed period, rarely went out, and immersed themself in games at home. E first experienced a detector while visiting this house. They are no longer in contact.',
    'resident-c': 'A lifelong domestic worker who lived alone in old age. With no close companions, C spent much of the time at home. Shocked after witnessing a blockade and massacre unfolding in a distant country through an internet broadcast, C once stood alone in the street holding a protest placard.',
    'resident-d': 'After moving in, D inferred the life of the previous resident, C, from a few objects and pieces of mail left behind. After the cat who lived here with D died, rising rent forced D to leave. D messaged E, the next resident, to ask about the companion remaining where the cat had stayed.',
    'resident-e': 'A migrant worker and the final, most recent resident forced to leave this place. Worried about the companions that might remain here, E left this website to ask the next resident to observe them. To trace their changes, E gathered what they knew about the earlier residents.',
  },
}

export const getResidentProfile = (language: Language, residentId: string) =>
  residentProfiles[language][residentId] ?? ''
