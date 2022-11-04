import React, {useState} from "react";
import {Div, Divider, GridColumns, Space} from "~/styledComponents/shared";
import Swiper from "react-id-swiper";
import loadable from "@loadable/component";
import Skeleton from "~/components/common/cards/Skeleton";
import {color} from "~/styledComponents/Properties";

//연관검색어
const RelatedTags = loadable(() => import("./RelatedTags"))
//상품테이블 like 로 조회
const GoodsListByKeywordContent = loadable(() => import("./GoodsListByKeywordContent"))
//상품테이블 태그 조회
const GoodsListContent = loadable(() => import("./GoodsListByTagContent"))
//게시판 태그 조회
const BoardListContent = loadable(() => import("./BoardListByTagContent"))
//상품리뷰 태그 조회
const GoodsReviewListContent = loadable(() => import("./GoodsReviewListContent"))
//투 태그 조회
const BoardVoteListContent = loadable(() => import("./BoardVoteListByTagContent"))

const menuStore = [
    '상품', '키워드', '이벤트'
]
const Title = ({children}) => <Div fontSize={17} px={16} pt={16} fw={800}>{children}</Div>

const CombinedSwiperContent = () => {

    const [swiper, setSwiper] = useState(null);
    const [slideIndex, setSlideIndex] = useState(0)

    const [loadedSlideIndexes, setLoadedSlideIndexes] = useState([0])

    const slideTo = (index) => {
        console.log({swiper})
        swiper.slideTo(index);
    }

    const swiperOptions = {
        lazy: true,
        // centeredSlides: true,   //중앙정렬
        // slidesPerView: 4.5,
        // slidesPerView: 'auto',
        // initialSlide: tabId, //디폴트 0
        // freeMode: true,
        on: {
            init: function (swiper) {
                // console.log(this)

                setSwiper(this)
            },
            slideChange: function(){
                const { activeIndex } = this
                setSlideIndex(activeIndex)
                //한번이라도 로드 되었는지 여부. 보이는 슬라이드만 로드(lazy) 시키기 위함
                if(!loadedSlideIndexes.includes(activeIndex)) {
                    setLoadedSlideIndexes(loadedSlideIndexes.concat(activeIndex))
                }

            },
            slideChangeTransitionEnd: function () {

            },
            click: function () {
            },
        }
    }


    return(

        <>

            <RelatedTags />


            <GridColumns repeat={3} colGap={0} rowGap={0} fontSize={17} fw={800}>
                {
                    menuStore.map((menuName, index) =>
                        <Div key={menuName}
                             textAlign={'center'}
                             fg={slideIndex === index ? 'black' : 'dark'}
                             bc={slideIndex === index ? 'green' : 'white'} py={12} cursor
                             bw={3}
                             bt={0} br={0} bl={0} bb={2} onClick={slideTo.bind(this, index)}>
                            <span style={{color: slideIndex === index && color.green}}>
                                #
                            </span>
                            {menuName}
                        </Div>
                    )
                }
            </GridColumns>
            <Swiper
                onSwiper={setSwiper}
                {...swiperOptions}
                // options={{
                //     pagination: {
                //         el: '.swiper-pagination',
                //         spaceBetween: 0
                //     }
                // }}

            >


                <div>
                    <Title>검색상품</Title>
                    <GoodsListByKeywordContent />
                    <Divider />
                    <Title>연관상품</Title>
                    <GoodsListContent />
                </div>
                <div>
                    <Title>게시물</Title>
                    <BoardListContent />
                    <Divider />
                    <Title>리뷰</Title>
                    <GoodsReviewListContent />
                    {/*{*/}
                    {/*    loadedSlideIndexes.includes(1) ?*/}
                    {/*        (*/}
                    {/*            <>*/}
                    {/*                <Title>게시물</Title>*/}
                    {/*                <BoardListContent />*/}
                    {/*                <Divider />*/}
                    {/*                <Title>리뷰</Title>*/}
                    {/*                <GoodsReviewListContent />*/}
                    {/*            </>*/}
                    {/*        )*/}
                    {/*        : <Skeleton.List count={3} />*/}
                    {/*}*/}
                </div>
                <div>
                    <Title>당신의 선택은?</Title>
                    <BoardVoteListContent />
                    {/*{*/}
                    {/*    loadedSlideIndexes.includes(2) ? <BoardVoteListContent /> : <Skeleton.List count={3} />*/}
                    {/*}*/}
                </div>
            </Swiper>
        </>
    )

}

export default CombinedSwiperContent