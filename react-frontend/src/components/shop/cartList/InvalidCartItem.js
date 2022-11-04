import React, {Fragment} from 'react'
import PropTypes from 'prop-types'
import {MdClose} from "react-icons/md";
import ComUtil from '~/util/ComUtil'
import { Server } from '~/components/Properties'
import Style from './CartList.module.scss'
import {Div} from "~/styledComponents/shared";

const InvalidCartItem = (props) => {

    //삭제 클릭
    const onDeleteClick = () => {
        props.onChange({
            type: 'DELETE',
            state: {
                goodsNo: props.goodsNo
            }
        })

    }

    const totPrice = props.goodsPrice + props.deliveryFee

    //상품클릭
    function onClick(){
        props.history.push(`/goods?goodsNo=${props.goodsNo}`)
    }

    return (
        <Div cursor={1}>
            {/* 제품 박스 start */}
            <div className='bg-white p-3 mb-2'>
                {/* 제품명 박스 start */}
                <div className='d-flex align-items-center mb-3'>
                    <span  onClick={onClick.bind(this)} >{props.goodsNm}</span>
                    <div className='flex-grow-1 text-right'><span onClick={onDeleteClick}><MdClose /></span></div>
                </div>
                {/* 제품명 박스 end */}

                {/* 이미지 & 수량 박스 start */}
                <div className='d-flex align-items-center' onClick={onClick.bind(this)} >

                    {/* 이미지 */}
                    <div className='d-flex flex-column align-items-center justify-content-center flex-shrink-0' style={{width:96}}>
                        <img className={Style.goodsImage} src={Server.getThumbnailURL()+props.goodsImages[0].imageUrl} alt={'사진'} />
                        <div className='text-secondary small text-center p-1'>
                            {ComUtil.addCommas(props.currentPrice)} 원 ({Math.round(props.discountRate)}%)
                        </div>
                    </div>

                    <div className='flex-grow-1 ml-2'>
                        {/*<div className='d-flex mb-1 text-dark f6'>*/}
                        {/*    <div className='text-right' style={{width:'70px'}}>상품가</div>*/}
                        {/*    <div className='text-right flex-grow-1'>{ComUtil.addCommas(props.goodsPrice)} 원</div>*/}
                        {/*</div>*/}
                        <div className='text-center'>
                            {
                                props.remainedCnt <= 0 ? <b>품절</b> : <b>판매종료</b>
                            }
                        </div>
                        {/*<div className='d-flex mb-1 text-dark f6'>*/}
                            {/*<div className='text-right' style={{width:'70px'}}>배송비</div>*/}
                            {/*<div className='text-right flex-grow-1'>+ {ComUtil.addCommas(props.deliveryFee)} 원</div>*/}
                        {/*</div>*/}
                        {/*<div className='d-flex font-weight-border'>*/}
                            {/*<div className='text-right' style={{width:'70px'}}>합계</div>*/}
                            {/*<div className='text-right flex-grow-1'>{ComUtil.addCommas(totPrice)} 원</div>*/}
                        {/*</div>*/}
                    </div>

                </div>
                {/* 이미지 & 수량 박스 end */}
            </div>
            {/* 제품 박스 end */}
        </Div>
    )
}

InvalidCartItem.propTypes = {
    goodsNo: PropTypes.number.isRequired,
    checked: PropTypes.bool,
    goodsPrice: PropTypes.number.isRequired,
    deliveryFee: PropTypes.number.isRequired,
}
InvalidCartItem.defaultProps = {
    checked: true,
    goodsPrice: 0,
    deliveryFee: 0,
}


export default InvalidCartItem