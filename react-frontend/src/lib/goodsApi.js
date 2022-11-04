import axios from 'axios'
import axiosCache from "~/lib/axiosCache";
import { Server } from "../components/Properties";

export const getConsumerGoodsList = ({itemNo, itemKindCode, isPaging = false, limit = 10, page = 1, sortNum = 0}) => axios(Server.getRestAPIHost() + '/goods/itemNo', { method: "get", params: {itemNo, itemKindCode, isPaging, limit, page, sortNum}, withCredentials: true, credentials: 'same-origin' })
export const getConsumerGoodsByItemKindCode = (itemKindCode) => axios(Server.getRestAPIHost() + '/goods/itemKindCode', { method: "get", params: {itemKindCode: itemKindCode}, withCredentials: true, credentials: 'same-origin' })

export const getConsumerGoodsByKeyword = (keyword) => axios(Server.getRestAPIHost() + '/goods/keyword', { method: "get", params: {keyword: keyword}, withCredentials: true, credentials: 'same-origin' })

//상품 조회 - 'ASC'가 디폴트임.  정렬조건으로 조회 : (마감일자 이전것, 판매중인 것만 조회)
//20210209 미사용:아래 cache로 대체  export const getConsumerGoodsSorted = (sorter, directGoods=false) => axios(Server.getRestAPIHost() + '/goods/sorted', { method: "post", data:sorter, params: {directGoods}, withCredentials: true, credentials: 'same-origin'})
export const getConsumerReserveGoodsCached = () => axios(Server.getRestAPIHost() + '/goods/reserveCached', { method: "get", withCredentials: true, credentials: 'same-origin'})


//상품 조회 - 'ASC'가 디폴트임.  정렬조건으로 조회 : (마감일자 이전것, 판매중인 것만 조회)
//20210209 미사용:아래 cache로 대체 export const getConsumerGoodsJustSorted = (sorter) => axios(Server.getRestAPIHost() + '/goods/justSorted', { method: "get", data:sorter, withCredentials: true, credentials: 'same-origin'})
export const getConsumerGoodsJustCached = (forceUpdate = true, signal) => axiosCache.get(Server.getRestAPIHost() + '/goods/justCached', { withCredentials: true, credentials: 'same-origin', forceUpdate: forceUpdate, cache: true, signal})

//상품 조회 - defined value로 조회 : (마감일자 이전것, 판매중인 것만 조회)
// param_ex) 'bloceryPick'  'bestSelling':많이 팔린거, 'regularShop':단골샵 상품..
export const getConsumerGoodsDefined = (defined, forceUpdate = true, signal) => axiosCache.get(Server.getRestAPIHost() + '/goods/defined', { params:{defined:defined}, withCredentials: true, credentials: 'same-origin', forceUpdate: forceUpdate, cache: true, signal})
export const getConsumerFavoriteGoods = ({isPaging = false, limit = 10, page = 1, signal}) => axios.get(Server.getRestAPIHost() + '/goods/favoriteGoods', { params:{isPaging:isPaging,limit:limit,page:page}, withCredentials: true, credentials: 'same-origin',signal})

////////////////Shop의 생산자 blog용도 ////////////////////////////
//생산자 번호로 해당생산자의 상품조회(즉시 상품만) : 기본소팅 이용(ASC, saleEnd)
export const getConsumerGoodsByProducerNo = (producerNo) => axios(Server.getRestAPIHost() + '/goods/producerNo', { method: "get", params: {producerNo: producerNo}, withCredentials: true, credentials: 'same-origin' })

//생산자 번호로 해당생산자의 상품조회 : CUSTOM 소팅 이용(ASC/DESC, Goods의 컬럼명)
 // sorter_ex)  {direction: 'ASC', property: 'saleEnd'},
export const getConsumerGoodsByProducerNoSorted = (producerNo, sorter) => axios(Server.getRestAPIHost() + '/goods/producerNo/sorted', { method: "post", data:sorter,  params: {producerNo: producerNo}, withCredentials: true, credentials: 'same-origin' })
export const getConsumerGoodsByProducerNoAndItemNoSorted = (producerNo, itemNo, sorter) => axios(Server.getRestAPIHost() + '/goods/producerNo/itemNo/sorted', { method: "post", data:sorter,  params: {producerNo: producerNo, itemNo: itemNo}, withCredentials: true, credentials: 'same-origin' })

//생산자 번호로 해당생산자의 상품조회(즉시, dealGoods 모두) : CUSTOM 소팅 이용(ASC/DESC, Goods의 컬럼명)
export const getConsumerGoodsByProducerNoSortedWithDealGoods = (producerNo, sorter) => axios(Server.getRestAPIHost() + '/goods/producerNo/sorted/dealGoods', { method: "post", data:sorter,  params: {producerNo: producerNo}, withCredentials: true, credentials: 'same-origin' })
export const getConsumerGoodsByProducerNoAndItemNoSortedWithDealGoods = (producerNo, itemNo, sorter) => axios(Server.getRestAPIHost() + '/goods/producerNo/itemNo/sorted/dealGoods', { method: "post", data:sorter,  params: {producerNo: producerNo, itemNo: itemNo}, withCredentials: true, credentials: 'same-origin' })

//미사용 export const getGoods = () => axios(Server.getRestAPIHost() + '/goods', { method: "get", withCredentials: true, credentials: 'same-origin' })
export const getGoodsByGoodsNo = (goodsNo) => axios(Server.getRestAPIHost() + '/goods/goodsNo', { method: "get", params:{ goodsNo: goodsNo }, withCredentials: true, credentials: 'same-origin' })

//상품목록 조회 (goodsNo list)
export const getGoodsListByGoodsNos = (goodsNos) => axios(Server.getRestAPIHost() + '/goods/list/goodsNos', { method: "get", params:{ goodsNos: goodsNos }, withCredentials: true, credentials: 'same-origin' })

//  int  : dealCount,
//  obj : data.extraRewards, data.dealNowExtraReward, data.goodsNo, data.goodsNm, data.dealNextExtraRewardText

//상품 등록 | 수정 - 주로 등록으로 사용요망
export const addGoods = (goods) => axios(Server.getRestAPIHost() + '/goods', { method: "post", data: goods, withCredentials: true, credentials: 'same-origin' })

//상품 삭제
export const deleteGoods = (goodsNo) => axios(Server.getRestAPIHost() + '/goods', { method: "delete", params:{goodsNo: goodsNo}, withCredentials: true, credentials: 'same-origin' })

//상품 - 남은수량 수정.
export const updateGoodsRemained = (goods) => axios(Server.getRestAPIHost() + '/goods/remained', { method: "put", data: goods, withCredentials: true, credentials: 'same-origin' })

//상품 노출 수정
export const updateConfirmGoods = (goodsNo, confirm) => axios(Server.getRestAPIHost() + '/goods/updateConfirmGoods', { method: "post", params:{goodsNo: goodsNo, confirm: confirm}, withCredentials: true, credentials: 'same-origin' })

//공동구매상품 노출 요청
export const updateConfirmReqDealGoods = (goodsNo) => axios(Server.getRestAPIHost() + '/goods/updateConfirmReqDealGoods', { method: "post", params:{goodsNo: goodsNo}, withCredentials: true, credentials: 'same-origin' })

//상품 판매 중단
export const updateGoodsSalesStop = (goodsNo) => axios(Server.getRestAPIHost() + '/goods/updateGoodsSalesStop', { method: "post", params:{goodsNo: goodsNo}, withCredentials: true, credentials: 'same-origin' })

//상품 복사
export const copyGoodsByGoodsNo = (goodsNo,reviewCopy) => axios(Server.getRestAPIHost() + '/goods/copyGoods', { method: "get", params:{ goodsNo: goodsNo, reviewCopy:reviewCopy }, withCredentials: true, credentials: 'same-origin' })

//상품상세 가져오기
export const getGoodsContent = (goodsContentFileName, forceUpdate = true, signal) => axiosCache.get(Server.getRestAPIHost() + '/goodsContent', { params:{ goodsContentFileName: goodsContentFileName}, withCredentials: true, credentials: 'same-origin', forceUpdate: forceUpdate, cache: true, signal })

//블리리뷰 가져오기
export const getBlyReview = (blyReviewFileName) => axios(Server.getRestAPIHost() + '/blyReview', { method: "get", params:{ blyReviewFileName: blyReviewFileName}, withCredentials: true, credentials: 'same-origin' })

//생산자 용도... ///////////////
//생산자별 판매 상품 조회
export const getProducerGoods = () => axios(Server.getRestAPIHost() + '/goods/producerGoods', { method: "get", withCredentials: true, credentials: 'same-origin' })

//검색필터 적용된 상품 조회
export const getProducerFilterGoods = (itemNo, directGoods, confirm, saleStopped, saleEnd, remainedCnt, salePaused) =>
    axios(Server.getRestAPIHost() + '/goods/producerFilterGoods', {
        method: "get",
        params: {itemNo: itemNo, directGoods: directGoods, confirm: confirm, saleStopped: saleStopped, saleEnd: saleEnd, remainedCnt: remainedCnt, salePaused: salePaused},
        withCredentials: true,
        credentials: 'same-origin'
    })

//판매 일시중지/판매재개
export const updateSalePaused = (goodsNo, salePaused) => axios(Server.getRestAPIHost() + '/goods/salePaused', { method:"put", params:{ goodsNo: goodsNo, salePaused: salePaused}, withCredentials: true, credentials: 'same-origin' })

//선물세트 등록/제외
export const updateGiftSet = (goodsNo, specialTag) => axios(Server.getRestAPIHost() + '/goods/giftSet', { method:"put", params:{ goodsNo: goodsNo, specialTag: specialTag}, withCredentials:true, credentials: 'same-origin' })

//선물세트 상품 조회
export const getGiftSet = ({itemNo, isPaging = false, limit = 10, page = 1, sortNum = 0}) => axios(Server.getRestAPIHost() + '/goods/giftSet', { method:"get", params:{itemNo: itemNo, isPaging, limit, page, sortNum }, withCredentials: true, credentials: 'same-origin' })

// 원매가 수정(미사용)
// export const updatePrimeCost = (goodsNo, primeCost) => axios(Server.getRestAPIHost() + '/goods/primeCost', { method: "put", params:{goodsNo: goodsNo, primeCost:primeCost}, withCredentials: true, credentials: 'same-origin'})
// 커미션 수정
export const updateFeeRate = (goodsNo, feeRate) => axios(Server.getRestAPIHost() + '/goods/feeRate', { method: "put", params:{goodsNo: goodsNo, feeRate:feeRate}, withCredentials: true, credentials: 'same-origin'})
// 상품가격 변경시 관리자에 메일 발송
export const sendPriceUpdateMail = (goodsNo) => axios(Server.getRestAPIHost() + '/goods/sendPriceUpdateMail', { method: "get", params:{goodsNo: goodsNo}, withCredentials: true, credentials:'same-origin'})


/** optionGoods관련 준비작업 */
export const FRONT_OptionGoodsStarted = true; //TODO chche오류 체크용.

//optionGoods가 시작했는데, 해당상품이 optionGoods가 아니면 에러리턴. : front 캐시 오류 대비.
export const checkOptionGoodsStarted = () => axios(Server.getRestAPIHost() + '/goods/checkOptionGoodsStarted', { method: "get", withCredentials: true, credentials:'same-origin'})
export const checkOptionGoodsBatchFinished = () => axios(Server.getRestAPIHost() + '/goods/checkOptionGoodsBatchFinished', { method: "get", withCredentials: true, credentials:'same-origin'})

