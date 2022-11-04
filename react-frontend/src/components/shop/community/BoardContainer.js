import React, {useState, useEffect} from 'react';
import {Div, Flex, Link, ListSpace} from "~/styledComponents/shared";
import {IconNext} from "~/components/common/icons";
import GoodsReviewCard from "~/components/common/cards/GoodsReviewCard";
import {getBoardTopList} from '~/lib/shopApi'
import Skeleton from '~/components/common/cards/Skeleton'
import BoardCard from "~/components/common/cards/BoardCard";
import {Server} from "~/components/Properties";
import ComUtil from "~/util/ComUtil";
import BoardList from "~/components/common/lists/BoardList";

const BoardContainer = ({fetch}) => {

    const [boardList, setBoardList] = useState()

    useEffect(() => {
        search()
    }, [])

    const search = async () => {
        // const data = [{orderSeq: 3000470000},{orderSeq: 3000470000},{orderSeq: 3000470000},{orderSeq: 3000470000},{orderSeq: 3000470000}]
        // 커뮤니티 > 상품리뷰 [전체 최신 상품리뷰 리스트]
        const {data} = await getBoardTopList({boardType: 'all'})
        setBoardList(data)
        //console.log({data})
    }

    return (
        <Div>
            {
                !boardList ? <Skeleton.ProductList count={4} /> : (
                    <BoardList data={boardList} />
                )
            }
        </Div>
    );
};

export default BoardContainer;
