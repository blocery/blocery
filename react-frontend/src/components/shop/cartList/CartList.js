import React, { Fragment, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'                              //토스트
import { ShopXButtonNav, BlocerySpinner, LoginLinkCard } from '../../common'
import Css from './CartList.module.scss'
import CartHeader from './CartHeader'
import CartGroup from './CartGroup'
import InvalidCartItem from './InvalidCartItem'
import CartSummary from './CartSummary'
import ComUtil from '~/util/ComUtil'

import { groupBy } from 'lodash'
import { Webview } from '~/lib/webviewApi'

import {getLoginUserType} from '~/lib/loginApi'

import { getCart, deleteCart, updateCart } from '~/lib/cartApi'
import {getGoodsByGoodsNo} from '~/lib/goodsApi'
import { getProducerByProducerNo } from '~/lib/producerApi'

import {getDeliveryFee, getSumInfoByGoods, addGoodsMeta2Options, getDeliveryFeeObj} from '~/util/bzLogic'
import {Button } from 'reactstrap'
import {BodyFullHeight} from '~/components/common/layouts'
import {Div, Fixed, Flex, Right, Sticky, Strong} from '~/styledComponents/shared/Layouts';
import BackNavigation from "~/components/common/navs/BackNavigation";
import ShopBlyLayouts, {EmptyBox} from "~/styledComponents/ShopBlyLayouts";
import MathUtil from "~/util/MathUtil";
import {color} from "~/styledComponents/Properties";
import ProfileAuto from "~/components/common/cards/ProfileAuto";
import {Link, Span} from "~/styledComponents/shared";

import {IoIosArrowForward} from 'react-icons/io'
import {deliveryMsgStore} from "~/store";
import Toast from "~/components/common/toast/Toast";
import TG from '~/components/common/tg/TG'
import useLogin from "~/hooks/useLogin";
import useNotice from "~/hooks/useNotice";
import useCartCount from "~/hooks/useCartCount";

function LoginForm({refresh}) {
    const {consumer, openLoginModal} = useLogin()

    useEffect(() => {
        if (consumer) {
            refresh()
        }
    }, [consumer]);


    return(
        <>
            <BackNavigation showShopRightIcons>장바구니</BackNavigation>
            <BodyFullHeight nav bottomTabbar>
                <LoginLinkCard icon description={'로그인 후 장바구니 서비스를 이용 하실 수 있습니다'} onClick={openLoginModal} />
            </BodyFullHeight>
        </>
    )
}

class CartList extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            cartGoodsList:[],
            expiredGoodsList: [],
            loginUserType: undefined,

            isLoading: true,
            totCount: 0,
            checkedCount: 0,
            cartGoodsGroupList: undefined,
            refreshCartCountDate: null
        }
    }

    getCartList = async () => {
        const {data} = await getCart()
        return data
    }

    getCartGoodsList = async (cartList) => {

        const promises = cartList.map(cart => getGoodsByGoodsNo(cart.goodsNo))

        const resList = await Promise.all(promises)

        return resList.map((res, index )=> {
            const goods = res.data
            const cart = cartList[index]

            const cartGoods = {...goods, ...cart}

            ////////옵션상품 반영 ////////////////
            //option메타+oderCnt추가
            // const options = cart.options.map(option => {
            //     const orgOption = goods.options.find(go => go.optionIndex === option.optionIndex)
            //     return {
            //         ...orgOption,             //상품원본 옵션
            //         orderCnt: option.orderCnt, //주문수량
            //         goodsNm: goods.goodsNm + ((option.optionIndex===0)?'':' [옵션:' + orgOption.optionName + ']'), //메타 goodsNm for option
            //     }
            // })
            // cartGoods.options = options; //options에 Goods정보세팅 완료

            //options에 Goods정보세팅 - 공통함수
            cartGoods.options = addGoodsMeta2Options(cart.options, goods).options
            console.log('cartGoods:', cartGoods)

            // 상품정보의 배송비 초기 세팅
            cartGoods.deliveryFee = goods.deliveryFee;

            // 배송비 계산
            const {goodsPrice, deliveryFee} = getSumInfoByGoods(cartGoods)
            //const deliveryFee = getDeliveryFee({qty: cart.qty, deliveryFee: goods.deliveryFee, deliveryQty: goods.deliveryQty, termsOfDeliveryFee: goods.termsOfDeliveryFee, orderPrice: goods.currentPrice*cart.qty})

            //원래의 배송비 기억용
            //cartGoods.orgDeliveryFee = deliveryFee

            //cart 전용 변수
            cartGoods.deliveryFee = deliveryFee
            cartGoods.goodsPrice = goodsPrice //cartGoods.currentPrice * cartGoods.qty
            cartGoods.totPrice = MathUtil.plusBy(cartGoods.goodsPrice,cartGoods.deliveryFee)   //합계 : 상품가 + 배송비

            return cartGoods
        })
    }

    //묶음배송 이전.
    // getCartGoodsGroupList = async (cartGoodsGroupObj) => {
    //
    //     //생산자 리스트 조회
    //     const promises = Object.keys(cartGoodsGroupObj).map(producerNo => getProducerByProducerNo(producerNo))
    //     const resList = await Promise.all(promises)
    //     const producerList = resList.map(res => res.data)
    //
    //     return producerList.map(producer => {
    //         const cartGoodsList = cartGoodsGroupObj[producer.producerNo]
    //         const summary = this.getSummary(cartGoodsList, producer)
    //         return {
    //             producerNo: producer.producerNo,    //빠른 검색을 위해 추가
    //             producer: producer,
    //             cartGoodsList: cartGoodsList,
    //             summary: summary
    //         }
    //     })
    // }

    //2022.04 상품오브젝트 + 생산자묶음배송(producerWrapDelivered)분리. : sort by - producerNo+producerWrapDelivered
    getCartGoodsGroupListWrapDelivered = async (validCartList) => {

        //생산자 리스트 조회
        const cartGoodsGroupObj = groupBy(validCartList, 'producerNo')
        const promises = Object.keys(cartGoodsGroupObj).map(producerNo => getProducerByProducerNo(producerNo))
        const resList = await Promise.all(promises)
        const producerList = resList.map(res => res.data)

        //validCartList를 sort by:producerNo+producerWrapDelivered.
        validCartList.sort((a, b) => {
            const aVal = a.producerNo + a.producerWrapDelivered;
            const bVal = b.producerNo + b.producerWrapDelivered;
            // return aVal - bVal; //ascending.
            return bVal - aVal; //descending.
        })

        /////producerNo + producerWrapDelivered 로 그룹핑./////////////
        let retGoodsGroupList = [];

        let cartGoodsList = [];

        let firtGroup = true; //same producer의 firstGroup관리. (헤더 + localStorage arr생성용)
        for (let i=0; i < validCartList.length; i++) {
            let oneCart = validCartList[i]

            let curKey = oneCart.producerNo + oneCart.producerWrapDelivered.toString();
            let nextKey = (i==validCartList.length-1)? (0+'false'):(validCartList[i+1].producerNo+validCartList[i+1].producerWrapDelivered.toString()); //마지막 record면 임의값, else producerNo + producerWrapDelivered

            //producerWrapDelivered=false일때, 즉 동일생산자 내에 다른상품 subGroup분리필요시:  key에 gooodNo더해서 보정. 20220408
            if (!oneCart.producerWrapDelivered) {
                curKey += oneCart.goodsNo.toString()
                console.log('curKey:', curKey, oneCart)
            }
            if (i < validCartList.length-1 && !validCartList[i+1].producerWrapDelivered) {
                nextKey += validCartList[i+1].goodsNo.toString()
            }

            cartGoodsList.push(oneCart)

            if (curKey != nextKey) { //group별 마지막 record이면, group저장하고 초기화.
                let producer = producerList.find(pl => pl.producerNo === oneCart.producerNo)

                retGoodsGroupList.push({
                    producerNo: oneCart.producerNo,
                    producer: producer,
                    cartGoodsList: cartGoodsList,
                    summary: this.getSummary(cartGoodsList, producer),
                    groupKey: curKey,
                    firstGroup: firtGroup
                })

                //다음 group용 firstGroup flag설정.
                //curProducerNo === nextProducerNo : firstGroup = false;
                //else firstGroup = false;
                let nextProducerNo =  (i==validCartList.length-1)?0: validCartList[i+1].producerNo
                if (oneCart.producerNo === nextProducerNo) {
                    firtGroup = false;
                }else {
                    firtGroup = true;
                }

                cartGoodsList = [];
            }
        }

        return retGoodsGroupList;
    }

    //그룹별 배송비 및 결제금액 계산
    getSummary = (cartGoodsList, producer) => {
        let
            sumGoodsPrice = 0,              //전체상품가격 합계
            sumDeliveryFee = 0,             //전체 배송비 합계
            result = 0,                     //결제금
            additionalDeliveryFeeInfo = ''            //배송조건 메시지

        //체크된것만 걸러냄
        const remainedCartGoodsList = cartGoodsList.filter(cartGoods => cartGoods.checked === true)


        remainedCartGoodsList.map(cartGoods => {
            //OLD : const goodsPrice = cartGoods.currentPrice * cartGoods.qty
            //sumGoodsPrice += cartGoods.goodsPrice                     //상품가격 합계

            //option반영 상품가합계.
            cartGoods.options.map(option => {
                sumGoodsPrice += MathUtil.multipliedBy(option.optionPrice,option.orderCnt)
            })

            sumDeliveryFee += cartGoods.deliveryFee                   // 배송비 합계 (전체 배송비로 사용중)
        })

        //묶음배송비 이상일경우 sumDeliveryFee=0, else 추가.
        const producerWrapDelivered = (cartGoodsList[0])? cartGoodsList[0].producerWrapDelivered:false

        //묶음배송 지원 상품줌 => 생산자 정보의 묶음 배송비 정책을 보여줌
        if (producerWrapDelivered) {
            console.log('getSummary - producer:', producer)
            if ( sumGoodsPrice >= producer.producerWrapLimitPrice) {
                sumDeliveryFee = 0
            } else {
                sumDeliveryFee = producer.producerWrapFee  // 로컬푸드는 무조건 배송비
                if(!producer.localfoodFlag) {
                    // producer 에서 배송비 정책 가져옴
                    //토스트 내용이 묶음배송, 옵션, 로컬상품 등에 따라 배송비 안내정책이 바뀔 수 있어 부모가 직접 태그를 넣도록 함
                    additionalDeliveryFeeInfo = (
                        <Toast
                            title={producer.farmName + ' 묶음배송'}
                            bodyStyle={{background: color.white}}
                            content={
                                <div>
                                    묶음배송 지원되는 상품금액의 합이 <Strong
                                    fg={'green'}>{ComUtil.addCommas(producer.producerWrapLimitPrice)}원 이상
                                    무료배송</Strong> 입니다.
                                    <br/>
                                    생산자의 <Strong fg={'green'}>묶음 배송지원 되는 상품을 추가</Strong>해서 <Strong fg={'green'}>무료배송의
                                    혜택</Strong>을 누리세요!
                                </div>
                            }
                            position={'left'}
                        >
                            {/*(<u><Strong fg={'green'}>{ComUtil.addCommas(producer.producerWrapLimitPrice - sumGoodsPrice)}원</Strong> 이상 추가 구매 시 무료 배송)</u> + <Link to={`/producersGoodsList?producerNo=${producer.producerNo}&producerWrapDeliver=true`} fg={'primary'} ><Strong>더 담으러 가기</Strong></Link>*/}
                            (<Link to={`/producersGoodsList?producerNo=${producer.producerNo}&producerWrapDeliver=true`}><u><Strong fg={'green'}>{ComUtil.addCommas(producer.producerWrapLimitPrice - sumGoodsPrice)}원</Strong> 이상 추가시 무료)</u></Link>
                        </Toast>
                    )
                }
            }
        }else{
            //묶음배송 미지원 상품 => 상품의 배송비 정책 보여
            if (remainedCartGoodsList.length > 0) {
                const goods = remainedCartGoodsList[0]
                const deliveryInfoObj = getDeliveryFeeObj(goods)

                //상품에 배송조건이 있을 경우
                if (deliveryInfoObj.hasIssue) {

                    //토스트 내용이 묶음배송, 옵션, 로컬상품 등에 따라 배송비 안내정책이 바뀔 수 있어 부모가 직접 태그를 넣도록 함
                    additionalDeliveryFeeInfo = (
                        <Toast
                            title={'배송비 안내'}
                            bodyStyle={{background: color.white}}
                            content={
                                <div>
                                    <Strong fg={'green'}>{deliveryInfoObj.msg}</Strong>
                                    <br/>
                                    (이 상품은 <Strong fg={'green'}>묶음배송이 지원되지 않는 상품</Strong> 입니다.)
                                </div>
                            }
                            position={'left'}
                        >
                            (<u>{deliveryInfoObj.msg}</u>)
                        </Toast>
                    )
                }
            }
        }

        if(remainedCartGoodsList.length > 0){
            result = sumGoodsPrice + sumDeliveryFee// + sumReservationDeliveryFee

        }else{

            sumGoodsPrice = 0              //전체상품가격 합계
            sumDeliveryFee = 0             //즉시상품 배송비 합계
            result = 0                     //결제금
        }

        return {
            sumGoodsPrice,
            sumDeliveryFee,
            result,
            additionalDeliveryFeeInfo
        }
    }

    getFilteredCartGoodsList = (cartGoodsList) => {
        const validCartList = []        //판매중인 상품
        const expiredGoodsList = []     //판매종료 상품

        cartGoodsList.map(cartGoods => {
            if(cartGoods.remainedCnt <= 0 || ComUtil.utcToTimestamp(cartGoods.saleEnd) <= ComUtil.utcToTimestamp(new Date()) || cartGoods.saleStopped || cartGoods.salePaused)
                expiredGoodsList.push(cartGoods)
            else
                validCartList.push(cartGoods)
        })

        return {
            validCartList,
            expiredGoodsList
        }
    }

    getCheckedCount = (cartGoodsList) => {
        // return cartGoodsList.filter(cartGoods => cartGoods.checked === true).length
        let optionCount = 0;
        let checkedList = cartGoodsList.filter(cartGoods => cartGoods.checked === true);
        checkedList.map(item => optionCount += item.options.length);
        return optionCount;
    }


    searchCartGoodsGroupList = async () => {
        //장바구니 리스트
        const cartList = await this.getCartList()
        //장바구니 리스트 + 상품리스트 + 배송비계산 추가
        const cartGoodsList = await this.getCartGoodsList(cartList)

        console.log({cartGoodsList})

        const {
            validCartList,      //판매중 상품 리스트
            expiredGoodsList    //판매완료 상품 리스트
        } = this.getFilteredCartGoodsList(cartGoodsList)

        //체크된 카운트
        const checkedCount = this.getCheckedCount(validCartList)

        console.log({validCartList,      //판매중 상품 리스트
            expiredGoodsList    })

        //OLD 생산자별 그룹 오브젝트 + 생산자묶음배송(producerWrapDelivered)분리.
        //OLD const cartGoodsGroupObj = groupBy(validCartList, 'producerNo')
        //OLD 생산자별 그룹 리스트
        //OLD const cartGoodsGroupList = await this.getCartGoodsGroupList(cartGoodsGroupObj)

        //2022.04 생산자별 그룹 오브젝트 + 생산자묶음배송(producerWrapDelivered)분리.
        const cartGoodsGroupList = await this.getCartGoodsGroupListWrapDelivered(validCartList)

        console.log({
            "step1: cartList": cartList,
            "step2: cartGoodsList": cartGoodsList,
            "step3: 필터링(판매중/판매완료)": {validCartList, expiredGoodsList},
            //"step3: cartGoodsGroupObj": cartGoodsGroupObj,
            "step4: cartGoodsGroupList": cartGoodsGroupList})

        //전체 카운트 디폴트 세팅

        let totCount = 0;
        // let checkedList = cartGoodsList.filter(cartGoods => cartGoods.checked === true);
        validCartList.map(item => totCount += item.options.length);
        // const totCount = validCartList.length

        console.log(totCount, checkedCount)

        this.setState({
            cartGoodsList,
            cartGoodsGroupList,
            expiredGoodsList,
            totCount: totCount,
            checkedCount: checkedCount
        })

    }


    async componentDidMount(){

        const {data:loginUserType} = await getLoginUserType();

        if(loginUserType === 'consumer'){
            await this.searchCartGoodsGroupList()
        }

        this.setState({loginUserType: loginUserType, isLoading: false})
        // this.setState({loginUserType})


    }

    onCartHeadChange = async ({type, state}) => {

        const cartGoodsGroupList = Object.assign([], this.state.cartGoodsGroupList)

        if(type === "CHECKED_ALL"){
            const { checked } = state


            let promises = []

            const consumerNo = this.state.loginUserType.uniqueNo

            cartGoodsGroupList
                .map(cartGoodsGroup => {
                    //체크상태 변경
                    cartGoodsGroup.cartGoodsList.map(cartGoods => {

                        cartGoods.checked = checked

                        const cart = {
                            consumerNo: consumerNo,
                            goodsNo: cartGoods.goodsNo,
                            producerNo: cartGoods.producerNo,
                            //qty: cartGoods.qty,

                            options: cartGoods.options,
                            checked: checked
                        }
                        promises.push(updateCart(cart))

                    })
                    cartGoodsGroup.summary = this.getSummary(cartGoodsGroup.cartGoodsList, cartGoodsGroup.producer)
                })


            //db 업데이트
            if(promises)
                await Promise.all(promises)

            const checkedCount = checked ? this.state.totCount : 0

            this.setState({
                cartGoodsGroupList,
                checkedCount: checkedCount
            })


        }else if(type === "DELETE_ITEMS"){
            if(!this.requestDeleteConfirm()) return

            let goodsNoList = []

            cartGoodsGroupList.map(cartGoodsGroup => {
                const { cartGoodsList } = cartGoodsGroup
                cartGoodsList.map(cartGoods => {
                    if(cartGoods.checked){
                        goodsNoList.push(cartGoods.goodsNo)
                    }
                })
            })


            //db 삭제
            const promises = goodsNoList.map(goodsNo => deleteCart(goodsNo))
            await Promise.all(promises)

            //refresh오류 있어 강제refresh추가.  2022.04
            this.setState({cartGoodsGroupList:[]})

            //db 조회
            await this.searchCartGoodsGroupList()

            this.setState({refreshCartCountDate: new Date()})

        }

    }

    //장바구니에 상품정보 바인딩 및 배송정책 적용
    calculateCart = (cartGoods, goods) => {

        //OLD const deliveryFee = getDeliveryFee({qty: cartGoods.qty, deliveryFee: goods.deliveryFee, deliveryQty: goods.deliveryQty, termsOfDeliveryFee: goods.termsOfDeliveryFee, orderPrice: goods.currentPrice*cartGoods.qty})
        // 상품정보의 초기 배송비 세팅
        cartGoods.deliveryFee = goods.deliveryFee

        // 배송비 계산
        const {goodsPrice, deliveryFee} = getSumInfoByGoods(cartGoods)

        //배송비 정책 적용
        cartGoods.deliveryFee = deliveryFee

        //합계 적용
        cartGoods.goodsPrice = goodsPrice; //cartGoods.qty * goods.currentPrice           //상품가 : 수량 * 현재가
        cartGoods.totPrice = cartGoods.goodsPrice + cartGoods.deliveryFee   //합계 : 상품가 + 배송비

        //즉시상품 여부
        cartGoods.directGoods = goods.directGoods
    }

    onCartItemChange = async ({type, state}) => {
        const cartGoodsGroupList = Object.assign([], this.state.cartGoodsGroupList)
        //no wrap : const cartGoodsGroup = cartGoodsGroupList.find(g => g.producerNo === state.producerNo)
        console.log('onCartItemChange, state:', state)
        const cartGoodsGroup = cartGoodsGroupList.find(g => g.groupKey === state.groupKey ) //key=producerNo+producerWrapDelivered
        console.log('onCartItemChange:' +  state.groupKey)

        const { producer, cartGoodsList, summary } = cartGoodsGroup
        const cartGoods = cartGoodsList.find(cartGoods => cartGoods.goodsNo === state.goodsNo)
        const isOptionGoodsMulti = (cartGoods.options.length > 1)?true:false;

        switch (type){
            case 'UPDATE_QTY' :

                const { data: goods } = await getGoodsByGoodsNo(state.goodsNo)

                //재고수량 체크
                let goodsOptionRemainedCnt = goods.options.find(go => go.optionIndex === state.optionIndex).remainedCnt;
                let targetIndex = cartGoods.options.findIndex(go => go.optionIndex === state.optionIndex);
                console.log('targetIndex, state.optionIndex:', targetIndex, state.optionIndex)

                if(state.qty > goodsOptionRemainedCnt){
                    cartGoods.options[targetIndex].orderCnt = goodsOptionRemainedCnt;
                    this.notify('재고수량이 부족합니다', toast.warn)
                }else{
                    cartGoods.options[targetIndex].orderCnt = state.qty
                }

                //장바구니에 상품정보 바인딩 및 배송정책 적용
                this.calculateCart(cartGoods,  goods)

                //장바구니 db 업데이트
                console.log('updateCart:', cartGoods)
                updateCart(cartGoods)

                //합계 갱신
                cartGoodsGroup.summary = this.getSummary(cartGoodsList, producer)
                break

            case 'UPDATE_CHECKED' :

                const { checked, producerNo, goodsNo } = state
                const cart = {
                    consumerNo: this.state.loginUserType.uniqueNo,
                    goodsNo: goodsNo,
                    producerNo: producerNo,
                    //qty: state.qty,
                    options: cartGoods.options,
                    checked: checked
                }

                //db update
                await updateCart(cart)

                //체크상태 변경
                cartGoods.checked = checked

                //합계 갱신
                cartGoodsGroup.summary = this.getSummary(cartGoodsList, producer)

                const checkedCount = checked ? this.state.checkedCount + (cartGoods.options.length) : this.state.checkedCount - (cartGoods.options.length)

                this.setState({checkedCount})


                break

            case 'DELETE' :

                if(!this.requestDeleteConfirm()) return

                //[optionGoods반영] multiOption에서 옵션 1개 지우기
                if (isOptionGoodsMulti) { //update state.optionIndex 들어옴.

                    //cartGoods option하나 지우기.(deep deep이라 cartGoods.options.splice(delIndex..) 하면 state오류 발생함.

                    let delIndex = cartGoods.options.findIndex(go => go.optionIndex === state.optionIndex)
                    console.log('DELETE CartGoods.option 1EA:', cartGoods, delIndex)
                    cartGoods.options.splice(delIndex, 1)
                    await updateCart(cartGoods)

                    //배송비 정책 다시한번 적용 [ 옵션 삭제 시 배송비 갱신안되는 버그 FIX ]
                     const { data: goods } = await getGoodsByGoodsNo(cartGoods.goodsNo)
                    cartGoods.deliveryFee = goods.deliveryFee //원복후 재계산

                    const {goodsPrice, deliveryFee} = getSumInfoByGoods(cartGoods)
                    cartGoods.deliveryFee = deliveryFee

                    cartGoodsGroup.summary = this.getSummary(cartGoodsGroup.cartGoodsList, producer)
                    console.log('DELETE option - SUMMARY:', cartGoodsGroup.cartGoodsList, cartGoodsGroup.summary)

                    // TODO check: (위 state오류 때문에) refresh강제 추가. (제거하면 오류발생)
                    // this.setState({cartGoodsGroupList:[]})
                    this.setState({totCount: this.state.totCount -1, checkedCount: this.state.checkedCount -1, cartGoodsGroupList:[]})

                }else { //기존 delete 상품전체
                    await deleteCart(state.goodsNo)

                    // const isLastProducerGoods = this.checkLastProducerGoods(cartGoodsGroupList, state.producerNo, state.groupKey, state.goodsNo)
                    // //해당 생산자의 상품이 없다면 생산자 삭제
                    // if(isLastProducerGoods){
                    //     const index = cartGoodsGroupList.findIndex(cartGoodsGroup => cartGoodsGroup.producerNo  == state.producerNo)
                    //     cartGoodsGroupList.splice(index, 1)
                    // }
                    //else{
                        // cartGoodsGroup.cartGoodsList = remainedCartGoodsList
                        // //합계 갱신
                        // cartGoodsGroup.summary = this.getSummary(cartGoodsGroup.cartGoodsList, producer)
                        // console.log("cartGoodsGroup.summary", cartGoodsGroup.summary)
                    //}

                    // 흰 화면 에러 헤결하려고 list clear 추가
                    this.setState({cartGoodsGroupList:[]})

                    //무조건 전체호출 방식으로 변경. 2022.05.16
                    this.searchCartGoodsGroupList()

                    //this.setState({totCount: this.state.totCount -1, checkedCount: this.state.checkedCount -1, cartGoodsGroupList:[]})
                }
                this.setState({refreshCartCountDate: new Date()})
                break
        }

        this.setState({cartGoodsGroupList})
    }

    //생산자의 마지막 상품인지 체크. (삭제 후 생산자 안보이는 용도)
    // checkLastProducerGoods = (cartGoodsGroupList, producerNo, groupKey, goodsNo) => {
    //     const cartGoodsGroup1 = cartGoodsGroupList.find(g => g.producerNo === producerNo)
    //     const cartGoodsGroup2 = cartGoodsGroupList.find(g => g.groupKey === groupKey )
    //
    //     if (cartGoodsGroup1.length == 1 && cartGoodsGroup2.length ==1) { //두가지가 동일하면서 마지막 상품인 경우.
    //         return true
    //     }
    //     return false
    // }


    onExpiredCartGoodsItemChange = async ({type, state}) => {
        if(type === "DELETE"){
            const { goodsNo } = state

            //db 삭제
            await deleteCart(goodsNo)

            //db 조회
            this.searchCartGoodsGroupList()

            this.setState({refreshCartCountDate: new Date()})
        }
    }

    requestDeleteConfirm = () => {
        return window.confirm('선택한 상품을 삭제 하시겠습니까?')
    }

    // getCheckedItems = () => {
    //     return this.state.validCartList.filter(cart => cart.checked)
    // }


    checkValidation = () => {

        console.log(this.state.cartGoodsGroupList)
        const cartGoodsGroupList = this.state.cartGoodsGroupList

        let superRewardGoods = []

        cartGoodsGroupList.map(({cartGoodsList}) => {
            const ary = cartGoodsList.filter(cartGoods => cartGoods.superReward && cartGoods.inSuperRewardPeriod
                && cartGoods.options[0].orderCnt > 1)//cartGoods.qty > 1)
            superRewardGoods = superRewardGoods.concat(ary)
        })

        if (superRewardGoods.length > 0) {
            alert(`[${superRewardGoods[0].goodsNm}] 슈퍼리워드 상품은 하나만 구입 가능합니다`);

            return false
        }

        return true

    }

    onPayClick = async () => {

        if (!this.checkValidation()) {
            return
        }

        const {data:loginUserType} = await getLoginUserType();

        // 상품상세에서 구매버튼 클릭시 체크하도록 이동.
        if (loginUserType === 'consumer') { //미 로그인 시 로그인 창으로 이동.


            /** START [buyingInfo localStorage를 CartBuy아니고 여기서 만들경우. => 바로 OptionBuy로 이동가능.
             */
            const buyingInfo = {
                buyingType: 'normal', //선물여부 (normal, gift)
                isCart: true,         //카트여부 전달.
                //미사용. goodsInfo: {
                //     // 11: [{optionIndex: 0, orderCnt: 1}, {optionIndex: 1, orderCnt: 1}],
                //     // 12: [{optionIndex: 1, orderCnt: 1}]  //cart에서 사용.
                // }
                optionGoodsInfo:[]
                //구조: optionGoodsInfo = [
                //     [ //CartList용
                //         {goodsNo: 531, options: [ {…}, {…} ]},
                //         {goodsNo: 532, options: [ {…}, {…} ]},
                //     ],
                //     [ //FooterBuutonGroup에선 아래 하나만 사용.
                //         {goodsNo: 667, options: [ {…}, {…} ]},
                //     ]
                // ]
            }
            //goodsInfo 여려개 세팅
            //미사용 let goodsInfo = {};

            this.state.cartGoodsGroupList.map((cartGoodsGroup) => {
                let oneOptionGoodsInfoGroup = []
                cartGoodsGroup.cartGoodsList.filter(cartGoods => cartGoods.checked === true)
                    .map(cartGoods => {
                        //미사용 goodsInfo[cartGoods.goodsNo] =  cartGoods.options;//options; goodsInfo 1개씩 추가
                        //묶음배송은 push안에 2개이상 goods필요.
                        oneOptionGoodsInfoGroup.push({goodsNo:cartGoods.goodsNo, options:cartGoods.options})
                    })

                if (oneOptionGoodsInfoGroup.length > 0) {
                    buyingInfo.optionGoodsInfo.push(oneOptionGoodsInfoGroup)
                }
            })
            //미사용 buyingInfo.goodsInfo = goodsInfo

            console.log('CartList - for OptionBuy: byuingInfo', buyingInfo)

            localStorage.setItem("optionGoodsBuyingInfo", JSON.stringify(buyingInfo))

            /** END [buyingInfo localStorage를 CartBuy아니고 여기서 만들경우. => 바로 OptionBuy로 이동가능.
             */

            Webview.openPopup('/optionGoods/buy', true);

        }
        else {
            Webview.openPopup('/login',  false); //로그인으로 이동팝업
        }
    }

    //react-toastify
    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
            //className: ''     //클래스를 넣어도 됩니다
        })
    }

    onLoginClick = () => {
        Webview.openPopup('/login')
    }


    getTotPriceInfo = () => {
        let totGoodsPrice = 0,
            totDeliveryFee = 0;
        //totReservationDeliveryFee = 0;

        this.state.cartGoodsGroupList.map(cartGoodsGroup => {
            const { sumGoodsPrice, sumDeliveryFee } = cartGoodsGroup.summary
            totGoodsPrice += sumGoodsPrice
            totDeliveryFee += sumDeliveryFee
            //totReservationDeliveryFee += sumReservationDeliveryFee
        })

        return {
            totGoodsPrice,
            totDeliveryFee,
            //totReservationDeliveryFee
        }
    }


    refresh = async () => {
        //로그인 성공 이후 재 조회 (리프레시는 웹 일 경우만 탐. 앱에서는 새창이 열리고 현재 페이지가 새로 didMount 되기 때문에 여기를 타지 않는다)
        await this.searchCartGoodsGroupList()
        this.setState({loginUserType: 'consumer'})
    }

    render(){
        if(this.state.isLoading) return <BlocerySpinner />
        if(this.state.loginUserType !== 'consumer') return (
            <LoginForm refresh={this.refresh}/>
        )

        // const checkedItems = this.getCheckedItems()
        const { totCount, checkedCount } = this.state

        //전체 계산금액
        const { totGoodsPrice, totDeliveryFee } = this.getTotPriceInfo()

        return(
            <Fragment>
                {/*<ShopXButtonNav underline historyBack>장바구니</ShopXButtonNav>*/}
                <BackNavigation showShopRightIcons>장바구니</BackNavigation>
                <RefreshCartCountDummy refreshDate={this.state.refreshCartCountDate} />
                <BodyFullHeight nav>
                    {/* 장바구니에 담긴 내역 없을때 */}
                    {
                        this.state.cartGoodsGroupList.length <= 0 &&(
                            <EmptyBox>장바구니에 담긴 상품이 없습니다.</EmptyBox>
                        )
                    }
                    {
                        this.state.cartGoodsGroupList.length > 0 && (
                            <Div

                                bg={'background'}
                                relative
                                top={0}
                                right={0}
                                bottom={0}
                                left={0}
                            >
                                {/* 선택 */}
                                <Sticky zIndex={1} top={0} >
                                    <CartHeader onChange={this.onCartHeadChange} checkedCount={checkedCount} totCount={totCount}/>
                                </Sticky>
                                {/*<div className={Css.sticky}>*/}
                                {/*    <CartHeader onChange={this.onCartHeadChange} checkedCount={checkedCount} totCount={totCount}/>*/}
                                {/*</div>*/}
                                {/* 생산자별 리스트 */}

                                {
                                    this.state.cartGoodsGroupList.map((cartGoodsGroup, index) =>{
                                        const { producer, cartGoodsList, summary } = cartGoodsGroup
                                        const producerWrapDelivered = (cartGoodsList.length>0)?cartGoodsList[0].producerWrapDelivered:false

                                        return(
                                            <Div key={'groupByProducer'+index}
                                                // px={16}
                                                // mb={5}
                                                 bg={'white'}
                                                 custom={`border-bottom: 1px solid ${color.light};`}
                                            >
                                                {cartGoodsGroup.firstGroup && //생산자별 헤더표시 : 생산자별 첫그룹일때만.
                                                <>
                                                    {index !== 0 && <ShopBlyLayouts.HrStrong noBorder/>}
                                                    <>
                                                        {/*<Flex bg={'white'}*/}
                                                        {/*     custom={`border-bottom: 1px solid ${color.light};`}*/}
                                                        {/*>*/}

                                                        {/*<ProfileAuto consumerNo={900000000 + producer.producerNo}/>*/}
                                                        <Link to={`/consumersDetailActivity?consumerNo=${900000000 + producer.producerNo}`}
                                                              bg={'white'}
                                                              display={'flex'}
                                                              custom={`border-bottom: 1px solid ${color.light};`}
                                                              doActive
                                                        >
                                                            <Div
                                                                px={16}
                                                                minHeight={52}
                                                                fontSize={18}
                                                                lineHeight={52}
                                                                onClick={() => this.props.history.push()}
                                                            ><b>{producer.farmName}</b></Div>
                                                            <Flex ml={'auto'} width={52} height={52} justifyContent={'center'}>
                                                                <IoIosArrowForward size={20}/>
                                                            </Flex>
                                                        </Link>
                                                        {/*</Flex>*/}
                                                    </>
                                                </>
                                                }
                                                <Div px={16}>
                                                    <CartGroup
                                                        history={this.props.history}
                                                        producer={producer}                 // 생산자 정보
                                                        cartList={cartGoodsList}      // cart에 담긴 상품 정보
                                                        summary={summary}
                                                        onChange={this.onCartItemChange}
                                                        producerWrapDelivered = {producerWrapDelivered}
                                                    />
                                                </Div>
                                            </Div>
                                        )
                                    })
                                }

                                <ShopBlyLayouts.HrStrong noBorder />
                                <CartSummary
                                    totGoodsPrice={totGoodsPrice}
                                    totDeliveryFee={totDeliveryFee}
                                    //totReservationDeliveryFee={totReservationDeliveryFee}
                                    // onClick={this.onPayClick}
                                />

                                <Button className={'p-3 font-weight-bold rounded-0 mb-2'}
                                        block
                                        size={'lg'}
                                        disabled={checkedCount <= 0 ? true : false}
                                        color='info'
                                        onClick={this.onPayClick}
                                >주문하기 ({ComUtil.addCommas(checkedCount)}개)</Button>


                            </Div>
                        )
                    }

                    {
                        this.state.expiredGoodsList.map((cartGoods, index) =>
                            <div className={Css.wrap}>
                                <InvalidCartItem
                                    history={this.props.history}
                                    key={'cartItem'+index}
                                    {...cartGoods}
                                    //미사용 qty={cartGoods.qty}
                                    checked={cartGoods.checked}
                                    deliveryFee={cartGoods.deliveryFee}
                                    goodsPrice={cartGoods.goodsPrice}
                                    onChange={this.onExpiredCartGoodsItemChange}/>
                            </div>
                        )
                    }
                    {/*{WIDERPLANET SCRIPT START 2022.06.07}*/}
                    {
                        this.state.cartGoodsList.length > 0 &&
                        <TG ty={"Cart"} items={this.state.cartGoodsList} />
                    }
                    {/*{WIDERPLANET SCRIPT END 2022.06.07}*/}
                </BodyFullHeight>
            </Fragment>
        )

    }
}

export default CartList



//장바구니 카운트 새로고침용 더미(장바구니 리스트가 class 라서 hook 을 사요하기 위함)
function RefreshCartCountDummy({refreshDate}) {
    // const {setPrivateCartCount} = useNotice()
    const {setPrivateCartCount} = useCartCount()
    useEffect(() => {
        if (refreshDate) {
            //장바구니 카운트 새로고침
            setTimeout(() => {
                setPrivateCartCount()
            }, 500)
        }
    }, [refreshDate])
    return null
}