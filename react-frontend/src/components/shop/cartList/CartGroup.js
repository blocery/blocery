import React, { Fragment, Component } from 'react'
import CartItem from './CartItem'
import CartGroupSummary from './CartGroupSummary'

import { ToastContainer, toast } from 'react-toastify'


import { Div } from '~/styledComponents/shared/Layouts';
import Toast from "~/components/common/toast/Toast";
import {color} from "~/styledComponents/Properties";

class CartGroup extends Component {
    constructor(props){
        super(props)
    }

    //react-toastify
    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
        })
    }

    render() {
        const { producer, cartList, summary, producerWrapDelivered } = this.props
        // console.log('CartGroup:', cartList)

        return (
            <Fragment>
                {
                    cartList.map((cartGoods, index) =>
                        <CartItem
                            history={this.props.history}
                            key={'validCartItem' + index}
                            producer={producer}
                            {...cartGoods}
                            onChange={this.props.onChange}
                        />
                    )
                }



                {/*{producerWrapDelivered && //묶음배송인경우만: "dFarm 묶음배송비" 라고 표시.*/}
                {/*    <Div bg={'background'} fontSize={15} p={3} pt={10}> {producer.farmName} 묶음배송비</Div>*/}
                {/*}*/}
                <CartGroupSummary
                    producer={producer}
                    sumGoodsPrice={summary.sumGoodsPrice}
                    sumDeliveryFee={summary.sumDeliveryFee}
                    //sumReservationDeliveryFee={summary.sumReservationDeliveryFee}
                    result={summary.result}
                    // deliveryDealMsg={summary.deliveryDealMsg}
                    additionalDeliveryInfo={summary.additionalDeliveryFeeInfo}
                />


            </Fragment>
        )
    }
}

export default CartGroup

// function AdditionalDeliveryInfo() {
//     return(
//         <Toast
//             title={'배송비 안내'}
//             bodyStyle={{background: color.white}}
//             content={<ToastContents.AboutDeliveryFee deliveryFee={0} producer={producer}/>}
//             position={'right'}
//         >
//             (<u>{summary.deliveryDealMsg}</u>)
//         </Toast>
//     )
// }