import axios from 'axios'
import { cacheAdapterEnhancer, Cache } from 'axios-extensions'
// axios-extension cache 는 get 요청만 캐시처리 함
// axios-extension에서는 캐시 사용할 때 내부적으로 LRU 알고리즘 라이브러리인 lru-cache를 사용한다.
// cacheAdapterEnhancer 캐시 기본 설정값을 보면 아래 만료 5분, 최대 100개로 되어있다.
// 5분은 너무 길수도 있다. 만약 변경하고 싶다면 LRUCache 객체를 직접 생성하여 세팅한다.
// const http = axios.create({
//     adapter: cacheAdapterEnhancer(axios.defaults.adapter, {
//     	enabledByDefault: false,
//         defaultCache: new Cache({ maxAge: 1000, max: 100 }) // 1분
//     })
// });
const axiosCache = axios.create({
    headers: { "Pragma": "no-cache" },
    xsrfHeaderName:"x-csrf-token",
    withCredentials:true,
    credentials:'same-origin',
    // cacheAdapterEnhancer 적용. 기본 캐시동작은 해제
    // enabledByDefault:false 모든 네트워크 요청에 대해 캐싱된 데이터를 사용하지 않도록
    adapter: cacheAdapterEnhancer(axios.defaults.adapter, {
        enabledByDefault: false
    })
});
export default axiosCache;
/*
* 링크를 클릭하는 동작이 발생할 경우 history.action은 PUSH이고, 뒤로 가기 또는 앞으로 가기 동작 수행 시 history.action은 POP이다.
* axios설정에 history.action이 push, replace 일경우만 설정 처리 필요
* axios config -> forceUpdate: default(true), cache: true
* */
//util
export const isForceUpdate = (history) => {
    console.log("action::::", history.action)
    //업데이트 함
    if(history.action === 'PUSH' || history.action === 'REPLACE') {
        return true;
    }
    return false;
};