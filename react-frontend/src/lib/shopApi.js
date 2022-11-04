import axios from 'axios'
import axiosSecure from "~/lib/axiosSecure";
import axiosCache from "~/lib/axiosCache";
import { Server } from "../components/Properties";

// 소비자 회원가입
export const addConsumer = (data) => axios(Server.getRestAPIHost() + '/consumer', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })
// 소비자 중복이메일 체크
export const getConsumerEmail = (email) => axios(Server.getRestAPIHost() + '/consumer/email', { method: "get", withCredentials: true, credentials: 'same-origin', params: { email: email} })
// 소비자 정보 찾기
export const getConsumer = (signal) => axios.get(Server.getRestAPIHost() + '/consumer', { withCredentials: true, credentials: 'same-origin', signal })

// 프로필 수정
export const updateNickname = (data) => axiosSecure(Server.getRestAPIHost() + '/consumer/nickname', { method: "put", data:data, withCredentials: true, credentials: 'same-origin' })

// 소비자 알림 설정
export const updateAlrimInfo = (data) => axios(Server.getRestAPIHost() + '/consumerAlrim', { method: "put", data:data, withCredentials: true, credentials: 'same-origin' })

// 소비자 이름 수정
export const updateName = (consumerName) => axiosSecure(Server.getRestAPIHost() + '/consumerName', { method: "put", params:{consumerName:consumerName}, withCredentials: true, credentials: 'same-origin' })

// 소비자 추천인 번호 적용
export const updateConsumerRecommenderNo = (data) => axios(Server.getRestAPIHost() + '/consumerRecommenderNo', { method: "put", data:data, withCredentials: true, credentials: 'same-origin' })

// 비밀번호 변경
export const updateValword = (data) => axiosSecure(Server.getRestAPIHost() + '/consumer/valword', { method: "put", data:data, withCredentials: true, credentials: 'same-origin' })

// 개인키조회
export const getConsumerPK = () => axiosSecure(Server.getRestAPIHost() + '/getConsumerPK', { method: "post", withCredentials: true, credentials: 'same-origin' })

// 어뷰저인지 확인
export const checkAbuser = (signal) => axios.get(Server.getRestAPIHost() + '/checkAbuser', { withCredentials: true, credentials: 'same-origin', signal })

// 웹에서 선물하기인지 확인
export const checkMultiGifts = () => axios(Server.getRestAPIHost() + '/checkMultiGifts', { method: "get", withCredentials: true, credentials: 'same-origin' })

//택배사 조회(전체) : 소비자 배송 조회 용
export const getTransportCompany = () => axios(Server.getRestAPIHost() + '/transportCompany', { method: "get", params: {}, withCredentials: true, credentials: 'same-origin' })

// 주문 상품 재고 파악 (주문수량 <> 상품수량 비교)
export const getGoodsRemainedCheck = (order) => axios(Server.getRestAPIHost() + '/goodsRemainedCheck', { method: "post", data: order, withCredentials: true, credentials: 'same-origin' })

// 주문 상품 재고 파악 (주문수량 <> 상품수량 비교)
export const getGoodsRemainedCheckByGoodsNo = (orderCnt, goodsNo) => axios(Server.getRestAPIHost() + '/goodsRemainedCheck/goodsNo', { method: "post", data: {}, params: {orderCnt, goodsNo}, withCredentials: true, credentials: 'same-origin' })

// 주문 임시 등록 (결재전 임시 주문(주문그룹정보,주문리스트) 정보)
export const addOrdersTemp = (orders) => axiosSecure(Server.getRestAPIHost() + '/ordersTemp', { method: "post", data: orders, withCredentials: true, credentials: 'same-origin' })

// 주문 임시 등록 (결재전 임시 주문 정보) - 미사용(장바구니 이전에 사용)
//export const addOrderTemp = (order) => axios(Server.getRestAPIHost() + '/orderTemp', { method: "post", data: order, withCredentials: true, credentials: 'same-origin' })

// 주문 등록 (주문(주문그룹정보,주문리스트) 정보)
//미사용 export const addOrders = (orders) => axios(Server.getRestAPIHost() + '/orders', { method: "post", data: orders, withCredentials: true, credentials: 'same-origin' })

// 주문 등록 (재고체크포함) - 미사용(장바구니 이전에 사용)
//export const addOrderAndUpdateGoodsRemained = (order, goodsNo) => axios(Server.getRestAPIHost() + '/order', { method: "post", data: order, params: {goodsNo: goodsNo}, withCredentials: true, credentials: 'same-origin' })

// 임시 주문정보 조회 (임시주문그룹정보,임시주문리스트정보)
export const getTempOrdersByOrderGroupNo = (orderGroupNo) => axios(Server.getRestAPIHost() + '/ordersTemp', { method: "get", params: { orderGroupNo: orderGroupNo} , withCredentials: true, credentials: 'same-origin' })

// 주문정보 조회 (주문그룹정보,주문리스트정보)
export const getOrdersByOrderGroupNo = (orderGroupNo) => axios(Server.getRestAPIHost() + '/orders', { method: "get", params: { orderGroupNo: orderGroupNo} , withCredentials: true, credentials: 'same-origin' })

// BLCT 주문 정보 취소 (2021.2.17 현재 사용안함)
// export const addBlctOrderCancel = (data) => axios(Server.getRestAPIHost() + '/blctPayCancel', { method: "post", headers: { "Content-Type": "application/json" }, data: data, withCredentials: true, credentials: 'same-origin' })

// PG 주문 정보 취소 (아임포트 API)
//export const addPgOrderCancel = (data) => axios(Server.getRestAPIHost() + "/iamport/paycancel", { method: "post", headers: { "Content-Type": "application/json" }, data: data, withCredentials: true, credentials: 'same-origin' })

// 묶음상품 PG 주문 정보 취소
export const addPgWrapOrderCancel = (data) => axios(Server.getRestAPIHost() + "/iamport/payWrapCancel", { method: "post", headers: { "Content-Type": "application/json" }, data: data, withCredentials: true, credentials: 'same-origin' })

// 장바구니 선택한 주문리스트 조회
export const getCartListByConsumerNo = (consumerNo) => axios(Server.getRestAPIHost() + '/orderCartList', { method: "get", params: { consumerNo: consumerNo} , withCredentials: true, credentials: 'same-origin' })

// 주문정보 조회 (소비자번호 로그인세션)
export const getOrderDetailByOrderSeq = (orderSeq) => axios(Server.getRestAPIHost() + '/order', { method: "get", params: { orderSeq: orderSeq} , withCredentials: true, credentials: 'same-origin' })

// subGroup에 해당하는 orderDetail중 하나라도 출고대기면 true 리턴
export const checkSubGroupStartDelivery = (orderSeq) => axios(Server.getRestAPIHost() + '/checkSubGroupStartDelivery', { method: "get", params: { orderSeq: orderSeq} , withCredentials: true, credentials: 'same-origin' })

// 주문번호가 속한 주문그룹의 모든 묶음배송 주문들 조회
//미사용 export const getOrderWrapListByOrderSeq = (orderSeq) => axios(Server.getRestAPIHost() + '/orderWrapList', { method: "get", params: { orderSeq: orderSeq} , withCredentials: true, credentials: 'same-origin' })

// 주문그룹으로 orderDetailList 찾기
export const getOrderDetailListByOrderGroupNo = (orderGroupNo) => axios(Server.getRestAPIHost() + '/orderListByGroupNo', { method: "get", params: { orderGroupNo: orderGroupNo} , withCredentials: true, credentials: 'same-origin' })

// 주문그룹으로 주문취소되지 않은 orderDetailList 찾기
export const getValidOrderListByOrderGroupNo = (orderGroupNo) => axios(Server.getRestAPIHost() + '/getValidOrderListByOrderGroupNo', { method: "get", params: { orderGroupNo: orderGroupNo} , withCredentials: true, credentials: 'same-origin' })

//2022.04 subGroup취소용으로 추가
export const getOrderSubGroup = (orderSubGroupNo) => axios(Server.getRestAPIHost() + '/orderSubGroup', { method: "get", params: { orderSubGroupNo: orderSubGroupNo} , withCredentials: true, credentials: 'same-origin' })
export const getOrderListBySubGroupNoForCancel = (orderSubGroupNo) => axios(Server.getRestAPIHost() + '/orderListBySubGroupNoForCancel', { method: "get", params: { orderSubGroupNo: orderSubGroupNo} , withCredentials: true, credentials: 'same-origin' })



// 배송비가 있는 공동구매의 해당 주문건을 취소할 때 배송비를 옮길 다른 주문건이 있으면 옮길 주문번호 return (없으면 0 리턴)
export const getSubDeliveryFeeOrderSeq = (orderSeq) => axios(Server.getRestAPIHost() + '/getSubDeliveryFeeOrderSeq', { method: "get", params: { orderSeq: orderSeq} , withCredentials: true, credentials: 'same-origin' })

// 소비자 주소록 등록/수정
export const putAddress = (data) => axios(Server.getRestAPIHost() + '/putAddress', { method: "put", data:data , withCredentials: true, credentials: 'same-origin' })

// 소비자 주소록 등록/수정
export const upsertAddress = (mode, consumerAddress) => axios(Server.getRestAPIHost() + '/upsertAddress', { method: "post", data:consumerAddress, params: {mode: mode}, withCredentials: true, credentials: 'same-origin' })

// 소비자 주소록 등록/수정
export const deleteAddress = (addressIndex) => axios(Server.getRestAPIHost() + '/address', { method: "delete", data:null, params: {addressIndex}, withCredentials: true, credentials: 'same-origin' })

// 주문 - 기본배송지정보 수정(consumer Collection)
export const updateDeliverInfo = (data) => axios(Server.getRestAPIHost() + '/deliverInfo', { method: "put", data:data, withCredentials: true, credentials: 'same-origin' })

// 주문 - 배송지정보 수정(order Collection)
export const updateReceiverInfo = (data) => axios(Server.getRestAPIHost() + '/updateReceiverInfo', { method: "put", data:data, withCredentials: true, credentials: 'same-origin' })

// 주문 - 소비자 구매확정 날짜 저장
export const updateConsumerOkDate = (orderSeq) => axios(Server.getRestAPIHost() + '/shop/order/consumerOkDate', { method: "put", params: {orderSeq}, withCredentials: true, credentials: 'same-origin' })

// 주문 - 소비자 구매확정 날짜 저장 [OrderSubGroup]
export const updateConsumerOkDateForSubGroup = (orderSubGroupNo) => axios(Server.getRestAPIHost() + '/shop/orderSubGroup/consumerOkDate', { method: "put", params: {orderSubGroupNo}, withCredentials: true, credentials: 'same-origin' })

// 소비자별 주문정보 조회
export const getOrderDetailListByConsumerNo = () => axios(Server.getRestAPIHost() + '/orderDetailListByConsumerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 소비자별 주문정보 조회(페이징) - orderGroup으로 페이징 처리
export const getOrderDetailPagingByOrderGroup = ({isPaging = false, limit = 10, page = 1, dealGoods=false}) => axios(Server.getRestAPIHost() + '/orderDetailPagingByOrderGroup', { method: "get", params: {isPaging, limit, page, dealGoods}, withCredentials: true, credentials: 'same-origin' })

// 소비자별 주문정보 조회(페이징)
export const getPagedOrderDetailListByConsumerNo = ({isPaging = false, limit = 10, page = 1}) => axios(Server.getRestAPIHost() + '/orderDetailListByConsumerNo/paged', { method: "get", params: {isPaging, limit, page}, withCredentials: true, credentials: 'same-origin' })

// 주문개수 조회 for New Mypage
export const getOrderDetailCountForMypage = (consumerNo) => axios(Server.getRestAPIHost() + '/orderDetailCountForMypage', { method: "get" , withCredentials: true, credentials: 'same-origin' })

// 리뷰 작성 대기목록 조회
export const getWaitingGoodsReview = () => axios(Server.getRestAPIHost() + '/waitingGoodsReview', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 리뷰목록 조회(session: consumerNo)
export const getGoodsReview = ({isPaging = false, limit = 10, page = 1}) => axios(Server.getRestAPIHost() + '/goodsReview', { method: "get", params: {isPaging: isPaging, limit: limit, page: page}, withCredentials: true, credentials: 'same-origin' })

// 리뷰 작성 대기목록 카운트 조회
export const getWaitingGoodsReviewCount = () => axios(Server.getRestAPIHost() + '/waitingGoodsReview/count', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 리뷰목록 조회  카운트 조회
export const getGoodsReviewCount = () => axios(Server.getRestAPIHost() + '/goodsReview/count', { method: "get", withCredentials: true, credentials: 'same-origin' })


// 리뷰한건 조회(orderSeq)
export const getGoodsReviewByOrderSeq = (orderSeq) => axios(Server.getRestAPIHost() + '/goodsReview/orderSeq', { method: "get", params: {orderSeq: orderSeq}, withCredentials: true, credentials: 'same-origin' })

// 리뷰 좋아요 카운트(orderSeq)
export const getGoodsReviewLikesCount = (orderSeq) => axios(Server.getRestAPIHost() + '/goodsReview/likesCount', { method: "get", params: {orderSeq: orderSeq}, withCredentials: true, credentials: 'same-origin' })

// 리뷰 MyLike 여부(orderSeq)
export const getGoodsReviewMyLike = (orderSeq) => axios(Server.getRestAPIHost() + '/goodsReview/myLike', { method: "get", params: {orderSeq: orderSeq}, withCredentials: true, credentials: 'same-origin' })

// 리뷰목록 조회(goodsNo)
export const getGoodsReviewByGoodsNo = (goodsNo, isPaging = false, limit = 10, page = 1) => axios(Server.getRestAPIHost() + '/goodsReview/goodsNo', { method: "get", params: {goodsNo: goodsNo, isPaging: isPaging, limit: limit, page: page}, withCredentials: true, credentials: 'same-origin' })

// 다른상품 리뷰목록 조회(goodsNo)
export const getOtherGoodsReviewByItemNo = (goodsNo, isPaging = false, limit = 10, page = 1) => axios(Server.getRestAPIHost() + '/goodsReview/otherGoodsItemNo', { method: "get", params: {goodsNo: goodsNo, isPaging: isPaging, limit: limit, page: page}, withCredentials: true, credentials: 'same-origin' })

// 리뷰 등록
export const addGoodsReview = (data) => axios(Server.getRestAPIHost() + '/goodsReview', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })

// 리뷰 수정
export const updGoodsReview = (data) => axios(Server.getRestAPIHost() + '/goodsReview', { method: "put", data: data, withCredentials: true, credentials: 'same-origin' })

// 리뷰 삭제
export const delGoodsReview = (orderSeq) => axios(Server.getRestAPIHost() + '/goodsReview', { method: "delete", params:{orderSeq: orderSeq}, withCredentials: true, credentials: 'same-origin' })

// 리뷰 좋아요 카운트 증가
export const likedGoodsReview = (orderSeq) => axios(Server.getRestAPIHost() + '/goodsReview/like', { method: "post", params:{orderSeq: orderSeq}, withCredentials: true, credentials: 'same-origin' })

// // 재배일지목록 조회(전체)
// export const getFarmDiary = () => axios(Server.getRestAPIHost() + '/farmDiary', { method: "get", params: {}, withCredentials: true, credentials: 'same-origin' })
//
// // 재배일지목록 조회(생산자번호)
// //itemNo 가 undefined 일 경우 강제로 -1 로 치환함
// export const getFarmDiaryBykeys = ({diaryNo, producerNo, itemNo}, isPaging = false, limit = 10, page = 1) => axios(Server.getRestAPIHost() + '/farmDiary/keys', { method: "get", params: {diaryNo, producerNo, itemNo, isPaging, limit, page}, withCredentials: true, credentials: 'same-origin' })

// 알림목록 조회 (소비자,생산자)
export const getNotificationListByUniqueNo = (data) => axios(Server.getRestAPIHost() + '/notificationList', { method: "post", headers: { "Content-Type": "application/json" }, data:data, withCredentials: true, credentials: 'same-origin' })

// 공지사항 조회
export const getNoticeList = ({userType, isPaging = false, limit = 10, page = 1, signal}) => axios(Server.getRestAPIHost() + '/getNoticeList', { method: "get", params:{userType: userType, isPaging: isPaging, limit: limit, page: page}, withCredentials: true, credentials: 'same-origin', signal })

// 단골농장 등록
export const toggleRegularShop = (producerNo) => axios(Server.getRestAPIHost() + '/regularShop', { method: "post", data: {}, params: {producerNo}, withCredentials: true, credentials: 'same-origin' })

// 단골농장 삭제
export const delRegularShop = (shopNo) => axios(Server.getRestAPIHost() + '/regularShop', { method: "delete", params:{shopNo: shopNo}, withCredentials: true, credentials: 'same-origin' })

// 단골농장 삭제(producerNo, consumerNo)
export const delRegularShopByProducerNoAndConsumerNo = (producerNo, consumerNo) => axios(Server.getRestAPIHost() + '/regularShop/producerNo/consumerNo', { method: "delete", params:{producerNo, consumerNo}, withCredentials: true, credentials: 'same-origin' })

// 단골농장 한건 조회
export const getRegularShop = (producerNo) => axios(Server.getRestAPIHost() + '/regularShop', { method: "get", params: {producerNo: producerNo}, withCredentials: true, credentials: 'same-origin'})

// 단골 여부(팔로우)
export const getMyFollowFlagByProducerNo = (producerNo) => axios(Server.getRestAPIHost() + '/regularShop/myFollowFlag', { method: "get", params: {producerNo: producerNo}, withCredentials: true, credentials: 'same-origin'})

// 단골농장 목록 조회
export const getRegularShopList = () => axios(Server.getRestAPIHost() + '/regularShop/consumerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 단골농장 목록 조회
export const getRegularShopListByConsumerNo = (consumerNo) => axios(Server.getRestAPIHost() + '/regularShop/otherConsumerNo', { method: "get", params: {consumerNo: consumerNo}, withCredentials: true, credentials: 'same-origin' })

// 소비자에게 단골농장으로 저장된 개수
export const countRegularShop = () => axios(Server.getRestAPIHost() + '/countRegularShop', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 소비자의 GoodsReview개수
export const countGoodsReview = () => axios(Server.getRestAPIHost() + '/countGoodsReview', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 소비자 상품문의 조회(마이페이지에서 사용)
export const getGoodsQna = () => axios(Server.getRestAPIHost() + '/goodsQnA', { method: "get", withCredentials: true, credentials: 'same-origin' })

//pivot 추가
export const getGoodsQnaCount = () => axios(Server.getRestAPIHost() + '/goodsQnaCount', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 소비자 상품문의 취소(삭제)
export const deleteGoodsQna = (goodsQnaNo) => axios(Server.getRestAPIHost() + '/goodsQna', { method: "delete", params:{goodsQnaNo}, withCredentials: true, credentials: 'same-origin' })

// 소비자의 상품문의 조회(상품코드-상품상세에서 사용)
export const getGoodsQnAByKeys = ({goodsNo, isPaging = false, limit = 10, page = 1}) => axios(Server.getRestAPIHost() + '/goodsQnA/keys', { method: "get", params: {goodsNo, isPaging, limit, page}, withCredentials: true, credentials: 'same-origin'})

// 소비자의 상품문의 등록()
export const addGoodsQnA = (data) => axios(Server.getRestAPIHost() + '/goodsQnA', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })

// 상품 찜리스트 조회
export const getZzimList = () => axios(Server.getRestAPIHost() + '/zzimList', { method: "get", params:{}, withCredentials: true, credentials: 'same-origin' })

// 상품찜하기
export const addZzim = (goodsNo) => axios(Server.getRestAPIHost() + '/zzim', { method: "post", data: {}, params: {goodsNo}, withCredentials: true, credentials: 'same-origin' })

// 상품찜 취소
export const deleteZzim = (goodsNo) => axios(Server.getRestAPIHost() + '/zzim', { method: "delete", params:{goodsNo}, withCredentials: true, credentials: 'same-origin' })

// 상품찜 여부 확인
export const getZzim = (goodsNo) => axios(Server.getRestAPIHost() + '/zzim', { method: "get", params:{goodsNo}, withCredentials: true, credentials: 'same-origin' })

// 진행중인 포텐타임 조회
//export const getPotentTimeList = () => axios(Server.getRestAPIHost() + '/potentTimeList', { method:"get", withCredentials: true, credentials: 'same-origin' })

// best deal 상품 조회
export const getSpecialDealGoodsList = (forceUpdate = true, signal) => axiosCache.get(Server.getRestAPIHost() + '/home/specialDealGoods', { withCredentials: true, credentials: 'same-origin', forceUpdate: forceUpdate, cache: true, signal })

// 오늘의 생산자 상품 조회
export const getTodayProducerList = (forceUpdate = true) => axiosCache.get(Server.getRestAPIHost() + '/home/todayProducer', { withCredentials: true, credentials: 'same-origin', forceUpdate: forceUpdate, cache: true })

// 배너 조회
export const getBannerList = (isLocalfoodBanner, forceUpdate = true, signal) =>
    axiosCache.get(Server.getRestAPIHost() + '/home/banner', {
        params: {isLocalfoodBanner},
        withCredentials: true,
        credentials: 'same-origin',
        validateStatus: (status) => {
            // status : 400, 404, 500 등의 에러코드
            // true resolve 됨
            // false reject 됨, 하지만 reject 이후 catch() 로 떨어지지 않아 다음 스크립트가 수행되지 않음.
            return true; // 무조건 resolve 시켜 result.status === 200 으로 (성공) 판단
        },
        forceUpdate: forceUpdate,
        cache: true,
        signal
    })

//타입에 따른 이벤트 번호조회(type : blyTime, potenTime)
export const getEventNoByType = (type, forceUpdate = true) => axiosCache.get(Server.getRestAPIHost() + '/home/eventNo/type', { params: {type}, withCredentials: true, credentials: 'same-origin', forceUpdate: forceUpdate, cache: true })

// 타임세일 조회
export const getTimeSaleList = (forceUpdate = true, signal) => axiosCache.get(Server.getRestAPIHost() + '/b2cTimeSaleList', { withCredentials: true, credentials: 'same-origin', forceUpdate: forceUpdate, cache: true, signal })

//타임세일 진행중여부(배지용도)
export const isTimeSaleBadge = () => axios(Server.getRestAPIHost() + '/isTimeSaleBadge', { method: "get", withCredentials: true, credentials: 'same-origin' })

//마지막 타임세일본시간 저장. (로그인한 사용자에한함)
//export const setLastSeenTimeSale = () => axios(Server.getRestAPIHost() + '/lastSeenTimeSale', { method: "post", withCredentials: true, credentials: 'same-origin' })

// 블리타임 조회
export const getBlyTimeList = () => axios(Server.getRestAPIHost() + '/b2cBlyTimeList', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 슈퍼리워드 조회
export const getSuperRewardList = (forceUpdate = true, signal) => axiosCache.get(Server.getRestAPIHost() + '/b2cSuperRewardList', { withCredentials: true, credentials: 'same-origin', forceUpdate: forceUpdate, cache: true, signal })

// 슈퍼리워드 이전내역 조회
export const getPrevSuperRewardList = (forceUpdate = true, signal) => axiosCache.get(Server.getRestAPIHost() + '/b2cPrevSuperRewardList', { withCredentials: true, credentials: 'same-origin', forceUpdate: forceUpdate, cache: true, signal })

// 블리타임 진행중여부(배지용도)
//export const isBlyTimeBadge = () => axios(Server.getRestAPIHost() + '/isBlyTimeBadge', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 슈퍼리워드 진행중여부(배지용도)
export const isSuperRewardBadge = () => axios(Server.getRestAPIHost() + '/isSuperRewardBadge', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 쑥쑥 진행중여부(배지용도)
export const isDealGoodsBadge = () => axios(Server.getRestAPIHost() + '/isDealGoodsBadge', { method: "get", withCredentials: true, credentials: 'same-origin' })

//마지막 기획전 (배지용도,로그인한 사용자에한함)
export const getLastMdPickNotSeen = () => axios(Server.getRestAPIHost() + '/lastMdPickNotSeen', { method: "get", withCredentials: true, credentials: 'same-origin' })

//마지막 기획전본시간 저장. (로그인한 사용자에한함)
export const setLastSeenMdPick = () => axios(Server.getRestAPIHost() + '/lastSeenMdPick', { method: "post", withCredentials: true, credentials: 'same-origin' })

// 이벤트 정보 조회
export const getEventInfo = (eventNo) => axios(Server.getRestAPIHost() + '/eventInfo', { method: "get", params:{eventNo: eventNo}, withCredentials: true, credentials: 'same-origin' })

// 이벤트 정보 조회
export const getEventList = (status, forceUpdate = true, signal) => axiosCache.get(Server.getRestAPIHost() + '/eventList', { params:{status}, withCredentials: true, credentials: 'same-origin', forceUpdate: forceUpdate, cache: true, signal })


// 기획전 조회
export const getMdPickListFront = (forceUpdate = true, signal) => axiosCache.get(Server.getRestAPIHost() + '/shop/b2cMdPickList', { withCredentials: true, credentials: 'same-origin', forceUpdate: forceUpdate, cache: true, signal })

// 소비자 새로운 알림여부 조회
export const isNewNotifiation = () => axios(Server.getRestAPIHost() + '/isNewNotifiation', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 소비자 KYC 신청 상태 정보 (세션정보 소비자번호로 KYCAuth 상태 정보 가져옴)
export const getConsumerKycAuth = () => axios(Server.getRestAPIHost() + '/consumer/kycAuth', { method: "get", withCredentials: true, credentials: 'same-origin' })

//19세 이상 인증정보
export const getKakaoAgeCheck = () => axios(Server.getRestAPIHost() + '/kakaocert/kakaoAgeCheck', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 소비자 KYC 신청 등록 (ConsumerKyc 데이터) consumerNo값필수
export const regConsumerKyc = (data) => axios(Server.getRestAPIHost() + '/consumer/regKyc', { method: "post", data:data, withCredentials: true, credentials: 'same-origin' })

// 상품 공지 배너 조회
export const getGoodsBannerList = () => axios(Server.getRestAPIHost() + '/shop/goodsBannerList', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 홈 공지 배너 조회
export const getHomeBannerList = () => axios(Server.getRestAPIHost() + '/shop/homeBannerList', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 도서산간 우편번호 조회
export const getNotDeliveryZipNo = (zipNo) => axios(Server.getRestAPIHost() + '/shop/notDelivery', { method: "get", params:{zipNo: zipNo}, withCredentials: true, credentials: 'same-origin' })

// 출고준비 완료된 주문 조회
export const getOutboundComplete = () => axios(Server.getRestAPIHost() + '/shop/outboundComplete', {method: "get", withCredentials: true, credentials: "same-origin"})

// 출고준비 완료된 주문건수 조회
export const getCountOutboundComplete = () => axios(Server.getRestAPIHost() + '/shop/getCountOutboundComplete', {method: "get", withCredentials: true, credentials: "same-origin"})

// 사용가능 쿠폰 리스트 조회
export const getUsableCouponList = () => axios(Server.getRestAPIHost() + '/shop/usableCouponList', { method: "get", params:{}, withCredentials:true, credentials: 'same-origin'})

// 사용가능 쿠폰 개수 조회
export const getCountUsableCouponList = () => axios(Server.getRestAPIHost() + '/shop/getCountUsableCouponList', { method: "get", params:{}, withCredentials:true, credentials: 'same-origin'})

// 마이페이지 사용가능 쿠폰 리스트 조회(바로사용가능 + 구매확정시 발급되는것)
export const getUnusedCouponList = () => axios(Server.getRestAPIHost() + '/shop/unusedCouponList', { method: "get", params:{}, withCredentials:true, credentials: 'same-origin'})

// 사용불가 쿠폰 리스트 조회
export const getExpriedCouponList = () => axios(Server.getRestAPIHost() + '/shop/expiredCouponList', { method: "get", params:{}, withCredentials:true, credentials: 'same-origin'})

// 슈퍼리워드 주문체크(수퍼리워드 기간안에 주문일자가 포함되어있는지 체크하여 메세지를 리턴)
export const checkSuperRewardOrder = (data) => axios(Server.getRestAPIHost() + '/isSuperRewardGoodsOrderChk', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })

// 옵션상품 주문 가능한지 전체 체크
//orderInfoList = [{goodsNo: 1, orderCnt: 0}, {goodsNo: 2, orderCnt: 2}]

/*

orderInfoList = [
    {
        goodsNo: 1,
        options: [{
            optionIndex: 0,
            orderCnt: 1
        }]
    }
]
int goodsNo;            //상품번호
List<Option> options;   //체크를 위한 옵션 정보

*/

export const canBuyOptionGoods = (orderInfoList, consumerZipNo) => axios(Server.getRestAPIHost() + '/canBuyOptionGoods', { method: "post", params:{consumerZipNo}, data: {orderInfoList: orderInfoList}, withCredentials: true, credentials: 'same-origin' })


// 상품 쿠폰 리스트 조회
export const getGoodsCouponMasters = (goodsNo) => axios(Server.getRestAPIHost() + '/shop/goodsCouponMasters', { method: "get", params:{goodsNo}, withCredentials:true, credentials: 'same-origin'})
// 상품구매보상 쿠폰 리스트 조회 2021.04
export const getGoodsRewardCouponList = (goodsNo) => axios(Server.getRestAPIHost() + '/shop/goodsRewardCouponList', {method: "get", params:{goodsNo}, withCredentials:true, credentials: 'same-origin'})

// (친구초대)내 등급, 총 구매금액 조회
export const getRecommenderInfo = () => axios(Server.getRestAPIHost() + '/recommenderInfo', {method: "get", withCredentials:true, credentials: 'same-origin'})

// 친구초대랭킹 조회
export const getInviteRanking = () => axios(Server.getRestAPIHost() + '/inviteRanking', {method: "get", withCredentials:true, credentials: 'same-origin'})
// 구매랭킹 조회
export const getBuyingRanking = () => axios(Server.getRestAPIHost() + '/buyingRanking', {method: "get", withCredentials:true, credentials: 'same-origin'})

// 어뷰저 리스트
export const getAbusers = () => axios(Server.getRestAPIHost() + '/shop/abusers', { method: "get", params: {}, withCredentials: true, credentials: 'same-origin' })

// 어뷰저
export const getAbuser = () => axios(Server.getRestAPIHost() + '/shop/abuser', { method: "get", params: {}, withCredentials: true, credentials: 'same-origin' })

//슈퍼리워드용 티켓번호 가져오기
//TODO 사용안함(삭제예정) : buy.js 에서 호출시 에러 날 것임
export const getSuperRewardTicket = (goodsNo) => axios(Server.getRestAPIHost() + '/shop/superRewardTicket', { method: "get", params: {goodsNo}, withCredentials: true, credentials: 'same-origin' })

//슈퍼리워드용 티켓번호 가져오기
export const getSuperRewardTicketStatusByGoodsNos = (goodsNos) => axios(Server.getRestAPIHost() + '/shop/superRewardTicketStatus/goodsNos', { method: "get", params:{ goodsNos: goodsNos }, withCredentials: true, credentials: 'same-origin' })

// 나의 전체 토큰 히스토리 내역
export const getMyTokenHistory = (signal) => axios.get(Server.getRestAPIHost() + '/shop/myTokenHistory', { data: {}, withCredentials: true, credentials: 'same-origin', signal })

//쿠폰 한건 조회
export const getConsumerCouponByCouponNo = (couponNo) => axios(Server.getRestAPIHost() + '/shop/consumerCoupon', { method: "get", params: {couponNo}, withCredentials: true, credentials: 'same-origin' })

//포템쿠폰 한건 조회
export const getPotenCouponMaster = (goodsNo) => axios(Server.getRestAPIHost() + '/shop/potenCouponMaster', { method: "get", params: {goodsNo}, withCredentials: true, credentials: 'same-origin' })

//내 마일리지 쿠폰 조회
export const getRewardCoupon = () => axios(Server.getRestAPIHost() + '/shop/rewardCoupon', { method: "get", params: {}, withCredentials: true, credentials: 'same-origin' })

//다운로드 쿠폰목록
export const getDownloadableCouponList = () => axios(Server.getRestAPIHost() + '/shop/downloadableCoupon', { method: "get", params: {}, withCredentials: true, credentials: 'same-origin' })

//쿠폰 다운로드
export const downloadCoupon = (masterNo) => axios(Server.getRestAPIHost() + '/shop/downloadCoupon', { method: "post", params: {masterNo}, withCredentials: true, credentials: 'same-origin' })


// 커뮤니티 > 홈 [추려놓은 상품리뷰 리스트]
export const getCommunityHomeGoodsReviewList = () => axios(Server.getRestAPIHost() + '/shop/getCommunityHomeGoodsReviewList', { method: "get", params: {}, withCredentials: true, credentials: 'same-origin' })

// 커뮤니티 > 상품리뷰 [전체 최신 상품리뷰 리스트]
export const getCommunityGoodsReviewList = ({onlyPhotoReview, isPaging = false, limit = 10, page = 1}) => axios(Server.getRestAPIHost() + '/shop/getCommunityGoodsReviewList', { method: "get", params: {onlyPhotoReview, isPaging, limit, page}, withCredentials: true, credentials: 'same-origin' })

// 상품의 최고평점(좋아요 포함) 리뷰 4건
export const getCommunityBestGoodsReviewList = (goodsNo, forceUpdate = true, signal) => axiosCache.get(Server.getRestAPIHost() + '/shop/getCommunityGoodsReviewList/best/goodsNo', { method: "get", params: {goodsNo}, withCredentials: true, credentials: 'same-origin', forceUpdate: forceUpdate, cache: true, signal })

// 상품의 최저평점 리뷰 4건
export const getCommunityWorstGoodsReviewList = (goodsNo, forceUpdate = true, signal) => axiosCache.get(Server.getRestAPIHost() + '/shop/getCommunityGoodsReviewList/worst/goodsNo', { method: "get", params: {goodsNo}, withCredentials: true, credentials: 'same-origin', forceUpdate: forceUpdate, cache: true, signal })

// 특정 소비자가 작성한 전체 상품리뷰 리스트
export const getGoodsReviewByConsumerNo = ({consumerNo, isPaging = false, limit = 10, page = 1}) => axios(Server.getRestAPIHost() + '/shop/goodsReview/consumerNo', { method: "get", params: {consumerNo, isPaging, limit, page}, withCredentials: true, credentials: 'same-origin' })

// 소비자리뷰 리스트 (Tags)
export const getGoodsReviewByTags = ({tags, isPaging = false, limit = 10, page = 1}) => axios(Server.getRestAPIHost() + '/shop/goodsReview/tags', { method: "post", data: {tags}, params: {isPaging, limit, page}, withCredentials: true, credentials: 'same-origin' })

// 상품 리스트 (Tags)
export const getGoodsByTags = ({tags, localfoodProducerNo = 0, goodsNo, isGroupTag = false, isPaging = false, limit = 10, page = 1, forceUpdate = true, signal}) => axiosCache.get(Server.getRestAPIHost() + '/shop/goods/tags', {
    params: {tags, localfoodProducerNo, isGroupTag, isPaging, limit, page, goodsNo}, withCredentials: true, credentials: 'same-origin',
    forceUpdate: isPaging ? true : forceUpdate, //페이징을 사용 할 경우 캐싱된 데이터를 사용하면 쪼개어진 데이터라서 캐싱 기능을 사용 하지 않도록 함
    cache: true,
    signal
})

// 연관 상품 리스트 (Tags)
export const getRelatedGoodsByTags = ({tags, localfoodProducerNo = 0, goodsNo = 0, isPaging = false, limit = 10, page = 1, forceUpdate = true, signal}) => axiosCache.get(Server.getRestAPIHost() + '/shop/relatedGoods/tags', {
    params: {tags, localfoodProducerNo, isPaging, limit, page, goodsNo}, withCredentials: true, credentials: 'same-origin',
    forceUpdate: isPaging ? true : forceUpdate, //페이징을 사용 할 경우 캐싱된 데이터를 사용하면 쪼개어진 데이터라서 캐싱 기능을 사용 하지 않도록 함
    cache: true,
    signal
})


// 상품 리스트 (Tag)
export const getGoodsByTag = ({tag, isPaging = false, limit = 10, page = 1, goodsNo}) => axios(Server.getRestAPIHost() + '/shop/goods/tag', { method: "get", params: {tag, isPaging, limit, page, goodsNo}, withCredentials: true, credentials: 'same-origin' })

// 생산자 상품 리스트
export const getProducerGoods = (goodsKind) => axios(Server.getRestAPIHost() + '/shop/producer/goods', { method: "get", params: {goodsKind:goodsKind}, withCredentials: true, credentials: 'same-origin' })


// export const getGoodsReviewByGoodsNo = (goodsNo, isPaging = false, limit = 10, page = 1) => axios(Server.getRestAPIHost() + '/goodsReview/goodsNo', { method: "get", params: {goodsNo: goodsNo, isPaging: isPaging, limit: limit, page: page}, withCredentials: true, credentials: 'same-origin' })



//GoodsReview: 댓글추가
export const addGoodsReviewReply = ({orderSeq, content}) => axios(Server.getRestAPIHost() + '/shop/addGoodsReviewReply', { method: "post", data: {}, params: {orderSeq, content}, withCredentials: true, credentials: 'same-origin' })

//GoodsReview: 대댓글추가
export const addGoodsReviewReReply = ({orderSeq, at, content, refReplyId, realRefId}) => axios(Server.getRestAPIHost() + '/shop/addGoodsReviewReReply', { method: "post", data: {}, params: {orderSeq, at, content, refReplyId, realRefId}, withCredentials: true, credentials: 'same-origin' })

//GoodsReview: 댓글신고
export const reportGoodsReviewReply = ({orderSeq, replyId, reason}) => axios(Server.getRestAPIHost() + '/shop/reportGoodsReviewReply', { method: "post", data: {}, params: {orderSeq, replyId, reason}, withCredentials: true, credentials: 'same-origin' })

//GoodsReview: 신고
export const reportGoodsReview = ({orderSeq, reason}) => axios(Server.getRestAPIHost() + '/shop/reportGoodsReview', { method: "post", params: {orderSeq, reason}, withCredentials: true, credentials: 'same-origin' })



// 투표 리스트
export const getBoardVoteList = ({includeReply = false, isPaging = false, limit = 10, page = 1}) => axios(Server.getRestAPIHost() + '/community/boardVoteList', { method: "get", params: {includeReply, isPaging, limit, page}, withCredentials: true, credentials: 'same-origin' })

// 투표 리스트 (Tag)
export const getBoardVoteByTags = ({tags, includeReply = false, isPaging = false, limit = 10, page = 1}) => axios(Server.getRestAPIHost() + '/community/boardVoteList/tags', { method: "post", data: {tags}, params: {includeReply, isPaging, limit, page}, withCredentials: true, credentials: 'same-origin' })

// 투표 한건
export const getBoardVote = (writingId) => axios(Server.getRestAPIHost() + '/community/boardVote', { method: "get", params: {writingId}, withCredentials: true, credentials: 'same-origin' })

// 투표 하기
export const consumerVote = (writingId, voteItem) => axios(Server.getRestAPIHost() + '/community/boardVote', { method: "post", params: {writingId, voteItem}, withCredentials: true, credentials: 'same-origin' })

// 투표게시판 & 일반게시판 : 댓글 추가
export const addBoardReply = ({boardType, writingId, content}) => axios(Server.getRestAPIHost() + '/community/addBoardReply', { method: "post", data: {}, params: {boardType, writingId, content}, withCredentials: true, credentials: 'same-origin' })
// 투표게시판 & 일반게시판 : 대댓글 추가
export const addBoardReReply = ({boardType, writingId, at, content, refReplyId, realRefId}) => axios(Server.getRestAPIHost() + '/community/addBoardReReply', { method: "post", data: {}, params: {boardType, writingId, at, content, refReplyId, realRefId}, withCredentials: true, credentials: 'same-origin' })
// 투표게시판 & 일반게시판 : 댓글 수정
export const modBoardReply = ({boardType, writingId, replyId, content}) => axios(Server.getRestAPIHost() + '/community/modBoardReply', { method: "post", data: {}, params: {boardType, writingId, replyId, content}, withCredentials: true, credentials: 'same-origin' })
// 투표게시판 & 일반게시판 : 댓글 삭제
export const delBoardReply = ({boardType, writingId, replyId}) => axios(Server.getRestAPIHost() + '/community/delBoardReply', { method: "post", data: {}, params: {boardType, writingId, replyId}, withCredentials: true, credentials: 'same-origin' })

//////////pivot 추가.


// 생산자게시판 글 가져오기 => 생산이력만 가져오기시에는 stepOnly=true 로 세팅.
export const getProducerBoardList = ({producerNo, stepOnly=false, includeReply = false, isPaging = false, limit = 10, page = 1}) => axios(Server.getRestAPIHost() + '/community/boardList/producer', {method: "get", params: {producerNo, stepOnly, includeReply, isPaging, limit, page}, withCredentials: true, credentials: 'same-origin' })

// 상품상세 생산이력 글 가져오기
export const getProducerBoardGoodsStepList = ({goodsNo, limit = 5, page = 1}) => axios(Server.getRestAPIHost() + '/community/goodsStep', {method: "get", params: {goodsNo, limit, page}, withCredentials: true, credentials: 'same-origin' })

// 특정 소비자가 쓴 게시글 리스트 조회
export const getBoardListByConsumerNo = ({consumerNo, boardType, includeReply = false, isPaging = false, limit = 10, page = 1}) => axios(Server.getRestAPIHost() + '/community/boardList/consumerNo', {method: "get", params: {boardType, consumerNo, includeReply, isPaging, limit, page}, withCredentials: true, credentials: 'same-origin' })

// 내가 쓴 게시글 리스트 조회
export const getMyBoardList = ({boardType, includeReply = false, isPaging = false, limit = 10, page = 1}) => axios(Server.getRestAPIHost() + '/community/boardList/my', {method: "get", params: {boardType, includeReply, isPaging, limit, page}, withCredentials: true, credentials: 'same-origin' })

// 내가 쓴 댓글 리스트 조회(보드)
export const getMyReplyList = ({tableName, lastReplyId, limit = 10}) => axios(Server.getRestAPIHost() + '/community/myReplyList', {method: "get", params: {tableName, lastReplyId: lastReplyId, limit}, withCredentials: true, credentials: 'same-origin' })

// 내가 쓴 댓글 리스트 조회(보드, 투표, 리뷰 전부)
export const getMyAllReplyList = () => axios(Server.getRestAPIHost() + '/community/myReplyList/all', {method: "get", params: {}, withCredentials: true, credentials: 'same-origin' })

// 게시판 글쓰기
export const addBoardWriting = ({boardType, content, images, jjalImages, tags, goodsNo, stepTitle, stepIndex, topFix }, signal) => axios(Server.getRestAPIHost() + '/community/board', { method: "post", params: {boardType}, data: {content, images, jjalImages, tags, goodsNo, stepTitle, stepIndex, topFix}, withCredentials: true, credentials: 'same-origin', signal })

// 게시판 글수정
export const updateBoardWriting = ({writingId, boardType, content, images, jjalImages, tags, goodsNo, stepTitle, stepIndex, topFix }, signal) => axios(Server.getRestAPIHost() + '/community/board', { method: "put", data: {writingId, boardType, content, images, jjalImages, tags, goodsNo, stepTitle, stepIndex, topFix}, withCredentials: true, credentials: 'same-origin', signal })

// 게시판 글삭제
export const deleteBoardWriting = (writingId, signal) => axios(Server.getRestAPIHost() + '/community/deleteBoardWriting', { method: "post", params: {writingId}, withCredentials: true, credentials: 'same-origin', signal })

// 게시판 최신글 리스트 (생산자 글은 제외)
export const getBoardNewestList = ({includeReply = false, isPaging = false, limit = 10, page = 1, signal}) => axios(Server.getRestAPIHost() + '/community/boardNewestList', { method: "get", params: {includeReply, isPaging, limit, page}, withCredentials: true, credentials: 'same-origin', signal })

// 게시판 인기글 리스트 (top 10)
export const getBoardTopList = ({boardType, includeReply = false}) => axios(Server.getRestAPIHost() + '/community/boardTopList', { method: "get", params: {boardType, includeReply}, withCredentials: true, credentials: 'same-origin' })

// 게시판 리스트
export const getBoardList = ({boardType, includeReply = false, isPaging = false, limit = 10, page = 1, signal}) => axios(Server.getRestAPIHost() + '/community/boardList', { method: "get", params: {boardType, includeReply, isPaging, limit, page}, withCredentials: true, credentials: 'same-origin', signal })

// 게시판 리스트(tag로 조회)
export const getBoardListByTags = ({tags, includeReply = false, isPaging = false, limit = 10, page = 1}) => axios(Server.getRestAPIHost() + '/community/boardList/tags', { method: "post", data: {tags}, params: {includeReply, isPaging, limit, page}, withCredentials: true, credentials: 'same-origin' })

// 게시판 한건
export const getBoard = (writingId, signal) => axios(Server.getRestAPIHost() + '/community/board', { method: "get", params: {writingId}, withCredentials: true, credentials: 'same-origin', signal })

// 게시판 한건(본인 작성글인지 세션체크)
export const getMyBoard = (writingId, signal) => axios(Server.getRestAPIHost() + '/community/board/my', { method: "get", params: {writingId}, withCredentials: true, credentials: 'same-origin', signal })

// 게시판 좋아요 카운트 증가
export const likedBoard = (writingId) => axios(Server.getRestAPIHost() + '/community/boardWriting/like', { method: "post", params:{writingId: writingId}, withCredentials: true, credentials: 'same-origin' })

// 게시판 좋아요 카운트 조회(writingId)
export const getBoardLikesCount = (writingId) => axios(Server.getRestAPIHost() + '/community/boardWriting/likesCount', { method: "get", params: {writingId: writingId}, withCredentials: true, credentials: 'same-origin' })

// 게시판 신고
export const reportBoardWriting = ({writingId, reason, signal}) => axios(Server.getRestAPIHost() + '/community/reportBoardWriting', { method: "post", params: {writingId, reason}, withCredentials: true, credentials: 'same-origin', signal })

//포인트 요청
export const processPointClaim = ({type, id}) => axios(Server.getRestAPIHost() + '/community/pointClaim', { method: "post", params: {type, id}, withCredentials: true, credentials: 'same-origin' })

//포인트 요청 가능한지 여부 조회
export const getPointClaimStatus = ({type, id}) => axios(Server.getRestAPIHost() + '/community/pointClaim', { method: "get", params: {type, id}, withCredentials: true, credentials: 'same-origin' })

//게시글 수, 댓글 수, 스크랩 수 조회
export const getMyCommunitySummary = () => axios(Server.getRestAPIHost() + '/community/summary', { method: "get", params: {}, withCredentials: true, credentials: 'same-origin' })

// 오늘 룰렛에 이미 참여했는지 여부. -1 미로그인, 0 참여가능, 1 참여불가
export const getTodayRouletteAttend = () => axios(Server.getRestAPIHost() + '/roulette/today', { method: "get", params: {}, withCredentials: true, credentials: 'same-origin' })

// 룰렛 참
//8개중에 하나 추첨해서 0~7번 중 하나 리턴.
//미로그인, 이미 참여한 경우 -1 리턴.
export const raffleTodayRoulette = () => axios(Server.getRestAPIHost() + '/roulette/raffle', { method: "post", params: {}, withCredentials: true, credentials: 'same-origin' })

//룰렛 스탬프 조회: 이번달을 기본으로 조회. (202107 이런 파라미터 입력시 반영가능)
export const getMyRoulettePoint = (paramYyyymm) => axios(Server.getRestAPIHost() + '/roulette/my', { method: "get", params: {paramYyyymm}, withCredentials: true, credentials: 'same-origin' })

//룰렛 스탬프 설정 조회
export const getRouletteManage = (paramYyyymm) => axios(Server.getRestAPIHost() + '/rouletteManage', { method: "get", params: {paramYyyymm}, withCredentials: true, credentials: 'same-origin' })

//스크랩 추가
export const addMyScrap = ({type, refNo}) => axios(Server.getRestAPIHost() + '/community/scrap', { method: "post", params: {type, refNo}, withCredentials: true, credentials: 'same-origin' })

//내 스크랩List : 댓글포함시 - includeReply:true 전달필요.
export const getMyScrapList = (includeReply) => axios(Server.getRestAPIHost() + '/community/myScrap', { method: "get", params: {includeReply}, withCredentials: true, credentials: 'same-origin' })

//스크랩 되어있는지 여부
export const isScrapped = ({type, refNo}) => axios(Server.getRestAPIHost() + '/community/isScrapped', { method: "get", params: {type, refNo}, withCredentials: true, credentials: 'same-origin' })

//상품의 평점
export const getGoodsScore = (goodsNo) => axios(Server.getRestAPIHost() + '/goodsScore', { method: "get", params: {goodsNo}, withCredentials: true, credentials: 'same-origin' })

//생산자의 다른 상품
export const getGoodsListByProducerNo = (producerNo, forceUpdate = true, signal) => axiosCache.get(Server.getRestAPIHost() + '/shop/goods/producerNo', { params: {producerNo}, withCredentials: true, credentials: 'same-origin', forceUpdate: forceUpdate, cache: true, signal })


//자유 게시판 likesCount, myLike
export const getBoardWritingLikeInfo = (writingId) => axios(Server.getRestAPIHost() + '/community/boardWriting/likeInfo', { method: "get", params: {writingId}, withCredentials: true, credentials: 'same-origin' })

//리뷰 likesCount, myLike
export const getGoodsReviewLikeInfo = (orderSeq) => axios(Server.getRestAPIHost() + '/goodsReview/likeInfo', { method: "get", params: {orderSeq}, withCredentials: true, credentials: 'same-origin' })


//게시판 댓글 신고
export const reportBoardReply = ({boardType, writingId, replyId, reason}) => axios(Server.getRestAPIHost() + '/community/reportBoardReply', { method: "post", params: {boardType, writingId, replyId, reason}, withCredentials: true, credentials: 'same-origin' })

//홈 > 지금은 : 시간순 10개 feed
export const getLoungeTop10 = ({page}) => axios(Server.getRestAPIHost() + '/lounge/top10' + '?_'+new Date().getTime(), { method: "get", params: {page}, withCredentials: true, credentials: 'same-origin' })

// 소비자 자기 프로필 조회
export const getMyProfile = () => axios(Server.getRestAPIHost() + '/getMyProfile', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 다른 소비자 프로필 조회
export const getConsumerProfile = (consumerNo) => axios(Server.getRestAPIHost() + '/getConsumerProfile', { method: "get", params: {consumerNo: consumerNo}, withCredentials: true, credentials: 'same-origin' })

/* People top10 조회
    @param type:
        "sell":판매왕, 일주일간 판매건수 1등. (weekly)
        "score": goodsReview평점왕,      (weekly)
        "follower": 인싸왕"단골수 랭킹,    (weekly)
        "feed": "피드왕"프로듀서 게시판 글 작성순 (초기오픈시에 전체기준)
        추후 "reply": 감동왕 - 댓글수              (초기오픈시에 전체기준)
 */
export const getPeopleProducerTop10 = ({type}) => axios(Server.getRestAPIHost() + '/people/producerTop10', { method: "get", params: {type}, withCredentials: true, credentials: 'same-origin' })
export const getPeopleProducerTop1List = () => axios(Server.getRestAPIHost() + '/people/producerTop1List', { method: "get",  withCredentials: true, credentials: 'same-origin' })

/*People Consumer top10 조회 (1주일간)
@param type:   "bly":    저축왕 - BLY 많이 받은 사람
               "point":  활동왕 - point 많이 받은 사람
               "buy":    구매왕 - 구매건수
               "board":  다작왕 - board에 글 많이 쓴 사람
               "reply":  참견왕 - 댓글수 많은사람(board)
               "friend": 섭외왕 - 친구초대 많이 한사람
*/
export const getPeopleConsumerTop10 = ({type}) => axios(Server.getRestAPIHost() + '/people/consumerTop10', { method: "get", params: {type}, withCredentials: true, credentials: 'same-origin' })
export const getPeopleConsumerTop1List = () => axios(Server.getRestAPIHost() + '/people/consumerTop1List', { method: "get", withCredentials: true, credentials: 'same-origin' })

/*
   상품 구입한 사용자 조회(보통 상품 판매중인 경우 실시간 조회를 위해 사용)
   orderSeq 보다 큰 주문건의 사용자 조회
*/
export const getOrderConsumers = ({goodsNo, orderSeq}) => axios(Server.getRestAPIHost() + '/shop/goods/orderConsumers', { method: "get", params: {goodsNo, orderSeq}, withCredentials: true, credentials: 'same-origin' })

export const getFkOrderConsumers = ({goodsNo}) => axios(Server.getRestAPIHost() + '/shop/goods/fkOrderConsumers', { method: "get", params: {goodsNo}, withCredentials: true, credentials: 'same-origin' })

export const getProfileByConsumerNo = (consumerNo, signal) => axios(Server.getRestAPIHost() + '/consumer/profile/consumerNo', { method: "get", params: {consumerNo}, withCredentials: true, credentials: 'same-origin', signal })


//프로필 신고
export const profileReport = ({targetConsumerNo, reason}) => axios(Server.getRestAPIHost() + '/community/profileReport', { method: "post", params: {targetConsumerNo, reason}, withCredentials: true, credentials: 'same-origin' })
//프로필 신고여부 조회
export const getProfileReported = (targetConsumerNo) => axios(Server.getRestAPIHost() + '/community/profileReport', { method: "get", params: {targetConsumerNo}, withCredentials: true, credentials: 'same-origin' })

//프로필 차단
export const profileBlock = ({targetConsumerNo, reason}) => axios(Server.getRestAPIHost() + '/community/profileBlock', { method: "post", params: {targetConsumerNo, reason}, withCredentials: true, credentials: 'same-origin' })
//프로필 차단여부 조회
export const getProfileBlocked = (targetConsumerNo) => axios(Server.getRestAPIHost() + '/community/profileBlock', { method: "get", params: {targetConsumerNo}, withCredentials: true, credentials: 'same-origin' })

//badge count
export const getBadgeCountStatus = () => axios(Server.getRestAPIHost() + '/shop/badgeCountStatus', { method: "get", withCredentials: true, credentials:'same-origin'})


//로컬푸드 농가 카운트
export const getAllLocalfoodFarmerCount = () => axios(Server.getRestAPIHost() + '/shop/localfood/allFarmerCount', { method: "get", withCredentials: true, credentials:'same-origin'})

//로컬푸드 농가 조회
export const getLocalfoodFarmer = (localfoodFarmerNo) => axios(Server.getRestAPIHost() + '/shop/localfood/farmer', { method: "get", params: {localfoodFarmerNo}, withCredentials: true, credentials:'same-origin'})

//로컬푸드 주요농가 + 상품목록 조회
export const getStarredLocalfoodFarmerList = ({producerNo, isPaging = true, limit = 3, page = 1, signal}) => axios(Server.getRestAPIHost() + '/shop/localfood/starredLocalfoodFarmer/list', { method: "get", params: {producerNo, isPaging, limit, page}, withCredentials: true, credentials:'same-origin', signal})

/** 상품목록 */
export const getGoodsList = ({
                                 goodsFilter,
                                 sorter = {direction: 'DESC', property: 'timestamp'},
                                 isPaging = false, limit = 10, page = 1
                             }) => axios(Server.getRestAPIHost() + '/shop/goodsList', { method: "post", data: {sorter, goodsFilter}, params: {isPaging, limit, page}, withCredentials: true, credentials: 'same-origin' })

//주문그룹번호로 주문건수 조회
export const getOrderCountByOrderSubGroupNo = ({orderSubGroupNo}) => axios(Server.getRestAPIHost() + '/shop/order/count', { method: "get", params: {orderSubGroupNo}, withCredentials: true, credentials:'same-origin'})
//주문그룹번호의 progressState 가져오기
export const getOrderSubGroupProgressState = ({orderSubGroupNo}) => axios(Server.getRestAPIHost() + '/shop/orderSubGroup/progressState', { method: "get", params: {orderSubGroupNo}, withCredentials: true, credentials:'same-origin'})

//pb상품 영농일지 조회
export const getJeilPbFarmDiary = ({farmerCode, itemCode, forceUpdate = true, signal}) => axiosCache.get(Server.getRestAPIHost() + '/shop/pbFarmDiary', { params: {farmerCode, itemCode}, withCredentials: true, credentials:'same-origin', forceUpdate: forceUpdate, cache: true, signal})

//검색 키워드 추가
export const addSearchKeyword = ({keyword, source, pageName, producerNo}) => axios(Server.getRestAPIHost() + '/shop/searchKeyword', { method: "post", data: {keyword, source, pageName, producerNo}, withCredentials: true, credentials: 'same-origin' })

