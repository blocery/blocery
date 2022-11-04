import React, {Fragment, useState, useEffect, useRef} from 'react'
import { getLoginUserType } from '~/lib/loginApi'
import { Webview } from '~/lib/webviewApi'
import { SlideItemHeaderImage, SlideItemContent } from '~/components/common/slides'
import { getConsumerFavoriteGoods } from '~/lib/goodsApi'
import { Server } from '~/components/Properties'

// import { GrandTitle } from '~/components/common/texts'
import {EmptyBox, GrandTitle, GridList, VerticalGoodsGridList} from '~/styledComponents/ShopBlyLayouts'
import {IconStore} from '~/components/common/icons'
import {BodyFullHeight} from '~/components/common/layouts'
import {LoginLinkCard} from '~/components/common/cards'
import {Div, GridColumns, Span, Flex} from "~/styledComponents/shared";
import useLogin from "~/hooks/useLogin";
import Skeleton from "~/components/common/cards/Skeleton";
import VerticalGoodsCard from "~/components/common/cards/VerticalGoodsCard";
import styled from "styled-components";
import {getValue} from "~/styledComponents/Util";
import {color} from "~/styledComponents/Properties";
import ModalCheckListGroup from "~/components/common/modals/ModalCheckListGroup";
import {HeaderTitle, ViewButton} from "~/components/common";
import {MdViewModule, MdViewStream} from "react-icons/md";
import ComUtil from "~/util/ComUtil";
import {TYPE_OF_IMAGE} from "~/lib/bloceryConst";
import InfiniteScroll from "react-infinite-scroll-component";
import {Spinner} from "reactstrap";

// const sorters = [ //producersGoodsList에도 존재.
//     {value: 1, label: '최신순', sorter: {direction: 'DESC', property: 'timestamp'}},
//     {value: 2, label: '인기순'},
// ]

const FavoriteGoods = (props) => {
    const abortControllerRef = useRef(new AbortController());
    const {consumer, isLoggedIn, isServerLoggedIn} = useLogin()
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const [goodsList, setGoodsList] = useState()

    useEffect(() => {
        return () => {
            abortControllerRef.current.abort();
        };
    }, [])

    useEffect(() => {
        if (consumer) {
            fetchMoreData(true);
        }
    }, [consumer])

    const fetchMoreData = async (isNewSearch) => {

        let params = {isPaging: true, limit: 15, signal:abortControllerRef.current.signal}

        //새로고침(처음부터 조회)
        if (isNewSearch) {
            params.page = 1
        } else {
            params.page = page + 1
        }
        // data의 producerNo로 producer정보를 조회해서 같이 가져와야 함 (생산자 등급, 농장 이름, 생산자의 전체 상품개수)
        let {data} = await getConsumerFavoriteGoods(params);
        const list = data.goodsList;
        const totalCount = data.totalCount;
        const tempList = isNewSearch ? [] : goodsList

        let newList = tempList.concat(list)

        const newHasMore = newList.length === totalCount ? false : true

        //리스트 추가
        setGoodsList(newList);

        const newPage = list.length ? params.page : page

        //페이지 기록
        setPage(newPage)

        //조회된 총 카운트와 전체 카운트가 맞으면
        if (newList.length >= totalCount) {
            setHasMore(newHasMore)
        }
    }

    //로그인 팝업
    async function onLoginClick() {
        let loginUser = await isServerLoggedIn()
        if (!loginUser ) { //} || !isLoggedIn()) {
            //Webview.openPopup('/login')
        }

        // Webview.openPopup('/login');
        //isLoggedIn()
    }

    //클릭 이벤트
    function onClick(item, type){

        //농장 클릭
        if(type && type === 'farmers')
            // props.history.push('/farmersDetailActivity?producerNo='+item.producerNo)
            props.history.push('/consumersDetailActivity?consumerNo='+(900000000+item.producerNo))
        else
            props.history.push(`/goods?goodsNo=${item.goodsNo}`)
    }

    // function onSorterChange(filter){
    //     // let filteredList = Object.assign([], data)
    //
    //     //정렬
    //     if(filter.label == "최신순") {
    //         //ComUtil.sortNumber(filteredList, 'goodsNo', true)
    //         // setSorter({direction: 'DESC', property: 'goodsNo'})
    //         setSortProperty('goodsNo');
    //     } else if(filter.label == "인기순") {
    //         //ComUtil.sortNumber(filteredList, 'soldCount', true)
    //         // setSorter({direction: 'DESC', property: 'soldCount'})
    //         setSortProperty('soldCount');
    //     }
    // }

    if(!consumer){
        return(
            <BodyFullHeight nav homeTabbar bottomTabbar>
                {/*<div className='d-flex justify-content-center align-items-center h-100 bg-secondary text-white m-2'*/}
                {/*style={{minHeight: 200}}*/}
                {/*>*/}
                {/*<span className='f2 mr-1' onClick={onLoginClick}><u>로그인</u></span><span>하여 단골농장을 추가하세요!</span>*/}
                {/*</div>*/}


                <LoginLinkCard regularList icon description={'로그인 하여 내 단골농장의 상품을 실시간 확인하세요!'} onClick={onLoginClick}/>

            </BodyFullHeight>
        )
    }


    return (
        <Fragment>

            {
                // loading && <BlocerySpinner/>
            }
            {/*<GrandTitle px={16} mt={20}>*/}
            {/*    <div>내 단골 생산자의 실시간 상품</div>*/}
            {/*</GrandTitle>*/}
            <HeaderTitle
                sectionLeft={<Div fontSize={17} bold>내 단골 생산자의 상품</Div>}
                // sectionRight={
                //     <Fragment>
                //         <ModalCheckListGroup
                //             title={'정렬 설정'}
                //             className={'f5 mr-2 text-secondary'}
                //             data={sorters}
                //             value={sorters[0].value}
                //             onChange={onSorterChange}
                //         />
                //         {/*<ViewButton icons={[<MdViewModule />, <MdViewStream />]} onChange={onViewChange} />*/}
                //     </Fragment>
                // }
            />
            <InfiniteScroll
                dataLength={goodsList ? goodsList.length:0}
                next={fetchMoreData}
                hasMore={hasMore}
                loader={<Flex p={16} justifyContent={'center'}><Spinner color="success" /></Flex>}
            >
            {
                (!goodsList || goodsList && goodsList.length==0) &&
                <EmptyBox>단골상품이  없습니다.</EmptyBox>
            }
            {
                (goodsList && goodsList.length > 0) &&
                    <VerticalGoodsGridList p={16}>
                        {
                            //margin 겹침 현상은 parent 객체에 아무 디자인 되지 않았을 경우 top, bottom 에서만 일어남. left, right 는 마짐겹친에 적용되지 않음
                            goodsList.map( goods =>
                                <VerticalGoodsCard.Medium key={goodsList.goodsNo} goods={goods} showProducerNm imageType={TYPE_OF_IMAGE.SQUARE} />
                            )
                        }
                    </VerticalGoodsGridList>
            }
            </InfiniteScroll>
        </Fragment>
    )
}
export default FavoriteGoods