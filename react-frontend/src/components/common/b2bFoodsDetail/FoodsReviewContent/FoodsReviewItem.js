import React, { Fragment, useState, useEffect } from 'react'
import { Server } from '~/components/Properties'
import { Button } from 'reactstrap'
import { IconStarGroup, ImageGalleryModal } from '~/components/common'
import ComUtil from '~/util/ComUtil'
import { likedFoodsReview } from '~/lib/b2bShopApi'
import { ToastContainer, toast } from 'react-toastify'     //토스트
import 'react-toastify/dist/ReactToastify.css'

let isLiked = []; //현화면에서 좋아요 누른 array.


const FoodsReviewItem = ({orderSeq, email, goodsReviewContent, goodsReviewImages, score, goodsReviewDate, likeCount}) => {

    const [stateLikeCount, setStateLikeCount] = useState(likeCount)

    console.log('likeCount', likeCount, stateLikeCount)
    async function onLikeClick(orderSeq)  {

        //현화면에서 좋아요 안눌렀을때만 동작.
        if (!isLiked.find( (elm) => { return elm == orderSeq} )) {
            console.log('like:' + orderSeq + ',' + stateLikeCount + 1);

            // TODO dealSeq, foodsNo 두개를 넘겨야 가능함
            await likedFoodsReview(orderSeq);

            setStateLikeCount(stateLikeCount + 1); //push만 하면 아래에서 +1해줌.
            notify('상품 후기를 좋아요 했습니다', toast.info);

            isLiked.push(orderSeq);  //현화면에서는 한번만 좋아요 할 수 있도록. array로 관리
        } else {
            notify('이미 좋아요를 한 후기입니다', toast.info);
        }
    }

    //react-toastify  usage: this.notify('메세지', toast.success/warn/error);
    function notify(msg, toastFunc) {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
            //className: ''     //클래스를 넣어도 됩니다
        })
    }
    const secureEmail = email.split('@');

    return (

        <Fragment>
            <div className='m-3'>
            <span className='d-flex align-items-center text-secondary f6 mb-3'>
                <span className={'mr-2'}>{secureEmail[0].substring(0,3)}***@{secureEmail[1]}</span>
                <span className='mr-2'>|</span>
                <span className='d-flex ml-2 mr-2'><IconStarGroup score={score}/></span>|
                <span className='ml-2'>{ComUtil.timeFromNow(goodsReviewDate)}</span>
            </span>
                {
                    (goodsReviewImages && goodsReviewImages.length > 0) && (
                        <div className={'mb-3 d-flex flex-nowrap'} style={{overflow: 'auto'}}>
                            <ImageGalleryModal
                                imageWidth={140}
                                imageHeight={90}
                                images={goodsReviewImages}        //화면에 보여줄 이미지
                                modalImages={goodsReviewImages}   //이미지 클릭시 모달로 스와이프에 담을 이미지들
                                className={'mr-1 cursor-pointer'}
                            />
                        </div>
                    )
                }
                <div className='text-dark' style={{whiteSpace: 'pre-line'}}>
                    {goodsReviewContent}
                </div>
                {/* isLiked array에 최근에 좋아요 한 이력있으면 +1 표시. (전체 goodsDetail에서 data새로 가져오지 않기때문에 탭이동시 본화면에서 간단히 관리 중*/}
                {/*<div className='f7 pt-2' onClick={onLikeClick.bind(this, orderSeq)}>
                    <span className='text-primary mr-2'>좋아요</span>
                    <span>{stateLikeCount  + parseInt( (isLiked.find( (elm) => { return elm == orderSeq}))? 1:0 ) }개</span>
                </div>*/}
            </div>
            <ToastContainer/>
        </Fragment>
    )
}
export default FoodsReviewItem