import {useRecoilState} from "recoil";
import {boardTagModalState} from "~/recoilState";
import React, {useCallback, useEffect, useState} from "react";
import {getBoardListByTags} from "~/lib/shopApi";
import {Div} from "~/styledComponents/shared";
import Skeleton from "~/components/common/cards/Skeleton";
import BoardList from "~/components/common/lists/BoardList";
import loadable from "@loadable/component";

const MoreButton = loadable(() => import("./MoreButton"))
const EmptyCard = loadable(() => import("./EmptyCard"))

const BoardListByTagContent = (props) => {
    const [tagModalState, setTagModalState] = useRecoilState(boardTagModalState)
    const [list, setList] = useState()
    const [page, setPage] = useState(0)
    const [totalCount, setTotalCount] = useState(0)

    useEffect(() => {
        search(true)
    }, [tagModalState.tag])

    const search = async (isClear) => {

        let params = {isPaging: true, limit: 3, page: isClear ? 1 : page +1}

        const {data} = await getBoardListByTags({tags:[tagModalState.tag], ...params})
        const tempList = isClear ? [] : list || []
        const newList = tempList.concat(data.boards)

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

    return(
        <Div>
            {
                !list ?
                    <Skeleton.List count={5} /> :
                    list.length > 0 ? (
                            <>
                                <BoardList data={list} onRowClick={onRowClick} />
                                {
                                    (list.length < totalCount) && <MoreButton onClick={search.bind(this, false)}>더보기</MoreButton>
                                }
                            </>
                        ) :
                        <EmptyCard url={'/community/boardMain/free'} onClick={onRowClick}/>

            }
        </Div>
    )
}
export default BoardListByTagContent