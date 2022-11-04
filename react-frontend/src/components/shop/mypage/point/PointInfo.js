import React, { Component, Fragment } from 'react';
import { ShopXButtonNav } from '~/components/common'
import { Div, Span, Button, Flex, Hr, Right } from '~/styledComponents/shared'
import loadable from "@loadable/component";
import BackNavigation from "~/components/common/navs/BackNavigation";
const PointTable = loadable(() => import('../inviteFriend/layout/PointTable'))

export default class PointInfo extends Component {

    onClickLevelInfo = () => {
        this.props.history.push('/levelInfo');
    }

    render() {
        return (
            <Fragment>
                {/*<ShopXButtonNav underline fixed historyBack>포인트 안내</ShopXButtonNav>*/}
                <BackNavigation>포인트안내</BackNavigation>
                <Div p={30}>
                    <Div fontSize={20} mb={20}>샵블리 포인트 안내</Div>
                    <Div fontSize={15} mb={30} lineHeight={22}>
                        포인트는 <Span fg={'primary'}>샵블리 서비스를 이용하면서 적립할 수 있는 일종의 활동 포인트</Span> 입니다. <br/>
                        포인트는 회원 등급 점수와 연계되어 있어 <u>구매금액 및 활동에 따라 회원 등급이 결정</u>되며, <u>적립금으로 전환하여 상품 구매 시 사용</u>할 수 있습니다.
                    </Div>
                    <Div fontSize={15}>
                        <Flex alignItems={'center'}>
                            <Div fontSize={20} mb={5}>포인트 적립 방법</Div>
                            {/*<Right fontSize={11} fg={'dark'} onClick={this.onClickLevelInfo}><u>회원 등급 안내</u> ></Right>*/}
                        </Flex>

                        <PointTable />

                        <Div mt={20}>
                            <Div fontSize={13} lineHeight={22}>
                                - 샵블리 포인트는 샵블리 회원만 적립/사용이 가능합니다. <br/>
                                - 포인트는 회원 등급과 연계되어 포인트 수치가 올라가면 등급도 함께 올라갑니다. <br/>
                                (단, 포인트를 적립금으로 전환 시 회원 등급이 낮아질 수 있습니다.) <br/>
                                - 적립금 전환은 계정당 일 1회/5,000p 한정 <br/>
                                - 어뷰징 등 불법적인 방법으로 적립이 발견될 시 포인트 회수 및 이용제한 조치로 이용에 어려움이 있을 수 있습니다. <br/>
                                - 유효기간이 만료된 포인트는 자동으로 소멸됩니다.(포인트 획득 후 5년) <br/>
                                - 샵블리 회원을 탈퇴할 경우, 잔여 포인트는 모두 소멸됩니다. <br/>
                                - 포인트와 관련된 이벤트가 운영이 되는 경우 별도로 안내됩니다. <br/>
                                - 포인트 지급 정책은 당사의 사정에 의하여 임의 변경•중단될 수 있습니다.
                            </Div>
                        </Div>
                    </Div>
                </Div>
            </Fragment>
        )
    }
}