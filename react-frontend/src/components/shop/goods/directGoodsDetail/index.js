import React, {Fragment} from 'react'
import ComUtil from '~/util/ComUtil'
import {Fixed} from '~/styledComponents/shared/Layouts'
import {Button} from '~/styledComponents/shared/Buttons'

// import "react-image-gallery/styles/css/image-gallery.css"

import {withRouter} from 'react-router-dom'
// import GoodsContent from "~/components/common/goodsDetail/GoodsContent";
import GoodsContent from "./GoodsContent";
import {Webview} from "~/lib/webviewApi";
import moment from "moment-timezone";
import useLogin from "~/hooks/useLogin";
import FooterButtonGroup from "~/components/shop/goods/components/FooterButtonGroup";


const GoodsDetail = (props) => {

    if(!props.goods) return null

    return(
        <Fragment>
            <GoodsContent goods={props.goods} producer={props.producer} />
            <FooterButtonGroup goods={props.goods}/>
        </Fragment>
    )

}
export default withRouter(GoodsDetail)