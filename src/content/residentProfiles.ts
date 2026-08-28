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
    'resident-a': '記録は何も残っていない。入居した当初に残っていたAの伴侶体たちだけが、Bの記憶に残っている。',
    'resident-b': 'Eの友人で、アルバイトで生計を立てていた。正社員になろうと面接を受けて回るうちに、やや抑うつ状態になった。ほとんど外出せず、家でゲームに没頭した。EはBの友達で、当時この家に遊びにきた際に初めて検出器を触った。今は連絡を取り合っていない。',
    'resident-c': '一生をハウスキーパーとして働き、老後は一人で暮らしていた。身近に親しい人はおらず、ほとんどの時間を家で過ごした。遠い国で起きている封鎖と虐殺をネット配信を通じて目の当たりにし、衝撃を受けた。これに抗議するプラカードを手に、一人で街頭に立ったことがある。',
    'resident-d': '入居後、家に残されていたいくつかの物と郵便物から、以前の居住者Cの暮らしを察した。ここで一緒に暮らしていたネコが死んだ後、家賃が上がったため退去した。その後、ネコがいつもいた場所に残っていた伴侶体の様子を確かめようと、居住者だったEにメッセージを送った。',
    'resident-e': '外国人労働者で、直近でここから立ち退かなければならなかった最後の居住者。ここに残された伴侶体が気がかりで、次の入居者に観測を託す思いでこのウェブサイトを残した。伴侶体たちの変化を追跡するため、これまでの居住者たちについて自ら分かる範囲で整理した。',
  },
  en: {
    'resident-a': 'No records remain. Only the companion entities that were still present when B first moved in remain in B’s memory.',
    'resident-b': 'Worked temporary, part-time jobs. After a period of going from one job interview to another, B had depression. B rarely went out and got hooked on playing games at home. E was B’s friend and first encountered the detector while visiting the house during this time. They are no longer in touch.',
    'resident-c': 'Spent a lifetime doing domestic labor and lived alone in old age. C had very few close friends and spent most of the time at home. C was deeply disturbed by seeing the lockdowns and massacres in a distant countries online, and once stood alone in the street holding a sign in protest.',
    'resident-d': 'After moving in, D pieced together aspects of C, the  previous resident, and C’s life from the few belongings and pieces of mail left behind in the house. After the cat that lived here with D died, the rent increased and D moved out. Wanting to check on the condition of the companion entity that remained the place where the cat used to lie, D later messaged E, the subsequent resident.',
    'resident-e': 'As a migrant worker, E was the most recent resident who was evicted. Concerned about the companion entities that might remain, E created this website to ask the next resident to observe them. To track changes in the companion entities, E compiled what they knew about the previous residents.',
  },
}

export const getResidentProfile = (language: Language, residentId: string) =>
  residentProfiles[language][residentId] ?? ''
