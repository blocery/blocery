import React, {useEffect, useState, useRef} from 'react';
import {Button, Div, Flex, GridColumns} from "~/styledComponents/shared";

import {Title, HashTagList} from './components'
import VerticalGoodsCard from "~/components/common/cards/VerticalGoodsCard";
import {getGoodsByTags} from "~/lib/shopApi";
import ReactIdSwiper from "react-id-swiper";
import {GridList, VerticalGoodsGridList} from "~/styledComponents/ShopBlyLayouts";
import {TYPE_OF_IMAGE} from "~/lib/bloceryConst";
import {Spinner} from "reactstrap";
import {isForceUpdate} from "~/lib/axiosCache";
import {withRouter} from 'react-router-dom'
const SPACE_BETWEEN = 10

const options = {
    lazy: true,
    slidesPerView: 2.3,
    spaceBetween: SPACE_BETWEEN,
    // rebuildOnUpdate: true, //새로운 데이터 로드시 처음부터 읽어들이도록 함(0번째 인덱스로 자동 이동됨)
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
        dynamicBullets: true
    },
    breakpoints: {
        // 1024: {
        //     slidesPerView: 4,
        //     spaceBetween: 40
        // },
        768: {
            slidesPerView: 4.3,
            spaceBetween: SPACE_BETWEEN
        },
        640: {
            slidesPerView: 3.3,
            spaceBetween: SPACE_BETWEEN
        },
        320: {
            slidesPerView: 2.3,
            spaceBetween: SPACE_BETWEEN
        }
    },
}

//상품이 스와이프되어 나오는 해시태그 그룹
const Main = withRouter(({hashTagGroup, history}) => {
    const abortControllerRef = useRef(new AbortController());
    const ref = useRef(null);
    // const [searchValue, setSearchValue] = useState()
    const [goodsList, setGoodsList] = useState()

    useEffect(() => {
        return(() => {
            abortControllerRef.current.abort()
        })
    }, [])



    const search = async (tags, forceUpdate) => {

        // console.log("isForceUpdate",isForceUpdate(history))
        console.log({tags: tags, localfoodProducerNo: hashTagGroup.localfoodProducerNo || 0, isGroupTag: true, forceUpdate: forceUpdate, signal: abortControllerRef.current.signal})
        const {data} = await getGoodsByTags({tags: tags, localfoodProducerNo: hashTagGroup.localfoodProducerNo || 0, isGroupTag: true, forceUpdate: forceUpdate, signal: abortControllerRef.current.signal})
        console.log({data: data})
        setGoodsList(data.goodsList)

        //슬라이드 업데이트
        updateSlides()
    }

    const updateSlides = () => {
        if (ref.current !== null && ref.current.swiper) {

            try {
                const swiper = ref.current.swiper
                console.log(swiper)

                swiper.updateSlides()
                swiper.slideTo(0)

            }catch (err){}
        }
    }

    const onInit = (tags) => {
        // setSearchValue(tags)
        console.log("isForceUpdate:::", isForceUpdate(history))
        search(tags, isForceUpdate(history))
    }

    const onChange = (tags) => {
        // setSearchValue(tags)
        search(tags, true)
    }

    if (!hashTagGroup) return null

    return (
        <div>
            <Title to={`/hashTagGroup?groupNo=${hashTagGroup.groupNo}`}>{hashTagGroup.groupName}</Title>
            <HashTagList hashTags={hashTagGroup.hashTags} hideTags={hashTagGroup.hideTags} onInit={onInit} onChange={onChange}/>
            {
                !goodsList ? <Flex justifyContent={'center'} minHeight={150}><Spinner color={'info'} /></Flex> : (
                    <ReactIdSwiper {...options} ref={ref}>
                        {
                            goodsList && goodsList.map(goods =>
                                <div key={goods.goodsNo} style={{paddingBottom: 20}}>
                                    <VerticalGoodsCard.Medium goods={goods} // isThumnail={true}
                                                              imageType={TYPE_OF_IMAGE.SQUARE} />
                                </div>
                            )
                        }
                    </ReactIdSwiper>
                )
            }
        </div>
    );
});

//상품이 세로로 전체가 뿌려지는 해시태그 그룹
const Detail = withRouter(({hashTagGroup, history}) => {
    const [searchValue, setSearchValue] = useState()
    const [goodsList, setGoodsList] = useState()
    const abortControllerRef = useRef(new AbortController())

    useEffect(() => {
        return(() => abortControllerRef.current.abort())
    }, [])

    useEffect(() => {
        if(searchValue) {
            search()
        }
    }, [searchValue])

    const search = async () => {

        //이미 조회 중인게 있으면 취소
        if (abortControllerRef.current.signal) {
            abortControllerRef.current.abort()
            abortControllerRef.current = new AbortController()
        }

        const {data} = await getGoodsByTags({tags: searchValue, localfoodProducerNo: hashTagGroup.localfoodProducerNo || 0, forceUpdate: isForceUpdate(history), signal: abortControllerRef.current.signal})
        setGoodsList(data.goodsList)
    }

    const onInit = (tags) => {
        setSearchValue(tags)
    }

    const onChange = (tags) => {
        setSearchValue(tags)
    }

    if (!hashTagGroup) return null

    return (
        <div>
            <Div px={16} pt={16}>
                <Title to={`/hashTagGroup?groupNo=${hashTagGroup.groupNo}`}>{hashTagGroup.groupName}</Title>
                <HashTagList hashTags={hashTagGroup.hashTags} hideTags={hashTagGroup.hideTags}  onInit={onInit} onChange={onChange}/>
            </Div>
            <VerticalGoodsGridList>
                {
                    goodsList && goodsList.map(goods =>
                        <VerticalGoodsCard.Medium key={goods.goodsNo} goods={goods} // isThumnail={true}
                                                  imageType={TYPE_OF_IMAGE.SQUARE}
                        />
                    )
                }
            </VerticalGoodsGridList>
        </div>
    );
})

export default {
    Main,
    Detail
}


// const HashTagGroup = ({visiblePage}) => {
//     const [activeIndex, setActiveIndex] = useState(0)
//     const [hashTags, setHashTags] = useState([])
//
//     useEffect(() => {
//         search()
//     }, [])
//
//     const search = async() => {
//         const {data} = await getHashTagGroupListByVisiblePage(visiblePage);
//         setHashTags(data)
//         console.log(data)
//     }
//
//     return (
//         <div>
//             <Title>다이어트에 좋아서!</Title>
//             <HashtagWrapper>
//                 {
//                     [2,3,4,5,6,6,6,6,6,6,4,4,4,4,4,4,4,4].map( _ => <HashTagButton>전체</HashTagButton> )
//                 }
//             </HashtagWrapper>
//             {
//
//             }
//         </div>
//     );
// };
//
// export default HashTagGroup;
