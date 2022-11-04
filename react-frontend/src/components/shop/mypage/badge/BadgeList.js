import activeBuy from '~/images/badge/a_buy.svg'                //구매의 시작
import activeBuy10 from '~/images/badge/buy10.svg'              //구매는 습관
import activeBuy30 from '~/images/badge/buy30.svg'              //구매는 중독
import activeBuy100 from '~/images/badge/buy100.svg'            //구매의 달인
import activeFamily from '~/images/badge/a_family.svg'          //가족 환영
import activeCheer from '~/images/badge/a_cheer.svg'        //응원의 시작
import activeCommunity from '~/images/badge/a_community.svg'    //소통의 시작
import activeNickname from '~/images/badge/a_nickname.svg'      //존재의 이유
import activeProfile from '~/images/badge/a_profile.svg'        //간판의 재탄생
import activeReview from '~/images/badge/a_review.svg'          //평가의 소중함
import activeReview10 from '~/images/badge/review10.svg'        //평가는 습관
import activeReview30 from '~/images/badge/review30.svg'        //평가는 필수
import activeReview100 from '~/images/badge/review100.svg'        //평가의 달인
import activeSpecial from '~/images/badge/a_special.svg'        //특별한 이유
import activeTalk from '~/images/badge/a_talk.svg'              //토크의 시작
import activeInvite1 from '~/images/badge/a_invite1.svg'        //친구야 어서와
import activeInvite10 from '~/images/badge/a_invite10.svg'      //인기쟁이
import activeInvite30 from '~/images/badge/a_invite30.svg'      //나는야 인싸왕


import defaultBuy from '~/images/badge/d_buy.svg'
import defaultBuy10 from '~/images/badge/buy10_g.svg'
import defaultBuy30 from '~/images/badge/buy30_g.svg'
import defaultBuy100 from '~/images/badge/buy100_g.svg'
import defaultCheer from '~/images/badge/d_cheer.svg'
import defaultCommunity from '~/images/badge/d_community.svg'
import defaultFamily from '~/images/badge/d_family.svg'
import defaultNickname from '~/images/badge/d_nickname.svg'
import defaultProfile from '~/images/badge/d_profile.svg'
import defaultReview from '~/images/badge/d_review.svg'
import defaultReview10 from '~/images/badge/review10_g.svg'
import defaultReview30 from '~/images/badge/review30_g.svg'
import defaultReview100 from '~/images/badge/review100_g.svg'
import defaultSpecial from '~/images/badge/d_special.svg'
import defaultTalk from '~/images/badge/d_talk.svg'
import defaultInvite1 from '~/images/badge/d_invite1.svg'
import defaultInvite10 from '~/images/badge/d_invite10.svg'
import defaultInvite30 from '~/images/badge/d_invite30.svg'

//마이페이지>프로필>활동배지 화면에 표시되는 순서대로 정렬. 넘버는 추가 순서임.
const BADGE_LIST = [
    {no:0, title: '가족 환영', description: `샵블리의 가족이 되신 것을 축하 드려요!\n다양한 혜택과 서비스가 준비되어 있으니 이제 맘껏 이용해 보자구요!`,
        howto: '신규 회원가입 완료', point: 0, defaultImage: defaultFamily, activeImage: activeFamily},

    {no:1, title: '존재의 이유', description: `나만의 닉네임이 필요하지 않으세요?\n닉네임을 잘 만들면 소통하는데 도움이 돼요! :)`,
        howto: '\'마이페이지>내정보\'에서 닉네임 변경', point: 100, defaultImage: defaultNickname, activeImage: activeNickname},

    {no:2, title: '간판의\n재탄생', description: `나를 잘 나타낼 수 있는 나만의 멋진 프로필 이미지로 바꿔보세요.\n어때요? 뿌듯하지 않으세요? :D`,
        howto: '\'마이페이지>내정보\'에서 프로필 이미지 변경', point: 200, defaultImage: defaultProfile, activeImage: activeProfile},

    {no:3, title: '토크의 시작', description: `토크 게시판에 사진이 첨부된 글을 작성해 보시겠어요?\n소비자, 생산자분들과 다양한 주제로 소통을 할 수 있어요.`,
        howto: '\'토크\' 메뉴에서 사진을 첨부하여 글 작성 3회', point: 300, defaultImage: defaultTalk, activeImage: activeTalk, count: 3},

    {no:4, title: '응원의 시작', description: '마음에 드는 상품을 발견하셨나요?\n생산자의 피드가 유익했나요?\n그럼 바로 상점 프로필을 방문해서 단골등록을 해보세요!\n젊은 농부, 농가를 위한 응원의 시작이에요!',
        howto: '상점 프로필 5곳 단골등록(상점 프로필은 \'홈>사람\' 또는 상품정보, 피드 등을 통해 방문 가능)\n', point: 300, defaultImage: defaultCheer, activeImage: activeCheer, count: 5},

    {no:5, title: '소통의 시작', description: '생산자가 올린 다양한 피드에 댓글과 좋아요를 남겨보세요.\n이것이야 말로 젊은 농부, 농가와 소통을 위한 첫 걸음이에요.',
        howto: '생산자가 올린 피드를 확인하고 댓글 5회, 좋아요 5회 실행', point: 300, defaultImage: defaultCommunity, activeImage: activeCommunity, count: 5},

    {no:6, title: '구매의 시작', description: '샵블리에는 젊은농부, 지역농가 등에서 생산한 산지직송 상품과 계약재배 상품 그리고 산지유통센터, 농협 등을 통한 각 지역의 인기만점 브랜드 상품이 준비되어 있어요.\n상품을 3회 구입해 보세요. 신선도 UP, 만족도 UP!',
        howto: '상품 구매 후 구매확정 3회', point: 500, defaultImage: defaultBuy, activeImage: activeBuy, count: 3},

    {no:9, title: '구매는 습관', description: '상품을 10회 구매후 구매확정까지 눌러보세요.',
        howto: '상품 구매 후 구매확정 10회', point: 600, defaultImage: defaultBuy10, activeImage: activeBuy10, count: 10},

    {no:10, title: '구매는 중독', description: '상품을 30회 구매후 구매확정까지 눌러보세요.',
        howto: '상품 구매 후 구매확정 30회', point: 800, defaultImage: defaultBuy30, activeImage: activeBuy30, count: 30},

    {no:11, title: '구매의 달인', description: '상품을 100회 구매후 구매확정까지 눌러보세요.',
        howto: '상품 구매 후 구매확정 100회', point: 1100, defaultImage: defaultBuy100, activeImage: activeBuy100, count: 100},

    {no:7, title: '특별한 이유', description: '감사, 사과, 감동, 미안함...\n내 소중한 사람에게 선물로 표현을 해보세요.\n그것이야 말로 특별한 이유에요.',
        howto: '상품 확인 후 \'선물하기\'로 상품 구매 1회', point: 300, defaultImage: defaultSpecial, activeImage: activeSpecial},

    {no:8, title: '평가의 소중함', description: '상품을 구매하셨다면 사진을 첨부하여 리뷰를 작성해 보시겠어요?\n내 후기가 수많은 소비자와 생산자분들께 도움이 된답니다!',
        howto: '사진을 첨부하여 리뷰 3회 작성', point: 500, defaultImage: defaultReview, activeImage: activeReview, count: 3},

    {no:12, title: '평가는 습관', description: '상품을 구매하셨다면 사진을 첨부하여 리뷰를 작성해 보시겠어요?\n내 후기가 수많은 소비자와 생산자분들께 도움이 된답니다!',
        howto: '사진을 첨부하여 리뷰 10회 작성', point: 600, defaultImage: defaultReview10, activeImage: activeReview10, count: 10},

    {no:13, title: '평가는 필수', description: '상품을 구매하셨다면 사진을 첨부하여 리뷰를 작성해 보시겠어요?\n내 후기가 수많은 소비자와 생산자분들께 도움이 된답니다!',
        howto: '사진을 첨부하여 리뷰 30회 작성', point: 800, defaultImage: defaultReview30, activeImage: activeReview30, count: 30},

    {no:14, title: '평가의 달인', description: '상품을 구매하셨다면 사진을 첨부하여 리뷰를 작성해 보시겠어요?\n내 후기가 수많은 소비자와 생산자분들께 도움이 된답니다!',
        howto: '사진을 첨부하여 리뷰 100회 작성', point: 1100, defaultImage: defaultReview100, activeImage: activeReview100, count: 100},

    {no:15, title: '친구야 어서와', description: '카카오톡으로 친구를 초대해 보세요!\n(초대 후 가입까지 완료해야 횟수가 인정됩니다.)',
        howto: '마이페이지-친구초대에서 카카오톡으로 친구 초대 1회', point: 100, defaultImage: defaultInvite1, activeImage: activeInvite1, count: 1},

    {no:16, title: '인기쟁이', description: '카카오톡으로 친구를 초대해 보세요!\n(초대 후 가입까지 완료해야 횟수가 인정됩니다.)',
        howto: '마이페이지-친구초대에서 카카오톡으로 친구 초대 10회', point: 300, defaultImage: defaultInvite10, activeImage: activeInvite10, count: 10},

    {no:17, title: '나는야 인싸왕', description: '카카오톡으로 친구를 초대해 보세요!\n(초대 후 가입까지 완료해야 횟수가 인정됩니다.)',
        howto: '마이페이지-친구초대에서 카카오톡으로 친구 초대 30회', point: 1000, defaultImage: defaultInvite30, activeImage: activeInvite30, count: 30},

]

export default BADGE_LIST