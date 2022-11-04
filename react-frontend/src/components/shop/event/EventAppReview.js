import React, { Component, Fragment } from 'react'
import { ShopXButtonNav } from '~/components/common'
import BackNavigation from "~/components/common/navs/BackNavigation";

export default class EventAppReview extends Component {

    constructor(props){
        super(props)

    }

    render() {

        return (
            <Fragment>
                {/*<ShopXButtonNav underline historyBack>APP 리뷰 이벤트</ShopXButtonNav>*/}
                <BackNavigation>APP 리뷰 이벤트</BackNavigation>
                <div>
                    <img className="w-100" src="https://blocery.com/images/VUJJK4mjs96H.png" alt={''}/>
                </div>
            </Fragment>
        )
    }
}

