import React, {Fragment, Component } from 'react'
import {Modal, ModalHeader, ModalBody, ModalFooter, Input, Collapse, Fade} from 'reactstrap';
import { Server } from '~/components/Properties'
import ComUtil from '~/util/ComUtil'
import {getServerToday, getServerTodayTime} from "~/lib/commonApi";
import {checkPassPhrase} from '~/lib/loginApi'
import {
    getGoodsRemainedCheck,
    addOrdersTemp,
    getNotDeliveryZipNo,
    checkSuperRewardOrder,
    getConsumer,
    getSuperRewardTicket
} from '~/lib/shopApi'
import { BLCT_TO_WON, exchangeWon2BLCT } from "~/lib/exchangeApi"
import { getProducerByProducerNo } from '~/lib/producerApi'
import AddressModify from '~/components/shop/mypage/infoManagement/AddressModify'
import { BlockChainSpinner, BlocerySpinner, ShopXButtonNav, ModalWithNav, PassPhrase } from '~/components/common'

import Checkbox from '~/components/common/checkboxes/Checkbox'
import {FaGift, FaCreditCard} from 'react-icons/fa'
import {RiKakaoTalkFill} from 'react-icons/ri'
import {SiNaver} from 'react-icons/si'

import { scOntGetBalanceOfBlct, scOntOrderGoodsBlct } from '~/lib/smartcontractApi'
import {getGoodsByGoodsNo} from '~/lib/goodsApi'

import { ToastContainer, toast } from 'react-toastify'                              //토스트
import 'react-toastify/dist/ReactToastify.css'

import BuyGroup from './BuyGroup'

import BlctPayableCard from './BlctPayableCard'

import {getDeliveryFee} from '~/util/bzLogic'

import { groupBy } from 'lodash'

import {Div, Span, Flex, ShadowBox, Right, Link, Space, Button, GridColumns} from '~/styledComponents/shared'
import Bly from '~/images/icons/ic_blocery.svg'

import {FaCheck} from 'react-icons/fa'
import moment from 'moment-timezone'

import Coupon from './Coupon'

import {initIMPHeadScript} from "~/util/PgUtil";
import {ItemHeader, ItemDefaultBody, EditRow} from './BuyStyle'
import {calcBlyToWon} from "~/lib/exchangeApi";
import BigNumber from "bignumber.js";
import BackNavigation from "~/components/common/navs/BackNavigation";
import {Webview} from "~/lib/webviewApi";
import {HrHeavyX2} from "~/styledComponents/mixedIn";
import {color} from "~/styledComponents/Properties";
import NPay from '~/images/icons/sns/naver-pay.png'
import KakaoPay from '~/images/icons/sns/kakao-pay.png'

import SecureApi from "~/lib/secureApi";

const jejuZipNo = [
    "63002","63003","63004","63005","63006","63007","63008","63009","63010","63011","63012","63013","63014","63015","63016","63017","63018","63019","63020",
    "63021","63022","63023","63024","63025","63026","63027","63028","63029","63030","63031","63032","63033","63034","63035","63036","63037","63038","63039",
    "63040","63041","63042","63043","63044","63045","63046","63047","63048","63049","63050","63051","63052","63053","63054","63055","63056","63057","63058",
    "63059","63060","63061","63062","63063","63064","63065","63066","63067","63068","63069","63070","63071","63072","63073","63074","63075","63076","63077",
    "63078","63079","63080","63081","63082","63083","63084","63085","63086","63087","63088","63089","63090","63091","63092","63093","63094","63095","63096",
    "63097","63098","63099","63100","63101","63102","63103","63104","63105","63106","63107","63108","63109","63110","63111","63112","63113","63114","63115",
    "63116","63117","63118","63119","63120","63121","63122","63123","63124","63125","63126","63127","63128","63129","63130","63131","63132","63133","63134",
    "63135","63136","63137","63138","63139","63140","63141","63142","63143","63144","63145","63146","63147","63148","63149","63150","63151","63152","63153",
    "63154","63155","63156","63157","63158","63159","63160","63161","63162","63163","63164","63165","63166","63167","63168","63169","63170","63171","63172",
    "63173","63174","63175","63176","63177","63178","63179","63180","63181","63182","63183","63184","63185","63186","63187","63188","63189","63190","63191",
    "63192","63193","63194","63195","63196","63197","63198","63199","63200","63201","63202","63203","63204","63205","63206","63207","63208","63209","63210",
    "63211","63212","63213","63214","63215","63216","63217","63218","63219","63220","63221","63222","63223","63224","63225","63226","63227","63228","63229",
    "63230","63231","63232","63233","63234","63235","63236","63237","63238","63239","63240","63241","63242","63243","63244","63245","63246","63247","63248",
    "63249","63250","63251","63252","63253","63254","63255","63256","63257","63258","63259","63260","63261","63262","63263","63264","63265","63266","63267",
    "63268","63269","63270","63271","63272","63273","63274","63275","63276","63277","63278","63279","63280","63281","63282","63283","63284","63285","63286",
    "63287","63288","63289","63290","63291","63292","63293","63294","63295","63296","63297","63298","63299","63300","63301","63302","63303","63304","63305",
    "63306","63307","63308","63309","63310","63311","63312","63313","63314","63315","63316","63317","63318","63319","63320","63321","63322","63323","63324",
    "63325","63326","63327","63328","63329","63330","63331","63332","63333","63334","63335","63336","63337","63338","63339","63340","63341","63342","63343",
    "63344","63345","63346","63347","63348","63349","63350","63351","63352","63353","63354","63355","63356","63357","63358","63359","63360","63361","63362",
    "63363","63364","63500","63501","63502","63503","63504","63505","63506","63507","63508","63509","63510","63511","63512","63513","63514","63515","63516",
    "63517","63518","63519","63520","63521","63522","63523","63524","63525","63526","63527","63528","63529","63530","63531","63532","63533","63534","63535",
    "63536","63537","63538","63539","63540","63541","63542","63543","63544","63545","63546","63547","63548","63549","63550","63551","63552","63553","63554",
    "63555","63556","63557","63558","63559","63560","63561","63562","63563","63564","63565","63566","63567","63568","63569","63570","63571","63572","63573",
    "63574","63575","63576","63577","63578","63579","63580","63581","63582","63583","63584","63585","63586","63587","63588","63589","63590","63591","63592",
    "63593","63594","63595","63596","63597","63598","63599","63600","63601","63602","63603","63604","63605","63606","63607","63608","63609","63610","63611",
    "63612","63613","63614","63615","63616","63617","63618","63619","63620","63621","63622","63623","63624","63625","63626","63627","63628","63629","63630",
    "63631","63632","63633","63634","63635","63636","63637","63638","63639","63640","63641","63642","63643","63644","690-003","690-011","690-012","690-021",
    "690-022","690-029","690-031","690-032","690-041","690-042","690-043","690-050","690-061","690-062","690-071","690-072","690-073","690-081","690-082",
    "690-090","690-100","690-110","690-121","690-122","690-130","690-140","690-150","690-161","690-162","690-163","690-170","690-180","690-191","690-192",
    "690-200","690-210","690-220","690-231","690-232","690-241","690-242","690-600","690-610","690-700","690-701","690-703","690-704","690-705","690-706",
    "690-707","690-708","690-709","690-710","690-711","690-712","690-714","690-715","690-717","690-718","690-719","690-720","690-721","690-722","690-723",
    "690-724","690-725","690-726","690-727","690-728","690-729","690-730","690-731","690-732","690-734","690-735","690-736","690-737","690-738","690-739",
    "690-740","690-741","690-742","690-743","690-744","690-747","690-750","690-751","690-755","690-756","690-760","690-762","690-764","690-765","690-766",
    "690-767","690-769","690-770","690-771","690-772","690-773","690-774","690-775","690-776","690-777","690-778","690-779","690-780","690-781","690-782",
    "690-785","690-786","690-787","690-788","690-789","690-790","690-796","690-800","690-801","690-802","690-803","690-804","690-805","690-806","690-807",
    "690-808","690-809","690-810","690-811","690-812","690-813","690-814","690-815","690-816","690-817","690-818","690-819","690-820","690-821","690-822",
    "690-823","690-824","690-825","690-826","690-827","690-828","690-829","690-830","690-831","690-832","690-833","690-834","690-835","690-836","690-837",
    "690-838","690-839","690-840","690-841","690-842","690-843","690-844","690-846","690-847","690-850","690-851","695-789","695-791","695-792","695-793",
    "695-794","695-795","695-796","695-900","695-901","695-902","695-903","695-904","695-905","695-906","695-907","695-908","695-909","695-910","695-911",
    "695-912","695-913","695-914","695-915","695-916","695-917","695-918","695-919","695-920","695-921","695-922","695-923","695-924","695-925","695-926",
    "695-927","695-928","695-929","695-930","695-931","695-932","695-933","695-934","695-940","695-941","695-942","695-943","695-944","695-945","695-946",
    "695-947","695-948","695-949","695-960","695-961","695-962","695-963","695-964","695-965","695-966","695-967","695-968","695-969","695-970","695-971",
    "695-972","695-973","695-974","695-975","695-976","695-977","695-978","695-979","695-980","695-981","695-982","695-983","697-010","697-011","697-012",
    "697-013","697-014","697-020","697-030","697-040","697-050","697-060","697-070","697-080","697-090","697-100","697-110","697-120","697-130","697-301",
    "697-310","697-320","697-330","697-340","697-350","697-360","697-370","697-380","697-600","697-700","697-701","697-703","697-704","697-705","697-706",
    "697-707","697-805","697-806","697-807","697-808","697-819","697-820","697-821","697-822","697-823","697-824","697-825","697-826","697-827","697-828",
    "697-829","697-830","697-831","697-832","697-833","697-834","697-835","697-836","697-837","697-838","697-839","697-840","697-841","697-842","697-843",
    "697-844","697-845","697-846","697-847","697-848","697-849","697-850","697-851","697-852","697-853","697-854","697-855","697-856","697-857","697-858",
    "697-859","697-860","697-861","697-862","697-863","697-864","699-701","699-702","699-900","699-901","699-902","699-903","699-904","699-905","699-906",
    "699-907","699-908","699-910","699-911","699-912","699-913","699-914","699-915","699-916","699-920","699-921","699-922","699-923","699-924","699-925",
    "699-926","699-930","699-931","699-932","699-933","699-934","699-935","699-936","699-937","699-940","699-941","699-942","699-943","699-944","699-945",
    "699-946","699-947","699-948","699-949"
]

const PaymentButton = ({active, onClick, children}) => {
    return(
        <Flex cursor={1}
              justifyContent={'center'}
              bg={active ? 'white' : 'background'}
              bc={active ? 'green' : 'light'}
              minHeight={60}
              rounded={4}
              onClick={onClick}
              custom={`
                transition: 0.2s;
              `}
        >
            {children}
        </Flex>
    )
}

export default class Buy extends Component {

    constructor(props) {
        super(props);
        this.state = {
            summary: {result:0, sumDeliveryFee:0, sumDirectDeliveryFee:0, sumDirectGoodsPrice:0, sumGoodsPrice:0, sumReservationGoodsPrice:0, sumReservationDeliveryFee:0},
            modal:false,                //모달 여부
            modalType: '',              //모달 종류

            goods: this.props.goods,        //상품 정보 (arrList)

            loginUser: {},                  //로그인 정보
            consumer: this.props.consumer,  //소비자 정보

            tokenBalance: 0,                //소비자 토큰 잔액
            couponBlyAmount: 0,             //쿠폰 BLY

            // 배송지 정보 (일괄적용용)
            msgHidden: true,
            buy: undefined,
            deliveryMsg: '',
            directMsg: '',
            addressIndex: null,
            addressList: [],

            //cardBlct 결제로 추가: 202003
            selectedPayMethod: '',      //'card'  (jaden변경),
            selectedPayPGGubun: '',     //'payco','kakaopay' (david추가 나중에 카카오 페이지 염두...)
            cardBlctUseToken:0 ,  //cardBlct결제시 사용할 BLCT 금액 -> initContract에서 tokenBalance로 세팅.
            payableBlct:0,    //cardBlct결제시 사용가능한 총 BLCT 금액

            //주문그룹 정보 저장
            orderGroup : {
                buyType: this.props.buyType,    //구매타입(direct:즉시구매,cart:장바구니구매)
                consumerNo: 0,          //소비자번호
                orderGoodsNm: '',       //주문명 (상품여러건일경우 ???외?건으로 적용됨)
                totalCurrentPrice: 0,   //총 상품가격
                totalDeliveryFee: 0,    //총 배송비

                totalCouponBly: 0,      //총 쿠폰 사용(BLY)
                totalCouponPrice: 0,    //총 쿠폰사용(원)

                totalOrderPrice: 0,             //총 주문 결제 금액(최종 카드결제금액)
                totalOrderTaxFreePrice: 0,      //총 면세 주문 결제 금액(최종 카드결제금액)
                totalBlctToken: 0,      //총 주문 결제 BCLT Token
                orgTotalOrderPrice: 0,  //총 주문 결제 금액(원래의 총 주문 결제 금액)
                payMethod: 'card'       //결제방법(card,blct) [기본값:카드결제]
            },

            //주문관련 정보 저장 (arrList)
            orders : null,

            //cardBlct Orders...별도 관리
            cardBlctOrderGroup : {
                buyType: this.props.buyType,    //구매타입(direct:즉시구매,cart:장바구니구매)
                consumerNo: 0,          //소비자번호
                orderGoodsNm: '',       //주문명 (상품여러건일경우 ???외?건으로 적용됨)

                totalCurrentPrice: 0,   //총 상품가격
                totalDeliveryFee: 0,    //총 배송비

                totalOrderPrice: 0,             //총 주문 결제 금액
                totalOrderTaxFreePrice: 0,      //총 면세 주문 결제 금액
                totalBlctToken: 0,      //총 주문 결제 BCLT Token
                payMethod: 'card'       //결제방법(card,blct) [기본값:카드결제]
            },

            //주문관련 정보 저장 (arrList)
            cardBlctOrders : null,

            passPhrase: '', //비밀번호 6 자리 PIN CODE
            chainLoading: false,    //블록체인 로딩용
            loading: false,  //스플래시 로딩용
            blctToWon: '',           // BLCT 환율
            error: false,       //card blct 입력시 사용가능 blct를 초과하였는지 여부

            couponInfo:{},      // coupon사용 여부 및 쿠폰 정보

            orderGroupList: null,

            // 선물하기
            gift: false,
            senderName: this.props.consumer.name,
            giftMsg: '감사합니다.',
            giftMsgHidden: true,

            notDelivery: false,         // 배송불가한 도서산간지역
            jejuDelivery: false,        // 제주도 배송(true면 배송비 3000원 추가)
            superRewardTicketNo: null   //슈퍼리워드 티켓 번호
        };

        //사용 blct
        this.useBlct = 0;
    }

    modalToggle = () => {
        this.setState(prevState => ({
            modal: !prevState.modal
        }));
    };

    //react-toastify  usage: this.notify('메세지', toast.success/warn/error);
    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
            //className: ''     //클래스를 넣어도 됩니다
        })
    };


    initContract = async(account, orderGroup, blctToWon) => {
        let {data:balance} = await scOntGetBalanceOfBlct(account);

        const {totalOrderPrice} = orderGroup

        const totalPriceToToken = parseFloat(new BigNumber(totalOrderPrice).div(blctToWon).toNumber().toFixed(3));

        return {
            tokenBalance: balance,
            cardBlctUseToken: balance,
            payableBlct: (totalPriceToToken > balance)? balance : totalPriceToToken
        }
    };

    //1. 상품의 배송비 적용
    setDeliveryFeeByGoodsList = (goodsList) => {

        goodsList.map(goods => {
            const qty = goods.orderCnt, //CartBuy 에서 이미 넘겨줌(주문수량)
                deliveryFee = goods.deliveryFee,
                deliveryQty = goods.deliveryQty,
                termsOfDeliveryFee = goods.termsOfDeliveryFee,
                orderPrice = goods.currentPrice * goods.orderCnt;

            const param = {qty, deliveryFee, deliveryQty, termsOfDeliveryFee, orderPrice}
            goods.deliveryFee = getDeliveryFee(param)
        })

        //console.log({"1. 상품의 배송비 적용":goodsList})
    }

    //2. 상품을 생산자번호로 그룹바이
    getProducerGroupObjByGoodsList = (goodsList) => {

        /*
            {
                11: [{}, {}],
                12: [{}, {}],
            }
         */
        const groupedOrderList = groupBy(goodsList, 'producerNo')

        //console.log({"2. 상품을 생산자번호로 그룹바이":groupedOrderList})

        return groupedOrderList
    }

    //3. 생산자별 정보 추가 및 배열로 변환하여 반환
    getGroupedListByProducerGroupObj = async (producerGroupObj) => {

        const groupedList = []
        const producerNos = Object.keys(producerGroupObj)

        const promiseFuncs = producerNos.map(producerNo => {

            return getProducerByProducerNo(producerNo)

            //const orderList = producerGroupObj[producerNo];
            //console.log({"3. 생산자별 상품":orderList})

        })

        const producers = await Promise.all(promiseFuncs)

        producers.map(({data: producer}) => {

            //생산자별 상품리스트
            const producerGoodsList = producerGroupObj[producer.producerNo]

            //상품리스트로 orderList 생성(+ 기본 배송비 계산)
            const producerOrderList = this.createProducerOrderList(producerGoodsList, producer)

            //생산자별 총 상품가격, 배송비 계산(+ 묶음배송생산자 구분하여 배송비 계산)
            const summary = this.getSummary(producer, producerOrderList)

            //주문정보 생성
            // const orderList = this.createOrderList(goodsList)

            // ComUtil.sortNumber(producerGoodsList, 'directGoods', true)
            producerOrderList.sort(function(x, y) {
                // true values first
                // return (x === y)? 0 : x? -1 : 1;
                // false values first
                return (x.directGoods === y.directGoods)? 0 : x.directGoods? 1 : -1;
            });

            groupedList.push({
                producer: producer,
                summary: summary,
                orderList: producerOrderList
            })
        })

        //console.log({"3. 생산자별 정보 추가 및 배열로 변환하여 반환": groupedList})
        return groupedList
    }



    //상품리스트의 총 상품금액, 총 배송비, 총 결제금액을 반환
    getSummary = (producer, orderList) => {
        console.log({state: this.state})
        const goodsList = this.state.goods

        let sumDirectGoodsPrice = 0,        //즉시상품가격 합계(주의! 묶음배송 상품은 즉시상품만 해당 됩니다)
            sumReservationGoodsPrice = 0,   //예약상품가격 합계
            sumGoodsPrice = 0,              //전체상품가격 합계
            // sumOrgDeliveryFee = 0,          //전체 배송비 합계(할인적용되지 않은 원본)
            // sumDiscountDeliveryFee = 0,     //묶음배송할인 합계

            sumDirectDeliveryFee = 0,       //즉시상품 배송비 합계
            sumReservationDeliveryFee = 0,  //예약상품 배송비 합계
            sumDeliveryFee = 0,             //전체 배송비 합계

            // sumDiscountDeliveryFee = 0,     //묶음배송할인

            result = 0;                     //결제금액

        // sumPrice = 0;                   //총 합계(상품가 + 배송비)

        // let directGoodsIndex = 0;

        let directGoodsCount = 0

        console.log({goodsList})

        orderList.map(order => {

            const goods = goodsList.find(goods => goods.goodsNo === order.goodsNo)

            // //생산자별 즉시상품 개수 체크
            // if(goods.directGoods) directGoodsIndex += 1

            const goodsPrice = goods.currentPrice * goods.orderCnt

            //sumGoodsPrice
            //sumDeliveryFee
            //sumDirectDeliveryFee
            //sumReservationDeliveryFee
            //sumDiscountDeliveryFee

            sumGoodsPrice += goodsPrice                             //상품가격 합계
            sumDeliveryFee += order.deliveryFee                     //전체 배송비 합계(할인적용되지 않은 원본)

            //공동구매 커멘트1: if(goods.directGoods){
            sumDirectGoodsPrice += goodsPrice                   //즉시상품가격 합계
            sumDirectDeliveryFee += order.deliveryFee           //즉시상품 배송비 합계

            directGoodsCount += 1

            //묶음배송 생산자이고 두번째 즉시상품부터는 증가된 배송비 도로 감소시킴
            if(producer.producerWrapDeliver && directGoodsCount > 1){
                // sumDiscountDeliveryFee += cartGoods.deliveryFee
                sumDirectDeliveryFee -= order.deliveryFee
            }
            //공동구매 커멘트2: sumReservation미사용.
            // }else{
            //     sumReservationGoodsPrice += goodsPrice              //예약상품가격 합계
            //     sumReservationDeliveryFee += order.deliveryFee      //예약상품 배송비 합계
            // }
        })


        //묶음 배송 생산자일 경우
        if(producer.producerWrapDeliver){
            const { producerWrapLimitPrice, producerWrapFee } = producer

            if(sumDirectGoodsPrice >= producerWrapLimitPrice){
                //즉시구매 상품이 생산자가 설정한 금액보다 많으면 무료
                sumDirectDeliveryFee = 0
            }else{
                if(sumDirectDeliveryFee > 0){
                    //작으면 생산자가 설정한 배송비 적용
                    sumDirectDeliveryFee = producerWrapFee
                }
            }
            if(this.jejuDelivery) {
                sumDirectDeliveryFee += 3000     // 묶음배송 무료라도 제주도면 추가배송비 적용
            }
        }

        //결제금액 = 상품가 합계 + 배송비 합계 + 제주도 배송시 배송비 추가 - 묶음배송할인
        result = sumGoodsPrice + sumDirectDeliveryFee + sumReservationDeliveryFee

        const res = {
            sumDirectGoodsPrice,
            sumReservationGoodsPrice,
            sumGoodsPrice,

            sumDirectDeliveryFee,
            sumReservationDeliveryFee,
            sumDeliveryFee,

            // sumDiscountDeliveryFee,

            result
        }

        return res
    }



    //1. goodsList 로 orderList 생성(배송비적용해서)
    createProducerOrderList = (goodsList, producer) => {
        // const goodsList = this.state.goods
        const { consumerNo } = this.props.consumer
        const orderList = goodsList.map((goods, idx) => {
            const order = this.getEmptyOrder()
            // 주문상품 INDEX
            // order.idx = idx;

            //옵션상품 여러개구매 여부:(DirectBuy.js에서 세팅)
            if (goods.optionGoodsMulti) {
                console.log("##order.optionGoodsMulti true")
                order.optionGoodsMulti = goods.optionGoodsMulti;
            }

            //상품,생산자,소비자 키 값
            order.goodsNo = goods.goodsNo;
            order.producerNo = goods.producerNo;
            order.consumerNo = consumerNo;

            //상품정보
            order.orderImg = goods.goodsImages[0].imageUrl;
            order.expectShippingStart = goods.expectShippingStart;
            order.expectShippingEnd = goods.expectShippingEnd;

            order.hopeDeliveryFlag = goods.hopeDeliveryFlag;    //소비자가 희망배송일 지정 할 수 있는 상품인지 여부
            order.hopeDeliveryDate = goods.hopeDeliveryDate;    //소비자가 지정한 희망배송일

            order.goodsNm = goods.goodsNm;
            order.packAmount = goods.packAmount;
            order.packCnt = goods.packCnt;
            order.packUnit = goods.packUnit;

            //가격정보
            order.consumerPrice = goods.consumerPrice;  //상품소비자가격
            order.currentPrice = goods.currentPrice;    //상품현재가격
            order.discountRate = goods.discountRate;    //상품현재가격 할인비율

            //과세면세
            order.vatFlag = goods.vatFlag;

            //상품 주문 수량
            order.orderCnt = goods.orderCnt;

            //즉시상품 배송비 (배송정책 적용)
            order.deliveryFee = getDeliveryFee({qty: goods.orderCnt, deliveryFee: goods.deliveryFee, deliveryQty: goods.deliveryQty, termsOfDeliveryFee: goods.termsOfDeliveryFee, orderPrice: goods.currentPrice*goods.orderCnt});

            if(this.jejuDelivery) {
                order.deliveryFee += 3000
            }

            //주문가격
            order.orderPrice = (goods.currentPrice * goods.orderCnt) + order.deliveryFee ;
            order.cardPrice = (goods.currentPrice * goods.orderCnt) + order.deliveryFee ; //202003, blct결제일 경우 0, cardBlct일때는 blctToken제외금액으로 세팅해야함..

            //면세 가격
            order.orderTaxFreePrice = !goods.vatFlag ? order.orderPrice:0;
            order.cardTaxFreePrice = !goods.vatFlag ? order.cardPrice:0;

            //할인가격도 저장을 해야할지????
            //order.discountFee = (orderInfo.consumerPrice * orderInfo.orderCnt) - (orderInfo.currentPrice * orderInfo.orderCnt);

            //주문가격BLCT
            order.blctToken = parseFloat(new BigNumber(order.orderPrice).div(this.blctToWon).toNumber().toFixed(3))
            // alert(':::blctToken is '+order.blctToken + "(didMount 시에 계산될때는 상품가 / 환율)")
            //저장시 포함되지 않는부분
            order.directGoods = goods.directGoods

            //생산자의 즉시상품 묶음배송 여부
            if(producer.producerWrapDeliver && goods.directGoods)
                order.producerWrapDelivered = true
            else{
                order.producerWrapDelivered = false
            }
            return order
        })

        return orderList
    }

    //저장용 주문리스트 생성(즉시상품의 배송비를 조정)
    orderSubGroupNo = (groupedList) => {

        const retOrderList = []
        let idx = 0;

        groupedList.map(({producer, summary, orderList}) => {

            const directOrderList = orderList.filter(order => order.directGoods === true)
            const resvOrderList = orderList.filter(order => order.directGoods === false)

            directOrderList.map((order, index) => {

                idx += 1;

                const _order = Object.assign({}, order)

                _order.idx = idx;

                //배송비 원본저장
                const orgDeliveryFee = _order.deliveryFee

                //묶음배송 생산자일 경우 0번째 초과 상품부터는 모두 배송비 0원으로 처리(묶음 배송으로 할인처리 되어서 한건만 배송비를 부과하기 때문)
                if(producer.producerWrapDeliver && summary.sumDirectDeliveryFee > 0 && index > 0){
                    _order.deliveryFee = 0
                    _order.orderPrice = _order.orderPrice - orgDeliveryFee
                    _order.cardPrice = _order.orderPrice
                    _order.orderTaxFreePrice = !_order.vatFlag?_order.orderPrice:0
                    _order.cardTaxFreePrice = !_order.vatFlag?_order.cardPrice:0
                    _order.blctToken = 0//ComUtil.roundDown(_order.orderPrice / this.blctToWon, 2)
                }
                //묶음배송 무료배송 적용시 모든 배송비 0원 처리
                else if(producer.producerWrapDeliver && summary.sumDirectDeliveryFee <= 0){
                    _order.deliveryFee = 0
                    _order.orderPrice = _order.orderPrice - orgDeliveryFee
                    _order.cardPrice = _order.orderPrice
                    _order.orderTaxFreePrice = !_order.vatFlag?_order.orderPrice:0
                    _order.cardTaxFreePrice = !_order.vatFlag?_order.cardPrice:0
                    _order.blctToken = 0//ComUtil.roundDown(_order.orderPrice / this.blctToWon, 2)
                }

                retOrderList.push(_order)
            })

            resvOrderList.map(order => {

                idx += 1;

                const _order = Object.assign({}, order)

                _order.idx = idx;

                //배송비 원본저장
                _order.orgDeliveryFee = _order.deliveryFee
                retOrderList.push(_order)
            })

        })
        return retOrderList
    }

    async componentDidMount() {

        //console.log("Buy.js - componentDidMount");
        // 외부 스크립트 (jquery,iamport)
        initIMPHeadScript();


        //로그인 체크
        //const loginUser = await getLoginUser();
        //상품상세에서 구매버튼 클릭시체크하도록 변경
        // if (!loginUser) { //미 로그인 시 로그인 창으로 이동.
        //     this.props.history.push('/login');
        // }
        //
        //
        // ({loginUser:loginUser});

        //사용자, 배송지 리스트 세팅
        const {consumer, addressList} = await this.getConsumerInfo();

        let address;
        let addressIndex = 0;

        if(addressList.length > 0) {
            //기본배송지 조회
            const basicAddressIndex = addressList.findIndex(address => address.basicAddress === 1)

            //기본배송지가 있을 때
            if (basicAddressIndex > -1){
                addressIndex = basicAddressIndex
            }
            address = addressList[addressIndex]
        }

        //배송불가 지역 조회, 도서산간지역 배송비 추가여부 조회
        // const {notDelivery, jejuDelivery} =
        if(address)
            await this.searchNotDeliveryZipNo(address.zipNo);

        const {
            //배송지정보 기본세팅
            // consumer: consumerInfo,
            goods,
            orderGroup,
            orders,             //주문리스트(저장용)
            blctToWon,
            orderGroupList,         //생산자별 주문리스트(뷰어용)
        } = await this.search(consumer, this.props.goods);

        // 소비자 스마트컨트랙트 초기 세팅 (BLCT,account...)
        const {
            tokenBalance,
            cardBlctUseToken,
            payableBlct
        } = await this.initContract(consumer.account, orderGroup, blctToWon);

        this.setState({
            gift: this.props.gift,
            consumer: consumer,
            addressList: addressList,
            addressIndex: addressIndex,
            // notDelivery: notDelivery,
            // jejuDelivery: jejuDelivery,
            receiverName : address ? address.receiverName : '',
            receiverPhone : address ? address.phone : '',
            receiverZipNo : address ? address.zipNo : '',
            receiverAddr : address ? address.addr : '',
            receiverRoadAddr : address ? address.roadAddr : '',
            receiverAddrDetail : address ? address.addrDetail : '',

            tokenBalance,
            cardBlctUseToken,
            payableBlct,

            goods: goods,
            orderGroup,
            orders,             //주문리스트(저장용)
            blctToWon,
            orderGroupList,         //생산자별 주문리스트(뷰어용)

        })

        // const addressIndex = this.getBasicAddressIndex();
        // if(addressIndex !== null) { //0 일때도 적용필요해서 if(addressIndex)에서 변경.
        //     this.setState({addressIndex: addressIndex});
        //     const address = this.state.addressList[addressIndex]
        //     this.searchNotDeliveryZipNo(address.zipNo);
        // }
        // this.search();
    }

    search = async (consumer, goods) => {

        //blct 환율
        let {data:blctToWon} = await BLCT_TO_WON();

        this.blctToWon = blctToWon

        // 로그인한 사용자의 consumer 정보
        let consumerInfo = Object.assign({}, consumer);

        // 즉시구매, 장바구니구매 구분, 상품 단건 및 멀티
        let goodsList = Object.assign([], goods);

        console.log("search good", goods, goodsList)

        //1. producerNo 로 그룹바이된 오브젝트
        const producerGroupObj = groupBy(goodsList, 'producerNo')

        //2. 생산자별 정보, summary를 추가하여 배열로 반환
        const orderGroupList = await this.getGroupedListByProducerGroupObj(producerGroupObj)

        console.log({orderGroupList})

        //저장용 주문리스트 생성
        const orderListForSaving = this.createOrderList(orderGroupList)

        console.log({orderListForSaving})

        let g_orderGoodsNm = '';
        let g_totalCurrentPrice = 0;
        let g_totalDeliveryFee = 0;
        //let g_totalDiscountFee = 0;
        let g_totalOrderPrice = 0;
        let g_totalOrderTaxFreePrice = 0;
        let g_totalBlctToken = 0;
        let g_orgTotalOrderPrice = 0;

        //상품정보 주문상세 정보로 초기값 세팅
        if(goodsList.length === 1){
            //g_orderGoodsNm = goodsList[0].goodsNm +' '+ goodsList[0].packAmount +' '+ goodsList[0].packUnit;
        }else{
            //g_orderGoodsNm = goodsList[0].goodsNm +' '+ goodsList[0].packAmount +' '+ goodsList[0].packUnit + ' 외 ' + (goodsList.length - 1) + '건';
        }
        g_orderGoodsNm = goodsList[0].goodsNm;

        orderListForSaving.map(order => {
            // const orderPrice = (order.currentPrice * order.orderCnt)//orderPrice : 상품가격(주문수량*가격) + 배송비
            //총 가격 등 계산 (주문그룹정보)
            g_totalCurrentPrice += order.currentPrice * order.orderCnt;
            g_totalDeliveryFee += order.deliveryFee;
            //g_totalDiscountFee = g_totalDiscountFee + orderInfo.discountFee;
            // g_totalOrderPrice = g_totalOrderPrice + order.orderPrice;
            g_totalOrderPrice += order.orderPrice;//이미 배송비가 계산되어져서 들어있음
            g_totalOrderTaxFreePrice += order.orderTaxFreePrice;//이미 배송비가 계산되어져서 들어있음
            g_orgTotalOrderPrice += order.orderPrice;//이미 배송비가 계산되어져서 들어있음
            // g_totalBlctToken += order.blctToken;
        })


        //orderGroup 가격 등 계산
        let orderGroup = Object.assign({}, this.state.orderGroup);
        orderGroup.consumerNo = consumerInfo.consumerNo;
        orderGroup.orderGoodsNm = g_orderGoodsNm;           //주문명칭
        orderGroup.totalCurrentPrice = g_totalCurrentPrice; //총 상품가격
        orderGroup.totalDeliveryFee = g_totalDeliveryFee;   //총 배송비
        orderGroup.totalOrderPrice = g_totalOrderPrice;     //총 주문 결제 금액
        orderGroup.totalOrderTaxFreePrice = g_totalOrderTaxFreePrice;     //총 면세 주문 결제 금액
        orderGroup.totalBlctToken = g_totalBlctToken;       //총 주문 결제 BCLT Token
        orderGroup.orgTotalOrderPrice = g_orgTotalOrderPrice;     //총 주문 결제 금액

        // console.log({
        //     orderGroup: orderGroup,
        //     // orders: orderList,
        //     orders: orderListForSaving,             //주문리스트(저장용)
        //     blctToWon: blctToWon,
        //     orderGroupList: orderGroupList,         //생산자별 주문리스트(뷰어용)
        // })

        console.log({
            consumer: consumerInfo,
            orderGroup: orderGroup,
            orders: orderListForSaving,
            orderGroupList: orderGroupList
        })

        return {
            //배송지정보 기본세팅
            // consumer: consumerInfo,
            goods: goodsList,
            orderGroup: orderGroup,
            orders: orderListForSaving,             //주문리스트(저장용)
            blctToWon: blctToWon,
            orderGroupList: orderGroupList,         //생산자별 주문리스트(뷰어용)
        }

        this.setState({
            //배송지정보 기본세팅
            consumer: consumerInfo,
            goods: goodsList,
            orderGroup: orderGroup,
            // orders: orderList,
            orders: orderListForSaving,             //주문리스트(저장용)

            blctToWon: blctToWon,
            //addressIndex: addressIndex,  //기본 배송지

            orderGroupList: orderGroupList,         //생산자별 주문리스트(뷰어용)
            // groupedList: groupedList
        }, ()=>{
            // // 소비자 스마트컨트랙트 초기 세팅 (BLCT,account...)
            // this.initContract();
        });
    }

    getEmptyOrder = () => {
        return {
            consumerNo: 0,

            consumerPrice: 0,
            currentPrice: 0,
            discountRate: 0,
            orderCnt: 1,
            deliveryFee: 0,
            orderPrice: 0,    //주문가격=((상품가격*주문수량)+배송비)
            cardPrice: 0,     //202003추가  card로 결제하는 금액..

            //blct토큰
            blctToken:0,

            orderDate:null,

            //Goods에서 copy항목
            producerNo: 0,
            goodsNo: 0,
            goodsNm:null,
            expectShippingStart:null,
            expectShippingEnd:null,
            packUnit:null,
            packAmount:0,
            packCnt:0,

            //Consumer에서 copy
            consumerAddresses: [],
            receiverName: '',
            receiverPhone: '',
            receiverZipNo: '',
            receiverAddr: '',
            receiverRoadAddr: '',
            receiverAddrDetail: '',

            //배송메시지
            msgHidden: true,
            deliveryMsg: '',
            directMsg: '',

            //옵션상품관련 추가
            optionGoodsMulti:false,
        }
    }

    //기본 배송지 조회
    getBasicAddressIndex = () => {
        if(this.state.addressList && this.state.addressList.length > 0){
            return this.state.addressList.findIndex(address => address.basicAddress === 1)
        }
        return null;
    }

    getConsumerInfo = async () => {
        let {data:consumer} = await getConsumer();

        return {
            consumer: consumer,
            addressList: consumer.consumerAddresses ? consumer.consumerAddresses : []
        }
    }

    //array의 첫번째 이미지 썸네일 url 리턴
    getFirstImageUrl = (goodsImages) => {
        if (!goodsImages)
            return '';

        let image = goodsImages.filter((v, idx) => { return idx === 0;}); //첫번째 이미지
        if (image.length === 1) {
            return Server.getThumbnailURL() + image[0].imageUrl;
        }
        return '';
    };

    //결제방법
    onPayMethodChange = (payMethod, payPGGubun) => {
        this.setState({
            selectedPayMethod: payMethod, //orderGroup.payMethod, //card,blct,'cardBlct'
            selectedPayPGGubun: payPGGubun||'card'
        });
    };

    //주문상세의 bly 계산 후 적용
    setOrders = ({orgTotalOrderPrice, totalBlctToken, totalOrderPrice, payMethod, totalCouponBly}) => {

        const orders = Object.assign([], this.state.orders)
        // const {
        //     totalOrderPrice,    //총 주문결제금액 (상품금액 + 배송비)
        // } = this.state.orderGroup

        const blctToWon = this.state.blctToWon

        const lastIndex = orders.length -1;

        let errorWon = 0;   //bly 와 카드결제금액을 했을때 상품가와의 오차

        let sumCardPrice = 0;

        //상품별 블리 비율에 맞게 배분
        orders.map((order, index) => {
            const rate = (order.orderPrice / orgTotalOrderPrice)      //상품별 금액 비율

            const blctToken = ComUtil.roundDown(totalBlctToken * rate, 2)                     //상품별 bly

            const exchangedWon = blctToken * blctToWon      //bly * 환율
            const cardPriceRate = 1 - ((exchangedWon) / order.orderPrice)

            //소수점 절삭
            const cardPrice = ComUtil.roundDown(order.orderPrice * cardPriceRate, 0)


            // console.log(":::orderPrice "+order.orderPrice)
            // console.log(":::cardPriceRate "+cardPriceRate)
            // console.log(":::cardPrice "+ order.orderPrice * cardPriceRate)
            // console.log(":::cardPrice roundDown "+ComUtil.roundDown(order.orderPrice * cardPriceRate, 0))

            order.blctToken = blctToken + this.state.couponBlyAmount //tokenHistory에 쿠폰 사용 금액까지 bly사용 금액으로 표시됨

            if(order.blctToken === 0 && totalCouponBly > 0) {
                order.blctToken = totalCouponBly
            }
            //exchangedWon = order.blctToken * blctToWon      //20210401

            order.cardPrice = cardPrice
            order.payMethod = payMethod

            //오차를 구하기 위해 주문상세의 결제금액을 합산
            sumCardPrice += cardPrice

            //마지막 상품에 오차금액을 넣어 줍니다(총 카드결제금액과 상품별 결제금액 합이 일치하도록)
            if (lastIndex === index) {
                const errorWon = totalOrderPrice - sumCardPrice
                //console.log(":::errorWon "+errorWon)
                //Jaden 20.4.16 roundDown 추가
                order.cardPrice = ComUtil.roundDown(order.cardPrice + errorWon, 0)
            }
            if(!order.vatFlag){
                order.cardTaxFreePrice = order.cardPrice;
            }
            // const payingBlctWon = blctToken * blctToWon


            //bly 를 사용해 결제되는 금액이 상품가(배송비포함)보다 50%를 초과하면
            //if (ComUtil.roundDown(exchangedWon, 0) > (order.orderPrice / 2)){
            if (ComUtil.roundDown( order.blctToken * blctToWon  , 0) > (order.orderPrice / 2)){ //20210401
                order.cardBlctTokenMore = true
            }else{
                order.cardBlctTokenMore = false
            }
        })

        let testNum = 0
        orders.map(order => {
            testNum += order.cardPrice
        })

        //에러 검증 (총 카드결제금액인 totalOrerPrice 와 orderrDetail 의 카드결제금액이 일치해야 부분취소가 됩니다)
        // console.log(`총 카드결제금액은 ${totalOrderPrice} 이고 주문상세의 총 결제금액은 ${testNum} 이므로 ${totalOrderPrice === sumCardPrice ? '정상' : '"에러"'} 입니다`)

        //console.log({":::orders":orders})

        this.setState({
            orders: orders
        })


        // console.log({orders})
    }

    // getTotalOrderPrice = () => {
    //     let totalOrderPrice = 0
    //     this.state.orders.map(order => totalOrderPrice += order.currentPrice)
    //     return totalOrderPrice
    // }

    // onCardBlctUseTokenChangeByCoupon = ({payableBlct, couponInfo}) => {
    //     console.log({payableBlct, couponInfo})
    //
    // }


    calcTotalOrderPrice = (totalBlctToken) => {

        const {
            totalCouponPrice,
            orgTotalOrderPrice
        } = this.state.orderGroup

        // 총 결제금액 =  상품가(배송비포함) - (사용한 BLY * 환율) - 사용한 쿠폰(원)
        let totalOrderPrice = orgTotalOrderPrice - (totalBlctToken * this.state.blctToWon) - totalCouponPrice

        let payMethod = 'card'

        //1원 미만일 경우 0으로 처리함
        if (totalOrderPrice < 1) {
            totalOrderPrice = 0
            payMethod = 'blct'
        }else if (totalBlctToken > 0 || totalCouponPrice > 0) {
            payMethod = 'cardBlct'
        }

        const newOrderGroup = Object.assign({}, this.state.orderGroup)

        newOrderGroup.payMethod = payMethod
        newOrderGroup.totalBlctToken = totalBlctToken   //= ComUtil.roundDown(totalBlctToken, 2)
        newOrderGroup.totalOrderPrice = totalOrderPrice //ComUtil.roundDown(totalOrderPrice, 0)

        //console.log({orderGroup:newOrderGroup})

        // console.log({blctToWon: this.state.blctToWon, orgTotalOrderPrice, totalBlctToken, totalOrderPrice, newOrderGroup, totalCouponPrice})

        this.setState({
            orderGroup: newOrderGroup
        })

        //주문상세의 bly 계산 후 적용
        this.setOrders({...newOrderGroup})
    }

    //cardBlct결제시 cardBlctUseToken텍스트 입력값..
    onCardBlctUseTokenChange = ({value, error}) => {
        const totalBlctToken = ComUtil.roundDown(new BigNumber(value || 0).toNumber(), 3);
        this.useBlct = totalBlctToken
        this.calcTotalOrderPrice(totalBlctToken)
    }

    // 배송지 정보 수정 버튼 클릭 [전체]
    stdDeliveryUpdAddressClick = () => {
        this.setState({
            modalType: 'stdDelivery'
        });
        this.modalToggle();
    };

    // 배송지 정보 수정 화면에서 수정된 내용 callback으로 받아옴 [전체]
    stdDeliveryCallback = (data, type) => {

        this.getConsumerInfo()

        if(data){
            let receiverName = data.receiverName;
            let receiverPhone = data.phone;
            let receiverZipNo = data.zipNo;
            let receiverAddr = data.addr;
            let receiverRoadAddr = data.roadAddr;
            let receiverAddrDetail = data.addrDetail;

            let orderList = Object.assign([], this.state.orders);
            orderList.map((order) => {
                order.receiverName = receiverName;
                order.receiverPhone = receiverPhone;
                order.receiverZipNo = receiverZipNo;
                order.receiverAddr = receiverAddr;
                order.receiverRoadAddr = receiverRoadAddr;
                order.receiverAddrDetail = receiverAddrDetail;
            });

            this.setState({
                receiverName : data.receiverName,
                receiverPhone : data.phone,
                receiverZipNo : data.zipNo,
                receiverAddr : data.addr,
                receiverRoadAddr : data.roadAddr,
                receiverAddrDetail : data.addrDetail,
                orders: orderList
            })
        }

        this.modalToggle()
    };

    // 배송지정보 변경
    deliveryAddressChange = async (e) => {
        const index = e.target.value
        const receiverInfo = this.state.addressList[index];
        await this.searchNotDeliveryZipNo(receiverInfo.zipNo);

        console.log({consumer: this.state.consumer, goods: this.state.goods})

        const {
            goods,
            orderGroup,
            orders,             //주문리스트(저장용)
            blctToWon,
            orderGroupList      //생산자별 주문리스트(뷰어용)
        } = await this.search(this.state.consumer, this.state.goods);

        let payableBlct = this.state.payableBlct
        let totalPriceToToken = parseFloat(new BigNumber(orderGroup.totalOrderPrice).div(blctToWon).toNumber().toFixed(3));
        payableBlct = totalPriceToToken > this.state.blctBalance ? this.state.blctBalance : totalPriceToToken

        //사용한 bly 기억(위에서 search 했을때 0으로 초기화 되기 때문)
        const totalBlctToken =  this.state.orderGroup.totalBlctToken;

        this.setState({
            addressIndex: index,
            receiverName: receiverInfo.receiverName,
            receiverAddr: receiverInfo.addr,
            receiverRoadAddr: receiverInfo.roadAddr,
            receiverAddrDetail: receiverInfo.addrDetail,
            receiverZipNo: receiverInfo.zipNo,
            receiverPhone: receiverInfo.phone,

            payableBlct,

            goods,
            orderGroup,
            orders,             //주문리스트(저장용)
            blctToWon,
            orderGroupList      //생산자별 주문리스트(뷰어용)
            // notDelivery: notDelivery,
            // jejuDelivery: jejuDelivery
        }, () => {
            //setState 가 반영되고 난 뒤 쿠폰 이벤트를 한번더 실행하여 payableBlct , useBlct 를 다시 계산 하도록 함.
            if(goods.length === 1) {
                this.onCouponChange(this.state.couponInfo)
            }else {
                this.calcTotalOrderPrice(totalBlctToken) //사용한 bly로 card, cardBlct, blct 인지 계산
            }
        })
    }

    //배송 메세지 변경 [전체]
    stdOnMsgChange = (e) => {
        if (e.target.value == 'direct') {
            let orderList = Object.assign([], this.state.orders);
            orderList.map((order) => {
                order.msgHidden = false;
            });
            this.setState({
                msgHidden: false,
                deliveryMsg: '',
                orders:orderList
            })
        } else if(e.target.value === ''){
            let orderList = Object.assign([], this.state.orders);
            orderList.map((order) => {
                order.msgHidden = true;
                order.deliveryMsg = '';
            });
            this.setState({
                msgHidden: true,
                deliveryMsg: '',
                orders:orderList
            })
        } else {
            let orderList = Object.assign([], this.state.orders);
            orderList.map((order) => {
                order.msgHidden = true;
                order.deliveryMsg = e.target.selectedOptions[0].label;
            });
            this.setState({
                msgHidden: true,
                deliveryMsg: e.target.selectedOptions[0].label,
                orders:orderList
            })
        }
    };

    //배송 메시지 직접 입력시 [전체]
    stdDirectChange = (e) => {
        let orderList = Object.assign([], this.state.orders);
        orderList.map((order) => {
            order.deliveryMsg = e.target.value
        });
        this.setState({
            deliveryMsg: e.target.value,
            orders: orderList
        });
    };

    // 보내는 사람 이름 변경
    senderChange = (e) => {
        this.setState({
            senderName: e.target.value
        })
    }

    //6자리 인증 비번 PassPhrase(6 CHAR PIN CODE)
    onPassPhrase = (passPhrase) => {
        //console.log(passPhrase);
        this.setState({
            passPhrase: passPhrase,
            clearPassPhrase:false
        });
    };

    // 결제 비밀번호 힌트
    findPassPhrase = () => {
        this.setState({
            modalType: 'passPhrase',
            modal: true
        })
    }

    // 마이페이지로 이동
    moveToMypage = () => {
        window.location = '/mypage'
    }

    // 필수정보 validation check
    checkValidation = async () => {


        const arrGoods = []

        const promises = this.props.goods.map(goods => getGoodsByGoodsNo(goods.goodsNo).then(({data}) => data))

        const dbGoodsList = await Promise.all(promises)

        //console.log(dbGoodsList)

        //슈퍼리워드 상품
        const superRewardGoodsList = []

        //슈퍼리워드 기간상품
        const overCntSuperRewardGoodsList = []

        //슈퍼리워드 예정상품
        const befSuperRewardGoodsList = []

        dbGoodsList.map(async dbGoods => {


            arrGoods.push({goodsNo: dbGoods.goodsNo})

            //슈퍼리워드 기간인 상품인지
            if (dbGoods.superReward && dbGoods.inSuperRewardPeriod) {

                //슈퍼리워드 상품 담기
                superRewardGoodsList.push(dbGoods)

                //구매수량 한건이상인 상품찾아서
                const goods = this.props.goods.find(goods => goods.goodsNo === dbGoods.goodsNo && goods.orderCnt > 1)

                if (goods) {

                    //담기
                    overCntSuperRewardGoodsList.push(goods)
                }
            }

            //슈퍼리워드 기간을 앞둔 상품인지
            if(dbGoods.superRewardStart && moment().isBefore(dbGoods.superRewardStart)){
                befSuperRewardGoodsList.push(dbGoods)
            }
        })

        if (overCntSuperRewardGoodsList.length > 0) {
            alert(`[${overCntSuperRewardGoodsList[0].goodsNm}] 슈퍼리워드 상품은 1개 수량만 구입가능 합니다. 장바구니에서 수량 조정후 다시 결제를 진행해 주세요.`)
            return false
        }


        // 같은 슈퍼리워드 상품을 이미 주문했는지 체크
        const params = {
            goodsInfo: arrGoods
        }

        const {data} = await checkSuperRewardOrder(params)
        //

        const {code, message} = data

        if (code < 0) {
            alert(message)
            return false
        }

        const {payMethod, totalOrderPrice} = this.state.orderGroup

        const selectedAddress = this.state.addressList[this.state.addressIndex]

        //배송정보 주소, 받는사람
        if (this.state.addressIndex === null || !selectedAddress) {
            alert('배송지 정보를 입력해주세요');
            return false;
        }else if(!selectedAddress.receiverName){
            alert('배송지 정보의 연락처(전화번호)를 입력해 주세요');
            return false;
        }
        //배송정보 연락처
        else if (!selectedAddress.phone) {
            alert('배송지 정보의 연락처(전화번호)를 입력해 주세요');
            return false;
        }else if (!selectedAddress.addr) {
            alert('배송지 정보의 주소를 입력해 주세요');
            return false;
        }


        const hopeDeliveryOrders = this.state.orders.filter(order => {
            if(order.hopeDeliveryFlag === true && !order.hopeDeliveryDate)
                return order;
        })

        if (hopeDeliveryOrders.length > 0) {
            alert('희망수령일을 지정해주세요');
            return false;
        }


        if (totalOrderPrice > 0 && !this.state.selectedPayMethod) {
            alert('결제방법을 선택해 주세요')
            return false;
        }
        //2021.03.24 Jaden 100원 이상 밸리데이션 체크 하지 않도록 변경
        else if (totalOrderPrice > 0 && totalOrderPrice < 100) {
            alert('최소 결제금액은 100원 이상이어야 합니다')
            return false;
        }
        else if(this.notDelivery){
            alert('해당 배송지는 도서산간지역으로 배송 서비스를 하지 않습니다. 다른 배송지를 선택해주세요.')
            return false;
        }

        //슈퍼리워드 상품 시작전이면 미리 물어보기
        if (befSuperRewardGoodsList.length > 0) {
            if (befSuperRewardGoodsList.length === 1) {
                if (!window.confirm(`[${befSuperRewardGoodsList[0].goodsNm}] 상품은 슈퍼리워드 시작 전입니다. 슈퍼리워드 혜택 없이 바로 구매하시겠습니까?`)){
                    return false
                }
            }else{
                if (!window.confirm(`[${befSuperRewardGoodsList[0].goodsNm}] 상품 외 ${befSuperRewardGoodsList.length -1} 건은 슈퍼리워드 시작 전입니다. 슈퍼리워드 혜택 없이 바로 구매하시겠습니까?`)){
                    return false
                }
            }
        }

        if(superRewardGoodsList.length > 0) {

            let superRewardTicketNo = this.state.superRewardTicketNo

            let dbSuperRewardGoods = superRewardGoodsList[0]

            if(superRewardTicketNo === null) {

                //내 티켓번호 확인
                const {data:myTicketNo} = await getSuperRewardTicket(dbSuperRewardGoods.goodsNo)

                //0 은 티켓번호가 아니라 슈퍼리워드 기간 전 후에 해당하는 것이라서 무조건 사져야 함
                if(myTicketNo > 0) {

                    superRewardTicketNo = myTicketNo

                    this.setState({
                        superRewardTicketNo: superRewardTicketNo
                    })
                }
            }

            //console.log('내 티켓번호 '+superRewardTicketNo)
            //alert('내 티켓번호:'+ myTicketNo); //TODO delete alert
            if(superRewardTicketNo !== null) {
                if (superRewardTicketNo > dbSuperRewardGoods.superRewardTotalCount) { //////여유 5개 줌.. => 0으로, 여유는 백엔드에서
                    alert(`준비된 수량이 모두 결제진행 중입니다. 잠시 후 다시 진행해 주세요.`)
                    return
                }
            }
        }
        return true;
    };

    // 상품 재고수량 DB 체크
    checkGoodsRemainedCount = async (orderList) => {
        const noRemainedGoodsList = []
        const promises = orderList.map(order => getGoodsRemainedCheck(order).then((res) => {
            if (res.data === 0) {
                noRemainedGoodsList.push(order)
            }
        }))

        await Promise.all(promises)

        //console.log({noRemainedGoodsList, orderList})

        if (noRemainedGoodsList.length > 0){
            alert(`죄송합니다. [${noRemainedGoodsList[0].goodsNm}] 상품이 품절 되었습니다.`)
            return false
        }

        return true
    }

    // 상품 주문가능 날짜 체크
    checkGoodsOrderDate = (orderList) => {

        const endGoodsList = []
        const saleStoppedList = []

        const goodsList = this.state.goods

        orderList.map(order => {
            const goods = goodsList.find(goods => goods.goodsNo === order.goodsNo)
            if (goods) {
                //판매일자가 지난것
                if (goods.saleEnd < order.orderDate) {
                    endGoodsList.push(goods)
                }
                //판매중지 된것
                if(goods.saleStopped || goods.salePaused){
                    saleStoppedList.push(goods)
                }
            }
        })

        if (endGoodsList.length > 0) {
            alert(`[${endGoodsList[0].goodsNm}] 상품의 주문가능 날짜가 지났습니다.`)
            return false
        }
        if(saleStoppedList.length > 0) {
            alert(`[${saleStoppedList[0].goodsNm}] 상품은 현재 판매중인 상품이 아닙니다.`)
            return false
        }
        return true
    }

    //주문수량 goods잔여 물량등 check
    orderValidate = async (orderGroup, orderList) => {

        // 상품 재고 체크
        const isRemained = await this.checkGoodsRemainedCount(orderList)

        if (!isRemained) {
            return false
        }

        // 상품 주문가능 날짜 체크
        if(!this.checkGoodsOrderDate(orderList)) {
            return false
        }

        this.setState({
            orders: orderList
        });

        let payMethod = orderGroup.payMethod;

        if(payMethod === "blct"){
            //balance추가체크
            let {data:balance} = await scOntGetBalanceOfBlct(this.state.consumer.account);
            let payBlctBalance = ComUtil.toNum(balance);

            const blctOrderPrice = await exchangeWon2BLCT(orderGroup.totalOrderPrice);
            const payBlct = ComUtil.toNum(blctOrderPrice);
            if(payBlctBalance <= 0){
                this.notify('보유한 BLY가 0입니다.', toast.warn);
                this.setState({modal:false})
                return false;
            }
            if(payBlctBalance < payBlct){
                this.notify('보유한 BLY가 구매하기에 부족합니다.', toast.warn);
                this.setState({modal:false})
                return false;
            }


        }
        else if (payMethod === "cardBlct"){

            //balance추가체크
            let {data:balance} = await scOntGetBalanceOfBlct(this.state.consumer.account);
            let payBlctBalance = ComUtil.toNum(balance);

            if (payBlctBalance < this.state.cardBlctUseToken) {
                alert('보유한 BLY 금액이 부족합니다.')
                this.setState({modal:false})
                return false;
            }

            //cardPayAmount A1.
            let cardPayAmount = this.state.orders[0].cardPrice //cardBlctOrders[0].cardPrice; // - this.state.blctToWon * this.state.cardBlctUseToken;

            //console.log('cardPayAmount A1 cardPayAmount', cardPayAmount );

            if (cardPayAmount <= 0) {

                alert('카드 결제금액이 존재해야 합니다')
                this.setState({modal:false})
                return false;
            }
            //cardBlctUseToken amount
            if(orderList[0].usedCouponNo === null || orderList[0].usedCouponNo === 0) {
                if (this.state.cardBlctUseToken <= 0) {

                    alert('BLCT 결제금액이 존재해야 합니다')
                    this.setState({modal:false})
                    return false;
                }
            }

        }
        return true;
    };

    //결제버튼 클릭시
    onBuyClick = async () => {
        // const {data:loginUser} = await getConsumer();

        // 어뷰저 체크
        if (await ComUtil.isBlockedAbuser()) {
            return
        }

        //마이너스, 1블리 이상 체크
        if(this.useBlct < 0 || (this.useBlct > 0 && this.useBlct < 1)) {
            alert('최소 1BLY 이상 사용 가능합니다.')
            return
        }

        //배송지정보 받는사람, 연락처, 주소, 주소상세 미입력시 중단
        if (!await this.checkValidation()) {
            return;
        }

        let goodsList = Object.assign([], this.state.goods);

        // 서버시간 가져오기
        let { data:serverTodayTime } = await getServerTodayTime();
        let orderDate = ComUtil.getNow(serverTodayTime);    //주문일자생성
        let couponInfo = Object.assign({}, this.state.couponInfo);

        //console.log(couponInfo)

        //orderGroup과 orderList 세팅..
        // let orderGroup = Object.assign({}, (this.state.selectedPayMethod==='cardBlct')? this.state.cardBlctOrderGroup : this.state.orderGroup);
        let orderGroup = Object.assign({}, this.state.orderGroup);
        let orderList = Object.assign([], this.state.orders);

        orderGroup.orderDate = orderDate;

        orderList.map((orderDetail,idx) => {

            //주문정보의 상품정보 가져오가
            let goods = goodsList.find(items => items.goodsNo === orderDetail.goodsNo);

            orderDetail.orderDate = orderDate;     //주문일자생성
            orderDetail.directGoods = goods.directGoods;

            //배송지정보 동기화
            const address = this.state.addressList[this.state.addressIndex]

            orderDetail.receiverName =  address.receiverName
            orderDetail.receiverAddr = address.addr
            orderDetail.receiverRoadAddr = address.roadAddr
            orderDetail.receiverAddrDetail = address.addrDetail
            orderDetail.receiverZipNo = address.zipNo
            orderDetail.receiverPhone = address.phone//this.state.receiverPhone

            // 선물하기 여부 저장
            orderDetail.gift = this.state.gift
            orderDetail.senderName = this.state.senderName
            orderDetail.giftMsg = this.state.giftMsg

            // 쿠폰 사용시 쿠폰정보 저장
            orderDetail.usedCouponNo = couponInfo.value
            orderDetail.usedCouponBlyAmount = couponInfo.blyAmount
        });

        // 주문 이상없는지 check
        // 재고수량 체크, 상품의 주문가능 날짜 체크, BLCT 체크
        let validate = await this.orderValidate(orderGroup, orderList);
        if (!validate) return;

        //TODO ::: 테스트 후 삭제 요망 ==================================
        // console.log(":::저장 전 마지막 값",{
        //     blctToken: orderList[0].blctToken,
        //     cardPrice: orderList[0].cardPrice,
        //     usedCouponBlyAmount: orderList[0].usedCouponBlyAmount,
        // })
        //TODO ::: 여기까지 ==================================

        let payMethod = orderGroup.payMethod;

        // PG - 신용카드 구매일경우 결제비번 없이 구매
        if(payMethod === "card" || payMethod === "cardBlct" ){

            this.setState({
                buyingOrderGroup: orderGroup,
                buyingOrders: orderList
            }, () => {

                //console.log({orderList: JSON.stringify(orderList)})
                this.modalToggleOk();
            });
        }
        // BLCT 토큰 구매일경우 결제비번 구매
        if(payMethod === "blct"){

            this.setState({
                buyingOrderGroup: orderGroup,
                buyingOrders: orderList,
                modal:true, //결제비번창 오픈. //////////////////////////
                modalType: 'pay'
            });

            // 결재처리 : modalToggleOk로 소스 이동
        }

    };

    getScheduleAtTime = (dealEndDate) => {

        let scheduleAtTime;

        // if (Server._serverMode() === 'stage') {  //단위test용 1시간 후, 전체 테스트일때는 아래 else 사용필요.
        //     const date = new Date();
        //     const year = date.getFullYear();
        //     const month = date.getMonth();
        //     const day = date.getDate();
        //     const hour = date.getHours();
        //     const scheduleDate = new Date(year, month, day, hour + 1, 0, 0);
        //     scheduleAtTime = ComUtil.utcToString(scheduleDate, "yyyyMMDDHHmm").toString();
        //
        // }
        // else //production or 전체테스트:  deal마감일 다음날 10시, 8/1일 deal마감이면 8/2일 11시.
        {
            // dealEndDate=yyyymmdd
            let endMoment = ComUtil.intToDateMoment(dealEndDate);
            endMoment.add(1,'d');
            endMoment.add(10,'h');

            scheduleAtTime = endMoment.format('yyyyMMDDHHmm');
        }

        // console.log("scheduleAtTime===",scheduleAtTime)
        return scheduleAtTime
    }

    //결재처리
    modalToggleOk = async () => {

        let goodsList = Object.assign([], this.state.goods);

        //최종 구매 orderGroup & orderList
        let buyingOrderGroup = Object.assign({}, this.state.buyingOrderGroup);
        let buyingOrderList = Object.assign([], this.state.buyingOrders);

        //console.log({buyingOrderList: JSON.stringify(buyingOrderList)})

        //console.log(buyingOrderList)

        let { payMethod } = buyingOrderGroup;
        // if ( this.state.selectedPayMethod != buyingOrderGroup.payMethod){
        //     console.log('결제방법 선택오류');
        // };

        // BLCT 토큰 구매일경우 결제비번 구매
        if(payMethod === "blct") {

            //비밀번호 6 자리 PIN CODE
            let passPhrase = this.state.passPhrase;
            let {data: checkResult} = await checkPassPhrase(passPhrase);
            if (!checkResult) {
                this.notify('결제 비번이 틀렸습니다.', toast.warn);

                //결제 비번 초기화
                this.setState({clearPassPhrase: true});

                return; //결제 비번 오류, stop&stay
            }

            //결제비번 맞으면 일단 modal off - 여러번 구매를 방지.
            this.setState({
                modal: false
            });
        }

        // 주문결제전 상품 재고 검사
        // 상품 리스트의 현 재고량을 가져옴
        let remain_chk = true;
        let errGoodsNm = '';
        let await_result_orderList = buyingOrderList.map( async(order) => {

            //주문정보의 상품정보 가져오기
            let goods = goodsList.find(item => item.goodsNo === order.goodsNo);
            order.chk_remainedCnt_msg = '';

            //주문상품 재고수량 체크
            let goodsRemainCnt = await getGoodsRemainedCheck(order);
            if (goodsRemainCnt <= 0){ //마이너스도 발생가능할 듯.
                order.chk_remainedCnt_msg = '재고수량이 부족합니다!';
                remain_chk = false;
                errGoodsNm = goods.goodsNm;
            }else {
                goods.remainedCnt = goodsRemainCnt;  //새로받은 remainedCnt
            }

        });
        //재고수량이 부족할경우 상품정보 재고수량부족 메시지 랜더링(재고수량업데이트)
        await Promise.all(await_result_orderList)
        this.setState({
            goods: goodsList,
            orders: buyingOrderList
        });

        if (remain_chk === false) {
            this.notify('['+ errGoodsNm + '] 상품의 재고가 부족합니다.', toast.error);
        }
        if(remain_chk === true){

            this.notify('주문결제진행', toast.info);

            //1. 결제방법 BLCT 구매일경우 PG 모듈 X
            //2. 결재방법 신용카드일경우 PG 모듈 O

            // let payMethod = buyingOrderGroup.payMethod;


            //cardBlct 단건주문 중 Blct부분 처리
            if (payMethod === "cardBlct") {
                //주문가격BLCT 최종 설정- cardBlct는 항상 1건임. 202003
                buyingOrderGroup.totalBlctToken = parseFloat(ComUtil.roundDown(new BigNumber(buyingOrderGroup.totalBlctToken).toNumber(),2));
                buyingOrderList.map( (order) => {
                    if(order.blctToken > 0) {
                        order.blctToken = parseFloat(ComUtil.roundDown(new BigNumber(order.blctToken).toNumber(),2));
                    }
                });
                //카드먼저 처리하고 잘되면, Blct처리하기.
                this.payPgOpen(buyingOrderGroup, buyingOrderList, true);
            }

            // PG - 신용카드 구매일경우
            if(payMethod === "card" ){
                // PG - 주문결제
                this.payPgOpen(buyingOrderGroup, buyingOrderList, false);
            }

            // BLCT 토큰 구매일경우
            if(payMethod === "blct"){

                buyingOrderGroup.payStatus ="ready";             //주문정보 미결제상태 세팅
                buyingOrderGroup.totalBlctToken = parseFloat(new BigNumber(buyingOrderGroup.totalBlctToken).toNumber().toFixed(2));
                buyingOrderList.map( (order) => {
                    order.payStatus = "ready";              //주문정보 미결제상태 세팅
                    order.blctToken = parseFloat(new BigNumber(order.blctToken).toNumber().toFixed(2));
                });

                // 주문그룹 및 주문정보 임시 저장 [tempOrderGroup,tempOrder]
                let ordersParams = {
                    orderGroup : buyingOrderGroup,
                    orderDetailList: buyingOrderList
                };


                let {data:returnedOrders} = await addOrdersTemp(ordersParams);
                if(returnedOrders === null){
                    alert("주문을 다시 시도해주세요.")
                    this.props.history.goBack();
                    return;
                }else {
                    let {orderGroup: tmp_OrderGroup, orderSubGroupList:tmp_OrderSubGroup, orderDetailList: tmp_OrderList} = returnedOrders;

                    // 임시 주문리스트 블록체인 기록후 정상적이면 실제 주문리스트로 등록
                    // 블록체인 까지 정상적으로 갔을 경우 실제 주문 저장
                    await this.buyBLCTGoods(tmp_OrderGroup, tmp_OrderSubGroup, tmp_OrderList);
                }
                /** Backend에서 add Order 아래 2가지를 한꺼번에 하는 방법
                 1. goods.remainedCnt = goods.remainedCnt - order.orderCnt;
                 2. goods.remainedDepositBlct = goods.remainedDepositBlct - order.depositBlct;
                 3. order 수행.->  orderSeq 리턴. 혹은 재고부족 에러리턴..
                 */
            }

            //console.log('최종 orderList');
            //console.log(buyingOrderList);
        }
    };

    buyBLCTGoods = async (tmpOrderGroup,tmpOrderSubGroup, tmpOrderList) => {

        //스플래시 열기
        this.setState({chainLoading: true});

        // console.log(tmpOrderGroup , tmpOrderList)
        // 주문 그룹 정보
        let orderGroup = Object.assign({}, tmpOrderGroup);
        let orderGroupNo = orderGroup.orderGroupNo;

        // 주문 정보
        let orderList = Object.assign([], tmpOrderList);

        // 여러개 동시구매를 위해 orderPrice, blctToken 수정해서 요청하기.
        let orderListBlct = 0;
        let orderListPrice = 0;

        orderList.forEach(orderDetail => {
            orderListBlct += orderDetail.blctToken;
            orderListPrice += orderDetail.orderPrice;
        })

        // 배송비정보
        let orderSubGroupList = Object.assign([], tmpOrderSubGroup);
        orderSubGroupList.forEach(orderSubGroup => {
            orderListBlct += orderSubGroup.deliveryBlctToken;
            orderListPrice += orderSubGroup.deliveryCardPrice;
        })

        let ordersParams = {
            orderGroup : orderGroup,
            orderSubGroupList: orderSubGroupList,
            orderDetailList: orderList
        };

        let {data : result} = await scOntOrderGoodsBlct(orderGroupNo, orderListBlct, orderListPrice, ordersParams);

        //console.log('buy result : ', result);
        //스플래시 닫기
        this.setState({chainLoading: false});

        // console.log('scBackOrderGoodsBlct : ', result);
        if (!result) {
            toast.dismiss();
            this.notify('상품 구매에 실패 하였습니다. 다시 구매해주세요.', toast.warn);
        } else {
            //구매완료페이지로 이동
            this.props.history.push('/buyFinish?imp_uid=&imp_success=true&merchant_uid=' + orderGroupNo + '&error_msg=' + '');
        }
    }

    //아임포트 PG 결제창
    payPgOpen = async(orderGroup, orderList, isCardBlct) => {

        //ios에서 back으로 올경우, false가 안되서 막음. this.setState({chainLoading: true});

        // 주문정보 (주문그룹정보, 주문정보)
        //파라미터로 변경, const orderGroup = Object.assign({}, this.state.orderGroup);
        //파라미터로 변경, const orderList = Object.assign([], this.state.orders);

        let payPgGubun = this.state.selectedPayPGGubun||'card';

        // 주문자정보
        const consumer = await getConsumer();

        // 주문정보(주문그룹정보,주문정보리스트) 임시저장 후 주문번호 가져오기
        if (orderGroup.payStatus !== 'reserving') { //공동구매는 reserving으로 세팅.
            orderGroup.payStatus = "ready";             //주문그룹정보 결제상태로 변경
        }
        if (orderGroup.payStatus === 'reserving') { //공동구매는 reserving으로 세팅.
            orderGroup.scheduleStatus = 'reserving';
        }

        const naverProducts = [];
        let taxFreeAmt = 0;
        if(orderList != null) {
            const promises = orderList.map( (order) => {
                order.payMethod = orderGroup.payMethod; //주문정보 결제방법 세팅
                if(orderGroup.scheduleStatus === 'reserving'){
                    order.scheduleStatus = orderGroup.scheduleStatus;
                }
                order.payStatus = orderGroup.payStatus;              //주문정보 결제상태로 변경
                if (payPgGubun && payPgGubun!=='card') {
                    order.pgProvider = payPgGubun; //kakaopay, naverpay등  출력용으로 기록: 즉시결제에도 추가가능성(202108-)
                }
                if(!order.vatFlag){
                    taxFreeAmt = taxFreeAmt + order.cardPrice;
                }
                // 네이버일반결제시 필요한 상품정보
                naverProducts.push({
                    "categoryType": "PRODUCT",
                    "categoryId": "GENERAL",
                    "uid": order.goodsNo,
                    "name": order.goodsNm,
                    "count": order.orderCnt
                })
            });
            await Promise.all(promises)
        }

        //console.log("naverProducts====",naverProducts)
        // 주문그룹 및 주문정보 임시 저장
        let ordersParams = {
            orderGroup : orderGroup,
            orderDetailList: orderList
        };

        let {data:returnedOrders} = await addOrdersTemp(ordersParams);
        if(!returnedOrders) {
            alert("주문을 다시 시도해주세요.")
            this.props.history.goBack();
            return;
        }

        let {orderGroup:tmp_OrderGroup, orderDetailList:tmp_OrderList} = returnedOrders;
        const v_orderGroupNo = tmp_OrderGroup.orderGroupNo;
        const v_payMethod = tmp_OrderGroup.payMethod;

        //결제호출용 data
        const userCode = Server.getImpKey();

        //console.log("pg===consumerNo===",consumer.data.consumerNo)
        //console.log("=======yyyymmdd====",moment().add(1,"days").format("YYYYMMDD"));
        // 일반 신용 카드 (토스페이먼츠:구LG유플러스)
        let data = { // param
            pg: Server.getImpPgId("uplus"),    //LG유플러스
            popup: true,
            pay_method: v_payMethod,    //신용카드(card), 실시간계좌이체(trans) , 가상계좌(vbank)
            merchant_uid: ''+ v_orderGroupNo,           //주문그룹번호(7자리) :String이라서 ''추가.
            name: tmp_OrderGroup.orderGoodsNm,          //주문명(상품명)
            amount:  //(isCardBlct)? ComUtil.roundDown(orderList[0].orderPrice - this.state.blctToWon * this.state.cardBlctUseToken, 0) : //cardBlct결제시 카드가격..
            tmp_OrderGroup.totalOrderPrice,     //신용카드 주문가격(총가격)
            tax_free:taxFreeAmt,    //면세공급가액
            buyer_email: consumer.data.email,           //주문자 이메일주소
            buyer_name: consumer.data.name,             //주문자 명
            buyer_tel: (consumer.data.phone)? consumer.data.phone:this.state.receiverPhone, //주문자 연락처 필수라서 혹시 없으면 주문정보에서라도 넣음.
            buyer_postcode: consumer.data.zipNo,        //주문자 우편번호(5자리)
            buyer_addr: (consumer.data.addr+" "+consumer.data.addrDetail),    //주문자 주소
            naverPopupMode:ComUtil.isMobileApp()?false:true,
            m_redirect_url: Server.getFrontURL()+'/buyFinish',   //모바일일경우 리다이렉트 페이지 처리
            naverProducts: [],
            app_scheme: 'blocery',   //모바일 웹앱 스키마명
            display:{
                card_quota:[0,2,3]  //할부개월수 비자카드 문제로 2개월 3개월 까지
            }
        }
        //예약상품일경우
        if(orderGroup.payStatus === 'reserving'){
            data = { // param
                pg: payPgGubun,    // payco, kakaopay 빌링키용 PG
                popup: true,
                pay_method: v_payMethod,    //신용카드(card), 실시간계좌이체(trans) , 가상계좌(vbank)
                merchant_uid: 'B'+ v_orderGroupNo,           //주문그룹번호(7자리) :String이라서 ''추가. 빌링키용으로 주문그룹번호 앞에 B를 붙임..
                customer_uid: consumer.data.consumerNo,          // 카드(빌링키)와 1:1로 대응하는 값 === consumerNo 값으로 하면 될듯??
                name: tmp_OrderGroup.orderGoodsNm,          //주문명(상품명)
                amount: tmp_OrderGroup.totalOrderPrice,
                tax_free:taxFreeAmt,    //면세공급가액
                buyer_email: consumer.data.email,           //주문자 이메일주소
                buyer_name: consumer.data.name,             //주문자 명
                buyer_tel: (consumer.data.phone)? consumer.data.phone:this.state.receiverPhone, //주문자 연락처 필수라서 혹시 없으면 주문정보에서라도 넣음.
                buyer_postcode: consumer.data.zipNo,        //주문자 우편번호(5자리)
                buyer_addr: (consumer.data.addr+" "+consumer.data.addrDetail),    //주문자 주소
                naverPopupMode:ComUtil.isMobileApp()?false:true,
                m_redirect_url: Server.getFrontURL()+'/buyFinish',   //모바일일경우 리다이렉트 페이지 처리
                app_scheme: 'blocery',   //모바일 웹앱 스키마명
                display:{
                    card_quota:[0,2,3]  //할부개월수 비자카드 문제로 2개월 3개월 까지
                }
            }
            if(payPgGubun === "kakaopay"){
                data.pg = Server.getImpPgId("kakaopay_billing");
                /* kakaopay 0 으로 해야 빌링키 발급만 하고 결제승인이 안됨 */
                data.amount = 0;
            }
            else if(payPgGubun === "naverpay"){
                data.pg = Server.getImpPgId("naverpay_billing");
                data.tax_free=taxFreeAmt;    //면세공급가액
            }
        }else{
            if(payPgGubun === 'kakaopay') {
                //카카오페이 일반결제
                data.pg = Server.getImpPgId("kakaopay");
                data.amount = tmp_OrderGroup.totalOrderPrice;
            }
            else if(payPgGubun === 'naverpay') {
                //naverProducts 필수구성. 상품정보(필수전달사항) 네이버페이 매뉴얼의 productItems 파라메터와 동일
                data.pg = Server.getImpPgId("naverpay");
                data.naverProducts = naverProducts;
                data.tax_free=taxFreeAmt;    //면세공급가액
            }
        }

        //1. React-Native(Webview)용 결제호출 방식 /////////////////////////////////////////////////////////////////
        if (ComUtil.isMobileApp()) {
            this.setState({chainLoading: false});
            /* 리액트 네이티브 환경에 대응하기 */
            const params = {
                userCode,                             // 가맹점 식별코드
                data,                                 // 결제 데이터
                type: 'payment',                      // 결제와 본인인증 구분을 위한 필드
            };
            const paramsToString = JSON.stringify(params);
            window.ReactNativeWebView.postMessage(paramsToString); //(일반적으로) RN의 PopupScreen.js로 보내짐.

            return;
        }



        //2. Web용 아임포트  PG 결제 모듈 객체 /////////////////////////////////////////////////////////////////////
        const IMP = window.IMP;
        // 발급받은 가맹점 식별코드
        IMP.init(userCode);

        // 모듈연동 : 아임포트
        // PG사 : LGU+
        /*
        *
        * card, trans는 즉시 결제수단이기 때문에 ready 상태가 없습니다
        *
        * 가상계좌는 사용자가 계좌이체를 완료해야 결제가 끝나기 때무에 ready 상태가 있습니다.
        * 즉 vbank에서 ready는 "가상계좌를 생성하는데 성공했음" 으로 이해하면 됩니다
        * 사용자가 입금을 하면 notification url callback 으로 paid 요청이 날아옵니다 이때 후속처리를 해야합니다.
        *
        * 결제 직후 Notification URL 이 호출될때
        * 실시간계좌이체 및 휴대폰 소액결제와 같이 실시간으로 결제가 이루어질떄는 noti 가 한번 전달됨
        * 가상계좌의 경우에는 ready 일때 paid 일때 두번 호출됨
        *
        * 가상계좌 입금은 주문서의 상태가 결제대기 -> 입금대기 -> 결제완료 처럼 3단계를 거쳐야 합니다.
        *
        * */
        IMP.request_pay(data, rsp => {
            // callback
            //LGU+ 는 모바일에서 리다이렉트 페이지만 제공
            //웹에서는 콜백이 잘됨 (콜백에서도 처리하는걸 적용)
            this.setState({chainLoading: false});
            if (rsp.success) {
                //console.log("rsp========",rsp)
                this.props.history.push('/buyFinish?imp_uid=' + rsp.imp_uid + '&imp_success=true' + '&merchant_uid=' + rsp.merchant_uid + '&error_msg=' + '');
            } else {
                let msg = '결제에 실패하였습니다.';
                //msg += ' imp_uid : ' + rsp.imp_uid;
                msg += ' 에러내용 : ' + rsp.error_msg;
                // 결제 실패 시 로직
                //alert(msg);
                this.notify(msg, toast.warn);
            }
        });
    };

    moveToAddressManagement = () =>  {
        this.props.history.push(`/mypage/addressManagement`);
    }

    // 선물하기
    onChangeGift = () => {
        this.setState(prevState => ({
            gift: !prevState.gift
        }));
    }

    // 선물 메세지
    giftMessageChange = (e) => {
        if (e.target.value == 'direct') {
            let orderList = Object.assign([], this.state.orders);
            orderList.map((order) => {
                order.giftMsgHidden = false;
            });
            this.setState({
                giftMsgHidden: false,
                giftMsg: '',
                orders:orderList
            })
        } else {
            let orderList = Object.assign([], this.state.orders);
            orderList.map((order) => {
                order.giftMsgHidden = true;
                order.giftMsg = e.target.selectedOptions[0].label;
            });
            this.setState({
                giftMsgHidden: true,
                giftMsg: e.target.selectedOptions[0].label,
                orders:orderList
            })
        }
    }

    // 선물 메세지 직접 입력시
    directGiftMessage = (e) => {
        let orderList = Object.assign([], this.state.orders);
        orderList.map((order) => {
            order.giftMsg = e.target.value
        });
        this.setState({
            giftMsg: e.target.value,
            orders: orderList
        });
    };

    // 입력된 우편번호가 도서산간인지
    searchNotDeliveryZipNo = async (zipNo) => {

        const {data: res} = await getNotDeliveryZipNo(zipNo);

        if (res !== 100) {
            this.notDelivery = true
        } else {
            this.notDelivery = false
        }
        if (jejuZipNo.includes(zipNo) === true) {
            this.jejuDelivery = true
        } else {
            this.jejuDelivery = false
        }
    }

    hopeDeliveryDateChange = ({goodsNo, hopeDeliveryDate}) => {

        //console.log({goodsNo, hopeDeliveryDate, group: this.state.orderGroupList})

        //그룹별 바인딩용 세팅
        const orderGroupList = Object.assign([], this.state.orderGroupList)
        orderGroupList.map(group => {
            const order = group.orderList.find(order => order.goodsNo === goodsNo)
            if (order)
                order.hopeDeliveryDate = hopeDeliveryDate
        })

        //실제 저장용 orderdetail 세팅
        const orders = Object.assign([], this.state.orders)
        const order = orders.find(order => order.goodsNo === goodsNo)
        order.hopeDeliveryDate = hopeDeliveryDate

        this.setState({orderGroupList, orders})
    }
    onCouponChange = (coupon) => {

        console.log({coupon})

        let couponBlyAmount = 0;
        //쿠폰 BLY
        if(coupon){
            const {blyAmount: couponBlyAmount1} = coupon
            couponBlyAmount = couponBlyAmount1;
        }


        const {
            blctToWon,              // 환율 BLY
            tokenBalance,           //내가가진 BLY 전체
            orderGroup,
        } = this.state

        const {
            totalCurrentPrice,     //총 상품가
            totalDeliveryFee,      //총 배송비
            orgTotalOrderPrice,    //총상품가 + 총 배송비
        } = orderGroup

        const newState = Object.assign({}, this.state)

        //100
        newState.couponBlyAmount = couponBlyAmount

        //총 쿠폰 (BLY)
        newState.orderGroup.totalCouponBly = couponBlyAmount
        //총 쿠폰 (원)
        newState.orderGroup.totalCouponPrice = couponBlyAmount * blctToWon

        //총 결제금액 = 총상품가(배송비포함) - 사용한쿠폰(원)
        const totalOrderPrice = orgTotalOrderPrice - newState.orderGroup.totalCouponPrice

        // 쿠폰으로 할인받은 후 지급 해야할 BLY 356 / 46.43 = 7.66 BLY
        //const remainedTotalPriceToToken = ComUtil.roundDown(totalOrderPrice / blctToWon, 2);
        // const remainedTotalPriceToToken = parseFloat(new BigNumber(totalOrderPrice).div(blctToWon).toNumber().toFixed(3));
        const remainedTotalPriceToToken = new BigNumber(totalOrderPrice).div(blctToWon).toNumber()

        //쿠폰으로 BLY를 지원 받았다면, payableBlct가 쿠폰 BLY 만큼 줄어들어야 한다
        newState.payableBlct = (remainedTotalPriceToToken > tokenBalance)? tokenBalance : remainedTotalPriceToToken
        newState.couponInfo = coupon

        this.setState(newState, () => {
            //사용한 bly
            this.calcTotalOrderPrice(this.useBlct || 0)
        })
    }

    render() {
        if(!this.state.orders || !this.state.goods || !this.state.blctToWon) return null;
        const selectedAddress = (this.state.addressList && this.state.addressList.length > 0) ? this.state.addressList[this.state.addressIndex] || null : null;
        return(
            <Fragment>
                {
                    this.state.chainLoading && <BlockChainSpinner/>
                }
                {
                    this.state.loading && <BlocerySpinner/>
                }
                {/*<ShopXButtonNav close>구매하기</ShopXButtonNav>*/}
                <BackNavigation onBackClick={() => Webview.closePopup(false)} >구매하기</BackNavigation>


                {
                    <Flex textAlign={'right'} p={16} justifyContent={'flex-end'}
                          bc={'light'}
                          bl={0}
                          br={0}
                          bb={0}
                    >
                        <Checkbox icon={FaGift} bg={'danger'} onChange={this.onChangeGift} checked={this.state.gift} size={'md'}>선물하기</Checkbox>
                    </Flex>
                }

                {/*<ItemHeader>*/}
                {/*<div>선물하기</div>*/}
                {/*<Checkbox id={'checkGift'} color={'default'} checked={this.state.gift} onChange={this.onChangeGift}>선물하기</Checkbox>*/}


                {/*</ItemHeader>*/}

                <Collapse isOpen={this.state.gift}>
                    <div>
                        <ItemHeader>
                            <div>보내는 사람 정보</div>
                            <Right>
                                <small>* 입력해 주신 정보로 카카오톡 <br/> 알림 메시지가 전송됩니다.</small>
                            </Right>
                        </ItemHeader>
                        <ItemDefaultBody>
                            <Div fontSize={12}>
                                <Flex mb={16}>
                                    <Div fg={'adjust'} minWidth={100} >보내는 사람</Div>
                                    <Div flexGrow={1} >
                                        <Input value={this.state.senderName} onChange={this.senderChange} maxLength="10" />
                                    </Div>
                                </Flex>
                                <Flex>
                                    <Div fg={'adjust'} minWidth={100}>보내는 메시지</Div>
                                    <Div flexGrow={1}>
                                        <Input type='select' name='select' id='giftMsg' onChange={this.giftMessageChange}>
                                            <option name='radio1' value='radio1'>감사합니다.</option>
                                            <option name='radio2' value='radio2'>건강하세요.</option>
                                            <option name='radio3' value='radio3'>추천합니다.</option>
                                            <option name='radio4' value='radio4'>생일 축하합니다.</option>
                                            <option name='radio5' value='radio5'>사랑합니다.</option>
                                            <option name='radio6' value='radio6'>힘내세요.</option>
                                            <option name='radio7' value='radio7'>수고했어요.</option>
                                            <option name='radio8' value='direct'>직접 입력</option>
                                            <option name='radio9' value=''>없음</option>
                                        </Input>
                                    </Div>
                                </Flex>
                            </Div>
                            {
                                !this.state.giftMsgHidden && (
                                    <Div mt={16}>
                                        <Input type={'text'} name='giftMsg'
                                               placeholder='보내는 메세지를 입력해 주세요.(최대30자)' value={this.state.giftMsg} onChange={this.directGiftMessage} maxLength="30" />
                                    </Div>
                                )
                            }

                        </ItemDefaultBody>
                    </div>
                </Collapse>



                <ItemHeader>
                    <div>배송지 정보</div>
                    <Right>
                        <Link to={'/mypage/addressManagement'}><u>배송지 수정/추가</u></Link>
                    </Right>
                </ItemHeader>
                <ItemDefaultBody>
                    <Div mb={16}>
                        <Div mb={8}>
                            <Div fg={'green'} fontSize={12} mb={5}>배송지</Div>
                            <Div>
                                <Input type='select' name='select' id='deliveryAdddresses' block onChange={this.deliveryAddressChange}>
                                    <option selected disabled name='radio'>배송받으실 주소를 선택해주세요</option>
                                    {
                                        this.state.addressList.map(({addrName, receiverName},index)=> {
                                            return (
                                                <option key={'radio'+index} selected={this.state.addressIndex === index ? true : false} name='radio' value={index}>배송지 : {addrName}</option>
                                            )
                                        })
                                    }
                                </Input>
                            </Div>
                        </Div>
                        <Div>
                            <Div fontSize={12}>
                                {
                                    selectedAddress && (
                                        <Div lineHeight={20}>
                                            <Flex>
                                                <Div fg={'adjust'} minWidth={100}>받는사람</Div>
                                                <Div>{selectedAddress.receiverName}</Div>
                                            </Flex>
                                            <Flex>
                                                <Div fg={'adjust'} minWidth={100}>연락처</Div>
                                                <Div>{selectedAddress.phone}</Div>
                                            </Flex>
                                            <Flex>
                                                <Div fg={'adjust'} minWidth={100}>주소</Div>
                                                <Div>({selectedAddress.zipNo}){selectedAddress.addr}{' '}{selectedAddress.addrDetail}</Div>
                                            </Flex>
                                        </Div>
                                    )
                                }
                                <div>
                                    <Fade in={selectedAddress && jejuZipNo.includes(selectedAddress.zipNo) ? true : false} className="text-danger small">제주도는 추가 배송비(3,000원)가 부과됩니다.</Fade>
                                </div>
                            </Div>
                        </Div>
                    </Div>
                    <Div>
                        <Div fg={'green'} fontSize={12} mb={5}>배송 메세지</Div>
                        <div>
                            <Input type='select' name='select' id='stdDeliveryMsg' onChange={this.stdOnMsgChange}>
                                <option name='radio1' value=''>배송 메세지를 선택해 주세요.</option>
                                <option name='radio2' value='radio1'>문 앞에 놔주세요.</option>
                                <option name='radio3' value='radio2'>택배함에 놔주세요.</option>
                                <option name='radio4' value='radio3'>배송 전 연락주세요.</option>
                                <option name='radio5' value='radio4'>부재 시 연락주세요.</option>
                                <option name='radio6' value='radio5'>부재 시 경비실에 맡겨주세요.</option>
                                <option name='radio7' value='direct'>직접 입력</option>
                            </Input>
                        </div>
                    </Div>
                    <EditRow>
                        <Input type={this.state.msgHidden ? 'hidden' : 'text'} name='stdDirectMsg'
                               placeholder='배송 메세지를 입력해 주세요.' value={this.state.deliveryMsg} onChange={this.stdDirectChange}/>
                    </EditRow>
                    <Div fg={'red'} fontSize={12} mt={10}>* 공동현관 비밀번호가 있는 경우 꼭 입력해주세요.(예 : #1234, 종1234*, 열쇠0012@ 등)</Div>


                </ItemDefaultBody>


                <ItemHeader>
                    <div>상품정보 <Span fg={'green'}>(주문 {this.state.goods.length}건)</Span></div>
                </ItemHeader>


                { /* 주문 상품 리스트 */}
                {
                    this.state.orderGroupList ?
                        this.state.orderGroupList.map( (group,index)=>{
                            const {producer, summary, orderList} = group
                            return <BuyGroup
                                key={`group${index}`}
                                modal={ this.state.modal }
                                modalType={ this.state.modalType }
                                producer={producer}
                                summary={summary}
                                orderList={orderList}
                                plusDeliveryFee={selectedAddress && jejuZipNo.includes(selectedAddress.zipNo)?true:false}   // true이면 배송비 3000원 추가
                                hopeDeliveryDateChange={this.hopeDeliveryDateChange}
                                blctToWon={this.state.blctToWon}
                                //dealGoods = {this.state.goods[0].dealGoods} //공동구매는 group별 Footer 가리기 위해 추가:공동구매는 하나의 group임.
                            />
                        })
                        : null
                }


                <Div p={16} relative>
                    {
                        this.state.goods.length === 1 &&  //쿠폰사용가능
                        <Div>
                            <Flex mb={16} >
                                <Div fw={500}>쿠폰 사용</Div>
                                <Right fg={'adjust'} fontSize={12}>{ this.state.couponBlyAmount > 0 && `${ComUtil.addCommas(calcBlyToWon(this.state.couponBlyAmount, this.state.blctToWon))}원`}</Right>
                            </Flex>
                            {/*<Div mb={16} fg={'secondary'} fontSize={12}>* 주문금액을 초과하여 사용할 수 없습니다</Div>*/}
                            <Coupon
                                // payableBlct={this.state.payableBlct}                            // 사용가능 BLY
                                // blctToWon={this.state.blctToWon}                                // BLY 환율
                                //orgTotalOrderPrice={this.state.orderGroup.orgTotalOrderPrice}   // 원래 총 결제금액
                                goods={this.state.goods[0]}
                                blctToWon={this.state.blctToWon}
                                onChange={this.onCouponChange}
                                //goodsBlyAmount={this.state.orderGroup.totalCurrentPrice / this.state.blctToWon}
                                totalBlyAmount={this.state.orders[0].blctToken}
                                totalOrderPrice = {this.state.orders[0].orderPrice}  //minGoodsPrice 체크용으로 추가.
                            />
                        </Div>
                    }
                </Div>

                {this.state.goods.length === 1 &&  //쿠폰사용가능
                <HrHeavyX2/>
                }

                {!this.state.consumer.noBlockchain &&
                <Div pt={(this.state.goods.length===1)?16:0}>
                    <Div pl={16} pr={16}  mb={36} relative>
                        <Div mb={16} fw={500}>적립금(BLY) 사용</Div>
                        {/*<Flex justifyContent={'center'} absolute top={0} right={0} style={{borderTopRightRadius: 6}}*/}
                        {/*      width={45} height={45} bg={'backgroundDark'} p={10}><img src={Bly}*/}
                        {/*                                                               style={{width: '100%'}}/></Flex>*/}

                        <Flex justifyContent={'center'} absolute top={0} right={16} >
                            <Div bg={'bly'} px={6} py={2} fg={'white'} textAlign={'right'} fontSize={12} rounded={3}>
                                1BLY = {ComUtil.addCommas(this.state.blctToWon)}원
                            </Div>
                        </Flex>

                        <BlctPayableCard
                            totalBlct={this.state.tokenBalance}         //전체 BLCT
                            payableBlct={this.state.payableBlct}        //사용가능 BLCT
                            blctToWon={this.state.blctToWon}            //BLCT 환율
                            onChange={this.onCardBlctUseTokenChange}
                            value={ComUtil.roundDown(this.state.cardBlctUseToken, 2)}
                        />
                    </Div>
                </Div>
                }
                {!this.state.consumer.noBlockchain &&
                <HrHeavyX2 />
                }

                <Collapse isOpen={this.state.orderGroup.totalOrderPrice > 0}>
                    {/*<ShadowBox>*/}
                    <Div p={16}>
                        <Div mb={16} fw={500}>결제방법 선택</Div>

                        <GridColumns colGap={0} rowGap={10} >
                            <PaymentButton
                                active={(this.state.selectedPayMethod === 'card' && this.state.selectedPayPGGubun === 'card')}
                                onClick={this.onPayMethodChange.bind(this, 'card','card')}>
                                <Div fontSize={17}><b>신용카드</b></Div>
                            </PaymentButton>
                            <PaymentButton
                                active={(this.state.selectedPayMethod === 'card' && this.state.selectedPayPGGubun === 'naverpay')}
                                onClick={this.onPayMethodChange.bind(this, 'card','naverpay')}>
                                <img src={NPay} style={{height: 24}}/>
                            </PaymentButton>
                            <PaymentButton
                                active={(this.state.selectedPayMethod === 'card' && this.state.selectedPayPGGubun === 'kakaopay')}
                                onClick={this.onPayMethodChange.bind(this, 'card','kakaopay')}>
                                <img src={KakaoPay} style={{height: 22}}/>
                            </PaymentButton>
                        </GridColumns>
                        {/*<Flex cursor={1}*/}
                        {/*      justifyContent={'center'}*/}
                        {/*      bg={(this.state.selectedPayMethod === 'card' && this.state.selectedPayPGGubun === 'card') ? 'white' : 'light'}*/}
                        {/*      minHeight={60}*/}
                        {/*      rounded={4}*/}
                        {/*      onClick={this.onPayMethodChange.bind(this, 'card','card')}>*/}
                        {/*    <Div fontSize={17}><b>신용카드</b></Div>*/}
                        {/*</Flex>*/}

                        {/*<Button*/}
                        {/*    noHover*/}
                        {/*    block*/}
                        {/*    fg={(this.state.selectedPayMethod === 'card' && this.state.selectedPayPGGubun === 'kakaopay') ? color.black : color.white}*/}
                        {/*    bg={(this.state.selectedPayMethod === 'card' && this.state.selectedPayPGGubun === 'kakaopay') ? color.kakao:'#DADDE1'}*/}
                        {/*    height={50}*/}
                        {/*    rounded={0}*/}
                        {/*    // bc={*/}
                        {/*    //     (this.state.selectedPayMethod === 'card' && this.state.selectedPayPGGubun === 'kakaopay') ? 'black' : 'light'*/}
                        {/*    // }*/}
                        {/*    onClick={*/}
                        {/*        this.onPayMethodChange.bind(this, 'card','kakaopay')*/}
                        {/*    }*/}
                        {/*    mb={10}*/}
                        {/*>*/}
                        {/*    <Flex justifyContent={'center'}>*/}
                        {/*        <Space spaceGap={8}>*/}
                        {/*            <RiKakaoTalkFill size={30}/>*/}
                        {/*            <div><b>카카오페이</b></div>*/}
                        {/*        </Space>*/}
                        {/*    </Flex>*/}
                        {/*</Button>*/}
                        {/*<Button*/}
                        {/*    noHover*/}
                        {/*    block*/}
                        {/*    fg={'white'}*/}
                        {/*    bg={(this.state.selectedPayMethod === 'card' && this.state.selectedPayPGGubun === 'naverpay') ?'#01C63B':'#DADDE1'}*/}
                        {/*    height={50}*/}
                        {/*    rounded={0}*/}
                        {/*    //disabled={Server._serverMode() === 'production'?true:false}*/}
                        {/*    onClick={*/}
                        {/*        this.onPayMethodChange.bind(this, 'card','naverpay')*/}
                        {/*    }*/}
                        {/*>*/}
                        {/*    <Flex  justifyContent={'center'}>*/}
                        {/*        <Flex*/}
                        {/*            px={16} //네이버검수 비율 : 2*/}
                        {/*        >*/}
                        {/*            <img src={NPay} height={30} />*/}
                        {/*        </Flex>*/}
                        {/*    </Flex>*/}
                        {/*</Button>*/}
                    </Div>
                </Collapse>

                <HrHeavyX2 />

                <Div p={16}>
                    <Div mb={16} fw={500}>결제 상세내역</Div>
                    <Div fontSize={13} lineHeight={24} mb={5}>
                        <Flex>
                            <Div>상품가격</Div>
                            <Right>{ComUtil.addCommas(this.state.orderGroup.totalCurrentPrice)}원</Right>
                        </Flex>
                        <Flex>
                            <Div>배송비</Div>
                            <Right>+ {ComUtil.addCommas(this.state.orderGroup.totalDeliveryFee)}원</Right>
                        </Flex>
                        {
                            this.state.couponBlyAmount ? (
                                <Flex>
                                    <Div>쿠폰 사용</Div>
                                    <Right>
                                        {
                                            ' - ' + ComUtil.addCommas(this.state.couponBlyAmount.toFixed(2)) + 'BLY (- ' + ComUtil.addCommas(ComUtil.roundDown(this.state.couponBlyAmount * this.state.blctToWon, 0)) + '원)'
                                        }
                                    </Right>
                                </Flex>
                            ): null
                        }
                        {
                            this.state.orderGroup.totalBlctToken > 0 && (
                                <Flex alignItems={'flex-start'}>
                                    <Div>BLY 토큰 사용</Div>
                                    <Right textAlign={'right'}>
                                        <Div>
                                            {
                                                ' - ' + ComUtil.addCommas(ComUtil.roundDown(this.state.orderGroup.totalBlctToken, 2)) + 'BLY (- ' + ComUtil.addCommas(ComUtil.roundDown(this.state.orderGroup.totalBlctToken * this.state.blctToWon, 0))+ '원)'
                                            }
                                        </Div>
                                    </Right>
                                </Flex>
                            )
                        }
                    </Div>
                    <hr/>

                    <Flex bold>
                        <Div>최종 결제 금액</Div>
                        {/*{*/}
                        {/*this.state.newState ?*/}
                        {/*<Right>*/}
                        {/*{ComUtil.addCommas(this.state.newState.orderGroup.totalOrderPrice)}원*/}
                        {/*</Right>*/}
                        {/*:*/}
                        {/*<Right>*/}
                        {/*{ComUtil.addCommas(this.state.orderGroup.totalOrderPrice)}원*/}
                        {/*</Right>*/}
                        {/*}*/}
                        <Right>
                            {ComUtil.addCommas(ComUtil.roundDown(this.state.orderGroup.totalOrderPrice, 0))}원
                        </Right>

                    </Flex>

                    {/*</ShadowBox>*/}
                </Div>


                <Div p={16}>
                    <Button bg={'green'} fg={'white'}
                            rounded={3}
                            block
                            fontSize={18.5}
                            height={55}
                            onClick={this.onBuyClick}>
                        {
                            ComUtil.addCommas(ComUtil.roundDown(this.state.orderGroup.totalOrderPrice, 0)) + ' 원 결제'
                        }
                    </Button>
                </Div>



                {/*<ToastContainer/>*/}
                {/* 결제비번 입력 모달 */}
                <Modal isOpen={this.state.modalType === 'pay' && this.state.modal} toggle={this.toggle} className={this.props.className} centered>
                    <ModalHeader toggle={this.modalToggle}> 결제 비밀번호 입력</ModalHeader>
                    <ModalBody className={'p-0'}>
                        {/* clearPassPhrase 초기화, onChange 결과값 세팅 */}
                        <PassPhrase clearPassPhrase={this.state.clearPassPhrase} onChange={this.onPassPhrase}></PassPhrase>
                    </ModalBody>
                    <ModalFooter>
                        <Div>
                            <Button fg={'primary'} onClick={this.findPassPhrase} cursor><u>결제 비밀번호 안내</u></Button>
                        </Div>
                        <Right>
                            <Button bg={'green'} fg={'white'} mr={7.5} px={11} py={5} onClick={this.modalToggleOk} rounded={5} disabled={(this.state.passPhrase.length === 6) ? false:true}>확인</Button>
                            <Button bg={'darkBlack'} fg={'white'} px={11} py={5} onClick={this.modalToggle} rounded={5}>취소</Button>
                        </Right>
                    </ModalFooter>
                </Modal>
                {/* 결제비밀번호 조회 */}
                <Modal isOpen={this.state.modalType === 'passPhrase' && this.state.modal} centered>
                    <ModalHeader>결제비밀번호 안내</ModalHeader>
                    <ModalBody>
                        마이페이지에서 결제비밀번호 힌트 조회 후 이용해주세요.
                    </ModalBody>
                    <ModalFooter>
                        <Button color="info" onClick={this.moveToMypage}>마이페이지로 이동</Button>
                        <Button color="secondary" onClick={this.modalToggle}>취소</Button>
                    </ModalFooter>
                </Modal>

                {/* 배송지 조회 (일괄적용용) */}
                <ModalWithNav show={this.state.modalType === 'stdDelivery' && this.state.modal}
                              title={'배송지수정'}
                              onClose={this.stdDeliveryCallback} noPadding>
                    <AddressModify
                        consumerNo={this.state.orderGroup.consumerNo}
                        index={this.state.addressIndex}
                        flag='order'
                    />
                </ModalWithNav>



            </Fragment>
        )
    }
}