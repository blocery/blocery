import React, {Fragment} from 'react'
import PropTypes from 'prop-types'
import {QtyInputGroup} from '../../common'
import {MdClose} from 'react-icons/md'

import Checkbox from '~/components/common/checkboxes/Checkbox'
import ComUtil from '../../../util/ComUtil'
import {Div, Flex, Img, JustListSpace, Right, WhiteSpace} from '~/styledComponents/shared'
import {Link} from 'react-router-dom'
import {TYPE_OF_IMAGE} from "~/lib/bloceryConst";
import useImg from "~/hooks/useImg";
import {getValue} from "~/styledComponents/Util";
import {color} from "~/styledComponents/Properties";
import {BadgeGoodsEventType, Bold} from "~/styledComponents/ShopBlyLayouts";

const CartItem = (props) => {

    //옵션상품: options에 여러개 들어오므로 이 안에서 루프:  listSize>1 일 경우, 여러 Item 구조
    //동일상품(옵션 다른걸) 여러개 한꺼번에 구매시엔 배송비 아래에 출력

    const { producer, goodsNm, timeSale, inTimeSalePeriod, superReward, inSuperRewardPeriod, options, producerWrapDelivered } = props
    // console.log('carItem: options', options, props)


    //item수량변경
    const onQtyChange = (optionIndex, res) => {
        props.onChange({
            type: 'UPDATE_QTY',
            state: {
                producerNo: producer.producerNo,
                goodsNo: props.goodsNo,
                optionIndex:optionIndex,
                qty: res.value, //수정된 값
                groupKey: producer.producerNo + producerWrapDelivered.toString() +  (producerWrapDelivered?'':props.goodsNo)//그룹키.
            }
        })
    }

    //체크박스 변경
    const onCheckboxChange = (e) => {

        props.onChange({
            type: 'UPDATE_CHECKED',
            state: {
                producerNo: producer.producerNo,
                goodsNo: props.goodsNo,
                checked: e.target.checked,
                groupKey: producer.producerNo + producerWrapDelivered.toString() +  (producerWrapDelivered?'':props.goodsNo)//그룹키.
            }
        })
    }

    //삭제 클릭
    const onDeleteClick = (optionIndex) => {
        props.onChange({
            type: 'DELETE',
            state: {
                producerNo: producer.producerNo,
                goodsNo: props.goodsNo,
                optionIndex: isOptionGoodsMulti?optionIndex:0, //옵션별로 삭제하려면 필요.
                groupKey: producer.producerNo + producerWrapDelivered.toString() +  (producerWrapDelivered?'':props.goodsNo)//그룹키.
            }
        })

    }

    //옵션상품 내 여러가지 option동시구매인지 여부
    //const isOptionGoodsMulti = (options && options[0] && options[0].listSize > 1)?true:false;
    const isOptionGoodsMulti = (options && options.length > 1)?true:false;


    //array합 + deliveryFee는 별도 :미사용
    //const totPrice = options.reduce((acc, option) => acc + option.optionPrice , 0) + props.deliveryFee
    //const {imageUrl, onError} = useImg(props.goodsImages, TYPE_OF_IMAGE.SQUARE)


    const optionImageUrl = (option) => {

        //optionImage
        if (option.optionImages.length > 0) {
            let {imageUrl} = useImg(option.optionImages, TYPE_OF_IMAGE.SQUARE)
            return imageUrl;
        }

        //goodsImage: 현재 미사용 - addGoodsMeta2Options 함수로, 무조건 optionImages가 들어오고 있음.
        let {imageUrl} = useImg(props.goodsImages, TYPE_OF_IMAGE.SQUARE)
        return imageUrl;
    }

    return (

        <Fragment>
            { options.map((option, idx) => //optionGoodsMulti일 경우, 여러Item출력: mb=0으로 해서 아이템간 붙여서 출력.


                <Div bg={'white'}
                    // mb={isOptionGoodsMulti?0:(producerWrapDelivered?5:15)}
                    //  custom={`border-top: 1px solid ${color.light};`}
                >
                    {/* 제품명 박스 start */}
                    {/*<div className='text-secondary mb-2'>{props.farmName}</div>*/}
                    <Flex minHeight={52} py={16} pr={22} relative>

                        {idx === 0 ?  //220323 체크박스는 상품별 한개.
                            <Checkbox bg={'green'} onChange={onCheckboxChange} checked={props.checked} m={10} size={'sm'}>
                                <WhiteSpace fontSize={14} lineClamp={2} >{goodsNm}</WhiteSpace>
                            </Checkbox>
                            :
                            <Div ml={25}> {goodsNm} </Div>
                        }

                        {/*<Label for={checkBoxId} className='m-0'>{props.goodsNm} <span className='text-danger f6'>{props.directGoods !== true && ' (예약상품/묶음배송 불가)'}</span></Label>*/}

                        <Div absolute top={16} right={0} cursor onClick={onDeleteClick.bind(this, option.optionIndex)}>
                            <MdClose size={22} color={'dark'}/>
                        </Div>
                    </Flex>
                    {/* 제품명 박스 end */}

                    {/* 이미지 & 수량 박스 start */}
                    <Flex alignItems={'flex-start'} pl={25} mb={15}>
                        {/* 이미지 */}
                        <div className='d-flex flex-column align-items-center flex-shrink-0' style={{width:getValue(78)}}>
                            <Link to={`/goods?goodsNo=${props.goodsNo}`}>
                                {/*<Img onError={onError} style={{width: 78, height: 78}} src={optionImageUrl(option)} alt={'사진'} />*/}
                                <Img style={{width: 78, height: 78}} src={optionImageUrl(option)} alt={'사진'} />
                            </Link>

                            {/*<div className='text-secondary small text-center p-1'>*/}
                            {/*    {ComUtil.addCommas(option.optionPrice)} 원 ({Math.round(props.discountRate)}%)*/}
                            {/*</div>*/}
                        </div>

                        {/* 수량 & 합계 */}
                        <Div flexGrow={1} ml={16}>

                            <JustListSpace space={10}>
                                {
                                    (timeSale && inTimeSalePeriod)  && (
                                        <BadgeGoodsEventType goodsEventType={'POTENTIME'}>
                                            포텐타임
                                        </BadgeGoodsEventType>
                                    )
                                }
                                {
                                    (superReward && inSuperRewardPeriod)  && (
                                        <BadgeGoodsEventType goodsEventType={'SUPERREWARD'}>
                                            슈퍼리워드
                                        </BadgeGoodsEventType>
                                    )
                                }
                                <Div fontSize={13} fg={'darkBlack'}>
                                    {`옵션 : ${option.optionName} / ${ComUtil.addCommas(option.optionPrice)}원`}
                                </Div>
                                {/* 수량 */}
                                <QtyInputGroup readOnly onChange={onQtyChange.bind(this, option.optionIndex)} name={props.goodsNo} value={option.orderCnt}/>
                                <Flex justifyContent={'between-space'} fontSize={14} fg={'dark'}>
                                    <div>상품금액</div>
                                    <Right pr={10} fg={'darkBlack'}><Bold>{ComUtil.addCommas(option.optionPrice * option.orderCnt)}</Bold> 원</Right>
                                </Flex>
                            </JustListSpace>




                            {/*<div className='d-flex justify-content-end align-items-end mb-3'>*/}
                            {/*    <QtyInputGroup readOnly onChange={onQtyChange.bind(this, option.optionIndex)} name={props.goodsNo} value={option.orderCnt}/>*/}
                            {/*</div>*/}


                            {/*<div className='d-flex mb-1 text-dark f6'>*/}
                            {/*    <div className='text-right' style={{width:'70px'}}>상품금액</div>*/}
                            {/*    <Right pr={10}>{ComUtil.addCommas(option.optionPrice * option.orderCnt)} 원</Right>*/}
                            {/*</div>*/}

                            {/* CartGroupSummary 에서 배송비는 항상 보여주기 때문에 아래 항목에서는 보여 줄 필요가 없어 주석 처리 하였다. */}
                            {/*{*/}
                            {/*    !producerWrapDelivered && !isOptionGoodsMulti && //옵션상품 멀티구매시에는 배송비 아래에 총괄출력, 단 wrap상품은 미출력(전체묶음배송비에서 출력)*/}
                            {/*    <div className='d-flex mb-1 text-dark f6'>*/}
                            {/*        <div className='text-right' style={{width: '70px'}}>배송비</div>*/}
                            {/*        <div className='text-right flex-grow-1'>{ComUtil.addCommas(props.deliveryFee)} 원</div>*/}
                            {/*    </div>*/}
                            {/*}*/}

                            {/* 주문금액 또한 주석 처리 */}
                            {/*<div className='d-flex font-weight-border f6'>*/}
                            {/*    <div className='text-right' style={{width:'70px'}}>주문금액</div>*/}
                            {/*    <div className='text-right flex-grow-1'>{ComUtil.addCommas(option.optionPrice*option.orderCnt + ((isOptionGoodsMulti)?0:props.deliveryFee))} 원</div>*/}
                            {/*</div>*/}
                        </Div>

                    </Flex>

                    {/*<div className='d-flex align-items-start' style={{marginLeft: getValue(25)}}>*/}

                    {/*    /!* 이미지 *!/*/}
                    {/*    <div className='d-flex flex-column align-items-center flex-shrink-0' style={{width:getValue(78)}}>*/}
                    {/*        <Link to={`/goods?goodsNo=${props.goodsNo}`}>*/}
                    {/*            /!*<Img onError={onError} style={{width: 78, height: 78}} src={optionImageUrl(option)} alt={'사진'} />*!/*/}
                    {/*            <Img style={{width: 78, height: 78}} src={optionImageUrl(option)} alt={'사진'} />*/}
                    {/*        </Link>*/}

                    {/*        <div className='text-secondary small text-center p-1'>*/}
                    {/*            {ComUtil.addCommas(option.optionPrice)} 원 ({Math.round(props.discountRate)}%)*/}
                    {/*        </div>*/}
                    {/*    </div>*/}

                    {/*    /!* 수량 & 합계 *!/*/}
                    {/*    <div className='flex-grow-1 ml-2'>*/}

                    {/*        /!* 수량 *!/*/}
                    {/*        <div className='d-flex justify-content-end align-items-end mb-3'>*/}
                    {/*            <QtyInputGroup readOnly onChange={onQtyChange.bind(this, option.optionIndex)} name={props.goodsNo} value={option.orderCnt}/>*/}
                    {/*        </div>*/}

                    {/*        <div className='d-flex mb-1 text-dark f6'>*/}
                    {/*            <div className='text-right' style={{width:'70px'}}>상품가격</div>*/}
                    {/*            <div className='text-right flex-grow-1'>{ComUtil.addCommas(option.optionPrice * option.orderCnt)} 원</div>*/}
                    {/*        </div>*/}
                    {/*        {*/}
                    {/*            !producerWrapDelivered && !isOptionGoodsMulti && //옵션상품 멀티구매시에는 배송비 아래에 총괄출력, 단 wrap상품은 미출력(전체묶음배송비에서 출력)*/}
                    {/*            <div className='d-flex mb-1 text-dark f6'>*/}
                    {/*                <div className='text-right' style={{width: '70px'}}>배송비</div>*/}
                    {/*                <div className='text-right flex-grow-1'>{ComUtil.addCommas(props.deliveryFee)}원</div>*/}
                    {/*            </div>*/}
                    {/*        }*/}

                    {/*        <div className='d-flex font-weight-border'>*/}
                    {/*            <div className='text-right' style={{width:'70px'}}>결제금액</div>*/}
                    {/*            <div className='text-right flex-grow-1'>{ComUtil.addCommas(option.optionPrice*option.orderCnt + ((isOptionGoodsMulti)?0:props.deliveryFee))} 원</div>*/}
                    {/*        </div>*/}
                    {/*    </div>*/}


                    {/*</div>*/}
                    {/* 이미지 & 수량 박스 end */}

                    {/* 제품 박스 end */}
                </Div>

            )}
            {
                //2022.04 subgroup단위 배송비 출력해서, '동일상품 배송비' 안찍어도 될듯. 찍고싶으면 아래 uncomment
                // !producerWrapDelivered && isOptionGoodsMulti &&  //옵션상품 멀티구매시에는 배송비 총괄출력, 단 wrap상품은 미출력(전체묶음배송비에서 출력)
                // <div p={20} className='d-flex font-weight-border'>
                //     <div p={5} className='text-right' style={{width: '100px'}}>동일상품 배송비</div>
                //     <div p={5} className='text-right flex-grow-1'>{ComUtil.addCommas(props.deliveryFee)}원</div>
                // </div>
            }
        </Fragment>
    )
}

CartItem.propTypes = {
    goodsNo: PropTypes.number.isRequired,
    checked: PropTypes.bool,
    goodsPrice: PropTypes.number.isRequired,
    deliveryFee: PropTypes.number.isRequired,
}
CartItem.defaultProps = {
    checked: true,
    goodsPrice: 0,
    deliveryFee: 0,
}


export default CartItem