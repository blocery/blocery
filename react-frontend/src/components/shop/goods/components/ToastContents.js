import React, {Fragment} from "react";
import {Div, Divider, Flex, GridColumns, Span, Strong} from "~/styledComponents/shared";
import DealGoodsShareButton from "~/components/common/buttons/DealGoodsShareButton";

/*
    쑥쑥 소개
*/
export const AboutSsugSsug = () => {
    return(
        <GridColumns fontSize={12} colGap={0} rowGap={8}>
            <Div fontSize={13}><b>안전한 먹거리로 건강을 구매하세요!</b></Div>
            <div>샵블리의 계약재배 쑥쑥은 내가 구매하고자 하는 상품의 다양한 <Strong fg={'green'}>이력을 확인하고 안전한 먹거리</Strong>를 구매할 수 있는 서비스 입니다.</div>
            <div>생산농가에서 입력한 다양한 생산정보와 유통과정에서 발생하는 유통정보 등을 블록체인에 기록하여 투명하고 정직한 정보를 제공하여, <Strong fg={'green'}>농산물을 보다 믿고 안전하게 구매</Strong>할 수 있습니다.</div>
            <div>슬기롭게 소비하고, 농가 및 지역사회 등 내수 살리기도 돕고, 1석 2조 효과에 참여해 보세요!</div>
            <div><Strong fg={'green'}>"우리집 식탁의 안전은 내가 책임진다!"</Strong></div>
            <div>안전한 먹거리에 대한 구매를 지금 바로 경험해 보세요.</div>
        </GridColumns>
    )
}

/*
    적립혜택 소개
*/
export const AboutExtraRewards = ({extraRewards = [], dealNowExtraReward, goodsNo, goodsNm, dealRecommenderRate}) => {
    return (
        <Div textAlign={'center'}>
            <GridColumns repeat={2} colGap={0} rowGap={0} py={10} fg={'darkBlack'}>
                <span>달성 수량</span>
                <span>적립률</span>
            </GridColumns>
            <Divider height={1}mx={8} />
            <GridColumns repeat={2} colGap={0} rowGap={8} py={8}>
                {
                    extraRewards.map((extraReward, index) => (
                            <Fragment key={extraReward.reward}>
                                <Span fg={index === 0 ? 'danger' : extraReward.reward === dealNowExtraReward ? 'danger' : 'black'}>{index === 0 ? '기본' : `${extraReward.dealCount}개 이상`}</Span>
                                <Span fg={extraReward.reward === dealNowExtraReward ? 'danger' : 'black'}>{extraReward.reward}%</Span>
                            </Fragment>
                        )
                    )
                }
            </GridColumns>
            <GridColumns colGap={0} rowGap={5} px={8} py={13} lineHeight={18} bg={'background'} fg={'darkBlack'} textAlign={'left'} fontSize={12}>
                <Flex dot alignItems={'flex-start'}>
                    <span>공동구매 적립률은 딜 종료 시점의 최종 판매 수량에 따라 결정되며, 구매확정시 적립 됩니다.</span>
                </Flex>
                <Flex dot alignItems={'flex-start'}>
                    <span>공유한 상품을 친구가 공동구매 참여 시 <Strong>공유자는 {dealRecommenderRate}% 추가 적립</Strong> 됩니다.</span>
                </Flex>
                <Div textAlign={'center'}>
                    <DealGoodsShareButton goodsNo={goodsNo} goodsNm={goodsNm} />
                </Div>
            </GridColumns>
        </Div>
    );
};