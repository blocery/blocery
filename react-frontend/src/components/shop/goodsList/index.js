import React, {useEffect, useState, useRef} from 'react';
import Filter from "~/components/common/filter";
import {KEY as FILTER_KEY} from "~/components/common/filter/FilterStore";
import FilterUtil from "~/components/common/filter/FilterUtil";
import {getLocalGoodsList} from "~/lib/localfoodApi";
// import {getGoodsList} from "~/lib/shopApi";
import {useHistory} from 'react-router-dom'
import ComUtil from "~/util/ComUtil";
import BasicSelect from "~/components/common/selectBoxes/BasicSelect";
import {Div, Flex, GridColumns, Img, Link, ListBorder, Right, Space} from "~/styledComponents/shared";
import Skeleton from "~/components/common/cards/Skeleton";
import {EmptyBox, VerticalGoodsGridList} from "~/styledComponents/ShopBlyLayouts";
import InfiniteScroll from "react-infinite-scroll-component";
import {Spinner as RsSpinner} from "reactstrap";
import GoodsCard from "~/components/common/cards/GoodsCard";
import {IoIosArrowForward} from "react-icons/io";
import {color} from "~/styledComponents/Properties";
import BackNavigation from "~/components/common/navs/BackNavigation";
import {getValue} from "~/styledComponents/Util";
import {TYPE_OF_IMAGE} from "~/lib/bloceryConst";
import UpsideFilterContent from "~/components/common/filter/UpsideFilterContent";
import {getGoodsList} from "~/lib/shopApi";
import VerticalGoodsCard from "~/components/common/cards/VerticalGoodsCard";

const sorters = [ //producersGoodsList에도 존재.
    {value: 1, label: '최신순', sorter: {direction: 'DESC', property: 'timestamp'}},
    {value: 2, label: '인기순', sorter: {direction: 'DESC', property: 'totalReviewCount'}}, //soldCount는 가상필드라서 백엔드소팅이 어려워 reviewCount이용.
    {value: 4, label: '낮은가격순', sorter: {direction: 'ASC', property: 'currentPrice'}},
    {value: 5, label: '높은가격순', sorter: {direction: 'DESC', property: 'currentPrice'}},
    {value: 7, label: '평점순', sorter: {direction: 'DESC', property: 'avgScore'}},
    {value: 6, label: '할인율순', sorter: {direction: 'DESC', property: 'discountRate'}},
]

const Spinner = <Flex p={16} justifyContent={'center'}><RsSpinner color="success" /></Flex>

//스토어 전체 상품
const GoodsList = (props) => {

    const history = useHistory()

    const [hasMore, setHasMore] = useState(true)
    const [page, setPage] = useState(0)

    //로컬푸드매장 판매상품목록
    const [goodsList, setGoodsList] = useState()
    // const [allList, setAllList] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true)

    const [objectUniqueFlag, setObjectUniqueFlag] = useState(false);
    const [filterInfo, setFilterInfo] = useState()
    const [optionData, setOptionData] = useState()
    const [sortValue, setSortValue] = useState(1)

    useEffect(() => {


        //뒤로 앞으로 버튼을 통해 들어온 경우
        if (history.action === 'REPLACE' || !history.location.state) {
            console.log('=== 신규조회')
            fetchMoreData(true, filterInfo, sortValue)
        } else{

            console.log('=== 있는값 활용', history.location.state)

            //히스토리 state에 저장된 값이 있으면 사용
            const {data, page, filter, optionData, hasMore, sortValue} = Object.assign({}, history.location.state)
            setGoodsList(data)
            setPage(page)
            setSortValue(sortValue)
            setHasMore(hasMore)
            setFilterInfo(filter)
            setOptionData(optionData)
            setLoading(false)
        }
    }, [])

    const fetchMoreData = async (isNewSearch, _filterInfo = filterInfo, _sortValue = sortValue) => {

        let params = {
            isPaging: true,
            limit: 10,
            sorter: (sorters.find(item => Number(item.value) === Number(_sortValue))).sorter,
            goodsFilter: FilterUtil.getFilterParams(_filterInfo) //필터 파리미터의 key : value (data) 추출
        }

        if (isNewSearch) {
            params.page = 1
        }else{
            params.page = page + 1
        }



        let {data} = await getGoodsList(params)
        // let {data} = await getLocalGoodsList(params);
        // let {data} = getGoodsList(params)

        // console.log({data});
        setTotalCount(data.totalCount);

        const tempList = isNewSearch ? [] : goodsList
        const newList = tempList.concat(data.goodsList)
        // const sortedList = getSortedList(newList, sortValue)


        // setAllList(sortedList);
        // console.log('sortedList', sortedList)

        setPage(params.page)

        let newHasMore = false;

        //더이상 로딩 되지 않도록
        if (newList.length >= data.totalCount) {
            // setHasMore(false)
        }else{
            newHasMore = true
            // setHasMore(true)
        }

        setHasMore(newHasMore)


        //페이지에 저장하는 replace 는 setList 전에 수행 되어야 매끄러움
        replaceState(params.page, filterInfo, optionData, newList, data.totalCount, newHasMore, sortValue)

        setGoodsList(newList)

        if (loading) {
            setLoading(false)
        }


        console.log('=== fetchMoreData', {params, hasMore});
    }

    const replaceState = (page, filter, optionData, list, totalCount, hasMore, sortValue) => {
        history.replace(undefined, {page: page, filter: filter, optionData: optionData, data: list, totalCount: totalCount, hasMore: hasMore, sortValue: sortValue})
    }

    //필터 변경시
    const onFilterChange = async (filterInfo, optionObj) => {
        setFilterInfo(filterInfo)
        setOptionData(optionObj)
        await fetchMoreData(true, filterInfo, sortValue)
    }

    const onSorterChange = async e => {
        const value = e.target.value
        setSortValue(value)
        await fetchMoreData(true, filterInfo, value)
    }

    const onFarmerClick = (localfoodFarmerNo) => {
        history.push(`/local/farmerGoodsList/${localfoodFarmerNo}`)
    }

    const mapOfGoodsList = (goods, index) =>
        <VerticalGoodsCard.Medium key={goods.goodsNo} goods={goods} />
        // <div style={{paddingBottom: !goods.localfoodFarmerNo && getValue(16)}}>
        //     <GoodsCard goods={goods} pb={0}/>
        //     {
        //         goods.localfoodFarmerNo ? (
        //             <Flex px={16} py={15} doActive cursor={1} bg={'white'} onClick={onFarmerClick.bind(this, goods.localfoodFarmer.localfoodFarmerNo)}>
        //                 <Space spaceGap={8} fontSize={14}>
        //                     <Img cover rounded={'50%'} width={35} height={35} src={ComUtil.getFirstImageSrc(goods.localfoodFarmer.farmerImages, TYPE_OF_IMAGE.SMALL_SQUARE)} alt={""} />
        //                     <Div bold>{goods.localfoodFarmer.farmerName}</Div>
        //                     <Div fg={'dark'}>{`${goods.localfoodFarmer.mainItems}`}</Div>
        //                 </Space>
        //                 <Right>
        //                     <IoIosArrowForward color={color.dark} size={18} />
        //                 </Right>
        //             </Flex>
        //         ) : null
        //     }
        // </div>

    return (
        <div>
            <BackNavigation showShopRightIcons>상품</BackNavigation>
            {
                //initialFilter 가 처음 로딩 시에만 적용되니 꼭 setLoading(false) 가 마지막에 이루어 져야 함
                !loading && (
                    <Filter
                        pageInfo={{
                            pageName: "스토어 상품검색",
                        }}
                        // style={{borderTop: 0}}
                        visibleFilterKeys={[
                            FILTER_KEY.CATEGORY,
                            // FILTER_KEY.KEYWORD,
                            FILTER_KEY.GOODS_TYPE,
                            FILTER_KEY.FREE_SHIPPING,
                            FILTER_KEY.NOT_SOLD_OUT,
                            FILTER_KEY.GOODS_PRICE,
                            // FILTER_KEY.OBJECT_UNIQUE_FLAG,
                            FILTER_KEY.HASHTAG,
                            FILTER_KEY.THEME_HASHTAG,
                            FILTER_KEY.PRODUCER_WRAP_DELIVERED,
                        ]}
                        onFilterChange={onFilterChange}
                        //초기 세팅 값 사용 하려면 아래와 같이 쓰면 됨
                        initialFilter={filterInfo}
                        initialOption={optionData}
                        upsideFilter={UpsideFilterContent.Keyword}
                        // initialFilter={{
                        //     [FILTER_KEY.FREE_SHIPPING] : getFilterOption(FILTER_KEY.FREE_SHIPPING, 'freeShipping'),
                        //     [FILTER_KEY.GOODS_PRICE] : getFilterOption(FILTER_KEY.GOODS_PRICE, '2')
                        // }}
                    />
                )
            }
            <Flex p={16}>
                <BasicSelect data={sorters} value={sortValue} onChange={onSorterChange} wrapperStyle={{height: 32}}/>
            </Flex>
            {
                goodsList === undefined ? <Skeleton.List count={4}/> :
                    (goodsList.length === 0) ?
                        <EmptyBox>조회 내역이 없습니다.</EmptyBox> :
                        <InfiniteScroll
                            dataLength={goodsList.length}
                            next={fetchMoreData.bind(this, false)}
                            hasMore={hasMore}
                            loader={Spinner}
                            refreshFunction={fetchMoreData.bind(this, true)}
                            pullDownToRefresh
                            pullDownToRefreshThreshold={100}
                            pullDownToRefreshContent={
                                <Div textAlign={'center'} fg={'green'}>
                                    &#8595; 아래로 당겨서 업데이트
                                </Div>
                            }
                            releaseToRefreshContent={
                                <Div textAlign={'center'} fg={'green'}>
                                    &#8593; 업데이트 반영
                                </Div>
                            }
                        >
                            <VerticalGoodsGridList repeat={2} colGap={16} rowGap={30} px={16} pb={50}>
                                {
                                    goodsList.map(mapOfGoodsList)
                                }
                            </VerticalGoodsGridList>
                            {/*<ListBorder pb={50} lastBorder>*/}
                            {/*    {*/}
                            {/*        goodsList.map(mapOfGoodsList)*/}
                            {/*    }*/}
                            {/*</ListBorder>*/}
                        </InfiniteScroll>
            }

        </div>
    );
};


export default GoodsList;
