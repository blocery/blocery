import React, {Fragment, useEffect, useMemo, useCallback} from 'react';
import {Div, Flex, GridColumns, Img, Space, Span} from "~/styledComponents/shared";
import {Bold, BadgeGoodsEventType} from "~/styledComponents/ShopBlyLayouts";
import IconStarGroup from "~/components/common/icons/IconStarGroup";
import styled from 'styled-components'
import {getValue} from "~/styledComponents/Util";
import {color} from "~/styledComponents/Properties";
import {BsFillHeartFill, BsTruck} from 'react-icons/bs'
import {IoIosHeart} from 'react-icons/io'
import {withRouter} from "react-router-dom";
import ComUtil from "~/util/ComUtil";
import RoundedZzimButton from "~/components/common/buttons/RoundedZzimButton";
import DealProgress from "~/components/common/progresses/DealProgress";
import useInterval from "~/hooks/useInterval";
import {getGoodsByGoodsNo} from "~/lib/goodsApi";
import moment from 'moment-timezone'
import GoodsBadges from "~/components/common/badges/GoodsBadges";
import ArImage from '~/images/icons/renewal/ar_supported.png'
import {TYPE_OF_IMAGE} from "~/lib/bloceryConst";
import useImg from "~/hooks/useImg";
import LocalfoodIconCard from "~/components/common/cards/LocalfoodIconCard";
import {CartButton} from "~/components/common/buttons/CartButton";
import { LazyLoadImage } from 'react-lazy-load-image-component';

const Mask = styled(Flex)`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    // z-index: 1;
    justify-content: center;
    // border-radius: ${getValue(4)};
    color: white;
    background: rgba(0,0,0, .3);
`

const Badge = styled(Div)`
    font-style: italic;
    color: ${color.white};
    padding: 0 ${getValue(16)};
    height: ${getValue(22)};
    font-weight: 900;
    font-size: ${getValue(11)};
    line-height: ${getValue(22)};
`

const BigBadge = styled(Badge)`    
    height: ${getValue(27)};
    font-size: ${getValue(13)};   
    line-height: ${getValue(27)};
`

// const BadgeDanger = styled(Badge)`
//     background: ${color.primary};
// `
//
// const BadgePrimary = styled(Badge)`
//     background: ${color.primary};
// `
// const BadgeCoupon = styled(Badge)`
//     background: ${color.black};
// `

// const Heart = ({goodsNo, active}) => {
//     const onClick = e => {
//         e.stopPropagation()
//         console.log('child')
//
//         //TODO 북마크 기능 추가
//     }
//     return(
//         <Flex justifyContent={'center'} width={35} height={35} bg={active ? color.white : 'rgba(255, 255, 255, 0.6)'} rounded={'50%'} pt={3} cursor={1}
//               onClick={onClick}
//         >
//             <IoIosHeart color={active ? color.danger : 'rgba(0,0,0,0.5)'} size={22}/>
//         </Flex>
//     )
// }

export const GOODS_STATUS = {
    SALE_STOPPED: 'SALE_STOPPED', //판매종료(판매자가 판매 중단한 경우)
    SALE_PAUSED: 'SALE_PAUSED', //판매일시중지
    SOLD_OUT: 'SOLD_OUT', //품절
    SALE_END: 'SALE_END', //판매종료
    DEAL_END: 'DEAL_END'  //쑥쑥 딜 종료
}
export const GOODS_STATUS_NAME = {
    SALE_STOPPED: '판매종료',   //판매종료(판매자가 판매 중단한 경우)
    SALE_PAUSED: '판매종료', //판매일시중지
    SOLD_OUT: '품절',          //품절
    SALE_END: '판매종료',       //판매종료
    DEAL_END: '판매종료'        //쑥쑥 딜 종료
}

//품절, 판매종료 상태값 반환
export function getGoodsStatus(goods) {

    let status;


    if (goods.saleStopped) {
        status = GOODS_STATUS.SALE_STOPPED //판매중단
    }else if (goods.salePaused) {
        status = GOODS_STATUS.SALE_PAUSED  //판매일시중지
    }

    else {

        if(!goods.remainedCnt || goods.remainedCnt <= 0) {
            status = GOODS_STATUS.SOLD_OUT
        }

        else if (goods.dealGoods) {
            if(moment().isAfter(moment(goods.dealEndDate, 'YYYYMMDD').endOf('day'))){
                status = GOODS_STATUS.DEAL_END
            }
            else if(goods.dealCount >= goods.dealMaxCount){
                status = GOODS_STATUS.SOLD_OUT
            }
        }else{
            if (moment().isAfter(moment(goods.saleEnd, 'YYYYMMDD').endOf('day'))) {
                status = GOODS_STATUS.SALE_END
            }
        }
    }
    return status;
}

// const ZzimButton = React.memo(({goodsNo}) => <Div absolute zIndex={3} right={10} bottom={10} >
//     <RoundedZzimButton goodsNo={goodsNo} />
// </Div>)

const GoodsImage = React.memo(({
                                   goodsNm,
                                   goodsNo,
                                   goodsImages,
                                   // remainedCnt,
                                   // termsOfDeliveryFee,
                                   // buyingRewardFlag,
                                   myLike,
                                   //전용 props
                                   // isThumnail = true,
                                   imageType = TYPE_OF_IMAGE.SQUARE,
                                   leftTopContent,
                                   maskContent,
                                   // height,
                                   height //동적인 비율을 위해 꼭 %로 입력. 가로의 % 가 세로로 들어감 string default 100%
                               }) => {


    const {imageUrl, onError} = useImg(goodsImages, imageType)

    return(

        <Div relative overflow={'hidden'} rounded={4} style={{borderBottomLeftRadius: 0, borderBottomRightRadius: 0}}
            //정사각형을 위해 0px 을 넣어준다.
             height={0}
             pb={height ? height : '100%'}
             bg={'veryLight'}
        >
            <div style={{position: 'absolute', zIndex: 1, width:'100%', height: '100%', top: 0, left: 0, cursor: 'pointer'}}>
                <LazyLoadImage
                    alt={goodsNm}
                    src={imageUrl} // use normal <img> attributes as props
                    effect="blur"
                    width={'100%'}
                    height={'100%'}
                    style={{objectFit: 'cover'}}
                    placeholderSrc={'/lazy/gray_lazy_1_1.jpg'}
                    onError={onError}
                />
                {
                    maskContent && <Mask>{maskContent}</Mask>
                }
                <Div absolute right={10} bottom={10} >
                    <RoundedZzimButton goodsNo={goodsNo} />
                </Div>
                {
                    leftTopContent && (
                        <Div absolute top={0} left={0}>
                            <Flex flexDirection={'column'}>
                                {leftTopContent}
                            </Flex>
                        </Div>
                    )
                }

            </div>
        </Div>
    )
})

//로컬푸드, 실물확인 아이콘
// const LocalfoodIcon = ({goods}) =>
//     <Space spaceGap={4}>
//         {
//             //로컬푸드 상품 일 경우
//             goods.localfoodFarmerNo ? <img src={LocalGoods} alt={'로컬푸드 상품'} style={{marginBottom: getValue(8), height: 22}}/> : null
//         }
//         {
//             //실물확인 상품 일 경우
//             goods.objectUniqueFlag ? <img src={UniqueGoodsIcon} alt={'실물확인 상품'} style={{marginBottom: getValue(8), height: 22}}/> : null
//         }
//     </Space>

const GoodsNm = styled(Div)`
    font-size: ${getValue(13.5)};
`;
const BigDiscountRate = React.memo(({discountRate}) =>
    <Space alignItems={'flex-end'} spaceGap={3} mt={10}>
        <Space spaceGap={4} fg={'danger'} alignItems={'flex-end'}>
            <Bold fontSize={30} lineHeight={23} fw={900}>{discountRate.toFixed(0)}</Bold>
            <Span fontSize={13} lineHeight={'normal'}>%</Span>
        </Space>
        <Div fontSize={15} lineHeight={15} bold>할인</Div>
    </Space>)

const ReviewStarScore = ({avgScore, goodsReviewsCount}) => {
    return(
        <Space spaceGap={5} mt={9} lineHeight={'normal'}>
            <div>
                <IconStarGroup score={avgScore} size={14}/>
            </div>
            {
                goodsReviewsCount > 0 && <Div fontSize={13} lineHeight={13} fg={'darkBlack'}>({ComUtil.addCommas(goodsReviewsCount)})</Div>
            }
        </Space>
    )
}


const SoldOut = ({...rest}) => <Div bold fontSize={20} {...rest} >품절</Div>
const GoodsStatusContent = ({status, ...rest}) => status ? <Div bold fontSize={20} {...rest} >{GOODS_STATUS_NAME[status]}</Div> : null

const LargeContent = ({goods, showProducerNm}) =>
    <Div mt={16}>
        {
            showProducerNm && <Div fg={'green'} fontSize={13}>{goods.producerFarmNm}</Div>
        }
        <LocalfoodIconCard goods={goods} />
        <GoodsNm>{goods.goodsNm}</GoodsNm>
        <BigDiscountRate {...goods} />
        <GoodsBadges goods={goods} mt={9} />
        <ReviewStarScore {...goods} />
    </Div>

const MediumContent = React.memo(({goods, showProducerNm, hideLocalfoodFarmerName, onLocalfoodFarmerNameClick}) => {

    const eventName = ComUtil.getGoodsEventName(goods)
    return(
        <Div mt={10}>
            {
                showProducerNm && <Div fg={'green'} fontSize={13}>{goods.producerFarmNm}</Div>
            }
            {/* 로컬푸드 농가명은 보이지 않게 처리 함 */}
            {/*{*/}
            {/*    (goods.localfoodFarmerNo > 0 && goods.localfoodFarmer && !hideLocalfoodFarmerName) ?*/}
            {/*        <Div onClick={onLocalfoodFarmerNameClick} fontSize={12.5} bold*/}
            {/*             mt={1}>{goods.localfoodFarmer.farmerName} ></Div> : null*/}
            {/*}*/}
            {/*<GridColumns repeat={1} colGap={0} rowGap={8}>*/}
            {/*{*/}
            {/*    (goods.localfoodFarmerNo || goods.objectUniqueFlag) && <LocalfoodIconCard goods={goods}/>*/}
            {/*}*/}
            {
                eventName && <GoodsBadges eventName={eventName} style={{marginBottom: getValue(8)}}/>
            }
            <GoodsNm lineClamp={2}>{goods.goodsNm}</GoodsNm>
            {/*</GridColumns>*/}
            {
                goods.discountRate.toFixed(0) > 0 ?
                    <>

                        {
                            //슈퍼리워드 아닐때만 노출
                            (!goods.inSuperRewardPeriod) && (
                                <Div fontSize={13.5} lineHeight={13.5} fg={'dark'} mt={11}>
                                    <strike>{ComUtil.addCommas(goods.consumerPrice)}</strike>
                                </Div>
                            )
                        }
                        <Flex fontSize={17.5} mt={9} lineHeight={20}>
                            {/*<Bold fw={900}>*/}
                            {
                                //슈퍼리워드 아닐때만 노출
                                (!goods.inSuperRewardPeriod) &&
                                <Span fg={'danger'} mr={9} bold>{goods.discountRate.toFixed(0)}%</Span>
                            }
                            <Span bold>{ComUtil.addCommas(goods.currentPrice)}</Span>
                            {/*</Bold>*/}
                            <Div fontSize={14} lineHeight={14} ml={2}>원{(goods.options.length > 1) && '~'}</Div>
                        </Flex>
                    </>
                    :
                    <>
                        <Flex fontSize={17.5} mt={9} lineHeight={20}>
                            {/*<Bold fw={900}>*/}
                            <Span bold>{ComUtil.addCommas(goods.currentPrice)}</Span>
                            {/*</Bold>*/}
                            <Div fontSize={13.5} lineHeight={13.5}
                                 ml={2}>원{(goods.options.length > 1 && !goods.inTimeSalePeriod && !goods.inSuperRewardPeriod) && '~'}</Div>
                        </Flex>
                    </>
            }
            {
                goods.producerWrapDelivered ? (
                    <Flex fg={'dark'} fontSize={12} mt={9}><BsTruck style={{marginRight: 4}}
                                                                    size={14}/>묶음배송{goods.producerNo === 157 &&
                    <Span fontSize={12} fg={'danger'}> &nbsp;옥천/대전 배송</Span>}</Flex>
                ) : goods.termsOfDeliveryFee === 'FREE' ?
                    <Flex fg={'dark'} fontSize={12} mt={9}><BsTruck style={{marginRight: 4}} size={14}/>무료배송</Flex> :
                    goods.buyingRewardFlag ? <Flex fg={'#37ba9d'} fontSize={12} mt={9}>쿠폰</Flex> : null
            }
            <ReviewStarScore avgScore={goods.avgScore} goodsReviewsCount={goods.goodsReviewsCount} />

            {
                (goods.localfoodFarmerNo || goods.objectUniqueFlag) && <LocalfoodIconCard goods={goods} styledStyle={{mt:8}} />
            }
        </Div>
    )
})
const SmallContent = ({goods, showProducerNm}) =>
    <Div mt={16}>
        {
            showProducerNm && <Div fg={'green'} fontSize={13}>{goods.producerFarmNm}</Div>
        }
        <LocalfoodIconCard goods={goods} />
        <GoodsNm>{goods.goodsNm}</GoodsNm>
        {
            goods.discountRate.toFixed(0) > 0 ?
                <>
                    {
                        //슈퍼리워드 아닐때만 노출
                        (!goods.inSuperRewardPeriod) && (
                            <Div fontSize={14} lineHeight={14} fg={'dark'} mt={11}><strike>{ComUtil.addCommas(goods.consumerPrice)}</strike></Div>
                        )
                    }
                    <Flex fontSize={14}>
                        <Bold fw={900}>
                            {
                                //슈퍼리워드 아닐때만 노출
                                (!goods.inSuperRewardPeriod) && <Span fg={'danger'} mr={3}>{goods.discountRate.toFixed(0)}%</Span>
                            }
                            <Span>{ComUtil.addCommas(goods.currentPrice)}</Span>
                        </Bold>
                        <Div>원{(goods.options.length > 1) && '~'}</Div>
                    </Flex>
                </>
                :
                <>
                    <Flex fontSize={14}>
                        <Bold fw={900}>
                            <Span ml={3}>{ComUtil.addCommas(goods.currentPrice)}</Span>
                        </Bold>
                        <Div>원{(goods.options.length > 1) && '~'}</Div>
                    </Flex>
                </>
        }
        <GoodsBadges goods={goods} mt={9} />
        <ReviewStarScore {...goods} />
    </Div>

const DealGoodsContent = ({goods}) =>
    <Div mt={20}>
        <Div fg={'green'} mb={11} fontSize={13}>
            {`${ComUtil.intToDateString(goods.dealStartDate)} ~ ${ComUtil.intToDateString(goods.dealEndDate)}`}
        </Div>
        <LocalfoodIconCard goods={goods} />
        <Div mb={15} lineClamp={2}><b>{goods.goodsNm}</b></Div>
        <Space lineHeight={13} spaceGap={11}>
            <Flex>
                <Span fontSize={12}>최대</Span>
                <Bold fontSize={18} bold fg={'danger'} mx={5}>
                    {
                        5 + ((goods.extraRewards && goods.extraRewards.length > 0) ? goods.extraRewards[goods.extraRewards.length-1].reward : 0)
                    }
                    %
                </Bold>
                <Span fontSize={12}>적립</Span>
            </Flex>
            <Span fg={'dark'}>|</Span>
            <Flex>
                <Bold fontSize={18} bold>
                    {goods.dealCount > 0 ? ComUtil.roundDown(((goods.dealCount / goods.dealMinCount) * 100), 1) : 0}%
                </Bold>
                <Span fontSize={12} ml={5}>달성</Span>
            </Flex>
            <Span fg={'dark'}>|</Span>
            <Flex>
                <Bold fontSize={18} bold fg={'black'}>
                    {goods.dealCount}
                </Bold>
                <Span fontSize={12} ml={5}>개 달성</Span>
            </Flex>
        </Space>
        <Div mt={5}>
            <Bold fw={900} fontSize={20} lineHeight={20} mt={11}>
                {ComUtil.addCommas(goods.currentPrice)} 원 ~
            </Bold>
        </Div>
        <GoodsBadges goods={goods} mt={9} />
        {/*<Div mt={11}>*/}
        {/*<DealProgress.Basic value={goods.dealCount} minValue={goods.dealMinCount} maxValue={goods.dealMaxCount} />*/}
        {/*</Div>*/}
    </Div>


//
// const getGoodsEventName = (goods) => {
//     //포텐타임
//     if (goods.timeSale && goods.inTimeSalePeriod) {
//         return 'POTENTIME'
//     }else if (goods.superReward && goods.inSuperRewardPeriod) {
//         return 'SUPERREWARD'
//     }else if (goods.dealGoods) {
//         return 'DEALGOODS'
//     }
//     return null
// }
//
// // const getGoodsEventBadge = (goods, fontSize) => {
// //     const goodsEventName = getGoodsEventName(goods)
// //     if (goodsEventName === 'POTENTIME') {
// //
// //         let rate;
// //         //상품에 쿠폰마스터 정보가 있다면 포텐타임 할인율 표기
// //         if (goods.potenDiscountRate) {
// //             rate = goods.potenDiscountRate.toFixed(0)
// //         }
// //
// //         return <BigBadge bg={'warning'} fontSize={fontSize}>포텐타임{rate ? ` ${rate}%` : null}</BigBadge>
// //     }else if (goodsEventName === 'SUPERREWARD') {
// //         return <BigBadge bg={'danger'} fontSize={fontSize}>슈퍼리워드</BigBadge>
// //     }else if (goodsEventName === 'DEALGOODS') {
// //         return <BigBadge bg={'warning'} fontSize={fontSize}>쑥쑥</BigBadge>
// //     }
// //     return null
// // }
//
//
// const BADGE_NAME_STORE = {
//     "POTENTIME": '포텐',
//     "SUPERREWARD": "슈퍼",
//     "DEALGOODS": "쑥쑥",
//     "COUPON": "쿠폰",
//     "FREE": "무료배송"
// }
//
// //포텐, 슈퍼, 쑥쑥, 무료배송, 쿠폰
// const GoodsBadges = ({goods, ...rest}) => {
//     const names = []
//     const goodsEventName = getGoodsEventName(goods)
//
//     //이벤트명 (포텐타임, 슈퍼리워드, 쑥쑥)
//     if (goodsEventName) {
//         names.push(goodsEventName)
//     }
//
//     //무료배송
//     if (goods.termsOfDeliveryFee === 'FREE') {
//         names.push('FREE')
//     }
//     //쿠폰
//     if (goods.buyingRewardFlag) {
//         names.push('COUPON')
//     }
//
//     if (names.length === 0) {
//         return null
//     }
//
//     return(
//         <Space spaceGap={8} {...rest}>
//             {
//                 names.map(name =>
//                     <BadgeGoodsEventType goodsEventType={name}>
//                         {BADGE_NAME_STORE[name]}
//                     </BadgeGoodsEventType>
//                 )
//             }
//         </Space>
//     )
// }

//특가딜 상품카드(할인율만 강조되고 가격은 없는 상품카드)
//왼쪽 상단의 배지가 일자가 들어
const SpecialDeal = withRouter(({goods, showProducerNm, maskContent, isWide, //isThumnail,
                                    imageType = TYPE_OF_IMAGE.THUMB, history}) => {

    const onClick = e => {
        e.stopPropagation()
        console.log('parent')
        history.push(`/goods?goodsNo=${goods.goodsNo}`)
    }

    if (!maskContent){
        const goodsStatus = getGoodsStatus(goods)
        if (goodsStatus)
            maskContent = <GoodsStatusContent status={goodsStatus} />
    }

    let leftTopContent;

    //판매종료까지 남은일수
    if (goods.saleEnd) {
        const remainedDays = ComUtil.getDateDiffTextBetweenNowAndFuture(goods.saleEnd, 'DD')

        //판매종료까지 10일 안으로 접어 들었을 경우만 노출
        if (parseFloat(remainedDays.replace(/,/g, '')) <= 10)
            leftTopContent = <BigBadge bg={'danger'} fontSize={13}>{remainedDays}</BigBadge>
    }

    return (
        <Div onClick={onClick} pb={10} cursor={1}>
            <GoodsImage
                {...goods}
                maskContent={maskContent}
                height={isWide ? '50%' : null}
                leftTopContent={leftTopContent}
                // isThumnail={isThumnail}
                imageType={imageType}
            />
            <div style={{marginTop: 8}}>
                <CartButton goods={goods} />
            </div>
            <LargeContent goods={goods} showProducerNm={showProducerNm} />
        </Div>
    );
});

//할인율만 강조되고 가격은 없는 상품카드
//왼쪽 상단의 배지가 포텐타임, 슈퍼리워드 등 이벤트 제목이 들어감
const Large = withRouter(({goods, showProducerNm, maskContent, isWide, //isThumnail,
                              imageType = TYPE_OF_IMAGE.THUMB, history}) => {

    const onClick = e => {
        e.stopPropagation()
        console.log('parent')
        history.push(`/goods?goodsNo=${goods.goodsNo}`)
    }

    if (!maskContent){
        const goodsStatus = getGoodsStatus(goods)
        if (goodsStatus)
            maskContent = <GoodsStatusContent status={goodsStatus} />
    }

    // const leftTopContent = getGoodsEventBadge(goods, 13)

    return (
        <Div onClick={onClick} pb={10} cursor={1}>
            <GoodsImage
                {...goods}
                maskContent={maskContent}
                height={isWide ? '50%' : null}
                // leftTopContent={leftTopContent}
                // isThumnail={isThumnail}
                imageType={imageType}
            />
            <div style={{marginTop: 8}}>
                <CartButton goods={goods} />
            </div>
            <LargeContent goods={goods} showProducerNm={showProducerNm} />
        </Div>
    );
});

//할인율, 가격이 보통크기의 상품카드
//왼쪽 상단의 배지가 포텐타임, 슈퍼리워드 등 이벤트 제목이 들어감
const Medium = withRouter(({goods, showProducerNm, maskContent, isWide, //isThumnail,
                               imageType = TYPE_OF_IMAGE.SQUARE, style,
                               onClick,
                               hideLocalfoodFarmerName,
                               onLocalfoodFarmerNameClick,
                               history}) => {

    const memoGoods = useMemo(() => goods, [])
    const memoMaskContent = useMemo(() => {
        if (!maskContent){
            const goodsStatus = getGoodsStatus(goods)
            if (goodsStatus)
                return <GoodsStatusContent status={goodsStatus} />
        }
        return null
    }, [])

    //상품카드 클릭
    const onHandleClick = useCallback(e => {

        e.stopPropagation()

        if (onClick && typeof onClick === 'function') {
            onClick()
        }else{
            history.push(`/goods?goodsNo=${memoGoods.goodsNo}`)
        }
    }, [])

    //로컬푸드 농가명 클릭
    const onLocalfoodFarmerNameHandleClick = useCallback((e) => {

        e.stopPropagation()

        if (onLocalfoodFarmerNameClick && typeof onLocalfoodFarmerNameClick === 'function') {
            onLocalfoodFarmerNameClick()
        }else{
            history.push(`/local/farmerGoodsList/${memoGoods.localfoodFarmer.localfoodFarmerNo}`)
        }
    }, [])

    // if (!maskContent){
    //     const goodsStatus = getGoodsStatus(goods)
    //     if (goodsStatus)
    //         maskContent = <GoodsStatusContent status={goodsStatus} />
    // }

    // const leftTopContent = getGoodsEventBadge(goods, 15)

    return (
        <div onClick={onHandleClick} cursor={1} pb={10}
             // style={{height: 420}}
             {...style}>
            <GridColumns repeat={1} rowGap={4} colGap={0} >
                <GoodsImage
                    goodsNm={memoGoods.goodsNm}
                    goodsNo={memoGoods.goodsNo}
                    goodsImages={memoGoods.goodsImages}
                    myLike={memoGoods.myLike}
                    maskContent={memoMaskContent}
                    // height={isWide ? `50vmin` : null}
                    height={isWide ? '50%' : null}
                    // leftTopContent={leftTopContent}
                    // isThumnail={isThumnail}
                    imageType={imageType}
                />
                <CartButton goods={memoGoods} />
            </GridColumns>
            <MediumContent goods={memoGoods}
                           showProducerNm={showProducerNm}
                           hideLocalfoodFarmerName={hideLocalfoodFarmerName}
                           onLocalfoodFarmerNameClick={onLocalfoodFarmerNameHandleClick} />
        </div>
    );
});

//할인율, 가격이 작은크기의 상품카드
//왼쪽 상단의 배지가 포텐타임, 슈퍼리워드 등 이벤트 제목이 들어감
const Small = withRouter(({goods, showProducerNm, maskContent, isWide, //isThumnail,
                              imageType = TYPE_OF_IMAGE.THUMB, history}) => {

    const onClick = e => {
        e.stopPropagation()
        console.log('parent')
        history.push(`/goods?goodsNo=${goods.goodsNo}`)
    }

    if (!maskContent){
        const goodsStatus = getGoodsStatus(goods)
        if (goodsStatus)
            maskContent = <GoodsStatusContent status={goodsStatus} />
    }

    // const leftTopContent = getGoodsEventBadge(goods, 15)

    return (
        <Div onClick={onClick} pb={10} cursor={1}>
            <GoodsImage
                {...goods}
                maskContent={maskContent}
                height={isWide ? '50%' : null}
                // leftTopContent={leftTopContent}
                //isThumnail={isThumnail}
                imageType={imageType}
            />
            <div style={{marginTop: 8}}>
                <CartButton goods={goods} />
            </div>
            <SmallContent goods={goods} showProducerNm={showProducerNm} />
        </Div>
    );
});

//쑥쑥 전용 카드
const DealGoods = withRouter(({goods, maskContent, isWide, //isThumnail,
                                  imageType = TYPE_OF_IMAGE.THUMB, history}) => {
    const onClick = e => {
        e.stopPropagation()
        history.push(`/goods?goodsNo=${goods.goodsNo}`)
    }

    // console.log({dealStartDate: goods.dealStartDate, isBefore: moment().isBefore(goods.dealStartDate, 'YYYYMMDDHHmm')})

    if (!maskContent){

        if (goods.saleStopped) {
            maskContent = <GoodsStatusContent status={GOODS_STATUS.SALE_STOPPED} />
        }else if (goods.salePaused) {
            maskContent = <GoodsStatusContent status={GOODS_STATUS.SALE_PAUSED} />
        }
        else if(!goods.remainedCnt || goods.remainedCnt <= 0) {
            maskContent = <GoodsStatusContent status={GOODS_STATUS.SOLD_OUT} />
        }
        else if(goods.dealGoods && goods.dealCount >= goods.dealMaxCount){
            maskContent = <GoodsStatusContent status={GOODS_STATUS.SOLD_OUT} />
        }
        else if (moment().isBefore(moment(goods.dealStartDate, 'YYYYMMDDHHmm'))) {
            maskContent = (
                <div style={{textAlign: 'center'}}>
                    <Div fontSize={20}>{moment(goods.dealStartDate, 'YYYYMMDDHHmm').format('MM[월] DD[일]')}</Div>
                    <Bold fw={'bold'} fontSize={34} bold lineHeight={34} style={{letterSpacing: 2}}>{moment(goods.dealStartDate, 'YYYYMMDDHHmm').format('HH:mm')}</Bold>
                </div>
            )
        }else if (moment().isAfter(moment(goods.dealEndDate, 'YYYYMMDD').endOf('day'))) {
            maskContent = <GoodsStatusContent status={GOODS_STATUS.DEAL_END} />
        }
    }


    if(goods.arGlbFile && goods.arGlbFile.imageUrl) {

    }

    return(
        <Div onClick={onClick} pb={50} cursor={1}>
            <GoodsImage
                {...goods}
                maskContent={maskContent}
                height={isWide ? `55%` : null}
                leftTopContent={(goods.arGlbFile && goods.arGlbFile.imageUrl) ? <img style={{marginLeft: 10, marginTop: 10, width: 40, height: 40}} src={ArImage} alt={'AR지원 상품'} /> : null}
                // leftTopContent={<BigBadge bg={'warning'} fontSize={15}>쑥쑥</BigBadge>}
                //isThumnail={isThumnail}
                imageType={imageType}
            />
            <DealGoodsContent goods={goods} />
        </Div>
    )

})


export default {
    SpecialDeal,
    Large,
    Medium,
    Small,
    DealGoods,
};