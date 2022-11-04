import React from 'react'
import Css from './DetailPaymentInfoCard.module.scss'
import ComUtil from '~/util/ComUtil'
import {Icon} from '~/components/common/icons'
import MathUtil from "~/util/MathUtil";


const DetailPaymentInfoCard = (props) =>
    <div className={Css.paymentInfo}>
        <div className={Css.underline}>결제상세</div>
        <br/>
        <div>
            <div>신용카드</div>
            <div>{ComUtil.toNum(props.won) > 0 ? ComUtil.addCommas(props.won.toFixed(2))+'원' : '-'}</div>
        </div>
        <div>
            <div>BLY</div>
            <div>
                {
                    ComUtil.toNum(props.blct) > 0 ?
                        <>
                        <Icon name={'blocery'} />&nbsp;{ComUtil.addCommas(ComUtil.roundDown(props.blct, 2))} BLY &nbsp;<small>({ComUtil.addCommas(MathUtil.roundHalf(props.blct * props.blctToWon))}원)</small>
                        </> : '-'
                }
                </div>
        </div>
    </div>
export default DetailPaymentInfoCard