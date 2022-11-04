import React, { Fragment, useState, useEffect } from 'react'
import {getConsumer, getGoodsReview, getWaitingGoodsReview} from "~/lib/shopApi";
import Skeleton from "~/components/common/cards/Skeleton";
import {Div, ListSpace} from "~/styledComponents/shared";
import GoodsReviewCard from "~/components/common/cards/GoodsReviewCard";
import ComUtil from "~/util/ComUtil";
import WaitingItem from "~/components/shop/goodsReviewList/WaitingItem";
import { Server } from '~/components/Properties'
import {withRouter} from 'react-router-dom'
import useLogin from "~/hooks/useLogin";

const WaitingList = ({history}) => {

    const [noBlockchainUser, setNoBlockchainUser] = useState(false);

    const [list, setList] = useState()
    useEffect(() => {
        searchWaitingList()
    }, [])

    // 작성대기목록
    const searchWaitingList = async () => {
        const {data:loginUser} = await getConsumer();
        setNoBlockchainUser(loginUser.noBlockchain);

        const { data } = await getWaitingGoodsReview();
        console.log({data})
        const sortData = ComUtil.sortDate(data, 'consumerOkDate', true);    // 최근구매확정순으로 Desc로 정렬
        setList(sortData)

    }

    // function onStarClick(goodsReview, score){
    //     console.log({goodsReview, score})
    //     history.push(`/goodsReview?action=I&orderSeq=${goodsReview.orderSeq}&goodsNo=${goodsReview.goodsNo}&score=${score}`)
    // }

    if (!list) return <Skeleton.ProductList count={3} />

    return list.length <= 0 ? null :
        <ListSpace>
            {
                list.map(goodsReview => (
                    <Div key={`goodsReview${goodsReview.orderSeq}`} bc={'light'} bt={0} bl={0} br={0}>
                        <WaitingItem
                            noBlockchainUser={noBlockchainUser}
                            {...goodsReview}
                            // imgUrl={ComUtil.getFirstImageSrc(goodsReview.goodsImages)}
                        />
                    </Div>
                ))
            }
        </ListSpace>

};

export default withRouter(WaitingList);
