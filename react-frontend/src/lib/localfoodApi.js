import axios from 'axios'
import { Server } from "../components/Properties";


/** 로컬푸드 홈(Local) + 공통함수 */
//로컬매장정보 = Producer정보+알파
export const getLocalfoodProducer = (producerNo, signal) => axios(Server.getRestAPIHost() + '/localfood/producer', { method: "get", params: {producerNo:producerNo}, withCredentials: true, credentials: 'same-origin', signal })

/** 로컬매장 상품목록:LocalGoods (goodsFilter의 값을 통해, 로컬푸드 */
export const getLocalGoodsList = ({
                                      producerNo, localfoodFarmerNo, objectUniqueFlag,
                                      goodsFilter,
                                      sorter = {direction: 'DESC', property: 'timestamp'},
                                      isPaging = false, limit = 10, page = 1
                                  }) => axios(Server.getRestAPIHost() + '/localfood/goodsList', { method: "post", data: {producerNo, localfoodFarmerNo, objectUniqueFlag, sorter, goodsFilter}, params: {isPaging, limit, page}, withCredentials: true, credentials: 'same-origin' })

/** 로컬푸드 매장정보:LocalStore */
export const getLocalfoodDeliveryText = (producerNo = 0) => axios(Server.getRestAPIHost() + '/localfood/deliveryText', { method: "get", params: {producerNo}, withCredentials: true, credentials: 'same-origin' })


/** 로컬매장 소속 생산자 목록 */
//패이징: 로컬푸드매장 소속농가 목록
export const getLocalfoodFarmerListPaging = ({producerNo, page = 1, isPaging = true, limit = 10}) => axios(Server.getRestAPIHost() + '/localfood/farmerList/producerNo', { method: "get", params: {producerNo, isPaging, limit, page}, withCredentials: true, credentials: 'same-origin' })

//전체: 로컬푸드매장 소속농가 목록
export const getLocalfoodFarmerListByProducerNo = (producerNo) => axios(Server.getRestAPIHost() + '/localfood/localfoodFarmerListByProducerNo', {method: "get", params: {producerNo}, withCredentials: true, credentials: 'same-origin' })

//로컬푸드 매장별 주문목록 조회
export const getLocalfoodFarmerListByLocalFarmerNo = ({producerNo, localFarmerNo, phoneNum}) => axios(Server.getRestAPIHost() + '/localfood/localfoodFarmerListByLocalFarmerNo', {method:"get", params:{producerNo, localFarmerNo, phoneNum}, withCredentials:true, credentials: 'same-origin' })

/** producerApi: 상품등록시 로컬 농가 검색조회 */
export const searchLocalfoodFarmerList = (keyword) => axios(Server.getRestAPIHost() + '/localfood/searchFarmerList', { method: "get", params: {keyword:keyword}, withCredentials: true, credentials: 'same-origin' })


/** 샵블리 온라인 재고입고 현황 대시보드 */
//localCount/157용 List
export const getCountLogListAll = (producerNo) => axios(Server.getRestAPIHost() + '/localfood/countLogListAll', { method: "get", params: {producerNo}, withCredentials: true, credentials: 'same-origin' })

export const getGoodsListByLocalFarmerNo = (producerNo, localFarmerNo) => axios(Server.getRestAPIHost() + '/localfood/farmerGoodsList', { method: "get", params: {producerNo, localFarmerNo}, withCredentials: true, credentials: 'same-origin' })

export const checkSafeIp = () => axios(Server.getRestAPIHost() + '/localfood/safeIp', { method: "get", withCredentials: true, credentials: 'same-origin' })

//**이하 메뉴 미사용 재고관리용:함수는 일부 사용 */
//농가설정 변경
export const getLocalFarmerByLocalFarmerNo = (producerNo, localFarmerNo) => axios(Server.getRestAPIHost() + '/localfood/localFarmer', { method: "get", params: {producerNo, localFarmerNo}, withCredentials: true, credentials: 'same-origin' })
export const updateLocalFarmerManualFlag = (localfoodFarmerNo, manualFlag ) => axios(Server.getRestAPIHost() + '/localfood/localFarmerManualFlag', { method: "put", params: {localfoodFarmerNo, manualFlag}, withCredentials: true, credentials: 'same-origin' })
export const updateLocalFarmerBarcodeRatio = (localfoodFarmerNo, barcodeRatio ) => axios(Server.getRestAPIHost() + '/localfood/localFarmerBarcodeRatio', { method: "put", params: {localfoodFarmerNo, barcodeRatio}, withCredentials: true, credentials: 'same-origin' })
//재고증가
export const barcodePrintedDirect = (producerNo, farmerNo,productNo, sizeNo, localGoodsName, price, printedCount) => axios(Server.getRestAPIHost() + '/sensorData/barcodePrintedDirect', { method: 'post', params:{producerNo, farmerNo,productNo, sizeNo, localGoodsName, price, printedCount}, withCredentials: true, credentials: 'same-origin' })
//재고감소
export const productSold = (producerNo, farmerNo, productNo, sizeNo, localGoodsName, count, price, seq=0) => axios(Server.getRestAPIHost() + '/sensorData/productSold', { method: 'post', params:{producerNo, farmerNo, productNo, sizeNo, localGoodsName, count, price, seq}, withCredentials: true, credentials: 'same-origin' })
//goodsRefresh
export const goodsRefresh = (goodsNo) => axios(Server.getRestAPIHost() + '/localfood/goodsRefresh', { method: "get", params: {goodsNo}, withCredentials: true, credentials: 'same-origin' })

/**입고 수정용 */
export const getLocalfoodFarmerBySeq = (seq) => axios(Server.getRestAPIHost() + '/localfood/localfoodFarmer/seq', { method: "get", params: {seq}, withCredentials: true, credentials: 'same-origin' })
export const getCountLogByID = (seq) => axios(Server.getRestAPIHost() + '/localfood/countLog', { method: "get", params: {seq}, withCredentials: true, credentials: 'same-origin' })
export const getCountLogListByID = (seq) => axios(Server.getRestAPIHost() + '/localfood/countLogList', { method: "get", params: {seq}, withCredentials: true, credentials: 'same-origin' })
//농가상품목록
export const getGoodsListByFarmer = (localfoodFarmerNo) => axios(Server.getRestAPIHost() + '/localfood/goodsListByLocalfoodFarmerNo', { method: "get", params: {localfoodFarmerNo}, withCredentials: true, credentials: 'same-origin' })

//(특정상품전체 재고없음 처리(일시 미사용))
export const updateGoodsCountZero = (goodsNo) => axios(Server.getRestAPIHost() + '/localfood/goodsCountZero', { method: 'put', params:{goodsNo}, withCredentials: true, credentials: 'same-origin' })
//특정옵션 재고없음 처리
export const updateOptionCountZero = (goodsNo, optionIndex) => axios(Server.getRestAPIHost() + '/localfood/optionCountZero', { method: 'put', params:{goodsNo, optionIndex}, withCredentials: true, credentials: 'same-origin' })

//특정상품 재고없음 처리
// export const updateGoodsCountZero = (goodsNo) => axios(Server.getRestAPIHost() + '/sensorData/goodsCountZero', { method: 'put', params:{goodsNo}, withCredentials: true, credentials: 'same-origin' })


//특정주문 외상처리 재요청 or 취소요청)
export const requestBuyOnCredit = (orderSeq, isCancel) => axios(Server.getRestAPIHost() + '/localfood/requestBuyOnCredit', { method: 'put', params:{orderSeq, isCancel}, withCredentials: true, credentials: 'same-origin' })
