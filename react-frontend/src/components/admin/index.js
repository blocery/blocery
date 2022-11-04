import AdminLogin from './AdminLogin'
import {ConsumerList, ConsumerStoppedList, StoppedConsumer, RecommendFriendList, AbuserList} from './consumerList'
import {GoodsStepList} from './goodsStep'
import ProducerList from './producerList'
import ProducerJoinList from './producerJoin'
import ProducerRegRequest from './producerRegRequest'
import {ProducerQnaList, ProducerQnaAnswer} from './producerQnaList'
import {GoodsReviewList} from './goodsReview'
import {GoodsReviewReplyReportList, ReportInfoViewContent} from './goodsReviewReplyReport'
import {BoardReplyReportList, BoardReportList, ProfileReportList, ProfileBlockList, BoardRankingList} from './boardAndReply'
import {OrderList,OrderCardTempList} from './orderList'
import OrderStats from './orderStats'
import GoodsList from './goodsList'
import { DealGoodsList } from './dealGoodsList'
import SetToken from './setToken'
import { TokenSwapInList, TokenSwapOutList, NewTokenSwapDepositList } from './tokenSwapList'
import { DonAirDropList } from './donAirDrop'
import AddAdmin from './addAdmin'
import { ConsumerKycList } from './kyc'
import TransportCompanyList from './transportCompanyList'
import TransportCompanyReg from './transportCompanyReg'
import ItemList from './itemList'
import ItemReg from './itemReg'
import NoticeList from './noticeList'
import NoticeReg from './noticeReg'
import HoliDayList from './holiday'
import {PushNotiList, PushNotiReg} from './pushNotification'
import EventPaymentList from './event'
import B2cHomeSetting from './b2cHomeSetting'
import EventInfoList from './eventList'
import {B2cMdPickList,B2cMdPickReg} from './b2cMdPick'
import {B2cTimeSaleList,B2cTimeSaleReg} from './b2cTimeSale'
import {B2cSuperRewardList,B2cSuperRewardReg} from './b2cSuperReward'
import ProducerFeeRateList from './producerFeeRate'
import BlctStats from './blctStats'
import BlctToWon from './blctToWon'
import BountyEventHistory from './eventBountyHistory'
import {CouponMasterList, ConsumerCouponList} from './coupon'
import {PaymentAll, PaymentProducer, TempProducerList} from './payment'
import { TokenSiseCorrectionList } from './tokenSiseCorrection'
import {GoodsDetailBannerList,GoodsDetailBannerReg} from './goodsDetailBanner'
import {HomeBannerList,HomeBannerReg} from './homeBanner'
import {GoPaxJoinEventList, GoPaxCardEventList} from './goPaxEvent'
import {InviteFriendCountList, InviteFriendList, InviteFriendGoodsList} from './inviteFriend'
import {ProducerCancelReqList} from './producerCancelReqList'
import BoardVote from "~/components/admin/boardVote";
import HashTag from "~/components/admin/hashTag";
import HashTagGroupManager from "~/components/admin/hashTagGroupManager";
import {FaqList} from "~/components/admin/faqList"
import {PointList} from "~/components/admin/point"
import RouletteManage from "~/components/admin/roulette";
import HoliDayList from "./holiday";

export {
    AdminLogin,
    ConsumerList, ConsumerStoppedList, StoppedConsumer, RecommendFriendList, AbuserList,
    GoodsStepList,
    ProducerList,
    ProducerJoinList,
    ProducerRegRequest,
    GoodsReviewList,
    GoodsReviewReplyReportList, ReportInfoViewContent,
    BoardReplyReportList, BoardReportList, ProfileReportList, ProfileBlockList, BoardRankingList,
    ProducerQnaList, ProducerQnaAnswer,
    OrderList, OrderCardTempList,
    OrderStats,
    GoodsList,
    DealGoodsList,
    AddAdmin,
    ConsumerKycList,
    SetToken,
    TokenSwapInList, TokenSwapOutList, NewTokenSwapDepositList,
    DonAirDropList,
    TokenSiseCorrectionList,
    TransportCompanyList,
    TransportCompanyReg,
    ItemList,
    ItemReg,
    NoticeList, NoticeReg,
    PushNotiList, PushNotiReg,
    HoliDayList,
    EventPaymentList,
    B2cHomeSetting,
    EventInfoList,
    B2cMdPickList, B2cMdPickReg,
    ProducerFeeRateList,
    BlctStats,
    BlctToWon,
    B2cTimeSaleList,B2cTimeSaleReg,
    B2cSuperRewardList,B2cSuperRewardReg,
    BountyEventHistory,
    CouponMasterList,
    ConsumerCouponList,
    PaymentAll, PaymentProducer, TempProducerList,
    GoodsDetailBannerList, GoodsDetailBannerReg,
    HomeBannerList, HomeBannerReg,
    GoPaxJoinEventList, GoPaxCardEventList,
    InviteFriendCountList, InviteFriendList, InviteFriendGoodsList,
    ProducerCancelReqList,
    BoardVote,
    HashTag,
    HashTagGroupManager,
    FaqList,
    PointList,
    RouletteManage
}