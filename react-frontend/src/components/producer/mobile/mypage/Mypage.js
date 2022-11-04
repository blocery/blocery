import React, {Component, useState, useEffect} from 'react';
import {Div, Flex, Button, Span, GridColumns, Link, Hr, Right, Divider, Space} from '~/styledComponents/shared'
import {getServerToday} from "~/lib/commonApi";
import ComUtil from "~/util/ComUtil";
import moment from "moment-timezone";
import {getProducerMenuSummary} from "~/lib/producerApi"
import {FiRefreshCw, FiHeadphones} from "react-icons/fi"
import {FaRegComments} from "react-icons/fa"
import {HiOutlinePencilAlt} from "react-icons/hi"
import BackNavigation from "~/components/common/navs/BackNavigation";
import {withRouter} from "react-router-dom";
import ArrowList from "~/components/common/lists/ArrowList";
import NotificationButton from "~/components/common/buttons/NotificationLinkButton";
import CartLinkButton from "~/components/common/buttons/CartLinkButton";
import styled from "styled-components";
import {color} from '~/styledComponents/Properties'
import useLogin from "~/hooks/useLogin";

const SmallCard = ({children}) =>
    <Flex bg={'white'} rounded={15} shadow={'sm'} doActive
          rounded={15}
          alignItems={'center'}
          justifyContent={'center'}
          flexDirection={'column'}
          minHeight={100}
    >{children}</Flex>

const RightContent = ({history}) => {
    return(
        <Flex>
            {/*<SearchButton />*/}
            <NotificationButton />
            <CartLinkButton />
        </Flex>
    )
}

const ItemIcon = styled(Div)`
    border-radius: 50%;
    border: 1px solid ${color.secondary};
    text-align: center;
    margin-bottom: 19px;
    padding: 26px;
    width: 84px;
    height: 84px;
`

const Mypage = () => {
    const [state, setState]= useState({
        newCancelOrder: false,
        newOrder: false,
        newQna: false,
        newReview: false,
        todayCancelCount: 0,
        todayOrderCount: 0,
        todayQnaCount: 0,
        todayReviewCount: 0,
        todaySalePrice: 0,
        totalFeed: 0,
        totalFollower: 0,
        totalGoods: 0
    })
    const [data, setData] = useState([])
    const [loginUser, setLoginUser] = useState({})
    const {consumer} =  useLogin()
    const [menuList, setMenuList] = useState([])

    useEffect(() => {
        async function fetch() {
            await search();
        }
        fetch();
    },[])

    useEffect(() => {
        let initialMenuList = []

        //로컬푸드 생산자에게만 노출
        if (consumer && ComUtil.getProducerNoByConsumerNo(consumer.consumerNo) === 157) {
            initialMenuList = [
                {text: <Span pr={8} >주문현황 대시보드</Span>, to: `/producerDashboard`},
                {text: <Span pr={8} noti={state.newOrder ? 1 : 0}>주문그룹목록 (NEW)</Span>, to: `/mypage/producer/newOrderList/1`},
                {text: <Span pr={8} noti={state.newOrder ? 1 : 0}>주문통합목록</Span>, to: `/mypage/producer/orderList`},
                {text: <Span pr={8} noti={state.newCancelOrder ? 1 : 0}>주문취소목록</Span>, to: `/mypage/producer/cancelList`},
                {text: <>상품목록 </>, to: `/mypage/producer/goodsList`}
            ]
        }else{
            initialMenuList = [
                {text: <Span pr={8} noti={state.newOrder ? 1 : 0}>주문통합목록</Span>, to: `/mypage/producer/orderList`},
                {text: <Span pr={8} noti={state.newCancelOrder ? 1 : 0}>주문취소목록</Span>, to: `/mypage/producer/cancelList`},
                {text: <>상품목록 </>, to: `/mypage/producer/goodsList`}
            ]
        }

        setMenuList(initialMenuList)

    }, [consumer])

    const search = async () => {
        const {data} = await getProducerMenuSummary();    //생산소비자 수치 조회
        setState(data)
    }

    const today = moment().startOf('day')
    return (
        <Div>
            <BackNavigation rightContent={<RightContent />}>생산자메뉴</BackNavigation>

            <Div
                // custom={`
                //     background: linear-gradient(169deg, #5A9367, #4b6f53);
                // `}
                // //bg={'background'}
                px={16} py={20}
            >
                <Flex bg={'veryLight'} p={13} mb={20} rounded={10} fontSize={17}>
                    <Div><b>오늘 통계</b></Div>
                    <Right fg={'green'}>{ComUtil.utcToString(today, "YYYY.MM.DD")}</Right>
                </Flex>

                <Flex p={13} fontSize={15}>
                    <Div bold>결제/주문</Div>
                    <Right><Span fg={'green'} fontSize={28} fw={900}>{ComUtil.addCommas(state.todayOrderCount)}</Span> 건</Right>
                </Flex>
                <Hr  />
                <Flex p={13} fontSize={15}>
                    <Div bold>매출</Div>
                    <Right><Span fg={'green'} fontSize={28} fw={900}>{ComUtil.addCommas(state.todaySalePrice)}</Span> 원</Right>
                </Flex>

                <Flex my={35} justifyContent={'space-evenly'}>
                    <Div textAlign={'center'}>
                        <Link to={`/mypage/producer/cancelList`}>
                            <ItemIcon><FiRefreshCw size={30} /></ItemIcon>
                            <Div fontSize={14} notiTop={-6} noti={state.newCancelOrder ? 1 : 0}>반품/환불/취소</Div>
                        </Link>
                    </Div>
                    <Div textAlign={'center'}>
                        <Link to={'/mypage/producer/qnalist'}>
                            <ItemIcon><FaRegComments size={30} /></ItemIcon>
                            <Div fontSize={14} notiTop={-6} noti={state.newQna ? 1 : 0}>상품문의</Div>
                        </Link>
                    </Div>
                    <Div textAlign={'center'}>
                        <Link to={'/mypage/producer/reviewlist'}>
                            <ItemIcon><HiOutlinePencilAlt size={30} /></ItemIcon>
                            <Div fontSize={14} notiTop={-6} noti={state.newReview ? 1 : 0}>리뷰</Div>
                        </Link>
                    </Div>
                </Flex>

            </Div>

            <Divider />

            <ArrowList data={menuList} />
            <Divider />

            <ArrowList data={[
                {text: <Span pr={8} noti={state.newQna ? 1 : 0}>상품문의</Span>, to: `/mypage/producer/qnalist`},
                {text: <Span pr={8} noti={state.newReview ? 1 : 0}>상품리뷰</Span>, to: `/mypage/producer/reviewlist`},
            ]} />
            <Divider />

            <ArrowList data={[
                {text: <>피드목록 </>, to: `/mypage/producer/feedlist`},
                {text: <>농가소식/생산이력 등록 </>, to: `/mypage/producer/feed`},
            ]} />

        </Div>
    )
}

export default withRouter(Mypage)