import React, {useEffect, useState, useCallback} from 'react';
import {Div, Flex, GridColumns, Img, Right, Space, Span} from "~/styledComponents/shared";
import {addCart, updateCart, getMyTotalProducerOrderPrice} from "~/lib/cartApi";
import useNotice from "~/hooks/useNotice";
import styled from "styled-components";
import {color} from "~/styledComponents/Properties";
import {getValue} from "~/styledComponents/Util";
import {IoMdAdd, IoMdRemove, HiPlus, HiMinus} from "react-icons/all";
import {Webview} from "~/lib/webviewApi";
import useLogin from "~/hooks/useLogin";
import {getGoodsByGoodsNo} from "~/lib/goodsApi";
import SpinnerLoading from "~/components/common/Spinner/SpinnerLoading";
import {AiFillCloseSquare} from "react-icons/ai";
import ComUtil from "~/util/ComUtil";
import {QtyInputGroup} from "~/components/common";
import {InOutButton} from "~/components/common/buttons/InOutButton";
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {Button} from "~/styledComponents/shared";
import {useModal} from "~/util/useModal";
import {getGoodsStatus} from "~/components/common/cards/VerticalGoodsCard";
import {useSetRecoilState} from "recoil";
import {optionAlertState} from "~/recoilState";
import useCartCount from "~/hooks/useCartCount";
import { debounce } from "lodash";
//
// const Wrapper = styled.div`
//     height: ${getValue(34)};
//     display: grid;
//     grid-template-columns: 44px 1fr 44px;
//     grid-column-gap: 1px;
//     background: ${color.light};
//     align-items: center;
//     border: 1px solid ${color.light};
//     border-radius: 3px;
//     margin: 8px 0;
//     overflow: hidden;
//     user-select: none;
//     & > div {
//         height: 100%;
//     }
// `
// const NumberButton = ({onClick, children, ...rest}) => <Flex justifyContent={'center'} bg={'white'} width={'44px'} doActive cursor={1} onClick={onClick} {...rest}>{children}</Flex>

// const CartButtonGroup = ({onClick, count}) =>
//     <Wrapper onClick={e => e.stopPropagation()}>
//         <NumberButton onClick={onClick.bind(this, -1)}><IoMdRemove/></NumberButton>
//         <Flex bg={'white'} justifyContent={'center'} bold>{count}</Flex>
//         <NumberButton onClick={onClick.bind(this, 1)}><IoMdAdd/></NumberButton>
//     </Wrapper>

const inOutButtonStyle = {borderTopLeftRadius: 0, borderTopRightRadius: 0}

export const AddCartButton = ({goods, disabled}) => {
    const {openLoginModal} = useLogin()
    const [count, setCount] = useState(0)
    // const { setPrivateCartCount} = useNotice()
    const {setPrivateCartCount} = useCartCount()

    // const [alertTimes, setAlertTimes] = useRecoilState(optionAlertState)
    const setAlertTimes = useSetRecoilState(optionAlertState)


    const refresh = function (type) {
        setAlertTimes(prev => [...prev, {producerNo: goods.producerNo, action: 'CART_ADDED'}])

        //장바구니 빨간점 업데이트
        setPrivateCartCount()
    }

    //마지막 클릭 후 0.5초 이후 한번만 실행 됨
    const debounceOnChange = debounce(refresh, 500);

    //함수가 갱신되지 않도록 didMount [] 시에만 처리
    //변수는 함수의 파라미터로 받아 처리 해야 함
    const onClick = useCallback(async (disabled, orderCnt, count, e) => {
        // e.stopPropagation()

        if (disabled) {
            return
        }

        if (count + orderCnt < 0) {
            return
        }

        //슈퍼리워드는 하나만 고를 수 있음
        if (orderCnt + count > 1 && (goods.inSuperRewardPeriod)){
            alert('슈퍼리워드 상품은 1개만 구입 가능 합니다.');
            return
        }

        const optionIndex = (goods.inSuperRewardPeriod || goods.inTimeSalePeriod) ? goods.options.find(option => option.eventFlag === true).optionIndex : goods.options.filter(option => !option.deleted)[0].optionIndex


        const option = {
            optionIndex: optionIndex,//goods.options[0].optionIndex,
            orderCnt: orderCnt
        }

        const params = {
            goodsNo: goods.goodsNo,
            options: [option],
            producerNo: goods.producerNo,
            checked: true
        }
        const {status, data} = await addCart(params)

        if (status === 200) {
            //로그인 필요
            if (data === 0) {
                openLoginModal()
                return
            }

            setCount(prev => prev + orderCnt)

            //장바구니 메시지
            //장바구니 빨간점
            debounceOnChange()

        }
    }, [])

    return (
        <InOutButton style={inOutButtonStyle} value={count} disabled={disabled}
                     //bind 를 하지만 useCallback 을 통해 같은 주소의 함수를 지속적으로 호출. 그래서 debounce 가 제대로 동작 가능 함
                     onDecrease={onClick.bind(this, disabled, -1, count)}
                     onIncrease={onClick.bind(this, disabled, 1, count)}

        />
    )
};

export const OptionViewButton = ({goodsNo, disabled}) => {

    const [isOpen, setOpen] = useState(false)
    //recoil
    const onClick = e => {
        e.stopPropagation()

        if (!disabled)
            toggle()
    }
    const toggle = () => setOpen(prev => {
            const newState = !prev
            //열린 상태면 배경 스크롤 막기
            if (newState) {
                ComUtil.noScrollBody()
            }else{
                ComUtil.scrollBody()
            }

            return !prev
        }
    )
    return(
        <>
            <Div rounded={4} bg={'white'} doActive bc={'light'} height={34} cursor={1} textAlign={'center'} lineHeight={34} onClick={onClick} fg={disabled && 'light'} style={{borderTopLeftRadius: 0, borderTopRightRadius: 0}}>옵션선택</Div>
            <Modal size="lg" centered isOpen={isOpen} toggle={toggle} backdrop={'static'} >
                <ModalBody style={{padding: getValue(20), paddingTop: getValue(32)}}>
                    <OptionContent goodsNo={goodsNo} onCancel={toggle} onClose={toggle}/>
                </ModalBody>
            </Modal>
        </>
    )
}

//나중에 bottom modal 안에 들어갈 컨텐츠
const OptionContent = ({goodsNo, onCancel, onClose}) => {
    const {openLoginModal} = useLogin()
    // const {setPrivateCartCount} = useNotice()
    const {setPrivateCartCount} = useCartCount()
    const [goods, setGoods] = useState()
    const [isAdded, setIsAdded] = useState(false)
    const setAlertTimes = useSetRecoilState(optionAlertState)

    useEffect(() => {
        search()
    }, [])

    const search = async () => {
        const {status, data} = await getGoodsByGoodsNo(goodsNo)
        if (status === 200) {
            if (data) {
                //deleted 된 옵션은 제거
                const availableOptions = data.options.filter(option => !option.deleted)
                data.options = availableOptions
                setGoods(data)
            }
        }
    }

    //옵션 클릭
    // const addOptionClick = (option, e) => {
    //     e.stopPropagation()
    //
    //     // const foundOption = selectedOptions.find(selOption => selOption === option)
    //
    //     if (!selectedOptions.includes(option)) {
    //         option.orderCnt = option.orderCnt = 1 //기본 한개 세팅
    //         //옵션 추가
    //         setSelectedOptions(prev => [...prev, option])
    //     }
    // }
    // //옵션 제거
    // const removeOptionClick = (option, e) => {
    //     e.stopPropagation()
    //     setSelectedOptions(prev => prev.filter(p => p !== option))
    // }

    // const onOrderCntChange = ({value,idx}) => {
    //     // const options = Object.assign([], selectedOptions)
    //     // const option = options.find(option => option.optionName === optionName)
    //
    //     //deep copy : recoil 에서 객체는 readOnly 라서 에러발생 (Object.assign 으로는 해결되지 않음)
    //     const options = selectedOptions.map(option => ({...option}))
    //     const option = options[idx]
    //
    //     if (value > option.remainedCnt) {
    //         alert(`재고수량이 ${ComUtil.addCommas(option.remainedCnt)}개 존재 합니다. 재고수량 이하로 수량을 입력해주세요`)
    //         return
    //     }
    //     option.orderCnt = value
    //     setSelectedOptions(options)
    //     setTimeout(() => console.log(options), 500)
    // }
    //
    //
    const onDecreaseOrderCnt = (optionIndex) => {
        const copyGoods = {...goods}
        const foundOption = copyGoods.options.find(o => o.optionIndex === optionIndex)
        const orderCnt = (foundOption.orderCnt || 0) -1
        if (orderCnt > -1) {
            foundOption.orderCnt = orderCnt
            setGoods(copyGoods)
        }

        // const copySelectedOptions = [...selectedOptions]
        // const foundOption = copySelectedOptions.find(o => o === option)
        // const orderCnt = foundOption.orderCnt -1
        //
        // if (orderCnt > 0) {
        //     foundOption.orderCnt = orderCnt
        //     setSelectedOptions(copySelectedOptions)
        // }
    }

    const onIncreaseOrderCnt = (optionIndex) => {
        const copyGoods = {...goods}
        const foundOption = copyGoods.options.find(o => o.optionIndex === optionIndex)

        // if (foundOption.remainedCnt <= 0) {
        //     return
        // }

        const orderCnt = (foundOption.orderCnt || 0) +1
        if (orderCnt > 0) {
            foundOption.orderCnt = orderCnt
            setGoods(copyGoods)
        }

        // const copySelectedOptions = [...selectedOptions]
        // const foundOption = copySelectedOptions.find(o => o === option)
        // const orderCnt = foundOption.orderCnt +1
        // foundOption.orderCnt = orderCnt
        // setSelectedOptions(copySelectedOptions)
        // console.log({selectedOptions,option,foundOption,orderCnt})
    }

    const onAddCartClick = async e => {
        // const option = {
        //     optionIndex: goods.options[0].optionIndex,
        //     orderCnt: orderCnt
        // }

        const options = goods.options.filter(option => option.orderCnt || 0 > 0)

        const params = {
            goodsNo: goods.goodsNo,
            options: options,
            producerNo: goods.producerNo,
            checked: true
        }
        console.log({params})
        const {status, data} = await addCart(params)

        if (status === 200) {
            //로그인 필요
            if (data === 0) {
                openLoginModal()
                return
            }

            setPrivateCartCount()

            //producerFarmNm 45000원 장바구니에 담았어요!
            setTimeout(() => setAlertTimes(prev => [...prev, {producerNo: params.producerNo, action: 'CART_ADDED'}]), 500)

            onClose()
        }
    }

    useEffect(() => {
        if (goods) {
            if (goods.options.filter(o => o.orderCnt).length) {
                setIsAdded(true)
            }else {
                setIsAdded(false)
            }
        }
    }, [goods])


    const getTotalPrice = () => {
        let totalPrice = 0;
        goods.options.map(option => {
            totalPrice = totalPrice + option.optionPrice * (option.orderCnt || 0)
        })
        return totalPrice
    }

    if (!goods) return <SpinnerLoading height={300} />

    return(
        <Div maxHeight={'90vh'} onClick={ e => e.stopPropagation()}>
            <Div pb={'12px'} fontSize={14} style={{borderBottom: goods.options.length > 1 && `1px solid ${color.black}`}} bold>
                {goods.goodsNm}
            </Div>
            <Div overflow={'auto'} //maxHeight={'calc(90vh - 37px - 50px - 10px)'}
                 custom={`
                    max-height: ${getValue(355)};
                    min-height: ${getValue(120)};
                `}
            >
                {/*<div>*/}
                {/*    {*/}
                {/*        goods.options.map(option => {*/}
                {/*            return(*/}
                {/*                <Flex bg={selectedOptions.includes(option) ? 'light' : 'white' } doActive cursor={1} onClick={addOptionClick.bind(this, option)}>*/}
                {/*                    <div>{option.optionName}</div>*/}
                {/*                    <Right>*/}
                {/*                        {option.optionPrice}*/}
                {/*                    </Right>*/}
                {/*                </Flex>*/}
                {/*            )*/}
                {/*        })*/}
                {/*    }*/}
                {/*</div>*/}
                <GridColumns repeat={1} colGap={0} rowGap={1} bg={'light'} fontSize={14}>
                    {
                        //옵션 리스트
                        goods.options.map((option) =>
                            <Div key={`selectedOption${option.optionIndex}`} py={16} bg={'white'}>
                                <div>{option.optionName}</div>
                                <Flex>
                                    <div><b>{ComUtil.addCommas(option.optionPrice)}원</b></div>
                                    <Right width={100} textAlign={'right'}>
                                        {
                                            option.remainedCnt <= 0 ? '품절' :
                                                <InOutButton size={'sm'} value={option.orderCnt || 0} onDecrease={onDecreaseOrderCnt.bind(this, option.optionIndex)} onIncrease={onIncreaseOrderCnt.bind(this, option.optionIndex)} />
                                        }
                                    </Right>
                                </Flex>
                            </Div>
                        )
                    }
                </GridColumns>
            </Div>

            <Flex py={20} bold fontSize={18}>
                <div>
                    합계
                </div>
                <Right>
                    <Span fontSize={28}>
                        {ComUtil.addCommas(getTotalPrice())}
                    </Span>
                    <span>
                        원
                    </span>
                </Right>
            </Flex>
            <GridColumns repeat={2} colGap={6} rowGap={0} minHeight={52}>
                <Button height={'100%'} bg={'white'} bc={'light'} rounded={4} onClick={onCancel}>취소</Button>
                <Button height={'100%'} bg={'green'} fg={'white'}  rounded={4} onClick={onAddCartClick} disabled={!isAdded}>장바구니 담기</Button>
            </GridColumns>
        </Div>
    )
}

export const CartButton = React.memo(({goods}) => {


    // const availableOption = goods.options.filter(option => !option.delete)

    //     SALE_STOPPED //판매종료(판매자가 판매 중단한 경우)
    //     SALE_PAUSED  //판매일시중지
    //     SOLD_OUT     //품절
    //     SALE_END     //판매종료
    //     DEAL_END     //쑥쑥 딜 종료
    const status = getGoodsStatus(goods)

    // if (status)
    //     return <Div rounded={4} bg={'veryLight'} bc={'light'} height={34} textAlign={'center'} lineHeight={34} style={{borderTopLeftRadius: 0, borderTopRightRadius: 0}} onClick={e => e.stopPropagation()}>품절</Div>
    // else{
    //옵션 하나 or 슈퍼리워드 or 포텐타임

    if (goods.realOptionSize === 1 || goods.inSuperRewardPeriod || goods.inTimeSalePeriod) {
        //- + 버튼
        return <AddCartButton goods={goods} disabled={status} />
    }else{
        //옵션보기
        return <OptionViewButton goodsNo={goods.goodsNo} disabled={status}/>
    }
    // }
});


// export default {
//     CartButton,
//     AddCartButton,
//     OptionViewButton
// };