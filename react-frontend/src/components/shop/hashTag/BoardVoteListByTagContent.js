import {useRecoilState} from "recoil";
import {boardTagModalState} from "~/recoilState";
import React, {useCallback, useEffect, useState} from "react";
import {getBoardVoteByTags} from "~/lib/shopApi";
import {Server} from "~/components/Properties";
import {Div} from "~/styledComponents/shared";
import Skeleton from "~/components/common/cards/Skeleton";
import VoteCard from "~/components/common/cards/VoteCard";
import ComUtil from "~/util/ComUtil";
import loadable from "@loadable/component";

const MoreButton = loadable(() => import("./MoreButton"))
const EmptyCard = loadable(() => import("./EmptyCard"))

const BoardVoteListByTagContent = (props) => {
    const [tagModalState, setTagModalState] = useRecoilState(boardTagModalState)
    const [list, setList] = useState()
    const [page, setPage] = useState(0)
    const [totalCount, setTotalCount] = useState(0)

    useEffect(() => {
        search(true)
        console.log("BoardVoteListContainer didmount")
    }, [tagModalState.tag])

    const search = async (isClear) => {

        let params = {isPaging: true, limit: 3, page: isClear ? 1 : page +1}

        const {data} = await getBoardVoteByTags({tags:[tagModalState.tag], ...params})
        console.log({params,data})
        const tempList = isClear ? [] : list || []
        const newList = tempList.concat(data.boardVotes)

        setList(newList)
        setPage(params.page)
        setTotalCount(data.totalCount)

    }

    const onRowClick = () => {
        setTagModalState({
            ...tagModalState,
            isOpen: false
        })
    }

    // const more = () =>
    //     search()

    const getImageUrl = useCallback(() =>
            Server.getImageURL()
        ,[]);


    return(
        <Div>
            {
                !list ?
                    <Skeleton.List count={5} /> :
                    list.length > 0 ? (
                            <>
                                {
                                    list.map((vote) =>
                                        <VoteCard
                                            key={`boardvote${vote.writingId}`}
                                            writingId={vote.writingId}
                                            src1={getImageUrl() + vote.items[0].image.imageUrl}
                                            src2={getImageUrl() + vote.items[1].image.imageUrl}
                                            alt1={vote.items[0].image.imageNm}
                                            alt2={vote.items[1].image.imageNm}
                                            startDate={ComUtil.intToDateString(vote.startDate)}
                                            endDate={ComUtil.intToDateString(vote.endDate)}
                                            title={vote.title}
                                            runningFlag={vote.runningFlag}
                                            onClick={onRowClick}
                                        />

                                    )
                                }
                                {
                                    (list.length < totalCount) && <MoreButton onClick={search.bind(this, false)}>더보기</MoreButton>
                                }
                            </>
                        ) :
                        <EmptyCard url={'/community/boardVoteMain'} onClick={onRowClick}/>
            }
        </Div>
    )
}
export default BoardVoteListByTagContent