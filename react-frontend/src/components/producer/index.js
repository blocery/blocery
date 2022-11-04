import { WebLogin } from './web'
import { WebHome } from './web/home'
import WebShop from './web/shop'
import LocalfoodFarmer from './web/localfoodFarmer'
import { WebGoodsList, WebDirectGoodsReg, WebGoodsSelection, WebDealGoodsReg } from './web/goods'
import {WebFarmDiaryList, WebFarmDiaryReg} from './web/farmDiary'
import WebRegularShopList from './web/regularShop'
import { WebOrderList, WebOrderCancelList, WebSubGroupList } from './web/orderList'
import Order from './web/order'
import { WebCalculateTab, WebCalculateLocal, WebCalculate157Fee } from './web/calculate'
import { WebGoodsQnaList } from './web/goodsQna'
import WebGoodsReviewList from './web/goodsReview'
import { WebNoticeList } from './web/home/noticeList'
import { GiganSalesSttList } from './web/statistics'
import ProducerNotice from "./web/producerNotice";

export {
    WebLogin,
    WebHome,
    WebNoticeList,
    WebGoodsList,
    WebGoodsSelection,
    WebDealGoodsReg,
    WebDirectGoodsReg,
    WebShop,
    LocalfoodFarmer,
    WebFarmDiaryList, WebFarmDiaryReg,   //생산자 재배일지 등록 수정
    WebRegularShopList,
    WebOrderList,
    Order,          //생산자 주문 정보
    WebOrderCancelList,
    WebSubGroupList,
    WebGoodsQnaList,
    WebGoodsReviewList,
    WebCalculateTab,
    WebCalculateLocal,
    WebCalculate157Fee,
    GiganSalesSttList,  //생산자 기간별 판매현황
    ProducerNotice,


}
