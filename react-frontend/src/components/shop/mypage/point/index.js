import React, { Component, Fragment } from 'react';
import {Div, Span, Button, Flex, Hr, Right, Img, Space} from '~/styledComponents/shared'
import {HrHeavyX2} from '~/styledComponents/mixedIn'
import { getMyTodayReservedPoint, getMyPointList } from '~/lib/pointApi'
import ComUtil from "~/util/ComUtil";
import {autoLoginCheckAndTryAsync} from "~/lib/loginApi";
import {getConsumer} from "~/lib/shopApi";
import Skeleton from '~/components/common/cards/Skeleton'
import icExchange from "~/images/icons/renewal/mypage/2561289-ccw-refresh.png";
import BackNavigation from "~/components/common/navs/BackNavigation";
import InfiniteScroll from "react-infinite-scroll-component";
import BADGE_LIST from "../badge/BadgeList"

export default class Point extends Component {

    constructor(props) {
        super(props)
        this.state = {
            todayReservedPoint: 0,      // 금일 적립예정 포인트
            pointList: [],
            loginUser: {},
            page: 0,
            hasMore: true,
        }
        this.abortController = new AbortController()
    }

    async componentDidMount() {
        const loginUser = await this.refreshCallback(); //로그인 정보 가져오기
        if(loginUser) {
            await this.search();
        }
    }

    componentWillUnmount() {
        this.abortController.abort();
    }

    search = async () => {
        try {
            const {data:todayReservedPoint} = await getMyTodayReservedPoint(this.abortController.signal);

            let addPointList = [];
            this.setState({
                todayReservedPoint: todayReservedPoint,
                pointList: addPointList,
            })

            await this.fetchMoreData(true);
        }catch (error){

        }
    }

    fetchMoreData =  async (isNewSearch) => {

        let params = { page:1, isPaging: true, limit: 10 }
        if (isNewSearch) {
            params.page = 1
        }else{
            params.page = this.state.page + 1
        }

        const {data} = await getMyPointList(params);
        console.log(data);
        const tempList = isNewSearch ? [] : this.state.pointList;
        let dataPointList = data.pointList;

        let addPointList = [];
        if(null !== dataPointList && dataPointList.length > 0) {
            dataPointList.map((item, index) => {
                if (item.todayLoginPoint > 0)
                    addPointList.push({
                        pointName: '로그인',
                        desc: '출석 이벤트',
                        point: item.todayLoginPoint,
                        day: item.day,
                        gubun: 'plus',
                        batchChk: item.batchChk
                    });
                if (item.todayReplyPoint > 0)
                    addPointList.push({
                        pointName: '토크 댓글 작성',
                        desc: '댓글 ' + item.replyCount + '건',
                        point: item.todayReplyPoint,
                        day: item.day,
                        gubun: 'plus',
                        batchChk: item.batchChk
                    });
                if (item.todayReplyPoint < 0)
                    addPointList.push({
                        pointName: '토크 댓글 삭제(blind)',
                        desc: '댓글 ' + item.replyCount + '건',
                        point: (-1 * item.todayReplyPoint),
                        day: item.day,
                        gubun: 'minusReserve',
                        batchChk: item.batchChk
                    });
                if (item.todayWritePoint > 0)
                    addPointList.push({
                        pointName: '토크 게시글 작성',
                        desc: '게시글 ' + item.writeCount + '건',
                        point: item.todayWritePoint,
                        day: item.day,
                        gubun: 'plus',
                        batchChk: item.batchChk
                    });
                if (item.todayWritePoint < 0)
                    addPointList.push({
                        pointName: '토크 게시글 삭제(blind)',
                        desc: '게시글 ' + item.writeCount + '건',
                        point: (-1 * item.todayWritePoint), //- 기호는 아래에서 붙임.
                        day: item.day,
                        gubun: 'minusReserve',
                        batchChk: item.batchChk
                    });
                if (item.voteRewardPoint > 0)
                    addPointList.push({
                        pointName: '토크 Poll 참여',
                        desc: '투표참여 보상',
                        point: item.voteRewardPoint,
                        day: item.day,
                        gubun: 'plus',
                        batchChk: item.batchChk
                    });
                if (item.roulettePoint > 0)
                    addPointList.push({
                        pointName: '도전 룰렛',
                        desc: '도전 룰렛 당첨',
                        point: item.roulettePoint,
                        day: item.day,
                        gubun: 'plus',
                        batchChk: item.batchChk
                    });
                if (item.todayBadgePoint > 0) {
                    // badgeAcquired 리스트 찾아서 상세내역 보여주기.
                    item.badgeAcquired.map((badgeNo, index) => {
                        const selectedBadge = BADGE_LIST.find(badge => badge.no === badgeNo)
                        addPointList.push({
                            pointName: '배지보상',
                            desc: selectedBadge.title,
                            point: selectedBadge.point,
                            day: item.day,
                            gubun: 'plus',
                            batchChk: item.batchChk
                        });
                    })
                }
                if (item.blyPointAmount > 0) {
                    addPointList.push({
                        pointName: '적립금(BLY) 전환',
                        desc: '포인트 사용',
                        point: item.blyPointAmount,
                        day: item.day,
                        gubun: 'minus',
                        batchChk: item.batchChk
                    })
                }
                if(item.specialPoint > 0) {
                    addPointList.push({
                        pointName: item.specialPointName,
                        desc: item.specialDesc,
                        point: item.specialPoint,
                        day: item.day,
                        gubun: 'plus',
                        batchChk: item.batchChk
                    });
                } else if(item.specialPoint < 0) {
                    addPointList.push({
                        pointName: item.specialPointName,
                        desc: item.specialDesc,
                        point: (-1 * item.specialPoint),
                        day: item.day,
                        gubun: 'minusReserve',
                        batchChk: item.batchChk
                    });
                }

                if (item.toCouponAmount < 0) {
                    addPointList.push({
                        pointName: '쿠폰으로 전환',
                        desc: '포인트 사용',
                        point: (-1 * item.toCouponAmount), //- 기호는 아래에서 붙임.
                        day: item.day,
                        gubun: 'minus',
                        batchChk: item.batchChk
                    })
                }
            })
        }

        // 기존행 + 신규행
        let newList = tempList.concat(addPointList)

        ComUtil.sortNumber(newList, 'day', true);

        //console.log({newList});

        //더이상 로딩 되지 않도록
        let hasMore = true;
        if (newList.length >= data.totalCount) {
            hasMore = false;
        }

        this.setState({
            pointList: newList,
            page: params.page,
            hasMore: hasMore
        })

    }

    refreshCallback = async () => {
        try {
            // await autoLoginCheckAndTryAsync(); //push수신시 자동로그인 test : 20200825
            const { data} = await getConsumer(this.abortController.signal);
            if(!data){
                this.abortController.abort()
                this.props.history.replace('/mypage');
                return;
            }

            this.setState({
                loginUser:data
            })

            return {
                loginUser: (data) ? data : null
            }
        }catch (error) {

        }

    }

    onClickPointInfo = () => {
        this.props.history.push('/pointInfo');
    }

    onClickPointToBly = async () => {

        //abuser 차단
        if (await ComUtil.isBlockedAbuser()) {
            alert("보안로직에 의해 현재 동작되지 않습니다.")
            return;
        }
        //this.props.history.push('/pointToBly');
        this.props.history.push({
            pathname: '/kakaoCertCheck',
            state: {
                tokenName: 'pointToBly',
            }
        })
    }

    onClickPointToCoupon = async () => {
        this.props.history.push('/pointToCoupon');
        // this.props.history.push({
        //     pathname: '/kakaoCertCheck',
        //     state: {
        //         tokenName: 'pointToCoupon',
        //     }
        // })
    }

    render() {
        const {pointList} = this.state

        return (
            <Fragment>
                {/*<ShopXButtonNav underline fixed historyBack>포인트</ShopXButtonNav>*/}
                <BackNavigation>포인트</BackNavigation>
                <Div p={15} m={15} bg={'green'} textAlign={'center'}>
                    <Div fg={'white'} fontSize={17}>
                        <Flex mb={10}>
                            <Div>사용가능 포인트</Div>
                            <Right bold fontSize={32}>{ComUtil.addCommas(this.state.loginUser.point)}p</Right>
                        </Flex>
                        <Flex mb={5}>
                            <Div>적립예정 포인트</Div>
                            <Right>{ComUtil.addCommas(this.state.todayReservedPoint)}p</Right>
                        </Flex>
                        <Flex mb={20}>
                            <Right fontSize={11} ml={20}>* 매일 자정 일괄 지급</Right>
                        </Flex>

                        <Hr mb={20} />

                        <Flex justifyContent={'center'}>
                            <Space>
                                {/*2022.02.28:카카오인증 안되는 사용자가 있어서 무조건 쿠폰으로 전환기능 추가*/}
                                <Div textAlign={'center'} fontSize={13} fg={'white'}>
                                    <Img cover width={16} height={14} src={icExchange} alt={'pencil'}/>
                                    <Button bg={'green'} onClick={this.onClickPointToCoupon}>쿠폰전환</Button>
                                </Div>

                                { (this.state.loginUser && !this.state.loginUser.noBlockchain) &&
                                    <Div textAlign={'center'} fontSize={13} fg={'white'}>
                                        <Img cover width={16} height={14} src={icExchange} alt={'pencil'}/>
                                        <Button bg={'green'} onClick={this.onClickPointToBly}>적립금(BLY)전환</Button>
                                    </Div>
                                }
                            </Space>
                        </Flex>
                    </Div>
                </Div>

                <HrHeavyX2 />

                <Div px={15} mb={10}>
                    <Flex my={20}>
                        <Div fontSize={17} bold>포인트 내역</Div>
                        <Right fg={'green'} fontSize={14} cursor={1} onClick={this.onClickPointInfo}>포인트 안내 및 적립 방법 ></Right>
                    </Flex>
                </Div>
                <Hr p={0} />
                <Div>
                    {
                        !pointList ? <Skeleton.List count={4}/> :
                            (pointList.length === 0) ?
                                <Div textAlign={'center'} p={16}>조회 내역이 없습니다.</Div> :
                                <InfiniteScroll
                                    dataLength={pointList.length}
                                    next={this.fetchMoreData.bind(this, false)}
                                    hasMore={this.state.hasMore}
                                    loader={<Skeleton.List count={1} />}
                                    refreshFunction={this.fetchMoreData.bind(this, true)}
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
                                <Div>
                                    {pointList.map((item, index) => {
                                    return (
                                        <Div key={index} p={15}>
                                            <Flex mb={15}>

                                                {item.gubun === 'minusReserve' ? //차감 추가 : 20211115
                                                    <Fragment>
                                                        <Div mr={20} bc={'danger'} fg={'danger'} flexShrink={0} rounded={'50%'} px={12} py={14.5} fontSize={14}>차감</Div>
                                                        <Div>
                                                            <Div fontSize={10} fg={'dark'}>{ComUtil.intToDateString(item.day, 'yyyy-MM-DD')}</Div>
                                                            <Div fontSize={16}>{item.pointName}</Div>
                                                            <Div fontSize={12} fg={'dark'} mt={5}>{item.desc}</Div>
                                                        </Div>
                                                        {item.batchChk ?
                                                            <Right bold fontSize={25} fg={'danger'} flexShrink={0}
                                                                   alignItems={'center'}>- {ComUtil.addCommas(item.point)}
                                                            </Right>
                                                            :
                                                            <Right bold fontSize={25} fg={'secondary'} flexShrink={0}
                                                                   alignItems={'center'}>- {ComUtil.addCommas(item.point)}
                                                                <Span fontSize={15}> (예정)</Span>
                                                            </Right>
                                                        }
                                                    </Fragment>

                                                    : //이하 원래 코드

                                                    <Fragment>
                                                        {item.gubun === 'plus' ?
                                                            <Div mr={20} bc={'primary'} fg={'primary'} flexShrink={0} rounded={'50%'} px={12} py={14.5} fontSize={14}>적립</Div>
                                                            : <Div mr={20} bc={'danger'} fg={'danger'} flexShrink={0} rounded={'50%'} px={12} py={14.5} fontSize={14}>사용</Div>
                                                        }

                                                    <Div>
                                                        <Div fontSize={10} fg={'dark'}>{ComUtil.intToDateString(item.day, 'yyyy-MM-DD')}</Div>
                                                        <Div fontSize={16}>{item.pointName}</Div>
                                                        <Div fontSize={12} fg={'dark'} mt={5}>{item.desc}</Div>
                                                    </Div>

                                                        {item.gubun === 'plus' ?
                                                            (item.batchChk ?
                                                                    <Right bold fontSize={25} fg={'primary'}
                                                                           flexShrink={0}
                                                                           alignItems={'center'}>+ {ComUtil.addCommas(item.point)}
                                                                    </Right>
                                                                    :
                                                                    <Right bold fontSize={25} fg={'secondary'}
                                                                           flexShrink={0}
                                                                           alignItems={'center'}>+ {ComUtil.addCommas(item.point)}
                                                                        <Span fontSize={15}> (예정)</Span>
                                                                    </Right>
                                                            )
                                                            :
                                                            <Right bold fontSize={25} fg={'danger'} flexShrink={0}
                                                                   alignItems={'center'}>- {ComUtil.addCommas(item.point)}</Right>
                                                        }

                                                    </Fragment>

                                                  }
                                            </Flex>
                                            <Hr p={0} />
                                        </Div>
                                        )
                                    })
                                }
                                </Div>
                                </InfiniteScroll>
                    }
                </Div>
            </Fragment>
        )
    }
}