import React, { Fragment } from 'react';
import PointToBlyContent from "~/components/common/contents/PointToBlyContent";
import BackNavigation from "~/components/common/navs/BackNavigation";
import {withRouter} from "react-router-dom";

const PointToBly = () => {
    return (
        <Fragment>
            {/*<ShopXButtonNav underline fixed historyBack>적립금(BLY) 전환</ShopXButtonNav>*/}
            <BackNavigation>적립금(BLY) 전환</BackNavigation>
            <PointToBlyContent />
        </Fragment>
    )
}
export default withRouter(PointToBly)