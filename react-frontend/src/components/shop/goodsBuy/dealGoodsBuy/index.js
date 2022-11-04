import React, {Fragment, useEffect, useState, useCallback} from 'react';
import {BlocerySpinner, PassPhrase, ShopXButtonNav} from "~/components/common";
import {getGoodsByGoodsNo} from "~/lib/goodsApi";
import {
    Button,
    Div, Fixed,
    Flex, GridColumns, Hr,
    Img,
    Input,
    Link,
    ListBorder,
    Right,
    ShadowBox,
    Space,
    Span
} from "~/styledComponents/shared";
import {FaGift} from "react-icons/fa";
import Checkbox from "~/components/common/checkboxes/Checkbox";
import styled from "styled-components";
import {getValue} from "~/styledComponents/Util";
import {color} from "~/styledComponents/Properties";
import useInput from "~/hooks/useInput";
import {Collapse, Fade, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import useLogin from "~/hooks/useLogin";
import {addOrdersTemp, getConsumer, getGoodsRemainedCheckByGoodsNo, getUsableCouponList} from '~/lib/shopApi'
import ComUtil from "~/util/ComUtil";
import MathUtil from "~/util/MathUtil";
import {giftMsgStore, deliveryMsgStore} from "~/store";
import {BsExclamationDiamond} from 'react-icons/bs'
import {GiSpeaker} from 'react-icons/gi'
import {RiKakaoTalkFill} from 'react-icons/ri'
import {SiNaver} from 'react-icons/si'

import loadable from "@loadable/component";
import {useModal} from "~/util/useModal";
import Skeleton from "~/components/common/cards/Skeleton";
import {BLCT_TO_WON, calcBlyToWon} from "~/lib/exchangeApi";
import Select from "react-select";
import {HrHeavy, HrHeavyX2} from "~/styledComponents/mixedIn";
import {getDeliveryFee, getSumInfoByGoods } from '~/util/bzLogic'

import {RiRadioButtonFill} from 'react-icons/ri'

import {scOntGetBalanceOfBlct, scOntOrderGoodsBlct} from '~/lib/smartcontractApi'
import {getServerTodayTime} from "~/lib/commonApi";
import BigNumber from "bignumber.js";
import ProducerFeeRateReg from "~/components/admin/producerFeeRate/ProducerFeeRateReg";
import PointToBlyContent from "~/components/common/contents/PointToBlyContent";
import {checkPassPhrase} from "~/lib/loginApi";
import {toast, ToastContainer} from "react-toastify";
import {withRouter} from 'react-router-dom'

import IconKakaoPayment from '~/images/icons/sns/kakao_nobg_payment_icon_yellow_large.png'

import {Server} from "~/components/Properties";

import {initIMPHeadScript} from "~/util/PgUtil";
import BasicSelect from "~/components/common/selectBoxes/BasicSelect";
import {confirmProducerCancel} from "~/lib/adminApi";
import {Webview} from "~/lib/webviewApi";
import BackNavigation from "~/components/common/navs/BackNavigation";

import moment from "moment-timezone";
import SecureApi from "~/lib/secureApi";
import KakaoPay from '~/images/icons/sns/kakao-pay.png'
import NaverPay from '~/images/icons/sns/naver-pay.png'
import certApi from "~/lib/certApi";
import Components from '../components/Components'

const AddressList = loadable(() => import('~/components/common/AddressList'))

//제주도 배송비
const JEJU_DELIVERY_FEE = 3000

const ItemHeader = styled(Flex)`
    // background-color: ${color.veryLight};
    // border-top: 1px solid ${color.light}; 
    // border-bottom: 1px solid ${color.light};
    // padding:  ${getValue(20)} 0; 
    // min-height: ${getValue(54)};
    font-size: ${getValue(17)};
    font-weight: 900;    
`;
const StyledSelect = styled.select`
    width: 100%;
    height: ${getValue(40)};
    border: 1px solid ${color.light};
    padding: 0 ${getValue(13)};
    border-radius: ${getValue(5)};
`

const getScheduleAtTime = (dealEndDate) => {

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

    console.log("scheduleAtTime===",scheduleAtTime)
    return scheduleAtTime
}

const DealGoodsBuy = (props) => {

    const {consumer, isServerLoggedIn} = useLogin()

    //상품상세에서 세션에 담겨져 온 정보
    //const buyingInfo = sessionStorage.getItem("dealGoodsBuyingInfo") ? JSON.parse(sessionStorage.getItem("dealGoodsBuyingInfo")) : null
    const buyingInfo = localStorage.getItem("dealGoodsBuyingInfo") ? JSON.parse(localStorage.getItem("dealGoodsBuyingInfo")) : null

    const [goodsOrgList, setGoodsOrgList] = useState([])   //상품 원본 데이터
    const [goodsList, setGoodsList] = useState([])                        //뷰어용 상품 리스트

    //선물 정보
    const [giftInfo, setGiftInfo] = useState({
        gift: buyingInfo.buyingType === 'gift' ? true : false,
        senderName: '',
        giftMsg: giftMsgStore[0].label
    })

    const [selectedAddress, setSelectedAddress] = useState()
    const [isJeju, setJeju] = useState(false)                      //제주도 여부
    const [deliveryMsg, setDeliveryMsg] = useState(deliveryMsgStore[0].value)                            //배송메세지

    const [commonEnterFlag, setCommonEnterFlag] = useState(false);
    const [commonEnterPwd, setCommonEnterPwd] = useState("")                            //공동현관 출입번호

    const [blctToWon, setBlctToWon] = useState()                                //현재의 bly 가격 ex) 32.4원
    const [totalBlyAmount, setTotalBlyAmount] = useState()                      //상품의 총 bly 가격 (배송비 제외)
    const [myBlctBalance, setMyBlctBalance] = useState()                        //내가 소유한 blct
    const [usedBlyAmount, setUsedBlyAmount] = useState(0)                        //사용 하려는 블리

    const [couponInfo, setCouponInfo] = useState()                                 //선택된 쿠폰
    const [couponBlyAmount, setCouponBlyAmount] = useState(0)                        //선택된 쿠폰 BLY
    const [couponWonAmount, setCouponWonAmount] = useState(0)                        //위 금액을 원화로 환산.

    //pay total
    const [totalGoodsPrice, setTotalGoodsPrice] = useState()    //총 상품금액
    const [totalDeliveryFee, setTotalDeliveryFee] = useState()  //배송비
    const [totalOrderPrice, setTotalOrderPrice] = useState()    //총 결제금액 : (총 상품금액 + 배송비)

    const [payMethod, setPayMethod] = useState()                //결제방식 'blct' or 'card'
    const [selectedCardName, setSelectedCardName] = useState()  //선택한 카드명 kakaopay, payco ..

    const [passPhraseModalOpen, setPassPhraseModalOpen] = useState(false)   //결제비번 모달
    const [loading, setLoading] = useState(false)                           //로딩바

    const [consumerInfo, setConsumerInfo] = useState()                           //Consumer class 전체 가져오기

    //TODO 전체적인 useEffect 를 줄일 필요가 있음.

    useEffect(() => {

        //iamport 스크립트 추가
        initIMPHeadScript()

        if (!buyingInfo) {
            alert('잘못된 접근입니다.');
            props.history.goBack()
        }else{
            //searchBlctToWon()
            searchGoods()
        }


        console.log({consumer})

    }, [])

    useEffect(() => {
        //선물여부, 보내는 사람 바인딩
        setGiftInfo({...giftInfo, gift: buyingInfo.buyingType === 'gift', senderName: consumer.name})

        //내 blct 가져오기
        getMyBlctBalance()
        getConsumerInfo()

    }, [consumer])

    useEffect(() => {
        if (selectedAddress) {
            //제주도 여부 바인딩
            ComUtil.isJeju(selectedAddress.zipNo).then(res => {
                //추가배송비 유무가 바뀌었을때
                if (res !== isJeju) {
                    setJeju(res)
                    //배송지가 바뀐경우 사용bly는 초기화
                    setUsedBlyAmount(0)
                }
            })
        }
    }, [selectedAddress])

    //상품 원본 & 뷰어용 상품 바인딩
    const searchGoods = async() => {

        await searchBlctToWon()

        const {optionGoodsInfo} = buyingInfo
        //구조: optionGoodsInfo = [
        //     [ //FooterBuutonGroup에선 아래 하나만 사용.
        //         {goodsNo: 667, options: [ {…}, {…} ]},
        //     ]
        // ]

        //2022.4 goodsInfo를 OptionBuy와 동일하게 optionGoodsInfo[0]으로 수정.
        const promises = optionGoodsInfo[0].map(goodsInfo =>
            getGoodsByGoodsNo(goodsInfo.goodsNo).then(({data}) => data)
        )

        const goodsOrgList = await Promise.all(promises)



        //뷰어용 상품
        const goodsList = goodsOrgList.map(goods => {

            //TODO option이 없는 상품은 에러
            const options = optionGoodsInfo[0].find(goodsInfo=>goodsInfo.goodsNo===goods.goodsNo).options.map(option => {
                const orgOption = goods.options.find(go => go.optionIndex === option.optionIndex)

                return {
                    ...orgOption,             //상품원본 옵션
                    orderCnt: option.orderCnt //주문수량
                }
            })

            //상품의 옵션 병합
            const newGoods = {
                ...goods,
                options: options //옵션 정보 : optionIndex, optionPrice, orderCnt(localStorage에 있는 구매수량)
            }

            const {goodsPrice, deliveryFee} = getSumInfoByGoods(newGoods)
            // newGoods.calculatedGoodsPrice = goodsPrice
            newGoods.calculatedDeliveryFee = deliveryFee

            console.log({newGoods})

            return {
                // goodsImages: goods.goodsImages,
                // goodsNm: goods.goodsNm,
                // currentPrice: goods.currentPrice,           //상품 1개 가격
                ...newGoods,                                   //상품원본
                options: options                            //옵션 정보 : optionIndex, optionPrice, orderCnt
            }
        })

        setGoodsList(goodsList) //필요한 옵션만 추가된 상품
        setGoodsOrgList(goodsOrgList) //원본 db상품

        console.log({goodsList})

        //return goodsList
    }

    useEffect(() => {
        if (goodsList.length > 0) {
            //상품의 총 bly 가격 계산
            setTotalInfo()
        }
    }, [goodsList, isJeju, couponBlyAmount]) //쿠폰추가

    //환율 조회
    const searchBlctToWon = async () => {
        let {data} = await BLCT_TO_WON();
        console.log({blctToWon: data})
        setBlctToWon(data)
    }

    //bzLogic으로 이동.(22.3.16)
    // const getSumInfoByGoods = (goods) => {
    //     //총 주문가격(원)
    //     let goodsPrice = 0;
    //     let deliveryFee = 0;
    //
    //     let qty = 0; //구매수(옵션)
    //
    //     goods.options.map(option => {
    //         goodsPrice += option.optionPrice * option.orderCnt
    //         qty += option.orderCnt
    //     })
    //
    //     //배송비 책정
    //     deliveryFee = getDeliveryFee({
    //         qty: qty,
    //         deliveryFee: goods.deliveryFee,
    //         deliveryQty: goods.deliveryQty,
    //         termsOfDeliveryFee: goods.termsOfDeliveryFee,
    //         orderPrice: goodsPrice //currentPrice * orderCnt (배송비 제외한 총 상품가격)
    //     })
    //
    //     return {
    //         goodsPrice, //상품가 * 수량
    //         deliveryFee //배송비
    //     }
    // }

    //총 상품가, 배송비(제주도 포함), 총 결제금액 계산 및 세팅
    const setTotalInfo = () => {
        //총 주문가격(원)
        let totalGoodsPrice = 0;
        let totalDeliveryFee = 0;

        //배송비 계산용
        let qty = 0;
        let deliveryFee = 0;
        let deliveryQty = 0;
        let termsOfDeliveryFee = 0;

        //총 주문가격(bly)
        let totalBlyAmount = 0;

        console.log("===========", goodsList)

        goodsList.map(goods => {

            //상품가*수량, 배송비
            const {goodsPrice, deliveryFee} = getSumInfoByGoods(goods)

            totalGoodsPrice += goodsPrice
            totalDeliveryFee += deliveryFee

            // console.log({goodsPrice: goods.calculatedGoodsPrice, calcu: goods.calculatedDeliveryFee})

            // goods.options.map(option => {
            //     totalGoodsPrice += option.optionPrice * option.orderCnt
            //     qty += option.orderCnt
            // })
            // // deliveryFee = goods.deliveryFee
            // // deliveryQty = goods.deliveryQty
            // // termsOfDeliveryFee = goods.termsOfDeliveryFee
            //
            // //상품별 배송비 책정
            // totalDeliveryFee = getDeliveryFee({
            //     qty: qty,
            //     deliveryFee: goods.deliveryFee,
            //     deliveryQty: goods.deliveryQty,
            //     termsOfDeliveryFee: goods.termsOfDeliveryFee,
            //     orderPrice: totalGoodsPrice //currentPrice * orderCnt (배송비 제외한 총 상품가격)
            // })

        })


        //제주도 추가 배송비는 나중에 상품수량이 멀티가 되면 상품수량만큼 곱해야 함..
        if (isJeju) {
            totalDeliveryFee += JEJU_DELIVERY_FEE
        }

        // console.log({
        //     qty: qty,
        //     deliveryFee: deliveryFee,
        //     deliveryQty: deliveryQty,
        //     termsOfDeliveryFee: termsOfDeliveryFee,
        //     orderPrice: totalGoodsPrice //currentPrice * orderCnt (배송비 제외한 총 상품가격)
        // })


        //pay total
        setTotalGoodsPrice(totalGoodsPrice)
        setTotalDeliveryFee(totalDeliveryFee)

//24 - 21 = 3

        setTotalOrderPrice(MathUtil.plusBy(totalGoodsPrice,totalDeliveryFee))

        //상품의 총 bly 가격
        //쿠폰전 totalBlyAmount = totalGoodsPrice / blctToWon
        totalBlyAmount = MathUtil.dividedBy((totalGoodsPrice - couponWonAmount),blctToWon)
        setTotalBlyAmount(totalBlyAmount)
    }

    const onCouponChange = (coupon) => {
        console.log({coupon})

        let couponBlyAmount = 0;
        //쿠폰 BLY
        if(coupon){
            if (coupon.couponType && coupon.couponType==='deliveryCoupon') { //2208 배송비무료쿠폰 추가
                couponBlyAmount = ComUtil.roundDown(MathUtil.dividedBy(totalDeliveryFee, blctToWon), 2)

            }else {
                const {blyAmount: couponBlyAmount1} = coupon
                couponBlyAmount = couponBlyAmount1;
            }
        }

        //쿠폰 사용
        setCouponInfo(coupon) //선택한 쿠폰 = couponInfo.value
        setCouponBlyAmount(couponBlyAmount)
        setCouponWonAmount(MathUtil.roundHalf(MathUtil.multipliedBy(couponBlyAmount,blctToWon)))

        //카드/BLY결제 초기화가 심플함,
        setPayMethod(undefined)
        setUsedBlyAmount(0)
    }

    //내 blct 가져오기
    const getMyBlctBalance = async () => {
        let {data} = await scOntGetBalanceOfBlct(consumer.account);
        setMyBlctBalance(data)
    }

    //consumerInfo 가져오기: 이게 진짜 consumer class임.
    const getConsumerInfo = async () => {
        let {data} = await getConsumer();
        setConsumerInfo(data)
    }

    //결제하기 클릭
    const onBuyClick = async () => {

        //백엔드 로그인 체크
        if (!await isServerLoggedIn()) {
            return
        }

        // 어뷰저 체크
        if (await ComUtil.isBlockedAbuser()) {
            return
        }

        // 밸리데이션 체크
        if (!checkValidation()){
            return
        }

        switch (payMethod) {
            case 'card' :
                payByCard();
                break;
            case 'blct' :
                setPassPhraseModalOpen(true);
                break;
        }
    }

    // 밸리데이션 체크
    const checkValidation = () => {
        if (totalOrderPrice < 0) {
            alert('금액 오류입니다. 처음부터 다시 진행해 주세요.');
            return false
        }
        if(commonEnterFlag){
            if(!commonEnterPwd){
                alert('공동현관출입번호를 입력해 주세요.');
                return false
            }
        }
        if (!selectedAddress) {
            alert('배송지를 선택해 주세요.');
            return false
        }
        if (!payMethod) {
            alert('결제수단을 선택해 주세요.');
            return false
        }

        if (payMethod === 'card' && !selectedCardName) {
            alert('결제할 카드사를 선택해 주세요.');
            return false
        }

        if (payMethod === 'blct' && (totalOrderPrice > 0)) {
            alert('BLY가 부족합니다.')
            return false
        }
        return true
    }

    //DB 저장용 orderSubGroup 리턴
    const getOrderSubGroupParam = (orderDetailList) => {
        const orderSubGroups = []; // dealGodds에서는 subGroup이 1개뿐일듯. 하지만 api에 리스트 넘겨야 함.
        const subGroup = {};
        subGroup.deliveryFee = totalDeliveryFee;
        subGroup.payMethod = payMethod;
        subGroup.listSize = orderDetailList.length; //front에서 백엔드 전달전용. 한subGroup의 주문개수

        if (payMethod === 'blct') {
            subGroup.deliveryCardPrice = 0;
            subGroup.deliveryBlctToken = parseFloat(MathUtil.dividedBy(totalDeliveryFee,blctToWon).toFixed(3))
        } else { // card
            subGroup.deliveryBlctToken = 0;
            subGroup.deliveryCardPrice = totalDeliveryFee;
            if (couponInfo) {
                subGroup.onlyCouponBly = true; //cartBlct 인데 blct=모두coupon인 경우.
                //payMethod를 cardBlct로 변환. //TODO 문제없는지 check 2022.04.08에 추가했음.
                subGroup.payMethod = 'cardBlct';
                //orderDetailList.map(orderDetail => orderDetail.payMethod='cardBlct') orderDetail루프함수에서 직접 처리.
            }
        }

        if (couponInfo) { //선택된 쿠폰 저장. 미선택시 value=blyAmount=0
            subGroup.usedCouponNo = couponInfo.value
            subGroup.usedCouponBlyAmount = couponInfo.blyAmount
            subGroup.couponType = couponInfo.couponType

            console.log('deliveryCoupon CHECK:' + couponBlyAmount) //todo couponBlyAmount 사용어디서 하나?
            console.log(couponInfo)

            //배송비무료쿠폰은 여기서 세팅1. (orderDetail에서 한번더 넣어야 함)
            if (couponInfo.couponType === 'deliveryCoupon') {
                subGroup.usedCouponBlyAmount = couponBlyAmount //parseFloat(MathUtil.dividedBy(totalDeliveryFee,blctToWon).toFixed(3)) //couponBlyAmount ??
            }
            console.log(subGroup)
        }

        orderSubGroups.push(subGroup);

        console.log({orderSubGroups})

        return orderSubGroups;
    }


    //DB 저장용 orderGroup 리턴
    const getOrderGroupParam = (orderDetails, orderSubGroupList) => {
        const orderGroup = {}
        orderGroup.dealGoods = true; //마이페이지 때문에 추가 1026

        orderGroup.payMethod = payMethod;
        orderGroup.orderDate = orderDetails[0].orderDate;
        orderGroup.payStatus = 'reserving';             //공동구매는 reserving으로 세팅. 주문정보 미결제상태 세팅
        orderGroup.scheduleStatus = 'reserving'         //공동구매는 reserving으로 세팅.
        orderGroup.scheduleAtTime = getScheduleAtTime(goodsList[0].dealEndDate); // todo : 상품 예약 시간 설정
        orderGroup.orderGoodsNm = goodsList[0].goodsNm//orderDetails[0].goodsNm

        let totalCurrentPrice = 0
        let totalOrderPrice = 0
        let totalOrderTaxFreePrice = 0
        let totalBlctToken = 0
        let totalDeliveryFee = orderSubGroupList[0].deliveryFee  // orderSubGroup에서
        // let totalCancelFee = 0
        // let totalCancelBlctTokenFee = 0


        orderDetails.map(orderDetail => {
            totalCurrentPrice += MathUtil.multipliedBy(orderDetail.currentPrice,orderDetail.orderCnt)
            // totalDeliveryFee += orderDetail.deliveryFee
            totalOrderPrice += orderDetail.orderPrice
            if(!orderDetail.vatFlag){
                totalOrderTaxFreePrice += orderDetail.orderPrice
            }
            totalBlctToken += orderDetail.blctToken
            // totalCancelFee += orderDetail.cancelFee
            // totalCancelBlctTokenFee += orderDetail.cancelBlctTokenFee
        })

        orderGroup.totalCurrentPrice = totalCurrentPrice
        orderGroup.totalDeliveryFee = totalDeliveryFee
        //2208 deliveryCoupon orderGroup.totalOrderPrice = totalOrderPrice + totalDeliveryFee ;  // orderDetail의 orderPrice에서 배송비가 빠졌기에 별도 더해야 함 (2022.3.17)
        orderGroup.totalOrderPrice = totalOrderPrice + totalDeliveryFee - couponWonAmount;  /** 2208 deliveryCoupon 기존오류 수정 쿠폰금액 빼줘야함. */

        orderGroup.totalOrderTaxFreePrice = totalOrderTaxFreePrice; //실제 사용하지 않아서 orderSubGroup 작업하면서 배송비 더하지 않음. (2022.3.17)
        totalBlctToken += orderSubGroupList[0].deliveryBlctToken;  // blct결제일 때 배송비를 더해줘야 함 (2022.3.17)

        orderGroup.totalBlctToken = parseFloat(new BigNumber(totalBlctToken).toNumber().toFixed(2));

        //todo 4-coupon
        orderGroup.dealCouponAmount = couponWonAmount; //card 예약결제용 couponWonAmount 별도 저장.

        console.log({orderGroup})

        return orderGroup
    }

    //DB 저장용 orderDetailList 리턴
    const getOrderDetailListParam = async() => {
        // 서버시간 가져오기
        let { data:serverTodayTime } = await getServerTodayTime();
        let orderDate = ComUtil.getNow(serverTodayTime);    //주문일자생성

        const orderDetails = []

        //loop를 돌지만 항상 상품 하나일 것으로 간주하고 작성 하였음
        goodsList.map(goods => {

            //옵션의 마지막 인덱스 기억
            const lastGoodsIndex = goods.options.length -1

            goods.options.map((option, index) => {
                const orderDetail = {}

                orderDetail.payMethod = payMethod
                orderDetail.payStatus = "reserving"
                orderDetail.scheduleStatus = "reserving"

                //상품,생산자,소비자 키 값
                orderDetail.goodsNo = goods.goodsNo
                orderDetail.producerNo = goods.producerNo;
                // orderDetail.consumerNo = consumerNo; //TODO 백엔드에서 처리 확인요

                //dealRecommenderNo 있으면 orderDetail에 저장 : key dealRecommenderNo431 (431=goodsNo)
                if (localStorage.getItem('dealRecommenderNo'+goods.goodsNo)) {

                    let dealRecommenderCode = localStorage.getItem('dealRecommenderNo'+goods.goodsNo);
                    orderDetail.dealRecommenderNo = ComUtil.decodeInviteCode(dealRecommenderCode);

                    console.log( 'dealRecommenderNo of goodsNo ' + goods.goodsNo + ',' + orderDetail.dealRecommenderNo + '=' + dealRecommenderCode);
                }

                //상품정보
                orderDetail.orderImg = goods.goodsImages[0] ? goods.goodsImages[0].imageUrl:null;

                //goods가 아니고 db=goodsOrgList에서 goods를 찾아서 세팅해야함. 1,2
                if (option.optionIndex > 0 && goodsOrgList[0].options[option.optionIndex].optionImages.length > 0) { //옵션번호가 1이상이면 옵션이미지로 대체
                    orderDetail.orderImg = goodsOrgList[0].options[option.optionIndex].optionImages[0].imageUrl;
                }
                orderDetail.expectShippingStart = goods.expectShippingStart;
                orderDetail.expectShippingEnd = goods.expectShippingEnd;

                orderDetail.hopeDeliveryFlag = goods.hopeDeliveryFlag;    //소비자가 희망배송일 지정 할 수 있는 상품인지 여부
                //TODO 소비자가 지정한 희망배송일 구현해야하나??
                orderDetail.hopeDeliveryDate = goods.hopeDeliveryDate;    //소비자가 지정한 희망배송일

                orderDetail.goodsNm = goods.goodsNm;
                //2022.04 제거. goodsNm과 optionName 별도 저장.
                // if (option.optionIndex > 0 ) { //옵션번호가 1이상이면 옵션명 추가
                //     orderDetail.goodsNm = orderDetail.goodsNm + '[옵션:' + goodsOrgList[0].options[option.optionIndex].optionName  + ']';
                // }

                orderDetail.packAmount = goods.packAmount;
                orderDetail.packCnt = goods.packCnt;
                orderDetail.packUnit = goods.packUnit;

                //가격정보
                // orderDetail.consumerPrice = goods.consumerPrice;  //상품소비자가격

                // orderDetail.discountRate = goods.discountRate;    //상품현재가격 할인비율

                orderDetail.dealGoods = goods.dealGoods;
                orderDetail.payStatus = 'reserving';

                //============ 상품 주문 수량 option 정보 ===================
                orderDetail.optionIndex = option.optionIndex;
                orderDetail.orderCnt = option.orderCnt;
                orderDetail.optionName = option.optionName;
                orderDetail.currentPrice = option.optionPrice;    //상품현재가격

                //마지막 인덱스에만 배송비를 추가 (2022.3.17. 배송비는 orderSubGroup으로 이동)
                // if(index < lastGoodsIndex) {
                orderDetail.deliveryFee = 0
                orderDetail.orderPrice = MathUtil.multipliedBy(option.orderCnt,option.optionPrice)
                // }else{
                //     orderDetail.deliveryFee = totalDeliveryFee
                //     orderDetail.orderPrice = (option.orderCnt * option.optionPrice) + totalDeliveryFee
                // }

                if (payMethod === 'blct') {
                    //블리는 전액결제이기 때문에 card는 무조건 0
                    orderDetail.cardPrice = 0
                    orderDetail.blctToken = parseFloat(MathUtil.dividedBy(orderDetail.orderPrice,blctToWon).toFixed(3))
                }else{ //card

                    orderDetail.blctToken = 0
                    orderDetail.pgProvider = selectedCardName; //'kakaopay' or 'payco'

                    if(index < lastGoodsIndex) {
                        orderDetail.cardPrice = MathUtil.multipliedBy(option.orderCnt,option.optionPrice)
                    }else{
                        //쿠폰전 orderDetail.cardPrice = (option.orderCnt * option.optionPrice) + totalDeliveryFee

                        //쿠폰적용: 단건 주문일때만 적용되므로 index=lastGoodsIndex이며, couponWonAmount를 제외해야함.  (배송비는 orderDetail에서 제외. orderSubGroup)
                        // orderDetail.cardPrice = (option.orderCnt * option.optionPrice) + totalDeliveryFee - couponWonAmount
                        orderDetail.cardPrice = MathUtil.multipliedBy(option.orderCnt,option.optionPrice) - couponWonAmount
                    }
                }

                //과세면세
                orderDetail.vatFlag = goods.vatFlag;

                //면세 가격
                orderDetail.cardTaxFreePrice = !goods.vatFlag ? orderDetail.cardPrice:0;
                orderDetail.orderTaxFreePrice = !goods.vatFlag ? orderDetail.orderPrice:0;

                orderDetail.orderDate = orderDate //주문일자생성
                orderDetail.directGoods = goods.directGoods

                //배송지정보
                orderDetail.receiverName = selectedAddress.receiverName
                orderDetail.receiverAddr = selectedAddress.addr
                orderDetail.receiverRoadAddr = selectedAddress.roadAddr
                orderDetail.receiverAddrDetail = selectedAddress.addrDetail
                orderDetail.receiverZipNo = selectedAddress.zipNo
                orderDetail.receiverPhone = selectedAddress.phone

                // 선물하기 여부 저장
                orderDetail.gift = giftInfo.gift
                orderDetail.senderName = giftInfo.senderName
                orderDetail.giftMsg = giftInfo.giftMsg

                //저장시 포함되지 않는부분
                // order.directGoods = goods.directGoods

                console.log('couponInfo')
                console.log(couponInfo)
                //////쿠폰 처리////// TODO 옵션 여러개일 때에 쿠폰 쪼개서 넣어야 함. ==> 이렇게 안하고, orderDetail 1개일때문 쿠폰선택 가능하게 해놓은 상황임.
                if (couponInfo) { //선택된 쿠폰 저장. 미선택시 value=blyAmount=0
                    orderDetail.usedCouponNo = couponInfo.value
                    orderDetail.usedCouponBlyAmount = couponInfo.blyAmount

                    if (payMethod === 'card') { //카드일 경우도 쿠폰금액을 blctToken으로 세팅. - 테스트 중.
                        orderDetail.blctToken = couponInfo.blyAmount
                        orderDetail.payMethod = 'cardBlct'
                    }

                    //배송비무료쿠폰은 여기서 세팅2. 여기가 중요
                    if (couponInfo.couponType === 'deliveryCoupon') {
                        orderDetail.usedCouponBlyAmount = couponBlyAmount
                        orderDetail.blctToken = couponBlyAmount
                    }
                }

                orderDetails.push(orderDetail)

            })
        })

        console.log({orderDetails})

        return orderDetails
    }

    //결제수단 변경
    const onPayMethodChange = (payMethod) => {
        //카드 선택하면 블리사용 초기화
        if (payMethod === 'card') {
            setTotalOrderPrice(totalGoodsPrice + totalDeliveryFee)
            setUsedBlyAmount(0)
        }

        setPayMethod(prev => payMethod)

    }

    //카드 선택 변경
    const onCardChange = (cardName) => {
        setSelectedCardName(cardName)
    }

    //BLY 전액 사용
    const onBlyAllClick = () => {
        //쿠폰전 const totalOrderPriceBly = (totalGoodsPrice + totalDeliveryFee) / blctToWon

        //쿠폰적용
        const totalOrderPriceBly = MathUtil.dividedBy((totalGoodsPrice + totalDeliveryFee - couponWonAmount),blctToWon)
        if (myBlctBalance < totalOrderPriceBly){
            alert('보유한 BLY가 결제금액보다 작습니다.')
        }else{
            setUsedBlyAmount(totalOrderPriceBly)
            setTotalOrderPrice(0)
        }
    }



    //결제비번 모달 토글
    const passPhraseModalToggle = () => {
        setPassPhraseModalOpen(!passPhraseModalOpen)
    }

    //[카드] 결제
    const payByCard = async () => {
        // const orderDetailList = await getOrderDetailListParam();
        // const orderGroup = getOrderGroupParam(orderDetailList)
        // payPgOpen(orderGroup, orderDetailList, false);

        //orderGroupTemp, orderDetailTemp 등록
        const {orderGroup, orderDetailList, orderSubGroupList} = await addAndGetTempData()

        //카드사별 data 만들기
        const data = await getPgData(orderGroup, orderDetailList, selectedCardName)

        //결제요청
        requestImportPay(data)
    }

    //[카드] 아임포트 PG 결제위한 data
    const getPgData = async (tmp_OrderGroup, tmp_OrderDetailList, payPgGubun) => {

        // 주문자정보
        const consumer = await getConsumer();

        console.log("tmp_OrderGroup",tmp_OrderGroup)
        // const payPgGubun = selectedCardName; //kakao, payco

        // let {orderGroup:tmp_OrderGroup, orderDetailList:tmp_OrderList} = returnedOrders;
        const v_orderGroupNo = tmp_OrderGroup.orderGroupNo;
        const v_payMethod = tmp_OrderGroup.payMethod;

        const v_OrderDetailList = tmp_OrderDetailList;
        const naverProducts = [];
        let taxFreeAmt = 0;
        if(v_OrderDetailList != null) {
            const promises = v_OrderDetailList.map((order) => {

                if(!order.vatFlag){
                    taxFreeAmt = taxFreeAmt + order.cardPrice;
                }

                // 네이버일반결제시 필요한 상품정보
                naverProducts.push({
                    "categoryType": "PRODUCT",
                    "categoryId": "GENERAL",
                    "uid": order.goodsNo,
                    "name": order.goodsNm,
                    //"payReferrer": "ETC",
                    "count": order.orderCnt
                })
            });
            await Promise.all(promises)
        }

        // 일반 신용 카드 (토스페이먼츠:구LG유플러스)
        let data = { // param
            pg: Server.getImpPgId("uplus"),    //LG유플러스
            popup: true,
            pay_method: v_payMethod,    //신용카드(card), 실시간계좌이체(trans) , 가상계좌(vbank)
            merchant_uid: ''+ v_orderGroupNo,           //주문그룹번호(7자리) :String이라서 ''추가.
            name: tmp_OrderGroup.orderGoodsNm,          //주문명(상품명)
            amount:  //(isCardBlct)? ComUtil.roundDown(orderList[0].orderPrice - this.state.blctToWon * this.state.cardBlctUseToken, 0) : //cardBlct결제시 카드가격..
            tmp_OrderGroup.totalOrderPrice,     //신용카드 주문가격(총가격)
            //tax_free:taxFreeAmt,    //면세공급가액
            buyer_email: consumer.data.email,           //주문자 이메일주소
            buyer_name: consumer.data.name,             //주문자 명
            buyer_tel: (consumer.data.phone)? consumer.data.phone : selectedAddress.receiverPhone, //주문자 연락처 필수라서 혹시 없으면 주문정보에서라도 넣음.
            buyer_postcode: consumer.data.zipNo,        //주문자 우편번호(5자리)
            buyer_addr: (consumer.data.addr+" "+consumer.data.addrDetail),    //주문자 주소
            naverProducts:[],
            naverPopupMode:ComUtil.isMobileApp()?false:true,
            m_redirect_url: Server.getFrontURL()+'/buyFinish',   //모바일일경우 리다이렉트 페이지 처리
            app_scheme: 'blocery',   //모바일 웹앱 스키마명
            display:{
                card_quota:[0,2,3]  //할부개월수 비자카드 문제로 2개월 3개월 까지
            }
        }
        //예약상품일경우
        console.log('reserving couponWon: '+ couponWonAmount)
        if(tmp_OrderGroup.payStatus === 'reserving'){
            data = { // param
                pg: payPgGubun,    // payco, kakaopay 빌링키용 PG
                popup: true,
                pay_method: v_payMethod,    //신용카드(card), 실시간계좌이체(trans) , 가상계좌(vbank)
                merchant_uid: 'B'+ v_orderGroupNo,           //주문그룹번호(7자리) :String이라서 ''추가. 빌링키용으로 주문그룹번호 앞에 B를 붙임..
                customer_uid: consumer.data.consumerNo+"_"+v_orderGroupNo,          // 카드(빌링키)와 1:1로 대응하는 값 === consumerNo 값으로 하면 될듯??
                name: tmp_OrderGroup.orderGoodsNm,          //주문명(상품명)
                //2208 deliveryCoupon amount: tmp_OrderGroup.totalOrderPrice - couponWonAmount,  //TODO 3-couponWonAmount 제외 필요.(naver만)
                amount: tmp_OrderGroup.totalOrderPrice,  /** 2208 deliveryCoupon 기존 totalOrderPice틀리는 오류 수정, 쿠폰금액은 위에서 totalOrderPriced에서 뺐음. */
                //tax_free:taxFreeAmt,    //면세공급가액
                buyer_email: consumer.data.email,           //주문자 이메일주소
                buyer_name: consumer.data.name,             //주문자 명
                buyer_tel: (consumer.data.phone)? consumer.data.phone : selectedAddress.receiverPhone, //주문자 연락처 필수라서 혹시 없으면 주문정보에서라도 넣음.
                buyer_postcode: consumer.data.zipNo,        //주문자 우편번호(5자리)
                buyer_addr: (consumer.data.addr+" "+consumer.data.addrDetail),    //주문자 주소
                naverPopupMode:ComUtil.isMobileApp()?false:true,
                naverProductCode : '',
                m_redirect_url: Server.getFrontURL()+'/buyFinish',   //모바일일경우 리다이렉트 페이지 처리
                app_scheme: 'blocery',   //모바일 웹앱 스키마명
                display:{
                    card_quota:[0,2,3]  //할부개월수 비자카드 문제로 2개월 3개월 까지
                }
            }
            if(payPgGubun === "kakaopay"){
                data.pg = Server.getImpPgId("kakaopay_billing");
                //카카오페이 정기결제는 0으로 세팅
                data.amount = 0;
            } else if(payPgGubun === "naverpay"){
                data.pg = Server.getImpPgId("naverpay_billing");
                //data.tax_free=taxFreeAmt;    //면세공급가액
                data.naverProductCode = (v_OrderDetailList != null && v_OrderDetailList.length === 1) ? v_OrderDetailList[0].goodsNo:''
                //네이버페이 정기결제는 금액을 넣으면 표시만 되고 실제 결제는 예약일에 실제 결제가 되는 프로세스
            }
        }else{
            if(payPgGubun === 'kakaopay') {
                //카카오페이 일반결제
                data.pg = Server.getImpPgId("kakaopay");
            } else if(payPgGubun === 'naverpay') {
                //naverProducts 필수구성. 상품정보(필수전달사항) 네이버페이 매뉴얼의 productItems 파라메터와 동일
                data.pg = Server.getImpPgId("naverpay");
                data.naverProducts = naverProducts;
                //data.tax_free=taxFreeAmt;    //면세공급가액
            }
        }

        console.log({importData:data})

        return data


    }

    //[카드] 아임포트 PG 결제창
    const requestImportPay = (data) => {

        let userCode = Server.getImpKey();

        //1. React-Native(Webview)용 결제호출 방식 /////////////////////////////////////////////////////////////////
        if (ComUtil.isMobileApp()) {

            // this.setState({chainLoading: false});

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

            // this.setState({chainLoading: false});

            if (rsp.success) {
                console.log("rsp========",rsp)
                props.history.push('/buyFinish?imp_uid=' + rsp.imp_uid + '&imp_success=true' + '&merchant_uid=' + rsp.merchant_uid + '&error_msg=' + '');
            } else {
                let msg = '결제에 실패하였습니다.';
                msg += '에러내용 : ' + rsp.error_msg;
                // 결제 실패 시 로직
                //alert(msg);
                notify(msg, toast.error);
            }
        });
    }

    //[BLCT] 결제 (결제비밀번호 입력 모달 확인 후 결제진행)
    const payByBlct = async () => {

        //모달을 닫지않고 결제진행 하는게 더 자연스러움..
        //비밀번호 모달 닫기
        // setPassPhraseModalOpen(false)

        //상품의 재고체크(DB)
        if (!await checkGoodsRemainedCount()) {
            return
        }

        //spinner open
        setLoading(true)

        let isSuccess = false

        //orderGroupTemp, orderDetailTemp 등록
        const tmpData = await addAndGetTempData()
        console.log(tmpData)

        if (tmpData) {
            const {orderGroup, orderDetailList, orderSubGroupList} = tmpData

            const orderGroupNo = orderGroup.orderGroupNo
            const totalBlctToken = orderGroup.totalBlctToken
            const totalOrderPrice = orderGroup.totalOrderPrice
            const orderParams = { orderGroup, orderDetailList, orderSubGroupList }
            const {data: result} = await scOntOrderGoodsBlct(orderGroupNo, totalBlctToken, totalOrderPrice, orderParams);

            isSuccess = (result.resCode === 0) ? true : false

            if (isSuccess) {

                //fake delay (1초 후 페이지 이동)
                await ComUtil.delay(1000)

                //구매완료페이지로 이동
                props.history.push('/buyFinish?imp_uid=&imp_success=true&merchant_uid=' + orderGroupNo + '&error_msg=' + '');
            }
        }

        if (!isSuccess){
            setLoading(false)
            notify('상품 구매에 실패 하였습니다. 다시 구매해주세요.', toast.error);
        }

        // const orderDetailList = await getOrderDetailListParam()
        // const orderGroup = getOrderGroupParam(orderDetailList)
        // let {data} = await addOrdersTemp({orderGroup, orderDetailList});
        //
        // if (!data) {
        //     alert('로그인이 필요합니다.')
        //     return
        // }

        // console.log({data})
        // let {orderGroup:tmp_OrderGroup, orderDetailList:tmp_OrderList} = data;

        //console.log("tmp_OrderGroup",tmp_OrderGroup);
        //console.log("tmp_OrderList",tmp_OrderList);

        // 임시 주문리스트 블록체인 기록후 정상적이면 실제 주문리스트로 등록
        // 블록체인 까지 정상적으로 갔을 경우 실제 주문 저장
        // await buyBLCTGoods(tmp_OrderGroup,tmp_OrderList);

        /** Backend에서 add Order 아래 2가지를 한꺼번에 하는 방법
         1. goods.remainedCnt = goods.remainedCnt - order.orderCnt;
         2. goods.remainedDepositBlct = goods.remainedDepositBlct - order.depositBlct;
         3. order 수행.->  orderSeq 리턴. 혹은 재고부족 에러리턴..
         */

    }

    //orderGroupTemp, orderDetailListTemp 저장 및 데이터 리턴
    const addAndGetTempData = async () => {
        try {
            const orderDetailList = await getOrderDetailListParam()
            const orderSubGroupList = getOrderSubGroupParam(orderDetailList)
            const orderGroup = getOrderGroupParam(orderDetailList, orderSubGroupList)
            // console.log("orderDetailList==",orderDetailList)
            // console.log("orderGroup==",orderGroup)
            let {data} = await addOrdersTemp({orderGroup,orderSubGroupList,orderDetailList});
            console.log("data == ",data)
            if (!data) {
                alert("주문을 다시 시도해주세요.")
                props.history.goBack();
                return false;
            }

            return data

        }catch (error) {
            console.error(error.message)
            return false;
        }
    }

    //상품의 재고체크(DB)
    const checkGoodsRemainedCount = async () => {
        const noRemainedOptionList = []
        const promises = goodsList.map(goods =>
            goods.options.map(option =>
                getGoodsRemainedCheckByGoodsNo(option.orderCnt, goods.goodsNo).then(res => {
                    if (res.data <= 0) {
                        noRemainedOptionList.push(option)
                    }
                })
            )
        )

        await Promise.all(promises)

        if (noRemainedOptionList.length > 0){
            alert(`죄송합니다. [${noRemainedOptionList[0].optionName}] 상품이 품절 되었습니다.`)
            return false
        }

        return true
    }

    const notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
            //className: ''     //클래스를 넣어도 됩니다
        })
    };

    return (
        <Div>
            {
                loading && <BlocerySpinner/>
            }
            {/*<ShopXButtonNav close>구매하기</ShopXButtonNav>*/}
            <BackNavigation onBackClick={() => Webview.closePopup(false)}>구매하기</BackNavigation>
            <Div>

                {/* 선물하기 */}
                <Gift giftInfo={giftInfo} setGiftInfo={setGiftInfo} />
                <HrHeavyX2 />
                {/* 배송지 정보 */}
                <Components.Address selectedAddress={selectedAddress} setSelectedAddress={setSelectedAddress}>
                    {/* 제주도 여부 */}
                    <Components.JejuText
                        // zipNo={selectedAddress.zipNo}
                        isJeju={isJeju}
                    />
                    {/* 배송 메세지 */}
                    <Components.DeliveryMsg
                        deliveryMsg={deliveryMsg} setDeliveryMsg={setDeliveryMsg}
                        setCommonEnterFlag={setCommonEnterFlag} commonEnterPwd={commonEnterPwd} setCommonEnterPwd={setCommonEnterPwd}
                    />
                </Components.Address>
                <HrHeavyX2 />
                {/* 상품 정보 */}
                <GoodsList goodsList={goodsList}/>
                <HrHeavyX2 />
                {/*<BlctToWon blctToWon={blctToWon} />*/}

                { goodsList && goodsList.length == 1 &&
                goodsList[0].options.length == 1 && //옵션이 1개일때만 쿠폰출력 (상품도 당연히 1개임),
                <Coupon
                    totalBlyAmount={totalBlyAmount}
                    onCouponChange={onCouponChange}
                    totalOrderPrice = {totalOrderPrice}  //minGoodsPrice 체크용으로 추가.
                    goods={goodsList[0]}
                />
                }

                {/*<UseBly*/}
                {/*    myBlctBalance={myBlctBalance}*/}
                {/*    totalDeliveryFee={totalDeliveryFee}*/}
                {/*    blctToWon={blctToWon}*/}
                {/*    totalGoodsPrice={totalGoodsPrice}*/}
                {/*    setUsedBlyAmount={setUsedBlyAmount}*/}
                {/*        // onChange={onBlyCheckboxChange}*/}
                {/*/>*/}

                {/* 결제수단 선택 */}
                <PayMethodSelection
                    payMethod={payMethod}
                    // setPayMethod={setPayMethod}
                    totalGoodsPrice={totalGoodsPrice}
                    totalDeliveryFee={totalDeliveryFee}
                    myBlctBalance={myBlctBalance}
                    // totalOrderPrice={totalOrderPrice}
                    blctToWon={blctToWon}
                    usedBlyAmount={usedBlyAmount}
                    onChange={onPayMethodChange}
                    onBlyAllClick={onBlyAllClick}
                    refreshMyBlctBalance={getMyBlctBalance}
                    selectedCardName={selectedCardName}
                    onCardChange={onCardChange}
                    noBlockchain={(consumerInfo)?consumerInfo.noBlockchain:false}
                    history={props.history}
                />

                <HrHeavyX2 />

                {/* 결제 금액 */}
                <PayTotal
                    totalGoodsPrice={totalGoodsPrice}
                    totalDeliveryFee={totalDeliveryFee}
                    usedBlyAmount={usedBlyAmount}
                    totalOrderPrice={totalOrderPrice}
                    blctToWon={blctToWon}
                    couponBlyAmount={couponBlyAmount}
                    couponWonAmount={couponWonAmount}
                    couponInfo={couponInfo}
                />


                <Components.PayButtonFooter
                    // totalOrderPrice={totalOrderPrice}
                    // totalOrderPriceBly={usedBlyAmount}
                    onClick={onBuyClick}
                    disabled={passPhraseModalOpen}
                    // couponWonAmount={couponWonAmount}
                >
                    {
                        totalOrderPrice > 0 && <b> {ComUtil.addCommas(totalOrderPrice-couponWonAmount)}원 결제 예약 </b>

                    }
                    {
                        totalOrderPrice == 0 && <b> {ComUtil.addCommas(ComUtil.roundDown(usedBlyAmount, 2))}BLY 결제 예약 </b>
                    }
                </Components.PayButtonFooter>

            </Div>
            {/*{*/}
            {/*    JSON.stringify(buyingInfo, 2,  null)*/}
            {/*}*/}



            <Components.ModalPassPhrase modalOpen={passPhraseModalOpen} toggle={passPhraseModalToggle} onSuccess={payByBlct} />

            {/*<ToastContainer/>*/}
        </Div>
    );
};

export default withRouter(DealGoodsBuy);

//결제비번 입력 모달
function ModalPassPhrase({modalOpen, toggle, onSuccess}) {
    const [passPhrase, setPassPhrase] = useState()
    // const [isOpen, setIsOpen] = useState(modalOpen)
    // useEffect(() => {
    //     setIsOpen(modalOpen)
    // }, [modalOpen])
    // const toggle = () => setIsOpen(!isOpen)
    const onPassPhraseChange = passPhrase => {
        setPassPhrase(passPhrase)
    }
    const onConfirm = async () => {
        let {data: checkResult} = await checkPassPhrase(passPhrase);

        if (!checkResult) {
            // notify('결제 비번이 틀렸습니다.', toast.error);
            alert('결제 비밀번호가 틀렸습니다.')
            return
        }

        onSuccess()
    }
    return(
        <Modal isOpen={modalOpen} toggle={toggle} centered>
            <ModalHeader toggle={toggle}> 결제비밀번호 입력</ModalHeader>
            <ModalBody className={'p-0'}>
                {/* clearPassPhrase 초기화, onChange 결과값 세팅 */}
                {
                    modalOpen && <PassPhrase clearPassPhrase={false} onChange={onPassPhraseChange}></PassPhrase>
                }
            </ModalBody>
            <ModalFooter>
                {/*<Button color="link" onClick={this.findPassPhrase}>비밀번호를 잊으셨나요?</Button>*/}
                <Button color="info" onClick={onConfirm} disabled={(passPhrase && passPhrase.length === 6) ? false:true}>확인</Button>{' '}
                <Button color="secondary" onClick={toggle}>취소</Button>
            </ModalFooter>
        </Modal>
    )
}



//선물하기
function Gift({giftInfo = {gift: false, senderName: '', giftMsg: giftMsgStore[0].label}, setGiftInfo }) {
    const [selectedGiftMsg, setSelectedGiftMsg] = useState(giftMsgStore[0].value)
    const onChangeGift = () => {
        // setGiftInfo({...giftInfo, gift: !giftInfo.gift})
        setStateValue('gift', !giftInfo.gift)
    }
    const onSenderNameChange = e => {
        // setGiftInfo({...giftInfo, senderName: e.target.value})
        setStateValue('senderName', e.target.value)
    }
    const onGiftMsgSelectChange = e => {
        const value = e.target.value
        const store = giftMsgStore.find(store => store.value === value)
        if (value == 'direct' || value == '') {   //직접입력 or 없음
            setStateValue('giftMsg', '')

        }else{
            setStateValue('giftMsg', store.label)
        }

        setSelectedGiftMsg(store.value)
    }
    const giftMsgInputChange = e => {
        setStateValue('giftMsg', e.target.value)
    }

    const setStateValue = (key, value) => {
        setGiftInfo({...giftInfo, [key]: value})
    }

    return(
        <Div>
            <Flex px={16} py={20}>
                <Checkbox icon={FaGift} bg={'danger'} onChange={onChangeGift} checked={giftInfo.gift} size={'md'}>선물하기</Checkbox>
            </Flex>
            <Collapse isOpen={giftInfo.gift}>
                <Div px={16} pb={16}>
                    <ItemHeader pb={20}>
                        보내는 사람 정보
                    </ItemHeader>
                    <Div>
                        <Flex alignItems={'flex-start'}>
                            <Div fontSize={12} fg={'darkBlack'} minWidth={100}>보내는 사람</Div>
                            <Div flexGrow={1}><Input block value={giftInfo.senderName} onChange={onSenderNameChange} /></Div>
                        </Flex>
                        <Flex alignItems={'flex-start'} mt={10}>
                            <Div fontSize={12} fg={'darkBlack'} minWidth={100}>보내는 메시지</Div>
                            <Div flexGrow={1}>
                                <BasicSelect data={giftMsgStore} onChange={onGiftMsgSelectChange}/>
                                {/*<StyledSelect onChange={onGiftMsgSelectChange}>*/}
                                {/*    {*/}
                                {/*        giftMsgStore.map(item => <option value={item.value}>{item.label}</option>)*/}
                                {/*    }*/}
                                {/*</StyledSelect>*/}
                            </Div>
                        </Flex>
                        {
                            (selectedGiftMsg === 'direct') &&
                            <Input mt={10} block placeholder='보내는 메세지를 입력해 주세요.(최대30자)' maxLength="30" value={giftInfo.giftMsg} onChange={giftMsgInputChange} />
                        }
                        <Flex mt={10} fontSize={12} lighter><RiKakaoTalkFill size={22} color={color.kakao} /><Span ml={8}>입력해 주신 정보로 카카오톡 알림 메시지가 전송됩니다.</Span></Flex>
                    </Div>
                </Div>
            </Collapse>
        </Div>
    )
}

//배송지
function Address({selectedAddress, setSelectedAddress, children}) {
    const [consumerAddresses, setConsumerAddresses] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        searchAddressList()

    }, [])

    //배송지 조회
    const searchAddressList = async () => {
        const {data} = await getConsumer()
        const addressList = data.consumerAddresses

        setConsumerAddresses(addressList)

        console.log('address', addressList)

        //기본 배송지
        let basicAddr = addressList.find(addr => addr.basicAddress === 1)
        // onChange(basicAddr)

        //기본 배송지가 없을경우 첫번째 배송지를 선택
        if (!basicAddr) {
            if (addressList && addressList.length > 0)
                basicAddr = addressList[0]
        }

        setSelectedAddress(basicAddr)
        setLoading(false)
    }

    const onSelectChange = e => {
        const index = e.target.value
        const addr = consumerAddresses[index]
        setSelectedAddress(addr)
    }

    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()

    const toggle = () => {
        setModalState(!modalOpen)
    }

    const onChange = (address) => {
        console.log({address})
        setSelectedAddress(address)
        toggle()
    }



    return(
        <Div>
            <Div px={16} py={20}>
                {
                    loading ? (
                        <Skeleton.List count={1} />
                    ) : (
                        selectedAddress ? (
                            <Div>
                                <Flex pb={20}>
                                    <Space>
                                        <Span fontSize={17}><b>{selectedAddress.receiverName}</b></Span>
                                        <Span fg={'green'} fontSize={13} lineClamp={1}> {selectedAddress.addrName}</Span>
                                    </Space>
                                    <Right>
                                        <Button fontSize={13} bg={'white'} bc={'light'} px={10} height={'100%'} onClick={toggle}>변경</Button>
                                    </Right>
                                </Flex>
                                <Div mb={8} style={{wordBreak: 'break-all'}}>({selectedAddress.zipNo}){selectedAddress.addr}{' '}{selectedAddress.addrDetail}</Div>
                                <Div fg={'dark'}>{selectedAddress.phone}</Div>
                            </Div>
                        ) : (
                            <Div onClick={toggle} py={16} cursor={1} fg={'green'} fontSize={13} textAlign={'center'}>등록된 배송지가 없습니다. <b><u>배송지를 등록</u></b>해 주세요</Div>
                        )
                    )
                }
                {children}
            </Div>
            {
                modalOpen && <AddressList addressIndex={selectedAddress ? selectedAddress.addressIndex : null} onChange={onChange} onClose={toggle}/>
            }
        </Div>
    )
}

//제주도 추가배송 메시지
const JejuText = React.memo(({isJeju}) => {
    if (!isJeju) return null
    return (
        <Div mt={16}>
            <Space rounded={3} bc={'danger'} fg={'danger'} fontSize={12} px={16} py={6} >
                <GiSpeaker style={{marginRight: 8}} size={16}/>
                <span>제주도는 추가 배송비(<b>3,000원</b>)가 부과됩니다.</span>
            </Space>
        </Div>
    )
})

//배송 메세지
function DeliveryMsg({deliveryMsg, setDeliveryMsg}) {
    const [selectedValue, setSelectedValue] = useState(deliveryMsgStore[0].value)
    const onSelectChange = e => {
        const value = e.target.value
        const store = deliveryMsgStore.find(store => store.value === value)
        if (value == 'direct') {   //직접입력
            setDeliveryMsg('')

        }else{
            setDeliveryMsg(store.label)
        }
        setSelectedValue(store.value)
    }

    const onInputChange = e => {
        setDeliveryMsg(e.target.value)
    }

    return(
        <Div mt={16}>
            <Div fontSize={13} mb={5}>배송 요청사항</Div>
            <BasicSelect data={deliveryMsgStore} onChange={onSelectChange}/>
            {/*<StyledSelect onChange={onSelectChange}>*/}
            {/*    {*/}
            {/*        deliveryMsgStore.map(item => <option key={`msg${item.value}`} value={item.value}>{item.label}</option>)*/}
            {/*    }*/}
            {/*</StyledSelect>*/}
            {
                (selectedValue === 'direct') &&
                <Input mt={10} block placeholder='보내는 메세지를 입력해 주세요.(최대30자)' maxLength="30" value={deliveryMsg} onChange={onInputChange} />
            }
        </Div>
    )
}

//상품리스트
const GoodsList = React.memo(({goodsList}) => {
    return(
        <Div>
            <ItemHeader px={16} pt={20} pb={4}>
                주문상품
            </ItemHeader>
            <ListBorder spaceColor={'veryLight'}>
                {
                    goodsList.map(goods =>
                        <ListBorder key={goods.goodsNo} spaceColor={'veryLight'}>
                            <GoodsCard imageUrl={ComUtil.getFirstImageSrc(goods.goodsImages)} goodsNm={goods.goodsNm} deliveryFee={goods.calculatedDeliveryFee} />
                            {
                                goods.options.map(({optionIndex, optionName, optionPrice, orderCnt}) =>
                                    <OptionCard key={`option${optionIndex}`} optionName={optionName} optionPrice={optionPrice} orderCnt={orderCnt} />
                                )
                            }
                        </ListBorder>
                    )
                }
            </ListBorder>
        </Div>
    )
})

//상품리스트 > 상품카드
function GoodsCard({imageUrl, goodsNm, deliveryFee}) {
    return(
        <Flex alignItems={'flex-start'} p={16}>
            <Div flexShrink={0} width={70} height={70}><Img src={imageUrl} alt={goodsNm} /></Div>
            <Div pl={16}>
                <Div>{goodsNm}</Div>
                <Div fg={'green'}>{!deliveryFee ? '무료배송' : `배송비 ${ComUtil.addCommas(deliveryFee)}원` }</Div>
            </Div>
        </Flex>
    )
}

//상품리스트 > 상품카드 > 옵션
function OptionCard({optionName, optionPrice, orderCnt}) {
    return(
        <Flex alignItems={'flex-start'} justifyContent={'space-between'} px={16} py={10}>
            <Div fontSize={14} fg={'darkBlack'}>{optionName}<Span> ({orderCnt}개)</Span></Div>
            <Div fontSize={16} flexShrink={0} pl={16}><b>{ComUtil.addCommas(MathUtil.multipliedBy(optionPrice,orderCnt))}</b>원</Div>
        </Flex>
    )
}

const BlctToWon = styled(Flex)`
    justify-content: center;
    background: ${color.bly};
    padding: ${getValue(3)} ${getValue(8)};
    color: ${color.white};
    font-size: ${getValue(12)};
    border-radius: ${getValue(2)};    
`

const StyledCouponSelect = styled(Select)`        
    & > div {
        min-height: 60px;
    }
`

//쿠폰
function Coupon({totalBlyAmount, onCouponChange, totalOrderPrice, goods}) {
    const [usableCoupons, setUsableCoupons] = useState()
    const [selectedValue, setSelectedCoupon] = useState(0)
    // useEffect(() => {
    //     getCouponList()
    // }, [])

    useEffect(() => {
        getCouponList()
    }, [totalBlyAmount])

    const getCouponList = async () => {
        const {data} = await getUsableCouponList();
        //console.log(data)
        console.log('totalBlyAmount1')
        console.log(totalBlyAmount)
        if (!totalBlyAmount) return; //blyAmount결정된 후에만 아래 제대로 리턴됨.

        if (data) {
            if (data.length == 0) return; //coupon없으면 선택창도 안 띄움,

            const couponList = data.map(item => ({
                value: item.couponNo,
                label: (
                    item.prodGoodsProducerNo ? (
                        <Div fg={'lightgray'}>
                            <Div>
                                <Span bold>
                                    {item.couponTitle}
                                </Span>
                            </Div>
                            <Div fontSize={12}>
                                마이페이지 > 쿠폰 에서 사용가능
                            </Div>
                        </Div>
                    ) : (
                        (item.couponType && item.couponType === 'deliveryCoupon')?
                            <Div>
                                <Div>
                                    <Span bold>
                                        {`${item.couponTitle}`}
                                    </Span>
                                </Div>
                            </Div>
                            :
                            <Div>
                                <Div>
                                    <Span bold>
                                        {`${item.couponTitle} ${item.couponBlyAmount}BLY`}
                                    </Span>
                                </Div>
                                {item.minGoodsPrice > 0 ?
                                    < Div fontSize={12}>주문금액 {ComUtil.addCommas(item.minGoodsPrice)}원 이상 사용가능</Div>
                                    :
                                    < Div fontSize={12}>주문금액 {item.minOrderBlyAmount}BLY 이상 사용가능</Div>
                                }
                            </Div>
                    )
                ),
                couponType: item.couponType,
                couponNo: item.couponNo,
                blyAmount: item.couponBlyAmount,
                minOrderBlyAmount: item.minOrderBlyAmount,
                isDisabled:
                    (item.minOrderBlyAmount > totalBlyAmount || item.couponBlyAmount > totalBlyAmount || (item.minGoodsPrice && totalOrderPrice < item.minGoodsPrice  )) ||
                    item.prodGoodsProducerNo ||
                    (!ComUtil.isMobileApp() && item.onlyAppCoupon) ||
                    (item.couponGoods !== null && goods.goodsNo !== item.couponGoods.targetGoodsNo) ||
                    (item.targetProducerNo && item.targetProducerNo !== goods.producerNo) ||
                    (goods.calculatedDeliveryFee == 0 && item.couponType && item.couponType === 'deliveryCoupon')
                ,
                prodGoodsProducerNo: item.prodGoodsProducerNo
            }));

            couponList.unshift({value:0, label:"사용안함", blyAmount:0})

            setUsableCoupons(couponList);

            setSelectedCoupon(-1)
        }
    }


    if (!totalBlyAmount) return null
    if (!usableCoupons) return null
    if (usableCoupons.length <= 0) {
        return (
            <Div>사용 가능한 쿠폰이 없습니다.</Div>
        )
    }


    return (
        <Div px={16} py={20}>
            <ItemHeader pb={20}>
                쿠폰사용
            </ItemHeader>
            <StyledCouponSelect
                name={'selectCoupon'}
                defaultValue={{ label: "사용안함", value: 0 }}
                options={usableCoupons}
                value={usableCoupons.find(item => item.value === selectedValue)}
                onChange={onCouponChange}
            />
        </Div>
    )

    // return(
    //     <ShadowBox relative>
    //         <Flex mb={16} >
    //             <Div fw={500}>쿠폰 사용</Div>
    //             {/*<Right fg={'adjust'} fontSize={12}>{ this.state.couponBlyAmount > 0 && `${ComUtil.addCommas(calcBlyToWon(this.state.couponBlyAmount, this.state.blctToWon))}원`}</Right>*/}
    //         </Flex>
    //         <StyledCouponSelect
    //             name={'selectCoupon'}
    //             defaultValue={{ label: "사용안함", value: 0 }}
    //             options={usableCoupons}
    //             value={usableCoupons.find(item => item.value === selectedValue)}
    //             onChange={onCouponChange}
    //         />
    //     </ShadowBox>
    // )
}

// 결제 상세
function PayTotal({totalGoodsPrice, totalDeliveryFee, usedBlyAmount, totalOrderPrice, blctToWon, couponBlyAmount, couponWonAmount, couponInfo}) {
    return(
        <Div px={16} py={20}>
            <ItemHeader>
                결제 상세
            </ItemHeader>
            <Div mt={20}>
                <Flex>
                    <Div fontSize={14} fg={'darkBlack'}>총 상품금액</Div>
                    <Right fontSize={16}><b>{ComUtil.addCommas(totalGoodsPrice)}원</b></Right>
                </Flex>
                <Flex mt={10}>
                    <Div fontSize={14} fg={'darkBlack'}>배송비</Div>
                    <Right fontSize={16}>{!totalDeliveryFee ? '무료배송' : `+${ComUtil.addCommas(totalDeliveryFee)}원`}</Right>
                </Flex>

                {couponBlyAmount > 0 &&
                <Flex mt={10} alignItems={'flex-start'}>
                    <Div fontSize={14} fg={'darkBlack'}>쿠폰 사용 {(couponInfo.couponType && couponInfo.couponType==='deliveryCoupon')?' (배송비)':''}</Div>
                    <Right  fontSize={16} textAlign={'right'}>
                        {
                            ' - ' + ComUtil.addCommas(couponBlyAmount.toFixed(2)) + ' BLY  (- ' + ComUtil.addCommas(couponWonAmount) +'원)'
                        }
                    </Right>
                </Flex>
                }
                {
                    usedBlyAmount > 0 && (
                        <Flex mt={10} alignItems={'flex-start'}>
                            <Div fontSize={14} fg={'darkBlack'}>BLY 사용</Div>
                            <Right fontSize={16} textAlign={'right'}>
                                <Span fg={'bly'} >- {ComUtil.addCommas(ComUtil.roundDown(usedBlyAmount, 2))} BLY</Span>
                                <Span ml={8}>(- {ComUtil.addCommas(ComUtil.roundDown(MathUtil.multipliedBy(usedBlyAmount,blctToWon), 2))}원)</Span>
                                {/*<Div>-{ComUtil.addCommas(usedBlyAmount * blctToWon)}원</Div>*/}
                            </Right>
                        </Flex>
                    )
                }


                <Hr mt={20}/>
                <Flex mt={20}>
                    <Div fontSize={14} bold>총 결제 금액</Div>
                    <Right>
                        {/*BLY결제일때는 totalOrderPrice=0 이므로 -쿠폰 필요없음*/}
                        <Div fontSize={20}><b>{ComUtil.addCommas(totalOrderPrice - ((totalOrderPrice > 0)?couponWonAmount:0) )}원</b></Div>
                    </Right>
                </Flex>
                <Div mt={3} textAlign={'right'} fontSize={14} fg={'bly'}>{ComUtil.roundDown(MathUtil.dividedBy((totalOrderPrice - ((totalOrderPrice > 0)?couponWonAmount:0)  ),blctToWon), 2)} BLY</Div>
            </Div>
        </Div>
    )
}

//결제수단 선택
function PayMethodSelection({
                                payMethod,                          //결제수단
                                myBlctBalance,                      //보유 BLY
                                blctToWon,                          //BLY 환율
                                usedBlyAmount,                      //사용한 BLY
                                onChange = () => null,              //paymethod change
                                onBlyAllClick = () => null,
                                refreshMyBlctBalance = () => null,  //포인트 충전 후 새고고침 함수
                                selectedCardName,                   //선택한 카드 ex) kakaopay, naverpay
                                onCardChange = () => null,           //card change
                                noBlockchain,                       //consumer.noBlockchain (블랙체인 미사용시 true)
                                history
                            }) {
    const {isServerLoggedIn} = useLogin()
    const [modalOpen, setModalOpen] = useState(false)

    const searchCertDone = async () => {
        //await 인증서 생성여부 판단
        const {data} = await certApi.getCertDone()
        return data;
    }

    const toggle = async () => {

        //todo : 카카오 본인인증 안되어 있을 경우 인증페이지로 가게
        const certDon = await searchCertDone();
        if(certDon){
            const isOpen = !modalOpen
            if (isOpen) {
                if (!await isServerLoggedIn()) {
                    return
                }
            }
            setModalOpen(isOpen)
        }else{
            history.push({
                pathname: '/kakaoCertCheck',
                state: {
                    tokenName: 'pointToBly',
                }
            })
        }
    }

    return(
        <Div>
            <ItemHeader px={16} pt={20}>
                결제수단
            </ItemHeader>
            <Flex px={16} py={20} onClick={onChange.bind(this, 'card')} cursor={1} alignItems={'flex-start'}>
                <Div><RiRadioButtonFill size={25} color={payMethod === 'card' ? color.green : color.secondary}/></Div>
                <Div  pl={10} flexGrow={1}>
                    <Div bold>간편결제</Div>
                    <Div fontSize={12} mt={5} fg={'darkBlack'}>
                        카카오페이, 네이버페이 등 예약 결제
                    </Div>
                </Div>
            </Flex>
            <Collapse isOpen={payMethod === 'card'} >
                <Div px={20} pb={20}>
                    <CardSelection cardName={selectedCardName} onChange={onCardChange}/>
                </Div>
            </Collapse>
            <Hr />

            {!noBlockchain &&
            <Flex px={16} py={20} onClick={onChange.bind(this, 'blct')} cursor={1} alignItems={'flex-start'}>
                <Div><RiRadioButtonFill size={25} color={payMethod === 'blct' ? color.green : color.secondary}/></Div>
                <Div pl={10} flexGrow={1}>
                    <Flex bold>
                        <Div>BLY결제</Div>
                        <Right fg={'bly'}>보유 {ComUtil.roundDown(myBlctBalance, 2)}BLY</Right>
                    </Flex>
                    <Div fontSize={12} mt={5} fg={'darkBlack'}>
                        BLY는 <Span fg={'danger'}>전액 결제</Span>시 사용 가능
                    </Div>
                </Div>
            </Flex>
            }

            <Collapse isOpen={payMethod === 'blct'} >
                <Div px={16} pb={20}>
                    <Div bc={'backgroundDark'} rounded={2}>
                        <Flex px={16} py={12} justifyContent={'flex-end'} bg={'backgroundDark'}>
                            <BlctToWon ml={'auto'}>
                                1BLY = {ComUtil.addCommas(blctToWon)}원
                            </BlctToWon>
                        </Flex>
                        <Div  px={16} py={16}>
                            <Flex>
                                <Div fontSize={14} bold>보유</Div>
                                <Right>
                                    <Space>
                                        <Div>{ComUtil.addCommas(ComUtil.roundDown(myBlctBalance, 2))} BLY</Div>
                                        <Button bg={'white'} bc={'light'} fg={'darkBlack'} px={8} py={6} onClick={toggle}>포인트로 BLY 충전</Button>
                                    </Space>

                                </Right>
                            </Flex>
                            <Flex mt={10}>
                                <Div fontSize={14} bold>사용</Div>
                                <Right fg={'bly'}>
                                    <Space>

                                        <Div>{ComUtil.addCommas(ComUtil.roundDown(usedBlyAmount || 0, 2))} BLY</Div>

                                        <Button bg={'white'} bc={'light'} fg={'darkBlack'} px={8} py={6} onClick={onBlyAllClick}>전액사용</Button>
                                    </Space>

                                </Right>
                            </Flex>
                            <Flex mt={10}>
                                <Div fontSize={14} fg={'darkBlack'}>잔고</Div>
                                <Right>{ComUtil.addCommas(ComUtil.roundDown(myBlctBalance - usedBlyAmount, 2))} BLY</Right>
                            </Flex>
                        </Div>
                    </Div>
                </Div>
            </Collapse>

            <Modal isOpen={modalOpen} toggle={toggle} centered>
                <ModalHeader toggle={toggle}>포인트 전환하기</ModalHeader>
                <ModalBody>
                    <PointToBlyContent onSuccess={refreshMyBlctBalance}/>
                </ModalBody>
            </Modal>
        </Div>
    )
}

//카드 선택 박스
const CardBox = styled(Flex)`
    justify-content: center;
    min-height: ${getValue(100)};
    cursor: pointer;
    border-radius: ${getValue(4)};
    font-weight: 700;
    transition: all 0.3s ease;
    ${p => p.selected ? `
        border: 1px solid ${color.green};
        background: ${color.green};
        color: ${color.white};
    ` : `
        border: 1px solid ${color.veryLight};
        background: ${color.white};
        color: ${color.secondary};
    `}         
`
const KakaoCardBox = styled(Flex)`
    justify-content: center;
    min-height: ${getValue(100)};
    cursor: pointer;
    border-radius: ${getValue(4)};
    font-weight: 700;
    transition: all 0.3s ease;
    ${p => p.selected ? `        
        background: ${color.kakao};
        color: ${color.black};
    ` : `        
        background: #DADDE1;
        color: ${color.white};
    `}         
`
const NaverCardBox = styled(Flex)`
    justify-content: center;
    min-height: ${getValue(100)};
    cursor: pointer;
    border-radius: ${getValue(4)};
    font-weight: 700;
    transition: all 0.3s ease;
    ${p => p.selected ? `
        // border: 1px solid ${color.green};
        background: ${color.naver};
        // color: ${color.white};
    ` : `
        // border: 1px solid ${color.veryLight};
        background: #DADDE1;
    `}         
`

const DisabledCardBox = styled(Flex)`
    justify-content: center;
    min-height: ${getValue(100)};
    border-radius: ${getValue(4)};
    font-weight: 700;
    transition: all 0.3s ease;
    // border: 1px solid ${color.veryLight};
    background: #DADDE1;
    color: ${color.white};       
`

const PaymentButton = ({active, onClick, children, ...rest}) => {
    return(
        <Flex
            cursor={1}
            rounded={4}
            // width={200}
            height={70}
            justifyContent={'center'}
            bg={active ? 'white' : 'light'}
            bc={active ? 'green' : 'light'}
            onClick={onClick}
            custom={`
                transition: 0.2s;
            `}
            {...rest}
        >
            {children}
        </Flex>
    )
}

//카드들
const CardSelection = React.memo(({cardName, onChange}) => {
    return(
        <GridColumns repeat={2} colGap={8} rowGap={8}>
            <PaymentButton active={cardName === 'naverpay'} onClick={onChange.bind(this, 'naverpay')}>
                <img src={NaverPay} style={{height: 22}} />
            </PaymentButton>
            <PaymentButton active={cardName === 'kakaopay'} onClick={onChange.bind(this, 'kakaopay')}>
                <img src={KakaoPay} style={{height: 22}} />
            </PaymentButton>

            {/*<KakaoCardBox*/}
            {/*    selected={cardName === 'kakaopay'}*/}
            {/*    onClick={onChange.bind(this, 'kakaopay')}>*/}
            {/*    <Space spaceGap={8}>*/}
            {/*        <RiKakaoTalkFill size={30}/>*/}
            {/*        <Div fg={cardName === 'kakaopay'?'black':'white'} bold>카카오페이</Div>*/}
            {/*        */}
            {/*    </Space>*/}
            {/*</KakaoCardBox>*/}
            {
                // Server._serverMode() === 'production'?
                //     <DisabledCardBox>
                //         <Flex justifyContent={'center'}>
                //             <Flex
                //                 px={16}
                //             >
                //                 <img src={NPay} height={30} />
                //             </Flex>
                //         </Flex>
                //         {/*<Space>*/}
                //         {/*    <SiNaver size={25} color={'white'}/>*/}
                //         {/*    <Div fg={'white'}>Pay 구매하기</Div>*/}
                //         {/*</Space>*/}
                //     </DisabledCardBox>
                //     :
                //     <NaverCardBox
                //         selected={cardName === 'naverpay'}
                //         onClick={onChange.bind(this, 'naverpay')}
                //     >
                //
                //         <img src={KakaoPay} style={{height: 24}} />
                //
                //         {/*<Flex justifyContent={'center'}>*/}
                //         {/*    <Flex*/}
                //         {/*        px={16}*/}
                //         {/*    >*/}
                //         {/*        <img src={NPay} height={30} />*/}
                //         {/*    </Flex>*/}
                //         {/*</Flex>*/}
                //
                //     </NaverCardBox>
            }
        </GridColumns>
    )
})



//하단 결제 예약 버튼
function PayButtonFooter({totalOrderPrice, totalOrderPriceBly, onBuyClick, disabled, couponWonAmount}) {
    return(
        <>
            {/* Dummy box */}
            <Div height={80}></Div>
            <Fixed bottom={0} width={'100%'} height={80} p={8} bc={'light'} bl={0} br={0} bb={0} bg={'white'}>
                <Button bg={'green'} fg={'white'} height={'100%'} fontSize={20} block onClick={onBuyClick} disabled={disabled}>
                    {totalOrderPrice > 0 &&
                    <b> {ComUtil.addCommas(totalOrderPrice-couponWonAmount)}원 결제 예약 </b>
                    }
                    {totalOrderPrice == 0 && //BLY
                    <b> {ComUtil.addCommas(ComUtil.roundDown(totalOrderPriceBly, 2))}BLY 결제 예약 </b>
                    }
                </Button>
            </Fixed>
        </>
    )
}