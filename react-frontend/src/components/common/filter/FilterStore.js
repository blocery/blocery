//필터 생성 방법
import FilterButton from "~/components/common/filter/FilterButton";
import FilterContent from "~/components/common/filter/FilterContent";
import {getAllHashTagGroupList} from '~/lib/commonApi'
import {color} from "~/styledComponents/Properties";
import adminApi from "~/lib/adminApi";
import {MdClose} from 'react-icons/md'

export const MAIN_COLOR_NAME = 'primary'

//TODO 주의 : 모든 해시태그 (tags) 검색이 걸리는 value 는 소문자로 해야 함니다. (모든 해시태그는 소문자 입니다)

/** [STEP 1] 필터 키 추가 (required) **/
//TODO KEY는 GoodsFilter.java 와 일치해야 합니다. (단 tags, themeTags 는 같은 컬럼을 조회하기 때문에 백엔드에 tags 하나만 있어도 됩니다)
export const KEY = {
    KEYWORD: 'keyword',                                 //검색어
    FREE_SHIPPING: 'freeShipping',                      //무료배송
    OBJECT_UNIQUE_FLAG: 'objectUniqueFlag',             //실물확인상품 여부
    GOODS_PRICE: 'goodsPrice',                          //상품가격
    PRODUCER_WRAP_DELIVERED: 'producerWrapDelivered',   //묶음배송
    HASHTAG: 'tags',                                    //태그
    THEME_HASHTAG: 'themeTags',                         //태그(해시태그 그룹)
    CATEGORY: 'itemNo',                                 //카테고리
    GOODS_TYPE: 'goodsType',                            //상품타입(즉시,예약,로컬)
    NOT_SOLD_OUT: 'notSoldOut',                         //구매 가능한 상품만(품절제외)
}


/** [STEP 2] 필터 (FilteredButtonList) 초기 값 세팅 (required) **/
export const initialFilterStore = {
    [KEY.KEYWORD]: {value: '', label: '', data: ''},
    [KEY.FREE_SHIPPING]: {value: '', label: '', data: ''},
    [KEY.OBJECT_UNIQUE_FLAG]: {value: '', label: '', data: false},
    [KEY.GOODS_PRICE]: {value: '', label: '', data: []},                //상품가 gte, lte
    [KEY.PRODUCER_WRAP_DELIVERED]: {value: '', label: '', data: ''},
    [KEY.HASHTAG]: {value: '', label: '', data: []},                    //태그 여러개 검색 가능 하게
    [KEY.THEME_HASHTAG]: {value: '', label: '', data: []},              //태그 여러개 검색 가능 하게
    [KEY.CATEGORY]: {value: '', label: '', data: ''},
    [KEY.GOODS_TYPE]: {value: '', label: '', data: ''},
    [KEY.NOT_SOLD_OUT]: {value: '', label: '', data: false},
}

/** [STEP 3] 필터용 옵션으로 지정될 데이터 세팅 (required) **/
export const initialFilterOptionStore = {
    [KEY.KEYWORD]: [{value: '0', label: '', data: '', isCustomValue: true}],
    [KEY.FREE_SHIPPING]: [
        {value: '0', label: '무료배송', data: 'free'}
    ],
    [KEY.OBJECT_UNIQUE_FLAG]: [
        {value: '0', label: '실물확인', data: true},
        // {value: '0', label: '로컬푸드만', data: 'localfood'},
        // {value: '1', label: '로컬푸드(실물확인)', data: 'objectUniq'}
    ],
    [KEY.GOODS_PRICE]: [
        {value: '0', label: '1만원 이하', data: [0, 10000]},
        {value: '1', label: '1만원 ~ 2만원', data: [10000, 20000]},
        {value: '2', label: '2만원 ~ 3만원', data: [20000, 30000]},
        {value: '3', label: '3만원 ~ 4만원', data: [30000, 40000]},
        {value: '4', label: '4만원 ~ 5만원', data: [40000, 50000]},
        {value: '5', label: '5만원 이상', data: [50000, 999999]},
        {value: '6', label: '저렴한', data: [0, 10000]},
        {value: '7', label: '가성비', data: [10000, 30000]},
        {value: '8', label: '높은가격대', data: [100000, 300000]},
        {value: '99', label: '', data: [10000, 30000], isCustomValue: true},
    ],
    [KEY.PRODUCER_WRAP_DELIVERED]: [
        {value: '0', label: '묶음배송', data: 'producerWrapDelivered'}
    ],
    [KEY.HASHTAG]: [
        {value: '0', label: '#제철식품', data: ['제철식품']},
        {value: '1', label: '#기획전', data: ['기획전']},
        {value: '2', label: '#쿠폰', data: ['쿠폰']},
        {value: '3', label: '#MD추천', data: ['md추천']},
        {value: '4', label: '#프리미엄', data: ['프리미엄']},
    ],
    [KEY.THEME_HASHTAG]: [],     //DB 값으로
    [KEY.CATEGORY]: [],     //DB 값으로
    [KEY.GOODS_TYPE]: [
        {value: '0', label: '일반상품', data: 'direct'},
        {value: '1', label: '예약상품(쑥쑥)', data: 'deal'},
        // {value: '2', label: '로컬푸드', data: 'local'},
    ],
    [KEY.NOT_SOLD_OUT]: [
        {value: '0', label: '품절제외', data: true},
    ],
}

/**
 * [STEP 4] 필터용 컴포넌트 연결 : 버튼, 펼쳐질 필터 컨텐츠를 만들고 아래에 추가 (required)
 * 단, 컨텐츠가 없는 버튼은 null 입력
 */
export const filterComponent = {
    [KEY.KEYWORD]: {
        Button: FilterButton.Keyword,
        Content: FilterContent.Keyword
    },
    [KEY.FREE_SHIPPING]: {
        Button: FilterButton.FreeShipping,
        Content: null
    },
    [KEY.OBJECT_UNIQUE_FLAG]: {
        Button: FilterButton.ObjectUniqueFlag,
        Content: null
    },
    [KEY.GOODS_PRICE]: {
        Button: FilterButton.GoodsPrice,
        Content: FilterContent.GoodsPrice
    },
    [KEY.PRODUCER_WRAP_DELIVERED]: {
        Button: FilterButton.ProducerWrapDelivered,
        Content: null
    },
    [KEY.HASHTAG]: {
        Button: FilterButton.Hashtag,
        Content: FilterContent.Hashtag
    },
    [KEY.THEME_HASHTAG]: {
        Button: FilterButton.ThemeHashtag,
        Content: FilterContent.ThemeHashtag
    },
    [KEY.CATEGORY]: {
        Button: FilterButton.CategoryHashtag,
        Content: FilterContent.CategoryHashtag
    },
    [KEY.GOODS_TYPE]: {
        Button: FilterButton.GoodsType,
        Content: FilterContent.GoodsType
    },
    [KEY.NOT_SOLD_OUT]: {
        Button: FilterButton.NotSoldOut,
        Content: null
    }
}

/**
 * 옵션을 DB 값으로 사용하기 위한 설정 (optional)
 * FilterContext.js > fetchAllFilterOptions() 에서 실행함
 * @type {{[p: string]: function(): AxiosPromise<any>}}
 */
export const optionFetch = {
    //해시태그 테마
    //TODO 방법 1 : new Promise 래핑 없이 하는 방법 ( 실행 하는쪽에서 promise 를 래핑하며 optionFetch[key] 를 하면 promise 객체가 실행 됨. 리턴이 편하지만 실행 하는쪽이 복잡함 )
    // [KEY.THEME_HASHTAG]: getAllHashTagGroupList().then(res => {
    //     if (res.status === 200) {
    //         let options = []
    //         res.data.map(item => {
    //             if (item.visibility) {
    //                 options.push({value: item.groupNo, label: item.groupName, data: item.hashTags})
    //             }
    //         })
    //         return options
    //     }
    //     return []
    // }),
    //TODO 방법 2 : new Promise 를 래핑하여 직접 resolve 함. ( 실행하는 쪽이 편하지만 작성 하는쪽이 복잡함 )
    [KEY.THEME_HASHTAG]: new Promise((resolve, reject) => {
        getAllHashTagGroupList().then(res => {
            if (res.status === 200) {
                let options = []
                res.data.map(item => {
                    if (item.visibility) {
                        options.push({value: item.groupNo, label: item.groupName, data: item.hashTags})
                    }
                })

                //꼭 key, options를 넣어야 함
                //[형식] options = [{value, label, data}]
                resolve({key: KEY.THEME_HASHTAG, options})
            }
        }).catch(function (){
            resolve({key: KEY.THEME_HASHTAG, options: []})
        })
    }),
    [KEY.CATEGORY]: new Promise(async (resolve, reject) => {
        const initialOptions = [
            {value: '0', label: '선물세트', data: ['선물세트']},
            {value: '1', label: '채소', data: ['채소']},
            {value: '2', label: '과일', data: ['과일']},
            {value: '3', label: '쌀/잡곡/견과', data: ['쌀/잡곡/견과']},
            {value: '4', label: '가공식품', data: ['가공식품']},
            {value: '5', label: '정육/계랸류', data: ['정육/계랸류']},
            {value: '6', label: '수산물/건해산', data: ['수산물/건해산']},
        ]

        const {status, data} = await adminApi.getItems(true)
        console.log({category: data})

        if (status !== 200 || !data) {
            //에러시 front-end 값 넣음
            resolve({key: KEY.CATEGORY, options: initialOptions})
            return
        }

        const dbOptions = data.map((item, index) => ({value: index.toString(), label: item.itemName, data: item.itemNo, image: item.image}))

        //선물세트는 수동으로 추가 => 선물세트는 품모이 아니라서 제외 처리 Jaden 22.07.04
        // dbOptions.unshift({value: '99', label: '선물세트', data: ['선물세트']})

        resolve({key: KEY.CATEGORY, options: dbOptions})
    })
}




/**
 * 선택된 필터의 스타일 오버라이드 (optional)
 */
export const appliedButtonStyle = {
    [KEY.KEYWORD]: `
        background: white;
        color: ${color.primary};
        border: 1px solid ${color.primary};
    `,
    [KEY.HASHTAG]: `
        background: linear-gradient(338deg, rgb(63 188 181), rgb(184 124 180));
        border-radius: 13px;
    `
}