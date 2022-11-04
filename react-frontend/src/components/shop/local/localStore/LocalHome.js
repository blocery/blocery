import React, {Fragment, Suspense, useEffect, useRef, useState} from 'react';
import {Button, Div, Divider, Fixed, Flex, Hr, Img, Link, ListBorder, Space, Span} from "~/styledComponents/shared";
import {getLocalfoodProducer, getLocalGoodsList, getLocalfoodFarmerListByProducerNo} from "~/lib/localfoodApi"
import {getStarredLocalfoodFarmerList} from "~/lib/shopApi";
import {useParams} from "react-router-dom";
import Swiper from "react-id-swiper";
import {Server} from "~/components/Properties";

import LocalMapCard from "~/components/shop/local/components/LocalMapCard";
import ComUtil from "~/util/ComUtil";
import {getValue} from "~/styledComponents/Util";
import {SummerNoteIEditorViewer} from "~/components/common";
import Number from "~/components/common/reactSpring/Number";
import DividedGallery from "~/components/shop/local/components/DividedGallery";
import {RiUser3Fill} from "react-icons/ri";
import {color} from "~/styledComponents/Properties";
import {Bold} from "~/styledComponents/ShopBlyLayouts";
import {LocalFooter, RoundedCountBadge} from "~/components/shop/local/components/Style";
import {RiLeafFill} from 'react-icons/ri'
import styled from 'styled-components'
import GoodsCard from "~/components/common/cards/GoodsCard";
import MoreContent from "~/components/shop/local/components/MoreContent";
import {padding} from "~/styledComponents/CoreStyles";
import {Spinner} from "reactstrap";
import {IoIosArrowForward} from "react-icons/all";
import useScroll from "~/hooks/useScroll";
import {useRecoilState, useRecoilValue} from "recoil";
// import {localDeliveryState} from "~/recoilState";
import FarmerProfile from "~/components/shop/local/components/FarmerProfile";
import {getProfileByConsumerNo} from "~/lib/shopApi";
import ProducerProfileCard from "~/components/common/cards/ProducerProfileCard";
import Profile from "~/components/common/cards/Profile";
import loadable from "@loadable/component";
import axios from "axios";

const MARGIN_BOTTOM = 50

const SubTitle = styled.div`
    font-size: ${getValue(24)};
    ${padding};
    margin-bottom: ${getValue(24)};
    line-height: ${getValue(19)};
    font-weight: bold;
`

const swipeOptions = {
    slidesPerView: 'auto',
    // spaceBetween: 0,
    freeMode: true,
    // slidesPerView: 'auto',
    // lazy: true,
    // // loop: true,
    // spaceBetween: 16,
    // freeMode: true,
    // rebuildOnUpdate: true,  //새로운 데이터 로드시 처음부터 읽어들이도록 함(0번째 인덱스로 자동 이동됨)
    // autoplay: {
    //     delay: 3000,
    //     disableOnInteraction: false
    // },
    // pagination: {
    //     el: '.swiper-pagination'
    // },
    // slidesPerView: 'auto'
    // scrollbar: {
    //     el: '.swiper-scrollbar',
    //     hide: false
    // }
}

// const starredOptions = {
//     lazy: true,
//     pagination: {
//         el: '.swiper-pagination',
//         clickable: true,
//         dynamicBullets: true
//     },
// }

const HashTagGroupContainer = loadable(() => import('../../home/components/HashTagGroupContainer'))       //해시태그 그룹

const LocalHome = (props) => {
    const abortControllerRef = useRef(new AbortController());
    const {producerNo} = useParams()

    //로컬푸드매장 정보 : Producer정보+알파
    const [producer, setProducer] = useState(null)
    const [farmerList, setFarmerList] = useState([])
    const [profile, setProfile] = useState()
    const [starredFarmerList, setStarredFarmerList] = useState([])
    const [totalGoodsCount, setTotalGoodsCount] = useState(0)
    const [selectedLocalfoodFarmerNo, setSelectedLocalfoodFarmerNo] = useState()
    const [loading, setLoading] = useState(true)


    useEffect(() => {

        const signal = abortControllerRef.current.signal

        async function fetch(){

            try{
                const res = await Promise.all([
                    getLocalfoodProducer(producerNo, signal),               //res[0] producer
                    // getStarredLocalfoodFarmerList({producerNo, signal}), //res[1] starred farmerList
                    getProfileByConsumerNo(157 + 900000000, signal)
                ])

                console.log({res})

                const producer = res[0].data
                // const starredFarmerList = res[1].data
                const profile = res[1].data
                // const starredFarmerList = farmerList.filter(farmer => farmer.starred)

                //전체 농가의 상품 리스트, 전체 상품 개수 : 1 농가당 최대 3개 상품만 가져옴(페이징)
                // const {goodsList} = await getGoodsList(farmerList)

                // starredFarmerList.map(farmer => {
                //     farmer.goodsList = goodsList.filter(goods => farmer.localfoodFarmerNo === goods.localfoodFarmerNo)
                // })

                setProducer(producer)
                // setStarredFarmerList(starredFarmerList)
                setProfile(profile)

                // setStarredFarmerList([...starredFarmerList, ...starredFarmerList,...starredFarmerList,...starredFarmerList,...starredFarmerList,...starredFarmerList,...starredFarmerList,...starredFarmerList,...starredFarmerList,...starredFarmerList])
                setTotalGoodsCount(producer.sellingGoodsCount)

                if (starredFarmerList.length > 0)
                    setSelectedLocalfoodFarmerNo(starredFarmerList[0].localfoodFarmerNo)

                setLoading(false)

                console.log({producer, farmerList, starredFarmerList, totalGoodsCount})
            }catch (error) {
                if (error.message === 'canceled') {
                    console.log("Request cancelled : LocalHome")

                }else{
                    console.log("Request error : LocalHome")
                }
            }
        }
        fetch();

        return(() => {
            abortControllerRef.current.abort()
        })

        // searchStarredFarmer();
    }, []);



    //주요 생산자
    async function getFarmerList(producerNo) {
        let {data} = await getLocalfoodFarmerListByProducerNo(producerNo);
        return data
        // return {
        //     farmerList: data,
        //     starredFarmerList: data.filter(farmer => farmer.starred)
        // }

        // farmerList.map(farmer => {
        //
        //     // const filteredGoodsList = goodsList.filter(goods => farmer.localfoodFarmerNo === goods.localfoodFarmerNo)
        //     // farmer.goodsList = filteredGoodsList
        //
        //     if (farmer.starred === true) {
        //         starredFarmerList.push({
        //             farmerImages: farmer.farmerImages,
        //             desc: farmer.desc
        //         })
        //     }
        // })

        // console.log({farmerList, goodsList})

        // setFarmerList(starredFarmerList)
    }

    //로컬푸드 농가의 상품 리스트
    //TODO : 농가가 많아지면 상품을 가져오는게 부하가 걸릴 수 있음
    async function getGoodsList(farmerList) {

        const goodsList = []
        //let totalCount = 0; limit때문에 틀림.

        // const nos = farmerList.map(farmer => farmer.localfoodFarmerNo)
        //
        //로컬푸드 주요농가 + 상품리스트 조회
        const {data} =  await getStarredLocalfoodFarmerList({
            producerNo: producerNo,
        })



        console.time()

        //한 농가당 3개의 상품만 가져 오도록 함
        // await Promise.all(farmerList.map(farmer => getLocalGoodsList({
        //     localfoodFarmerNo: farmer.localfoodFarmerNo,
        //     isPaging: true, limit: 3, page: 1
        // }).then(res => {
        //
        //     const data = res.data
        //
        //     goodsList.push(...data.goodsList)
        //     //totalCount += data.totalCount //농가별 전체 상품 카운트 합계
        // })))


        console.timeEnd()

        return {goodsList} //, totalCount: totalCount}
    }

    const onFarmerClck = (localfoodFarmerNo) => {
        console.log({localfoodFarmerNo})
        setSelectedLocalfoodFarmerNo(localfoodFarmerNo)
    }

    const onMoveFarmerPageClick = () => {
        console.log(selectedFarmer)
        const url = `/local/farmerGoodsList/${selectedFarmer.localfoodFarmerNo}`
        props.history.push(url)
    }


    const selectedFarmer = starredFarmerList.find(farmer => farmer.localfoodFarmerNo === selectedLocalfoodFarmerNo)


    if(!producer || loading) return <Flex minHeight={300} justifyContent={'center'}><Spinner color="success" /></Flex>;



    return (
        <div>
            {/*<Div relative mb={MARGIN_BOTTOM}>*/}
            {/*    <Flex absolute bottom={16} right={16} zIndex={1}>*/}
            {/*        <Space spaceGap={11}>*/}
            {/*            <RoundedCountBadge color={'danger'}>*/}
            {/*                <RiLeafFill/>*/}
            {/*                <div>*/}
            {/*                    상품*/}
            {/*                </div>*/}
            {/*                <Bold bold fontSize={15}>{ComUtil.addCommas(producer.sellingGoodsCount)}</Bold>*/}
            {/*            </RoundedCountBadge>*/}
            {/*            <RoundedCountBadge color={'primary'}>*/}
            {/*                <RiUser3Fill/>*/}
            {/*                <div>*/}
            {/*                    농가*/}
            {/*                </div>*/}
            {/*                <Bold bold fontSize={15}>{ComUtil.addCommas(producer.farmersCount)}</Bold>*/}
            {/*            </RoundedCountBadge>*/}
            {/*        </Space>*/}
            {/*    </Flex>*/}
            {/*    {*/}
            {/*        //0번째 사진*/}
            {/*        producer.profileBackgroundImages.length > 0 && (*/}
            {/*            <img src={Server.getThumbnailURL('widethumb') + producer.profileBackgroundImages[0].imageUrl} style={{width: '100%'}} />*/}
            {/*        )*/}
            {/*    }*/}
            {/*</Div>*/}

            <Profile {...profile} style={{display: 'inline-block', ml: 16, mb: 20, mt: 30}} />

            {/*<Div px={16} mb={MARGIN_BOTTOM} custom={`*/}
            {/*        & img {*/}
            {/*            width: 100%!important;*/}
            {/*        }*/}
            {/*    `}*/}
            {/*>*/}
            {/*    <MoreContent>*/}
            {/*        <SummerNoteIEditorViewer initialValue={producer.shopIntroduce} />*/}
            {/*    </MoreContent>*/}
            {/*</Div>*/}

            <HashTagGroupContainer visiblePage={'local'} producerNo={producerNo} />

            {/*<Div px={16} mb={MARGIN_BOTTOM}>*/}
            {/*    /!* 0번째 사진은 제외 *!/*/}
            {/*    <DividedGallery images={producer.profileBackgroundImages.filter((item, index) => index !== 0)} />*/}
            {/*</Div>*/}

            {/*<Div px={16} mb={MARGIN_BOTTOM}>*/}
            {/*    <SubTitle>주요 특산물</SubTitle>*/}
            {/*    <Div fontSize={17} fw={'lighter'}>{producer.shopMainItems}</Div>*/}
            {/*</Div>*/}


            {/*{*/}
            {/*    starredFarmerList.length > 0 && (*/}
            {/*        <Div mb={MARGIN_BOTTOM}>*/}
            {/*            <Div mb={35}>*/}
            {/*                <SubTitle px={16}>주요 생산자</SubTitle>*/}
            {/*                <Swiper {...swipeOptions}>*/}
            {/*                    {*/}
            {/*                        starredFarmerList.map((farmer, index) =>*/}
            {/*                            <CircleFarmerSlide*/}
            {/*                                key={farmer.localfoodFarmerNo}*/}
            {/*                                ml={index === 0 ? 16 : 0}*/}
            {/*                                mr={16}*/}
            {/*                                // mr={32 + -16*index} //점점 넓어져서 방어코드 추가.*/}
            {/*                                farmerName={farmer.farmerName}*/}
            {/*                                src={ComUtil.getFirstImageSrc(farmer.farmerImages, 'thumb')}*/}
            {/*                                onClick={onFarmerClck.bind(this, farmer.localfoodFarmerNo)}*/}
            {/*                                active={selectedLocalfoodFarmerNo === farmer.localfoodFarmerNo}*/}
            {/*                            />*/}
            {/*                        )*/}
            {/*                    }*/}
            {/*                </Swiper>*/}
            {/*            </Div>*/}

            {/*            {*/}
            {/*                selectedFarmer && (*/}
            {/*                    <div>*/}
            {/*                        <FarmerProfile desc={selectedFarmer.desc} farmerImages={selectedFarmer.farmerImages} />*/}
            {/*                        <Div px={15} py={20} bg={'background'} >*/}
            {/*                            <Div rounded={8} overflow={'hidden'} bg={'white'} custom={`*/}
            {/*                                box-shadow: 0px 5px 15px 0 rgba(0, 0, 0, 0.17);*/}
            {/*                            `}>*/}
            {/*                                {*/}
            {/*                                    selectedFarmer.goodsList && selectedFarmer.goodsList.map(goods =>*/}
            {/*                                        <Fragment key={goods.goodsNo}>*/}
            {/*                                            <GoodsCard goods={goods} />*/}
            {/*                                            <Hr mx={16} bc={'background'}/>*/}
            {/*                                        </Fragment>*/}
            {/*                                    )*/}
            {/*                                }*/}
            {/*                                <Space spaceGap={4} fontSize={14} justifyContent={'center'} minHeight={54} bg={'white'} doActive cursor*/}
            {/*                                       onClick={selectedFarmer.goodsList && selectedFarmer.goodsList.length > 0 ? onMoveFarmerPageClick : null}*/}
            {/*                                >*/}
            {/*                                    {*/}
            {/*                                        selectedFarmer.goodsList && selectedFarmer.goodsList.length > 0 ? (*/}
            {/*                                            <><span>전체보기</span> <IoIosArrowForward /></>*/}
            {/*                                        ) : (*/}
            {/*                                            <span>쌀 한톨도 없어요!</span>*/}
            {/*                                        )*/}
            {/*                                    }*/}

            {/*                                </Space>*/}
            {/*                            </Div>*/}
            {/*                        </Div>*/}
            {/*                    </div>*/}
            {/*                )*/}
            {/*            }*/}
            {/*        </Div>*/}
            {/*    )*/}
            {/*}*/}

            <SubTitle px={16}>위치</SubTitle>
            <LocalMapCard
                title={producer.farmName} addr={producer.shopAddress+' '+producer.shopAddressDetail}
            />

            <LocalFooter>
                - 본 로컬 서비스는 고객님의 배송지 주소를 기반으로 운영이 됩니다. <br/>
                - 현재 로컬푸드 상품은 해당 로컬푸드 인근 지역만 배송을 지원합니다. <br/>
                (추후 전국 빠른배송으로 확대할 예정입니다.)
            </LocalFooter>
        </div>
    )
}

export default LocalHome

/** 생산자 둥근 프로필 사진 박스 **/

const CirclrBox = styled.div`
    position: relative;
    width: ${getValue(65)};
    height: ${getValue(65)};
    transition: 0.2s;
    border-radius: 50%;
    overflow: hidden;
    margin: 0 auto;  
    ${p  => p.active && `
        z-index: 1;
        transform: scale(1.2);
        box-shadow: ${color.white} 0 0 0 2px, ${color.green} 0 0 0 4px;
    `}
`

function CircleFarmerSlide({ml, mr, src, farmerName, onClick, active}) {
    return(
        <Div relative
            // m={16}
             mt={16}
             ml={ml}
             mr={mr}
             onClick={onClick}
             cursor
        >
            <CirclrBox active={active}>
                <Img cover src={src} />
            </CirclrBox>
            <Div fontSize={15} bold mt={16} textAlign={'center'} maxWidth={96}>
                {farmerName}
            </Div>
        </Div>
    )
}


// import React, {Fragment, Suspense, useEffect, useState} from 'react';
// import {Button, Div, Divider, Fixed, Flex, Hr, Img, Link, ListBorder, Space, Span} from "~/styledComponents/shared";
// import {getLocalfoodProducer, getLocalGoodsList, getLocalfoodFarmerListByProducerNo} from "~/lib/localfoodApi"
// import {getStarredLocalfoodFarmerList} from "~/lib/shopApi";
// import {useParams} from "react-router-dom";
// import Swiper from "react-id-swiper";
// import {Server} from "~/components/Properties";
//
// import LocalMapCard from "~/components/shop/local/components/LocalMapCard";
// import ComUtil from "~/util/ComUtil";
// import {getValue} from "~/styledComponents/Util";
// import {SummerNoteIEditorViewer} from "~/components/common";
// import Number from "~/components/common/reactSpring/Number";
// import DividedGallery from "~/components/shop/local/components/DividedGallery";
// import {RiUser3Fill} from "react-icons/ri";
// import {color} from "~/styledComponents/Properties";
// import {Bold} from "~/styledComponents/ShopBlyLayouts";
// import {LocalFooter, RoundedCountBadge} from "~/components/shop/local/components/Style";
// import {RiLeafFill} from 'react-icons/ri'
// import styled from 'styled-components'
// import GoodsCard from "~/components/common/cards/GoodsCard";
// import MoreContent from "~/components/shop/local/components/MoreContent";
// import {padding} from "~/styledComponents/CoreStyles";
// import {Spinner} from "reactstrap";
// import {IoIosArrowForward} from "react-icons/all";
// import useScroll from "~/hooks/useScroll";
// import {useRecoilState, useRecoilValue} from "recoil";
// // import {localDeliveryState} from "~/recoilState";
// import FarmerProfile from "~/components/shop/local/components/FarmerProfile";
// import {getProfileByConsumerNo} from "~/lib/shopApi";
// import ProducerProfileCard from "~/components/common/cards/ProducerProfileCard";
// import Profile from "~/components/common/cards/Profile";
// import loadable from "@loadable/component";
//
// const MARGIN_BOTTOM = 50
//
// const SubTitle = styled.div`
//     font-size: ${getValue(24)};
//     ${padding};
//     margin-bottom: ${getValue(24)};
//     line-height: ${getValue(19)};
//     font-weight: bold;
// `
//
// const swipeOptions = {
//     slidesPerView: 'auto',
//     // spaceBetween: 0,
//     freeMode: true,
//     // slidesPerView: 'auto',
//     // lazy: true,
//     // // loop: true,
//     // spaceBetween: 16,
//     // freeMode: true,
//     // rebuildOnUpdate: true,  //새로운 데이터 로드시 처음부터 읽어들이도록 함(0번째 인덱스로 자동 이동됨)
//     // autoplay: {
//     //     delay: 3000,
//     //     disableOnInteraction: false
//     // },
//     // pagination: {
//     //     el: '.swiper-pagination'
//     // },
//     // slidesPerView: 'auto'
//     // scrollbar: {
//     //     el: '.swiper-scrollbar',
//     //     hide: false
//     // }
// }
//
// // const starredOptions = {
// //     lazy: true,
// //     pagination: {
// //         el: '.swiper-pagination',
// //         clickable: true,
// //         dynamicBullets: true
// //     },
// // }
//
// const HashTagGroupContainer = loadable(() => import('../../home/components/HashTagGroupContainer'))       //해시태그 그룹
//
// const LocalHome = (props) => {
//
//     const {producerNo} = useParams()
//
//     //로컬푸드매장 정보 : Producer정보+알파
//     const [producer, setProducer] = useState(null)
//     const [farmerList, setFarmerList] = useState([])
//     const [profile, setProfile] = useState()
//     const [starredFarmerList, setStarredFarmerList] = useState([])
//     const [totalGoodsCount, setTotalGoodsCount] = useState(0)
//     const [selectedLocalfoodFarmerNo, setSelectedLocalfoodFarmerNo] = useState()
//     const [loading, setLoading] = useState(true)
//
//
//     useEffect(() => {
//         async function fetch(){
//
//
//             const res = await Promise.all([
//                 getLocalfoodProducer(producerNo),               //res[0] producer
//                 //getLocalfoodFarmerListByProducerNo(producerNo),  //res[1] farmerList
//                 getStarredLocalfoodFarmerList({producerNo}), //res[1] starred farmerList
//                 getProfileByConsumerNo(157 + 900000000)
//             ])
//
//             console.log({res})
//
//             const producer = res[0].data
//             // const farmerList = res[1].data
//             const starredFarmerList = res[1].data
//             const profile = res[2].data
//             // const starredFarmerList = farmerList.filter(farmer => farmer.starred)
//
//             //전체 농가의 상품 리스트, 전체 상품 개수 : 1 농가당 최대 3개 상품만 가져옴(페이징)
//             // const {goodsList} = await getGoodsList(farmerList)
//
//             // starredFarmerList.map(farmer => {
//             //     farmer.goodsList = goodsList.filter(goods => farmer.localfoodFarmerNo === goods.localfoodFarmerNo)
//             // })
//
//             setProducer(producer)
//             // setFarmerList(farmerList)
//             setProfile(profile)
//             setStarredFarmerList(starredFarmerList)
//             // setStarredFarmerList([...starredFarmerList, ...starredFarmerList,...starredFarmerList,...starredFarmerList,...starredFarmerList,...starredFarmerList,...starredFarmerList,...starredFarmerList,...starredFarmerList,...starredFarmerList])
//             setTotalGoodsCount(producer.sellingGoodsCount)
//
//             if (starredFarmerList.length > 0)
//                 setSelectedLocalfoodFarmerNo(starredFarmerList[0].localfoodFarmerNo)
//
//             setLoading(false)
//
//             console.log({producer, farmerList, starredFarmerList, totalGoodsCount})
//
//         }
//         fetch();
//         // searchStarredFarmer();
//     }, []);
//
//
//
//     //주요 생산자
//     async function getFarmerList(producerNo) {
//         let {data} = await getLocalfoodFarmerListByProducerNo(producerNo);
//         return data
//         // return {
//         //     farmerList: data,
//         //     starredFarmerList: data.filter(farmer => farmer.starred)
//         // }
//
//         // farmerList.map(farmer => {
//         //
//         //     // const filteredGoodsList = goodsList.filter(goods => farmer.localfoodFarmerNo === goods.localfoodFarmerNo)
//         //     // farmer.goodsList = filteredGoodsList
//         //
//         //     if (farmer.starred === true) {
//         //         starredFarmerList.push({
//         //             farmerImages: farmer.farmerImages,
//         //             desc: farmer.desc
//         //         })
//         //     }
//         // })
//
//         // console.log({farmerList, goodsList})
//
//         // setFarmerList(starredFarmerList)
//     }
//
//     //로컬푸드 농가의 상품 리스트
//     //TODO : 농가가 많아지면 상품을 가져오는게 부하가 걸릴 수 있음
//     async function getGoodsList(farmerList) {
//
//         const goodsList = []
//         //let totalCount = 0; limit때문에 틀림.
//
//         // const nos = farmerList.map(farmer => farmer.localfoodFarmerNo)
//         //
//         //로컬푸드 주요농가 + 상품리스트 조회
//         const {data} =  await getStarredLocalfoodFarmerList({
//             producerNo: producerNo,
//         })
//
//
//
//         console.time()
//
//         //한 농가당 3개의 상품만 가져 오도록 함
//         // await Promise.all(farmerList.map(farmer => getLocalGoodsList({
//         //     localfoodFarmerNo: farmer.localfoodFarmerNo,
//         //     isPaging: true, limit: 3, page: 1
//         // }).then(res => {
//         //
//         //     const data = res.data
//         //
//         //     goodsList.push(...data.goodsList)
//         //     //totalCount += data.totalCount //농가별 전체 상품 카운트 합계
//         // })))
//
//
//         console.timeEnd()
//
//         return {goodsList} //, totalCount: totalCount}
//     }
//
//     const onFarmerClck = (localfoodFarmerNo) => {
//         console.log({localfoodFarmerNo})
//         setSelectedLocalfoodFarmerNo(localfoodFarmerNo)
//     }
//
//     const onMoveFarmerPageClick = () => {
//         console.log(selectedFarmer)
//         const url = `/local/farmerGoodsList/${selectedFarmer.localfoodFarmerNo}`
//         props.history.push(url)
//     }
//
//
//     const selectedFarmer = starredFarmerList.find(farmer => farmer.localfoodFarmerNo === selectedLocalfoodFarmerNo)
//
//
//     if(!producer || loading) return <Flex minHeight={300} justifyContent={'center'}><Spinner color="success" /></Flex>;
//
//
//
//     return (
//         <div>
//             {/*<Div relative mb={MARGIN_BOTTOM}>*/}
//             {/*    <Flex absolute bottom={16} right={16} zIndex={1}>*/}
//             {/*        <Space spaceGap={11}>*/}
//             {/*            <RoundedCountBadge color={'danger'}>*/}
//             {/*                <RiLeafFill/>*/}
//             {/*                <div>*/}
//             {/*                    상품*/}
//             {/*                </div>*/}
//             {/*                <Bold bold fontSize={15}>{ComUtil.addCommas(producer.sellingGoodsCount)}</Bold>*/}
//             {/*            </RoundedCountBadge>*/}
//             {/*            <RoundedCountBadge color={'primary'}>*/}
//             {/*                <RiUser3Fill/>*/}
//             {/*                <div>*/}
//             {/*                    농가*/}
//             {/*                </div>*/}
//             {/*                <Bold bold fontSize={15}>{ComUtil.addCommas(producer.farmersCount)}</Bold>*/}
//             {/*            </RoundedCountBadge>*/}
//             {/*        </Space>*/}
//             {/*    </Flex>*/}
//             {/*    {*/}
//             {/*        //0번째 사진*/}
//             {/*        producer.profileBackgroundImages.length > 0 && (*/}
//             {/*            <img src={Server.getThumbnailURL('widethumb') + producer.profileBackgroundImages[0].imageUrl} style={{width: '100%'}} />*/}
//             {/*        )*/}
//             {/*    }*/}
//             {/*</Div>*/}
//
//             <Profile {...profile} style={{display: 'inline-block', ml: 16, mb: 20, mt: 30}} />
//
//             {/*<Div px={16} mb={MARGIN_BOTTOM} custom={`*/}
//             {/*        & img {*/}
//             {/*            width: 100%!important;*/}
//             {/*        }*/}
//             {/*    `}*/}
//             {/*>*/}
//             {/*    <MoreContent>*/}
//             {/*        <SummerNoteIEditorViewer initialValue={producer.shopIntroduce} />*/}
//             {/*    </MoreContent>*/}
//             {/*</Div>*/}
//
//             <HashTagGroupContainer visiblePage={'local'} producerNo={producerNo} />
//
//             {/*<Div px={16} mb={MARGIN_BOTTOM}>*/}
//             {/*    /!* 0번째 사진은 제외 *!/*/}
//             {/*    <DividedGallery images={producer.profileBackgroundImages.filter((item, index) => index !== 0)} />*/}
//             {/*</Div>*/}
//
//             {/*<Div px={16} mb={MARGIN_BOTTOM}>*/}
//             {/*    <SubTitle>주요 특산물</SubTitle>*/}
//             {/*    <Div fontSize={17} fw={'lighter'}>{producer.shopMainItems}</Div>*/}
//             {/*</Div>*/}
//
//
//             {
//                 starredFarmerList.length > 0 && (
//                     <Div mb={MARGIN_BOTTOM}>
//                         <Div mb={35}>
//                             <SubTitle px={16}>주요 생산자</SubTitle>
//                             <Swiper {...swipeOptions}>
//                                 {
//                                     starredFarmerList.map((farmer, index) =>
//                                         <CircleFarmerSlide
//                                             key={farmer.localfoodFarmerNo}
//                                             ml={index === 0 ? 16 : 0}
//                                             mr={16}
//                                             // mr={32 + -16*index} //점점 넓어져서 방어코드 추가.
//                                             farmerName={farmer.farmerName}
//                                             src={ComUtil.getFirstImageSrc(farmer.farmerImages, 'thumb')}
//                                             onClick={onFarmerClck.bind(this, farmer.localfoodFarmerNo)}
//                                             active={selectedLocalfoodFarmerNo === farmer.localfoodFarmerNo}
//                                         />
//                                     )
//                                 }
//                             </Swiper>
//                         </Div>
//
//                         {
//                             selectedFarmer && (
//                                 <div>
//                                     <FarmerProfile desc={selectedFarmer.desc} farmerImages={selectedFarmer.farmerImages} />
//                                     <Div px={15} py={20} bg={'background'} >
//                                         <Div rounded={8} overflow={'hidden'} bg={'white'} custom={`
//                                             box-shadow: 0px 5px 15px 0 rgba(0, 0, 0, 0.17);
//                                         `}>
//                                             {
//                                                 selectedFarmer.goodsList && selectedFarmer.goodsList.map(goods =>
//                                                     <Fragment key={goods.goodsNo}>
//                                                         <GoodsCard goods={goods} />
//                                                         <Hr mx={16} bc={'background'}/>
//                                                     </Fragment>
//                                                 )
//                                             }
//                                             <Space spaceGap={4} fontSize={14} justifyContent={'center'} minHeight={54} bg={'white'} doActive cursor
//                                                    onClick={selectedFarmer.goodsList && selectedFarmer.goodsList.length > 0 ? onMoveFarmerPageClick : null}
//                                             >
//                                                 {
//                                                     selectedFarmer.goodsList && selectedFarmer.goodsList.length > 0 ? (
//                                                         <><span>전체보기</span> <IoIosArrowForward /></>
//                                                     ) : (
//                                                     <span>쌀 한톨도 없어요!</span>
//                                                     )
//                                                 }
//
//                                             </Space>
//                                         </Div>
//                                     </Div>
//                                 </div>
//                             )
//                         }
//                     </Div>
//                 )
//             }
//
//             <SubTitle px={16}>위치</SubTitle>
//             <LocalMapCard
//                 title={producer.farmName} addr={producer.shopAddress+' '+producer.shopAddressDetail}
//             />
//
//             <LocalFooter>
//                 - 본 로컬 서비스는 고객님의 배송지 주소를 기반으로 운영이 됩니다. <br/>
//                 - 현재 로컬푸드 상품은 해당 로컬푸드 인근 지역에 당일배송만 지원합니다. <br/>
//                 (추후 전국 빠른배송으로 확대할 예정입니다.) <br/>
//                 - 신선한 농산물을 받아볼 수 있는 로컬 서비스는, 2만원 이상부터 주문이
//                 가능합니다.
//             </LocalFooter>
//         </div>
//     )
// }
//
// export default LocalHome
//
// /** 생산자 둥근 프로필 사진 박스 **/
//
// const CirclrBox = styled.div`
//     position: relative;
//     width: ${getValue(65)};
//     height: ${getValue(65)};
//     transition: 0.2s;
//     border-radius: 50%;
//     overflow: hidden;
//     margin: 0 auto;
//     ${p  => p.active && `
//         z-index: 1;
//         transform: scale(1.2);
//         box-shadow: ${color.white} 0 0 0 2px, ${color.green} 0 0 0 4px;
//     `}
// `
//
// function CircleFarmerSlide({ml, mr, src, farmerName, onClick, active}) {
//     return(
//         <Div relative
//             // m={16}
//              mt={16}
//              ml={ml}
//              mr={mr}
//              onClick={onClick}
//              cursor
//         >
//             <CirclrBox active={active}>
//                 <Img cover src={src} />
//             </CirclrBox>
//             <Div fontSize={15} bold mt={16} textAlign={'center'} maxWidth={96}>
//                 {farmerName}
//             </Div>
//         </Div>
//     )
// }
//
