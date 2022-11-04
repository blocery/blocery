import React, { Fragment } from 'react';
import PointToCouponContent from "~/components/common/contents/PointToCouponContent";
import BackNavigation from "~/components/common/navs/BackNavigation";
import {withRouter} from "react-router-dom";

const PointToCoupon = () => {
    return (
        <Fragment>
            {/*<ShopXButtonNav underline fixed historyBack>적립금(BLY) 전환</ShopXButtonNav>*/}
            <BackNavigation>쿠폰으로 전환</BackNavigation>
            <PointToCouponContent />
        </Fragment>
    )
}
export default withRouter(PointToCoupon)