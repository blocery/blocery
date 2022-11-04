import React, {useEffect, useState, useMemo, useCallback, useRef, Fragment} from 'react';
import {Webview} from "~/lib/webviewApi";
import BackNavigation from "~/components/common/navs/BackNavigation";
import {giftMsgStore} from "~/store";
import SquareImage from '~/images/icons/squ-02.png'
import {
    Button,
    Div,
    Fixed,
    Flex,
    GridColumns, Hr, Img,
    Input,
    JustListSpace,
    ListBorder, ListSpace,
    Right, Space, Span, Strong
} from "~/styledComponents/shared";
import ShopBlyLayouts from '~/styledComponents/ShopBlyLayouts'
import Components from '../components/Components'
import useLogin from "~/hooks/useLogin";
import {HrHeavyX2} from "~/styledComponents/mixedIn";
import {initIMPHeadScript} from "~/util/PgUtil";
import {BLCT_TO_WON, exchangeWon2BLCT} from "~/lib/exchangeApi";
import {getProducerListByProducerNos} from '~/lib/producerApi'
import {getGoodsByGoodsNo, getGoodsListByGoodsNos} from "~/lib/goodsApi";
import {getSumInfoByGoods} from "~/util/bzLogic";
import ComUtil from "~/util/ComUtil";
import MathUtil from "~/util/MathUtil";
import Atoms from '../components/Atoms'
import {
    getNotDeliveryZipNo,
    getUsableCouponList,
    canBuyOptionGoods,
    getSuperRewardTicketStatusByGoodsNos, addOrdersTemp, getConsumer, getPotenCouponMaster
} from "~/lib/shopApi";
import BasicSelect from "~/components/common/selectBoxes/BasicSelect";
import {checkMyBlctAmount, scOntGetBalanceOfBlct, scOntOrderGoodsBlct} from "~/lib/smartcontractApi";
import {BadgeGoodsEventType, BadgeSharp, Bold, Required} from "~/styledComponents/ShopBlyLayouts";
import NPay from '~/images/icons/sns/naver_pay.svg'
import KakaoPay from '~/images/icons/sns/kakao_pay.svg'
import moment from 'moment-timezone'
import {getValue} from "~/styledComponents/Util";
import {color} from "~/styledComponents/Properties";
import {IoMdCloseCircle} from "react-icons/io";
import {Collapse} from "reactstrap";
import {useModal} from "~/util/useModal";
import {toast} from "react-toastify";
import {Server} from "~/components/Properties";
import {deliveryMsgStore} from '~/store'
import { BlockChainSpinner } from '~/components/common'
import BlocerySpinner from "~/components/common/Spinner/BlocerySpinner";
import {SingleDatePicker} from "react-dates";
import _ from 'lodash'
import {AboutBlyPriceContent, AboutNotSurpportedTimeSaleCouponContent} from "../components/ToastContents";
import InfoButton from "~/components/common/buttons/InfoButton";
import Toast from "~/components/common/toast/Toast";
import Slider from "~/components/common/Slider";
import {FixedScrollUpButton} from "~/components/common/buttons/ScrollUpButton";
import styled from "styled-components";
import Checkbox from "~/components/common/checkboxes/Checkbox";

/** 전역변수 설정 **/

//쿠키 developerMode 에 오늘 날짜가 있으면 화면에 정보를 보여줌
const DEVELOPER_MODE = ComUtil.isDeveloperMode()

//소수점 내림 ( 주의 : 결제하기 클릭시 order 데이터 생성의 BLCT 에만 적용 되어있음 )
const MID_POINT_ROUNDING_NUMBER = 2

// 제주도 추가 배송비 설정
const JEJU_DELIVERY_FEE = 3000

// 결제방법
const payPgGubuns = [{label: '신용카드', value: 'card'}, {label: '네이버페이', value: 'naverpay', icon: NPay}, {label: '카카오페이', value: 'kakaopay', icon: KakaoPay}]


const LOADING = {
    DATA_FETCH: 'dataFetch',
    BLOCKCHAIN: 'blockchain',
    NONE: ''
}
/*

    // [생산자별 > 서브그룹별 > 상품리스트]
    const producerObj = {
        90: {                       //producerNo
            producer: {...},        //생산자 정보
            subGroupList: [         //서브그룹 리스트
                {
                    subId: 0,       //subGroupSumObj[0] 과 대응
                    goodsList: [    //상품리스트
                        {...},      //options 안에는 orderCnt 가 들어있음
                        {...},
                    ]
                },
                {
                    subId: 1,       //subGroupSumObj[1] 과 대응
                    goodsList: [    //상품리스트
                        {...},      //options 안에는 orderCnt 가 들어있음
                        {...},
                    ]
                },
            ]
        }
    }

    //서브그룹 오브젝트
    const subGroupSumObj = {
        0: { //subId
            goodsPrice: 15000,      //상품금액: 옵션의 sum(currentPrice * orderCnt)
            couponWonAmount: 1920,
            couponBlyAmount: 74,    //쿠폰사용(bly)
            deliveryFee: 2500,      //배송비
            jejuDeliveryFee: 0,     //제주도 배송비
            orderPrice: 9999,        //총 주문금액(계산된)
            couponNo: 3,            //쿠폰번호,
            couponType : '',        //쿠폰타입
            couponList: [{value: '', label: '', data: {...}}] // [주의] 포텐타임 쿠폰일 경우 value는 -1이고 data에는 couponMaster 가 들어있음
            goodsNoList: []
        },
        1: {...},
        2: {...},
    }

    //전체집계 오브젝트
    const totalSumObj = {
            goodsPrice,                     //
            couponWonAmount,                //sum(subGroupSumObj.couponWonAmount)
            couponBlyAmount,                //sum(subGroupSumObj.couponBlyAmount)
            deliveryFee,                    //배송비 sum(subGroupSumObj.deliveryFee)
            jejuDeliveryFee,                //제주도 배송비 sum(subGroupSumObj.jejuDeliveryFee)
            orderPrice,                     //sum(subGroupSumObj.orderPrice)
            orderBly,                       //sum(subGroupSumObj.orderPrice) * bly환율
            usedBlyAmount,                  //사용한 블리 합계 (사용한 쿠폰 bly 미포함)
            payableBlct: 30,                //상품가에서 사용 가능한 bly(내가 가진 한도 내에서)
            needToPayOrderBly: 40,          //최종 주문금액 bly (화면의 최종 결제가)
            needToPayOrderPrice: 1000,      //최종 주문금액 won (화면의 최종 결제가)
            payMethod: 'blct' or 'card' or 'cardBlct'
        }

    //장바구니에서 넘어온 상품번호 배열
    goodsNosRef.current = [2,3,4,5]

    //장바구니에서 넘어온 상품 오브젝트. 옵션별 orderCnt 가 핵심
    cartGoodsObjRef.current = {
        532: {
            "goodsNo": 532,
            "options": [
                {
                    "optionName": "[option goods] 디팜참다래",
                    "optionIndex": 0,
                    "optionImages": {
                        "imageNo": 0,
                        "imageUrlPath": "",
                        "imageUrl": "2021/11/1Tg1lurc2Ro5.png",
                        "imageThumbUrl": null,
                        "imageNm": "키위.png"
                    },
                    "packCnt": 1000,
                    "remainedCnt": 995,
                    "cancelledCnt": 19,
                    "optionPrice": 800,
                    "deleted": false,
                    "orderCnt": 2,
                    "goodsNm": "[로컬묶음테스트] 디팜참다래-과세상품"
                }
            ]
        }
    }

    //상품번호별 포텐타임 쿠폰
    //포텐타임 쿠폰은 value 가 -1 이고, data 에는 couponMaster 가 들어있다.
    potenTimeCouponObjRef.current = {
        "584":{
                "value":-1,
                "label":"감격의 포텐타임 쿠폰 상시판매가 기준 83% 할인",
                "data":{"masterNo":196,"couponType":"potenCoupon","potenCouponGoodsNo":584,"potenCouponGoodsPrice":56000,"potenCouponProducerNo":46,"potenCouponProducerFarmNm":"뫄뫄농장","potenCouponGoodsNm":"[옵션상품]희망배송일상품","potenCouponDiscount":83.92857142857143,"prodGoodsProducerNo":0,"useDuration":30,"startDay":0,"endDay":0,"totalCount":100,"remainCount":99,"deleted":false,"targetGoods":[],"fixedWon":0,"couponTitle":"감격의 포텐타임 쿠폰","couponBlyAmount":3825.803825803826,"minGoodsPrice":0,"couponDiscountRate":0,"minOrderBlyAmount":0,"couponMemo":"감격의 포텐쿠폰","timestamp":"2022-04-11T02:17:06.085+0000"}
        }
    }

*/


function toWon(n) {
    return ComUtil.addCommas(MathUtil.roundHalf(n))
}

//상품번호 및 펼쳐진 상품리스트 추출
function getGoodsInfo(optionGoodsInfo) {
    const goodsNos = []
    const cartGoodsObj = {}
    optionGoodsInfo.map(goodsList =>
        goodsList.map(item => {
            goodsNos.push(item.goodsNo)
            cartGoodsObj[item.goodsNo] = item
        })
    )

    return {
        goodsNos,
        cartGoodsObj
    }
}


//생산자번호 추출
function getProducerNos(goodsList) {
    const producerNos = []
    goodsList.map(goods => {
        if (!producerNos.includes(goods.producerNo)) {
            producerNos.push(goods.producerNo)
        }
    })
    return producerNos
}

function getIsLocal(goodsList){
    return goodsList.filter(goods => goods.localfoodFarmerNo > 0).length > 0
}

//서브그룹 상품리스트로 계산된 subGroupSumObj 반환
function getCalculatedSubGroupSumObjByGoodsList(producer, subGroupGoodsList, isJeju, couponList, additionalCouponList, blctToWon) {

    //묶음배송지원 여부
    let producerWrapDelivered = subGroupGoodsList[0].producerWrapDelivered
    let goodsPrice = 0          //상품금액
    let couponWonAmount = 0     //쿠폰사용 원화(환전된)
    let couponBlyAmount = 0     //쿠폰사용 bly
    let deliveryFee = 0         //배송비
    let jejuDeliveryFee = isJeju ? JEJU_DELIVERY_FEE : 0 //제주 배송비
    let orderPrice = 0          //주문금액
    let couponNo = 0            //쿠폰번호
    let couponType = ''         //쿠폰타입

    let goodsNoList = []        //goodsNo

    //추가된 쿠폰이 있다면..
    if(additionalCouponList && additionalCouponList.length > 0) {
        couponList.unshift(...additionalCouponList)

        const addCoupon = additionalCouponList[0]

        couponNo = addCoupon.value
        couponWonAmount = MathUtil.roundHalf(MathUtil.multipliedBy(addCoupon.data.couponBlyAmount, blctToWon))
        couponBlyAmount = addCoupon.data.couponBlyAmount
        console.log("isPotenTimeCouponAdded", {addCoupon, couponNo, couponWonAmount, couponBlyAmount})
    }

    subGroupGoodsList.map(goods => {

        //상품별 상품금액, 배송비 계산
        const calculated = getSumInfoByGoods(goods)
        goodsPrice += calculated.goodsPrice
        deliveryFee += calculated.deliveryFee

        goodsNoList.push(goods.goodsNo);
    })

    //묶음배송 지원 상품 일 경우
    if (producerWrapDelivered) {
        //상품금액 합계가 생산자의 묶음배송가능 기준금액 이상이면 무조건 0원
        if (goodsPrice >= producer.producerWrapLimitPrice) {
            deliveryFee = 0;
        }else{
            deliveryFee = producer.producerWrapFee  // 묶음배송 택배비로 세팅
        }
    }

    orderPrice = goodsPrice + deliveryFee + jejuDeliveryFee - couponWonAmount

    //생산자 번호
    const producerNo = producer ? producer.producerNo : subGroupGoodsList[0].producerNo

    return {
        goodsPrice,
        couponWonAmount,
        couponBlyAmount,
        deliveryFee,
        jejuDeliveryFee,
        orderPrice,
        couponNo,
        couponType,
        couponList,
        goodsNoList,
        producerNo,
        localfoodFlag:producer.localfoodFlag
    }
}

// 입력된 우편번호가 도서산간인지 체크
async function isNotDeliveryZipNo(zipNo) {

    const {data} = await getNotDeliveryZipNo(zipNo);

    if (data !== 100) {
        return true
    }
    return false
}

/** 상품 리스트에서 필수값 체크 **/
function checkGoodsListValidation(goodsOrgList) {
    return goodsOrgList.every(goodsOrg => {
        if (goodsOrg.hopeDeliveryFlag && !goodsOrg.hopeDeliveryDate) {
            alert(`${goodsOrg.goodsNm} 상품은 희망배송일을 지정해야 하는 상품 입니다. 희망배송일을 지정해 주세요.`);
            return false
        }
        return true
    })

}

const CheckBoxFlex = styled(Flex)`
    align-items: flex-start;
    
    & > span:first-child {
        padding: 0;
        margin-right: ${getValue(8)};
    } 
    
    margin-bottom: ${getValue(16)};
`;

const OptionGoodsBuy = (props) => {

    const {consumer, isServerLoggedIn} = useLogin()

    //쿠키에 담긴 구매정보(즉시구매, 장바구니구매 동일한 포맷)
    const ls = localStorage.getItem("optionGoodsBuyingInfo") ? JSON.parse(localStorage.getItem("optionGoodsBuyingInfo")) : null

    const optionGoodsBuyingInfoRef = useRef({
        isError: ls ? false : true,
        buyType: (ls && ls.isCart) ? 'cart' : 'direct',
        gift: (ls && ls.buyingType === 'gift'),
        optionGoodsInfo: (ls && ls.optionGoodsInfo) ? ls.optionGoodsInfo : null
    })

    // const [optionGoodsBuyingInfo, setOptionGoodsBuyingInfo] = useState({
    //     isError: ls ? false : true,
    //     buyType: (ls && ls.isCart) ? 'cart' : 'direct',
    //     gift: (ls && ls.buyingType === 'gift'),
    //     optionGoodsInfo: (ls && ls.optionGoodsInfo) ? ls.optionGoodsInfo : null
    // })

    const [stdInfo, setStdInfo] = useState({
        blctToWon: 0,       //bly 환율
        couponList: [],     //쿠폰리스트
        tokenBalance: 0,    //사용가능 blct
        loading: true,
        buyType: optionGoodsBuyingInfoRef.current.buyType
    })

    const [goodsOrgList, setGoodsOrgList] = useState([])          //상품 원본 목록
    const [producerOrgList, setProducerOrgList] = useState([])    //생산자 원본 목록
    const [producerObj, setProducerObj] = useState({})            //뷰어용 생산자별 상품 obj (구조는 상단 참조)
    const [subGroupSumObj, setSubGroupSumObj] = useState({})      //뷰어용 서브그룹집계 obj (구조는 상단 참조)


    //쿠키에서 넘어온 값을 하나로 펼쳐진 상품번호 배열
    const goodsNosRef = useRef([]);
    //상품 옵션별 수량이 담긴 오브젝트
    const cartGoodsObjRef = useRef([]);
    //포텐타임 쿠폰 오브젝트
    const potenTimeCouponObjRef = useRef({})

    //슈퍼리워드 티켓 발부여부
    const superRewardTicketStatusRef = useRef({resCode: 0, errMsg: ''});

    //선물 정보
    const [giftInfo, setGiftInfo] = useState({
        gift: optionGoodsBuyingInfoRef.current.buyingType === 'gift' ? true : false,
        senderName: '',
        giftMsg: giftMsgStore[0].label
    })
    const [selectedAddress, setSelectedAddress] = useState()
    const [isJeju, setJeju] = useState(false)        //제주도 여부
    const [commonEnterFlag, setCommonEnterFlag] = useState(false);
    const [commonEnterPwd, setCommonEnterPwd] = useState("")    //공동현관 출입번호
    const [deliveryMsg, setDeliveryMsg] = useState(deliveryMsgStore[0].label)      //배송메세지
    //야간(새벽)에도 로컬배송 알람받기 (default=false=7시 알람)
    const [localNightAlarm, setLocalNightAlarm] = useState(false)

    const [payPgGubun, setPayPgGubun] = useState()

    const [isLocal,setIsLocal] = useState(false)
    const [payCheck,setPayCheck] = useState(false)
    const onPayCheckBoxChange = (e) => {
        setPayCheck(e.target.checked);
    }

    //결제비번 모달
    const [modalOpen, setModalOpen, selected, setSelected, setModalState, toggle] = useModal()

    const [loadingType, setLoadingType] = useState(LOADING.DATA_FETCH)

    useEffect(() => {
        if (optionGoodsBuyingInfoRef.current.isError) {
            alert('잘못된 접근입니다.');
            closePopup()
        }else{
            //iamport 스크립트 추가
            initIMPHeadScript()
            init()
        }
    }, [])

    //초기 바인딩
    const init = async () => {

        //blct 환율, 쿠폰리스트 조회
        const res = await Promise.all([
            searchBlctToWon().then(data => stdInfo.blctToWon = data),
            scOntGetBalanceOfBlct(consumer.account).then(res => stdInfo.tokenBalance = res.data),
            searchCouponList().then(data => data)
        ])

        const blctToWon = res[0]
        const tokenBalance = res[1]
        let couponList = res[2]

        couponList = couponList.map(coupon => {
            let onlyAppCoupon = coupon.onlyAppCoupon ? '(APP전용)' : '';
            return ({
                value:coupon.couponNo,
                label: (coupon.couponType==='deliveryCoupon')? `${coupon.couponTitle}${onlyAppCoupon} [상품 금액 배송비 이상 사용 가능]`
                        : `${coupon.couponTitle}${onlyAppCoupon} [${toWon(MathUtil.multipliedBy(coupon.couponBlyAmount,blctToWon), 0)}원 / 상품금액 ${toWon(coupon.minGoodsPrice || MathUtil.multipliedBy(coupon.minOrderBlyAmount,blctToWon))}원 이상 사용가능]`,
                data: coupon
            })
        })

        console.log("init() stdInfo 세팅", {blctToWon, tokenBalance, couponList})

        setStdInfo({blctToWon, tokenBalance, couponList})

    }

    useEffect(() => {
        if (!stdInfo.loading) {
            searchGoods()
        }
    }, [stdInfo])


    useEffect(() => {
        if (selectedAddress) {
            //제주도 여부 바인딩
            ComUtil.isJeju(selectedAddress.zipNo).then(res => {
                //추가배송비 유무가 바뀌었을때
                if (res !== isJeju) {
                    //배송지 변경 후 다시 계산
                    setJeju(res)

                    //추가 배송비(제주도) 적용 or 미적용
                    const newSubGroupSumObj = Object.assign({}, subGroupSumObj)
                    Object.values(newSubGroupSumObj).map(subGroup => {
                        subGroup.jejuDeliveryFee = res === true ? JEJU_DELIVERY_FEE : 0
                    })

                    //서브그룹 갱신
                    calcSubGroupSumObj(newSubGroupSumObj)
                }
            })
        }
    }, [selectedAddress])

    //상품 원본 & 뷰어용 상품 조회
    const searchGoods = async() => {

        setLoadingType(LOADING.DATA_FETCH)

        //localStorage => state 에 저장된 값
        const optionGoodsInfo = optionGoodsBuyingInfoRef.current.optionGoodsInfo

        //파라미터로 넘어온 정보에서 상품번호 추출
        const {goodsNos, cartGoodsObj} = getGoodsInfo(optionGoodsInfo)

        //상품번호로 상품목록 db 조회
        const {data: goodsOrgList} = await getGoodsListByGoodsNos(goodsNos)

        //로컬상품 체크 (체크박스 동의용)
        const bIsLocal = getIsLocal(goodsOrgList);
        setIsLocal(bIsLocal);

        //상품목록 원본 저장
        setGoodsOrgList(goodsOrgList)

        //상품목록에서 생산자번호 추출
        const producerNos = getProducerNos(goodsOrgList)

        //생산자번호로 생산자목록 db 조회
        const {data: producerOrgList} = await getProducerListByProducerNos(producerNos)

        //생산자목록 원본 저장
        setProducerOrgList(producerOrgList)

        /** ref 세팅 **/
        //카트에서 넘어온 상품번호들
        goodsNosRef.current = goodsNos
        //카트에서 넘어온 상품 오브젝트
        cartGoodsObjRef.current = cartGoodsObj

        console.log("쿠키 및 ref ", {localStorage: ls, goodsNosRef: goodsNosRef.current, cartGoodsObjRef: cartGoodsObjRef.current})
        console.log("searchGoods 호출 ", {optionGoodsInfo, producerOrgList, goodsOrgList})

        // //상품이 여러개 일 경우 포텐타임 상품이 있는지 체크
        // let potenTimeGoodsName = ''
        const potenTimeCouponPromises = []
        const potenTimeCouponObj = {}
        let tempPotenTimeCouponNo = 0

        //살 수 있는 상품 카운트
        // let activeOptionCount = 0

        /** DB 의 상품과 카트에 담긴 옵션 Sync **/
        goodsOrgList.map(goodsOrg => {

            //DB 와 장바구니 옵션 비교하여 보정(DB 의 옵션이 deleted = false 인 것만 장바구니 옵션에 다시 담는다)
            // const cartGoods = cartGoodsObjRef.current[goodsOrg.goodsNo]
            // const activeOptions = []
            // goodsOrg.options.map(option => {
            //     if (!option.deleted) {
            //         const activeOption = cartGoods.options.find(cgOption => cgOption.optionIndex === option.optionIndex)
            //         if (activeOption) {
            //             activeOptions.push(activeOption)
            //             activeOptionCount++
            //         }
            //     }
            // })

            //상품의 옵션의 하나도 없는 경우
            // if (activeOptions.length === 0) {
            //     console.log("삭제된 goodsNo:"+goodsOrg.goodsNo)
            //
            //     //flattened 장바구니 sync
            //     delete cartGoodsObjRef.current[goodsOrg.goodsNo]
            //
            // }else{
            //cart options sync
            // cartGoods.options = activeOptions

            if (goodsOrg.timeSale && goodsOrg.inTimeSalePeriod) {

                // potenTimeGoodsName = potenTimeGoodsName + goodsOrg.goodsNm + ', '
                potenTimeCouponPromises.push(getPotenCouponMaster(goodsOrg.goodsNo).then(({data: coupon}) => {

                    //포텐타임 쿠폰번호는 -1, -2, ... 이다
                    tempPotenTimeCouponNo = tempPotenTimeCouponNo - 1

                    console.log("포텐타임 상품 goodsOrg:",{
                        goodsNo: goodsOrg.goodsNo,
                        goodsOrg: goodsOrg,
                        cartGoods: cartGoodsObjRef.current[goodsOrg.goodsNo]
                    })

                    const goodsPrice = getGoodsPrice(goodsOrg)

                    //포텐타임의 할인율 만큼 bly 지원 (지원 bly * 구매수량)
                    let couponBlyAmount = (goodsPrice * (coupon.potenCouponDiscount / 100)) / stdInfo.blctToWon

                    console.log("tempPotenTimeCouponNo", tempPotenTimeCouponNo)

                    potenTimeCouponObj[goodsOrg.goodsNo] = {
                        value: tempPotenTimeCouponNo,
                        label: `${coupon.couponTitle} 상시판매가 기준 ${ComUtil.roundDown(coupon.potenCouponDiscount,0)}% 할인`,
                        data: {...coupon, couponBlyAmount: couponBlyAmount}
                    }
                }))
            }
            // }

        })

        const newOptionGoodsInfo = []

        // const newGoodsList = [{...}, {...}]

        //subgroupList sync
        // optionGoodsInfo.map(goodsList => {
        //     const newGoodsList = []
        //     goodsList.map(goods => {
        //         const cartGoods = cartGoodsObjRef.current[goods.goodsNo]
        //         if (cartGoods) {
        //             newGoodsList.push(cartGoods)
        //         }
        //     })
        //
        //     if (newGoodsList.length > 0) {
        //         newOptionGoodsInfo.push(newGoodsList)
        //     }
        // })

        //producerOrgList sync

        console.log("보정 이후 카트 ref ", cartGoodsObjRef.current)

        // if (activeOptionCount === 0) {
        //     alert('구입하려는 상품은 현재 판매중이지 않습니다.');
        //     closePopup()
        //     return
        // }


        await Promise.all(potenTimeCouponPromises)

        potenTimeCouponObjRef.current = potenTimeCouponObj

        console.log({potenTimeCouponObjRef: potenTimeCouponObjRef.current })

        //전체 계산 갱신
        calcAll(optionGoodsInfo, producerOrgList, goodsOrgList)
        // calcAll(newOptionGoodsInfo, producerOrgList, goodsOrgList)

        setLoadingType(LOADING.NONE)

        // //포텐타임 상품이 있을 경우 (사용자 에게 알려주기)
        // if (goodsOrgList.length > 1 && potenTimeGoodsName.length > 0) {
        //     alert(`포텐타임 상품은 개별 주문해야 합니다. (${potenTimeGoodsName.substr(0, potenTimeGoodsName.length-2)})`)
        // }
    }

    //상품의 옵션(상품가 * 수량) 가격 리턴
    const getGoodsPrice = (goods) => {
        let goodsPrice = 0
        const cgOptions = cartGoodsObjRef.current[goods.goodsNo].options
        cgOptions.map(cgOption => {
            const dbOption = goods.options.find(option => option.optionIndex === cgOption.optionIndex)
            const optionPrice = dbOption.optionPrice;
            const orderCnt = cgOption.orderCnt
            goodsPrice += MathUtil.multipliedBy(optionPrice, orderCnt)
        })
        return goodsPrice
    }

    const notSupportedTimeSaleGoodsObjRef = useRef()

    //전체 계산 갱신
    const calcAll = (optionGoodsInfo, producerOrgList, goodsOrgList) => {

        console.log("calcAll 호출")

        const producerObj = {}
        //서브그룹별 집계
        const newSubGroupSumObj = {}

        /** 생산자별 서브그룹 기본값 생성 **/
        producerOrgList.map(producer => producerObj[producer.producerNo] = {
            producer: producer,
            subGroupList: []
        })

        //장바구니에 담은 정보로 생산자별 > 서브그룹별 > 상품리스트 추가
        optionGoodsInfo.map((subGoodsList, subId) => {

            let producer;

            const addedSubGoodsList = []

            //서브그룹 상품 리스트
            subGoodsList.map((subGoods, index) => {

                //db 상품
                const orgGoods = goodsOrgList.find(goods => goods.goodsNo === subGoods.goodsNo)

                //옵션 병합 (오리지널 옵션 + orderCnt)
                const options = subGoods.options.map(option => {
                    const orgOption = orgGoods.options.find(orgOption => orgOption.optionIndex === option.optionIndex)
                    return{
                        ...orgOption,
                        orderCnt: option.orderCnt
                    }
                })

                //옵션 정렬
                // ComUtil.sortNumber(options, 'optionIndex', false) 원래코드
                ComUtil.sortNumber(options, 'sortNum', false)

                //상품 + 옵션
                const newGoods = { ...orgGoods, options: options }

                /** 서브그룹에 상품이 2개 이상(묶음) 일때 포텐타임 상품이 있는지 체크 **/
                if (subGoodsList.length > 1 && orgGoods.timeSale && orgGoods.inTimeSalePeriod) {
                    /** 묶음 상품의 포텐타임은 지원여부 **/
                    newGoods.isNotSupportedTimeSale = true
                }

                addedSubGoodsList.push(newGoods)

                //생산자 찾기
                if (index === 0) {
                    producer = producerOrgList.find(producer => producer.producerNo === newGoods.producerNo)
                }

            })


            const subCouponList = Object.assign([], stdInfo.couponList)

            //hook으로 추가될 쿠폰(ex: 포텐타임 쿠폰)
            const additionalCouponList = [];

            //포텐타임 상품이 서브그룹에 하나일 경우 포텐타임 쿠폰 추가 (hook)
            if (subGoodsList.length === 1) {
                const goods = addedSubGoodsList[0]
                if (goods.timeSale && goods.inTimeSalePeriod) {
                    const addCoupon = potenTimeCouponObjRef.current[goods.goodsNo]
                    if (addCoupon) {
                        additionalCouponList.push(addCoupon)
                    }
                }
            }

            /** 서브그룹별 집계 계산 [총 합계를 쉽게 계산위한 기억용]
             goodsPrice,         //상품금액
             couponWonAmount,    //쿠폰사용금액 (환전된)
             couponBlyAmount,    //쿠폰사용 bly
             deliveryFee,        //배송비
             jejuDeliveryFee,    //제주 배송비
             orderPrice          //주문금액
             couponNo,            //쿠폰번호
             couponType,         //쿠폰타입
             couponList: []      //쿠폰 리스트
             **/
            newSubGroupSumObj[subId] = getCalculatedSubGroupSumObjByGoodsList(producer, addedSubGoodsList, isJeju, subCouponList, additionalCouponList, stdInfo.blctToWon)

            /** 서브그룹 추가 **/
            producerObj[producer.producerNo].subGroupList.push({
                subId: subId,
                goodsList: addedSubGoodsList,
            });
        })

        console.log("newSubGroupSumObj", newSubGroupSumObj)

        /** [결제상세] 뷰어용 서브그룹 총 집계 바인딩 **/

        /** 뷰어용 서브그룹별 집계 바인딩 **/
        setSubGroupSumObj(newSubGroupSumObj)

        /** 뷰어용 바인딩 **/
        setProducerObj(producerObj)


        console.log("calcAll 호출 ", {newSubGroupSumObj, producerObj})

    }

    const getCombinedSubCouponList = () => {

    }

    //서브그룹 갱신//calcSubGroupOrderPrice
    const calcSubGroupSumObj = (subGroupSumObj) => {
        const newSubGroupSumObj = Object.assign({}, subGroupSumObj)

        Object.values(newSubGroupSumObj).map(subGroup => {
            if(subGroup.couponNo > 0) {
                const selectedCoupon = subGroup.couponList.filter(coupon => coupon.value === subGroup.couponNo);
                if (selectedCoupon[0].data.couponType === 'deliveryCoupon' && subGroup.deliveryFee > 0) {
                    subGroup.couponWonAmount = subGroup.deliveryFee;
                    subGroup.couponBlyAmount = ComUtil.doubleDivide(subGroup.deliveryFee, stdInfo.blctToWon);
                }
                subGroup.couponType = selectedCoupon[0].data.couponType;
                subGroup.orderPrice = (subGroup.goodsPrice + subGroup.deliveryFee + subGroup.jejuDeliveryFee) - subGroup.couponWonAmount
            }
        })

        setSubGroupSumObj(newSubGroupSumObj)
    }

    //환율 조회
    const searchBlctToWon = async () => {
        let {data} = await BLCT_TO_WON();
        // setBlctToWon(data)
        return data
    }

    //쿠폰 리스트 조회
    const searchCouponList = async () => {
        const {data} = await getUsableCouponList();
        return data
    }

    //쿠폰변경
    const onCouponChange = (subId, e) => {
        const value = e.target.value //couponNo

        const newSubGroupSumObj = Object.assign({}, subGroupSumObj)
        const couponList = subGroupSumObj[subId].couponList

        if(!value) {
            //쿠폰 설정
            newSubGroupSumObj[subId].couponNo = 0
            newSubGroupSumObj[subId].couponBlyAmount = 0
            newSubGroupSumObj[subId].couponWonAmount = 0
            newSubGroupSumObj[subId].couponType = null
        }else{

            //선택된 쿠폰 찾기
            let {value: couponNo, label, data: coupon} = couponList.find(coupon => String(coupon.value) === String(value))

            //쿠폰 설정
            newSubGroupSumObj[subId].couponNo = couponNo
            newSubGroupSumObj[subId].couponBlyAmount = coupon.couponBlyAmount
            newSubGroupSumObj[subId].couponWonAmount = MathUtil.roundHalf(MathUtil.multipliedBy(coupon.couponBlyAmount, stdInfo.blctToWon))

            console.log("onCouponChange 쿠폰변경 ", {coupon, newSubGroupSumObj})
        }

        //서브그룹 갱신
        calcSubGroupSumObj(newSubGroupSumObj)
    }

    //쿠폰 disabled 값[] 리턴
    const getDisabledCouponValues = (subId) => {

        const disabledValues = []
        /** 서브그룹에 선택된 모든 쿠폰은 disable 처리 **/
        Object.values(subGroupSumObj).map(({couponNo}) => {

            /** 쿠폰 선택한건 무조건 disable 처리 **/
            if (!disabledValues.includes(couponNo))
                disabledValues.push(couponNo)

            /** 현재 행에서 쿠폰사용 가능한지 체크해서 불가능 하면 추가 **/
            stdInfo.couponList.map(({data: coupon}) => {

                if (!disabledValues.includes(coupon.couponNo)) {
                    if(checkDisabledCouponNo(coupon, subId)) {
                        disabledValues.push(coupon.couponNo)
                    }
                }

                // /** 상품가격 세팅 **/
                // let goodsPrice = subGroupSumObj[subId].goodsPrice
                //
                // /** 쿠폰 사용가능 금액 세팅 [쿠폰사용가능 금액(원화를 우선 적용)] **/
                // let minGoodsPrice = coupon.minGoodsPrice || MathUtil.multipliedBy(stdInfo.blctToWon,coupon.minOrderBlyAmount)
                //
                // /** 상품가격이 쿠폰사용가능 금액보다 미만이면 disabled 처리 **/
                // if (goodsPrice < minGoodsPrice) {
                //     if (!disabledValues.includes(coupon.couponNo)) {
                //         disabledValues.push(coupon.couponNo)
                //     }
                // }
                //
                // /** 앱 전용쿠폰인 경우 앱이 아니면 disabled 처리 **/
                // else if(!ComUtil.isMobileApp() && coupon.onlyAppCoupon) {
                //     if (!disabledValues.includes(coupon.couponNo)) {
                //         disabledValues.push(coupon.couponNo)
                //     }
                // }
                //
                // /** 특정상품쿠폰의 경우 해당 상품이 아니면 disabled 처리 **/
                // else if(coupon.couponGoods) {
                //     if (goodsNoList.length > 1 || goodsNoList[0] !== coupon.couponGoods.targetGoodsNo) {
                //         if (!disabledValues.includes(coupon.couponNo)) {
                //             disabledValues.push(coupon.couponNo)
                //         }
                //     }
                // }
            })
        })
        return disabledValues
    }

    const checkDisabledCouponNo = (coupon, subId) => {
        const goodsNoList = subGroupSumObj[subId].goodsNoList


        /** 상품가격 세팅 **/
        let goodsPrice = subGroupSumObj[subId].goodsPrice

        /** 쿠폰 사용가능 금액 세팅 [쿠폰사용가능 금액(원화를 우선 적용)] **/
        let minGoodsPrice = coupon.minGoodsPrice || MathUtil.roundHalf(MathUtil.multipliedBy(stdInfo.blctToWon,coupon.minOrderBlyAmount))

        //deliveryCoupon 배송료0일때 disable
        let subGroupDeliveryFee = subGroupSumObj[subId].deliveryFee + subGroupSumObj[subId].jejuDeliveryFee
        if (coupon.couponType === 'deliveryCoupon' && subGroupDeliveryFee <= 0 ) {
            return true;
        }
        if (coupon.couponType === 'deliveryCoupon') {
            minGoodsPrice = subGroupDeliveryFee
            coupon.minGoodsPrice = minGoodsPrice //coupon에 최초 저장되는지 확인 중.
        }

        /** 상품가격이 쿠폰사용가능 금액보다 미만이면 disabled 처리 **/
        if (goodsPrice < minGoodsPrice) {
            return true;
        }

        /** 앱 전용쿠폰인 경우 앱이 아니면 disabled 처리 **/
        else if(!ComUtil.isMobileApp() && coupon.onlyAppCoupon) {
            return true;
        }

        /** 특정상품쿠폰의 경우 해당 상품이 아니면 disabled 처리 (length > 1 인 이유는 하나의 상품만 쿠폰을 적용 해야 하기 때문, 두개의 상품을 고르면 쿠폰이 써 지면 안됨) **/
        // 22.10.26 david 묶음일경우 해당 상품이 포함되어 있으면 상품전용쿠폰 되게 처리
        else if(coupon.couponGoods) {

            if (goodsNoList && goodsNoList.filter(goodsNo => goodsNo == coupon.couponGoods.targetGoodsNo).length === 0) {
                return true;
            }

            // console.log("coupon.couponGoodsCheck0", subGroupSumObj[subId])
            const cGoods = producerObj[subGroupSumObj[subId].producerNo].subGroupList.find(item=>item.subId === subId).goodsList.find(goods => goods.goodsNo === coupon.couponGoods.targetGoodsNo);
            if(cGoods){
                const calGoods = getSumInfoByGoods(cGoods);
                console.log("coupon.couponGoodsCheck1", calGoods);
                console.log("coupon.couponGoodsCheck1==calGoodsPrice", calGoods.goodsPrice);
                console.log("coupon.couponGoodsCheck1==minGoodsPrice", minGoodsPrice);
                if(calGoods){
                    if(calGoods.goodsPrice < minGoodsPrice){
                        return true;
                    }
                }
            }

            // if (goodsNoList.length > 1 || goodsNoList[0] !== coupon.couponGoods.targetGoodsNo) {
            //     return true;
            // }
        }

        /** 생산자 쿠폰 일 경우 해당 생산자의 상품이 아니면 disabled 처리 **/
        else if(coupon.targetProducerNo) {
            if (subGroupSumObj[subId].producerNo !== coupon.targetProducerNo) {
                return true;
            }

            // goodsOrgList.
            //
            // if (goodsNoList)
            //
            // //goodsOrgList
            // if (goodsNoList[0] !== coupon.couponGoods.targetGoodsNo) {
            //     return true;
            // }
        }

        return false;
    }


    const [rate, setRate] = useState(0)

    const onSliderChange = (value) => {
        console.log(value)
        setRate(value)
    }

    //결제방법 선택
    //<PayMethod 렌더링 최적화(페이지 로드시 함수를 한번만 초기화 함)
    const onPayPgGubunChange = useCallback((payPgGubun) => {
        setPayPgGubun(payPgGubun)
    }, [])

    //bly 지우기
    const onRemoveBlyClick = () => {
        setRate(0)
    }


    /** 슈퍼리워드 티켓 체크(슈퍼리워드인 상품만 백엔드에서 체크함) [모든 결제버튼 클릭시 체크 필요함] **/
    async function isPossibleSuperRewardTicketStatus() {

        //티켓 체크가 된 경우
        if ([1, 2].includes(superRewardTicketStatusRef.current.resCode)) {

            console.log("슈퍼리워드 티켓 체크됨 상태:"+superRewardTicketStatusRef.current.resCode)

            //티켓발부 결과가 성공일 경우
            if (superRewardTicketStatusRef.current.resCode === 1) {
                return true
            }
            //티켓발부 결과가 실패라면
            else {
                alert(superRewardTicketStatusRef.current.errMsg)
                return false
            }
        }
        //한번도 발부 받지 않았을때는 계속 체크
        else{

            /*
             -1 : 로그인 세션 만료
             0 : 슈퍼리워드 기간이 아니라서 티켓 발급되지 않았을때(결제버튼 클릭시 프론트에서 재요청 필요)
             1 : 슈퍼리워드 티켓발급 결과 : 성공(구입가능)
             2 : 슈퍼리워드 티켓발급 결과 : 실패(재고없음) */
            const {status, data} = await getSuperRewardTicketStatusByGoodsNos(goodsNosRef.current)

            if (status !== 200){
                alert('에러가 발생하였습니다. 네트워크 상태를 확인 해 주세요.')
                return false
            }

            if (data) {
                const {resCode, errMsg} = data

                if (resCode === -1) {
                    alert('세션이 만료되었습니다. 로그인 필요합니다.')
                    closePopup()
                    return false
                }

                //변수에 세팅
                superRewardTicketStatusRef.current = {resCode, errMsg};

                console.log("슈퍼리워드 티켓 발급요청 결과 :"+superRewardTicketStatusRef.current.resCode)

                switch (resCode) {
                    case 0:
                    case 1:
                        return true
                    case 2:
                        alert(errMsg)
                        return false
                    default:
                        return false
                }
            }
        }
    }

    /** 주문하려는 상품의 옵션별 재고, 판매마감, 판매중지, 슈퍼리워드 체크, 슈퍼리워드 전인지 체크, 슈퍼리워드 티켓 체크 **/
    async function isPossibleToBuyGoods() {

        const orderInfoList = []

        Object.values(cartGoodsObjRef.current).map(cartGoods => {
            orderInfoList.push(cartGoods)
        })

        //백엔드에서 전체 체크
        const {data: {resCode, errMsg}} =  await canBuyOptionGoods(orderInfoList, selectedAddress.zipNo)

        console.log(`isPossibleToBuyGoods 체크 결과 : resCode: ${resCode} errMsg: ${errMsg}`)

        // 실패
        if (resCode < 0) {
            alert(errMsg)
            return false
        }

        // 사용자 컨펌이 필요한 경우(현재 슈퍼리워드 앞둔 상품 사용자 confirm 메세지용으로 사용중)=> 2210:옥천금요배송용으로 사용 (슈퍼리워드는 이미 front처리중이었음)
        if (resCode === 100) {
            return window.confirm(errMsg)
        }

        return true
    }

    /** [결제 전 체크] 폼 밸리데이션, 슈퍼리워드 티켓체크, 상품재고 등 전반적인 모든 체크 **/
    const checkValidation = async () => {

        /** ========================================================= **/
        /** ===================== Front-end 체크 ===================== **/
        /** ========================================================= **/

        //총 결제금액
        const needToPayOrderPrice = ComUtil.roundDown(totalSumObj.needToPayOrderPrice, 0)

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

        if (await isNotDeliveryZipNo(selectedAddress.zipNo)) {
            alert('해당 배송지는 도서산간지역으로 배송 서비스를 하지 않습니다. 다른 배송지를 선택해주세요.')
            return false
        }

        //상품 리스트 필수값 체크
        if (!checkGoodsListValidation(goodsOrgList)) {
            return false
        }

        //마이너스, 1블리 이상 체크
        if (totalSumObj.usedBlyAmount < 0 || totalSumObj.usedBlyAmount > 0 && totalSumObj.usedBlyAmount < 1) {
            alert('최소 1BLY 이상 사용 가능합니다.');
            return false
        }

        if (['card', 'cardBlct'].includes(totalSumObj.payMethod)) {
            if (needToPayOrderPrice >= 0 && totalSumObj.needToPayOrderPrice < 100) {
                alert('최소 결제금액은 100원 이상이어야 합니다')
                return false;
            }
        }

        if (needToPayOrderPrice > 0 && !payPgGubun) {
            alert('결제방법을 선택해 주세요.');
            return false
        }

        //묶음배송에 포텐타임 상품이 있을경우 사용자에게 물어보기
        let notSupportedTimeSaleGoodsName = ''

        Object.values(producerObj).map(({producer, subGroupList}) => {
            subGroupList.map(({goodsList}) => {
                goodsList.map(goods => {
                    if (goods.isNotSupportedTimeSale)
                        notSupportedTimeSaleGoodsName += goods.goodsNm + ', '
                })
            })
        })

        if (notSupportedTimeSaleGoodsName.length > 0) {
            if (!window.confirm(`포텐타임 상품(${notSupportedTimeSaleGoodsName.substr(0, notSupportedTimeSaleGoodsName.length -2)})은 묶음배송 할 경우 포텐타임쿠폰이 지원되지 않습니다. 계속 하시겠습니까?`))
                return
        }

        /** ========================================================= **/
        /** ===================== Back-end 체크 ===================== **/
        /** ========================================================= **/

        /** 슈퍼리워드 티켓 체크(슈퍼리워드인 상품만 백엔드에서 체크함) [모든 결제버튼 클릭시 체크 필요함] **/
        if (!(await isPossibleSuperRewardTicketStatus())) {
            return false
        }

        /** 주문하려는 상품의 옵션별 재고, 판매마감, 판매중지, 슈퍼리워드 체크, 슈퍼리워드 전인지 체크, 슈퍼리워드 티켓 체크 **/
        if (!(await isPossibleToBuyGoods())) {
            return false
        }

        return true
    }


    //결제하기 클릭
    const onBuyClick = async () => {

        if (!consumer || !consumer.consumerNo) {
            alert('세션이 만료되었습니다. 다시 로그인 해 주세요.')
            closePopup()
            return
        }

        // 어뷰저 체크
        if (await ComUtil.isBlockedAbuser()) {
            return
        }

        /** [결제 전 체크] 폼 밸리데이션, 슈퍼리워드 티켓체크, 상품재고 등 전반적인 모든 체크 **/
        if (!(await checkValidation()))
            return

        if(isLocal && !payCheck){
            alert('로컬푸드 서비스 동의에 체크 해주세요.');
            return
        }

        /** 주문 테이블 JSON 생성 **/
        // const { orderGroup, orderSubGroupList, orderDetailList } = await getOrderJSONData()


        //결제할 금액이 없고 사용한 blct 있을경우 : blct
        if (totalSumObj.payMethod === 'blct') {
            console.log('blct')

            //블록체인 비밀번호 모달 오픈
            toggle()
        }
        //결제 금액 있고, blct 도 사용 한 경우 cardBlct
        else if (['card', 'cardBlct'].includes(totalSumObj.payMethod)) {
            payByCard()
        }
    }

    /** [BLCT] 결제 (결제비밀번호 입력 모달 확인 후 결제진행) 비밀번호 맞았을 경우 **/
    const payByBlct = async () => {

        //잔고 문제없는지 백엔드에서 한번더 체크.
        const {data:errRes} = await checkMyBlctAmount(totalSumObj.usedBlyAmount)
        if (errRes.resCode) {
            alert(errRes.errMsg)
            //결제창 닫기
            toggle()
            return
        }

        setLoadingType(LOADING.BLOCKCHAIN)

        toggle()


        //DB 등록 (temp)
        const tempData = await addAndGetTempData()

        if (!tempData) {
            return
        }

        //BLCT 결제
        let {data : result} = await scOntOrderGoodsBlct(
            tempData.orderGroup.orderGroupNo,
            tempData.orderGroup.totalBlctToken,
            tempData.orderGroup.totalOrderPrice,
            tempData
        );

        setLoadingType(LOADING.NONE)

        if (!result) {
            alert('상품 구매에 실패 하였습니다. 다시 구매해주세요.')
        } else {
            //구매완료페이지로 이동
            props.history.push('/buyFinish?imp_uid=&imp_success=true&merchant_uid=' + tempData.orderGroup.orderGroupNo + '&error_msg=' + '');
        }

    }

    /** 카드 결제 (card, cardBlct)용 **/
    const payByCard = async () => {

        // setLoadingType(LOADING.DATA_FETCH)

        //DB 등록 (temp)
        const tempData = await addAndGetTempData()

        if (!tempData) {
            return
        }


        //카드사별 data 만들기
        const pgData = await getPgData(tempData.orderGroup, tempData.orderDetailList)

        // setLoadingType(LOADING.NONE)

        console.log({getPgData: pgData})

        //결제요청
        requestImportPay(pgData)
    }

    /** DB 저장(temp) 후 order json 리턴 **/
    const addAndGetTempData = async () => {

        try {

            /** 주문 테이블 JSON 생성 **/
            const orders = getOrderJSONData()

            console.log({"주문테이블":orders})

            let {data} = await addOrdersTemp(orders);

            console.log("tempData",data)

            if (!data) {
                alert("주문을 다시 시도해주세요.")
                props.history.goBack();
                return null;
            }

            return data

        }catch (error) {
            console.error(error.message)
            setLoadingType(LOADING.NONE)
            return null;
        }
    }


    //[카드] 아임포트 PG 결제위한 data
    const getPgData = async (tmpOrderGroup, tmpOrderDetailList) => {

        // 주문자정보
        const consumer = await getConsumer();

        let taxFreeAmt = 0;

        // 네이버일반결제시 필요한 상품정보
        const naverProducts = tmpOrderDetailList.map(order => {
            if(!order.vatFlag){
                taxFreeAmt = taxFreeAmt + order.cardPrice;
            }
            return {
                "categoryType": "PRODUCT",
                "categoryId": "GENERAL",
                "uid": order.goodsNo,
                "name": order.goodsNm,
                "count": order.orderCnt
            }
        })


        // 일반 신용 카드 (토스페이먼츠:구LG유플러스)
        let data = { // param
            pg: Server.getImpPgId("uplus"),    //LG유플러스
            popup: true,
            pay_method: tmpOrderGroup.payMethod,    //신용카드(card), 실시간계좌이체(trans) , 가상계좌(vbank)
            merchant_uid: ''+ tmpOrderGroup.orderGroupNo,           //주문그룹번호(7자리) :String이라서 ''추가.
            name: tmpOrderGroup.orderGoodsNm,          //주문명(상품명)
            amount:  //(isCardBlct)? ComUtil.roundDown(orderList[0].orderPrice - this.state.blctToWon * this.state.cardBlctUseToken, 0) : //cardBlct결제시 카드가격..
            tmpOrderGroup.totalOrderPrice,     //신용카드 주문가격(총가격)
            tax_free: taxFreeAmt,    //면세공급가액
            buyer_email: consumer.data.email,           //주문자 이메일주소
            buyer_name: consumer.data.name,             //주문자 명
            buyer_tel: (consumer.data.phone)? consumer.data.phone : selectedAddress.receiverPhone, //주문자 연락처 필수라서 혹시 없으면 주문정보에서라도 넣음.
            buyer_postcode: consumer.data.zipNo,        //주문자 우편번호(5자리)
            buyer_addr: (consumer.data.addr+" "+consumer.data.addrDetail),    //주문자 주소
            naverProducts: [],
            naverPopupMode: ComUtil.isMobileApp() ? false : true,
            m_redirect_url: Server.getFrontURL()+'/buyFinish',   //모바일일경우 리다이렉트 페이지 처리
            app_scheme: 'blocery',   //모바일 웹앱 스키마명
            display:{
                card_quota:[0,2,3]  //할부개월수 비자카드 문제로 2개월 3개월 까지
            }
        }

        if(payPgGubun === 'kakaopay') {
            //카카오페이 일반결제
            data.pg = Server.getImpPgId("kakaopay");
            data.amount = tmpOrderGroup.totalOrderPrice;
        }
        else if(payPgGubun === 'naverpay') {
            //naverProducts 필수구성. 상품정보(필수전달사항) 네이버페이 매뉴얼의 productItems 파라메터와 동일
            data.pg = Server.getImpPgId("naverpay");
            data.naverProducts = naverProducts;
            data.tax_free=taxFreeAmt;    //면세공급가액
        }

        return data
    }

    //[카드] 아임포트 PG 결제창
    const requestImportPay = (data) => {

        let userCode = Server.getImpKey();

        //1. React-Native(Webview)용 결제호출 방식 /////////////////////////////////////////////////////////////////
        if (ComUtil.isMobileApp()) {

            //TODO loading
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

            //TODO loading
            // this.setState({chainLoading: false});

            if (rsp.success) {
                //console.log("rsp========",rsp)
                props.history.push('/buyFinish?imp_uid=' + rsp.imp_uid + '&imp_success=true' + '&merchant_uid=' + rsp.merchant_uid + '&error_msg=' + '');
            } else {
                let msg = '결제에 실패하였습니다.';
                //msg += ' imp_uid : ' + rsp.imp_uid;
                msg += ' 에러내용 : ' + rsp.error_msg;
                // 결제 실패 시 로직
                //alert(msg);
                toast.warn(msg);
            }
        });
    }

    // /** 내 BLCT 체크 **/
    // async function checkMyBlctAmount(account, totalOrderPrice) {
    //     //balance추가체크
    //     let {data:balance} = await scOntGetBalanceOfBlct(account);
    //     let payBlctBalance = ComUtil.toNum(balance);
    //
    //     const blctOrderPrice = await exchangeWon2BLCT(totalOrderPrice);
    //     const payBlct = ComUtil.toNum(blctOrderPrice);
    //
    //     console.log({payBlctBalance, blctOrderPrice, payBlct})
    //
    //     if(payBlctBalance <= 0){
    //         // this.notify('보유한 BLY가 0입니다.', toast.warn);
    //         // alert('보유한 BLY가 0입니다.')
    //         // // this.setState({modal:false})
    //         // return false;
    //
    //         return '보유한 BLY가 0입니다.'
    //     }
    //     if(payBlctBalance < payBlct){
    //         // this.notify('보유한 BLY가 구매하기에 부족합니다.', toast.warn);
    //         // return false;
    //         return '보유한 BLY가 구매하기에 부족합니다.'
    //     }
    //     return null
    // }

    //창 닫기 혹은 뒤로가기
    function closePopup() {
        Webview.closePopup(false)
    }

    /** OrderGroup, OrderSubGroup, OrderDetail 테이블 생성 **/
    function getOrderJSONData() {
        // let orderGroup = Object.assign({}, this.state.orderGroup);
        // orderGroup.consumerNo = consumerInfo.consumerNo;
        // orderGroup.orderGoodsNm = g_orderGoodsNm;           //주문명칭
        // orderGroup.totalCurrentPrice = g_totalCurrentPrice; //총 상품가격
        // orderGroup.totalDeliveryFee = g_totalDeliveryFee;   //총 배송비
        // orderGroup.totalOrderPrice = g_totalOrderPrice;     //총 주문 결제 금액
        // orderGroup.totalOrderTaxFreePrice = g_totalOrderTaxFreePrice;     //총 면세 주문 결제 금액
        // orderGroup.totalBlctToken = g_totalBlctToken;       //총 주문 결제 BCLT Token
        // orderGroup.orgTotalOrderPrice = g_orgTotalOrderPrice;     //총 주문 결제 금액

        const orderGroup = {}
        const orderSubGroupList = []
        const orderDetailList = []

        const tot = totalSumObj
        console.log({tot})

        const pgProvider = (payPgGubun && payPgGubun!=='card') ? payPgGubun : ''

        // 총 결제금액 sum(orderDetail.cardPrice)
        let totalOrderPrice = 0;
        let totalBlctToken = 0;

        //back-end 에서 넣음.
        // let { data:serverTodayTime } = await getServerTodayTime();
        // let orderDate = ComUtil.getNow(serverTodayTime);    //주문일자생성

        /** producer group loop start **/
        Object.values(producerObj).map(({producer, subGroupList}) => {

            /** subGroupList loop start **/
            subGroupList.map(({subId, goodsList}) => {

                const sub = subGroupSumObj[subId];

                //주문금액 + 총배송비 - 쿠폰으로 사용된 금액 (상품, 배송비를 전체 금액에서 차지하는 비율을 구할때 써야 함)
                const totalWonAmount = (tot.goodsPrice + tot.deliveryFee + tot.jejuDeliveryFee) - tot.couponWonAmount

                //서브그룹 배송비
                let subGroupDeliveryFee = sub.deliveryFee + sub.jejuDeliveryFee;
                let deliveryCardPrice = subGroupDeliveryFee
                let deliveryBlctToken = 0;

                //블리를 사용 했을 경우 전체에서 배송비의 비율만큼 bly 를 분배(배송비도 상품처럼 분배)
                if (tot.usedBlyAmount > 0) {
                    //전체 금액에서 배송비의 비율(배송비도 상품 금액처럼 같이 분배)
                    const subGroupDeliveryFeeRateInTotal = MathUtil.dividedBy(subGroupDeliveryFee, totalWonAmount)
                    /** 사용한 BLY 에서 배송비의 비율(BLY) (소수점 둘째자리까지 절삭) **/
                    deliveryBlctToken = MathUtil.multipliedBy(subGroupDeliveryFeeRateInTotal,tot.usedBlyAmount)
                    deliveryBlctToken = ComUtil.roundDown(deliveryBlctToken, MID_POINT_ROUNDING_NUMBER)

                    deliveryCardPrice = ComUtil.roundDown(deliveryCardPrice - MathUtil.multipliedBy(deliveryBlctToken,stdInfo.blctToWon), 0)
                    console.log("블리 사용시 서브그룹 비율", subGroupDeliveryFeeRateInTotal)
                }

                let listSize = 0;

                // console.log({sub})

                /** goodsList loop start **/
                goodsList.map(goods => {

                    //옵션 개수만큼 = orderDetail 개수
                    /** options loop start **/
                    goods.options.map(option => {

                        listSize++

                        const goodsPrice = MathUtil.multipliedBy(option.optionPrice,option.orderCnt) //3000
                        // let cardPrice = 0
                        // let blctToken = 0

                        //사용된 쿠폰번호
                        const usedCouponNo = sub.couponNo

                        //3000 / 13000 = 0.23

                        //상품가격별 찢어진 쿠폰 BLY ( 서브그룹에서 사용한 쿠폰BLY * 상품의 비율)
                        let usedCouponBlyAmount = 0
                        let usedCouponWonAmount = 0

                        let bTargetGoodsCoupon = false;
                        let bTargetGoodsCouponBlyAmt = false;

                        /** 쿠폰 사용 했으면 세팅 **/
                        if (sub.couponBlyAmount > 0) {
                            if(usedCouponNo > 0) {
                                //선택된 쿠폰 찾기
                                const {data: coupon} = sub.couponList.find(coupon => String(coupon.value) === String(usedCouponNo))
                                //상품전용 쿠폰일 경우 상품번호 비교 맞으면 OrderDetail 쿠폰비율 100%
                                if(coupon.couponGoods) {
                                    // 상품전용쿠폰 여부
                                    bTargetGoodsCoupon = true;

                                    if (goods.goodsNo == coupon.couponGoods.targetGoodsNo) {
                                        bTargetGoodsCouponBlyAmt = true; //100% 금액넣게 하는 체크함수
                                    }
                                }
                            }

                            /** 서브 그룹 내에서의 상품가격별 비율 **/
                            const goodsPriceRateInSubGroup = MathUtil.dividedBy(goodsPrice, sub.goodsPrice)

                            if(bTargetGoodsCoupon){
                                //상품가격별 쿠폰 해당 주문상세에 쿠폰금액 100% 넣기 아닐경우 0
                                usedCouponBlyAmount = MathUtil.multipliedBy(sub.couponBlyAmount, bTargetGoodsCouponBlyAmt ? 1:0)
                                usedCouponWonAmount = MathUtil.roundHalf(MathUtil.multipliedBy(usedCouponBlyAmount, stdInfo.blctToWon))
                            }else {
                                //상품가격별 찢어진 쿠폰
                                usedCouponBlyAmount = MathUtil.multipliedBy(sub.couponBlyAmount, goodsPriceRateInSubGroup)
                                usedCouponWonAmount = MathUtil.roundHalf(MathUtil.multipliedBy(usedCouponBlyAmount, stdInfo.blctToWon))
                            }
                        }

                        //BLY 사용
                        let usedBlyAmount = 0
                        let usedWonAmount = 0
                        //상품가 - 쿠폰금액(찢어진) 3000 - 300 = 2700
                        // let cardPrice = goodsPrice - usedCouponWonAmount
                        let cardPrice = 0
                        //주문금액(아무것도 제하지 않은 순수 상품가 * 구매수량)
                        const orderPrice = goodsPrice
                        let blctToken = 0 //usedCouponBlyAmount; //사용한 쿠폰 BLY

                        //subGroup의 orderPrice 합계(쿠폰 제한 금액)

                        /** 블리를 사용 하였을 경우 세팅 **/
                        if (tot.usedBlyAmount > 0) {
                            //2700 / 12000
                            /** 전체에서 상품 가격(쿠폰적용된)별 비율 **/
                            const goodsPriceRateInTotal = MathUtil.dividedBy((goodsPrice - usedCouponWonAmount), totalWonAmount)
                            //사용한 BLY를 상품별로 분배
                            usedBlyAmount = MathUtil.multipliedBy(tot.usedBlyAmount,goodsPriceRateInTotal)

                            // blctToken += usedBlyAmount

                            usedWonAmount = MathUtil.multipliedBy(usedBlyAmount,stdInfo.blctToWon)
                            //카드결제 금액에서 BLY 사용 만큼 한번 더 차감
                            // cardPrice = cardPrice - usedWonAmount
                        }

                        /** 총 BLY 사용량 (두자리까지 까지 절삭) **/
                        blctToken = usedCouponBlyAmount + usedBlyAmount

                        /** 실제 결제금액 (전체 절삭) **/
                        cardPrice = goodsPrice - (usedCouponWonAmount + usedWonAmount)
                        cardPrice = ComUtil.roundDown(cardPrice, 0)

                        /** 합계엔 영향을 미치지 않도록 최종 적으로 orderDetail 에만 절삭 처리 **/
                        usedCouponBlyAmount = ComUtil.roundDown(usedCouponBlyAmount, MID_POINT_ROUNDING_NUMBER)
                        blctToken = ComUtil.roundDown(blctToken, MID_POINT_ROUNDING_NUMBER)

                        console.log(`${cardPrice} = ${goodsPrice} - (${usedCouponWonAmount} + ${usedWonAmount})`)


                        /** orderGroup 과 sum(orderDetail.cardPrice) 오차를 없애기 위해 절삭된 cardPrice 를 더함 **/
                        totalOrderPrice += cardPrice
                        totalBlctToken += blctToken

                        //sum(orderDetail.orderPrice) + sum(sub.deliveryFee) === needToOrderPrice 와 같아야 함

                        //희망수령일
                        let hopeDeliveryDate = null

                        if (goods.hopeDeliveryFlag) {
                            const orgGoods = goodsOrgList.find(goodsOrg => goodsOrg.goodsNo === goods.goodsNo)
                            hopeDeliveryDate = orgGoods.hopeDeliveryFlag ? orgGoods.hopeDeliveryDate : null
                        }

                        const orderDetail = {
                            // consumerNo: 0,                                       //[back-end 에서]
                            producerNo: producer.producerNo,
                            goodsNo: goods.goodsNo,
                            // farmName: producer.farmName,                         //[back-end 에서]
                            // directGoods: true,                                   //[back-end 에서]
                            currentPrice: option.optionPrice,
                            // discountRate: 0,                                     //할인율(%) [back-end 에서]
                            // orderDate: orderDate,                                //[back-end 에서]
                            orderCnt: option.orderCnt,
                            deliveryFee: 0,                                         //배송비는 sub 에 들어감
                            orderPrice: orderPrice,                                 //주문 총 가격 (= 상품가격 * 주문개수)
                            // orderTaxFreePrice: !goods.vatFlag ? orderPrice : 0, //주문 면세 총 가격 TODO check [back-end 에서]
                            blctToken: blctToken,
                            // originBlctToken: null,                               // 2020.08.27 추가 부분환불시 마이페이지에 지불한 토큰내역을 보여주기 위해 처음 지불한 토큰양 저장
                            cardPrice: cardPrice,
                            // cardTaxFreePrice: !goods.vatFlag ? cardPrice : 0,       //card로 면세 결제금액 TODO check [back-end 에서]
                            // orderBlctExchangeRate: null,     // 주문당시 BLCT 환율                 //[back-end 이미 처리중]
                            // consumerOkDate: null,            //소비자 구매확정일
                            // bloceryOnlyFee: null,            //Blocery가 받는 수수료 (원)
                            // consumerReward: null,            //소비자가 구매보상으로 받는 금액 (원)
                            // producerReward: null,            //생산자가 판매보상으로 받는 금액 (원)
                            // bloceryOnlyFeeBlct: null,        //Blocery가 받는 수수료 (BLCT)
                            // consumerRewardBlct: null,        //소비자가 구매보상으로 받는 BLCT
                            // producerRewardBlct: null,        //생산자가 판매보상으로 받는 BLCT
                            // goodsReviewBlct: null,           //소비자가 리뷰작성후 보상으로 받는 BLCT
                            // goodsReviewDate: null,           //리뷰작성일시
                            // payoutAmountBlct: null,          //생산자가 BLCT로 정산받을 때 받은 BLCT(BLCT 구매에 한함) - 구매 시 저장으로 변경
                            // payoutAmount: null,              //생산자가 월말정산때 해당 구매건에 대해 받을 금액 - 구매 시 저장으로 변경
                            // totalSupportPrice = null,        //포텐타임 상품 정산시 판매지원금(주문개수만큼 곱한 전체금액)
                            // timeSaleGoods = null,            //포텐타임 행사 상품 구입여부
                            // blyTimeGoods = null,             //블리타임 행사 상품 구입여부
                            // superRewardGoods = null,         //슈퍼리워드 행사 상품 구입여부
                            // creditCardCommission = null,     //판매대금 정산 시 필요하므로 추가 (일단 구매확정시점에 db 에 추가함)
                            // orderCancelDate = null,          //주문취소일시
                            // cancelFee = null,                //취소수수료
                            // cancelBlctTokenFee = null,       //취소BLCT토큰수수료
                            // cancelReason = null,             //취소사유 (단순변심,주문실수,서비스불만족,배송기간에부재,기타)
                            // cancelReasonDetail = null,       //취소사유상세
                            // producerCancelReason = null,     //생산자 취소사유

                            receiverName: selectedAddress.receiverName,     //수령자
                            receiverPhone: selectedAddress.phone,           //수령자연락처
                            receiverZipNo: selectedAddress.zipNo,           //수령자우편번호
                            receiverAddr: selectedAddress.addr,             //수령자주소
                            receiverRoadAddr: selectedAddress.roadAddr,     //수령자도로명주소
                            receiverAddrDetail: selectedAddress.addrDetail, //수령자주소상세
                            deliveryMsg: deliveryMsg,                       //베송메세지
                            commonEnterPwd: commonEnterPwd,                 //공동현관출입번호
                            localNightAlarm: localNightAlarm,
                            // goodsNm: goods.goodsNm,                         //상품명 [back-end 에서]
                            // expectShippingStart: goods.expectShippingStart, //예상출하시작일 [back-end 에서]
                            // expectShippingEnd: goods.expectShippingEnd,     //예상출하마감일 [back-end 에서]
                            // hopeDeliveryFlag: goods.hopeDeliveryFlag,       //희망수령여부 (소비자용) [back-end 에서]
                            hopeDeliveryDate: hopeDeliveryDate,                 //희망수령일 (소비자용) [상품에 희망배송여부가 있을경우]
                            // packUnit: goods.packUnit,                       //포장단위 [back-end 에서]
                            // packAmount: goods.packAmount,                   //포장 양 [back-end 에서]
                            // packCnt: goods.packCnt,                         //판매개수 [back-end 에서]
                            // itemName: goods.itemName,                       //품목명 [back-end 에서]
                            orderImg: option.optionImages.length > 0 ? option.optionImages[0].imageUrl : goods.goodsImages[0].imageUrl,    //상품대표이미지(옵션 이미지)
                            // transportCompanyName: null,                  //택배사
                            // transportCompanyCode: null,                  //택배사코드
                            // trackingNumber: null,                        //송장번호 - 송장번호로 배송중인지 판단 중.
                            // trackingNumberTimestamp: null,               //송장번호 입력 타임 스탬프
                            // consumerNm: null,                            //주문자명  [back-end 에서]
                            // consumerEmail: null,                         //주문자이메일 [back-end 에서]
                            // consumerPhone: null,	                        //주문자연락처 [back-end 에서]
                            // consumerZipNo: null,	                        //주문자우편번호 [back-end 에서]
                            // consumerAddr: null,	                        //주문자주소    [back-end 에서]
                            // consumerAddrDetail: null,	                //주문자주소상세  [back-end 에서]


                            pgProvider: pgProvider,       //PG사 TODO check
                            // pgTid: '',                                       //PG TID
                            // embPgProvider: '',                               //허브형PG사 [카카오페이:kakaopay 네이버페이:naverpay 페이코:payco 삼성페이:samsung Lpay:lpay KPay:kpay]
                            payMethod: totalSumObj.payMethod,                   // 토큰:blct, 카드:card, cardBlct,  (실시간계좌이체:trans, 가상계좌:vbank)
                            // cardCode: '',                                    //카드사코드
                            // cardName: '',                                    //카드사명칭
                            // scheduleStatus: null,                            //예약상태(dealGoods용) null일경우 예약없음 (dealGoods의 경우, iamport와 통신용도. 일반적으로는 미사옹.  (blct 결제에도 취소할 경우 revoked가 저장될수도 있음))
                            payStatus: "ready",                                 // TODO check
                            // impUid: null,                                    // TODO check
                            // orderConfirm: null,                              // 생산자 주문확인. confirmed:주문확인, shipping:출고(배송중)
                            // producerPayoutStatus: null,                      //판매자 정산 상태
                            // producerPayoutStatusTimestamp: null,             // 대금 정산 일시
                            // producerPayoutBlct: null,                        // BLCT로 대금 정산한 경우 true (카드결제로 현금정산할 경우 false - 2020.2.28 상황)
                            // feeRate: null,                                   //생산자별 수수료 5.0 15.5 를 주문에도 기록. 주문시점에 Goods로 부터 복사가 됨.
                            // siseCorrectionAmountBlct: null,                  //시세보정 blct토큰 수
                            // consumerOkBlctExchangeRate: null,                //구매확정 시점의 blct 시세. 36.23원 등.
                            producerWrapDelivered: goods.producerWrapDelivered, // 묶음배송 여부. true: 두 종류 이상의 묶음배송상품 구매
                            // blyTimeReward: null,                             //블리타임상품 리워드 %.
                            vatFlag: goods.vatFlag,                             //과세여부 TODO check [back-end 에서]
                            // superRewardReward: null,                         //슈퍼리워드 리워드 %.
                            gift: giftInfo.gift,
                            giftMsg: giftInfo.giftMsg,
                            senderName: giftInfo.senderName,
                            // reqProducerCancel: null,                         // 1: 생산자 취소요청, 2: 생산자 환불요청
                            // refundFlag: null,                                // 소비자 환불 요청에 의한 생산자 취소
                            // partialRefundCount: null,                        // 소비자 부분환불
                            usedCouponNo: (bTargetGoodsCoupon && !bTargetGoodsCouponBlyAmt) ? 0: usedCouponNo,  // 사용한 쿠폰번호 (>0 이면 쿠폰사용여부로도 사용)
                            usedCouponBlyAmount: usedCouponBlyAmount,           // 본 결제에 사용된 쿠폰BLY개수.
                            // cardBlctTokenMore: null,                         // cardBlct에서 Blct 결제금액이 50%초과라서 수수료를 blct에서 계산함 TODO check
                            // onePlusSubFlag: null,                            //true일 경우, OnePlusOne 보너스상품(팜토리 상추) 임
                            // onePlusSubGoodsNo: null,                         // 보너스상품이 있는 메인상품인 경우 보너스상품의 번호 저장(주문취소시 필요)
                            // rewardCouponFlag: null,                          //보상쿠폰 지급상품인지 여부 저장
                            // dealGoods: false,                                //공동구매상품 구매 여부, 최초구매시 payStatus="reserving"로 기록. => 정상예약이되면 "scheduled" 로 바뀜.
                            // dealRecommenderNo: null,                         //공동구매를 추천한 ConsumerNo 기록. (0일 경우는 본인이 직접 산경우)
                            optionIndex: option.optionIndex,                    //default 0, 옵션상품 구매시 옵션 번호.
                            optionName: option.optionName,
                            // extraRewardWon: null,                            //dealGoods 배치로 자동결제시 저장
                            extraRewardBlct: null,                              //dealGoods 배치로 자동결제시 저장
                            couponType: sub.couponType,
                        }

                        orderDetailList.push(orderDetail)

                        console.log("orderDetail", orderDetail)

                    })
                    /** options loop end **/

                })
                /** goodsList loop end **/

                const orderSubGroup = {
                    // orderSubGroupNo: '',
                    // orderGroupNo: '',
                    // orderSeqList: [],
                    // consumerNo: null,                    //TODO check [back-end 에서]
                    producerNo: producer.producerNo,
                    deliveryFee: subGroupDeliveryFee,
                    payMethod: totalSumObj.payMethod,
                    deliveryCardPrice: deliveryCardPrice,   //배송비 : 배송비 - 사용한 bly
                    deliveryBlctToken: deliveryBlctToken,   //사용한 bly
                    listSize: listSize,                     //서브그룹 번호를 백엔드에서 생성하기 위한 서브그룹의 goodsList.length
                    usedCouponNo: sub.couponNo,
                    usedCouponBlyAmount: ComUtil.roundDown(sub.couponBlyAmount, MID_POINT_ROUNDING_NUMBER),
                    onlyCouponBly: (totalSumObj.payMethod === 'cardBlct' && tot.usedBlyAmount === 0)?true:false, //cartBlct 인데 blct=모두coupon인 경우. 백엔드 미처리용도로 추가.
                    couponType: sub.couponType,
                }

                totalOrderPrice += orderSubGroup.deliveryCardPrice
                totalBlctToken += orderSubGroup.deliveryBlctToken

                orderSubGroupList.push(orderSubGroup)
                console.log("orderSubGroup", orderSubGroup)
            })
            /** subGroupList loop end **/

        })
        /** producer group loop end **/

        /** orderGroup 세팅 **/
        // orderGroup.orderGroupNo = null              //주문그룹번호 TODO check [back-end 에서]
        // orderGroup.consumerNo = null                //소비자번호 TODO check [back-end 에서]
        // orderGroup.orderDate = null                 //주문일시 TODO check [back-end 에서]
        // orderGroup.orderGoodsNm = null              //주문명칭 TODO check [back-end 에서] orderDetail.get(0).goodsNm 을 넣음 됨
        // orderGroup.totalCurrentPrice = null         //총 상품가격 TODO check [back-end 에서] 사용 안해서 삭제
        // orderGroup.totalDeliveryFee = null          //총 배송비 TODO check [back-end 에서] 사용 안해서 삭제

        /** 전체 금액보정(마이너스 일 경우 0으로) **/
        orderGroup.totalOrderPrice = totalOrderPrice < 0 ? 0 : totalOrderPrice   //총 주문 결제 금액     (dealGoods는 cardBlct가 불가능해서 총 주문결제금액, directGoods는 카드결제금액)


        // orderGroup.totalOrderTaxFreePrice = null                         //총 주문 결제 금액 (면세금액) TODO check [back-end 에서]
        orderGroup.totalBlctToken = ComUtil.roundDown(totalBlctToken, MID_POINT_ROUNDING_NUMBER)                          //총 주문 결제 BCLT Token TODO check [back-end 에서]
        // orderGroup.totalCancelFee = null                              //총 취소수수료
        // orderGroup.totalCancelBlctTokenFee = null                     //총 취소BLCT토큰수수료
        // orderGroup.buyType = stdInfo.isCart ? 'cart' : 'direct' //구매유형 direct:즉시구매 cart:장바구니
        orderGroup.buyType = optionGoodsBuyingInfoRef.current.buyType //구매유형 direct:즉시구매 cart:장바구니

        /* 결제구분, 주문상태, PG고유ID 추가 */
        orderGroup.pgProvider = pgProvider                              //PG사
        // orderGroup.pgTid = ''                                        //PG TID
        // orderGroup.embPgProvider = null                              //허브형PG사 [카카오페이:kakaopay 네이버페이:naverpay 페이코:payco 삼성페이:samsung Lpay:lpay KPay:kpay]
        orderGroup.payMethod = totalSumObj.payMethod                    /* 토큰:blct, 카드:card, 실시간계좌이체:trans, 가상계좌:vbank */
        // orderGroup.cardCode = ''                                      //카드사코드
        // orderGroup.cardName = ''                                      //카드사명칭
        // orderGroup.scheduleStatus = null                                //dealGoods의 경우, iamport와 통신용도. 일반적으로는 미사용(null).
        // orderGroup.scheduleAtTime = null                                //yyyymmddhhmm, 0일경우 예약시간 없음
        // orderGroup.scheduleAtCount = null
        // orderGroup.dealGoods = false                                  //마이페이지 때문에 추가 1026
        orderGroup.payStatus = "ready"
        // orderGroup.impUid = null          /* PG연동코드 - 아임포트 결제 고유 ID */
        // orderGroup.customerUid = null     /* 정기등록번호(빌링키) */
        // orderGroup.dealCouponAmount = null //card 예약결제용 couponWonAmount별도 저장. 쑥쑥에 쿠폰추가.

        console.log({orderGroup, orderSubGroupList, orderDetailList})

        return { orderGroup, orderSubGroupList, orderDetailList }
    }

    /** [결제상세] 서브그룹의 전체 집계 계산 [subGroupSumObj, rate 구독] **/
    const totalSumObj = useMemo(() => {
        let goodsPrice = 0         //상품금액
        let couponWonAmount = 0    //쿠폰사용금액 (환전된)
        let couponBlyAmount = 0    //쿠폰사용 bly
        let deliveryFee = 0        //배송비
        let jejuDeliveryFee = 0    //제주 배송비
        let orderPrice = 0         //주문금액(원화)
        let orderBly = 0           //주문금액(BLY) [subGroup.orderPrice 합계]
        let usedBlyAmount = 0      //사용한(BLY)
        let payableBlct = 0        //사용가능(BLY)
        let needToPayOrderBly = 0   //최종 결제(BLY) : 주문금액 - 사용한(BLY)
        let needToPayOrderPrice = 0 //최종 결제금액(원화)
        let payMethod = ''         //결제수단 : card, blct, cardBlct

        Object.values(subGroupSumObj).map(obj => {
            goodsPrice += obj.goodsPrice
            couponWonAmount += obj.couponWonAmount
            couponBlyAmount += obj.couponBlyAmount
            deliveryFee += obj.deliveryFee
            jejuDeliveryFee += obj.jejuDeliveryFee
            orderPrice += obj.orderPrice
        })

        //주문금액(BLY)
        orderBly = ComUtil.roundDown(MathUtil.dividedBy(orderPrice, stdInfo.blctToWon), 2)

        //사용 가능한 BLY 100BLY
        payableBlct =  stdInfo.tokenBalance > orderBly ? orderBly : stdInfo.tokenBalance

        if (rate) {
            usedBlyAmount = MathUtil.multipliedBy(payableBlct,MathUtil.dividedBy(rate,100))

            if (usedBlyAmount < 1) {
                usedBlyAmount = 0
            }

            // console.log("드래그한 bly",{rate, usedBlyAmount})

        }

        //최종 결제 (BLY)
        needToPayOrderPrice = orderPrice - MathUtil.multipliedBy(usedBlyAmount,stdInfo.blctToWon)
        needToPayOrderBly = MathUtil.dividedBy(needToPayOrderPrice,stdInfo.blctToWon)
        // needToPayOrderBly = ComUtil.roundDown(new BigNumber(needToPayOrderPrice).div(stdInfo.blctToWon).toNumber(), 2)


        //총 결제금액
        const tempNeedToPayOrderPrice = ComUtil.roundDown(needToPayOrderPrice, 0)

        //결제할 금액이 없고 사용한 blct 있을경우 : blct
        if (tempNeedToPayOrderPrice === 0 && usedBlyAmount > 0) {
            console.log('blct')
            payMethod = 'blct'
        }
        //결제 금액 있고, blct 도 사용 한 경우 cardBlct
        else if (tempNeedToPayOrderPrice > 0 && (couponBlyAmount > 0 || usedBlyAmount > 0)) {
            console.log('cardBlct')
            payMethod = 'cardBlct'
        }else{ //card
            console.log('card')
            payMethod = 'card'
        }

        console.log("totalSumObj 계산 호출 ",
            {
                goodsPrice,
                couponWonAmount,
                couponBlyAmount,
                deliveryFee,
                jejuDeliveryFee,
                orderPrice,
                orderBly,
                usedBlyAmount,
                payableBlct,
                needToPayOrderBly,
                needToPayOrderPrice,
                payMethod
            })

        return {
            goodsPrice,
            couponWonAmount,
            couponBlyAmount,
            deliveryFee,
            jejuDeliveryFee,
            orderPrice,
            orderBly,
            usedBlyAmount,
            payableBlct,
            needToPayOrderBly,
            needToPayOrderPrice,
            payMethod
        }
    }, [subGroupSumObj, rate]); //subGroupSumObj, rate 값이 바뀔때만 갱신

    //희망배송일 지정
    const onDateChange = ({goodsNo, date}) => {
        const newGoodsOrgList = Object.assign([], goodsOrgList)
        const newGoods = newGoodsOrgList.find(goodsOrg => goodsOrg.goodsNo === goodsNo)
        newGoods.hopeDeliveryDate = date
        setGoodsOrgList(newGoodsOrgList)
    }

    //사용가능한 bly 가 1보다 작을경우 비활성화
    const isLockedBlyAmount = (!stdInfo.tokenBalance || stdInfo.tokenBalance < 1)

    //상품 삭제 클릭
    const onDeleteGoodsClick = (goodsNo) => {

        let totalCount = 0
        const remainedGoodsList = []
        // const producerOrgList = []
        // let goodsOrgList = []

        optionGoodsBuyingInfoRef.current.optionGoodsInfo.map(goodsList => {
            const list = goodsList.filter(goods => goods.goodsNo !== goodsNo)
            if (list.length > 0) {
                remainedGoodsList.push(list)
                // goodsOrgList = goodsOrgList.concat(_.flattenDeep(list))
                totalCount++
            }
        })

        // const goodsList = optionGoodsBuyingInfoRef.current.optionGoodsInfo.filter(goods => goods.goodsNo !== goodsNo)
        // const newOptionGoodsBuyingInfo = Object.assign({}, optionGoodsBuyingInfoRef.current)
        // newOptionGoodsBuyingInfo.optionGoodsInfo = goodsList
        if (totalCount <= 0) {
            alert('최소 하나의 상품은 있어야 합니다.')
            return
        }
        optionGoodsBuyingInfoRef.current = {
            ...optionGoodsBuyingInfoRef.current,
            optionGoodsInfo: remainedGoodsList
        }

        console.log("optionGoodsBuyingInfoRef.current", optionGoodsBuyingInfoRef.current)


        // Object.assign([], producerOrgList)

        // calcAll(optionGoodsBuyingInfoRef.current.optionGoodsInfo, producerOrgList, goodsOrgList)

        searchGoods()

    }

    if (optionGoodsBuyingInfoRef.current.isError) {
        return null
    }

    if (loadingType !== LOADING.NONE) {
        if (loadingType === LOADING.DATA_FETCH)
            return <BlocerySpinner />
        if (loadingType === LOADING.BLOCKCHAIN)
            return <BlockChainSpinner />
    }


    return (
        <div>

            {/*{loadingType === LOADING.DATA_FETCH && <BlocerySpinner />}*/}
            {/*{loadingType === LOADING.BLOCKCHAIN && <BlockChainSpinner />}*/}

            <BackNavigation hideHomeButton={true} onBackClick={closePopup}>구매하기</BackNavigation>
            <FixedScrollUpButton bottom={54 + 16} />

            {/* 선물하기 */}
            <Components.Gift giftInfo={giftInfo} setGiftInfo={setGiftInfo} />
            <ShopBlyLayouts.HrStrong />
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
                    localNightAlarm={localNightAlarm} setLocalNightAlarm={setLocalNightAlarm} //isLocal일때만 필요.
                    isLocal={getIsLocal(goodsOrgList)}
                />

            </Components.Address>
            <ShopBlyLayouts.HrStrong />
            {/* 주문 상품 */}
            <Atoms.ItemHeader px={16} pt={20} pb={16}>
                주문상품
            </Atoms.ItemHeader>

            <Div bg={'background'} p={8}
                 // px={16} py={20}
            >
                <JustListSpace space={31}>
                    {
                        Object.values(producerObj).map(({producer, subGroupList}) => {
                            return(

                                <Div key={producer.producerNo}
                                     rounded={4}
                                     bc={'light'}
                                     overflow={'hidden'}
                                     bg={'white'}
                                >
                                    <Div p={16}><b>{producer.farmName}</b></Div>
                                    <Hr bc={'black'} mx={16}/>
                                    <Div custom={`
                                        & > div {
                                            border-bottom: ${getValue(6)} solid ${color.light};
                                        } 
                                        & > div:last-child {
                                            border: 0;
                                        }
                                    `}>
                                    {
                                        subGroupList.map(({subId, goodsList}) => {

                                            const sub = subGroupSumObj[subId]

                                            return(
                                                <div key={subId}>

                                                    {/* 상품 리스트 */}
                                                    <ListBorder spaceColor={'light'}>
                                                        {
                                                            goodsList.map(goods => {
                                                                    return(
                                                                        <Components.OptionGoodsCard key={goods.goodsNo} goods={goods} visibleDeliveryFee={false} >
                                                                            {/* 동작은 잘 하지만, 삭제후 새로 계산만 하도록 로직 변경이 필요할듯 */}
                                                                            {/*<button onClick={onDeleteGoodsClick.bind(this, goods.goodsNo)}>삭제</button>*/}
                                                                            <Div custom={`
                                                                            & > * {
                                                                                margin-top: ${getValue(10)};
                                                                            }
                                                                        `}>
                                                                                {
                                                                                    goods.hopeDeliveryFlag && (
                                                                                        <Flex>
                                                                                            <Div fg={'danger'} mr={8} fontSize={13}>
                                                                                                <Required/>희망배송일 :
                                                                                            </Div>
                                                                                            <HopeDeliveryDate
                                                                                                goodsNo={goods.goodsNo}
                                                                                                expectShippingStart={goods.expectShippingStart}
                                                                                                expectShippingEnd={goods.expectShippingEnd}
                                                                                                hopeDeliveryDate={goodsOrgList.find(goodsOrg => goodsOrg.goodsNo === goods.goodsNo).hopeDeliveryDate}
                                                                                                onChange={onDateChange}
                                                                                            />
                                                                                        </Flex>
                                                                                    )
                                                                                }
                                                                                {
                                                                                    goods.isNotSupportedTimeSale && (
                                                                                        <Toast
                                                                                            title={'포텐타임 쿠폰'}
                                                                                            bodyStyle={{background: color.white}}
                                                                                            content={<AboutNotSurpportedTimeSaleCouponContent />}
                                                                                            position={'right'}
                                                                                        >
                                                                                            <Div fg={'danger'} fontSize={13}><u>포텐타임 쿠폰은 묶음배송시 지원되지 않습니다.</u></Div>
                                                                                        </Toast>
                                                                                    )
                                                                                }
                                                                                {
                                                                                    (!goods.isNotSupportedTimeSale && goods.timeSale && goods.inTimeSalePeriod)  && (
                                                                                        <BadgeGoodsEventType goodsEventType={'POTENTIME'}>
                                                                                            포텐타임
                                                                                        </BadgeGoodsEventType>
                                                                                    )
                                                                                }
                                                                                {
                                                                                    (goods.superReward && goods.inSuperRewardPeriod)  && (
                                                                                        <BadgeGoodsEventType goodsEventType={'SUPERREWARD'}>
                                                                                            슈퍼리워드
                                                                                        </BadgeGoodsEventType>
                                                                                    )
                                                                                }
                                                                            </Div>
                                                                        </Components.OptionGoodsCard>
                                                                    )
                                                                }
                                                            )
                                                        }
                                                    </ListBorder>

                                                    {/* 쿠폰 */}
                                                    <Div relative px={16} pt={31} pb={21} custom={`border-top: 1px solid ${color.light}`}>
                                                        <Div absolute left={'50%'} top={-1} xCenter>
                                                            <Img src={SquareImage} alt={'쿠폰구분도형'} width={28} display={'block'}/>
                                                        </Div>
                                                        <BasicSelect data={sub.couponList}
                                                                     value={sub.couponNo}
                                                                     disabledValues={getDisabledCouponValues(subId)}
                                                                     selectionText={sub.couponList.length > 0 ? '쿠폰사용안함' : '사용가능한 쿠폰이 없습니다'}
                                                                     onChange={onCouponChange.bind(this, subId)}
                                                                     wrapperStyle={sub.couponNo && {bc: 'green'}}
                                                                     iconStyle={sub.couponNo && {color: 'green'}}
                                                        />
                                                        { sub.couponType === 'deliveryCoupon' && <Div px={10} pt={10} fg={'green'} fontSize={13}>
                                                            상품금액에서 배송비 할인 적용
                                                        </Div>
                                                        }
                                                        <JustListSpace space={6} mt={19} px={8} custom={`font-size: ${getValue(13)};`}>

                                                            <Flex fg={'darkBlack'}>
                                                                <div>상품금액</div>
                                                                <Right>{toWon(sub.goodsPrice)}원</Right>
                                                            </Flex>
                                                            {
                                                                sub.couponBlyAmount > 0 && (
                                                                    <Flex fg={'darkBlack'}>
                                                                        <div>쿠폰사용</div>
                                                                        <Right fg={'danger'}>-{toWon(sub.couponWonAmount)}원</Right>
                                                                    </Flex>
                                                                )
                                                            }
                                                            {sub.localfoodFlag ? //2208 배송지원비 때문에 추가.
                                                                <Div>
                                                                    {(sub.deliveryFee) == 0 ?
                                                                        <Flex fg={'darkBlack'}>
                                                                            <div>배송비</div>
                                                                            <Right>무료배송</Right>
                                                                        </Flex>
                                                                        :
                                                                        <Fragment>
                                                                            <Flex fg={'darkBlack'}>
                                                                                <div>배송비</div>
                                                                                <Right>{toWon(sub.deliveryFee)}원</Right>
                                                                            </Flex>
                                                                            <Div fontSize={12} fg={'darkgray'}>
                                                                                (기본 배송비 6,000원,  지원금 -{toWon(6000 - sub.deliveryFee)}원)
                                                                            </Div>
                                                                        </Fragment>
                                                                    }
                                                                </Div>
                                                                :
                                                                <Flex fg={'darkBlack'}>
                                                                    <div>배송비</div>
                                                                    <Right>
                                                                        {
                                                                            (sub.deliveryFee + sub.jejuDeliveryFee) > 0 ? <>+{toWon(sub.deliveryFee + sub.jejuDeliveryFee)}원</> : <>무료배송</>
                                                                        }
                                                                    </Right>
                                                                </Flex>
                                                            }

                                                            <Flex fontSize={15}>
                                                                <div><b>주문금액</b></div>
                                                                <Right><b>{toWon(sub.orderPrice)}원</b></Right>
                                                            </Flex>
                                                        </JustListSpace>
                                                        {/*{*/}
                                                        {/*    goodsList[0].localfoodFarmerNo > 0 && (*/}
                                                        {/*        <ShopBlyLayouts.Alert mt={16}>*/}
                                                        {/*            매장 재고 부족 시 상품이 부분 취소될 수 있습니다.*/}
                                                        {/*        </ShopBlyLayouts.Alert>*/}
                                                        {/*    )*/}
                                                        {/*}*/}
                                                        {/*<Flex px={8} fontSize={15} mt={8}>*/}
                                                        {/*    <div><b>주문금액</b></div>*/}
                                                        {/*    <Right><b>{toWon(subGroupSumObj[subId].orderPrice)} 원</b></Right>*/}
                                                        {/*</Flex>*/}
                                                    </Div>
                                                    {
                                                        DEVELOPER_MODE && <Components.PrintJSON data={subGroupSumObj[subId]} name={'subGroupSumObj'} />
                                                    }
                                                </div>
                                            )
                                        })
                                    }
                                    </Div>
                                </Div>
                            )
                        })
                    }
                </JustListSpace>
            </Div>

            {/* BLY 사용 */}
            <Flex alignItems={'flex-end'}>
                <Atoms.ItemHeader px={16} pt={20} pb={4}>BLY 사용</Atoms.ItemHeader>
                <Right mb={8} mr={16}>
                    <Toast
                        title={'BLY 시세'}
                        bodyStyle={{background: color.white}}
                        content={<AboutBlyPriceContent />}
                        position={'right'}
                    >
                        <Div bg={'bly'} doActive fg={'white'} minHeight={22} px={5} lineHeight={22} rounded={2} fontSize={12}>1BLY = {stdInfo.blctToWon}원</Div>
                    </Toast>
                </Right>
            </Flex>
            <Div p={16} pb={30}>
                <JustListSpace space={16} lastSpace={30}>
                    <Flex rounded={4} bc={'light'} py={20} px={16} alignItems={'flex-start'}>
                        <Div fontSize={15}>
                            보유
                        </Div>
                        <Right textAlign={'right'}>
                            <Bold fontSize={18} bold>{ComUtil.roundDown(stdInfo.tokenBalance, 2)} BLY</Bold>
                            <Div fg={'bly'} fontSize={14}>({toWon(MathUtil.multipliedBy(stdInfo.tokenBalance,stdInfo.blctToWon))}원)</Div>
                        </Right>
                    </Flex>
                    <Space spaceGap={10} fontSize={14} height={45}>
                        {/*<Div relative rounded={3} flexGrow={1} px={16} lineHeight={45} bg={'background'} bc={'light'} fg={*/}
                        {/*    ComUtil.roundDown(totalSumObj.usedBlyAmount,0) < 1 ? 'dark' : 'black'}>*/}
                        {/*    {*/}
                        {/*        ComUtil.roundDown(totalSumObj.usedBlyAmount,0) < 1 ?*/}
                        {/*            `최소 1BLY 이상 사용가능` : `${ComUtil.roundDown(totalSumObj.usedBlyAmount,2)}BLY / ${toWon(MathUtil.multipliedBy(totalSumObj.usedBlyAmount,stdInfo.blctToWon))}원`*/}
                        {/*    }*/}
                        {/*    <IoMdCloseCircle*/}
                        {/*        style={{*/}
                        {/*            position: 'absolute',*/}
                        {/*            top: '50%',*/}
                        {/*            transform: 'translateY(-50%)',*/}
                        {/*            right: getValue(16),*/}
                        {/*            cursor: 'pointer',*/}
                        {/*        }}*/}
                        {/*        color={color.secondary} size={getValue(25)}*/}
                        {/*        onClick={onRemoveBlyClick}*/}
                        {/*    />*/}
                        {/*</Div>*/}
                        <Div relative flexGrow={1}>
                            <IoMdCloseCircle
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    right: getValue(16),
                                    cursor: 'pointer',
                                }}
                                color={color.secondary} size={getValue(25)}
                                onClick={onRemoveBlyClick}
                            />
                            <Input rounded={3} bc={'light'} readOnly placeholder={'최소 1BLY 이상 사용가능'}
                                   width={'100%'}
                                   value={
                                       ComUtil.roundDown(totalSumObj.usedBlyAmount,0) > 1 ?
                                           `${ComUtil.roundDown(totalSumObj.usedBlyAmount,2)}BLY / ${toWon(MathUtil.multipliedBy(totalSumObj.usedBlyAmount,stdInfo.blctToWon))}원` :
                                           ''
                                   } />
                        </Div>

                        <Right height={'100%'} flexShrink={0}>
                            <Button rounded={3} height={'100%'} minWidth={100} px={16} bg={'green'} fg={'white'} onClick={() => setRate(100)} disabled={isLockedBlyAmount} >전액사용</Button>
                        </Right>
                    </Space>
                </JustListSpace>
                {
                    !isLockedBlyAmount && <Slider value={rate} onChange={onSliderChange} />
                }
            </Div>

            <PayMethod isOpen={ComUtil.roundDown(totalSumObj.needToPayOrderPrice, 0) > 0}
                       payPgGubun={payPgGubun}
                       onClick={onPayPgGubunChange} />
            {
                DEVELOPER_MODE && <Components.PrintJSON data={totalSumObj} name={'totalSumObj'} />
            }

            {/* 결제 상세 */}
            <ShopBlyLayouts.HrStrong />
            <Div pb={150}>
                <PayTotal
                    blctToWon={stdInfo.blctToWon}
                    totalGoodsPrice={totalSumObj.goodsPrice}
                    couponBlyAmount={totalSumObj.couponBlyAmount}
                    couponWonAmount={totalSumObj.couponWonAmount}
                    totalDeliveryFee={totalSumObj.deliveryFee + totalSumObj.jejuDeliveryFee}
                    usedBlyAmount={totalSumObj.usedBlyAmount}
                    needToPayOrderPrice={totalSumObj.needToPayOrderPrice <= 0 ? 0 : totalSumObj.needToPayOrderPrice}
                    needToPayOrderBly={ComUtil.roundDown(totalSumObj.needToPayOrderBly, 2) <= 0 ? 0 : ComUtil.roundDown(totalSumObj.needToPayOrderBly, 2)}

                    producerWrapDeliver = { (Object.keys(producerObj).length === 1 &&  Object.values(producerObj)[0].producer.producerWrapDeliver)? true:false } //1생산자 주문일때만 체크.
                    isLocal={getIsLocal(goodsOrgList)}
                />
                {
                    isLocal &&
                    <Div px={16} py={20}>
                        <Checkbox id={'payCheck'} bg={'green'} onChange={onPayCheckBoxChange} size={'sm'}>
                            <Span fontSize={15} fg={isLocal ? 'darkBlack' : 'dark'}>로컬푸드 서비스 동의</Span>
                        </Checkbox>
                        <Div rounded={4} bg={'veryLight'} mt={10} p={15} fontSize={14}>
                            <Flex dot alignItems={'flex-start'} mb={5}>
                                <div>
                                    주문 상품 <Strong>재고부족</Strong> 시 사전고지 없이 <Strong fg={'danger'}>타생산자 동일 품목으로 출고</Strong> 또는 <Strong fg={'danger'}>주문취소</Strong> 될 수 있습니다.
                                </div>
                            </Flex>
                            <Flex dot alignItems={'flex-start'}>
                                <div>
                                    로컬푸드 특성상 동일 품목인 경우에도 생산자별로 가격이 상이 할 수 있으며, <Strong fg={'danger'}>가격이 낮은</Strong> 상품은 <Strong fg={'danger'}>못난이 상품</Strong>일 수 있습니다.
                                </div>
                            </Flex>
                        </Div>
                    </Div>
                }
            </Div>

            {/* 결제 하기 */}
            <Components.PayButtonFooter onClick={onBuyClick}>
                {
                    `${totalSumObj.needToPayOrderPrice <= 0 ? 0 : ComUtil.addCommas(MathUtil.roundHalf(totalSumObj.needToPayOrderPrice))}원 결제하기`
                }
            </Components.PayButtonFooter>



            <Components.ModalPassPhrase modalOpen={modalOpen} toggle={toggle} onSuccess={payByBlct} />

        </div>
    );
};

export default OptionGoodsBuy;

//결제방법
const PayMethod = React.memo(({isOpen, payPgGubun, onClick}) => {
    return (
        <Collapse isOpen={isOpen}>
            <ShopBlyLayouts.HrStrong />
            <div>
                <Atoms.ItemHeader px={16} pt={20} pb={4}>
                    결제방법
                </Atoms.ItemHeader>
                <GridColumns p={16} colGap={0} rowGap={10} >
                    {
                        payPgGubuns.map(item =>
                            <Components.PayPgGubunButton
                                key={item.value}
                                active={item.value === payPgGubun}
                                onClick={onClick.bind(this, item.value)}>
                                {
                                    item.icon ? <img src={item.icon} style={{height: 24}}/> : <Div fontSize={17}><b>{item.label}</b></Div>
                                }
                            </Components.PayPgGubunButton>
                        )
                    }
                </GridColumns>
            </div>
        </Collapse>
    )
})

//희망 배송수령일 달력
const HopeDeliveryDate = ({goodsNo, expectShippingStart, expectShippingEnd, hopeDeliveryDate, onChange}) => {
    const [dateFocus, setDateFocus] = useState(false)
    const onDateChange = (date) => {
        onChange({goodsNo, date: date.endOf('day')})
    }
    const renderUntilCalendarInfo = () => {
        return <Div
            bg={'background'}
            py={14}
            fontSize={14}
            textAlign={'center'}
            bc={'light'}
            bt={0}
            br={0}
            bl={0}
        >
            {`${ComUtil.utcToString(expectShippingStart)} ~ ${ComUtil.utcToString(expectShippingEnd)} 중 선택`}
        </Div>
    }
    return(
        <SingleDatePicker
            placeholder="날짜선택"
            date={hopeDeliveryDate ? moment(hopeDeliveryDate) : null}
            // date={date}
            onDateChange={onDateChange}
            focused={dateFocus} // PropTypes.bool
            onFocusChange={({ focused }) => setDateFocus(focused)} // PropTypes.func.isRequired
            id={"stepPriceDate_"+goodsNo} // PropTypes.string.isRequired,
            numberOfMonths={1}
            withPortal
            small
            readOnly
            calendarInfoPosition="top"
            enableOutsideDays
            // orientation="vertical"
            //배송시작일의 달을 기본으로 선택 되도록
            initialVisibleMonth={()=> hopeDeliveryDate ? hopeDeliveryDate : moment(expectShippingStart)}
            // daySize={45}
            verticalHeight={700}
            // noBorder
            //달력아래 커스텀 라벨
            renderCalendarInfo={renderUntilCalendarInfo}
            // orientation="vertical"
            //일자 블록처리
            isDayBlocked={(date)=>{
                if (date.isBefore(moment(expectShippingStart)) || date.isAfter(moment(expectShippingEnd))) {
                    return true
                }
            }}
        />
    )
}

//결제 상세(즉시상품 용도)
const PayTotal = ({
                      totalGoodsPrice,     //총 상품금액
                      totalDeliveryFee,    //총 배송비
                      usedBlyAmount,       //사용 (BLY)
                      blctToWon,           //BLY 환율
                      couponBlyAmount,     //쿠폰(BLY)
                      couponWonAmount,     //쿠폰(원화)
                      needToPayOrderPrice, //최종 결제 (원화)
                      needToPayOrderBly,    //최종 결제 (BLY)
                      producerWrapDeliver,   //1생산자 주문이고, 생산자가 묵음배송 생산자일때 true
                      isLocal               //로컬푸드 상품이 포함된 경우 true
                  }) => {
    return(
        <Div px={16} py={20}>
            <Atoms.ItemHeader>
                결제상세
            </Atoms.ItemHeader>
            <Div mt={20}>
                <Flex>
                    <Div fontSize={14} fg={'darkBlack'}>총 상품금액</Div>
                    <Right fontSize={16}><b>{ComUtil.addCommas(totalGoodsPrice)}원</b></Right>
                </Flex>
                {
                    couponBlyAmount > 0 &&
                    <Flex mt={10} alignItems={'flex-start'}>
                        <Div fontSize={14} fg={'darkBlack'}>쿠폰 사용</Div>
                        <Right  fontSize={16} textAlign={'right'} fg={'danger'}>
                            {
                                '- ' + ComUtil.addCommas(MathUtil.roundHalf(couponWonAmount)) +'원'
                            }
                        </Right>
                    </Flex>
                }
                <Flex mt={10}>
                    <Div fontSize={14} fg={'darkBlack'}>배송비
                        {
                            (producerWrapDeliver && totalDeliveryFee != 0 && !isLocal) && <Span fg={'green'}> (장바구니로 할인가능)</Span>
                        }
                    </Div>
                    <Right fontSize={16}>{!totalDeliveryFee ? '무료배송' : `+ ${ ComUtil.addCommas(totalDeliveryFee)}원`}</Right>
                </Flex>

                {
                    usedBlyAmount > 0 && (
                        <Flex mt={10} alignItems={'flex-start'}>
                            <Div fontSize={14} fg={'darkBlack'}>BLY 사용</Div>
                            <Right fontSize={16} textAlign={'right'}>
                                <Span fg={'bly'} >- {ComUtil.addCommas(ComUtil.roundDown(usedBlyAmount, 2))} BLY</Span>
                                <Span ml={8} fg={'danger'}>(- {ComUtil.addCommas(MathUtil.roundHalf(MathUtil.multipliedBy(usedBlyAmount,blctToWon)))}원)</Span>
                                {/*<Div>-{ComUtil.addCommas(usedBlyAmount * blctToWon)}원</Div>*/}
                            </Right>
                        </Flex>
                    )
                }

                <Hr mt={20}/>
                <Flex mt={20} fontSize={20}>
                    <Div bold>총 결제 금액</Div>
                    <Right>
                        {/*BLY결제일때는 totalOrderPrice=0 이므로 -쿠폰 필요없음*/}
                        <b>{ComUtil.addCommas(MathUtil.roundHalf(needToPayOrderPrice))}원</b>
                    </Right>
                </Flex>
                {/*<Div mt={3} textAlign={'right'} fontSize={14} fg={'bly'}>{ComUtil.addCommas(ComUtil.roundDown(needToPayOrderBly, 2))} BLY</Div>*/}
            </Div>
        </Div>
    )
}