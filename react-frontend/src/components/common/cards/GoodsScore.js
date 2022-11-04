import React from 'react';
import {Div, Flex} from "~/styledComponents/shared";
import {IconStarGroup} from "~/components/common";
import Skeleton from "~/components/common/cards/Skeleton";
import {Bold} from "~/styledComponents/ShopBlyLayouts";
import ComUtil from "~/util/ComUtil";

const GoodsScore = ({avgScore, scoreRates}) => {

    return(
        !scoreRates ? <Skeleton.List count={1} /> : (
            <Flex
                py={24}
                justifyContent={'space-evenly'}
            >
                <Div textAlign={'center'}>
                    <Bold bold fontSize={30}><b>{ComUtil.toScoreRate(avgScore)}</b></Bold>
                    <Div><IconStarGroup score={avgScore} size={'lg'}/></Div>
                </Div>
                {/* progress */}
                <Div minWidth={200} lineHeight={20}>
                    <ScoreProgress title={'최고'} rate={scoreRates[0]} />
                    <ScoreProgress title={'좋음'} rate={scoreRates[1]} />
                    <ScoreProgress title={'보통'} rate={scoreRates[2]} />
                    <ScoreProgress title={'별로'} rate={scoreRates[3]} />
                    <ScoreProgress title={'나쁨'} rate={scoreRates[4]} />
                </Div>
            </Flex>
        )

    )
}


//평점 프로그래스
const ScoreProgress = React.memo(({title, rate}) =>
    <Flex fontSize={13}>
        <Div flexShrink={0} minWidth={35} textAlign={'right'} fg={'dark'}>{title}</Div>
        <Div relative flexGrow={1} bg={'light'} rounded={3} height={5} mx={12}>
            <Div bg={'green'} rounded={3} width={`${rate}%`} height={'100%'}></Div>
        </Div>
        <Div flexShrink={0} minWidth={35} textAlign={'right'} fg={'dark'}>{rate.toFixed(0)}%</Div>
    </Flex>
)

export default GoodsScore;
