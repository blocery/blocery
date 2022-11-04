import { TERMS_OF_DELIVERYFEE } from '../lib/bloceryConst'
import ComUtil from '~/util/ComUtil'
import MathUtil from "~/util/MathUtil";
import React from 'react'

function getDeliveryFeeTag(goods, producer){
    const {deliveryFee, deliveryQty, termsOfDeliveryFee, localfoodFarmerNo} = goods

    //2208grandOpen 로컬푸드는 무조건 유료: 묶음배송비 출력.
    if (localfoodFarmerNo) {
        return <span><b>{ComUtil.addCommas(producer.producerWrapFee)}원</b></span>
    }

    switch (termsOfDeliveryFee){
        //무료배송없음(기본배송비이며 몇개를 사던지 배송비 동일)
        case TERMS_OF_DELIVERYFEE.NO_FREE :
            return <span><b>{ComUtil.addCommas(deliveryFee)}원</b></span>
        //무료배송
        case TERMS_OF_DELIVERYFEE.FREE :
            return <span><b>무료배송</b></span>
        //몇개이상 무료배송
        case TERMS_OF_DELIVERYFEE.GTE_FREE :
            return <span><b>{ComUtil.addCommas(deliveryQty)}개</b> 이상 무료</span>
        //몇개씩 배송비 부과
        case TERMS_OF_DELIVERYFEE.EACH_GROUP_COUNT :
            return <span><b>{ComUtil.addCommas(deliveryQty)}개씩</b> <b>{ComUtil.addCommas(deliveryFee)}</b>원 부과</span>
        //얼마이상 무료배송
        case TERMS_OF_DELIVERYFEE.GTE_PRICE_FREE :
            return <span><b>{ComUtil.addCommas(deliveryQty)}원</b>이상 무료</span>


    }

}

//배송비 텍스트만 추가
function getDeliveryFeeObj(goods){
    const {deliveryFee, deliveryQty, termsOfDeliveryFee} = goods

    const returnObj = {
        hasIssue: false, //배송비 정책이 있는지 여부
        fee: null,
        msg: ''
    }

    switch (termsOfDeliveryFee){
        //무료배송없음(기본배송비이며 몇개를 사던지 배송비 동일)
        case TERMS_OF_DELIVERYFEE.NO_FREE :
            returnObj.hasIssue = false
            returnObj.fee = deliveryFee
            returnObj.msg = '유료배송'
            break;
        //무료배송
        case TERMS_OF_DELIVERYFEE.FREE :
            returnObj.hasIssue = false
            returnObj.fee = 0
            returnObj.msg = '무료배송'
            break;
        //몇개이상 무료배송
        case TERMS_OF_DELIVERYFEE.GTE_FREE :
            returnObj.hasIssue = true
            returnObj.fee = 0
            returnObj.msg = `${ComUtil.addCommas(deliveryQty)}개 이상 무료`
            break;
        //몇개씩 배송비 부과
        case TERMS_OF_DELIVERYFEE.EACH_GROUP_COUNT :
            returnObj.hasIssue = true
            returnObj.fee = 0
            returnObj.msg = `${ComUtil.addCommas(deliveryQty)}개씩 ${ComUtil.addCommas(deliveryFee)}원 부과`
            break;
        //얼마이상 무료배송
        case TERMS_OF_DELIVERYFEE.GTE_PRICE_FREE :
            returnObj.hasIssue = true
            returnObj.fee = 0
            returnObj.msg = `${ComUtil.addCommas(deliveryQty)}원 이상 무료`
            break;
        default:
            break;
    }
    return returnObj;
}


//dealGoodsBuy에서 사용하던 함수 공통으로 이동(22.3.16)
function getSumInfoByGoods(goods) {
    //총 주문가격(원)
    let goodsPrice = 0;
    let deliveryFee = 0;

    let qty = 0; //구매수(옵션)

    goods.options.map(option => {
        goodsPrice += MathUtil.multipliedBy(option.optionPrice,option.orderCnt)
        qty += option.orderCnt
    })

    //배송비 책정
    deliveryFee = getDeliveryFee({
        qty: qty,
        deliveryFee: goods.deliveryFee,
        deliveryQty: goods.deliveryQty,
        termsOfDeliveryFee: goods.termsOfDeliveryFee,
        orderPrice: goodsPrice //currentPrice * orderCnt (배송비 제외한 총 상품가격)
    })

    return {
        goodsPrice, //상품가 * 수량
        deliveryFee //배송비
    }
}

//OptionBuy.js 및 CartList 용도 : option에 Goods메타 추가 => 이후에 localStorage "optionGoodsBuyingInfo" 에 저장.
function addGoodsMeta2Options(targetOptions, goods) {

    const options = targetOptions.map((option, idx) => {
        const orgOption = goods.options.find(go => go.optionIndex === option.optionIndex)
        return  {
            ...orgOption,              //상품원본 옵션
            orderCnt: option.orderCnt, //주문수량
            goodsNm: goods.goodsNm + ((option.optionIndex===0)?'':' [옵션:' + orgOption.optionName + ']'), //메타 goodsNm for option
            optionImages: (orgOption.optionImages.length>0)? orgOption.optionImages: Object.assign({},goods.goodsImages[0]) //필요하려나?
        }
    })

    console.log("## addGoodsMeta2Options listSize:" + targetOptions.length);
    return {goodsNo:goods.goodsNo, options:options};
}


//OLD_OLD개발용 //공동구매용 배송비: 현재는 유료/무료/개이상무료 만 존재. option섞어서 배송을 가정.
// function getDealGoodsDeliveryFee(totalQty, goods) {
//
//     switch (goods.termsOfDeliveryFee) {
//         case TERMS_OF_DELIVERYFEE.NO_FREE :
//             return goods.deliveryFee
//         //무료배송
//         case TERMS_OF_DELIVERYFEE.FREE :
//             return 0
//         //몇개이상 무료배송
//         case TERMS_OF_DELIVERYFEE.GTE_FREE :
//             if (totalQty >= goods.deliveryQty)
//                 return 0
//             else
//                 return goods.deliveryFee
//         default:
//             return 0;
//     }
// }



function getDeliveryFee({
                            qty = 1,          //상품 주문개수 : orderCnt
                            deliveryFee = 0,  //goods.deliveryFee
                            deliveryQty = 0,  //goods.deliveryQty
                            termsOfDeliveryFee = TERMS_OF_DELIVERYFEE.FREE, //goods.termsOfDeliveryFee
                            orderPrice = 0  // currentPrice * orderCnt (배송비 제외 총 상품금액)
                        }){

    switch (termsOfDeliveryFee){
        //무료배송없음(기본배송비이며 몇개를 사던지 배송비 동일)
        case TERMS_OF_DELIVERYFEE.NO_FREE :
            return deliveryFee
        //무료배송
        case TERMS_OF_DELIVERYFEE.FREE :
            return 0
        //몇개이상 무료배송
        case TERMS_OF_DELIVERYFEE.GTE_FREE :
            if(qty >= deliveryQty)
                return 0
            else
                return deliveryFee
        //몇개씩 배송비 부과
        case TERMS_OF_DELIVERYFEE.EACH_GROUP_COUNT :

            let num = 0
            let deliveryFeeQty = 0

            if(qty <= deliveryQty){
                return deliveryFee
            }else{
                num = MathUtil.dividedBy(qty,deliveryQty)
            }

            //소수점 자리가 있을경우
            if(num % 1 !== 0){
                console.log('is num',num)
                deliveryFeeQty = parseInt(num) + 1
            }else{
                console.log('is no num',num)
                deliveryFeeQty = num
            }
            return MathUtil.multipliedBy(deliveryFeeQty,deliveryFee)
        //얼마이상 무료배송
        case TERMS_OF_DELIVERYFEE.GTE_PRICE_FREE :
            if(orderPrice >= deliveryQty)
                return 0
            else
                return deliveryFee
        default :
            return 0
    }
}

function getStandardUnitPrice({packAmount, packUnit, foodsQty, currentPrice}){
    let value = 0
    let unit = ''
    const price = (currentPrice / foodsQty) //개당 단가
    if(packUnit === 'g' || packUnit === 'ml'){
        value = MathUtil.dividedBy(price,MathUtil.multipliedBy(packAmount,100))
        unit = `100${packUnit}`
    }

    if(packUnit === 'kg' || packUnit === 'L'){

        if(packAmount < 1){
            value = MathUtil.dividedBy(MathUtil.multipliedBy(currentPrice,foodsQty),MathUtil.multipliedBy(packAmount,0.1))
            if(packUnit === 'kg'){
                unit = `100g`
            }else{
                unit = `100ml`
            }
        }else{
            value = MathUtil.dividedBy(price,packAmount)
            unit = `1${packUnit}`
        }
    }
    return {
        standardUnit: unit,
        standardUnitPrice: value,
    }
}

// https://tracker.delivery/guide/ 해당 택배사 api 팝업연결 변경
// 01 로젠택배      kr.logen
// 02 CJ대한통운    kr.cjlogistics
// 03 우체국        kr.epost
// 04 롯데택배      kr.lotte
// 05 CU편의점택배  kr.cupost
// 07 한진택배      kr.hanjin
// 세방택배 및 기타배송은 기존 url 사용
// 06 세방택배
// 99 기타배송
function getTransportCarrierId(cd){
    let carrier_id = cd||"";

    if(cd === '01') carrier_id = 'kr.logen';
    else if(cd === '02') carrier_id = 'kr.cjlogistics';
    else if(cd === '03') carrier_id = 'kr.epost';
    else if(cd === '04') carrier_id = 'kr.lotte';
    else if(cd === '05') carrier_id = 'kr.cupost';
    else if(cd === '07') carrier_id = 'kr.hanjin';

    return carrier_id;
}

function getCardPgName(pgProvider){
    if(pgProvider) {
        switch (pgProvider) {
            case 'uplus' :
                return "카드"
            case 'naverpay':
                return "네이버페이";
            case 'kakaopay' :
                return "카카오페이";
            default:
                return "카드";
        }
    }else{
        return "";
    }
}

//onlyCouponBly = cardBlct결제 method중: card+쿠폰만사용 한 경우.
function getPayMethodPgNm (payMethod, pgProvider, onlyCouponBly) {
    const pgGBName = getCardPgName(pgProvider);
    switch(payMethod) {
        case 'blct':
            return 'BLY토큰결제';
        case 'card':
            return pgGBName;
        default:
            return pgGBName + (onlyCouponBly?'':' + BLY결제'); //cardBlct 중 coupon만 쓴경우는 card와 같음.
    }
};

function getPgNm(pgProvider){
    if(!pgProvider) return "";
    let pgProviderNm = pgProvider;
    switch (pgProvider) {
        case 'uplus' :
            return "toss"
        case 'naverpay':
            return pgProviderNm;
        case 'kakaopay' :
            return pgProviderNm;
        default:
            return pgProviderNm;
    }
}

function getPgProviderNm(pgProvider){
    if(!pgProvider) return "";
    let pgProviderNm = pgProvider;
    switch (pgProvider) {
        case 'uplus' :
            return ""
        case 'naverpay':
            return "("+pgProviderNm+")";
        case 'kakaopay' :
            return "("+pgProviderNm+")";
        default:
            return "("+pgProviderNm+")";
    }
}

//로컬상품의 -대체전표, +대체전표 표시. (-는 모두 무시가능)
function localReplaceText(orderDetail) {

    return (orderDetail.refundForReplace && orderDetail.orderPrice < 0) ? "-전표" :
        (orderDetail.refundForReplace && orderDetail.orderPrice > 0) ? "+전표" :
            orderDetail.replaceFlag ? "-대체" :
                orderDetail.csRefundFlag? "일반전표":"일반";
}
//위함수와 동일:boolean리턴 숨길상품(-전표,-대체)은 true로 리턴.
function localReplaceMinusFlag(orderDetail) {
    return (orderDetail.refundForReplace && orderDetail.orderPrice < 0) ? true :
        (orderDetail.refundForReplace && orderDetail.orderPrice > 0) ? false :
            orderDetail.replaceFlag ? true : false;
}

export {
    getDeliveryFee,
    getDeliveryFeeTag,
    getDeliveryFeeObj,
    getSumInfoByGoods,
    addGoodsMeta2Options,
    getStandardUnitPrice,
    getTransportCarrierId,
    getPgNm, getPgProviderNm,
    getCardPgName,
    getPayMethodPgNm,
    localReplaceText,
    localReplaceMinusFlag
}