import React from 'react'
import ComUtil from '../../../util/ComUtil'
import {withRouter} from 'react-router-dom'
import {Button, Div, Flex, Img, Span} from "~/styledComponents/shared";
import {IoIosArrowForward} from'react-icons/io'
import useImg from "~/hooks/useImg";
import {TYPE_OF_IMAGE} from "~/lib/bloceryConst";

const WaitingItem = (props) => {
    const {orderSeq, goodsNo, goodsNm,
        goodsImages,
        consumerOkDate, noBlockchainUser, onePlusSubFlag} = props

    const {imageUrl, onError} = useImg(goodsImages, TYPE_OF_IMAGE.SQUARE)

    const onGoodsClick = () => {
        props.history.push('/goods?goodsNo='+goodsNo)
    }
    const onOrderSeqClick = (e) => {
        e.stopPropagation()
        props.history.push(`/mypage/orderDetail?orderSeq=${orderSeq}`)
    }
    const onReviewClick = () => {
        props.history.push(`/goodsReview?action=I&orderSeq=${orderSeq}&goodsNo=${goodsNo}&score=${0}`)
    }
    return(
        <Div bg={'white'} p={16}>
            <Flex alignItems={'flex-start'} cursor onClick={onGoodsClick}>
                <Div width={100} height={100} flexShrink={0}>
                    <Img
                    cover
                    onError={onError}
                    rounded={3} src={imageUrl} alt={"후기사진"}/>
                </Div>
                <Div ml={16}>
                    <Flex fg={'green'} fontSize={13} onClick={onOrderSeqClick}>{ComUtil.utcToString(consumerOkDate)}_{orderSeq} <IoIosArrowForward /></Flex>
                    <Div mt={10} fontSize={14}>{goodsNm}</Div>
                </Div>
            </Flex>

            <Div mt={16}>
                <Button rounded={3} bc={'secondary'} bg={'white'} py={8} block fontSize={13} onClick={onReviewClick}>
                    리뷰 쓰기
                    {
                        !onePlusSubFlag && !noBlockchainUser && <Span fg={'green'}>- 최대 100원 적립</Span>
                    }
                </Button>
            </Div>
            {/*<Link to={'/goods?goodsNo='+goodsNo}>*/}
            {/*    <Div>*/}
            {/*        <Img cover rounded={3} src={imgUrl} alt={"후기사진"}/>*/}
            {/*    </Div>*/}
            {/*</Link>*/}
            {/*<div className='flex-grow-1'>*/}
            {/*    <Link to={'/goods?goodsNo='+goodsNo}>*/}
            {/*        <div className='font-weight-border'>{goodsNm}</div>*/}
            {/*    </Link>*/}
            {/*    <div className='text-secondary small'>*/}
            {/*        {*/}
            {/*            consumerOkDate && ComUtil.utcToString(consumerOkDate)*/}
            {/*        }*/}
            {/*        {consumerOkDate ? ' 구매확정' : ' 배송중'}</div>*/}
            {/*    <div className='d-flex justify-content-between text-center m-2'>*/}
            {/*        {*/}
            {/*            [2,4,6,8,10].map( score  => <StarButton key={'star'+score} score={score} onClick={onClick.bind(this, props, score)}/>)*/}
            {/*        }*/}
            {/*    </div>*/}
            {/*</div>*/}
        </Div>
    )
}
export default withRouter(WaitingItem)