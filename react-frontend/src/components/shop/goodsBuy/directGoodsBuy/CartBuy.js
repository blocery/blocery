import React, { Component } from 'react'
import { Buy } from '~/components/shop/goodsBuy/directGoodsBuy/index';
import { getGoodsByGoodsNo } from '~/lib/goodsApi'
import { getConsumer, getCartListByConsumerNo } from '~/lib/shopApi'
import ComUtil from '~/util/ComUtil'

export default class CartBuy extends Component {

    constructor(props) {
        super(props);
        this.state = {
            buyType: 'cart',
            consumer: null,
            goods: null
        };
    }

    async componentDidMount() {

        let {data:consumer} = await getConsumer();
        let consumerNo = consumer.consumerNo;

        // 제이든이 만든 장바구니에서 주문내역으로 담는 관련 작업은 다음 이슈때 처리 예정
        // 장바구니에서 구매했을 경우 장바구니테이블에서 선택한 것들만 가져오기
        let { data:cartList } = await getCartListByConsumerNo(consumerNo);
        let goodsList = []

        const result = cartList.map( async (item) => {
            let { data:goods } = await getGoodsByGoodsNo(item.goodsNo);

            //TODO (여기서 혹은 CartList에서 buyingInfo세팅 필요) qty지우고, Goods여려개 + options(.orderCnt) 이용하도록 수정필요. => localStorage에 저장필요.
            //localStorage.setItem("optionGoodsBuyingInfo", JSON.stringify(buyingInfo)) //FooterButtonGroup참조.
            goods.orderCnt = item.qty;


            if(goods.remainedCnt > 0 && ComUtil.utcToTimestamp(goods.saleEnd) > ComUtil.utcToTimestamp(new Date()) && !goods.saleStopped)
                goodsList.push(goods);
        });

        //console.log("goodsList",goodsList);
        // cartList await 처리가 끝난 후 state 적용
        Promise.all(result).then( (response) => {
            this.setState({
                consumer: consumer,
                goods: goodsList
            });
        })
        /*
        this.setState({
            consumer: consumer,
            goods: goodsList
        });
        */

    }


    render() {
        if(!this.state.goods && !this.state.consumer) return null;
        return(
            <Buy goods={ this.state.goods }
                 consumer={ this.state.consumer }
                 buyType={ this.state.buyType }
                 history={ this.props.history }
            />
        )
    }
}




