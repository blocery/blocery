import React, { Component, Fragment } from 'react'
import {Container, Row, Col, Spinner} from 'reactstrap'
import Style from './NotificationList.module.scss'
import ComUtil from '~/util/ComUtil'
import { Webview } from '~/lib/webviewApi'

import {BodyFullHeight} from '~/components/common/layouts'

import { ShopXButtonNav, LoginLinkCard } from '~/components/common/index'

import { getConsumer, getNotificationListByUniqueNo } from '~/lib/shopApi'
import { getProducer } from '~/lib/producerApi'
import { getLoginUserType } from '~/lib/loginApi'

import { toast } from 'react-toastify'     //토스트
import Skeleton from '~/components/common/cards/Skeleton'
import InfiniteScroll from "react-infinite-scroll-component";
import {Div, Flex} from "~/styledComponents/shared";
import BackNavigation from "~/components/common/navs/BackNavigation";
import {EmptyBox} from "~/styledComponents/ShopBlyLayouts";

export default class NotificationList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loginUser : null,
            notificationList: undefined,
            loading: true,
            hasMore: true,
            page: 0
        }
    }

    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
            //className: ''     //클래스를 넣어도 됩니다
        })
    };

    async componentDidMount() {
        const {data: loginUserType} = await getLoginUserType();
        let loginUser = await getConsumer();
        if(!loginUser || !loginUser.data){
            this.props.history.replace('/mypage');
            return;
        }
        const notificationList = await this.getNotificationList(loginUserType, loginUser.data, true);
        this.setState({
            loginUser: (loginUser) ? loginUser.data : '',
            loginUserType: loginUserType,
            notificationList: notificationList,
            loading: false
        })
    }

    fetchMoreData = async(newSearch) => {
        const notificationList = await this.getNotificationList(this.state.loginUserType, this.state.loginUser, newSearch);
        this.setState({
            notificationList: notificationList,
            loading: false
        })
    }

    getNotificationList = async (loginUserType, loginUser, isNewSearch) => {
        let notificationList;
        if(loginUserType === "consumer") {
            let params = {
                uniqueNo: loginUser.consumerNo,
                userType: loginUserType,
                paging: true,
                limit: 20
            }

            if (isNewSearch) {
                params.page = 1
            }else{
                params.page = this.state.page + 1
            }

            const {data} = await getNotificationListByUniqueNo(params);

            const tempList = isNewSearch ? [] : this.state.notificationList;
            const newList = tempList.concat(data.notificationList)

            notificationList = newList

            let hasMore = true;
            if(newList.length >= data.totalCount) {
                hasMore = false;
            }

            this.setState({
                page: params.page,
                hasMore: hasMore
            })
        }

        return notificationList
    }


    onNotificationClick = async (title, refId) => {

        if (title.startsWith('[배송') || title.includes('배송') || title.includes('주문취소')) {
            this.props.history.push('/mypage/orderList');

        }else if (title.includes('주문')) { //주의:생산자용.
            this.props.history.push('/mypage/producer/orderList');
        }

        if (title.includes('단골 상품')) {
            this.props.history.push('/my/favoriteGoodsList');
        }
        if (title.includes('상품문의')) {
            //TODO notification body 에 따라 1(상품문의) or 2(주문문의) 로 링크를 다르게
            this.props.history.push('/mypage/myQA/1');
        }
        if (title.includes('쿠폰')) {
            this.props.history.push('/mypage/couponList');
        }
        if (title.includes('리뷰 댓글 알림')) {
            this.props.history.push(`/goodsReviewList/2`);
        } else if (title.includes('대댓글 알림')) {
            if(refId > 0) {
                this.props.history.push('/community/board/' + refId);
            } else {
                this.props.history.push('/mypage/replyList');
            }
        } else if (title.includes('댓글 알림')) {
            if(refId > 0) {
                this.props.history.push('/community/board/' + refId);
            } else {
                this.props.history.push('/mypage/boardList');
            }
        }

        if (title.includes('생산자')) {
            this.props.history.push('/community/boardMain/producer');
        }
        if (title.includes('BLY')) {
            this.props.history.push('/tokenHistory');
        }
        if (title.includes('결제취소')) { ////주의:생산자용.
            this.props.history.push('/mypage/producer/cancelList');
        }

        if (title.includes('활동배지')) {
            this.props.history.push(`/consumerBadgeList?consumerNo=${this.state.loginUser.consumerNo}`);
        }

        if(title.includes('구매확정')) {  // 작성대기중인 리뷰리스트로 이동
            this.props.history.push(`/goodsReviewList/1`);
        }

    }

    onLoginClick = () => {
        Webview.openPopup('/login');
    }

    render() {

        const data = this.state.notificationList;

        return(
            <Fragment>
                {/*<ShopXButtonNav underline fixed historyBack>알림</ShopXButtonNav>*/}
                <BackNavigation>알림</BackNavigation>

                {
                    this.state.loading ? <Skeleton count={4}/> : (
                        !this.state.loginUserType ? (
                            <BodyFullHeight nav bottomTabbar>
                                <LoginLinkCard icon description={'로그인 후 알림 서비스를 이용 하실 수 있습니다'} onClick={this.onLoginClick} />
                            </BodyFullHeight>
                        ) : (
                            <Div>
                                {/*{*/}
                                {/*    !data ? <Flex justifyContent={'center'} height={'calc(100vh - 56px)'}><Spinner color={'success'} /></Flex> : data.length <= 0 ? <EmptyBox>알림내역이 없습니다.</EmptyBox> : null*/}
                                {/*}*/}
                                {/*{*/}
                                {/*    (data && data.length <= 0) &&*/}
                                {/*    <div className='w-100 h-100 bg-light d-flex justify-content-center align-items-center p-5 text-dark'>{(data===undefined)?'':'알림내역이 없습니다.'}</div>*/}
                                {/*}*/}
                                {
                                    !data ? <Skeleton.List count={5} /> :
                                        data.length > 0 ?
                                            (
                                                <InfiniteScroll
                                                    dataLength={data.length}
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

                                                    {
                                                        data.map(({notificationNo, title, body, uniqueNo, userType, notificationType, notificationDate, refId}, index) => {
                                                            return (

                                                                <Div cursor={1} key={'notificationList' + index}
                                                                     onClick={() => this.onNotificationClick(title, refId)}>
                                                                    <a id="a" className={Style.alert}>
                                                                        <div>{title}</div>
                                                                        <div>{body}</div>
                                                                        <span>{notificationDate && ComUtil.utcToString(notificationDate)}</span>

                                                                    </a>
                                                                </Div>
                                                            )
                                                        })
                                                    }
                                                </InfiniteScroll>
                                            ) :
                                            <EmptyBox>알림내역이 없습니다.</EmptyBox>
                                }
                            </Div>
                        )
                    )
                }

            </Fragment>
        )
    }
}