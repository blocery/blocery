import React from "react";
import LocalGoods from "~/images/icons/localGoods.svg";
import UniqueGoodsIcon from "~/images/icons/uniqueGoods.svg";
import {Space} from "~/styledComponents/shared";
import styled from 'styled-components'
import {color} from "~/styledComponents/Properties";
import {getValue} from "~/styledComponents/Util";
const BorderBadge = styled.div`
    border: 1px solid ${color.green};
    color: ${color.green};
    padding: 2px 4px;
    font-size: ${getValue(10)};
    border-radius: 2px;
`

//로컬푸드, 실물확인 아이콘
const LocalfoodIconCard = ({goods, styledStyle}) => {
    return (
        <Space spaceGap={4} {...styledStyle}>
            {
                //로컬푸드 상품 일 경우
                goods.localfoodFarmerNo ? <BorderBadge>로컬푸드</BorderBadge> : null
            }
            {
                //직접확인 상품 일 경우
                goods.objectUniqueFlag ? <BorderBadge>실물확인</BorderBadge> : null
            }
        </Space>
    )
    return(
        <Space spaceGap={4}>
            {
                //로컬푸드 상품 일 경우
                goods.localfoodFarmerNo ? <img src={LocalGoods} alt={'로컬푸드 상품'} style={{height: 22}}/> : null
            }
            {
                //직접확인 상품 일 경우
                goods.objectUniqueFlag ? <img src={UniqueGoodsIcon} alt={'실물확인 상품'} style={{height: 22}}/> : null
            }
        </Space>
    )
}

    // <Space spaceGap={4} mb={8}>
    //     {
    //         //로컬푸드 상품 일 경우
    //         goods.localfoodFarmerNo ? <img src={LocalGoods} alt={'로컬푸드 상품'} style={{height: 22}}/> : null
    //     }
    //     {
    //         //직접확인 상품 일 경우
    //         goods.objectUniqueFlag ? <img src={UniqueGoodsIcon} alt={'실물확인 상품'} style={{height: 22}}/> : null
    //     }
    //     {
    //         //로컬푸드 상품 일 경우
    //         //GoodsBadges로 이동. goods.localfoodFarmerNo ? (goods.producerNo == 157 ? <Span fontSize={12} fg={'danger'}><GrDeliver className={'text-danger'}/> <b>옥천/대전 배송</b></Span>:'') : null
    //     }
    // </Space>
export default LocalfoodIconCard