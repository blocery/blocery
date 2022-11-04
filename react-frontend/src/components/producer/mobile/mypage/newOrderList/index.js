import React, {useState} from 'react';
import SubGroupOrderList from "./SubGroupOrderList";
import OrderDetailListForPick from "./OrderDetailListForPick";
import BackNavigation from "~/components/common/navs/BackNavigation";
import {Button, Flex, GridColumns, Link} from "~/styledComponents/shared";
import {withRouter} from 'react-router-dom'
const NewOrderList = (props) => {
    const tabId = props.match.params.tabId

    const onTabClick = (id) => {
        props.history.replace(`/mypage/producer/newOrderlist/${id}`)
        window.scrollTo({y: 0})
    }
    return (
        <div>
            <BackNavigation>주문목록(NEW)</BackNavigation>
            <GridColumns repeat={2} colGap={0} rowGap={0} py={10}>
                <Button fg={tabId === '1' && 'green'} onClick={onTabClick.bind(this, 1)}><b>주문목록</b></Button>
                <Button fg={tabId === '2' && 'green'} onClick={onTabClick.bind(this, 2)}><b>주문그룹목록</b></Button>
            </GridColumns>
            {
                tabId === '1' ? <OrderDetailListForPick /> : <SubGroupOrderList />
            }
        </div>
    );
};

export default withRouter(NewOrderList);
