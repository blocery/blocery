import React, { Component } from 'react'
import { Buy } from './index';
import { getGoodsByGoodsNo } from '~/lib/goodsApi'
import { getConsumer } from '~/lib/shopApi'

export default class DirectBuy extends Component {

    constructor(props) {
        super(props);
        this.state = {
            buyType: 'direct',
            consumer: null,
            goods: null,
            gift: false          // 선물하기 여부
        };


        //console.log("DirectBuy[history]",this.props.history);
    }

    async componentDidMount() {

        const { data:consumer } = await getConsumer();


        /* 옵션상품 이전코드
        // 즉시구매 했을 경우 상품 단건 가져오기
        const params = new URLSearchParams(this.props.location.search);
        const goodsNo = params.get('goodsNo');
        const qty = params.get('qty')||1;

        const { data:goods } = await getGoodsByGoodsNo(goodsNo);
        goods.orderCnt = qty;

        // let gift
        // if(params.get('gift') === "false") {
        //     gift = false
        // } else {
        //     gift = true
        // }
        */

        //2022.3.14 옵션상품추가.
        const buyingInfo = localStorage.getItem("optionGoodsBuyingInfo") ? JSON.parse(localStorage.getItem("optionGoodsBuyingInfo")) : null
        const {goodsInfo} = buyingInfo
        /** 참고정보 1
         goodsInfo: {
                11(=goodsNo) : [{optionIndex: 0, orderCnt: 1}, {optionIndex: 1, orderCnt: 1}, ],
                12(=goodsNo): [{optionIndex: 1, orderCnt: 1}]  [DirectBuy에서는 0번째만 사용, 1번째 미사용]
            }
         */

            //TODO 현재 첫번째 상품[0]만 처리중.
            //참고정보 2 : [buyingGoods] = goods의 options정보에 orderCnt가 추가된 goods./////////////////////
        const { data:buyingGoods } = await getGoodsByGoodsNo(Object.keys(goodsInfo)[0]);
        console.log('goodsInfo', goodsInfo);

        //option메타+oderCnt추가 //todo 필요시 FooterGroup으로 이동
        const options = goodsInfo[buyingGoods.goodsNo].map(option => {
            const orgOption = buyingGoods.options.find(go => go.optionIndex === option.optionIndex)

            return {
                ...orgOption,             //상품원본 옵션
                orderCnt: option.orderCnt //주문수량
            }
        })
        buyingGoods.options = options; //orderCnt세팅됨.
        console.log('before vGoods buyingGoods:', buyingGoods)



        //[TODO]리팩토링 :  Buy.js 리팩토링시에는 => DirectBuy 제거 (FooterGroup->OpionBuy로 바로이동 )
        //[TODO 2] : 아래 goodsNm, image, optionGoodsMulti 작업을 FooterButtonGroup에서 하도록


        const gift = buyingInfo.buyingType === 'gift' ? true : false;

            ///////// 옵션상품구매, optionQty 추가 [5,0,4..] => 0번옵션 5개, 1번옵션 0개,  2번옵션 4개..//////////
        if (buyingGoods.optionGoods) {
            //옵션들을 각각 Goods로 가정: 가상Goods
            let virtualGoods = [];

            //가상 goods세팅 for Buy.js그대로 활용: currentPrice(optionPrice),optionName, orderCnt, packCnt, packAmount, packUnit 가상 goods에 세팅
            buyingGoods.options.map((option, idx) => {

                let vGoods = Object.assign({}, buyingGoods);
                vGoods.goodsImages = Object.assign([], buyingGoods.goodsImages); //image array는 deep copy필요

                vGoods.orderCnt = buyingGoods.options[idx].orderCnt;
                vGoods.currentPrice = buyingGoods.options[idx].optionPrice;
                vGoods.optionName = buyingGoods.options[idx].optionName;
                vGoods.optionNum = buyingGoods.options[idx].optionIndex;
                vGoods.packCnt = buyingGoods.options[idx].packCnt;
                vGoods.packAmount = buyingGoods.options[idx].packAmount;
                vGoods.packUnit = buyingGoods.options[idx].packUnit;
                vGoods.deliveryFee = buyingGoods.deliveryFee; // TODO 1 에의해 비어 있음.
                vGoods.deliveryQty = buyingGoods.deliveryQty;
                vGoods.termsOfDeliveryFee = buyingGoods.termsOfDeliveryFee;

                if (option.optionIndex > 0 ) { //옵션번호가 1이상이면 옵션명 추가
                    vGoods.goodsNm = buyingGoods.goodsNm + ' [옵션:' + option.optionName  + ']';

                    if (option.optionImages.length > 0) {//옵션이미지 있으면 세팅.
                        let image = {imageUrl:  option.optionImages[0].imageUrl}
                        vGoods.goodsImages[0] = image;
                    }
                }

                //여러개 동시구매: 마이페이지에서 묶어서 보여줘야 함.
                if (goodsInfo[buyingGoods.goodsNo].length > 1) {
                    console.log("##DirectBuy.optionGoodsMulti true")
                    vGoods.optionGoodsMulti = true;
                }

                if (vGoods.orderCnt == 0) {
                    console.log("###ERROR 항상 orderCnt가 0보다 커야함.")
                }
                else {
                    virtualGoods.push(vGoods);
                }

            })

            console.log('virtualGoods',virtualGoods)

            this.setState({
                consumer: consumer,
                goods: virtualGoods, //option들을 goods로 변환한 가상goods.
                gift: gift
            });

        }else { //일반상품 - 옵션상품이전코드 코멘트
            alert('버전오류: 옴션 상품만 구매가능합니다. 고객센터 문의필요.') //상품컨버전 오류-미발생
            // this.setState({
            //     consumer: consumer,
            //     goods: [goods],
            //     gift: gift
            // });
        }


    }

    render() {
        if(!this.state.goods && !this.state.consumer) return null;

        return (
            <Buy goods={ this.state.goods }
                 consumer={ this.state.consumer }
                 buyType={ this.state.buyType }
                 history={ this.props.history }
                 gift={this.state.gift}
            />
        )
    }
}




