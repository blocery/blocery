import axios from 'axios'
import { Server } from "../components/Properties";

// export const getFarmDiary = () => {
//     return [
//         {src:'http://localhost:8080/thumbnails/1a8mxPOk1gej.jpg', itemCd: '01', itemName: '배추', title: '물을 듬뿍 주었어요'},
//         {src:'http://localhost:8080/thumbnails/BYh38iFpyNpN.jpeg', itemCd: '01', itemName: '배추', title: '무럭무럭~'},
//         {src:'http://localhost:8080/thumbnails/iYPH172GOXHb.jpeg', itemCd: '01', itemName: '무', title: '새싹이 돋았습니다'},
//         {src:'http://localhost:8080/thumbnails/Ke5jcD72uqmn.jpg', itemCd: '01', itemName: '무', title: '꽃이 피었어요'},
//         {src:'http://localhost:8080/thumbnails/KOZSl1c3D6VU.jpeg', itemCd: '01', itemName: '무', title: '날씨가 좋아서 잘 자라고있어요'},
//         {src:'http://localhost:8080/thumbnails/pc6TsQjg6ei1.jpg', itemCd: '01', itemName: '시금치', title: '무농약 인증'},
//         {src:'http://localhost:8080/thumbnails/rxE35Z7pRC2l.jpg', itemCd: '01', itemName: '사과', title: '보이시나요?'},
//         {src:'http://localhost:8080/thumbnails/tjYTBL7W6JhG.jpg', itemCd: '01', itemName: '배추', title: '현재까지 당도가 상당히 높아요'},
//         {src:'http://localhost:8080/thumbnails/ts9cgzVLshSK.jpg', itemCd: '01', itemName: '배추', title: '물을 듬뿍 주었어요'},
//         {src:'http://localhost:8080/thumbnails/uLZJlqaEOoWK.jpg', itemCd: '01', itemName: '배추', title: '물을 듬뿍 주었어요'}
//     ]
// }

// 생산자 등록
export const addProducer = (data) => axios(Server.getRestAPIHost() + '/producer', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })
// 로그인한 생산자  조회
export const getProducer = () => axios(Server.getRestAPIHost() + '/producer', { method: "get", withCredentials: true, credentials: 'same-origin' })
//
export const getProducerValword = (valword) => axios(Server.getRestAPIHost() + '/checkProducerValword', { method: "get", params: {valword: valword}, withCredentials: true, credentials: 'same-origin' })
// 생산자 조회
export const getProducerByProducerNo = (producerNo) => axios(Server.getRestAPIHost() + '/producer/producerNo', { method: "get", params: {producerNo: producerNo}, withCredentials: true, credentials: 'same-origin' })
// 생산자 목록 조회
export const getProducerListByProducerNos = (producerNos) => axios(Server.getRestAPIHost() + '/producer/list/producerNos', { method: "get", params: {producerNos}, withCredentials: true, credentials: 'same-origin' })

// 생산자 조회
export const getProducerGoodsRegStopChk = (producerNo) => axios(Server.getRestAPIHost() + '/producer/goodsRegStopChk', { method: "get", params: {producerNo: producerNo}, withCredentials: true, credentials: 'same-origin' })

//재과관리용 상품바코드 중복체크
export const getLocalGoodsDupChk = (producerNo, localGoodsNo, localfoodFarmerNo, currentGoodsNo) => axios(Server.getRestAPIHost() + '/producer/localGoodsDupChk', { method: "get", params: {producerNo, localGoodsNo, localfoodFarmerNo, currentGoodsNo}, withCredentials: true, credentials: 'same-origin' })

// 생산자 이메일 조회
export const getProducerEmail = (email) => axios(Server.getRestAPIHost() + '/producer/email', { method: "get", withCredentials: true, credentials: 'same-origin', params: { email: email} })

//상품이력 조회
export const getGoodsStepList = (goodsNo) => axios(Server.getRestAPIHost() + '/producer/goodsStepList', { method: "get", params: {goodsNo: goodsNo}, withCredentials: true, credentials: 'same-origin' })
//상품이력 조회
export const getGoodsStep = (writingId) => axios(Server.getRestAPIHost() + '/producer/goodsStep', { method: "get", params: {writingId: writingId}, withCredentials: true, credentials: 'same-origin' })

// //재배일지 조회
// export const getFarmDiary = () => axios(Server.getRestAPIHost() + '/producer/farmDiary', { method: "get", withCredentials: true, credentials: 'same-origin' })
//
// //재배일지 등록
// export const addFarmDiary = (farmDiary) => axios(Server.getRestAPIHost() + '/producer/farmDiary', { method: "post", data: farmDiary, withCredentials: true, credentials: 'same-origin' })
//
// //재배일지 수정
// export const updFarmDiary = (farmDiary) => axios(Server.getRestAPIHost() + '/producer/farmDiary', { method: "put", data: farmDiary, withCredentials: true, credentials: 'same-origin' })
//
// //재배일지 삭제
// export const delFarmDiary = (diaryNo) => axios(Server.getRestAPIHost() + '/producer/farmDiary', { method: "delete", params:{diaryNo: diaryNo}, withCredentials: true, credentials: 'same-origin' })

//생산이력 등록
export const addGoodsStepBoard = (stepData) => axios(Server.getRestAPIHost() + '/community/addGoodsStepBoard', { method: "post", data: stepData, withCredentials: true, credentials: 'same-origin' })

// 생산자번호로 주문목록 조회
export const getOrderByProducerNo = (status) => axios(Server.getRestAPIHost() + '/producer/orderByProducerNo', { method: "get", params:{status}, withCredentials: true, credentials: 'same-origin' })

// 생산자번호로 주문목록 조회
export const getOrderWithoutCancelByProducerNo = (itemName, payMethod, orderStatus, startDate, endDate, searchConsumerOkDate) =>
    axios(Server.getRestAPIHost() + '/producer/orderWithoutCancelByProducerNo', {
        method: "get",
        params: {itemName: itemName, payMethod: payMethod, orderStatus: orderStatus, startDate: startDate, endDate: endDate, searchConsumerOkDate:searchConsumerOkDate},
        withCredentials: true,
        credentials: 'same-origin'
    })

// 생산자번호로 취소된 주문목록 조회
export const getCancelOrderByProducerNo = (startDate, endDate, itemName, payMethod) => axios(Server.getRestAPIHost() + '/producer/cancelOrderByProducerNo', {
    method: "get",
    params: {startDate: startDate, endDate: endDate, itemName: itemName, payMethod: payMethod},
    withCredentials: true, credentials: 'same-origin'
})

// 생산자별 주문 리스트 조회(subGroup 에 속한)
export const getOrderSubGroupList = ({startDate, endDate}) => axios(Server.getRestAPIHost() + '/producer/SubGroup/list', {
    method: "get",
    params: {startDate: startDate, endDate: endDate},
    withCredentials: true, credentials: 'same-origin'
})


// 생산자의 구매확정된 모든 주문목록
export const getAllConfirmedOrder = () => axios(Server.getRestAPIHost() + '/producer/allConfirmedOrder', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자의 구매확정된 주문목록 조회(월별, 정산리스트용)
export const getConfirmedOrderByProducerNo = (year, month) => axios(Server.getRestAPIHost() + '/producer/confirmedOrderByProducerNo', { method: "get", params:{year: year, month: month}, withCredentials: true, credentials: 'same-origin' })

// 생산자의 정산완료된 주문목록 조회(월별, 정산리스트용)
export const getPayoutCompletedOrderByProducerNo = (year, month) => axios(Server.getRestAPIHost() + '/producer/payoutCompletedOrderByProducerNo', { method: "get", params:{year: year, month: month}, withCredentials: true, credentials: 'same-origin' })

//주문 운송장 정보 업데이트
export const updateOrderTrackingInfo = (order) => axios(Server.getRestAPIHost() + '/producer/order/trackingInfo', { method: "patch", data: order, withCredentials: true, credentials: 'same-origin' })

//서브그룹 progressState 업데이트 (현재 배송중만 쓰임, 나중에 새로운 플래그 도입시 조건절 통해 사용 예정)
export const updateOrderSubGroupProgressStateByOrderSubGroupNos = ({orderSubGroupNos, progressState}) => axios(Server.getRestAPIHost() + '/producer/orderSubGroup/progressState', { method: "post", data: {list: orderSubGroupNos}, params: {progressState}, withCredentials: true, credentials: 'same-origin' })

//주문 운송장 정보 업데이트(orderSubGroupNo)
export const updateOrderTrackingInfoByOrderSubGroupNo = (orderSubGroupNo) => axios(Server.getRestAPIHost() + '/producer/order/trackingInfo/orderSubGroupNo', { method: "post", params: {orderSubGroupNo}, withCredentials: true, credentials: 'same-origin' })

//[로컬푸드]배송완료 +push, 2208미사용
//export const sendDeliveryDonePush = (orderSubGroupNo) => axios(Server.getRestAPIHost() + '/producer/order/deliveryDonePush', { method: "patch", params: {orderSubGroupNo}, withCredentials: true, credentials: 'same-origin' })

//[로컬푸드]배송완료 사진 업로드
export const updateDeliveryDoneImage = (orderSubGroup) => axios(Server.getRestAPIHost() + '/producer/order/deliveryDoneImage', { method: "put", data: orderSubGroup, withCredentials:true, credentials: 'same-origin' })


// 비밀번호 변경
export const updValword = (data) => axios(Server.getRestAPIHost() + '/producer/valword', { method: "put", data: data, withCredentials: true, credentials: 'same-origin' })

// 푸시 알림 수신 변경
export const updateProducerPush = (data) => axios(Server.getRestAPIHost() + '/producer/updateProducerPush', { method: "put", data: data, withCredentials: true, credentials: 'same-origin' })

// 생산자에게 등록된 단골고객수 조회
export const countRegularConsumer = (producerNo) => axios(Server.getRestAPIHost() + '/producer/countRegular', { method: "get", params:{producerNo: producerNo}, withCredentials: true, credentials: 'same-origin' })

//누적구매건수
export const countTotalOrder = (producerNo) => axios(Server.getRestAPIHost() + '/producer/countOrder', { method: "get", params:{producerNo: producerNo}, withCredentials: true, credentials: 'same-origin' })

// 생산자 운영현황 - 주문건수 (오늘,어제,주간,월간)
export const getOperStatOrderCntByProducerNo = () => axios(Server.getRestAPIHost() + '/producer/operStatOrderCntByProducerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 운영현황 - 취소건수 (오늘,어제,주간,월간)
export const getOperStatOrderCancelCntByProducerNo = () => axios(Server.getRestAPIHost() + '/producer/operStatOrderCancelCntByProducerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 운영현황 - 매출
export const getOperStatOrderSalesAmtByProducerNo = () => axios(Server.getRestAPIHost() + '/producer/operStatOrderSalesByProducerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 운영현황 - 상품문의건수 (오늘,어제,주간,월간)
export const getOperStatGoodsQnaCntByProducerNo = () => axios(Server.getRestAPIHost() + '/producer/operStatGoodsQnaCntByProducerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 운영현황 - 상품후기건수 (오늘,어제,주간,월간)
export const getOperStatGoodsReviewCntByProducerNo = () => axios(Server.getRestAPIHost() + '/producer/operStatGoodsReviewCntByProducerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 운영현황 - 단골회원 (오늘,어제,주간,월간)
export const getOperStatRegularShopCntByProducerNo = () => axios(Server.getRestAPIHost() + '/producer/operStatRegularShopCntByProducerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 주문현황 - 결제완료 (최근1개월기준)
export const getOrderStatOrderPaidCntByProducerNo = () => axios(Server.getRestAPIHost() + '/producer/orderStatOrderPaidByProducerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 주문현황 - 배송중 (최근1개월기준)
export const getOrderStatShippingCntByProducerNo = () => axios(Server.getRestAPIHost() + '/producer/orderStatShippingByProducerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 주문현황 - 배송완료 (최근1개월기준)
export const getOrderStatDeliveryCompCntByProducerNo = () => axios(Server.getRestAPIHost() + '/producer/orderStatDeliveryCompByProducerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 주문현황 - 구매확정 (최근1개월기준)
export const getOrderStatOrderConfirmOkCntByProducerNo = () => axios(Server.getRestAPIHost() + '/producer/orderStatOrderConfirmOkByProducerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 주문 매출 추이 (1월~12월)
export const getTransitionWithOrderSaleByProducerNo = () => axios(Server.getRestAPIHost() + '/producer/transitionWithOrderSaleByProducerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 소비자상품문의리스트
export const getGoodsQnaListByProducerNo = ({status, startDate, endDate}) => axios(Server.getRestAPIHost() + '/producer/goodsQnaListByProducerNo', { method: "get", params:{status: status, startDate:startDate, endDate:endDate},withCredentials: true, credentials: 'same-origin' })
// 생산자 소비자상품문의 미응답,응답 카운트
export const getGoodsQnaStatusCountByProducerNo = (status) => axios(Server.getRestAPIHost() + '/producer/goodsQnaStatusCountByProducerNo', { method: "get", params:{status: status},withCredentials: true, credentials: 'same-origin' })

// 생산자 소비자상품문의 조회
export const getGoodsQnaByGoodsQnaNo = (goodsQnaNo) => axios(Server.getRestAPIHost() + '/producer/goodsQnaByGoodsQnaNo', { method: "get", params:{goodsQnaNo: goodsQnaNo}, withCredentials: true, credentials: 'same-origin' })

// 로컬푸드 요청 문의 등록
export const addLocalFarmerQnA = (data) => axios(Server.getRestAPIHost() + '/producer/localFarmerQnA', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })

// 생산자 소비자상품문의 답변 처리 (알림파라미터 추가 기본 true)
export const setGoodsQnaAnswerByGoodsQnaNo = (goodsQna,allim = true) => axios(Server.getRestAPIHost() + '/producer/goodsQnaAnswerByGoodsQnaNo', { method: "put", data: goodsQna, params:{allim}, withCredentials: true, credentials: 'same-origin' })

// 생산자 상점정보 조회
export const getProducerShopByProducerNo = (producerNo) => axios(Server.getRestAPIHost() + '/producer/producerShopByProducerNo', { method: "get", params:{producerNo: producerNo}, withCredentials: true, credentials: 'same-origin' })

// 생산자 상점정보 변경 처리
export const setProducerShopModify = (producerShop) => axios(Server.getRestAPIHost() + '/producer/producerShopModify', { method: "put", data: producerShop, withCredentials: true, credentials: 'same-origin' })

// 생산자 소비자상품후기리스트
export const getGoodsReviewListByProducerNo = ({stars,startDate,endDate}) => axios(Server.getRestAPIHost() + '/producer/goodsReviewListByProducerNo', { method: "post", params:{searchStars: stars,startDate:startDate,endDate:endDate}, withCredentials: true, credentials: 'same-origin' })

// 생산자 소비자상품후기 신규 카운트 [14일이전까지]
export const getGoodsReviewNewCountByProducerNo = () => axios(Server.getRestAPIHost() + '/producer/goodsReviewNewCountByProducerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 소비자단골리스트(regularShop list)
export const getRegularShopListByProducerNo = (producerNo,status) => axios(Server.getRestAPIHost() + '/producer/regularShopByProducerNo', { method: "post", params:{producerNo: producerNo, status:status}, withCredentials: true, credentials: 'same-origin' })

// 생산자 통계 - 기간별 판매현황
export const getStaticsGiganSalesListByProducerNo = (data) => axios(Server.getRestAPIHost() + '/producer/giganSalesSttByProducerNo', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })

// 생산자 주문확인
export const setOrderConfirm = (data) => axios(Server.getRestAPIHost() + '/producer/orderConfirm', { method: "put", data: data, withCredentials: true, credentials: 'same-origin' })

// 생산자 주문내역 송장번호 일괄 저장 기능 (엑셀업로드 기능)
export const setOrdersTrackingNumber = (data) => axios(Server.getRestAPIHost() + '/producer/setOrdersTrackingNumber', { method: "put", data: data, withCredentials: true, credentials: 'same-origin' })

// 생산자 입점문의
export const regProducer = (data) => axios(Server.getRestAPIHost() + '/producer/queProducer', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })

// 생산자 주문취소 (OrderSubGroup)
export const producerCancelOrderSubGroup = (data) => axios(Server.getRestAPIHost() + '/producer/cancelOrderSubGroup', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })

// 생산자 주문취소
export const producerCancelOrder = (data) => axios(Server.getRestAPIHost() + '/producer/cancelOrder', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })

// (로컬)주문대체 가능여부 체크
export const producerReplaceOrderCheck = (orderSeq, barcode, barcodeOrderCount=1) => axios(Server.getRestAPIHost() + '/producer/replaceOrderCheck', { method: "get", params: {orderSeq, barcode, barcodeOrderCount}, withCredentials: true, credentials: 'same-origin' })
// (로컬)주문대체
//단건바코드 export const producerReplaceOrder = (orderSeq, barcode, barcodeOrderCount=1) => axios(Server.getRestAPIHost() + '/producer/replaceOrder', { method: "post", params: {orderSeq, barcode, barcodeOrderCount}, withCredentials: true, credentials: 'same-origin' })
//멀티바코드
export const producerReplaceOrder = (orderSeq, barcodeCountList) => axios(Server.getRestAPIHost() + '/producer/replaceOrder', { method: "post", params: {orderSeq}, data:barcodeCountList, withCredentials: true, credentials: 'same-origin' })


// (로컬)대체상품 취소 : (전표)제거
export const producerReplaceOrderRemove = (orderSeq) => axios(Server.getRestAPIHost() + '/producer/replaceOrderRemove', { method: "post", params: {orderSeq}, withCredentials: true, credentials: 'same-origin' })

// (로컬)대체상품 취소 : (한건)제거
export const replaceOrderPartRemove = (orderSeq, csOrderSeq) => axios(Server.getRestAPIHost() + '/producer/replaceOrderPartRemove', { method: "post", params: {orderSeq, csOrderSeq}, withCredentials: true, credentials: 'same-origin' })


// 생산자 주문취소 요청
export const reqProducerOrderCancel = (data) => axios(Server.getRestAPIHost() + '/producer/reqProducerOrderCancel', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })

// 생산자 주문취소 요청 철회
export const reqProducerOrderCancelBack = (orderSeq) => axios(Server.getRestAPIHost() + '/producer/reqProducerOrderCancelBack', { method: "post", params: {orderSeq}, withCredentials: true, credentials: 'same-origin' })

// 생산자 부분환불
export const partialRefundOrder = (data) => axios(Server.getRestAPIHost() + '/producer/partialRefundOrder', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })

// 생산자별 정산 주문내역 조회
export const getPaymentProducer = (year, month) => axios(Server.getRestAPIHost() + '/producer/paymentProducer', { method: "get", params: {year: year, month: month}, withCredentials: true, credentials: 'same-origin' })
export const paymentProducerGigan = (startDate, endDate, isConsumerOk) => axios(Server.getRestAPIHost() + '/producer/paymentProducerGigan', { method: "get", params: {startDate: startDate, endDate: endDate, isConsumerOk: isConsumerOk}, withCredentials: true, credentials: 'same-origin' })
// 생산자별 정산 주문내역 조회 (로컬)
export const getPaymentLocalProducer = (startDate, endDate, isConsumerOk) => axios(Server.getRestAPIHost() + '/producer/paymentLocalProducer', { method: "get", params: {startDate: startDate, endDate: endDate, isConsumerOk: isConsumerOk}, withCredentials: true, credentials: 'same-origin' })
// 생산자별 정산수수료에 따른 정산금반영 주문내역 조회
export const getPaymentLocalProducerFee = (startDate, endDate) => axios(Server.getRestAPIHost() + '/producer/paymentLocalProducerFee', { method: "get", params: {startDate: startDate, endDate: endDate}, withCredentials: true, credentials: 'same-origin' })


// 은행정보 조회
export const getBankInfoList = () => axios(Server.getRestAPIHost() + '/producer/bankInfoList', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 소비자 주문그룹정보 조회
export const getOrderGroupByOrderGroupNo = (orderGroupNo) => axios(Server.getRestAPIHost() + '/producer/orderGroup', { method: "get", params: { orderGroupNo: orderGroupNo} , withCredentials: true, credentials: 'same-origin' })

// 소비자 주문정보 조회
export const getOrderDetailByOrderSeq = (orderSeq) => axios(Server.getRestAPIHost() + '/producer/order', { method: "get", params: { orderSeq: orderSeq} , withCredentials: true, credentials: 'same-origin' })

//소비자 번호로 소비자정보 조회
export const getConsumerByConsumerNo = (consumerNo) => axios(Server.getRestAPIHost() + '/producer/consumerNo', { method: "get", params: {consumerNo: consumerNo}, withCredentials: true, credentials: 'same-origin' })

//택배사 조회(전체)
export const getTransportCompany = () => axios(Server.getRestAPIHost() + '/producer/transportCompany', { method: "get", params: {}, withCredentials: true, credentials: 'same-origin' })

//판매자 공지 등록
export const setProducerNotice = ({noticeStartDate, noticeEndDate, noticeImages}) => axios(Server.getRestAPIHost() + '/producer/notice', { method: "put", data: {noticeStartDate, noticeEndDate, noticeImages}, withCredentials: true, credentials: 'same-origin' })
export const setProducerNoticeNormalImages = ({noticeNormalImages}) => axios(Server.getRestAPIHost() + '/producer/noticeNormal', { method: "put", data: {noticeNormalImages}, withCredentials: true, credentials: 'same-origin' })
export const setProducerNoticeObjectUniqueImages = ({noticeObjectUniqueImages}) => axios(Server.getRestAPIHost() + '/producer/noticeObjectUnique', { method: "put", data: {noticeObjectUniqueImages}, withCredentials: true, credentials: 'same-origin' })

//소비자 마이페이지 제일위에 생산자 오늘판매건수 노출
export const getProducerTodayOrderCount = () => axios(Server.getRestAPIHost() + '/producer/todayOrderCount', { method: "get", params: {}, withCredentials: true, credentials: 'same-origin' })

//생산자 메뉴 진입시 정보
export const getProducerMenuSummary = () => axios(Server.getRestAPIHost() + '/producer/getProducerMenuSummary', { method: "get", params: {}, withCredentials: true, credentials: 'same-origin' })

export const getMyProfile = () => axios(Server.getRestAPIHost() + '/producer/getMyProfile', { method: "get", params: {}, withCredentials: true, credentials: 'same-origin' })

// 상점프로필 생산활동 탭 정보
export const getProducerProfile = (producerNo) => axios(Server.getRestAPIHost() + '/producer/getProducerProfile', { method: "get", params: {producerNo:producerNo}, withCredentials: true, credentials: 'same-origin' })

// 마지막 주문내역 확인시간 세팅
export const setLastSeenOrder = () => axios(Server.getRestAPIHost() + '/producer/setLastSeenOrder', { method: "post", params: {}, withCredentials: true, credentials: 'same-origin' })

// 마지막 주문취소내역 확인시간 세팅
export const setLastSeenOrderCancel = () => axios(Server.getRestAPIHost() + '/producer/setLastSeenOrderCancel', { method: "post", params: {}, withCredentials: true, credentials: 'same-origin' })

// 마지막 상품문의 확인시간 세팅
export const setLastSeenQna = () => axios(Server.getRestAPIHost() + '/producer/setLastSeenQna', { method: "post", params: {}, withCredentials: true, credentials: 'same-origin' })

// 마지막 상품후기 확인시간 세팅
export const setLastSeenGoodsReview = () => axios(Server.getRestAPIHost() + '/producer/setLastSeenGoodsReview', { method: "post", params: {}, withCredentials: true, credentials: 'same-origin' })


//////pivot 추가 - pConsumer mypage.
// 생산자(pConsumer) 해당상품 리뷰가져오기.
export const getProducerReviewList = ({includeReply = true, isPaging = false, limit = 10, page = 1}) => axios(Server.getRestAPIHost() + '/producer/goodsReview', {method: "get", params: {includeReply, isPaging, limit, page}, withCredentials: true, credentials: 'same-origin' })

// 생산자(pConsumer) 상품리스트 producer/goods
export const getProducerGoods = ({filter = 'all', isPaging = false, limit = 20, page = 1}) => axios(Server.getRestAPIHost() + '/producer/goods', {method: "get", params: {filter, isPaging, limit, page}, withCredentials: true, credentials: 'same-origin' })

// 생산자(pConsumer) 미응답 상품문의 가져오기
// type 0: 답변대기
//      1: 답변완료
export const getProducerQnaList = ({type = 0, isPaging = false, limit = 10, page = 1}) => axios(Server.getRestAPIHost() + '/producer/goodsQna', {method: "get", params: {type, isPaging, limit, page}, withCredentials: true, credentials: 'same-origin' })

// 생산자의 팔로워리스트
export const getRegularShopMembers = (producerNo) => axios(Server.getRestAPIHost() + '/producer/getRegularShopMembers', {method: "get", params: {producerNo: producerNo}, withCredentials: true, credentials: 'same-origin' })

// 생산자(pConsumer) 취소상품 목록
export const getOrderCancelList = ({isPaging = false, limit = 10, page = 1}) => axios(Server.getRestAPIHost() + '/producer/orderCancel', {method: "get",  params: {isPaging, limit, page}, withCredentials: true, credentials: 'same-origin' })

// 생산자(pConsumer) 취소요청카운트
export const getReqOrderCancelCnt = () => axios(Server.getRestAPIHost() + '/producer/reqOrderCancelCnt', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자(pConsumer) 부분취소카운트
export const getOrderCancelCnt = (startDate,endDate) => axios(Server.getRestAPIHost() + '/producer/orderCancelCnt', { method: "get", params:{startDate,endDate}, withCredentials: true, credentials: 'same-origin' })

// 생산자(pConsumer) 상품 목록
//  @param  type=0 주문확인필요 (default)
//          type=1 배송대기 orderConfrim="confirmed"
//          type=2 출고완료 orderConfrim="shipping"
export const getProducerOrderList = ({dealGoods = false, type = 0, withOrderConfirm, isPaging = false, limit = 10, page = 1}) => axios(Server.getRestAPIHost() + '/producer/orderList', {method: "get", params: {dealGoods, type, withOrderConfirm, isPaging, limit, page}, withCredentials: true, credentials: 'same-origin' })

// 생산자 전체 주문확인
export const setOrderAllConfirm = (dealGoods) => axios(Server.getRestAPIHost() + '/producer/orderAllConfirm', { method: "put", params: {dealGoods:dealGoods}, withCredentials: true, credentials: 'same-origin' })

//생산자 템프 조회
export const getProducerTemp = (coRegistrationNo) => axios(Server.getRestAPIHost() + '/producer/producerTemp', {method: "get", params: {coRegistrationNo}, withCredentials: true, credentials: 'same-origin' })

//생산자 템프 저장
export const saveProducerTemp = (producerTemp) => axios(Server.getRestAPIHost() + '/producer/producerTemp', { method: "post", data: producerTemp, withCredentials: true, credentials: 'same-origin' })

//사업자번호 조회 openAPI (백엔드 미동작, direct openAPI조회 버전) : serviceKey에 특수기호 + == 3개를 사이트에서 치환해서 동작.
//API 에러날 경우를 대비해 try catch 로 한번더 감싸줌
export const coRegistrationNoCheck = (coRegistrationNo) =>
    axios('https://api.odcloud.kr/api/nts-businessman/v1/status', {
        method: "post",
        data:{b_no:[coRegistrationNo]},
        params: {serviceKey:'kRndmfBHRmJl0t1iAfxIcEEXriGyVBnZf3plYt2lOPOa7Yik+jvf7ltkJwdvA60Aj3ZX5wzeQL7cSPEbGqdyWQ=='},
        withCredentials: false,
        credentials: 'same-origin',
        validateStatus: (status) => {
            // status : 400, 404, 500 등의 에러코드
            // true resolve 됨
            // false reject 됨, 하지만 reject 이후 catch() 로 떨어지지 않아 다음 스크립트가 수행되지 않음.
            return true; // 무조건 resolve 시켜 result.status === 200 으로 (성공) 판단
        }
    })

export const createProducerAccount = (data) => axios(Server.getRestAPIHost() + '/producer/createAccount', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })



//생산자용 상품검색
export const getAllGoodsNotEvent = ({searchType="goodsNm",searchKeyword=""}) => axios(Server.getRestAPIHost() + '/producer/allGoodsNotEvent', { method: "get", params: {searchType:searchType,searchKeyword:searchKeyword}, withCredentials: true, credentials: 'same-origin' })
export const getAllGoodsSaleList = ({goodsState="0",searchType="goodsNm",searchKeyword=""}) => axios(Server.getRestAPIHost() + '/producer/allGoodsSaleList', { method: "get", params: {goodsState:goodsState,searchType:searchType,searchKeyword:searchKeyword}, withCredentials: true, credentials: 'same-origin' })

//생산자 수동 전표발행
export const addCsRefundOrder = (csDay, csAmount, csRefundOrderSeq, csRefundDesc) => axios(Server.getRestAPIHost() + '/producer/addCsRefundOrder', { method: "post", params:{csDay, csAmount, csRefundOrderSeq, csRefundDesc}, withCredentials: true, credentials: 'same-origin' })
//생산자 수동 전표발행 취소
export const cancelCsRefundOrder = (csRefundOrderSeq) => axios(Server.getRestAPIHost() + '/producer/cancelCsRefundOrder', { method: "post", params:{csRefundOrderSeq}, withCredentials: true, credentials: 'same-origin' })

////로컬푸드 농가 관련
//로컬푸드 농가 리스트 조회
export const getLocalfoodFarmerList = () => axios(Server.getRestAPIHost() + '/producer/localfoodFarmerList', { method: "get", withCredentials: true, credentials: 'same-origin'})
//로컬푸드 농가 추가/수정
export const addOrUpdateLocalfoodFarmer = (data) => axios(Server.getRestAPIHost() + '/producer/localfoodFarmer', { method: "post", data: data, withCredentials: true, credentials: 'same-origin'})
//로컬푸드 한건 조회
export const getLocalfoodFarmer = (localfoodFarmerNo) => axios(Server.getRestAPIHost() + '/producer/localfoodFarmer', { method: "get", params:{localfoodFarmerNo}, withCredentials: true, credentials: 'same-origin' })

export const checkLocalGoodsDuplicate = (producerNo, localfoodFarmerNo, localGoodsNo) => axios(Server.getRestAPIHost() + '/producer/localGoodsDupCheck', { method: "get", params:{producerNo, localfoodFarmerNo, localGoodsNo}, withCredentials: true, credentials: 'same-origin' })


// 생산자에 해당하는 로컬푸드매장 소속농가 목록
//export const getLocalfoodFarmerListByProducerNo = (producerNo) => axios(Server.getRestAPIHost() + '/producer/localfoodFarmerListByProducerNo', {method: "get", params: {producerNo}, withCredentials: true, credentials: 'same-origin' })

//주문 프린트 여부 업데이트
// export const updateOrderPrinted = (orderSeqs) => axios(Server.getRestAPIHost() + '/producer/order/printed', { method: "post", data: {orderSeqs: orderSeqs}, params: {orderSeqs: orderSeqs}, withCredentials: true, credentials:'same-origin'})
// export const updateOrderPrinted = (orderSeqList) => axios(Server.getRestAPIHost() + '/producer/order/printed', { method: "put", data: {list: orderSeqList}, withCredentials: true, credentials:'same-origin'})



//주문 프린트 여부 업데이트
export const updateOrderSubGroupPrinted = (orderSubGroupNoList) => axios(Server.getRestAPIHost() + '/producer/orderSubGroup/printed', { method: "put", data: {list: orderSubGroupNoList}, withCredentials: true, credentials: 'same-origin' })

//주문번호로 주문내역 조회
export const getOrderDetailListBySeqs = (orderSeqList) => axios(Server.getRestAPIHost() + '/producer/order/list', { method: "post", data: {list: orderSeqList}, withCredentials: true, credentials: 'same-origin' })

//주문번호로 주문내역 조회
export const getOrderDetailListBySeqsPublic = (orderSeqList) => axios(Server.getRestAPIHost() + '/public/order/list', { method: "post", data: {list: orderSeqList}, withCredentials: true, credentials: 'same-origin' })
//orderDetail 목록 조회(orderSubGroupNo 로)
export const getOrderDetailListByOrderSubGroupNos = (orderSubGroupNoList) => axios(Server.getRestAPIHost() + '/producer/orderDetail/list/orderSubGroupNos', { method: "post", data: {list: orderSubGroupNoList}, withCredentials: true, credentials: 'same-origin' })

//orderSubGroup 목록 조회(orderSubGroupNo 로)
export const getOrderSubGroupListByOrderSubGroupNos = (orderSubGroupNoList) => axios(Server.getRestAPIHost() + '/producer/orderSubGroup/list/orderSubGroupNos', { method: "post", data: {list: orderSubGroupNoList}, withCredentials: true, credentials: 'same-origin' })

//주문번호로 주문내역 조회
export const getOrderDetailListByLocalFarmerNo = (producerNo=157, localFarmerNo, year, month, searchOkDate=false) => axios(Server.getRestAPIHost() + '/public/order/localFarmerNo', { method: "get", params: {producerNo, localFarmerNo, year, month, searchOkDate}, withCredentials: true, credentials: 'same-origin' })



//기간별 orderSubGroup 카운트 반환 (실시간 대시보드용)
// export const getOrderSubGroupCountFromLastNo = ({startDate, endDate, orderSubGroupNo}) => axios(Server.getRestAPIHost() + '/producer/orderSubGroup/new/count', { method: "get", params: {startDate, endDate, orderSubGroupNo}, withCredentials: true, credentials: 'same-origin' })
//서브그룹리스트 반환 (실시간 대시보드용)
export const getOrderSubGroupListBetweenDate = ({startDate, endDate}) => axios(Server.getRestAPIHost() + '/producer/orderSubGroup/list/betweenDate', { method: "get", params: {startDate, endDate}, withCredentials: true, credentials: 'same-origin' })
//주문리스트 반환 (실시간 대시보드용)
// export const getJustOrderDetailList = ({startDate, endDate}) => axios(Server.getRestAPIHost() + '/producer/orderDetail/list/dateBetween', { method: "get", params: {startDate, endDate}, withCredentials: true, credentials: 'same-origin' })

// 생산자별 주문 리스트 조회-모바일 신규주문 전용(orderSubGroupNo 보다 작은 것)
export const getOrderSubGroupListLessThanNo = ({orderSubGroupNo}) => axios(Server.getRestAPIHost() + '/producer/SubGroup/list/lt', { method: "get", params: {orderSubGroupNo}, withCredentials: true, credentials: 'same-origin' })

// 생산자 주문확인 by barcode with orderSeq(미사용 일 듯)
export const setOrderDetailConfirmWithBarcode = (orderSeq, barcode) => axios(Server.getRestAPIHost() + '/producer/confirmOrderDetailBarcode', { method: "post", params: {orderSeq, barcode} , withCredentials: true, credentials: 'same-origin' })

// 생산자 주문확인 by barcode with orderSubGroupNo
export const setOrderGroupConfirmWithBarcode = (orderSubGroupNo, barcode) => axios(Server.getRestAPIHost() + '/producer/confirmOrderGroupBarcode', { method: "post", params: {orderSubGroupNo, barcode} , withCredentials: true, credentials: 'same-origin' })

//주문목록 (정렬된)
export const getOrderDetailListSorted = () => axios(Server.getRestAPIHost() + '/producer/orderDetail/list/sorted', { method: "get", params: {}, withCredentials: true, credentials: 'same-origin' })

//박스에 담기 했는지 여부 "주문확인" 전 단계의 플래그 임(통상적으로)
export const updateAddGoodsToBoxFlag = (orderSeq) => axios(Server.getRestAPIHost() + '/producer/orderDetail/addGoodsToBoxFlag', { method: "post", data: {}, params: {orderSeq}, withCredentials: true, credentials: 'same-origin' })

