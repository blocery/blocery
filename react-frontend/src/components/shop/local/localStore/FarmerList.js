import React, {Fragment, useEffect, useState} from 'react';
import {useParams, useHistory} from "react-router-dom";
import LocalFaq from "~/components/shop/local/home/LocalFaq";
import LocalFarmerCard from "~/components/shop/local/components/LocalFarmerCard";
import {Div, Flex, Link} from "~/styledComponents/shared";
import {getValue} from "~/styledComponents/Util";
import ComUtil from "~/util/ComUtil";
import {getLocalfoodFarmerListPaging} from "~/lib/localfoodApi";
import Skeleton from "~/components/common/cards/Skeleton";
import InfiniteScroll from "react-infinite-scroll-component";
import {Spinner as RsSpinner} from "reactstrap";

const Spinner = <Flex p={16} justifyContent={'center'}><RsSpinner color="success" /></Flex>

const FarmerList = (props) => {

    const {producerNo} = useParams()

    const [farmerList, setFarmerList] = useState([])
    const [hasMore, setHasMore] = useState(true)
    const [page, setPage] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchInit() {

            //히스토리에 저장된 값이 있다면 우선시 한다
            if (props.history.location.state) {
                const {data, page, hasMore} = props.history.location.state
                setFarmerList(data)
                setPage(page)
                setHasMore(hasMore)
            }else{
                await fetchMoreData(true)
            }

            setLoading(false)

        }

        fetchInit()

    }, [])

    const onFarmerClick = (localfoodFarmerNo) => {
        props.history.push(`/local/farmerGoodsList/${localfoodFarmerNo}`)
    }

    const fetchMoreData = async(isNewSearch) => {
        let params = { producerNo: producerNo, isPaging: true, limit: 10}

        if (isNewSearch) {
            params.page = 1
        }else{
            params.page = page + 1
        }

        //TODO farmer + goods필요할듯..
        let {data} = await getLocalfoodFarmerListPaging(params)
        console.log(data)

        const tempList = isNewSearch ? [] : farmerList
        const newList = tempList.concat(data.list)



        setFarmerList(newList)
        setPage(params.page)

        let newHasMore;

        //더이상 로딩 되지 않도록
        if (newList.length >= data.totalCount) {
            newHasMore = false
        }else{
            newHasMore = true
        }

        //최종 로드된 내용을 현재 히스토리 state 에 저장해서, history.goBack() 시 didMount 에서 저장된 history state 를 활용 하도록 한다.
        props.history.replace(undefined, {data: newList, page: params.page, hasMore: newHasMore});

        setHasMore(newHasMore)
    }

    return (
        <Div pb={200}>

            {
                loading ? <Skeleton.List count={4}/> :
                    (farmerList.length === 0) ?
                        <Div textAlign={'center'} p={16}>조회 내역이 없습니다.</Div> :
                        <InfiniteScroll
                            dataLength={farmerList.length}
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
                            {
                                farmerList.map(farmer =>
                                    <LocalFarmerCard key={farmer.localfoodFarmerNo} farmer={farmer} onFarmerClick={onFarmerClick.bind(this, farmer.localfoodFarmerNo)}/>
                                )
                            }
                        </InfiniteScroll>
            }
        </Div>
    );
};

export default FarmerList;
