import React, {useState, useEffect} from 'react';
import ShopXButtonNav from "~/components/common/navs/ShopXButtonNav";
import {getMyScrapList} from '~/lib/shopApi'
import {Div} from "~/styledComponents/shared";
import BoardList from "~/components/common/lists/BoardList";
import Skeleton from "~/components/common/cards/Skeleton";
import BackNavigation from "~/components/common/navs/BackNavigation";
import ComUtil from "~/util/ComUtil";
import {EmptyBox} from "~/styledComponents/ShopBlyLayouts";
const ScrapList = (props) => {

    const [boards, setBoards] = useState(null)

    useEffect(() => {
        search()
    }, [])

    const search = async () => {
        const {data} = await getMyScrapList()
        ComUtil.sortNumber(data, 'writingId', true)
        setBoards(data)
    }

    return (
        <>
            {/*<ShopXButtonNav historyBack>내 스크랩</ShopXButtonNav>*/}
            <BackNavigation>내 스크랩</BackNavigation>
            {
                null === boards ?
                    <Skeleton.List count={5} /> : (
                        boards.length <= 0 ? (
                            <EmptyBox>스크랩 내역이 없습니다.</EmptyBox>
                        ) : (
                            <BoardList data={boards}>scrapList</BoardList>
                        )
                    )

            }

        </>
    );
};

export default ScrapList;
