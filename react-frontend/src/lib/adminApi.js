import axios from 'axios'
import { Server } from "../components/Properties";
import axiosCache from "~/lib/axiosCache";

// 소비자 모든 회원 번호와 정보(이름, email, account) 가져오기  => 각 소비자별 토큰개수와 eth balance 조회용
export const getAllConsumers = ({startDate, endDate}) => axios(Server.getRestAPIHost() + '/allConsumers', { method: "get", params: {startDate:startDate, endDate:endDate}, withCredentials: true, credentials: 'same-origin' })
export const getOneConsumer = ({phone,email,name,nickname,consumerNo,recommenderNo, ip, manyConsumers, level}) => axios(Server.getRestAPIHost() + '/admin/oneConsumer', { method: "get", params: {phone,email,name,nickname,consumerNo,recommenderNo, ip, manyConsumers, level}, withCredentials: true, credentials: 'same-origin' })

// 소비자 검색 (탈퇴자제외)
export const getConsumerList = (consumerNo) => axios(Server.getRestAPIHost() + '/getConsumerList', { method: "get", params: {consumerNo}, withCredentials: true, credentials: 'same-origin' })

// 소비자 여러명 검색 (탈퇴자제외)
export const getConsumerCommaList = (consumerNo) => axios(Server.getRestAPIHost() + '/getConsumerCommaList', { method: "get", params: {consumerNo}, withCredentials: true, credentials: 'same-origin' })

//친구추천 카운트 조회
// export const getInviteFriendCount = (consumerNo) => axios(Server.getRestAPIHost() + '/inviteFriendCount', { method: "get", params: {consumerNo}, withCredentials: true, credentials: 'same-origin' })

// 탈퇴한 소비자
export const getStoppedConsumers = ({startDate, endDate}) => axios(Server.getRestAPIHost() + '/stoppedConsumers', { method: "get", params: {startDate:startDate, endDate:endDate}, withCredentials: true, credentials: 'same-origin' })

// 추천인/친구 조회
export const getRecommendFriends = ({startDate, endDate}) => axios(Server.getRestAPIHost() + '/recommendFriends', { method: "get", params: {startDate:startDate, endDate:endDate}, withCredentials: true, credentials: 'same-origin' })

// 어뷰저리스트
export const getConsumerAbusers = ({abuserStat}) => axios(Server.getRestAPIHost() + '/admin/abusers', { method: "get", params:{abuserStat:abuserStat}, withCredentials: true, credentials: 'same-origin' })

//회원 수(탈퇴안한 수)
export const getConsumerCount = () => axios(Server.getRestAPIHost() + '/consumerCount', { method: "get", withCredentials: true, credentials: 'same-origin' })

//회원 수(탈퇴한 수)
export const getConsumerStopedCount = () => axios(Server.getRestAPIHost() + '/consumerStopedCount', { method: "get", withCredentials: true, credentials: 'same-origin' })

//회원 수(휴면한 수)
export const getConsumerDormancyCount = () => axios(Server.getRestAPIHost() + '/consumerDormancyCount', { method: "get", withCredentials: true, credentials: 'same-origin' })

//준회원 수(giftReceiver 수)
export const getSemiConsumerCount = () => axios(Server.getRestAPIHost() + '/semiConsumerCount', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 소비자 번호별 구매건수 조회
export const getOrderCountByConsumers = (consumerNos) => axios(Server.getRestAPIHost() + '/admin/getOrderCountByConsumers', { method: "post", data:consumerNos, withCredentials: true, credentials: 'same-origin' })

// 상품 리뷰 리스트
export const goodsReviewList = ({startDate,endDate,blinded}) => axios(Server.getRestAPIHost() + '/admin/getGoodsReviewList', { method: "get", params:{startDate:startDate,endDate:endDate,blinded:blinded}, withCredentials: true, credentials: 'same-origin' })
// 상품 리뷰 신고 내역
export const getGoodsReviewReportList = ({orderSeq}) => axios(Server.getRestAPIHost() + '/admin/getGoodsReviewReportList', { method: "get", params: {orderSeq:orderSeq}, withCredentials: true, credentials: 'same-origin' })

// 게시글순위 리스트
export const getBoardRankingList = ({startDate,endDate}) => axios(Server.getRestAPIHost() + '/admin/getBoardRankingList', { method: "get", params:{startDate:startDate,endDate:endDate}, withCredentials: true, credentials: 'same-origin' })

//consumer+기간 게시글 조회
export const getConsumerBoardList = ({consumerNo,startDate,endDate,blinded}) => axios(Server.getRestAPIHost() + '/admin/getConsumerBoardList', { method: "get", params:{consumerNo:consumerNo, startDate:startDate,endDate:endDate, blinded:blinded}, withCredentials: true, credentials: 'same-origin' })

// 게시글 신고 리스트
export const getBoardReportList = ({startDate,endDate,reported,blinded}) => axios(Server.getRestAPIHost() + '/admin/getBoardReportList', { method: "get", params:{startDate:startDate,endDate:endDate,reported:reported,blinded:blinded}, withCredentials: true, credentials: 'same-origin' })
export const getOneConsumerBoardReportList = ({consumerNo,reported,blinded}) => axios(Server.getRestAPIHost() + '/admin/getOneConsumerBoardReportList', { method: "get", params: {consumerNo:consumerNo,reported:reported,blinded:blinded}, withCredentials: true, credentials: 'same-origin' })

// 게시글 신고 내역
export const boardBoardReportInfoList = ({boardType,writingId}) => axios(Server.getRestAPIHost() + '/admin/getBoardReportInfoList', { method: "get", params: {boardType:boardType,writingId:writingId}, withCredentials: true, credentials: 'same-origin' })

// 게시글 댓글 신고 내역
export const boardReplyReportInfoList = ({boardType,writingId,replyId}) => axios(Server.getRestAPIHost() + '/admin/getBoardReplyReportInfoList', { method: "get", params: {boardType:boardType,writingId:writingId,replyId:replyId}, withCredentials: true, credentials: 'same-origin' })

// 게시판 블라인딩
export const makeBoardBlinding = ({writingId}) => axios(Server.getRestAPIHost() + '/admin/boardBlinding', { method: "post", params: {writingId:writingId}, withCredentials: true, credentials: 'same-origin' })

// 게시판 블라인딩 복구
export const makeBoardNotBlinding = ({writingId}) => axios(Server.getRestAPIHost() + '/admin/boardNotBlinding', { method: "post", params: {writingId:writingId}, withCredentials: true, credentials: 'same-origin' })


// 게시판 댓글 신고 리스트
export const boardReplyReportList = ({tableName,startDate,endDate,replyDeleted,replyReported}) => axios(Server.getRestAPIHost() + '/admin/getBoardReplyReportList', { method: "get", params:{tableName:tableName,startDate:startDate,endDate:endDate,replyDeleted:replyDeleted,replyReported:replyReported}, withCredentials: true, credentials: 'same-origin' })
export const getOneConsumerBoardReplyReportList = ({tableName,consumerNo,replyDeleted,replyReported}) => axios(Server.getRestAPIHost() + '/admin/getOneConsumerBoardReplyReportList', { method: "get", params: {tableName:tableName,consumerNo,replyDeleted,replyReported}, withCredentials: true, credentials: 'same-origin' })

// 게시판 댓글 삭제
export const boardReplyDeleted = ({tableName,writingId,replyId,deleted}) => axios(Server.getRestAPIHost() + '/admin/boardReplyDeleted', { method: "post", params: {tableName:tableName,writingId:writingId,replyId:replyId,deleted:deleted}, withCredentials: true, credentials: 'same-origin' })

// 프로필 신고 리스트
export const profileReportList = () => axios(Server.getRestAPIHost() + '/admin/getProfileReportList', { method: "get",  withCredentials: true, credentials: 'same-origin' })
// 프로필 신고내역 리스트
export const profileReportInfoList = ({targetConsumerNo}) => axios(Server.getRestAPIHost() + '/admin/getProfileReportInfoList', { method: "get",  params: {targetConsumerNo:targetConsumerNo}, withCredentials: true, credentials: 'same-origin' })
// 프로필 차단 리스트
export const profileBlockList = () => axios(Server.getRestAPIHost() + '/admin/getProfileBlockList', { method: "get",  withCredentials: true, credentials: 'same-origin' })
// 프로필 블라인딩 차단
export const profileBlindingBlock = ({targetConsumerNo}) => axios(Server.getRestAPIHost() + '/admin/profileBlindingBlock', { method: "post", params: {targetConsumerNo:targetConsumerNo}, withCredentials: true, credentials: 'same-origin' })
// 프로필 블라인딩 차단 복구
export const profileNotBlindingBlock = ({targetConsumerNo}) => axios(Server.getRestAPIHost() + '/admin/profileNotBlindingBlock', { method: "post", params: {targetConsumerNo:targetConsumerNo}, withCredentials: true, credentials: 'same-origin' })


// 모든 생산자 모든 회원 상품 문의
export const producerGoodsQnaList = ({startDate,endDate,claimStatus,status}) => axios(Server.getRestAPIHost() + '/admin/producerGoodsQnaList', { method: "get", params:{startDate:startDate,endDate:endDate,claimStatus:claimStatus,status:status},withCredentials: true, credentials: 'same-origin' })
export const producerGoodsQnaStatusAllCount = (status) => axios(Server.getRestAPIHost() + '/producerGoodsQnaStatusAllCount', { method: "get", params:{status:status},withCredentials: true, credentials: 'same-origin' })
export const producerClaimQnaStatusAllCount = ({startDate,endDate,claimStatus}) => axios(Server.getRestAPIHost() + '/producerClaimQnaStatusAllCount', { method: "get", params:{startDate:startDate,endDate:endDate,claimStatus:claimStatus},withCredentials: true, credentials: 'same-origin' })

// 로컬푸드 생산자 요청 문의
export const localFarmerQnaList = ({startDate,endDate,status}) => axios(Server.getRestAPIHost() + '/admin/localFarmerQnaList', { method: "get", params:{startDate:startDate,endDate:endDate,status:status},withCredentials: true, credentials: 'same-origin' })
export const localFarmerQnaStatusAllCount = (status) => axios(Server.getRestAPIHost() + '/admin/localFarmerQnaStatusAllCount', { method: "get", params:{status:status},withCredentials: true, credentials: 'same-origin' })

// 로컬푸드 생산자 요청 문의 단건 조회
export const getLocalFarmerQnaByLocalFarmerQnaNo = (localFarmerQnaNo) => axios(Server.getRestAPIHost() + '/admin/localFarmerQnaByLocalFarmerQnaNo', { method: "get", params:{localFarmerQnaNo: localFarmerQnaNo}, withCredentials: true, credentials: 'same-origin' })
// 로컬푸드 생산자 요청 문의 답변 처리
export const setLocalFarmerQnaAnswerByLocalFarmerQnaNo = (localFarmerQna) => axios(Server.getRestAPIHost() + '/admin/localFarmerQnaAnswerByLocalFarmerQnaNo', { method: "put", data: localFarmerQna, withCredentials: true, credentials: 'same-origin' })
// 로컬푸드 생산자 요청 문의 답변 처리 [자동답변처리]
export const setLocalFarmerQnaAnswerByLocalFarmerQnaNoAuto = (localFarmerQnaNo) => axios(Server.getRestAPIHost() + '/admin/localFarmerQnaAnswerByLocalFarmerQnaNoAuto', { method: "put", params:{localFarmerQnaNo: localFarmerQnaNo}, withCredentials: true, credentials: 'same-origin' })

// 생산자 팝업용 (순수 생산자 조회용)
export const getAllProducerList = () => axios(Server.getRestAPIHost() + '/allProducerList', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 모든 회원 번호와 정보(이름, email, account) 가져오기  => 각 생산자별 토큰개수와 eth balance 조회용
export const getAllProducers = ({startDate, endDate, regGoods}) => axios(Server.getRestAPIHost() + '/allProducers', { method: "get", params:{startDate:startDate, endDate:endDate, regGoods:regGoods}, withCredentials: true, credentials: 'same-origin' })

// 생산자 묶음배송여부 변경
export const changeProducerWrapDeliver = (producerNo, wrapDeliver) => axios(Server.getRestAPIHost() + '/admin/changeProducerWrapDeliver', { method: "post", params: {producerNo:producerNo, wrapDeliver:wrapDeliver}, withCredentials: true, credentials: 'same-origin' })

// 생산자 iost 계정생성
export const createProducerIostAccount = (producerNo) => axios(Server.getRestAPIHost() + '/admin/createProducerIostAccount', { method: "post", params: {producerNo:producerNo}, withCredentials: true, credentials: 'same-origin' })

// 생산자 블록체인 생산이력 기록 권한 부여
export const authProducer = (producerAccount) => axios(Server.getRestAPIHost() + '/admin/authProducer', { method: "post", params: {account:producerAccount}, withCredentials: true, credentials: 'same-origin' })

// 생산자 블록체인 생산이력 기록 권한 확인
export const checkAuthProducer = (producerAccount) => axios(Server.getRestAPIHost() + '/admin/checkAuthProducer', { method: "get", params: {producerAccount:producerAccount}, withCredentials: true, credentials: 'same-origin' })

// 생산자 상품등록 중지/재개
export const updateProducerGoodsStop = (producerNo, goodsRegStop) => axios(Server.getRestAPIHost() + '/admin/producerGoodsRegStop', { method:"put", params:{ producerNo: producerNo, goodsRegStop: goodsRegStop}, withCredentials: true, credentials: 'same-origin' })

//상품이력 조회
export const getAllGoodsStepList = (goodsNo) => axios(Server.getRestAPIHost() + '/admin/allGoodsStepList', { method: "get", params: {goodsNo: goodsNo}, withCredentials: true, credentials: 'same-origin' })
//상품이력 조회
export const getGoodsStep = (writingId, consumerNo) => axios(Server.getRestAPIHost() + '/admin/goodsStep', { method: "get", params: {writingId: writingId, consumerNo: consumerNo}, withCredentials: true, credentials: 'same-origin' })
//생산이력 삭제
export const delGoodsStep = (writingId, consumerNo) => axios(Server.getRestAPIHost() + '/admin/goodsStep', { method: "delete", params:{writingId: writingId, consumerNo: consumerNo}, withCredentials: true, credentials: 'same-origin' })
//생산이력 수정
export const updateGoodsStep = (stepData) => axios(Server.getRestAPIHost() + '/admin/updateGoodsStep', { method: "post", data: stepData, withCredentials: true, credentials: 'same-origin' })

//생산자활동관리 조회
export const getProducerActivity = (year, month) => axios(Server.getRestAPIHost() + '/admin/producerActivity', { method: "get", params:{year:year,month:month}, withCredentials: true, credentials: 'same-origin'})

// 생산자별 매출 정정산 자료 조회
export const getAllProducerPayoutList = (year, month) => axios(Server.getRestAPIHost() + '/admin/allProducerPayoutList', { method: "get", params: {year: year, month: month}, withCredentials: true, credentials: 'same-origin' })

// 포텐타임 지원금 blct 월별 금액 조회
export const getSupportPriceBlct = (year, month) => axios(Server.getRestAPIHost() + '/admin/getSupportPriceBlct', { method: "get", params: {year: year, month: month}, withCredentials: true, credentials: 'same-origin' })

// 생산자별 정산 check 자료 조회
export const getProducerPaymentCheck = (producerNo, year, month) => axios(Server.getRestAPIHost() + '/admin/producerPaymentCheck', { method: "get", params: {producerNo: producerNo, year: year, month: month}, withCredentials: true, credentials: 'same-origin' })

// 정산시 체크 메모리스트 조회
export const getPaymentCheckMemoList = (producerNoDotMonth) => axios(Server.getRestAPIHost() + '/admin/getPaymentCheckMemoList', { method: "get", params: {producerNoDotMonth: producerNoDotMonth}, withCredentials: true, credentials: 'same-origin' })

// 정산 메모 삭제
export const delPaymentMemo = (memoData) => axios(Server.getRestAPIHost() + '/admin/delPaymentMemo', { method: "delete", data: memoData, withCredentials: true, credentials: 'same-origin' })

// 생산자별 정산 주문내역 조회
export const getPaymentProducer = (producerNo, year, month) => axios(Server.getRestAPIHost() + '/admin/paymentProducer', { method: "get", params: {producerNo: producerNo, year: year, month: month}, withCredentials: true, credentials: 'same-origin' })
export const getPaymentProducerGigan = (producerNo, startDate, endDate) => axios(Server.getRestAPIHost() + '/admin/paymentProducerGigan', { method: "get", params: {producerNo: producerNo, startDate: startDate, endDate: endDate}, withCredentials: true, credentials: 'same-origin' })

// 생산자별 매출 정산 상태를 db 에 기록
export const setProducerPayoutStatus = (year, month) =>
    axios(Server.getRestAPIHost() + '/admin/orderDetail/producerPayoutStatus', {
        method: "patch",
        params: {year: year, month: month},
        withCredentials: true, credentials: 'same-origin'
    })

// 포인트전환내역 가져오기
export const getAllPointBlyHistory = ({consumerNo,startDate,endDate}) => axios(Server.getRestAPIHost() + '/getAllPointBlyHistory', { method: "get", params: {startDate:startDate,endDate:endDate,consumerNo:consumerNo}, withCredentials: true, credentials: 'same-origin' })

// 모든 주문번호 가져오기
export const getAllOrderDetailList = ({startDate,endDate,orderStatus,searchDate}) => axios(Server.getRestAPIHost() + '/allOrderDetailList', { method: "get", params: {startDate:startDate,endDate:endDate,orderStatus:orderStatus,searchDate:searchDate}, withCredentials: true, credentials: 'same-origin' })

//한건 (한조건) 주문조회
export const getOneOrderDetail = ({consumerNo,orderSeqList,csOrderSeq,orderSubGroupNo,goodsNo,receiverName,receiverPhone,receiverZipNo}) => axios(Server.getRestAPIHost() + '/admin/getOneOrderDetail', { method: "get", params: {consumerNo,orderSeqList,csOrderSeq,orderSubGroupNo,goodsNo,receiverName,receiverPhone,receiverZipNo}, withCredentials: true, credentials: 'same-origin' })

// 주문 카드 오류 내 가져오기
export const getAllOrderTempDetailList = ({year,month}) => axios(Server.getRestAPIHost() + '/allOrderTempDetailList', { method: "get", params: {year:year,month:month}, withCredentials: true, credentials: 'same-origin' })

export const getAllOrderStats = ({startDate, endDate, isConsumerOk, searchType, isYearMonth}) => axios(Server.getRestAPIHost() + '/allOrderStats', { method: "get", params: {startDate:startDate, endDate:endDate, isConsumerOk: isConsumerOk, searchType:searchType, isYearMonth:isYearMonth}, withCredentials: true, credentials: 'same-origin' })

export const getAllPointStats = ({startDate, endDate, isBatch, isYearMonth}) => axios(Server.getRestAPIHost() + '/allPointStats', { method: "get", params: {startDate:startDate, endDate:endDate, isBatch: isBatch, isYearMonth:isYearMonth}, withCredentials: true, credentials: 'same-origin' })

export const getAllReservesStats = ({startDate, endDate, isYearMonth}) => axios(Server.getRestAPIHost() + '/allReservesStats', { method: "get", params: {startDate:startDate, endDate:endDate, isYearMonth:isYearMonth}, withCredentials: true, credentials: 'same-origin' })

export const getAllGoodsList = ({startDate, endDate, modDateSearch, goodsState, deleted}) => axios(Server.getRestAPIHost() + '/admin/allGoodsList', { method: "get", params: {startDate:startDate, endDate:endDate, modDateSearch:modDateSearch, goodsState:goodsState,deleted:deleted}, withCredentials: true, credentials: 'same-origin' })

export const getAllGoodsListForStep = ({goodsState, deleted}) => axios(Server.getRestAPIHost() + '/admin/allGoodsListForStep', { method: "get", params: {goodsState:goodsState,deleted:deleted}, withCredentials: true, credentials: 'same-origin' })

export const getAllGoodsSaleList = ({goodsState="0",searchType="goodsNm",searchKeyword=""}) => axios(Server.getRestAPIHost() + '/allGoodsSaleList', { method: "get", params: {goodsState:goodsState,searchType:searchType,searchKeyword:searchKeyword}, withCredentials: true, credentials: 'same-origin' })

export const getAdminGoodsNoBuyReward = () => axios(Server.getRestAPIHost() + '/getAdminGoodsNoBuyReward', { method: "get", withCredentials: true, credentials: 'same-origin' })

export const getAllGoodsNotEvent = ({searchType="goodsNm",searchKeyword=""}) => axios(Server.getRestAPIHost() + '/allGoodsNotEvent', { method: "get", params: {searchType:searchType,searchKeyword:searchKeyword}, withCredentials: true, credentials: 'same-origin' })

// 모든 상품정보 가져오기
export const getAllGoods = () => axios(Server.getRestAPIHost() + '/allGoods', {method: "get", withCredentials: true, credentials: 'same-origin'})

// 품절상품 조회
export const getSoldOutGoods = () => axios(Server.getRestAPIHost() + '/soldOutGoodsList', {method: "get", withCredentials: true, credentials: 'same-origin'})

// 판매 일시중지 상품 조회
export const getPausedGoods = () => axios(Server.getRestAPIHost() + '/pausedGoodsList', {method: "get", withCredentials: true, credentials: 'same-origin'})

// 판매종료상품 조회
export const getSaleEndGoods = (deleted = false) => axios(Server.getRestAPIHost() + '/saleEndGoodsList', {method: "get", params: {deleted: deleted}, withCredentials: true, credentials: 'same-origin'})

// consumerNo로 account 가져오기
export const getNewAllocateSwapBlyAccount = (consumerNo) => axios(Server.getRestAPIHost() + '/admin/getNewAllocateSwapBlyAccount', { method: "get", params: {consumerNo: consumerNo}, withCredentials: true, credentials: 'same-origin' })

// email로 account 가져오기
export const getConsumerAccountByEmail = (email) => axios(Server.getRestAPIHost() + '/consumer/email', { method: "get", params: {email: email}, withCredentials: true, credentials: 'same-origin' })

// 비밀번호 reset (abc1234!)
export const resetPassword = (userType, email) => axios(Server.getRestAPIHost() + '/valword', { method: "put", params: {userType:userType, email: email}, withCredentials: true, credentials: 'same-origin' })


//택배사 조회(전체)
export const getTransportCompany = () => axios(Server.getRestAPIHost() + '/admin/transportCompany', { method: "get", params: {}, withCredentials: true, credentials: 'same-origin' })

//택배사 조회(택배사 번호)
export const getTransportCompanyByNo = (transportCompanyNo) => axios(Server.getRestAPIHost() + '/admin/transportCompany/transportCompanyNo', { method: "get", params: {transportCompanyNo: transportCompanyNo}, withCredentials: true, credentials: 'same-origin' })

//택배사 조회(택배사 코드)
export const getTransportCompanyByCode = (transportCompanyCode) => axios(Server.getRestAPIHost() + '/admin/transportCompany/transportCompanyCode', { method: "get", params: {transportCompanyCode: transportCompanyCode}, withCredentials: true, credentials: 'same-origin' })

//택배사 등록 & 수정
export const addTransportCompany = (transportCompany) => axios(Server.getRestAPIHost() + '/admin/transportCompany', { method: "post", data: transportCompany, withCredentials: true, credentials: 'same-origin' })

//택배사 삭제
export const delTransportCompany = (transportCompanyNo) => axios(Server.getRestAPIHost() + '/admin/transportCompany', { method: "delete", params:{transportCompanyNo: transportCompanyNo}, data: {transportCompanyNo: transportCompanyNo}, withCredentials: true, credentials: 'same-origin' })

//택배사코드 중복여부 체크
export const getIsDuplicatedTransportCode = (transportCompanyCode, transportCompanyNo) => axios(Server.getRestAPIHost() + '/admin/transportCompany/validate', { method: "get", params: {transportCompanyCode: transportCompanyCode, transportCompanyNo: transportCompanyNo}, withCredentials: true, credentials: 'same-origin' })

//품목 조회(전체)
export const getItems = (onlyEnabled) => axios(Server.getRestAPIHost() + '/admin/item', { method: "get", params: {onlyEnabled: onlyEnabled}, withCredentials: true, credentials: 'same-origin' })

//품목 조회(품목 번호)
export const getItemByItemNo = (itemNo) => axios(Server.getRestAPIHost() + '/admin/item/itemNo', { method: "get", params: {itemNo: itemNo}, withCredentials: true, credentials: 'same-origin' })

//품목 등록 & 수정
export const addItem = (item) => axios(Server.getRestAPIHost() + '/admin/item', { method: "post", data: item, withCredentials: true, credentials: 'same-origin' })

//품목 활성 or 비활성
export const updateItemEnabled = (itemNo, enabled) => axios(Server.getRestAPIHost() + '/admin/item', { method: "put", params:{itemNo: itemNo, enabled: enabled}, withCredentials: true, credentials: 'same-origin' })

//itemKind(품종)코드 발췌.
export const getNewItemKindCode = (itemNo, enabled) => axios(Server.getRestAPIHost() + '/admin/itemKindCode', { method: "put", withCredentials: true, credentials: 'same-origin' })

//itemKind(품종)코드로 품명 조회
export const getItemKindByCode = (code) => axios(Server.getRestAPIHost() + '/admin/itemKind', { method: "get", params: {code: code}, withCredentials: true, credentials: 'same-origin' })

// FAQ 등록
export const regFaq = (faq) => axios(Server.getRestAPIHost() + '/admin/regFaq', { method: "post", data: faq, withCredentials: true, credentials: 'same-origin'})

// FAQ type별 조회
export const getFaqList = (faqType) => axios(Server.getRestAPIHost() + '/getFaqList', { method: "get", params: {faqType: faqType}, withCredentials: true, credentials: 'same-origin'})

// FAQ 검색 조회
export const getFaqSearch = (keyword, faqType) => axios(Server.getRestAPIHost() + '/getFaqSearch', { method: "get", params: {keyword: keyword, faqType: faqType}, withCredentials: true, credentials: 'same-origin'})

// FAQ 삭제
export const delFaqApi = (faqNo) => axios(Server.getRestAPIHost() +'/admin/delFaq', { method:"delete", params:{faqNo: faqNo}, withCredentials: true})

// 공지사항 등록
export const regNotice = (notice) => axios(Server.getRestAPIHost() + '/admin/regNotice', { method: "post", data: notice, withCredentials: true, credentials: 'same-origin'})

// 공지사항 조회
export const getNoticeListForAdmin = ({startDate, endDate}) => axios(Server.getRestAPIHost() + '/admin/getNoticeList', { method: "get", params:{startDate: startDate,endDate:endDate}, withCredentials: true, credentials: 'same-origin' })

// 공지사항 한건 조회
export const getNoticeByNoticeNo = (noticeNo) => axios(Server.getRestAPIHost() + '/getNotice', { method: "get", params:{noticeNo}, withCredentials: true, credentials: 'same-origin' })

// 공지사항 삭제
export const delNoticeApi = (noticeNo) => axios(Server.getRestAPIHost() + '/admin/delNotice', { method: "delete", params:{noticeNo: noticeNo}, withCredentials: true, credentials: 'same-origin' })

// 푸시알림 등록
export const regPushNoti = (pushNoti) => axios(Server.getRestAPIHost() + '/admin/regPushNoti', { method: "post", data: pushNoti, withCredentials: true, credentials: 'same-origin'})

// 푸시알림 조회
export const getPushNotiList = ({year}) => axios(Server.getRestAPIHost() + '/getPushNotiList', { method: "get", params:{year: year}, withCredentials: true, credentials: 'same-origin' })

// 푸시알림 한건 조회
export const getPushNotiByPushNotiNo = (pushNotiNo) => axios(Server.getRestAPIHost() + '/getPushNoti', { method: "get", params:{pushNotiNo: pushNotiNo}, withCredentials: true, credentials: 'same-origin' })

// 푸시알림 삭제
export const delPushNoti = (pushNotiNo) => axios(Server.getRestAPIHost() + '/admin/delPushNoti', { method: "delete", params:{pushNotiNo: pushNotiNo}, withCredentials: true, credentials: 'same-origin' })

// 공휴일 조회
export const getHolidayList = ({startDate, endDate}) => axios(Server.getRestAPIHost() + '/admin/holiday', { method: "get", params:{startDate: startDate,endDate:endDate}, withCredentials: true, credentials: 'same-origin' })

// 공휴일 등록
export const regHoliday = (holiday) => axios(Server.getRestAPIHost() + '/admin/holiday', { method: "put", data: holiday, withCredentials: true, credentials: 'same-origin'})

// 공휴일 삭제
export const delHoliday = (key) => axios(Server.getRestAPIHost() + '/admin/holiday', { method: "delete", params:{key}, withCredentials: true, credentials: 'same-origin' })

// 차단품목 조회
export const getBlockPummokList = ({producerNo, localFarmerNoInt, itemNo}) => axios(Server.getRestAPIHost() + '/admin/getBlockPummokList', { method: "get", params:{producerNo:producerNo, localFarmerNoInt:localFarmerNoInt, itemNo:itemNo}, withCredentials: true, credentials: 'same-origin' })

// 차단품목 등록
export const saveBlockPummok = (producerNo, itemNoList, localBlockPummok) => axios(Server.getRestAPIHost() + '/admin/saveBlockPummok', { method: "post", params:{producerNo:producerNo, itemNoList:itemNoList}, data:localBlockPummok, withCredentials: true, credentials: 'same-origin' })

// 차단품목 수정
export const updateBlockPummok = (producerNo, localBlockPummok) => axios(Server.getRestAPIHost() + '/admin/updateBlockPummok', { method: "post", params:{producerNo:producerNo}, data:localBlockPummok, withCredentials: true, credentials: 'same-origin' })

// 차단품목 삭제
export const removeBlockPummok = (producerNo, localBlockPummok) => axios(Server.getRestAPIHost() + '/admin/removeBlockPummok', { method: "delete", params:{producerNo:producerNo}, data:localBlockPummok, withCredentials: true, credentials: 'same-origin' })

// 이벤트 지급 목록
export const getB2cEventPaymentList = () => axios(Server.getRestAPIHost() + '/admin/getB2cEventPaymentList', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자의 BLCT구매 정산방법 변경
export const changeProducerPayoutBlct = (producerNo, newPayoutBlct) => axios(Server.getRestAPIHost() + '/changeProducerPayoutBlct', { method: "post", params:{producerNo: producerNo, newPayoutBlct: newPayoutBlct}, withCredentials: true, credentials: 'same-origin' })


// 생산자 수수료 등록 및 수정
export const regProducerFeeRate = (data) => axios(Server.getRestAPIHost() + '/admin/regProducerFeeRate', { method: "post", data:data, withCredentials: true, credentials: 'same-origin' });

// 생산자 수수료 목록
export const getProducerFeeRate = () => axios(Server.getRestAPIHost() + '/admin/getProducerFeeRateList', { method: "get", withCredentials: true, credentials: 'same-origin' });


// 생산자별 개인 수수료 수정
export const saveFeeRateToProducer = (producerNo, producerRateId, rate) => axios(Server.getRestAPIHost() + '/admin/saveFeeRateToProducer', { method: "post", params:{producerNo: producerNo, producerRateId: producerRateId, rate: rate}, withCredentials: true, credentials: 'same-origin' })

// 생산자별 개인 수수료 수정 예약.
export const reserveFeeRateToProducer = (producerNo, producerRateId, rate, date) => axios(Server.getRestAPIHost() + '/admin/reserveFeeRateToProducer', { method: "post", params:{producerNo: producerNo, producerRateId: producerRateId, rate: rate, date: date}, withCredentials: true, credentials: 'same-origin' })
// 생산자별 개인 수수료 수정 즉시 변.
export const directFeeRateToProducer = (producerNo, producerRateId, rate) => axios(Server.getRestAPIHost() + '/admin/directFeeRateToProducer', { method: "post", params:{producerNo: producerNo, producerRateId: producerRateId, rate: rate}, withCredentials: true, credentials: 'same-origin' })

///////B2B_ADD////////////////////////////////////////////////////////////////////////////////////////////////////

//B2B판매중 상팜
export const getAllFoodsSaleList = () => axios(Server.getRestAPIHost() + '/allFoodsSaleList', { method: "get", withCredentials: true, credentials: 'same-origin' })


//B2B 품목 조회(전체)
export const getB2bItems = (onlyEnabled) => axios(Server.getRestAPIHost() + '/admin/b2bItem', { method: "get", params: {onlyEnabled: onlyEnabled}, withCredentials: true, credentials: 'same-origin' })

//B2B 품목 조회(품목 번호)
export const getB2bItemByNo = (itemNo) => axios(Server.getRestAPIHost() + '/admin/b2bItem/itemNo', { method: "get", params: {itemNo: itemNo}, withCredentials: true, credentials: 'same-origin' })

//B2B 품목 등록 & 수정
export const addB2bItem = (item) => axios(Server.getRestAPIHost() + '/admin/b2bItem', { method: "post", data: item, withCredentials: true, credentials: 'same-origin' })

//itemKind(품종)코드 발췌.
export const getNewB2bItemKindCode = (itemNo, enabled) => axios(Server.getRestAPIHost() + '/admin/b2bItemKindCode', { method: "put", withCredentials: true, credentials: 'same-origin' })


//품목 활성 or 비활성
export const updateB2bItemEnabled = (itemNo, enabled) => axios(Server.getRestAPIHost() + '/admin/b2bItem', { method: "put", params:{itemNo: itemNo, enabled: enabled}, withCredentials: true, credentials: 'same-origin' })

// 생산자별 매출 정산 상태를 db 에 기록
export const setSellerPayoutStatus = (dealSeqList, payoutStatus, totalPayout) =>
    axios(Server.getRestAPIHost() + '/admin/dealDetail/sellerPayoutStatus', {
        method: "patch",
        data: dealSeqList,
        params: {payoutStatus: payoutStatus, totalPayout: totalPayout},
        withCredentials: true, credentials: 'same-origin'
    })

// 업체별 정산 체크정보 저장
export const savePaymentCheck = (data) => axios(Server.getRestAPIHost() + '/admin/savePaymentCheck', {method: "post", data: data, withCredentials: true, credentials: 'same-origin' })

// 생산자별 매출 정산 자료 조회
export const getAllSellerPayoutList = (year, month) => axios(Server.getRestAPIHost() + '/admin/allSellerPayoutList', { method: "get", params: {year: year, month: month}, withCredentials: true, credentials: 'same-origin' })

// 모든 주문번호 가져오기
export const getAllDealDetailList = () => axios(Server.getRestAPIHost() + '/allDealDetailList', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 모든 상품정보 가져오기
export const getAllFoods = () => axios(Server.getRestAPIHost() + '/allFoods', {method: "get", withCredentials: true, credentials: 'same-origin'})

// 소비자 모든 회원 번호와 정보(이름, email, account) 가져오기  => 각 소비자별 토큰개수와 eth balance 조회용
export const getAllBuyers = () => axios(Server.getRestAPIHost() + '/allBuyers', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 모든 회원 번호와 정보(이름, email, account) 가져오기  => 각 생산자별 토큰개수와 eth balance 조회용
export const getAllSellers = () => axios(Server.getRestAPIHost() + '/allSellers', { method: "get", withCredentials: true, credentials: 'same-origin' })

//// b2c 홈 화면 구성
export const getHomeSetting = () => axios(Server.getRestAPIHost() + '/admin/b2cHome', { method: "get", withCredentials: true, credentials: 'same-origin' })// 홈세팅 조회

// 기획전 상품 번호 저장
export const setHomeSetting = (settingNoList) => axios(Server.getRestAPIHost() + '/admin/b2cHome', { method: "post", data: settingNoList, withCredentials: true, credentials: 'same-origin' })// 기획 상품 조회
export const getExGoodsNoList = () => axios(Server.getRestAPIHost() + '/admin/b2cHome/exGoodsNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 배너 조회
export const getBannerList = (isLocalfoodBanner) =>
    axios(Server.getRestAPIHost() + '/admin/b2cHome/banner', {
        method: "get",
        params: {isLocalfoodBanner},
        withCredentials: true,
        credentials: 'same-origin',
        validateStatus: (status) => {
            // status : 400, 404, 500 등의 에러코드
            // true resolve 됨
            // false reject 됨, 하지만 reject 이후 catch() 로 떨어지지 않아 다음 스크립트가 수행되지 않음.
            return true; // 무조건 resolve 시켜 result.status === 200 으로 (성공) 판단
        }
    })

//타입에 따른 이벤트 번호조회(type : blyTime, potenTime)
export const getEventNoByType = (type) => axios(Server.getRestAPIHost() + '/admin/b2cHome/eventNo/type', { method: "get", params: {type}, withCredentials: true, credentials: 'same-origin' })

//// 이벤트 정보
// 이벤트 정보 목록
export const getEventInfoList = ({year}) => axios(Server.getRestAPIHost() + '/admin/eventInfoList', { method: "get", params: {year:year}, withCredentials: true, credentials: 'same-origin' })
// 이벤트 정보 조회
export const getEventInfo = (eventNo) => axios(Server.getRestAPIHost() + '/admin/eventInfo', { method: "get", params:{eventNo: eventNo}, withCredentials: true, credentials: 'same-origin' })
// 이벤트 저장
export const setEventInfoSave = (event) => axios(Server.getRestAPIHost() + '/admin/eventInfo', { method: "post", data: event, withCredentials: true, credentials: 'same-origin' })
// 이벤트 삭제
export const delEventInfo = (eventNo) => axios(Server.getRestAPIHost() + '/admin/eventInfo', { method: "delete", params:{eventNo: eventNo}, withCredentials: true, credentials: 'same-origin' })

//// b2c 기획전 관리
// 기획전 조회
export const getMdPickList = ({year}) => axios(Server.getRestAPIHost() + '/admin/b2cMdPickList', { method: "get", params: {year:year}, withCredentials: true, credentials: 'same-origin' })
// 기획전 정보 조회
export const getMdPick = (mdPickId) => axiosCache.get(Server.getRestAPIHost() + '/admin/b2cMdPick', { params:{mdPickId: mdPickId}, withCredentials: true, credentials: 'same-origin' })
// 기획전 삭제
export const delMdPick = (mdPickId) => axios(Server.getRestAPIHost() + '/admin/b2cMdPickDel', { method: "delete", params:{mdPickId: mdPickId}, withCredentials: true, credentials: 'same-origin' })
// 기획전 홈화면에숨김
export const hideMdPick = (mdPickId, hideFromHome) => axios(Server.getRestAPIHost() + '/admin/b2cMdPickHide', { method: "post", params:{mdPickId: mdPickId, hideFromHome:hideFromHome}, withCredentials: true, credentials: 'same-origin' })
// 기획전 저장
export const setMdPickSave = (mdPick) => axios(Server.getRestAPIHost() + '/admin/b2cMdPickSave', { method: "post", data: mdPick, withCredentials: true, credentials: 'same-origin' })

// ////b2c 블리타임
// // 블리타임 조회 (All)
// export const getBlyTimeAdminList = ({year}) => axios(Server.getRestAPIHost() + '/admin/b2cBlyTimeAdminList', { method: "get", params: {year:year}, withCredentials: true, credentials: 'same-origin' })
// // 블리타임 삭제
// export const delBlyTime = (goodsNo) => axios(Server.getRestAPIHost() + '/admin/b2cBlyTimeDel', { method: "delete", params:{goodsNo: goodsNo}, withCredentials: true, credentials: 'same-origin' })
// // 블리타임 등록
// export const setBlyTimeRegist = (timeSale) => axios(Server.getRestAPIHost() + '/admin/b2cBlyTimeRegist', { method: "post", data: timeSale, withCredentials: true, credentials: 'same-origin' })
// // 블리타임 수정
// export const setBlyTimeUpdate = (timeSale) => axios(Server.getRestAPIHost() + '/admin/b2cBlyTimeUpdate', { method: "post", data: timeSale, withCredentials: true, credentials: 'same-origin' })

////b2c 포텐타임
// 포텐타임 조회 (All)
export const getTimeSaleAdminList = ({year}) => axios(Server.getRestAPIHost() + '/admin/b2cTimeSaleAdminList', { method: "get", params: {year:year}, withCredentials: true, credentials: 'same-origin' })
// 포텐타임 상품 조회 (단건) - 블리타임과수퍼리워드하고 동일하게 controller 호출함.
export const getTimeSaleAdmin = (goodsNo) => axios(Server.getRestAPIHost() + '/admin/b2cTimeSaleAdmin', { method: "get", params:{goodsNo: goodsNo}, withCredentials: true, credentials: 'same-origin' })
// 포텐타임 삭제
export const delTimeSale = (goodsNo) => axios(Server.getRestAPIHost() + '/admin/b2cTimeSaleDel', { method: "delete", params:{goodsNo: goodsNo}, withCredentials: true, credentials: 'same-origin' })
// 포텐타임 등록
export const setTimeSaleRegist = (timeSale) => axios(Server.getRestAPIHost() + '/admin/b2cTimeSaleRegist', { method: "post", data: timeSale, withCredentials: true, credentials: 'same-origin' })
// 포텐타임 수정
export const setTimeSaleUpdate = (timeSale) => axios(Server.getRestAPIHost() + '/admin/b2cTimeSaleUpdate', { method: "post", data: timeSale, withCredentials: true, credentials: 'same-origin' })

////b2c 수퍼타임
// 수퍼리워드 조회 (All)
export const getSuperRewardAdminList = ({year}) => axios(Server.getRestAPIHost() + '/admin/b2cSuperRewardAdminList', { method: "get", params: {year:year}, withCredentials: true, credentials: 'same-origin' })
// 수퍼리워드 삭제
export const delSuperReward = (goodsNo) => axios(Server.getRestAPIHost() + '/admin/b2cSuperRewardDel', { method: "delete", params:{goodsNo: goodsNo}, withCredentials: true, credentials: 'same-origin' })
// 수퍼리워드 등록
export const setSuperRewardRegist = (superReward) => axios(Server.getRestAPIHost() + '/admin/b2cSuperRewardRegist', { method: "post", data: superReward, withCredentials: true, credentials: 'same-origin' })
// 수퍼리워드 수정
export const setSuperRewardUpdate = (superReward) => axios(Server.getRestAPIHost() + '/admin/b2cSuperRewardUpdate', { method: "post", data: superReward, withCredentials: true, credentials: 'same-origin' })

////allowanceIP 관리
// allowanceIP 저장
export const saveAllowanceIP = (data) => axios(Server.getRestAPIHost() + '/admin/allowanceIP', { method: "post", data:data, withCredentials: true, credentials: 'same-origin' })
// allowanceIP 제거
export const removeAllowanceIP = (seq) => axios(Server.getRestAPIHost() + '/admin/allowanceIP', { method: "delete", params:{seq}, withCredentials: true, credentials: 'same-origin' })
// allowanceIP List 조회
export const getAllowanceIPList = () => axios(Server.getRestAPIHost() + '/admin/allowanceIPList' , { method:"get", withCredentials: true, credentials: 'same-origin' })

//// admin 계정 관리
// admin 계정 등록
export const addAdmin = (adminData) => axios(Server.getRestAPIHost() + '/admin/addAdmin', { method: "post", data:adminData, withCredentials: true, credentials: 'same-origin' })
// admin List 조회
export const getAdminList = () => axios(Server.getRestAPIHost() + '/admin/getAdminList' , { method:"get", withCredentials: true, credentials: 'same-origin' })
export const getAdmin = (email) => axios(Server.getRestAPIHost() + '/admin/getAdmin' , { method:"get", params: {email: email}, withCredentials: true, credentials: 'same-origin' })

// 소비자 탈퇴 처리
export const setConsumerStop = (data) => axios(Server.getRestAPIHost() + '/admin/setConsumerStop', { method:"put", data: data, withCredentials: true, credentials: 'same-origin' })

// DonAirdrops DON 에어드랍
export const getDonAirdrops = () => axios(Server.getRestAPIHost() + '/getDonAirdrops', { method: "get",  withCredentials: true, credentials: 'same-origin' })
export const getSwapManagerDonBalance = () => axios(Server.getRestAPIHost() + '/admin/managerDonBalance', { method: "get", withCredentials: true, credentials: 'same-origin' })
export const donTransferAdminOk = (consumerNo) => axios(Server.getRestAPIHost() + '/admin/clickDonTransferAdminOk', { method: "post", params:{consumerNo:consumerNo}, withCredentials: true, credentials: 'same-origin' })
export const ircDonTransferAdminOk = (consumerNo) => axios(Server.getRestAPIHost() + '/admin/clickIrcDonTransferAdminOk', { method: "post", params:{consumerNo:consumerNo}, withCredentials: true, credentials: 'same-origin' })

// DON Manager Balance, Igas
export const getBalanceOfManagerDon = () => axios(Server.getRestAPIHost() + '/admin/getBalanceOfManagerDon', { method: "get", withCredentials: true, credentials: 'same-origin' })
export const getManagerIGas = () => axios(Server.getRestAPIHost() + '/admin/getManagerIGas', { method: "get", withCredentials: true, credentials: 'same-origin' })

export const getAllBlctToWonCachedLog = ({startDate,endDate}) => axios(Server.getRestAPIHost() + '/admin/blctToWonCachedLog', { method: "get", params: {startDate: startDate, endDate: endDate}, withCredentials: true, credentials: 'same-origin' })

// blct 통계페이지 조회용
export const getBlctStats = (startDate, endDate) => axios(Server.getRestAPIHost() + '/admin/getBlctStats', { method: "get", params: {startDate: startDate, endDate: endDate}, withCredentials: true, credentials: 'same-origin' })
// 미사용
export const getMonthlyBlctStats = (startDate, endDate) => axios(Server.getRestAPIHost() + '/admin/getMonthlyBlctStats', { method: "get", withCredentials: true, credentials: 'same-origin' })

// blct 정산시 tempProducerBlctManage 조회용
export const getAllTempProducerBlctGigan = (startDate, endDate) => axios(Server.getRestAPIHost() + '/admin/getAllTempProducerBlctGigan', { method: "get", params: {startDate: startDate, endDate: endDate}, withCredentials: true, credentials: 'same-origin' })

// blct 정산시 tempProducerBlctManage 조회용
export const getAllTempProducerBlctMonth = (year, month) => axios(Server.getRestAPIHost() + '/admin/getAllTempProducerBlctMonth', { method: "get", params:{year: year, month: month}, withCredentials: true, credentials: 'same-origin' })

// blct 정산시 서포터즈 지급 BLCT 합계
export const getAllSupportersBlct = () => axios(Server.getRestAPIHost() + '/admin/getAllSupportersBlct' , { method:"get", withCredentials: true, credentials: 'same-origin' })

// blct 정산시 블리타임 리워드 BLCT 합계
export const getAllBlyTimeRewardBlct = () => axios(Server.getRestAPIHost() + '/admin/getAllBlyTimeRewardBlct' , { method:"get", withCredentials: true, credentials: 'same-origin' })

// blct 정산시 이벤트적립금 BLCT 합계
export const getAllEventRewardBlct = () => axios(Server.getRestAPIHost() + '/admin/getAllEventRewardBlct' , { method:"get", withCredentials: true, credentials: 'same-origin' })

// blct 정산시 쿠폰지급 BLCT 합계
export const getAllCouponBlct = () => axios(Server.getRestAPIHost() + '/admin/getAllCouponBlct' , { method:"get", withCredentials: true, credentials: 'same-origin' })

// 입점관리 정보 조회
export const getProducerRegRequests = () => axios(Server.getRestAPIHost() + '/getProducerRegRequests', { method: "get", withCredentials: true, credentials: 'same-origin' })

//소비자 다날 본인인증 내역 한건
export const getConsumerDanalVerifyAuth = (consumerNo) => axios(Server.getRestAPIHost() + '/admin/consumerDanalVerifyAuth', { method: "get", params: {consumerNo: consumerNo}, withCredentials: true, credentials: 'same-origin' })

//소비자 본인인증 내역 한건
export const getConsumerVerifyAuth = (consumerNo) => axios(Server.getRestAPIHost() + '/admin/consumerVerifyAuth', { method: "get", params: {consumerNo: consumerNo}, withCredentials: true, credentials: 'same-origin' })

//소비자 KYC 인증 내역 조회
export const getConsumerKycList = ({kycAuth, consumerNo, year}) => axios(Server.getRestAPIHost() + '/admin/consumerKycList', { method: "get", params: {kycAuth: kycAuth, consumerNo: consumerNo, year:year}, withCredentials: true, credentials: 'same-origin' })

//소비자 KYC 인증 내역 한건
export const getConsumerKyc = (consumerNo) => axios(Server.getRestAPIHost() + '/admin/consumerKyc', { method: "get", params: {consumerNo: consumerNo}, withCredentials: true, credentials: 'same-origin' })

//소비자 KYC 인증 처리
export const setConsumerKycAuth = ({consumerNo, kycAuth, kycReason}) => axios(Server.getRestAPIHost() + '/admin/consumerKycAuth', { method: "post", params: {consumerNo: consumerNo, kycAuth: kycAuth, kycReason: kycReason}, withCredentials: true, credentials: 'same-origin' })

// 모든 소비자 토큰총합 조회
export const getAllConsumerToken = () => axios(Server.getRestAPIHost() + '/admin/getAllConsumerToken', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 모든 생산자 토큰총합 조회
export const getAllProducerToken = () => axios(Server.getRestAPIHost() + '/admin/getAllProducerToken', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 예약상품 중 blct결제한 리스트
export const getReservedOrderByBlctPaid = () => axios(Server.getRestAPIHost() + '/admin/getReservedOrderByBlctPaid', { method: "get", withCredentials: true, credentials: 'same-origin' })
// 상품상세 공지 배너 등록
export const setGoodsBannerSave = (goodsBannerList) => axios(Server.getRestAPIHost() + '/admin/goodsBannerSave', { method: "post", data: goodsBannerList, withCredentials: true, credentials: 'same-origin' })
// 상품상세 공지 리스트 조회
export const getGoodsBannerList = () => axios(Server.getRestAPIHost() + '/admin/goodsBannerList', { method: "get", withCredentials: true, credentials: 'same-origin' })
// 상품상세 공지 정보 조회
export const getGoodsBanner = (goodsBannerId) => axios(Server.getRestAPIHost() + '/admin/goodsBanner', { method: "get", params:{goodsBannerId: goodsBannerId}, withCredentials: true, credentials: 'same-origin' })
//
export const delGoodsBanner = (goodsBannerId) => axios(Server.getRestAPIHost() + '/admin/goodsBannerDel', { method: "delete", params:{goodsBannerId: goodsBannerId}, withCredentials: true, credentials: 'same-origin' })

// 상품번호로 포텐타임쿠폰 지급상품인지 여부 조회
export const getPotenCouponMaster = (goodsNo) => axios(Server.getRestAPIHost() + '/admin/potenCouponMaster', { method: "get", params: {goodsNo: goodsNo}, withCredentials: true, credentials: 'same-origin' })
// 쿠폰 발급 내역 목록
export const getCouponMasterList = ({startDate, endDate, needTotalWon}) => axios(Server.getRestAPIHost() + '/admin/couponMasterList', { method: "get", params: {startDate:startDate, endDate:endDate, needTotalWon:needTotalWon}, withCredentials: true, credentials: 'same-origin' })
// 쿠폰 발급 내역 정보 (단건)
export const getCouponMaster = ({masterNo}) => axios(Server.getRestAPIHost() + '/admin/couponMaster', { method: "get", params: {masterNo: masterNo}, withCredentials: true, credentials: 'same-origin' })
// 쿠폰 발급 내역 정보 (단건, 사용금액 포함)
export const getCouponMasterWithUsedWon = ({masterNo}) => axios(Server.getRestAPIHost() + '/admin/getCouponMasterWithUsedWon', { method: "get", params: {masterNo: masterNo}, withCredentials: true, credentials: 'same-origin' })
// 쿠폰 발급 내역 등록 및 수정
export const saveCouponMaster = (data) => axios(Server.getRestAPIHost() + '/admin/couponMaster', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })
// 쿠폰 발급 내역 등록 및 수정(쿠폰명수정)
export const updateCouponMasterTitle = (data) => axios(Server.getRestAPIHost() + '/admin/couponMasterTltle', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })
// 구매보상 발급대상 상품목록 수정
export const updateRewardCouponGoods = (data) => axios(Server.getRestAPIHost() + '/admin/rewardCouponGoods', { method: "post", data: data, withCredentials:true, credentials: 'same-origin'})
// 쿠폰 발급 내역 삭제
export const deleteCouponMaster = ({masterNo}) => axios(Server.getRestAPIHost() + '/admin/couponMaster', { method: "delete", params: {masterNo: masterNo}, withCredentials: true, credentials: 'same-origin' })
// 쿠폰 발급 내역 종료(삭제플래그처리)
export const endedCouponMaster = ({masterNo}) => axios(Server.getRestAPIHost() + '/admin/couponMasterEnded', { method: "delete", params: {masterNo: masterNo}, withCredentials: true, credentials: 'same-origin' })
// 스페셜 쿠폰 발급
export const addSpecialCouponConsumer = (masterNo,consumerNo) => axios(Server.getRestAPIHost() + '/admin/specialCoupon', {method: "post", params:{masterNo:masterNo,consumerNo: consumerNo}, withCredentials: true, credentials: 'same-origin' })
// 여러 소비자에게 스페셜쿠폰 발급
export const addSpecialCouponMultiConsumer = (masterNo,consumerNoList) => axios(Server.getRestAPIHost() + '/admin/specialCouponMulti', {method: "post", params:{masterNo:masterNo,c: consumerNoList}, withCredentials: true, credentials: 'same-origin' })

// 모든 회원에 스페셜 쿠폰 발급
export const addSpecialCouponAllConsumer = (masterNo) => axios(Server.getRestAPIHost() + '/admin/specialCouponAll', {method: "post", params:{masterNo:masterNo}, withCredentials: true, credentials: 'same-origin'})

// 소비자 쿠폰발급내역
export const getConsumerCouponList = ({startDate, endDate, searchMasterNo, searchUsed, searchDate}) => axios(Server.getRestAPIHost() + '/admin/getConsumerCouponList', { method: "get", params: {startDate:startDate, endDate:endDate, searchMasterNo:searchMasterNo, searchUsed:searchUsed, searchDate:searchDate}, withCredentials: true, credentials: 'same-origin' })

// 특정소비자 쿠폰발급내역
export const getConsumerAllCoupon = (consumerNo) => axios(Server.getRestAPIHost() + '/admin/getConsumerAllCoupon', { method: "get", params: {consumerNo}, withCredentials: true, credentials: 'same-origin' })

// 특정소비자 쿠폰발급내역 (주문내역포함)
export const getConsumerAllCouponWithOrderInfo = (consumerNo) => axios(Server.getRestAPIHost() + '/admin/getConsumerAllCouponWithOrderInfo', { method: "get", params: {consumerNo}, withCredentials: true, credentials: 'same-origin' })

// 홈 공지 배너 등록
export const setHomeBannerSave = (homeBanner) => axios(Server.getRestAPIHost() + '/admin/homeBannerSave', { method: "post", data: homeBanner, withCredentials: true, credentials: 'same-origin'})
// 홈 공지 배너 리스트 조회
export const getHomeBannerList = () => axios(Server.getRestAPIHost() + '/admin/homeBannerList', { method: "get", withCredentials: true, credentials: 'same-origin' })
// 홈 공지 배너 정보 조회
export const getHomeBanner = (homeBannerId) => axios(Server.getRestAPIHost() + '/admin/homeBanner', { method: "get", params:{homeBannerId}, withCredentials: true, credentials: 'same-origin' })

export const delHomeBanner = (homeBannerId) => axios(Server.getRestAPIHost() + '/admin/homeBannerDel', { method: "delete", params:{homeBannerId: homeBannerId}, withCredentials: true, credentials: 'same-origin' })

export const getAllTempProducer = (year, month) => axios(Server.getRestAPIHost() + "/admin/getAllTempProducer", { method: "get", params:{year: year, month:month}, withCredentials: true, credentials: 'same-origin' })

//고팍스 가입 이벤트 목록
export const getGoPaxJoinEvent = () => axios(Server.getRestAPIHost() + "/admin/getGoPaxJoinEvent", { method: "get", withCredentials: true, credentials: 'same-origin' })

//고팍스 카드 이벤트 목록
export const getGoPaxCardEvent = () => axios(Server.getRestAPIHost() + "/admin/getGoPaxCardEvent", { method: "get", withCredentials: true, credentials: 'same-origin' })

// 친구초대 관련 이벤트 리스트
export const getInviteFriendCountList = () => axios(Server.getRestAPIHost() + "/admin/getInviteFriendCountList", { method: "get", withCredentials: true, credentials: 'same-origin' })
export const getInviteFriendList = ({startDate, endDate}) => axios(Server.getRestAPIHost() + "/admin/getInviteFriendList", { method: "get", params: {startDate:startDate, endDate:endDate}, withCredentials: true, credentials: 'same-origin' })
export const getInviteFriendGoodsList = ({startDate, endDate}) => axios(Server.getRestAPIHost() + "/admin/getInviteFriendGoodsList", { method: "get", params: {startDate:startDate, endDate:endDate}, withCredentials: true, credentials: 'same-origin' })
export const runInviteFriendCountBatch = () => axios(Server.getRestAPIHost() + "/admin/runInviteFriendCountBatch", { method: "post", withCredentials: true, credentials: 'same-origin' })


export const getAbusers = () => axios(Server.getRestAPIHost() + '/admin/abusers', { method: "get", params: {}, withCredentials: true, credentials: 'same-origin' })

export const getAbuserByConsumerNo = (consumerNo) => axios(Server.getRestAPIHost() + '/admin/abuser', { method: "get", params: {consumerNo}, withCredentials: true, credentials: 'same-origin' })

export const addAbuser = (abuser) => axios(Server.getRestAPIHost() + '/admin/abuser', { method: "post", data: abuser, withCredentials: true, credentials: 'same-origin' })

// 판매자 blct 정산 리스트
export const getAllProducerWithdrawBlct = () => axios(Server.getRestAPIHost() + '/admin/getAllProducerWithdrawBlct' , { method:"get", withCredentials: true, credentials: 'same-origin' })

//소비자 토큰 히스토리 전체 내역
export const getConsumerTokenHistory = (consumerNo) => axios(Server.getRestAPIHost() + '/admin/consumerTokenHistory', { method: "post", data: {consumerNo}, withCredentials: true, credentials: 'same-origin' })

// 소비자의 출금신청 처리(승인상태 변경 및 출금요청)  ==> 소비자자산 통제불가로 사용 안해야 함.
// export const requestAdminOkStatus = ({swapBlctToBlyNo, adminOkStatus, userMessage, adminMemo}) => axios(Server.getRestAPIHost() + '/admin/requestAdminOkStatus', { method: "post", data: {swapBlctToBlyNo, adminOkStatus, userMessage, adminMemo}, withCredentials: true, credentials: 'same-origin'})

// 소비자의 출금신청 배치처리로 등록
// export const requestAdminOkStatusBatch = (swapBlctToBlyNo) => axios(Server.getRestAPIHost() + '/admin/requestAdminOkStatusBatch', { method: "post", data: {}, params: {swapBlctToBlyNo}, withCredentials: true, credentials: 'same-origin'})


// 소비자의 출금신청 처리(승인상태 변경 및 출금요청)
export const updateSwapBlctToBlyMemo = ({swapBlctToBlyNo, userMessage, adminMemo}) => axios(Server.getRestAPIHost() + '/admin/swapBlctToBlyMemo', { method: "post", data: {swapBlctToBlyNo, userMessage, adminMemo}, withCredentials: true, credentials: 'same-origin'})

//소비자 번호로 소비자정보 조회
export const getConsumerByConsumerNo = (consumerNo) => axios(Server.getRestAPIHost() + '/admin/consumerNo', { method: "get", params: {consumerNo: consumerNo}, withCredentials: true, credentials: 'same-origin' })

// 카카오 폰번호 소비자찾기
export const getKakaoPhoneConsumer = (phone) => axios(Server.getRestAPIHost() + '/admin/kakaoPhoneConsumer', { method: "get",  params: {phone: phone}, withCredentials: true, credentials: 'same-origin' })

//소비자 주문내역 조회
export const getOrderDetailCountByConsumerNo = (consumerNo) => axios(Server.getRestAPIHost() + '/admin/orderDetailCount/consumerNo', { method: "get",  params: {consumerNo: consumerNo}, withCredentials: true, credentials: 'same-origin' })
export const getOrderDetailByConsumerNo = (consumerNo) => axios(Server.getRestAPIHost() + '/admin/orderDetail/consumerNo', { method: "get",  params: {consumerNo: consumerNo}, withCredentials: true, credentials: 'same-origin' })
export const getOrderDetailByConsumerNoForYearMonths = (consumerNo,year) => axios(Server.getRestAPIHost() + '/admin/consumerOrder/yearMonths', { method: "get",  params: {consumerNo: consumerNo, year:year}, withCredentials: true, credentials: 'same-origin' })
export const getOrderDetailByConsumerNoForYearMonth = (consumerNo,year,month) => axios(Server.getRestAPIHost() + '/admin/consumerOrder/yearMonth', { method: "get",  params: {consumerNo: consumerNo, year:year, month:month}, withCredentials: true, credentials: 'same-origin' })


//상품 삭제(판매중단인 상품만 플래그 변경)
export const updateGoodsDeleteFlag = ({goodsNo, deleted}) => axios(Server.getRestAPIHost() + '/admin/goods/delete', { method: "post", params: {goodsNo, deleted}, withCredentials: true, credentials: 'same-origin' })
// 소비자 출금계좌 확인
export const checkExtOwnAccount = (consumerNo, extAccount) => axios(Server.getRestAPIHost() + '/admin/checkExtOwnAccount', {method: "post", params:{consumerNo:consumerNo,extAccount: extAccount}, withCredentials: true, credentials: 'same-origin' })
// 생산자 주문취소요청건 승인
export const confirmProducerCancel = (orderSeq,dpCancelReason) => axios(Server.getRestAPIHost() + '/admin/confirmProducerCancel', { method: "post", params: {orderSeq,dpCancelReason}, withCredentials: true, credentials: 'same-origin' })
// 생산자 주문취소요청건 철회
export const confirmProducerCancelBack = (orderSeq) => axios(Server.getRestAPIHost() + '/admin/confirmProducerCancelBack', { method: "post", params: {orderSeq}, withCredentials: true, credentials: 'same-origin' })

// 생산자 주문취소신청 조회
export const getAllProducerCancelList = () => axios(Server.getRestAPIHost() + '/admin/getAllProducerCancelList', {method: "get", withCredentials: true, credentials: 'same-origin'})

// 소비자 정보 업데이트
export const updateConsumer = (consumer) => axios(Server.getRestAPIHost() + '/admin/updateConsumer', { method: "put", data: consumer, withCredentials: true, credentials: 'same-origin' })

// 우수리뷰 선정. (현재는 원화상당 bly지급까지 동시에 처리중. 추후 지급배치 분리 가능)
export const pickBestReview = (orderSeq, won) => axios(Server.getRestAPIHost() + '/admin/pickBestReview', { method: "post", params: {orderSeq: orderSeq, won: won}, withCredentials: true, credentials: 'same-origin' })

// 상품 리뷰 블라인딩
export const goodsReviewBlinding = ({orderSeq}) => axios(Server.getRestAPIHost() + '/admin/goodsReviewBlinding', { method: "post", params: {orderSeq:orderSeq}, withCredentials: true, credentials: 'same-origin' })

// 상품 리뷰 블라인딩
export const goodsReviewNotBlinding = ({orderSeq}) => axios(Server.getRestAPIHost() + '/admin/goodsReviewNotBlinding', { method: "post", params: {orderSeq:orderSeq}, withCredentials: true, credentials: 'same-origin' })

// 투표 등록
export const addBoardVote = (boardVote) => axios(Server.getRestAPIHost() + '/admin/boardVote', { method: "post", params: {}, data: boardVote, withCredentials: true, credentials: 'same-origin' })

// 투표 수정
export const updateBoardVote = (boardVote) => axios(Server.getRestAPIHost() + '/admin/boardVote', { method: "put", params: {}, data: boardVote, withCredentials: true, credentials: 'same-origin' })

// 투표 리스트
export const getBoardVoteList = () => axios(Server.getRestAPIHost() + '/admin/boardVoteList', {method: "get", withCredentials: true, credentials: 'same-origin'})

// 투표 한건 조회
export const getBoardVote = (writingId) => axios(Server.getRestAPIHost() + '/admin/boardVote', {method: "get", params: {writingId}, withCredentials: true, credentials: 'same-origin'})

// 투표 한건 삭제
export const deleteBoardVote = (writingId) => axios(Server.getRestAPIHost() + '/admin/boardVote', {method: "delete", params: {writingId}, withCredentials: true, credentials: 'same-origin'})

// 해시태그 전체 조회
export const getAllHashTagList = () => axios(Server.getRestAPIHost() + '/admin/hashTag/all', {method: "get", params: {}, withCredentials: true, credentials: 'same-origin'})

// 해시태그 상태값 업데이트
export const updateHashTagStatus = (tag, status) => axios(Server.getRestAPIHost() + '/admin/hashTag/status', { method: "put", params: {tag, status}, data: {}, withCredentials: true, credentials: 'same-origin' })

//hashTagGroupManager화면: 상품별 tagPriority저장
export const saveTagPriorty = (goodsNo, tagPriority) => axios(Server.getRestAPIHost() + '/admin/hashTag/tagPriority', { method: "post", params: {goodsNo, tagPriority}, data: {}, withCredentials: true, credentials: 'same-origin' })


// 해시태그 삭제
export const deleteHashTag = (tag) => axios(Server.getRestAPIHost() + '/admin/hashTag', {method: "delete", params: {tag}, withCredentials: true, credentials: 'same-origin'})

// 해시태그 등록
export const addHashTag = (tag, status) => axios(Server.getRestAPIHost() + '/admin/hashTag', {method: "post", params: {tag,  status}, withCredentials: true, credentials: 'same-origin'})

// 로컬푸드 농가 리스트 조회
export const getLocalfoodProducerList = () => axios(Server.getRestAPIHost() + '/admin/localfoodProducer', {method: "get", withCredentials: true, credentials: 'same-origin' })

// 해시태그 그룹 전체 조회
export const getAllHashTagGroupList = () => axios(Server.getRestAPIHost() + '/admin/hashTagGroup/all', {method: "get", params: {}, withCredentials: true, credentials: 'same-origin'})

// 해시태그 그룹 한건 조회
export const getHashTagGroup = (groupNo) => axios(Server.getRestAPIHost() + '/admin/hashTagGroup', {method: "get", params: {groupNo}, withCredentials: true, credentials: 'same-origin'})

// 해시태그 그룹 등록
export const addHashTagGroup = (hashTagGroup) => axios(Server.getRestAPIHost() + '/admin/hashTagGroup', {method: "post", data: hashTagGroup, withCredentials: true, credentials: 'same-origin'})

// 해시태그 그룹 삭제
export const deleteHashTagGroup = (groupNo) => axios(Server.getRestAPIHost() + '/admin/hashTagGroup', {method: "delete", params: {groupNo}, withCredentials: true, credentials: 'same-origin'})

// 상품 해시태그 변경
export const updateGoodsTags = (goods) => axios(Server.getRestAPIHost() + '/admin/goodsTags', {method: "put", data: goods, withCredentials: true, credentials: 'same-origin'})

// 상품 해시태그 및 ARFile 변경
export const updateGoodsTagsArFile = (goods) => axios(Server.getRestAPIHost() + '/admin/goodsTagsArFile', {method: "put", data: goods, withCredentials: true, credentials: 'same-origin'})

// 상품 인증마크 변경
export const updateGoodsAuthMark = (goods) => axios(Server.getRestAPIHost() + '/admin/goodsAuthMark', {method: "put", data: goods, withCredentials: true, credentials: 'same-origin'})

// 상품 Fake DealCount, ProfileList
export const updateGoodsFakeDeal = (goods) => axios(Server.getRestAPIHost() + '/admin/goodsFakeDeal', {method: "put", data: goods, withCredentials: true, credentials: 'same-origin'})

//생산자 해시캐그 변경
export const updateProducerTags = (producer) => axios(Server.getRestAPIHost() + '/admin/producerTags', {method: "put", data: producer, withCredentials: true, credentials: 'same-origin'})

// 해시태그 테마 등록,수정
//export const addThemeHashTag = (themeHashTag) => axios(Server.getRestAPIHost() + '/admin/addThemeHashTag', {method: "post", data: themeHashTag, withCredentials: true, credentials: 'same-origin'})

// 포인트 리스트
export const pointList = ({startDate,endDate}) => axios(Server.getRestAPIHost() + '/admin/pointList', { method: "get", params:{startDate:startDate,endDate:endDate}, withCredentials: true, credentials: 'same-origin' })
// 특정 소비자의 포인트내역조회
export const consumerPointList = (consumerNo) => axios(Server.getRestAPIHost() + '/admin/consumerPointList', { method: "get", params:{consumerNo:consumerNo}, withCredentials: true, credentials: 'same-origin' })

// 룰렛 관리 리스트
export const rouletteManageList = ({yearMonth}) => axios(Server.getRestAPIHost() + '/admin/rouletteManageList', { method: "get", params: {yearMonth:yearMonth}, withCredentials: true, credentials: 'same-origin' })
export const rouletteGaeGeunList = (yyyymm,rCnt) => axios(Server.getRestAPIHost() + '/admin/rouletteGaeGeunList', { method: "get", params:{yyyymm:yyyymm,rCnt:rCnt}, withCredentials: true, credentials: 'same-origin' })
export const rouletteManage = (id) => axios(Server.getRestAPIHost() + '/admin/rouletteManage', { method: "get", params:{id:id}, withCredentials: true, credentials: 'same-origin' })
export const saveRouletteManage = (data) => axios(Server.getRestAPIHost() + '/admin/rouletteManage', { method: "post", data:data, withCredentials: true, credentials: 'same-origin' })
export const delRouletteManage = (id) => axios(Server.getRestAPIHost() + '/admin/rouletteManage', { method: "delete",  params:{id:id}, withCredentials: true, credentials: 'same-origin' })

// 수동 포인트 지급
export const addSpecialPoint = (data) => axios(Server.getRestAPIHost() + '/admin/addSpecialPoint', { method: "post", data:data, withCredentials: true, credentials: 'same-origin' })

//생산자의 모든 상품 조회 (판매중단이 아닌 모든것)
export const getAllProducerGoods = (producerNo) => axios(Server.getRestAPIHost() + '/admin/allProducerGoods', { method: "get", params:{producerNo:producerNo}, withCredentials: true, credentials: 'same-origin' })

//생산자 입점신청 리스트 조회
export const getProducerTempList = ({joinStatus}) => axios(Server.getRestAPIHost() + '/admin/producerTempList', { method: "get", params:{joinStatus}, withCredentials: true, credentials: 'same-origin' })

//생산자 입점신청 진행상태 업데이트
export const updateProducerTempStatus = (producerTemp) => axios(Server.getRestAPIHost() + '/admin/producerTempStatus', { method: "put", data: producerTemp, withCredentials: true, credentials: 'same-origin'})

//관리자 입점 메모 작성
export const updateProducerTempAdminMemo = (producerTemp) => axios(Server.getRestAPIHost() + '/admin/producerTempAdminMemo', { method: "put", data: producerTemp, withCredentials: true, credentials: 'same-origin'})

//원래주문 + 전표주문내역 조회 (전표연관포함내역)
export const findCsOrderList = (orderSeq) => axios(Server.getRestAPIHost() + '/admin/findCsOrderList', { method: "get", params:{orderSeq}, withCredentials: true, credentials: 'same-origin' })

export default {
// 소비자 모든 회원 번호와 정보(이름, email, account) 가져오기  => 각 소비자별 토큰개수와 eth balance 조회용
    getAllConsumers,

// 소비자 검색 (탈퇴자제외)
    getConsumerList, getConsumerCommaList,

//친구추천 카운트 조회
//     getInviteFriendCount,
// 소비자 포인트전환내역 조회
    getAllPointBlyHistory,
// 탈퇴한 소비자
    getStoppedConsumers,

// 추천인/친구 조회
    getRecommendFriends,

// 어뷰저리스트
    getConsumerAbusers,

//회원 수(탈퇴안한 수)
    getConsumerCount,

//회원 수(탈퇴한 수)
    getConsumerStopedCount,

//회원 수(휴면한 수)
    getConsumerDormancyCount,

//준회원 수(giftReceiver 수)
    getSemiConsumerCount,

// 소비자번호별 주문건수 조회
    getOrderCountByConsumers,

// 모든 생산자 모든 회원 상품 문의
    producerGoodsQnaList, producerGoodsQnaStatusAllCount, producerClaimQnaStatusAllCount,

// 로컬푸드 생산자 요청 문의
    localFarmerQnaList, localFarmerQnaStatusAllCount,
    getLocalFarmerQnaByLocalFarmerQnaNo, setLocalFarmerQnaAnswerByLocalFarmerQnaNo, setLocalFarmerQnaAnswerByLocalFarmerQnaNoAuto,

// 생산자 모든 회원 번호와 정보(이름, email, account) 가져오기  => 각 생산자별 토큰개수와 eth balance 조회용
    getAllProducerList, getAllProducers,

    authProducer, checkAuthProducer, // 생산자 블록체인 생산이력 기록 권한 부여, 확인

// 생산자 상품 이력
    getAllGoodsStepList, getGoodsStep, delGoodsStep,
// 생산자 상품 이력 수정
    updateGoodsStep,

// 생산자별 매출 정산 자료 조회
    getAllProducerPayoutList,

// 포텐타임 지원금 blct 월별 금액 조회
    getSupportPriceBlct,

// 생산자별 정산 check 자료 조회
    getProducerPaymentCheck,

// 정산시 체크 메모리스트 조회
    getPaymentCheckMemoList,

// 정산 메모 삭제
    delPaymentMemo,

// 생산자별 정산 주문내역 조회
    getPaymentProducerGigan, getPaymentProducer,

// 생산자별 매출 정산 상태를 db 에 기록
    setProducerPayoutStatus,

    //전표내역(포함) 연관된 주문내역 가져오기
    findCsOrderList,

// 모든 주문번호 가져오기
    getAllOrderDetailList,

// 주문 카드 오류 내 가져오기
    getAllOrderTempDetailList,

    getAllOrderStats, getAllPointStats,

    getAllGoodsList,

    getAllGoodsSaleList,

    getAdminGoodsNoBuyReward,

    getAllGoodsNotEvent,

// 모든 상품정보 가져오기
    getAllGoods,

// 품절상품 조회
    getSoldOutGoods,

// 판매 일시중지 상품 조회
    getPausedGoods,

// 판매종료상품 조회
    getSaleEndGoods,

// consumerNo로 account 가져오기
    getNewAllocateSwapBlyAccount,

// email로 account 가져오기
    getConsumerAccountByEmail,

// 비밀번호 reset (abc1234!)
    resetPassword,


//택배사 조회(전체)
    getTransportCompany,

//택배사 조회(택배사 번호)
    getTransportCompanyByNo,

//택배사 조회(택배사 코드)
    getTransportCompanyByCode,

//택배사 등록 & 수정
    addTransportCompany,

//택배사 삭제
    delTransportCompany,

//택배사코드 중복여부 체크
    getIsDuplicatedTransportCode,

//품목 조회(전체)
    getItems,

//품목 조회(품목 번호)
    getItemByItemNo,

//품목 등록 & 수정
    addItem,

//품목 활성 or 비활성
    updateItemEnabled,

//itemKind(품종)코드 발췌.
    getNewItemKindCode,

//itemKind(품종)코드로 품명 조회
    getItemKindByCode,

// 공지사항 등록
    regNotice,

// 공지사항 조회
    getNoticeListForAdmin,

// 공지사항 한건 조회
    getNoticeByNoticeNo,

// 공지사항 삭제
    delNoticeApi,

// 푸시알림 등록
    regPushNoti,

// 푸시알림 조회
    getPushNotiList,

// 푸시알림 한건 조회
    getPushNotiByPushNotiNo,

// 푸시알림 삭제
    delPushNoti,

    getHolidayList,
    regHoliday, delHoliday,

// 로컬차단품목 관리
    getBlockPummokList, saveBlockPummok, updateBlockPummok, removeBlockPummok,

// 이벤트 지급 목록
    getB2cEventPaymentList,

// 생산자의 BLCT구매 정산방법 변경
    changeProducerPayoutBlct,


// 생산자 수수료 등록 및 수정
    regProducerFeeRate,

// 생산자 수수료 목록
    getProducerFeeRate,

// 생산자별 개인 수수료 수정
    saveFeeRateToProducer,
// 생산자별 개인 수수료 수정 예약.
    reserveFeeRateToProducer,
// 생산자별 개인 수수료 수정 즉시 변.
    directFeeRateToProducer,

///////B2B_ADD////////////////////////////////////////////////////////////////////////////////////////////////////

//B2B판매중 상팜
    getAllFoodsSaleList,

//B2B 품목 조회(전체)
    getB2bItems,
//B2B 품목 조회(품목 번호)
    getB2bItemByNo,
//B2B 품목 등록 & 수정
    addB2bItem,
//itemKind(품종)코드 발췌.
    getNewB2bItemKindCode,

//품목 활성 or 비활성
    updateB2bItemEnabled,
// 생산자별 매출 정산 상태를 db 에 기록
    setSellerPayoutStatus,

// 업체별 정산 체크정보 저장
    savePaymentCheck,
// 생산자별 매출 정산 자료 조회
    getAllSellerPayoutList,
// 모든 주문번호 가져오기
    getAllDealDetailList,
// 모든 상품정보 가져오기
    getAllFoods,
// 소비자 모든 회원 번호와 정보(이름, email, account) 가져오기  => 각 소비자별 토큰개수와 eth balance 조회용
    getAllBuyers,
// 생산자 모든 회원 번호와 정보(이름, email, account) 가져오기  => 각 생산자별 토큰개수와 eth balance 조회용
    getAllSellers,
//// b2c 홈 화면 구성
    getHomeSetting,
// 기획전 상품 번호 저장
    setHomeSetting,
    getExGoodsNoList,
//// 이벤트 정보
// 이벤트 정보 목록
    getEventInfoList,
// 이벤트 정보 조회
    getEventInfo,
// 이벤트 저장
    setEventInfoSave,
// 이벤트 삭제
    delEventInfo,

//// b2c 기획전 관리
// 기획전 조회
    getMdPickList,
// 기획전 정보 조회
    getMdPick,
// 기획전 삭제
    delMdPick,
// 기획전 홈화면에숨김
    hideMdPick,
// 기획전 저장
    setMdPickSave,

////b2c 블리타임
// // 블리타임 조회 (All)
//     getBlyTimeAdminList,
// // 블리타임 삭제
//     delBlyTime,
// // 블리타임 등록
//     setBlyTimeRegist,
// // 블리타임 수정
//     setBlyTimeUpdate,

////b2c 포텐타임
// 포텐타임 조회 (All)
    getTimeSaleAdminList,
// 포텐타임 상품 조회 (단건) - 블리타임과수퍼리워드하고 동일하게 controller 호출함.
    getTimeSaleAdmin,
// 포텐타임 삭제
    delTimeSale,
// 포텐타임 등록
    setTimeSaleRegist,
// 포텐타임 수정
    setTimeSaleUpdate,
////b2c 수퍼타임
// 수퍼리워드 조회 (All)
    getSuperRewardAdminList,
// 수퍼리워드 삭제
    delSuperReward,
// 수퍼리워드 등록
    setSuperRewardRegist,
// 수퍼리워드 수정
    setSuperRewardUpdate,

//// AllowanceIP 관리
    saveAllowanceIP,
    removeAllowanceIP,
    getAllowanceIPList,

//// admin 계정 관리
// admin 계정 등록
    addAdmin,
// admin List 조회
    getAdminList,
    getAdmin,

// 소비자 탈퇴 처리
    setConsumerStop,

// DonAirdrops DON 에어드랍
    getDonAirdrops,
    getSwapManagerDonBalance,
    donTransferAdminOk,
    ircDonTransferAdminOk,

// DON Manager Balance, Igas
    getBalanceOfManagerDon,
    getManagerIGas,

    getAllBlctToWonCachedLog,

// blct 통계페이지 조회용
    getBlctStats,
    getMonthlyBlctStats,

// blct 정산시 tempProducerBlctManage 조회용
    getAllTempProducerBlctGigan,
    getAllTempProducerBlctMonth,

// blct 정산시 서포터즈 지급 BLCT 합계
    getAllSupportersBlct,
// blct 정산시 블리타임 리워드 BLCT 합계
    getAllBlyTimeRewardBlct,
// blct 정산시 이벤트적립금 BLCT 합계
    getAllEventRewardBlct,
// blct 정산시 쿠폰지급 BLCT 합계
    getAllCouponBlct,
// 입점관리 정보 조회
    getProducerRegRequests,
//소비자 본인인증 내역 한건
    getConsumerVerifyAuth,
//소비자 KYC 인증 내역 조회
    getConsumerKycList,
//소비자 KYC 인증 내역 한건
    getConsumerKyc,
//소비자 KYC 인증 처리
    setConsumerKycAuth,
// 모든 소비자 토큰총합 조회
    getAllConsumerToken,
// 모든 생산자 토큰총합 조회
    getAllProducerToken,
// 예약상품 중 blct결제한 리스트
    getReservedOrderByBlctPaid,
// 상품상세 공지 배너 등록
    setGoodsBannerSave,
// 상품상세 공지 리스트 조회
    getGoodsBannerList,
// 상품상세 공지 정보 조회
    getGoodsBanner,
//
    delGoodsBanner,

// 상품번호로 포텐타임쿠폰 지급상품인지 여부 조회
    getPotenCouponMaster,
// 쿠폰 발급 내역 목록
    getCouponMasterList,
// 쿠폰 발급 내역 정보 (단건)
    getCouponMaster, getCouponMasterWithUsedWon,
// 쿠폰 발급 내역 등록 및 수정
    saveCouponMaster,
// 쿠폰 발급 내역 등록 및 수정(쿠폰명수정)
    updateCouponMasterTitle,
// 구매보상 발급대상 상품목록 수정
    updateRewardCouponGoods,
// 쿠폰 발급 내역 삭제
    deleteCouponMaster,
// 쿠폰 발급 내역 종료(삭제플래그처리)
    endedCouponMaster,
// 스페셜 쿠폰 발급
    addSpecialCouponConsumer,

// 소비자 쿠폰발급내역
    getConsumerCouponList,
// 홈 공지 배너 등록
    setHomeBannerSave,
// 홈 공지 배너 리스트 조회
    getHomeBannerList,
// 홈 공지 배너 정보 조회
    getHomeBanner,

    delHomeBanner,

    getAllTempProducer,

//고팍스 가입 이벤트 목록
    getGoPaxJoinEvent,

//고팍스 카드 이벤트 목록
    getGoPaxCardEvent,
// 친구초대 관련 이벤트 리스트
    getInviteFriendCountList,
    getInviteFriendList,
    getInviteFriendGoodsList,
    runInviteFriendCountBatch,


    getAbusers,
    getAbuserByConsumerNo,
    addAbuser,
// 판매자 blct 정산 리스트
    getAllProducerWithdrawBlct,
//소비자 토큰 히스토리 전체 내역
    getConsumerTokenHistory,
// 소비자의 출금신청 처리(승인상태 변경 및 출금요청)
//     requestAdminOkStatus,
// 소비자의 출금신청 배치처리로 등록
//     requestAdminOkStatusBatch,

// 소비자의 출금신청 처리(승인상태 변경 및 출금요청)
    updateSwapBlctToBlyMemo,
//소비자 번호로 소비자정보 조회
    getConsumerByConsumerNo,
// 카카오 폰번호 소비자찾기
    getKakaoPhoneConsumer,
//소비자 주문내역 조회
    getOrderDetailCountByConsumerNo,
    getOrderDetailByConsumerNo,
    getOrderDetailByConsumerNoForYearMonth,
    getOrderDetailByConsumerNoForYearMonths,
//상품 삭제(판매중단인 상품만 플래그 변경)
    updateGoodsDeleteFlag,
// 소비자 출금계좌 확인
    checkExtOwnAccount,
// 생산자 주문취소요청건 승인
    confirmProducerCancel,
// 생산자 주문취소요청건 철회
    confirmProducerCancelBack,

// 생산자 주문취소신청 조회
    getAllProducerCancelList,

// 소비자 정보 업데이트
    updateConsumer,
// 우수리뷰 보상지급
    pickBestReview, goodsReviewBlinding, goodsReviewNotBlinding,

    //투표 등록
    addBoardVote,

    //투표 수정
    updateBoardVote,

    //투표 리스트 조회
    getBoardVoteList,

    //투표 한건 조회
    getBoardVote,

    //투표 한건 삭제
    deleteBoardVote,

    //전체 해시태그 리스트
    getAllHashTagList,

    // 해시태그 상태값 업데이트
    updateHashTagStatus,

    // 해시태그 삭제
    deleteHashTag,

    // 해시태그 추가
    addHashTag,

    // 로컬푸드 참가 생산자 조회
    getLocalfoodProducerList,
    // 해시태그 그룹 전체 조회
    getAllHashTagGroupList,

    // 해시태그 그룹 한건 조회
    getHashTagGroup,

    // 해시태그 그룹 등록
    addHashTagGroup,

    // 해시태그 그룹 삭제
    deleteHashTagGroup,

    //addThemeHashTag,

    // 상품 해시태그 변경
    updateGoodsTags,
    updateProducerTags,

    // 상품 해시태그 및 ArFile 변경
    updateGoodsTagsArFile,

    // 상품 인증 마크 변경
    updateGoodsAuthMark,

    pointList, consumerPointList,
    rouletteManageList, rouletteGaeGeunList, rouletteManage, saveRouletteManage, delRouletteManage,
    updateGoodsFakeDeal,
    addSpecialPoint,

    getAllProducerGoods,

    updateProducerTempAdminMemo
}