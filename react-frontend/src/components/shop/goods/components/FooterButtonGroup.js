import React, {createContext, useContext, useEffect, useState} from 'react';
import {
    Button,
    Div,
    Fixed,
    Flex,
    GridColumns,
    Hr,
    Img, JustListSpace,
    ListBorder, ListSpace,
    Right,
    Space,
    Span
} from "~/styledComponents/shared";
import {Server} from "~/components/Properties";
import {color} from "~/styledComponents/Properties";
import useLogin from "~/hooks/useLogin";
import {Webview} from "~/lib/webviewApi";
import {IoIosArrowDown} from "react-icons/io";

import {AiFillCloseSquare} from "react-icons/ai";
import {QtyInputGroup} from "~/components/common";
import ComUtil from "~/util/ComUtil";
import {AiOutlineGift} from 'react-icons/ai'
import ZzimButton from "~/components/common/buttons/ZzimButton";
import styled, {keyframes} from 'styled-components'
import {Icon} from '~/components/common/icons'
import moment from "moment-timezone";
import {checkOptionGoodsBatchFinished, checkOptionGoodsStarted, FRONT_OptionGoodsStarted} from "~/lib/goodsApi";
import {addCart} from "~/lib/cartApi";
import {toast} from "react-toastify";
import {useRecoilState, useSetRecoilState} from "recoil";
import {cartCountrState, optionAlertState, selectedOptionsState} from "~/recoilState";
import {FiShoppingCart} from "react-icons/fi";
import {addGoodsMeta2Options} from "~/util/bzLogic";
import {getValue} from "~/styledComponents/Util";
import {DisabledBadge, PotenTimeBadge, SuperRewardBadge} from "~/styledComponents/mixedIn/Badges";
import useInterval from "~/hooks/useInterval";
import {useHistory} from 'react-router-dom'
import useNotice from "~/hooks/useNotice";
import {OptionAlert} from "~/components/common/optionAlert";
import useCartCount from "~/hooks/useCartCount";

export const FooterContext = createContext()

const Css_footer = styled(Div)`
  position: absolute;
  top: ${getValue(-20)};

  left: 50%;
  transform: translate(-50%, 0);
  cursor: pointer;
  width: ${getValue(80)};
  height: ${getValue(20)};
`

const Css_arrowIcon = styled(Icon)`
  position: absolute;
  top: 47%;
  left: 50%;
  transform: translate(-50%);
`


function FooterButtonGroup({goods, isOptionModalOpen = false}) {

    const [selectedOptions, setSelectedOptions] = useRecoilState(selectedOptionsState)
    const [alerts, setAlerts] = useRecoilState(optionAlertState)

    // const {setBuyingType, optionModalToggle} = useContext(DealGoodsDetailContext)
    const [optionModalOpen, setOptionModalOpen] = useState(isOptionModalOpen)
    const [buyingType, setBuyingType] = useState('normal') //normal / gift

    // const [selectedOptions, setSelectedOptions] = useState([]) //내가 선택한 옵션

    //2022.05 eventFlag적용된 footerOptions 사용금지 const options = goods.footerOptions.filter(option => !option.deleted)
    // const options = (goods.inSuperRewardPeriod || goods.inTimeSalePeriod) ? goods.options.filter(option => option.eventFlag && !option.deleted)                //이벤트 중
    //                                                                       : goods.options.filter(option => !option.deleted) //기존코드
    // const options = goods.options.filter(option => !option.deleted) //기존코드
    //
    // //옵션 정렬
    // ComUtil.sortNumber(options, 'sortNum')

    const options = goods.options

    useEffect(() => {
        setOptionModalOpen(isOptionModalOpen)
    }, [isOptionModalOpen])

    //화면을 벗어나면 옵션 클리어
    useEffect(() => {
        return(() => {
            setSelectedOptions([])
            setAlerts([])
        })
    }, [])

    useEffect(() => {

        console.log("FooterButtonGroup useEffect")

        //옵션이 하나밖에 없을경우 처음부터 옵션이 선택 되어있도록 한다(잔여수량이 있다면)
        // const options = goods.options.filter(option => !option.deleted)
        if (options.length === 1 && options[0].remainedCnt > 0) {
            options[0].orderCnt = 1; //2022.05 eventFlag추가하면서 기본값 1추가 필요.
            setSelectedOptions([options[0]])
        }
        //이벤트 기간일 때 자동으로 옵션이 선택되어 있게(잔여수량이 있다면)
        else if (goods.inSuperRewardPeriod || goods.inTimeSalePeriod) {
            const eventOption = options.find(option => option.eventFlag)
            if (eventOption && eventOption.remainedCnt > 0) {
                eventOption.orderCnt = 1;
                setSelectedOptions([eventOption])
            }
        }

    }, [goods])

    const optionModalToggle = () => {
        setOptionModalOpen(!optionModalOpen)
    }

    const addOption = (index) => {

        //이미 등록되어있는지 검사
        let optionIndex = selectedOptions.findIndex(option => option.optionIndex === index)

        //등록된 옵션이 없을 경우(맨앞에) 추가
        if (optionIndex === -1) {
            const option = goods.options.find(option => option.optionIndex === index)
            if (option) {
                const newOption = {...option}
                const newSelectedOptions = Object.assign([], selectedOptions)
                newSelectedOptions.unshift(newOption)
                setSelectedOptions(newSelectedOptions)
            }
        }
    }

    const removeOption = (optionIndex) => {
        const options = selectedOptions.filter(option => option.optionIndex !== optionIndex)
        setSelectedOptions(options)
    }

    return(
        <FooterContext.Provider value={{goods, options, optionModalToggle, optionModalOpen, setOptionModalOpen, buyingType, setBuyingType, selectedOptions, setSelectedOptions, addOption, removeOption}}>
            <ButtonGroup />
            <OptionModal />
        </FooterContext.Provider>
    )
}
export default FooterButtonGroup


function hasRemainedCnt(goods) {
    if(goods.dealGoods && goods.dealCount >= goods.dealMaxCount){
        return 0;
    }

    if (moment().isAfter(moment(goods.saleEnd, 'YYYYMMDD').endOf('day'))) {
        return 0;
    }

    let remainedCnt = 0;

    const footerOptions = (goods.inSuperRewardPeriod || goods.inTimeSalePeriod) ? goods.options.filter(option => option.eventFlag && !option.deleted)                //이벤트 중
        : goods.options.filter(option => !option.deleted) //기존코드

    //goods.footerOptions.map(option =>
    footerOptions.map(option =>
        remainedCnt += option.remainedCnt
    )
    return remainedCnt
}

const ButtonGroupLayout = styled.div`
    display: flex;
    // grid-template-columns: 48px 48px auto;
    cursor: pointer;
    height: ${getValue(55)};
    border-top: 1px solid ${color.light};
    & > * {
        // border-right: 1px solid ${color.light};
    }    
`

const isFinished = (goods) => {

    if(goods.saleStopped) {
        return true
    } else if (goods.salePaused){
        return true
    }

    if (!goods.dealGoods) return false;

    const now = ComUtil.utcToString(moment(), 'YYYYMMDD');
    if(goods.dealEndDate < Number(now)) {
        return true
    }

    return false
}

//
// const fadeInOut = keyframes`
//   0% {opacity: 0;    }
//   25% {top: -70px; opacity: .8; background: ${color.danger};}
//   40% {top: -40px; opacity: 1; background: ${color.danger};}
//   80% {top: -40px; opacity: 1; transform: scale(1); background: ${color.danger};}
//   100% {top: -13px; opacity: 0; transform: scale(0.4);}
// `
//
// const RoundedPlus = styled.div`
//     position: absolute;
//     top: ${getValue(-25)};
//     right: ${getValue(16)};
//     z-index: 9999;
//     width: ${getValue(50)};
//     height: ${getValue(50)};
//     background: ${color.green};
//     border-radius: 50%;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     color: white;
//     border: 1px solid white;
//     transform-origin: bottom center;
//     animation: ${fadeInOut} 1.5s forwards ease alternate;
//
// `
//
//
// //옵션 추가시 +1 애니메이션 되는 객체
// export function OptionAlert() {
//     const [delay, setDelay] = useState(1500) //animation delay 와 맞추면 됨 1.5s
//
//     useInterval(() => {
//         setDelay(null)
//     }, delay)
//
//     //애니메이션 끝난 후 Element 제거
//     if (!delay) return null
//
//     return(
//         <RoundedPlus>+1</RoundedPlus>
//     )
// }


//구매하기 선물하기 버튼 그룹
function ButtonGroup() {
    const [alerts, setAlerts] = useRecoilState(optionAlertState)

    const {setBuyingType, optionModalToggle, goods} = useContext(FooterContext)

    const onHandleClick = async (type) => {
        //타입 변경
        setBuyingType(type)

        //모달 열기 (모달을 사용 하지 않도록 변경)
        optionModalToggle()
    }

    //기간지났으면 종료표시
    // if (isFinishedDate(goods.dealEndDate)) {
    //     return (
    //         <Fixed bottom={0} width={'100%'} bg={'white'} zIndex={3}>
    //             <Button rounded={2} height={48} block bold disabled>판매종료</Button>
    //         </Fixed>
    //     )
    // }
    //
    // //재고가 없으면 품절 표시
    // if (hasRemainedCnt(goods) <= 0) {
    //     return (
    //         <Fixed bottom={0} width={'100%'} bg={'white'} zIndex={3}>
    //             <Button rounded={2} height={48} block bold disabled>품절</Button>
    //         </Fixed>
    //     )
    // }

    return (
        <Fixed bottom={0} width={'100%'} zIndex={3}>
            {/*{*/}
            {/*    alerts.map(time => <OptionAlert key={time} >옵션을 추가 했어요!</OptionAlert>)*/}
            {/*}*/}

            <ButtonGroupLayout>
                <ZzimButton width={55} height={'100%'} flexShrink={0} bg={'white'}  goodsNo={goods.goodsNo} />
                {/*<div>*/}
                {/*    <ZzimButton goodsNo={goods.goodsNo} />*/}
                {/*</div>*/}
                <Div flexGrow={1}>
                    {
                        isFinished(goods) ?
                            <Button rounded={0} height={'100%'} block bold disabled>판매종료</Button> :
                            hasRemainedCnt(goods) <= 0 ?
                                <Button rounded={0} height={'100%'} block bold disabled>품절</Button> :
                                <BuyButton onClick={onHandleClick.bind(this, 'normal')} >구매하기</BuyButton>

                    }
                    {/*<BuyButton onClick={onHandleClick.bind(this, 'normal')} >구매하기</BuyButton>*/}
                </Div>
            </ButtonGroupLayout>
        </Fixed>
    )


    // return(
    //     <Fixed bottom={0} width={'100%'} zIndex={3}>
    //         <Flex p={8} height={65}>
    //             <Div flexShrink={0}>
    //                 <Flex height={'100%'} width={48} bg={'white'}>
    //                     <ZzimButton goodsNo={goods.goodsNo} />
    //                 </Flex>
    //             </Div>
    //             <GridColumns p={8} repeat={2} bg={'veryLight'} colGap={4}
    //                          custom={`border-top: 1px solid ${color.light};`}
    //             >
    //                 <BuyButton onClick={onHandleClick.bind(this, 'normal')} >구매하기</BuyButton>
    //                 <GiftButton onClick={onHandleClick.bind(this, 'gift')} >선물하기</GiftButton>
    //             </GridColumns>
    //         </Flex>
    //     </Fixed>
    // )
}

function BuyButton({onClick, children}) {
    return(
        <Button fontSize={17} rounded={0} bg={'green'} fg={'white'} height={'100%'} block bold onClick={onClick}>{children}</Button>
    )
}
function GiftButton({onClick, children}) {
    return(
        <Button fontSize={17} rounded={0} bg={'green'} fg={'white'} height={'100%'} block bold onClick={onClick}>
            <Space justifyContent={'center'} spaceGap={4}>
                <AiOutlineGift size={20}/>
                <span>{children}</span>
            </Space>
        </Button>
    )
}

//옵션모달
function OptionModal() {
    const {goods,
        options,
        // buyingType,
        optionModalOpen, optionModalToggle, addOption, removeOption} = useContext(FooterContext)
    const {isLoggedIn, isServerLoggedIn, openLoginModal} = useLogin()

    const [showOptions, setShowOptions] = useState(false)
    const history = useHistory()

    const toggle = () => {
        setShowOptions(pre => !pre)
    }

    //recoil cart counter
    const [count, setCounter] = useRecoilState(cartCountrState)

    const onBuyClick = async (buyingType, multiGift) => {

        if (await isServerLoggedIn()) {
            if (selectedOptions.length <= 0) {
                alert('옵션을 선택해 주세요')
                return
            }


            if (goods.dealGoods) {  //쑥쑥

                const dealStartDate = ComUtil.longToDateMoment(goods.dealStartDate)
                if (moment().isBefore(dealStartDate)) {
                    alert('아직 딜 기간이 아닙니다.')
                    return
                }
            }
            else{ //일반상품
                // 일반상품을 옵션상품으로 변경중일 때 에러메시지 노출
                const {data: response} = await checkOptionGoodsBatchFinished()

                if (response.resCode) {
                    alert(response.errMsg);
                    return false;
                }

                //즉시상품 유효성체크
                if (!(await directOptionGoodsValidationCheck())) {
                    return false;
                }
            }



            const buyingInfo = {
                buyingType: buyingType, //선물여부 (normal, gift)
                isCart: false,
                //미사용 goodsInfo: {
                //     // 11: [{optionIndex: 0, orderCnt: 1}, {optionIndex: 1, orderCnt: 1}],
                //     // 12: [{optionIndex: 1, orderCnt: 1}]  //cart에서 사용.
                // },
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

            const options = selectedOptions.map(option => {
                return {
                    //...option, //todo optionImages 추가하고 싶으면 여기서 해도 되긴 함.
                    optionIndex: option.optionIndex,
                    orderCnt: option.orderCnt
                }
            })

            //goodsInfo구조:buyingInfo.goodsInfo[goods.goodsNo] = addGoodsMeta2Options(options, goods) //options에 메타정보 추가.
            let oneOptionGoodsInfo = addGoodsMeta2Options(options, goods)
            buyingInfo.optionGoodsInfo.push([oneOptionGoodsInfo])

            console.log('구매하기 - for OptionBuy: byuingInfo', JSON.stringify(buyingInfo))

            //배치가 돌고 난 이후라면 일반 상품은 무조건 true
            if (!goods.dealGoods) { //즉시 옵션상품 추가(2022.03)
                //localStorage에 기록
                localStorage.setItem("optionGoodsBuyingInfo", JSON.stringify(buyingInfo))

                //console.log('MULTIGIFT CHECK:', buyingType,multiGift, options.length )
                if (buyingType === 'gift' && multiGift && goods.options.filter(option => !option.deleted).length > 1) {
                    alert('멀티선물하기는 옵션이 1개인 상품에 대해서만 지원됩니다. ')
                    return false
                }

                //TODO directBuy => optionBuy.js로 변경.
                //DirectBuy.js 또는 multiGiftBuy.js로 분기.
                const moveUrl = multiGift ? `multiGiftBuy?goodsNo=${goods.goodsNo}&qty=${options[0].orderCnt}&optionIndex=${options[0].optionIndex}` : '/optionGoods/buy'

                if (!ComUtil.isMobileApp()){
                    history.push(moveUrl)
                    return
                }else{
                    Webview.openPopup(moveUrl, true)
                }
            }else { //if (goods.dealGoods) { //dealGoods
                //세션에 기록
                localStorage.setItem("dealGoodsBuyingInfo", JSON.stringify(buyingInfo))
                Webview.openPopup(`/dealGoods/buy`, true)
            } //else {
                //alert('상품오류입니다. 옵션상품만 구매가 가능합니다.')
            //}
        }
    }

    // const {setPrivateCartCount} = useNotice()
    const {setPrivateCartCount} = useCartCount()

    //장바구니 담기
    const onAddCartClick = async () => {

        if (!(await directOptionGoodsValidationCheck())) {
            return
        }

        const params = {
            goodsNo: goods.goodsNo,
            //qty: orderQty,       //OLD  cart->optionCart로 전체 변경
            options: selectedOptions.map(option => {
                return {
                    optionIndex: option.optionIndex,
                    orderCnt: option.orderCnt
                }
            }),

            producerNo: goods.producerNo,
            checked: true
        }

        const res = await addCart(params)

        // console.log({res})

        //로그인 X
        if (!ComUtil.getIsLoginStatus(res.data)) {
            openLoginModal()
            return
        }

        //장바구니 개수 새로 고침
        setPrivateCartCount()

        //리코일 변수 세팅
        // setCounter(count + 1)


        if (window.confirm('장바구니에 담았습니다. 장바구니로 이동 하시겠습니까?')) {
            history.push('/cartList')
        }

        // toast.success('장바구니에 담았습니다', {
        //     position: toast.POSITION.TOP_CENTER,
        //     autoClose: 2000
        // })
    }

    //
    // // 선물하기(여러명)
    // const onGiftMultiClick = async () => {
    //     if (!(await validatioinCheck())) {
    //         return
    //     }
    //     props.onClick({
    //         qty: orderQty,
    //         multiGift: true
    //     })
    // }

    const directOptionGoodsValidationCheck = async () => {

        if (selectedOptions.length <= 0) {
            alert('옵션을 선택해 주세요')
            return
        }

        if (goods.superReward && goods.inSuperRewardPeriod ) { //&& superRewardBuyQty > 1) {

            // if (options.length > 1) {
            //     alert('슈퍼리워드 상품 옵션설정 오류입니다') //슈퍼리워드는 옵션 1개일때만 진행. 2022.03.15
            //     return false
            // }
            //eventFlag 체크 2022.05
            //if (options.filter( option => option.eventFlag).count() !== 1 ) {
            if (selectedOptions.length !== 1 || selectedOptions[0].eventFlag !== true) {
                alert('슈퍼리워드 이벤트상품 새로고침 오류입니다. 처음부터 다시 시도해 주세요') //eventFlag이 있는 Option으로 슈퍼리워드 진행.
                return false
            }

            let superRewardBuyQty =  selectedOptions[0].orderCnt;
            if (superRewardBuyQty > 1) {
                alert('슈퍼리워드 상품은 하나만 구입 가능합니다')
                return false
            }
        }

        //eventFlag 체크 2022.05
        if (goods.timeSale && goods.inTimeSalePeriod) {
            if (selectedOptions.length !== 1 || selectedOptions[0].eventFlag !== true) {
                alert('포텐타임 이벤트상품 새로고침 오류입니다. 처음부터 다시 시도해 주세요') //eventFlag이 있는 Option으로 슈퍼리워드 진행.
                return false
            }
        }

        let vChk = 0;
        //포텐타임 기간을 앞둔 상품인지 - 사전에 한번 더 체크.
        if (goods.timeSaleStart && moment().isBefore(goods.timeSaleStart)){
            vChk = vChk + 1;
        }

        //슈퍼리워드 기간을 앞둔 상품인지 - 사전에 한번 더 체크.
        if (goods.superRewardStart && moment().isBefore(goods.superRewardStart)){
            vChk = vChk + 1;
        }

        if (vChk === 2){
            if (!window.confirm('포텐타임 및 슈퍼리워드 상품 시간을 꼭 확인해 주세요. 계속 하시겠습니까?')) return false;
        }else if (vChk === 1){
            if (goods.timeSaleStart && moment().isBefore(goods.timeSaleStart)) {
                if (!window.confirm('해당 상품은 포텐타임 시작 전입니다. 포텐타임 혜택 없이 바로 구매하시겠습니까?')) return false;
            }
            if (goods.superRewardStart && moment().isBefore(goods.superRewardStart)){

                if(selectedOptions.filter(op => op.eventFlag).length > 0) {
                    if (!window.confirm('해당 상품은 슈퍼리워드 시작 전입니다. 슈퍼리워드 혜택 없이 바로 구매하시겠습니까?')) return false;
                }
            }
        }

        return true

    }


    // const removeOption = (optionName) => {
    //     const options = selectedOptions.filter(option => option.optionName !== optionName)
    //     setSelectedOptions(options)
    // }

    //총 금액 계산
    const getTotalOrderPrice = () => {
        let totalOrderPrice = 0
        selectedOptions.map(option =>
            totalOrderPrice += option.optionPrice * option.orderCnt
        )
        return totalOrderPrice
    }

    const [selectedOptions, setSelectedOptions] = useRecoilState(selectedOptionsState)
    const setterOptions = useSetRecoilState(selectedOptionsState)


    const onOrderCntChange = ({value,idx}) => {
        // const options = Object.assign([], selectedOptions)
        // const option = options.find(option => option.optionName === optionName)

        //deep copy : recoil 에서 객체는 readOnly 라서 에러발생 (Object.assign 으로는 해결되지 않음)
        const options = selectedOptions.map(option => ({...option}))
        const option = options[idx]

        if (value > option.remainedCnt) {
            alert(`재고수량이 ${ComUtil.addCommas(option.remainedCnt)}개 존재 합니다. 재고수량 이하로 수량을 입력해주세요`)
            return
        }
        option.orderCnt = value
        setSelectedOptions(options)
        setTimeout(() => console.log(options), 500)
    }



    if (!goods) return null
    return(
        <Fixed
            width={'100%'}
               zIndex={4}
            // height={400}
            // bottom={optionModalOpen ? 0 : -400}
            //  minHeight={200}
               bottom={optionModalOpen ? 0 : '-100%'}
               custom={`transition: all 0.5s ease;`}>


            <Div absolute left={'50%'} xCenter top={0} height={20} display={optionModalOpen ? 'block' : 'none'}>
                {/*<button onClick={optionModalToggle}>닫기</button>*/}

                <Css_footer onClick={optionModalToggle} >
                    <Icon name={'handle'} style={{width: '100%', height: '100%'}}/>
                    <Css_arrowIcon name={'arrowDownGray'}/>
                </Css_footer>
            </Div>


            {/** 최신 버전 : 옵션 선택 시 높이 버그 수정 **/}
            <JustListSpace space={8} p={8} custom={`background: ${color.veryLight}`}>
                {
                    //옵션을 선택해 주세요
                    options.length > 1 && (
                        <Flex bc={'green'} bg={'white'} p={8} fg={'green'} cursor={1} rounded={2} onClick={toggle}>
                            <div>옵션을 선택해 주세요</div>
                            <Right><IoIosArrowDown size={20}/></Right>
                        </Flex>
                    )
                }


                <GridColumns repeat={1} rowGap={8} maxHeight={250} overflow={'auto'}>
                    {
                        //옵션 리스트
                        selectedOptions.map(({optionImages, optionIndex, optionName, optionPrice, orderCnt}, index ) => {
                                return(
                                    <Div relative key={`selectedOption${index}`} p={10} bc={'secondary'} bg={'white'}>
                                        {
                                            options.length > 1 && (
                                                <Div absolute top={0} right={0} mt={10} mr={10} cursor={1}>
                                                    <AiFillCloseSquare size={25} color={color.secondary} onClick={removeOption.bind(this, optionIndex)} />
                                                </Div>
                                            )
                                        }

                                        <Div mb={4} pr={24} fontSize={12}>{optionName}</Div>
                                        <Flex>
                                            <Img
                                                src={ComUtil.getFirstImageSrc(optionImages, 'thumb')}
                                                width={42}
                                                height={42}
                                                cover
                                                mr={8}
                                                rounded={2}
                                            />

                                            <Div width={150}>
                                                <QtyInputGroup idx={index} value={orderCnt} onChange={onOrderCntChange} />
                                            </Div>
                                            <Right>
                                                <Span fontSize={17}><b>{ComUtil.addCommas(optionPrice)}</b></Span>원
                                            </Right>
                                        </Flex>
                                    </Div>
                                )
                            }
                        )
                    }
                </GridColumns>

                {/* 버튼 */}
                <Div width={'100%'} p={8}>
                    <Flex justifyContent={'space-between'} fg={'dark'} fontSize={13} px={8}>
                        <Div>{selectedOptions.length}개 선택됨</Div>
                        <div>
                            <span>총 금액 </span>
                            <Span fontSize={20} fg={'green'} bold>{ComUtil.addCommas(getTotalOrderPrice())}</Span>
                            <span> 원</span>
                        </div>
                    </Flex>

                    {(goods.dealGoods) ?
                        <GridColumns repeat={2} mt={16} colGap={8} height={55}>
                            <GiftButton onClick={onBuyClick.bind(this, 'gift')}>선물하기</GiftButton>
                            <BuyButton onClick={onBuyClick.bind(this, 'normal')}>구매하기</BuyButton>
                        </GridColumns>
                        : //즉시 옵션상품./////////////
                        <GridColumns mt={16} >
                            <Space spaceGap={8} height={55}>
                                <Flex justifyContent={'center'} bold bg={'green'} fg={'white'} width={'45%'}  height={'100%'} //width={55} bg={'white'} bc={'light'}
                                      cursor={1} doActive onClick={onAddCartClick}>
                                    {/*<FiShoppingCart size={25}/>*/}
                                    장바구니 담기
                                </Flex>
                                {/*<Flex justifyContent={'center'} width={55} bg={'white'} bc={'light'} height={'100%'}*/}
                                {/*      cursor={1} doActive onClick={onBuyClick.bind(this, 'gift', false)}>*/}
                                {/*    <AiOutlineGift size={25}/>*/}
                                {/*</Flex>*/}
                                {   //multi gift
                                    ComUtil.isPcWeb() && ComUtil.isMultiGifts() && (
                                        <Flex justifyContent={'center'} width={70} bg={'white'} bc={'light'}
                                              height={'100%'} cursor={1} doActive onClick={onBuyClick.bind(this, 'gift', true)}>
                                            <AiOutlineGift size={25}/>✕ n
                                        </Flex>
                                    )
                                }
                                <Flex flexGrow={1} witdh={'50%'} justifyContent={'center'} bg={'green'} fg={'white'} height={'100%'}
                                      bold fontSize={17} cursor={1} doActive onClick={onBuyClick.bind(this, 'normal', false)}>
                                    구매하기
                                </Flex>

                            </Space>
                        </GridColumns>
                    }
                </Div>
            </JustListSpace>



            {/** 이전 버전 **/}
            {/*<Flex flexDirection={'column'} justifyContent={'space-between'} bg={'veryLight'} height={'100%'} >*/}
            {/*    <Div p={8} width={'100%'}*/}
            {/*        // overflow={'auto'}*/}
            {/*        // 스크롤 될 세로*/}
            {/*        //  maxHeight={280}*/}
            {/*    >*/}
            {/*        <Div*/}
            {/*            overflow={'auto'}*/}
            {/*            // 스크롤 될 세로*/}
            {/*            maxHeight={280}*/}
            {/*        >*/}
            {/*            {*/}
            {/*                options.length > 1 && (*/}
            {/*                    <Flex bc={'green'} bg={'white'} p={8} fg={'green'} cursor={1} rounded={2} onClick={toggle}>*/}
            {/*                        <div>옵션을 선택해 주세요</div>*/}
            {/*                        <Right><IoIosArrowDown size={20}/></Right>*/}
            {/*                    </Flex>*/}
            {/*                )*/}
            {/*            }*/}

            {/*            <GridColumns repeat={1} rowGap={8} py={8}>*/}
            {/*                {*/}
            {/*                    selectedOptions.map(({optionImages, optionIndex, optionName, optionPrice, orderCnt}, index ) => {*/}
            {/*                            return(*/}
            {/*                                <Div relative key={`selectedOption${index}`} p={10} bc={'secondary'} bg={'white'}>*/}
            {/*                                    {*/}
            {/*                                        options.length > 1 && (*/}
            {/*                                            <Div absolute top={0} right={0} mt={10} mr={10} cursor={1}>*/}
            {/*                                                <AiFillCloseSquare size={25} color={color.secondary} onClick={removeOption.bind(this, optionIndex)} />*/}
            {/*                                            </Div>*/}
            {/*                                        )*/}
            {/*                                    }*/}

            {/*                                    <Div mb={4} pr={24} fontSize={12}>{optionName}</Div>*/}
            {/*                                    <Flex>*/}
            {/*                                        <Img*/}
            {/*                                            src={ComUtil.getFirstImageSrc(optionImages, 'thumb')}*/}
            {/*                                            width={42}*/}
            {/*                                            height={42}*/}
            {/*                                            cover*/}
            {/*                                            mr={8}*/}
            {/*                                            rounded={2}*/}
            {/*                                        />*/}

            {/*                                        <Div width={150}>*/}
            {/*                                            <QtyInputGroup idx={index} value={orderCnt} onChange={onOrderCntChange} />*/}
            {/*                                        </Div>*/}
            {/*                                        <Right>*/}
            {/*                                            <Span fontSize={17}><b>{ComUtil.addCommas(optionPrice)}</b></Span>원*/}
            {/*                                        </Right>*/}
            {/*                                    </Flex>*/}
            {/*                                </Div>*/}
            {/*                            )*/}
            {/*                        }*/}

            {/*                    )*/}
            {/*                }*/}
            {/*            </GridColumns>*/}
            {/*        </Div>*/}

            {/*    </Div>*/}

            {/*    <Div width={'100%'}*/}
            {/*         p={8}*/}
            {/*    >*/}
            {/*        <Flex justifyContent={'space-between'} fg={'dark'} fontSize={13} px={8}>*/}
            {/*            <Div>{selectedOptions.length}개 선택됨</Div>*/}
            {/*            <div>*/}
            {/*                <span>총 금액 </span>*/}
            {/*                <Span fontSize={20} fg={'green'} bold>{ComUtil.addCommas(getTotalOrderPrice())}</Span>*/}
            {/*                <span> 원</span>*/}
            {/*            </div>*/}
            {/*        </Flex>*/}

            {/*        {(goods.dealGoods) ?*/}
            {/*            <GridColumns repeat={2} mt={16} colGap={8} height={55}>*/}
            {/*                <GiftButton onClick={onBuyClick.bind(this, 'gift')}>선물하기</GiftButton>*/}
            {/*                <BuyButton onClick={onBuyClick.bind(this, 'normal')}>구매하기</BuyButton>*/}
            {/*            </GridColumns>*/}
            {/*            : //즉시 옵션상품./////////////*/}
            {/*            <GridColumns mt={16} >*/}
            {/*                <Space spaceGap={8} height={55}>*/}
            {/*                    <Flex justifyContent={'center'} width={55} bg={'white'} bc={'light'} height={'100%'}*/}
            {/*                          cursor={1} doActive onClick={onAddCartClick}>*/}
            {/*                        <FiShoppingCart size={25}/>*/}
            {/*                    </Flex>*/}
            {/*                    <Flex justifyContent={'center'} width={55} bg={'white'} bc={'light'} height={'100%'}*/}
            {/*                          cursor={1} doActive onClick={onBuyClick.bind(this, 'gift', false)}>*/}
            {/*                        <AiOutlineGift size={25}/>*/}
            {/*                    </Flex>*/}
            {/*                    {   //multi gift*/}
            {/*                        ComUtil.isPcWeb() && (*/}
            {/*                            <Flex justifyContent={'center'} width={70} bg={'white'} bc={'light'}*/}
            {/*                                  height={'100%'} cursor={1} doActive onClick={onBuyClick.bind(this, 'gift', true)}>*/}
            {/*                                <AiOutlineGift size={25}/>✕ n*/}
            {/*                            </Flex>*/}
            {/*                        )*/}
            {/*                    }*/}
            {/*                    <Flex flexGrow={1} justifyContent={'center'} bg={'green'} fg={'white'} height={'100%'}*/}
            {/*                          bold fontSize={17} cursor={1} doActive onClick={onBuyClick.bind(this, 'normal', false)}>*/}
            {/*                        구매하기*/}
            {/*                    </Flex>*/}

            {/*                </Space>*/}
            {/*            </GridColumns>*/}
            {/*        }*/}
            {/*    </Div>*/}
            {/*</Flex>*/}

            {
                showOptions && <OptionSelection
                    // options={goods.options}
                    onClose={toggle} />
            }
        </Fixed>
    )
}


//옵션선택
function OptionSelection({onClose}) {
    const {goods, options, selectedOptions, addOption} = useContext(FooterContext)

    const onOptionClick = ({optionIndex, remainedCnt}) => {

        //이벤트 기간이면 이벤트하는 옵션만 선택 가능 하도록
        if ((goods.inSuperRewardPeriod || goods.inTimeSalePeriod)) {

            const eventName = goods.inSuperRewardPeriod ? '슈퍼리워드' : '포텐타임'
            const option = options.find(o => o.optionIndex === optionIndex)

            //이벤트가 아닌 옵션을 선택하면 못하도록
            if (!option.eventFlag) {
                alert(`선택할 수 없는 옵션 입니다. (현재 진행중인 ${eventName} 기간에 한함)`)
                return
            }
        }
        if (remainedCnt <= 0) {
            alert('품절되었습니다.')
            return
        }
        addOption(optionIndex)
        onClose()
    }

    const isEventPeriod = (goods.inSuperRewardPeriod || goods.inTimeSalePeriod)

    if (!goods) return null
    return(
        <Fixed bottom={0} width={'100%'} bg={'white'} custom={`
            box-shadow: 0px -2px 6px rgb(0 0 0 / 10%);
            border-top: 1px solid ${color.light};
        `}>
            <Flex px={16} height={48}>
                <div><b>옵션선택</b></div>
                <Right cursor={1}><Button bg={'white'} onClick={onClose}>닫기</Button></Right>
            </Flex>
            <Hr />
            <Div overflow={'auto'}
                 // minHeight={'40vh'}
                 // maxHeight={'50vh'}
                height={408}
            >
                {
                    options.map((option) =>
                        <Div px={16}
                             bg={selectedOptions.findIndex(sOption => sOption.optionIndex === option.optionIndex) !== -1 ? 'veryLight' : 'white'}
                             doActive>
                            <Flex key={option.optionIndex} cursor={1} alignItems={'flex-start'} py={8}
                                // bg={(isEventPeriod && !option.eventFlag) ? 'veryLight' : 'white'}
                                  custom={`border-bottom: 1px solid ${color.light};`}
                                  onClick={onOptionClick.bind(this, option)}
                            >
                                <Div flexShrink={0} width={50} height={50} mr={8}>
                                    {
                                        option.optionImages && option.optionImages.map((img, index)=>{
                                            if(index === 0){
                                                return <Img rounded={2} src={Server.getThumbnailURL()+img.imageUrl} alt={''} />
                                            }
                                        })
                                    }
                                </Div>
                                <Div>
                                    <Div fontSize={13} mr={8} lineHeight={'1.8'}>
                                        {
                                            (isEventPeriod && option.eventFlag) && (
                                                goods.inSuperRewardPeriod ?
                                                    <SuperRewardBadge mr={3}>슈퍼리워드</SuperRewardBadge> :
                                                    <PotenTimeBadge mr={3}>포텐타임</PotenTimeBadge>
                                            )
                                        }
                                        {
                                            (isEventPeriod && !option.eventFlag) && (
                                                <DisabledBadge mr={3}>선택불가</DisabledBadge>
                                            )
                                        }
                                        {option.optionName}
                                    </Div>
                                </Div>

                                <Right flexShrink={0}>
                                    <b>{ComUtil.addCommas(option.optionPrice)}</b>원
                                    {
                                        option.remainedCnt <= 0 && <Div textAlign={'right'} fg={'danger'} fontSize={13}>품절</Div>
                                    }
                                    {
                                        selectedOptions.findIndex(sOption => sOption.optionIndex === option.optionIndex) !== -1 && (
                                            <Div textAlign={'right'} fg={'green'} fontSize={13}>(선택됨)</Div>
                                        )
                                    }
                                </Right>
                            </Flex>
                        </Div>
                    )
                }
            </Div>
        </Fixed>
    )
}