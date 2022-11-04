import {atom, atomFamily, selector, selectorFamily, useRecoilValue} from 'recoil'
import ComUtil from "~/util/ComUtil";
import {delGoodsReview, getGoodsReview, getWaitingGoodsReview} from "~/lib/shopApi";
/*
    사용법 [useRecoilState]
    설명 : state의 get, set 모두 팔요한 곳에 사용

    import {useRecoilState} from 'recoil'
    import {globalState} from "~/hooks/atomState";

    //hooks 내부에서..
    //get 인 globalState, set인 setGlobalState 모두 사용가능
    const [globalState, setGlobalState] = useRecoilState(globalState);

*/

//장바구니 카운트
export const cartCountrState = atom({
    key: 'cartCountrState',
    default: 0
})

export const allFilterClearState = atom({
    key: 'allFilterClearState',
    default: 0
})

export const communitySidebarState = atom({
    key: 'communitySidebarState',
    default: false
})

//글쓰기 후 리스트에서 강제조회 할지 여부 (보통은 글쓰기 저장 후 true 변경해 놓고 history.goBack()을 통해 리스트로 돌아갔을때 true기 때문에 리스트 재조회를 하고 다시 false로 바꾸어 놓는다.
//goBack()만 하더라도 didMount가 되긴 하나, 우리는 리스트에서 조회된 내용을 history.state에 가지고 있다가 글쓰기 이후 goBack()시 history.state를 우선하게되면 방금적은 글쓴 내용이 리스트에 업데이트가 안되기 때문에 강제 조회가 필요함.
export const refreshState = atom({
    key: 'refreshState',
    default: false
})

export const boardTagModalState = atom({
    key: 'boardTagModalState',
    default: {
        isOpen: false,
        tag: ''
    }
})

//사용자 로그인 정보
export const consumerState = atom({
    key: 'consumerState',
    default: null
})

//로그인 한 사용자의 찜리스트. 이것으로 찜 한 상품인지 아닌지 구분이 가능함
export const consumerZzimListState = atom({
    key: 'consumerZzimListState',
    default: []
})

//로그인 모달을 띄우는 상태값
export const loginModalState = atom({
    key: 'loginModalState',
    default: false
})

//상품후기에서 사용하는 작성가능, 작성완료 리뷰 카운트 트리거
export const goodsReviewCountTrigger = atom({
    key: 'goodsReviewCountTrigger',
    default: null
});

//상품후기 전체 모달을 위한 값
export const imageViewerModalState = atom({
    key: 'imageViewerModalState',
    default: {
        isOpen: false,
        images: [],
        slideIndex: null
    }
})

//============================= ADMIN or PRODUCER =============================//
//상품 뷰어(해시태그 수정 기능이 들어간) 모달상태
export const bizGoodsViewerModalState = atom({
    key: 'bizGoodsViewerModalState',
    default: {
        isOpen: false,       //required
        hashTagGroup: null,  //optional
        goodsNo: null,       //required
        timestamp: null      //업데이트 여부(사용자가 저장을 하였을 경우 시간이 업데이트됨)
    }
});

export const adminFavoriteMenuListState = atom({
    key: 'adminFavoriteMenuState',
    default: []//{url: '', name: ''}
})

export const shopNavMenuState = atom({
    key: 'shopNavMenuState',
    default: {
        home: {
            menuGroupList: [
                {parentKey: 'lounge', label: '라운지', fg: 'black'},
                {parentKey: 'store', label: '스토어', fg: 'black'},
                // {parentKey: 'talk', label: '토크', fg: 'black'},
                {parentKey: 'event', label: '이벤트', fg: 'black'},
            ],
            menuList: [
                {parentKey: 'lounge', values: ['/', '/home', '/home/1'], label: '라운지'},
                {parentKey: 'store', values: ['/store'], label: '스토어 홈'},
                {parentKey: 'store', values: ['/local'], label: '로컬푸드'},
                {parentKey: 'lounge', values: ['/home/people/1', '/home/people/2'], label: '피플'},
                {parentKey: 'lounge', values: ['/community/goodsReviewMain'], label: '실시간 리뷰'},

                // {parentKey: 'talk', values: ['/home/community'], label: '토크홈'},
                // {parentKey: 'talk', values: ['/community/boardMain/free'], label: '자유게시판'},
                // {parentKey: 'talk', values: ['/community/boardMain/recipe'], label: '레시피'},
                // {parentKey: 'talk', values: ['/community/boardMain/land'], label: '내텃밭'},
                // {parentKey: 'talk', values: ['/community/boardMain/blocery'], label: '블로서리'},

                {parentKey: 'event', values: ['/roulette'], label: '매일매일 룰렛'},
                {parentKey: 'event', values: ['/community/boardVoteMain'], label: '당신의 선택'},
                {parentKey: 'event', values: ['/eventList'], label: '이벤트'},
            ]
        },
        store: {
            menuGroupList: [
                {parentKey: 'store', label: '스토어', fg: 'black'},
                // {parentKey: 'my', label: '즐겨찾기', fg: 'black'},
            ],
            menuList: [
                // {parentKey: 'store', values: ['/store'], label: '스토어 홈'},
                {parentKey: 'store', values: ['/store/best'], label: '베스트'},
                {parentKey: 'store', values: ['/store/new'], label: '신상품'},
                {parentKey: 'store', values: ['/store/specialPriceDeal'], label: '특가딜'},
                {parentKey: 'store', values: ['/store/mdPick'], label: '기획전'},
                {parentKey: 'store', values: ['/store/deal'], label: '쑥쑥-계약재배', id:'dealGoods'},
                {parentKey: 'store', values: ['/store/superReward'], label: '슈퍼리워드', id: 'superReward'},
                {parentKey: 'store', values: ['/store/potenTime'], label: '포텐타임', id: 'potenTime'},
                // {parentKey: 'my', values: ['/store/7'], label: '단골상품'},
                // {parentKey: 'my', values: ['/store/8'], label: '찜상품'}, //ZzimList로 연결
            ]
        },
        my: {
            menuGroupList: [
                {parentKey: 'my', label: '나의메뉴', fg: 'black'},
                // {parentKey: 'my', label: '즐겨찾기', fg: 'black'},
            ],
            menuList: [
                {parentKey: 'my', values: ['/my/zzimGoodsList'], label: '찜상품'},
                {parentKey: 'my', values: ['/my/favoriteGoodsList'], label: '단골상품'}
            ]
        }
    }
})

//TODO 사용안함 현재.. goods 와 selectedOptions 는 별도로 분리 되어 있는 상태이고, goods와 selectedOptions 를 같은 state 에 넣기는 부담스러운 상황.
// export const goodsState = atom({
//     key: 'goodsState',
//     default: null
// })

//상품에서 옵션에 담은것
export const selectedOptionsState = atom({
    key: 'selectedOptionsState',
    default: []
})

//옵션추가를 했을때 푸터의 +1 이 플로팅으로 찍히는 알림 new Date() 로 갱신시켜주면 됨
export const optionAlertState = atom({
    key: 'optionAlertState',
    default: []
    /*
        {
            goodsNo: 33,
            type: 'CART_ADDED' or 'OPTION_ADDED'
        }
     */
})

// //로컬푸드용 배송 가능한지 여부
// export const localDeliveryState = atom({
//     key: 'localDeliveryState',
//     default: null
//     // default: {
//     //     resCode: '',
//     //     retData: ''
//     //
//     // }
// })

export const filterState = atom({
    key: 'filterState',
    default: []//{key: '', data: {value, label}}
})

//화면에 점(noti) 용도의 변수
export const noticeState = atom({
    key: 'noticeState',
    default: {
        loading: true,
        //private
        // cartCount: 0,
        notification: false,
        //public
        potenTime: false,
        superReward: false,
        dealGoods: false,
    }
})

export const cartCountState = atom({
    key: 'cartCountState',
    default: 0
})