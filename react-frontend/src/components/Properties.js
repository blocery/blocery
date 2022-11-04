import * as Producer from '../components/producer'
import {FaChartArea, FaBoxOpen, FaStore, FaShoppingCart, FaDollarSign, FaSignal, FaGlobe} from 'react-icons/fa'
import {TYPE_OF_IMAGE} from "~/lib/bloceryConst";
import loadable from "@loadable/component";
const B2cHomeSetting = loadable(() => import('~/components/admin/b2cHomeSetting'))
const EventInfoList = loadable(() => import('~/components/admin/eventList'))
const B2cMdPickList = loadable(() => import('~/components/admin/b2cMdPick/B2cMdPickList'))
const B2cTimeSaleList = loadable(() => import('~/components/admin/b2cTimeSale/B2cTimeSaleList'))
const B2cSuperRewardList = loadable(() => import('~/components/admin/b2cSuperReward/B2cSuperRewardList'))
const OrderList = loadable(() => import('~/components/admin/orderList/OrderList'))
const ProducerCancelReqList = loadable(() => import('~/components/admin/producerCancelReqList/producerCancelReqList'))
const OrderCardTempList = loadable(() => import('~/components/admin/orderList/OrderCardTempList'))
const GoodsList = loadable(() => import('~/components/admin/goodsList/GoodsList'))
const DealGoodsList = loadable(() => import('~/components/admin/dealGoodsList/DealGoodsList'))
const TokenSiseCorrectionList = loadable(() => import('~/components/admin/tokenSiseCorrection/TokenSiseCorrectionList'))
const TokenSwapInList = loadable(() => import('~/components/admin/tokenSwapList/TokenSwapInList'))
const NewTokenSwapDepositList = loadable(() => import('~/components/admin/tokenSwapList/NewTokenSwapDepositList'))
const TokenSwapOutList = loadable(() => import('~/components/admin/tokenSwapList/TokenSwapOutList'))
const PointToBlyList = loadable(() => import('~/components/admin/point/PointToBlyList'))
const ConsumerList = loadable(() => import('~/components/admin/consumerList/ConsumerList'))
const RecommendFriendList = loadable(() => import('~/components/admin/consumerList/RecommendFriendList'))
const AbuserList = loadable(() => import('~/components/admin/consumerList/AbuserList'))
const ConsumerKycList = loadable(() => import('~/components/admin/kyc/ConsumerKycList'))
const ConsumerStoppedList = loadable(() => import('~/components/admin/consumerList/ConsumerStoppedList'))
const ProducerList = loadable(() => import('~/components/admin/producerList/ProducerList'))
const GoodsStepList = loadable(() => import('~/components/admin/goodsStep/GoodsStepList'))
const ProducerActivity = loadable(() => import('~/components/admin/producerActivity/ProducerActivity'))
const ProducerRegRequest = loadable(() => import('~/components/admin/producerRegRequest/ProducerRegRequest'))
const ProducerJoinList = loadable(() => import('~/components/admin/producerJoin/ProducerJoinList'))

const LocalBlockPummokList = loadable(()=> import('~/components/admin/localBlockPummok'))
const HolidayList = loadable(() => import('~/components/admin/holiday'))

const ItemList = loadable(() => import('~/components/admin/itemList/itemList'))
const TransportCompanyList = loadable(() => import('~/components/admin/transportCompanyList/TransportCompanyList'))
const ProducerFeeRateList = loadable(() => import('~/components/admin/producerFeeRate/ProducerFeeRateList'))
const ProducerQnaList = loadable(() => import('~/components/admin/producerQnaList/ProducerQnaList'))
const LocalFarmerQnaList = loadable(() => import('~/components/admin/localFarmerQnaList/LocalFarmerQnaList'))
const FaqList = loadable(() => import('~/components/admin/faqList/FaqList'))
const NoticeList = loadable(() => import('~/components/admin/noticeList/NoticeList'))
const GoodsDetailBannerList = loadable(() => import('~/components/admin/goodsDetailBanner/GoodsDetailBannerList'))
const PushNotiList = loadable(() => import('~/components/admin/pushNotification/PushNotiList'))
const GoodsReviewList = loadable(() => import('~/components/admin/goodsReview/GoodsReviewList'))
const BoardRankingList = loadable(() => import('~/components/admin/boardAndReply/BoardRankingList'))
const BoardReportList = loadable(() => import('~/components/admin/boardAndReply/BoardReportList'))
const BoardReplyReportList = loadable(() => import('~/components/admin/boardAndReply/BoardReplyReportList'))
const ProfileReportList = loadable(() => import('~/components/admin/boardAndReply/ProfileReportList'))
const ProfileBlockList = loadable(() => import('~/components/admin/boardAndReply/ProfileBlockList'))
const BoardVote = loadable(() => import('~/components/admin/boardVote'))
const RouletteManage = loadable(() => import('~/components/admin/roulette'))
const HashTag = loadable(() => import('~/components/admin/hashTag'))
const HashTagGroupManager = loadable(() => import('~/components/admin/hashTagGroupManager'))
const ConsumerCouponList = loadable(() => import('~/components/admin/coupon/ConsumerCouponList'))
const CouponMasterList = loadable(() => import('~/components/admin/coupon/CouponMasterList'))
const PointList = loadable(() => import('~/components/admin/point/PointList'))
const SpecialPoint = loadable(() => import('~/components/admin/point/SpecialPoint'))
const GoPaxJoinEventList = loadable(() => import('~/components/admin/goPaxEvent/GoPaxJoinEventList'))
const GoPaxCardEventList = loadable(() => import('~/components/admin/goPaxEvent/GoPaxCardEventList'))
const DonAirDropList = loadable(() => import('~/components/admin/donAirDrop/DonAirDropList'))
const InviteFriendCountList = loadable(() => import('~/components/admin/inviteFriend/InviteFriendCountList'))
const InviteFriendList = loadable(() => import('~/components/admin/inviteFriend/InviteFriendList'))
const InviteFriendGoodsList = loadable(() => import('~/components/admin/inviteFriend/InviteFriendGoodsList'))
const BountyEventHistory = loadable(() => import('~/components/admin/eventBountyHistory/BountyEventHistory'))
const SetToken = loadable(() => import('~/components/admin/setToken/SetToken'))
const AddAdmin = loadable(() => import('~/components/admin/addAdmin'))
const AllowanceIP =  loadable(() => import('~/components/admin/addAdmin/AllowanceIP'))
const PaymentAll = loadable(() => import('~/components/admin/payment/PaymentAll'))
const PaymentProducer = loadable(() => import('~/components/admin/payment/PaymentProducer'))
const TempProducerList = loadable(() => import('~/components/admin/payment/TempProducerList'))

/* 통계 */
const OrderStats = loadable(() => import('~/components/admin/statistics/OrderStats'))
const PointStats = loadable(() => import('~/components/admin/statistics/PointStats'))
const ReservesStats = loadable(() => import('~/components/admin/statistics/ReservesStats'))
const BlctStats = loadable(() => import('~/components/admin/statistics/OldBlctStats'))
const BlctToWon = loadable(() => import('~/components/admin/statistics/BlctToWon'))

// 환경 개발 또는 운영 모드 변수
// config.mode: process.env.NODE_ENV,
const config = {
    mode: process.env.NODE_ENV,
    appMode: process.env.REACT_APP_ENV,
};

export const Server = {

    /* 중요: AWS포시에는 꼭 production */
    _serverMode: function() {
        if(config.mode==="production"){
            if(config.appMode === "staging"){
                return 'stage'; // 개발 모드
            }
            return 'production'; // 운영 모드
        } else {
            return 'stage'; // 개발 모드
        }
        // return 'stage';      //stage Server: 서버테스트용 - 회사 서버.-마스터에는 이버전으로 관리
        // return 'production'; //production Server:  - AWS 서버 배포시 꼭 이버전. + 백엔드 gradle 버전넘버 중간꺼 올리기, 예) 0.2.xx
    },
    getRestAPIHost: function() {
        return window.location.hostname === 'localhost' ? this._getLocalServerUrl()+'/restapi' : this._getServer() + '/restapi';
    },
    // 서버쪽 이미지 및 파일api
    _isImageServerTarget: function() {
        if(window.location.hostname === 'localhost'){
            return true;    //todo: 로컬에서 이미지 테스트일경우 false 로 변경
        }else {
            if (this._serverMode() === 'stage') {
                return true;
            } else if (this._serverMode() === 'production') {
                return true;
            }
        }
        return true;
    },
    //local개발시에도 225서버로 file upload되도록 추가.
    getRestAPIFileServerHost: function() {
        if(this._isImageServerTarget()){
            return this._getServer() + '/restapi';
        }
        return window.location.hostname === 'localhost' ? this._getLocalServerUrl() + '/restapi' : this._getServer() + '/restapi';
    },
    //local개발시에도 225서버로 file upload path 되도록 추가.
    getFileServerURL: function() {
        if(this._isImageServerTarget()){
            return this._getServer();
        }
        return window.location.hostname === 'localhost' ? this._getLocalServerUrl():this._getServer();
    },
    //local개발시에도 225서버로 file upload path 되도록 추가.
    getImgTagServerURL: function() {
        if(this._isImageServerTarget()){
            return this._getServer();
        }
        return window.location.hostname === 'localhost' ? this._getLocalServerUrl():this._getServer();
    },
    //local개발시에도 225서버로 file upload되도록 추가.
    getImageURL: function() {
        if(this._isImageServerTarget()){
            return  this._getServer() + '/images/';      //개발시에도 225 이미지 보기
        }
        return window.location.hostname === 'localhost' ? this._getLocalServerUrl()+'/images/' : this._getServer() + '/images/';
    },
    getBadgeImageURL: function() {
        return this._getDomain+"/images/";
    },
    //local개발시에도 225서버로 file upload되도록 추가.
    getThumbnailURL: function(thumbType) {
        let imageTarget = "/thumbnails/";
        if (thumbType === TYPE_OF_IMAGE.WIDE) //default=wide인 경우 임.
            imageTarget = "/widethumb/";
        else if (thumbType === TYPE_OF_IMAGE.SQUARE) //default=wide인 경우 임.
            imageTarget = "/squarethumb/";
        else if (thumbType === TYPE_OF_IMAGE.SMALL_SQUARE) { //default=small인 경우 임.
            imageTarget = "/smallthumb/";
        }
        if(this._isImageServerTarget()){
            return  this._getServer() + imageTarget; //개발시에도 225 이미지 보기
        }
        return  window.location.hostname === 'localhost' ? this._getLocalServerUrl()+imageTarget : this._getServer()+imageTarget;
    },
    //local개발시에도 225서버로 file upload되도록 추가.
    getArImageURL: function() {
        if(this._isImageServerTarget()){
            return  this._getServer() + '/arimages/';      //개발시에도 225 이미지 보기
        }
        return window.location.hostname === 'localhost' ? this._getLocalServerUrl()+'/arimages/' : this._getServer() + '/arimages/';
    },
    getServerURL: function() {
        return window.location.hostname === 'localhost' ? this._getLocalServerUrl() : this._getServer();
    },
    getFrontURL:function() {
        return window.location.hostname === 'localhost' ? this._getLocalFrontUrl() : this._getServer();
    },
    getShareURL:function() {
        return this._getDomainShare(); //공유용 URL
    },
    getKakaoAppKey:function (){
        if (this._serverMode() === 'stage')
            return "87c79a2872503bb948c11a5239a68e51";   //test
        else
            return "e1362624032fd8badb8733b8894607d6";   //production
    },
    getImpKey:function(){
        if (this._serverMode() === 'stage')
            return "imp34151859";   //test
        else
            return "imp22993918";   //production
    },
    getImpPgId:function(pgGubun){
        if (this._serverMode() === 'stage'){
            if(pgGubun === 'kakaopay'){
                return "kakaopay.TC0ONETIME";
            } else if(pgGubun === 'kakaopay_billing'){
                return "kakaopay.TCSUBSCRIP";
            } else if(pgGubun === 'naverpay'){
                return "naverpay.np_ivyyn688623";
            } else if(pgGubun === 'naverpay_billing'){
                return "naverpay.np_ivyyn688623";
            } else {
                return "uplus"; //LGU+
            }
        }else{
            if(pgGubun === 'kakaopay'){
                return "kakaopay.CAB8CXCOT6";
            } else if(pgGubun === 'kakaopay_billing'){
                return "kakaopay.CA336TKN9P";
            } else if(pgGubun === 'naverpay'){
                return "naverpay.np_ivyyn688623";
            } else if(pgGubun === 'naverpay_billing'){
                return "naverpay.np_ivyyn688623";
            } else {
                return "uplus"; //LGU+
            }
        }
    },
    _getLocalFrontUrl: function(){
        let protocol = window.location.protocol; // => http:,https:
        let v_stage_url = protocol+'//'+'localhost';
        let v_stage_port = '3000';
        let v_return_url = v_stage_url+':'+v_stage_port;
        return v_return_url;
    },
    _getLocalServerUrl: function(){
        let protocol = window.location.protocol; // => http:,https:
        let v_stage_url = protocol+'//'+'localhost';
        let v_stage_port = '8080';
        let v_return_url = v_stage_url+':'+v_stage_port;
        if(protocol==='http:'){
            v_stage_port = '8080';
            v_return_url = v_stage_url+':'+v_stage_port;
        }
        if(protocol==='https:'){
            v_stage_port = '8443';
            v_return_url = v_stage_url+':'+v_stage_port;
        }
        return v_return_url;
    },
    _getStageServerUrl: function(){
        let protocol = window.location.protocol; // => http:,https:
        let v_stage_url = protocol+'//'+'210.92.91.225';
        let v_stage_port = '8080';
        let v_return_url = v_stage_url+':'+v_stage_port;
        if(protocol==='http:'){
            v_stage_port = '8080';
            v_return_url = v_stage_url+':'+v_stage_port;
        }
        if(protocol==='https:'){
            v_stage_port = '8443';
            v_return_url = v_stage_url+':'+v_stage_port;
        }
        return v_return_url;
    },
    _getServer: function() {
        if (this._serverMode() === 'stage') {
            return this._getStageServerUrl();
        } else { //production
            return this._getDomain();
        }
    },
    _getDomainShare: function (){
        if (this._serverMode() === 'stage') {
            return window.location.hostname === 'localhost' ? this._getLocalFrontUrl():this._getStageServerUrl();
        } else { //production
            let protocol = window.location.protocol; // => http:,https:
            return protocol + '//shopbly.shop'; //공유용 URL
        }
    },
    _getDomain: function (){
        let protocol = window.location.protocol; // => http:,https:
        if (window.location.hostname === 'shopbly.shop') {
            return protocol+'//shopbly.shop'; //202109 추가.
        }
        else if (window.location.hostname === 'shopbly.co.kr') {
            return protocol+'//shopbly.co.kr'; //202012 추가- 멀티도메인
        }
        else if (window.location.hostname === 'shopbly.kr') {
            return protocol+'//shopbly.kr'; //202012 추가- 멀티도메인
        }
        else if (window.location.hostname === 'marketbly.com') {
            return protocol+'//marketbly.com'; //202012 추가- 멀티도메인
        }
        return protocol+'//blocery.com'; //AWS 서버 IP = http://13.209.43.206
    },
    //관리자 메인페이지
    getAdminShopMainUrl: function(){
        const {type, parentId, id} = AdminSubMenuList.find(menu => menu.type === 'shop' && menu.isMainPage === true)
        return `/admin/${type}/${parentId}/${id}`
    },
    getShopMainUrl: function(){
        return '/'
    },
    ERROR: 100
}

export const Const = {
    GAS_LIMIT: 50000,  // 사용자 토큰전송을 위해 approve시 대략 50,000 gas 필요함
    INITIAL_TOKEN : 1000,
    GIVE_ETH_GASTIMES : 5,
    VALWORD_CRYPTO_KEY : 'u8d7l5h3z0m'   //localStorage에 valword저장시 암호화용 키
}

export const User = {
    admin: '관리자',
    consumer: '소비자',
    producer: '생산자'
}

export const ProducerMenuLocal = {
    normal: 0,
    local: 1
}

// 생산자 웹 메인메뉴
export const ProducerWebMenuList = [
    {route: 'producer', id: 'home', name: '홈', icon: FaSignal},
    {route: 'producer', id: 'goods', name: '상품관리', icon: FaBoxOpen},
    {route: 'producer', id: 'shop', name: '상점관리/재배이력', icon: FaStore},
    {route: 'producer', id: 'order', name: '주문관리', icon: FaShoppingCart},
    {route: 'producer', id: 'calculate', name: '정산관리', icon: FaDollarSign},
    {route: 'producer', id: 'statistic', name: '통계', icon: FaChartArea},
    // {route: 'producer', id: 'marketing', name: '마케팅', icon: FaGlobe},
]

// 생산자 웹 서브메뉴
export const ProducerWebSubMenuList = [
    {parentId: 'home', menuTp:ProducerMenuLocal.normal, id: 'home', name: '대시보드', page: Producer.WebHome, noPadding: true, explain: '전체 이력을 한눈에 추적합니다'},
    {parentId: 'home', menuTp:ProducerMenuLocal.normal, id: 'noticeList', name: '공지사항', page: Producer.WebNoticeList, noPadding: false, explain: '중요 공지, 점검, 이벤트, 서비스 안내, 정보의 공유 등 다양한 정보를 공지사항을 통해 꼭 확인해 주시기 바랍니다'},
    {parentId: 'goods', menuTp:ProducerMenuLocal.normal, id: 'goodsList', name: '상품목록', page: Producer.WebGoodsList, noPadding: false, explain: '상품리스트를 관리 합니다'},
    {parentId: 'goods', menuTp:ProducerMenuLocal.normal, id: 'goodsReg', name: '즉시상품등록', page: Producer.WebGoodsSelection, noPadding: false, explain: '상품등록을 합니다'},
    {parentId: 'goods', menuTp:ProducerMenuLocal.normal, id: 'dealGoodsReg', name: '쑥쑥-계약재배등록', page: Producer.WebDealGoodsReg, noPadding: false, explain: '계약상품등록을 합니다'},
    {parentId: 'goods', menuTp:ProducerMenuLocal.normal, id: 'goodsReview', name: '상품후기', page: Producer.WebGoodsReviewList, noPadding: false, explain: '고객의 상품후기에 답변을 달아주세요'},
    {parentId: 'goods', menuTp:ProducerMenuLocal.normal, id: 'goodsQnaList', name: '상품문의', page: Producer.WebGoodsQnaList, noPadding: false, explain: '고객의 상품문의에 답변을 달아주세요'},
    {parentId: 'goods', menuTp:ProducerMenuLocal.normal, id: 'producerNotice', name: '판매자공지', page: Producer.ProducerNotice, noPadding: false, explain: '전체 상품에 노출될 공지사항을 입력해주세요'},
    // {parentId: 'goods', menuTp:ProducerMenuLocal.normal, id: 'commonInfo', name: '(준비중)공통정보관리', page: Error, noPadding: false, explain: '상품등록 및 운영에 필요한 코드를 관리합니다'},
    {parentId: 'shop', menuTp:ProducerMenuLocal.normal, id: 'shop', name: '상점정보', page: Producer.WebShop, noPadding: false, explain: '고객에게 노출되는 상점을 꾸며주세요'},
    {parentId: 'shop', menuTp:ProducerMenuLocal.local, id: 'localfoodFarmer', name: '로컬농가', page: Producer.LocalfoodFarmer, noPadding: false, explain: '로컬푸드 농가를 관리합니다'},
    {parentId: 'shop', menuTp:ProducerMenuLocal.normal, id: 'farmDiaryList', name: '(공동구매)재배이력', page: Producer.WebFarmDiaryList, noPadding: false, explain: '상품의 생산일지에 노출될 생산일지를 상세히 기록해 주세요'},
    {parentId: 'shop', menuTp:ProducerMenuLocal.normal, id: 'regularShopList', name: '단골관리', page: Producer.WebRegularShopList, noPadding: false, explain: '단골고객이 얼마나 있을까요?'},
    // {parentId: 'shop', menuTp:ProducerMenuLocal.normal, id: 'popupList', name: '(준비중)팝업관리', page: Error, noPadding: false, explain: '내용입력요'},
    // {parentId: 'shop', menuTp:ProducerMenuLocal.normal, id: 'shopNotice', name: '(준비중)상점공지사항', page: Error, noPadding: false, explain: '내용입력요'},
    {parentId: 'order', menuTp:ProducerMenuLocal.normal, id: 'orderList', name: '주문통합목록', page: Producer.WebOrderList, noPadding: false, explain: '고객들이 주문한 리스트를 조회해보세요'},
    {parentId: 'order', menuTp:ProducerMenuLocal.normal, id: 'orderCancelList', name: '주문취소목록', page: Producer.WebOrderCancelList, noPadding: false, explain: '취소된 주문 리스트를 조회해보세요'},
    {parentId: 'order', menuTp:ProducerMenuLocal.normal, id: 'orderListOfSubGroup', name: '주문그룹목록', page: Producer.WebSubGroupList, noPadding: false, explain: '고객들이 주문한 그룹의 전체 주문리스트를 조회 합니다'},
    {parentId: 'calculate', menuTp:ProducerMenuLocal.normal, id: 'calculateTab', name: '정산관리', page: Producer.WebCalculateTab, noPadding: false, explain: ''},
    {parentId: 'calculate', menuTp:ProducerMenuLocal.local, id: 'calculateLocal', name: '정산관리(농가별)', page: Producer.WebCalculateLocal, noPadding: false, explain: ''},
    //옥천로컬매장직원전용 농가수수료
    {parentId: 'calculate', menuTp:ProducerMenuLocal.local, localProducerNo:157, id: 'calculateLocalFee', name: '정산관리(농가수수료)', page: Producer.WebCalculate157Fee, noPadding: false, explain: ''},

    {parentId: 'statistic', menuTp:ProducerMenuLocal.normal, id: 'giganSalesSttList', name: '기간별판매현황', page: Producer.GiganSalesSttList, noPadding: false, explain: ''},

]

// 관리자 메인메뉴
export const AdminMenuList = [
    //shop
    {route: 'admin', type: 'shop', id: 'home', name: '홈'},
    {route: 'admin', type: 'shop', id: 'statistics', name: '통계'},
    {route: 'admin', type: 'shop', id: 'order', name: '주문'},
    {route: 'admin', type: 'shop', id: 'goods', name: '상품'},
    {route: 'admin', type: 'shop', id: 'tokenSwap', name: '토큰입출금/포인트BLY전환'},
    {route: 'admin', type: 'shop', id: 'consumer', name: '소비자'},
    {route: 'admin', type: 'shop', id: 'producer', name: '생산자'},
    {route: 'admin', type: 'shop', id: 'localfood', name: '로컬푸드'},
    {route: 'admin', type: 'shop', id: 'code', name: '기준정보'},
    {route: 'admin', type: 'shop', id: 'consumerCenter', name: '고객센터'},
    {route: 'admin', type: 'shop', id: 'allimCenter', name: '알림센터'},
    {route: 'admin', type: 'shop', id: 'boardCenter', name: '리뷰&게시글&투표&룰렛'},
    {route: 'admin', type: 'shop', id: 'hashTag', name: '#해시태그'},
    {route: 'admin', type: 'shop', id: 'couponPoint', name: '쿠폰&포인트'},
    {route: 'admin', type: 'shop', id: 'event', name: '이벤트내역'},
    {route: 'admin', type: 'shop', id: 'token', name: '계정&토큰'},
    {route: 'admin', type: 'shop', id: 'payment', name: '정산'},
]
// 관리자 서브메뉴
export const AdminSubMenuList = [
    // 홈
    {type: 'shop', parentId: 'home', id: 'homeSetting', name: '홈화면 구성', page: B2cHomeSetting, isMainPage: false},
    {type: 'shop', parentId: 'home', id: 'eventInfoList', name: '이벤트정보', page: EventInfoList, isMainPage: false},
    {type: 'shop', parentId: 'home', id: 'mdPickList', name: '기획전', page: B2cMdPickList, isMainPage: false},
    {type: 'shop', parentId: 'home', id: 'timeSaleList', name: '포텐타임', page: B2cTimeSaleList, isMainPage: false},
    {type: 'shop', parentId: 'home', id: 'superRewardList', name: '슈퍼리워드', page: B2cSuperRewardList, isMainPage: false},

    // 통계
    {type: 'shop', parentId: 'statistics', id: 'orderStats', name: '실적현황', page: OrderStats, isMainPage: true}, //isMainPage: true 일 경우 getAdminShopMainUrl() 에서 찾아서 반환
    {type: 'shop', parentId: 'statistics', id: 'pointStats', name: '포인트현황', page: PointStats},
    {type: 'shop', parentId: 'statistics', id: 'reservesStats', name: '적립금(BLY)현황', page: ReservesStats},
    {type: 'shop', parentId: 'statistics', id: 'blctStats', name: '(old)BLY통계', page: BlctStats},
    {type: 'shop', parentId: 'statistics', id: 'blctToWon', name: 'BLY일별가격', page: BlctToWon},

    // 주문
    {type: 'shop', parentId: 'order', id: 'orderList', name: '주문확인', page: OrderList, isMainPage: false},
    {type: 'shop', parentId: 'order', id: 'producerCancelReq', name: '생산자 주문취소요청', page: ProducerCancelReqList, isMainPage: false},
    {type: 'shop', parentId: 'order', id: 'orderCardTempList', name: '주문카드오류확인', page: OrderCardTempList, isMainPage: false},

    // 상품
    {type: 'shop', parentId: 'goods', id: 'goodsList', name: '상품목록', page: GoodsList, isMainPage: false},
    {type: 'shop', parentId: 'goods', id: 'dealGoodsList', name: '공동구매상품관리', page: DealGoodsList, isMainPage: false},
    {type: 'shop', parentId: 'goods', id: 'siseCorrectionList', name: '예약상품토큰보정', page: TokenSiseCorrectionList},

    // 토큰입출금
    {type: 'shop', parentId: 'tokenSwap', id: 'swapTokenInList', name: 'old토큰입금', page: TokenSwapInList},
    {type: 'shop', parentId: 'tokenSwap', id: 'newTokenSwapDepositList', name: 'new토큰입금', page: NewTokenSwapDepositList},
    {type: 'shop', parentId: 'tokenSwap', id: 'swapTokenOutList', name: '토큰출금', page: TokenSwapOutList},
    {type: 'shop', parentId: 'tokenSwap', id: 'pointToBlyList', name: '포인트 ➡ BLY', page: PointToBlyList},

    // 소비자
    {type: 'shop', parentId: 'consumer', id: 'consumerList', name: '소비자조회', page: ConsumerList},
    {type: 'shop', parentId: 'consumer', id: 'recommendFriendList', name: '추천친구조회', page: RecommendFriendList},
    {type: 'shop', parentId: 'consumer', id: 'abuserList', name: '어뷰저조회', page: AbuserList},
    {type: 'shop', parentId: 'consumer', id: 'consumerKycList', name: '소비자KYC인증내역', page: ConsumerKycList},
    {type: 'shop', parentId: 'consumer', id: 'consumerStoppedList', name: '탈퇴회원조회', page: ConsumerStoppedList},

    // 생산자
    {type: 'shop', parentId: 'producer', id: 'producerList', name: '생산자조회', page: ProducerList},
    {type: 'shop', parentId: 'producer', id: 'producerGoodsStep', name: '생산이력관리', page: GoodsStepList},
    {type: 'shop', parentId: 'producer', id: 'producerActivity', name: '생산자활동관리', page: ProducerActivity},
    {type: 'shop', parentId: 'producer', id: 'producerRegRequest', name: '생산자입점문의조회', page: ProducerRegRequest},
    {type: 'shop', parentId: 'producer', id: 'producerJoin', name: '입점센터', page: ProducerJoinList},

    //로컬푸드
    {type: 'shop', parentId: 'localfood', id: 'holiday', name: '공휴일관리', page: HolidayList},
    {type: 'shop', parentId: 'localfood', id: 'blockPummok', name: '옥천품목차단관리', page: LocalBlockPummokList},
    
    // 기준정보
    {type: 'shop', parentId: 'code', id: 'classItemList', name: '품목관리', page: ItemList},
    {type: 'shop', parentId: 'code', id: 'transportCompanyList', name: '택배사관리', page: TransportCompanyList},
    {type: 'shop', parentId: 'code', id: 'producerFeeRateList', name: '생산자수수료관리', page: ProducerFeeRateList},

    // 고객센터
    {type: 'shop', parentId: 'consumerCenter', id: 'producerQnaList', name: '소비자문의조회', page: ProducerQnaList},
    {type: 'shop', parentId: 'consumerCenter', id: 'localFarmerQnaList', name: '로컬푸드생산자요청조회', page: LocalFarmerQnaList},
    {type: 'shop', parentId: 'consumerCenter', id: 'faqList', name: 'FAQ목록', page: FaqList},

    // 알림센터
    {type: 'shop', parentId: 'allimCenter', id: 'noticeList', name: '공지사항목록', page: NoticeList},
    {type: 'shop', parentId: 'allimCenter', id: 'goodsDetailBannerList', name: '상품공지(배너)', page: GoodsDetailBannerList},
    {type: 'shop', parentId: 'allimCenter', id: 'pushNotiList', name: '푸쉬알림목록', page: PushNotiList},

    // 리뷰&게시글&투표&룰렛
    {type: 'shop', parentId: 'boardCenter', id: 'goodsReviewList', name: '상품리뷰', page: GoodsReviewList},
    {type: 'shop', parentId: 'boardCenter', id: 'boardRankingList', name: '게시글순위', page: BoardRankingList},
    {type: 'shop', parentId: 'boardCenter', id: 'boardReportList', name: '게시글관리', page: BoardReportList},
    {type: 'shop', parentId: 'boardCenter', id: 'boardReplyReportList', name: '댓글관리', page: BoardReplyReportList},
    {type: 'shop', parentId: 'boardCenter', id: 'profileReportList', name: '프로필신고', page: ProfileReportList},
    {type: 'shop', parentId: 'boardCenter', id: 'profileBlockList', name: '프로필차단', page: ProfileBlockList},
    {type: 'shop', parentId: 'boardCenter', id: 'boardVote', name: '투표관리', page: BoardVote},
    {type: 'shop', parentId: 'boardCenter', id: 'rouletteManage', name: '룰렛관리', page: RouletteManage},

    //#해시태그
    {type: 'shop', parentId: 'hashTag', id: 'hashTag', name: '해시태그관리', page: HashTag},
    {type: 'shop', parentId: 'hashTag', id: 'hashTagGroupManager', name: '해시태그 상품 그룹관리', page: HashTagGroupManager},

    //쿠폰및포인트 관리
    {type: 'shop', parentId: 'couponPoint', id: 'consumerCoupon', name: '쿠폰지급내역', page: ConsumerCouponList},
    {type: 'shop', parentId: 'couponPoint', id: 'couponMaster', name: '쿠폰발급설정', page: CouponMasterList},
    {type: 'shop', parentId: 'couponPoint', id: 'pointList', name: '포인트관리', page: PointList},
    {type: 'shop', parentId: 'couponPoint', id: 'specialPoint', name: '포인트지급/회수', page: SpecialPoint},

    //이벤트내역
    {type: 'shop', parentId: 'event', id: 'goPaxJoinEvent', name: 'GP1', page: GoPaxJoinEventList},
    {type: 'shop', parentId: 'event', id: 'goPaxCardEvent', name: 'GP2', page: GoPaxCardEventList},
    {type: 'shop', parentId: 'event', id: 'donAirDrop', name: 'DonAirDrop', page: DonAirDropList},
    {type: 'shop', parentId: 'event', id: 'inviteFriendCountList', name: '친추가입 지연요약', page: InviteFriendCountList},
    {type: 'shop', parentId: 'event', id: 'inviteFriendList', name: '친추가입 적립내역', page: InviteFriendList},
    {type: 'shop', parentId: 'event', id: 'inviteFriendGoodsList', name: '친추구매 내역', page: InviteFriendGoodsList},
    {type: 'shop', parentId: 'event', id: 'bountyEventHistory', name: 'BLCT지급 이벤트목록', page: BountyEventHistory},

    //기본설정 및 토큰설정 관리
    {type: 'shop', parentId: 'token', id: 'setToken', name: '토큰설정', page: SetToken},
    {type: 'shop', parentId: 'token', id: 'addAdmin', name: 'Admin 계정생성', page: AddAdmin},
    {type: 'shop', parentId: 'token', id: 'allowanceIP', name: '허용IP설정', page: AllowanceIP},

    //정산 관리
    {type: 'shop', parentId: 'payment', id: 'all', name: '전체보기', page: PaymentAll},
    {type: 'shop', parentId: 'payment', id: 'producers', name: '업체별', page: PaymentProducer},
    {type: 'shop', parentId: 'payment', id: 'tempProducer', name: '현금대납현황', page: TempProducerList},
]


//web 접속 시 하단 탭바의 url

// export const tabBarData = {
    // shop: [
    //     { pathname: '/home', name: 'home'},
    //     { pathname: '/store', name: 'store'},
    //     { pathname: '/local', name: 'local'},
    //     { pathname: '/community/boardMain/all', name: 'community'},
    //     // { pathname: '/search', name: 'search'},
    //     { pathname: '/mypage', name: 'mypage'},
    //     // { pathname: '/goodsHistory', name: '검색'},
    // ]
// }

// 상품고시정보 설정 상품별 내용
export const goodsTypeInfo = {
    A: [        //농수축산물
        {title:'품목 또는 명칭', placeholder:'ex) 사과', ess:true},
        {title:'포장단위별 내용물의 용량(중량), 수량, 크기', placeholder:'ex) 2kg, 1박스, 중량으로 판매하는 상품으로 크기를 기재하기 어렵습니다', ess:true},
        {title:'생산자, 수입품의 경우 수입자를 함께 표기', placeholder:'ex) 00농장(수입자:00식품)', ess:true},
        {title:'농수산물의 원산지 표시에 관한 법률에 따른 원산지', placeholder:'원산지 1개는 필수, 국내일 경우 "국내", 수입산일 경우 "나라명칭"입력, 기타는 "기타" 또는 "상세설명참조"로 기록', ess:true},
        {title:'제조연월일 (포장일 또는 생산연도), 유통기한', placeholder:'ex) 주문건 확인 후 ~일 이내 포장된 상품으로 발송 / 신선식품 특성 상 정해진 유통기한은 없으나 빠른 섭취를 권장합니다', ess:true},
        {title:'관련법상 표시사항', placeholder:'ex) Y/N', ess:true},
        {title:'농산물 - 농수산물품질관리법상 유전자변형농산물 표시, 지리적 표시', placeholder:'Y일 경우 제0호/지리적표시관리기관장 기재'},
        {title:'축산물 - 축산법에 따른 등급 표시, [축한물이력법]에 따른 이력관리대상 축산물 유/무', placeholder:'ex) 1등급, 이력관리대상-유'},
        {title:'수산물 - 농수산물품질관리법상 유전자변형수산물 표시, 지리적 표시', placeholder:'유전자변형 - 유전자변형식품/해당사항없음/유전자변형 포함가능성 있음(포함내역 입력), 지리적표시 - 획득여부 Y(지리적 표시제관련 공인인증 획득인경우 입력) / 아닐경우 N'},
        {title:'수입식품에 해당하는 경우 "[수입식품안전관리특별법]에 따른 수입신고를 필함"의 문구', placeholder:'수입식품안전관리특별법에 따른 수입신고를 필함'},
        {title:'상품구성', placeholder:'ex) 사과 2kg(12개내외)', ess:true},
        {title:'보관방법 또는 취급방법', placeholder:'ex) 냉장/냉동보관', ess:true},
        {title:'[식품 등의 표시･광고에 관한 법률]에 따른 소비자안전을 위한 주의사항', placeholder:'ex) 빠른섭취를 권장합니다.', ess:true},
        {title:'소비자상담 관련 전화번호', placeholder:'ex) 031-8090-3108', ess:true}
    ],
    P: [        //가공식품
        {title:'제품명', placeholder:'ex) 도가니탕', ess:true},
        {title:'식품의 유형', placeholder:'ex) 식육추출가공품', ess:true},
        {title:'생산자 및 소재지(수입품의 경우 생산자, 수입자 및 제조국)', placeholder:'원산지 1개는 필수, 국내일 경우 "국내", 수입산일 경우 "나라명칭"입력, 기타는 "기타" 또는 "상세설명참조"로 기록', ess:true},
        {title:'제조연월일, 유통기한', placeholder:'ex) 제조연월일, 제조일로부터 ~개월', ess:true},
        {title:'포장단위별 내용물의 용량(중량),수량', placeholder:'ex) 600g, 1개, 해당상품은 중량으로 대체되는 상품입니다', ess:true},
        {title:'원재료명 및 함량(농수산물의 원산지 표시에 관한 법률에 따른 원산지 표시 포함)', placeholder:'ex) 한우뼈추출액 86%, 한우도가니 14%', ess:true},
        {title:'영양성분([식품 등의 표시･광고에 관한 법률]에 따른 영양성분 표시대상 식품에 한함)', placeholder:'ex) 나트륨 60mg(3%),탄수화물 4g(1%), 당류 0g', ess:true},
        {title:'유전자변형식품에 해당하는 경우의 표시', placeholder:'유전자변형 - 유전자변형식품/해당사항없음/유전자변형 포함가능성 있음(포함내역 입력)'},
        {title:'소비자안전을 위한 주의사항', placeholder:'ex) ~을 사용한 제품과 같은 제조 시설에서 제조하고 있습니다', ess:true},
        {title:'수입식품에 해당하는 경우 "[수입식품안전관리특별법]에 따른 수입신고를 필함"의 문구', placeholder:'수입식품안전관리특별법에 따른 수입신고를 필함'},
        {title:'소비자상담 관련 전화번호', placeholder:'ex) 031-8090-3108', ess:true},
        {title:'품목보고번호', placeholder:'ex) 품목보고번호(13자리)를 작성해주세요.', ess:true}
    ],
    H: [        //건강기능식품
        {title:'제품명', placeholder:'ex) 비타민', ess:true},
        {title:'식품의 유형', placeholder:'ex) 건강기능식품', ess:true},
        {title:'제조업소의 병칭과 소재지(수입품의 경우 수입업소명, 제조업소명 및 수출국명)', placeholder:'원산지 1개는 필수, 국내일 경우 "국내", 수입산일 경우 "나라명칭"입력, 기타는 "기타" 또는 "상세설명참조"로 기록', ess:true},
        {title:'제조연월일, 유통기한 또는 품질유지기한', placeholder:'ex) 제조연월일, 제조일로부터 ~개월', ess:true},
        {title:'포장단위별 내용물의 용량(중량),수량', placeholder:'ex) 600g, 1개, 해당상품은 중량으로 대체되는 상품입니다', ess:true},
        {title:'원재료명 및 함량(농수산물의 원산지 표시에 관한 법률에 따른 원산지 표시 포함)', placeholder:'ex) 비타민A, ~ 함유', ess:true},
        {title:'영양성분', placeholder:'ex) 1일 섭취량당 함량 : 열량 10kcal, 탄수화물 2g(1%)', ess:true},
        {title:'기능정보', placeholder:'ex) 비타민A : ~기능 유지에 필요', ess:true},
        {title:'섭취량, 섭취방법 및 섭취시 주의사항 및 부작용 가능성', placeholder:'ex) 1일 1', ess:true},
        {title:'질병의 예방 및 치료를 위한 의약품이 아니라는 내용의 표현', placeholder:'ex) 질병의 예방 및 치료를 위한 의약품이 아닙니다', ess:true},
        {title:'유전자변경건강기능식품에 해당하는 경우의 표시', placeholder:'유전자변형 - 유전자변형식품/해당사항없음/유전자변형 포함가능성 있음(포함내역 입력)'},
        {title:'수입식품에 해당하는 경우', placeholder:'수입식품안전관리특별법에 따른 수입신고를 필함'},
        {title:'소비자안전을 위한 주의사항', placeholder:'ex) 방습제는 섭취하지 마세요', ess:true},
        {title:'소비자상담 관련 전화번호', placeholder:'ex) 031-8090-3108', ess:true}
    ]
}

export const Doc = {
    isBigWidth: () => window.innerWidth >= 760
}