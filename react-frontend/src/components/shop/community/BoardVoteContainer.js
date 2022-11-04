import React, {useState, useEffect} from 'react';
import VoteCard from "~/components/common/cards/VoteCard";
import {Div, Flex, Link} from "~/styledComponents/shared";
import {IconNext} from "~/components/common/icons";
import Skeleton from "~/components/common/cards/Skeleton";
import {getBoardVoteList} from "~/lib/shopApi";
import ComUtil from "~/util/ComUtil";
import {Server} from "~/components/Properties";

const imageUrl = Server.getImageURL()

const BoardVoteContainer = (props) => {

    const [boardVoteList, setBoardVoteList] = useState()

    useEffect(() => {
        search()
    }, [])

    const search = async () => {
        // const data = [{orderSeq: 3000470000},{orderSeq: 3000470000},{orderSeq: 3000470000},{orderSeq: 3000470000},{orderSeq: 3000470000}]
        // 커뮤니티 > 상품리뷰 [전체 최신 상품리뷰 리스트]

        const {data} = await getBoardVoteList({isPaging: true, limit: 3, page: 1})
        console.log({data})
        setBoardVoteList(data.boardVotes)
    }

    return (
        <Div mb={16}>
            {
                !boardVoteList ? <Skeleton.ProductList count={4} /> : (
                    boardVoteList.map((vote, index) =>
                        <VoteCard
                            key={`boardvote${index}`}
                            writingId={vote.writingId}
                            src1={imageUrl + vote.items[0].image.imageUrl}
                            src2={imageUrl + vote.items[1].image.imageUrl}
                            alt1={vote.items[0].image.imageNm}
                            alt2={vote.items[1].image.imageNm}
                            startDate={ComUtil.intToDateString(vote.startDate)}
                            endDate={ComUtil.intToDateString(vote.endDate)}
                            title={vote.title}
                            runningFlag={vote.runningFlag}
                        />
                    )
                )
            }
        </Div>
    );
};

export default BoardVoteContainer;
