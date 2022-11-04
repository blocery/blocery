import {KEY, initialFilterStore} from "~/components/common/filter/FilterStore";

/**
 * 검색 필터 파라미터용 필터 object 리턴
 * @param filterInfo
 * @returns {{key: data, key: data, ...}}
 */
export function getFilterParams(filterInfo) {
    if (!filterInfo) return null

    const filterParams = {}

    Object.keys(filterInfo).map(key => {

        const data = filterInfo[key].data

        //상품태그를 검색해야 하는 항목은 모두 tags 에 합쳐서 리턴(백앤드는 tags 하나만 있으면 됨)
        if ([KEY.HASHTAG, KEY.THEME_HASHTAG].includes(key) && data) {
            filterParams[KEY.HASHTAG] = filterParams[KEY.HASHTAG] ? filterParams[KEY.HASHTAG].concat(data) : []
        }else {
            filterParams[key] = data
        }

        //키워드 검색 일 경우 해시태그에도 추가
        // if ([KEY.KEYWORD].includes(key) && data) {
        //     filterParams[KEY.HASHTAG] = filterParams[KEY.HASHTAG] ? filterParams[KEY.HASHTAG].concat(data) : []
        // }

    })

    // if (!filterInfo) {
    //     return Object.keys(initialFilterStore).map(key => {
    //
    //         const data = filterInfo[key].data
    //
    //         //상품태그를 검색해야 하는 항목은 모두 tags 에 합쳐서 리턴(백앤드는 tags 하나만 있으면 됨)
    //         if ([KEY.HASHTAG, KEY.THEME_HASHTAG].includes(key) && data) {
    //             filterParams[KEY.HASHTAG] = filterParams[KEY.HASHTAG] ? filterParams[KEY.HASHTAG].concat(data) : []
    //         }else {
    //             filterParams[key] = data
    //         }
    //
    //         //키워드 검색 일 경우 해시태그에도 추가
    //         // if ([KEY.KEYWORD].includes(key) && data) {
    //         //     filterParams[KEY.HASHTAG] = filterParams[KEY.HASHTAG] ? filterParams[KEY.HASHTAG].concat(data) : []
    //         // }
    //
    //     })
    //
    // }else{
    //     Object.keys(filterInfo).map(key => {
    //
    //         const data = filterInfo[key].data
    //
    //         //상품태그를 검색해야 하는 항목은 모두 tags 에 합쳐서 리턴(백앤드는 tags 하나만 있으면 됨)
    //         if ([KEY.HASHTAG, KEY.THEME_HASHTAG].includes(key) && data) {
    //             filterParams[KEY.HASHTAG] = filterParams[KEY.HASHTAG] ? filterParams[KEY.HASHTAG].concat(data) : []
    //         }else {
    //             filterParams[key] = data
    //         }
    //
    //         //키워드 검색 일 경우 해시태그에도 추가
    //         // if ([KEY.KEYWORD].includes(key) && data) {
    //         //     filterParams[KEY.HASHTAG] = filterParams[KEY.HASHTAG] ? filterParams[KEY.HASHTAG].concat(data) : []
    //         // }
    //
    //     })
    // }


    console.log({filterParams})
    return filterParams
}

export default {
    getFilterParams
}