import React, { useEffect, useRef, useState} from 'react';
import {
    Div,
    Flex,
    GridColumns,
} from "~/styledComponents/shared";
import {useParams, withRouter} from 'react-router-dom'
import {getLocalGoodsList} from "~/lib/localfoodApi";
import Skeleton from "~/components/common/cards/Skeleton";
import InfiniteScroll from "react-infinite-scroll-component";
import BasicSelect from "~/components/common/selectBoxes/BasicSelect";
import {TYPE_OF_IMAGE} from "~/lib/bloceryConst";
import VerticalGoodsCard from "~/components/common/cards/VerticalGoodsCard";
import {Spinner as RsSpinner} from "reactstrap";
import Filter from "~/components/common/filter";
import {EmptyBox, VerticalGoodsGridList} from "~/styledComponents/ShopBlyLayouts";
import {KEY as FILTER_KEY} from '~/components/common/filter/FilterStore'
import FilterUtil from "~/components/common/filter/FilterUtil";
import UpsideFilterContent from '~/components/common/filter/UpsideFilterContent'

const sorters = [
    {value: 1, label: '최신순', sorter: {direction: 'DESC', property: 'timestamp'}},
    {value: 2, label: '인기순', sorter: {direction: 'DESC', property: 'totalReviewCount'}}, //soldCount는 가상필드라서 백엔드소팅이 어려워 reviewCount이용.
    {value: 4, label: '낮은가격순', sorter: {direction: 'ASC', property: 'currentPrice'}},
    {value: 5, label: '높은가격순', sorter: {direction: 'DESC', property: 'currentPrice'}},
    {value: 7, label: '평점순', sorter: {direction: 'DESC', property: 'avgScore'}},
    // {value: 6, label: '할인율순', sorter: {direction: 'DESC', property: 'discountRate'}},
]

const Spinner = <Flex p={16} justifyContent={'center'}><RsSpinner color="success" /></Flex>

//농가상품과 공용으로 쓰이는 중
const LocalGoodsList = ({localfoodFarmerNo, hideLocalfoodFarmerName = false, history}) => {

    const ref = useRef(null);

    //const producerNo = new URLSearchParams(props.location.search).get('producerNo');
    const {producerNo, tabId} = useParams()

    // const onLinkClick = (to) => history.push(to)

    const [hasMore, setHasMore] = useState(true)
    const [page, setPage] = useState(0)

    //로컬푸드매장 판매상품목록
    const [goodsList, setGoodsList] = useState()
    // const [allList, setAllList] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true)

    // const [objectUniqueFlag, setObjectUniqueFlag] = useState(false);
    const [filterInfo, setFilterInfo] = useState()
    const [optionData, setOptionData] = useState()
    const [sortValue, setSortValue] = useState(1)

    useEffect(() => {

        //뒤로 앞으로 버튼을 통해 들어온 경우
        if (history.action === 'REPLACE' || !history.location.state) {
            console.log('*=== 신규조회')
            fetchMoreData(true)
        } else{


            console.log('*=== 있는값 활용', history.location.state)

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
        // const sorter = {direction: 'DESC', property: 'timestamp'}
        let params = {
            isPaging: true,
            limit: 10,
            producerNo: producerNo,
            localfoodFarmerNo: localfoodFarmerNo, //농가번호가 있을 경우 농가판매상품 조회
            sorter: (sorters.find(item => Number(item.value) === Number(_sortValue))).sorter,
            goodsFilter: FilterUtil.getFilterParams(_filterInfo) //필터 파리미터의 key : value (data) 추출
        }

        if (isNewSearch) {
            params.page = 1
        }else{
            params.page = page + 1
        }

        // console.log({params});

        let {data} = await getLocalGoodsList(params);

        // console.log({data});
        setTotalCount(data.totalCount);

        const tempList = isNewSearch ? [] : goodsList
        const newList = tempList.concat(data.goodsList)
        // const sortedList = getSortedList(newList, sortValue)


        // setAllList(sortedList);


        setPage(params.page)

        let newHasMore = false;

        //더이상 로딩 되지 않도록
        if (newList.length >= data.totalCount) {
        }else{
            newHasMore = true
        }

        setHasMore(newHasMore)

        //페이지에 저장하는 replace 는 setList 전에 수행 되어야 매끄러움
        replaceState(params.page, filterInfo, optionData, newList, data.totalCount, newHasMore, sortValue)
        console.log({"3:filterInfo": filterInfo, optionData})

        setGoodsList(newList)

        if (loading) {
            setLoading(false)
        }
    }

    // const checkObjectUniqueFlag = ({target}) => {
    //     const {checked} = target
    //     setObjectUniqueFlag(checked);
    //
    //     const goods = Object.assign([], allList)
    //     if(checked) {
    //         setGoodsList(goods.filter(item => item.objectUniqueFlag))
    //     } else {
    //         setGoodsList(goods);
    //     }
    // }

    const replaceState = (page, filter, optionData, list, totalCount, hasMore, sortValue) => {
        history.replace(undefined, {page: page, filter: filter, optionData: optionData, data: list, totalCount: totalCount, hasMore: hasMore, sortValue: sortValue})
    }

    const onSorterChange = async e => {
        const value = e.target.value
        setSortValue(value)
        await fetchMoreData(true, filterInfo, value)
    }

    //필터 변경시
    const onFilterChange = async (filterInfo, optionObj) => {
        console.log("onFilterChange-===============")
        setFilterInfo(filterInfo)
        setOptionData(optionObj)
        await fetchMoreData(true, filterInfo, sortValue)
    }

    const onFarmerClick = (localfoodFarmerNo) => {
        history.push(`/local/farmerGoodsList/${localfoodFarmerNo}`)
    }

    const mapOfGoodsList = (goods) =>
        <VerticalGoodsCard.Medium key={goods.goodsNo} goods={goods} hideLocalfoodFarmerName={hideLocalfoodFarmerName}/>

    // <div key={goods.goodsNo} style={{borderBottom: `1px solid ${color.light}`}}>
    //     <GoodsCard goods={goods}/>
    //     {
    //         !hideFarmerName && (
    //             <Flex px={16} pb={15} doActive cursor={1} bg={'white'} onClick={onFarmerClick.bind(this, goods.localfoodFarmer.localfoodFarmerNo)}>
    //                 <Space spaceGap={8} fontSize={14}>
    //                     <Img cover rounded={'50%'} width={35} height={35} src={ComUtil.getFirstImageSrc(goods.localfoodFarmer.farmerImages, 'thumb')} alt={""} />
    //                     <Div bold>{goods.localfoodFarmer.farmerName}</Div>
    //                     <Div fg={'dark'}>{`${goods.localfoodFarmer.mainItems}`}</Div>
    //                 </Space>
    //                 <Right>
    //                     <IoIosArrowForward color={color.dark} size={18} />
    //                 </Right>
    //             </Flex>
    //         )
    //     }
    // </div>

    return (
        <Div>
            {/*<HeaderTitle*/}
            {/*    sectionLeft={<Div fontSize={18} bold><Span fg='green'>{totalCount}개</Span> 상품</Div>}*/}
            {/*    sectionRight={*/}
            {/*        <BasicSelect data={sorters} onChange={onSorterChange} wrapperStyle={{height: 32}}/>*/}
            {/*    }*/}
            {/*/>*/}
            {
                //initialFilter 가 처음 로딩 시에만 적용되니 꼭 setLoading(false) 가 마지막에 이루어 져야 함
                !loading && (
                    <Filter
                        pageInfo={{
                            pageName: "로컬푸드 검색",
                            producerNo: producerNo
                        }}
                        visibleFilterKeys={[

                            // FILTER_KEY.GOODS_TYPE,
                            // FILTER_KEY.FREE_SHIPPING,
                            FILTER_KEY.CATEGORY,
                            FILTER_KEY.NOT_SOLD_OUT,
                            // FILTER_KEY.KEYWORD,
                            FILTER_KEY.GOODS_PRICE,
                            FILTER_KEY.OBJECT_UNIQUE_FLAG,
                            // FILTER_KEY.PRODUCER_WRAP_DELIVERED,
                            // FILTER_KEY.HASHTAG,
                            // FILTER_KEY.THEME_HASHTAG,
                        ]}
                        onFilterChange={onFilterChange}
                        //초기 세팅 값 사용 하려면 아래와 같이 쓰면 됨
                        initialFilter={filterInfo}
                        initialOption={optionData}
                        initialOpenKey={!filterInfo && FILTER_KEY.CATEGORY}
                        upsideFilter={() => <div>
                            <UpsideFilterContent.Keyword/>
                        </div>}
                        // initialFilter={{
                        //     [FILTER_KEY.FREE_SHIPPING] : getFilterOption(FILTER_KEY.FREE_SHIPPING, 'freeShipping'),
                        //     [FILTER_KEY.GOODS_PRICE] : getFilterOption(FILTER_KEY.GOODS_PRICE, '2')
                        // }}
                    />
                )
            }

            <Flex p={16} pb={0}>
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
                            <VerticalGoodsGridList>
                                {
                                    goodsList.map(mapOfGoodsList)
                                }
                            </VerticalGoodsGridList>
                        </InfiniteScroll>
            }
        </Div>
    );
};

export default withRouter(LocalGoodsList);