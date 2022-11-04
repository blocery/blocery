import React, { Fragment, useState, useEffect } from 'react'
import { ShopXButtonNav, Sticky } from '../../common'
import {withRouter} from 'react-router-dom'
import {Div, Flex, Space} from "~/styledComponents/shared";
import {useRecoilState} from "recoil";
import {goodsReviewCountTrigger} from "~/recoilState";
import {getWaitingGoodsReviewCount, getGoodsReviewCount} from '~/lib/shopApi'
import ComUtil from "~/util/ComUtil";
import loadable from "@loadable/component";
import BackNavigation from "~/components/common/navs/BackNavigation";
import {BsPinAngle} from "react-icons/bs";
import BOARD_STORE from "~/components/shop/community/BoardStore";

const WrittenList = loadable(() => import("./WrittenList"))
const WaitingList = loadable(() => import("./WaitingList"))

function GoodsReviewList(props){

    const [countTrigger] = useRecoilState(goodsReviewCountTrigger)

    const {match, history} = props
    const [count, setCount] = useState()

    useEffect(() => {
        getAllCount()
    },[countTrigger])

    const getAllCount = async () => {
        const res = await Promise.all([getWaitingGoodsReviewCount(),getGoodsReviewCount()])
        setCount({
            waitingCount: res[0].data,
            writtenCount: res[1].data,
        })
    }

    const onHeaderClick = (selectedTabId) => {
        history.replace(`/goodsReviewList/${selectedTabId}`)
    }

    return(
        <Fragment>
            <Sticky>
                {/*<ShopXButtonNav fixed historyBack>상품후기</ShopXButtonNav>*/}
                <BackNavigation>상품리뷰</BackNavigation>
                <Space px={16} py={8} fontSize={12} spaceGap={8} bg={'background'}>
                    <BsPinAngle />
                    <div>
                        {'기본리뷰 50원, 포토리뷰 100원, VIP이상 더블혜택(적립 2배)'}
                    </div>
                </Space>
                <Flex bg={'white'} px={16} py={16} custom={`
                    & > div:nth-child(1){
                        border-right: 0;
                        border-top-right-radius: 0;
                        border-bottom-right-radius: 0;
                    }
                    & > div:nth-child(2){
                        border-left: 0;
                        border-top-left-radius: 0;
                        border-bottom-left-radius: 0;
                    }
                `}>
                    <HeaderButton active={match.params.tabId === '1'} onClick={onHeaderClick.bind(this, '1')}>작성가능 리뷰{count && `(${ComUtil.addCommas(count.waitingCount)})`}</HeaderButton>
                    <HeaderButton active={match.params.tabId === '2'} onClick={onHeaderClick.bind(this, '2')}>작성완료 리뷰{count && `(${ComUtil.addCommas(count.writtenCount)})`}</HeaderButton>
                </Flex>
            </Sticky>
            {
                (match.params.tabId === '1') && <WaitingList />
            }

            {
                (match.params.tabId === '2') && <WrittenList />
            }


        </Fragment>
    )
}
export default withRouter(GoodsReviewList)

function HeaderButton({children, active, onClick}) {
    return(
        <Div flexGrow={1} py={10} textAlign={'center'} cursor={1}
             bc={'light'}
             bg={active && 'green'} fg={active && 'white'}
             rounded={4}
             onClick={onClick}
        >{children}</Div>
    )
}