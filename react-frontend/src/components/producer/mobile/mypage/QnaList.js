import React, { useState, useEffect } from 'react'
import {Div, Span, Flex} from "~/styledComponents/shared";
import { withRouter} from 'react-router-dom'

import BoardList from "~/components/common/lists/BoardList";
import {getConsumer} from '~/lib/shopApi'
import {getProducerOrderList, getProducerQnaList, setLastSeenOrder, setLastSeenQna} from '~/lib/producerApi'
import BackNavigation from "~/components/common/navs/BackNavigation";
import BoardCard from "~/components/common/cards/BoardCard";
import ComUtil from "~/util/ComUtil";
import ProducerQnaCard from "~/components/producer/mobile/common/ProducerQnaCard";
import {Button} from "reactstrap";
import {HrThin} from "~/styledComponents/mixedIn";
import Skeleton from "~/components/common/cards/Skeleton";
import InfiniteScroll from "react-infinite-scroll-component";
import {EmptyBox} from "~/styledComponents/ShopBlyLayouts";

//private
const ProducerQnaList = ({data, refreshCallback}) => {
    if (data.length <= 0) {
        return <EmptyBox>조회 내역이 없습니다.</EmptyBox>
        // <Div textAlign={'center'} p={16}>조회 내역이 없습니다.</Div>
    }
    return data.map(oneQna => {
            return(
                <ProducerQnaCard
                    key = {oneQna.goodsQnaNo}
                    qaType = {oneQna.qaType}
                    qaKind = {oneQna.qaKind}
                    qaClaimKind = {oneQna.qaClaimKind}
                    qaClaimMethod = {oneQna.qaClaimMethod}
                    qaClaimProcStat = {oneQna.qaClaimProcStat}
                    bankName = {oneQna.bankName}
                    bankAccount = {oneQna.bankAccount}
                    bankAccountHolder = {oneQna.bankAccountHolder}
                    refundAmt = {oneQna.refundAmt}
                    goodsQnaNo = {oneQna.goodsQnaNo}
                    goodsNo = {oneQna.goodsNo}
                    goodsName = {oneQna.goodsName}
                    goodsQue = {oneQna.goodsQue}
                    goodsAns = {oneQna.goodsAns}
                    goodsQueDate = {oneQna.goodsQueDate}
                    goodsImages = {oneQna.goodsImages}
                    goodsQnaStat = {oneQna.goodsQnaStat}
                    producerNo = {oneQna.producerNo}
                    producerName = {oneQna.producerName}
                    farmName = {oneQna.farmName}
                    answerName = {oneQna.answerName}
                    orderSeq = {oneQna.orderSeq}
                    qaImages = {oneQna.qaImages}
                    refreshCallback = {refreshCallback}
                />
            )
        }

    )
};

const QnaList = () => {
    //const [loginUser, setLoginUser] = useState(null)
    const [list, setList] = useState([])

    const [type, setType] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const [page, setPage] = useState(0)

    useEffect(() => {
        fetch();
    }, [type])

    const onTypeChange = (e) => {
        setType(e.target.value); //강제 렌더링- 반영시간 필요해서
        //search()  //=> useEffect (type)이용 호출
    }

    const fetch = async () => {

        // const {data} = await getProducerQnaList(type);
        // setList(data);
        // setLastSeenQna();

        fetchMoreData(true);

        if (type == 0) {
            setLastSeenQna();
        }
    }


    const fetchMoreData = async (isNewSearch) => {

        let params = { type: type, isPaging: true, limit: 10}

        if (isNewSearch) {
            params.page = 1
        }else{
            params.page = page + 1
        }

        const {data} = await getProducerQnaList(params); //by producerNo
        //console.log(data);

        const tempList = isNewSearch ? [] : list
        const newList = tempList.concat(data.goodsQnas)

        setList(newList)
        setPage(params.page)

        //더이상 로딩 되지 않도록
        if (newList.length >= data.totalCount) {
            setHasMore(false)
        }else{
            setHasMore(true)
        }
    }

    return (
        <Div>
            {/*<ShopXButtonNav historyBack fixed underline>내 게시글</ShopXButtonNav>*/}
            <BackNavigation>상품문의</BackNavigation>
            <Flex ml={10} mt={30} mb={20}>
                <Span className='pl-3'>
                    <input defaultChecked type="radio" id="type0" name="typeRadio" onChange={onTypeChange} value={0}/>
                    <label htmlFor="type0" className='pl-1 mr-3 mb-0'>답변대기</label>

                    <input type="radio" id="type1" name="typeRadio" onChange={onTypeChange} value={1} />
                    <label htmlFor="type1" className='pl-1 mr-3 mb-0'>답변완료</label>
                </Span>

            </Flex>
            <HrThin ml={15} />

            {/*<ProducerQnaList data={list} refreshCallback={fetch}/>*/}
            <Div>
                {
                    !list ? <Skeleton.List count={4}/> :
                        <InfiniteScroll
                            dataLength={list.length}
                            next={fetchMoreData.bind(this, false)}
                            hasMore={hasMore}
                            loader={<Skeleton.List count={1} />}
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
                            <ProducerQnaList data={list} refreshCallback={fetch}/>
                        </InfiniteScroll>
                }
            </Div>

        </Div>
    )

}


export default withRouter(QnaList);