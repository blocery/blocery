import React, {useEffect, useState} from 'react';
import {Div, Flex, Article, Right, Span, Space} from "~/styledComponents/shared";
import styled from 'styled-components'
import {color} from "~/styledComponents/Properties";
import {getValue} from "~/styledComponents/Util";
import useInterval from "~/hooks/useInterval";
import {getGoodsByGoodsNo} from "~/lib/goodsApi";
import {Bold} from "~/styledComponents/ShopBlyLayouts";
import ComUtil from "~/util/ComUtil";
import moment from "moment-timezone";

const Progress = styled.div`
    position: relative;
    height: 7px;    
    
    width: calc(100% - 5px);    
    
    &:before {
        border-radius: 3.5px;
        content: "";
        display: block;
        position: absolute;
        z-index: 1;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-color: ${props => color[props.bg] || props.bg};
    }
    
    &:after {
        border-radius: 3.5px;
        content: "";
        display: block;
        position: absolute;
        z-index: 2;
        top: 0;
        left: 0;
        bottom: 0;
        ${props => props.animation && `transition: 1s;`}
        width: ${props => props.value};
        background-color: ${props => color[props.progressBg]};
    }
`
const Circle = styled(Div)`
    position: absolute;
    border-radius: 50%;    
    width: ${getValue(10)};
    height: ${getValue(10)};
    z-index: 3;
    top: 50%;    
    transform: translate(-50%, -50%);
    box-shadow: 0 0 0 3px white;
        
    &:after {
        content: "${props => props.text}";
        position: absolute;
        display: block;
        top: 100%;
        // width: max-content;        
        display: inline-block;
        margin-top: ${getValue(4)};        
        font-size: ${getValue(12)};
        color: dark;        
        
        ${props => props.min ? `
            left: 50%;
            transform: translateX(-50%);        
        ` : `
            left: 100%;
            transform: translateX(-100%);
        `}
    }
`

const Basic = React.memo(({
                              value = 0,    //현재값(숫자)
                              minValue,     //최소 딜 수량(숫자)
                              maxValue,     //최대 딜 수량(숫자)
                              minText,    //최소 커스텀
                              maxText,     //최대 커스텀
                              progressBg = 'green', //프로그래스 배경색
                              minBg = 'green',     //최소 원 배경색
                              maxBg = 'secondary',       //최대 원 배경색
                              header = null,    // 45%
                              animation = false  //프로그래스 애니매이션 여부
                              // rightText,           //오른쪽 텍스트 메시지
                          }) => {

    const progressValue = value === 0 ? 0 : (value / maxValue) * 100
    const minCircleValue = minValue === 0 ? 0 : (minValue / maxValue) * 100

    return (
        <Article pb={25}>
            {header}
            {/*{*/}
            {/*    (leftText || rightText) && (*/}
            {/*        <Flex mb={10}>*/}
            {/*            <Bold fontSize={20} fg={'green'}>{leftText}</Bold>*/}
            {/*            <Right fontSize={14} fg={'dark'} lighter>{rightText}</Right>*/}
            {/*        </Flex>*/}
            {/*    )*/}
            {/*}*/}
            <Progress bg={'light'} progressBg={progressBg} value={`${progressValue > 100 ? 100 : progressValue}%`} animation={animation}>
                <Circle bg={minBg} left={`${minCircleValue > 100 ? 100 : minCircleValue}%`} text={minText || minValue} min/>
                <Circle bg={maxBg} left={'100%'} text={maxText || maxValue} max/>
            </Progress>
        </Article>
    );
});

const AutoUpdate = ({
                        goodsNo,
                        startDate,    //시작일자 moment객체
                        endDate,      //종료일자 moment객체
                        searchInterval = 3000, //조회 인터벌(기간에 접어 들었을 경우 자동 조회됨)

                        value = 0,    //현재값(숫자)
                        minValue,     //최소 딜 수량(숫자)
                        maxValue,     //최대 딜 수량(숫자)
                        minText,    //최소 커스텀
                        maxText,     //최대 커스텀
                        progressBg = 'green', //프로그래스 배경색
                        minBg = 'green',     //최소 원 배경색
                        maxBg = 'secondary',       //최대 원 배경색
                        showProgressRate,       //진행률 % 보이기
                        showRemainedDaysCount,  //남은 일수 보이기
                        dealEndDate,
                        animation
                    }) => {

    const [progressValue, setProgressValue] = useState(value)
    // const [progressDealEndDate, setProgressDealEndDate] = useState(dealEndDate)

    const [timerInterval, setTimerInterval] = useState(1000)
    const [periodInterval, setPeriodInterval] = useState(null)

    useEffect(() => {
        // const now = moment()
        // //일단 시작했다면 한번 조회
        // if (now.isSameOrAfter(startDate)){
        search()
        // }
    }, [goodsNo])

    //1초마다 기간에 접어들었는지 체크
    useInterval(() => {


        // console.log('dealProgress ======================')

        const now = moment()

        //기간 이전일 경우
        if (now.isBefore(startDate)) {
            // console.log('progress-before')
        }
        /*
            기간중
            [ : 시작이 같거나 큰것
            ] : 종료가 같거나 큰것
            ( : 시작보다 큰것
            ) : 종료보다 큰것
      */
        else if (periodInterval === null && now.isBetween(startDate, endDate,undefined, '[]')) {
            setPeriodInterval(searchInterval)
            // console.log('progress-between')
        }
        //기간종료
        else if (now.isAfter(endDate)){
            setPeriodInterval(null)
            setTimerInterval(null)
            // console.log('progress-after')
        }
    }, timerInterval)

    useInterval(() => {
        search()
    }, periodInterval)

    // useInterval(() => {
    //     console.log('interval ====================================')
    //     //TODO 상품 조회보단, 카운트같은 메타정보만 리턴하는걸로 변겅..
    //     getGoodsByGoodsNo(goodsNo).then(({data}) => {
    //             if(progressValue !== data.dealCount){
    //                 setProgressValue(data.dealCount)
    //                 setProgressDealEndDate(data.dealEndDate)
    //             }
    //         }
    //     )
    // }, goodsNo ? 5000 : null)

    const search = async () => {
        try{
            const {data} = await getGoodsByGoodsNo(goodsNo)
            if(progressValue !== data.dealCount){
                console.log('progress-search')
                setProgressValue(data.dealCount)
                // setProgressDealEndDate(data.dealEndDate)
            }
        }catch (error) {
        }
    }

    // const search = async () => {
    //     const {data} = await getGoodsByGoodsNo(goodsNo)
    //     if(progressValue !== data.dealCount){
    //         setProgressValue(data.dealCount)
    //     }
    // }

    // const percentage = progressValue ? (progressValue / maxValue) * 100 : 0
    // const leftText = percentage <= 100 ? `${ComUtil.roundDown(percentage, 0)}%` : `0%`


    return (

        <Basic
            value={progressValue}
            minValue={minValue}
            maxValue={maxValue}
            minText={minText}
            maxText={maxText}
            progressBg={progressBg}
            minBg={minBg}
            maxBg={maxBg}
            header={
                <Header percentage={progressValue > 0 ? (progressValue / minValue) * 100 : 0}
                        count={progressValue}
                        remainedCount={getRightText(endDate)}
                />}
            // leftText={showProgressRate ? getLeftText(progressValue, maxValue) : null}
            // rightText={showRemainedDaysCount ? getRightText(endDate) : null}
            animation={animation}
        />

    )

}

function Header({percentage, count, remainedCount}) {
    return(
        <Flex alignItems={'flex-end'} pt={16} mb={16}>
            <Space alignItems={'flex-end'} fg={'green'}>
                <Bold fontSize={20} lineHeight={20}>{ComUtil.roundDown(percentage, 1)}%</Bold>
                <Span fontSize={13} lineHeight={13}>{ComUtil.addCommas(count)}개 달성</Span>
            </Space>
            <Right fontSize={13} lineHeight={13} fg={'dark'}>
                {remainedCount}
            </Right>
        </Flex>
    )
}
//
// function getLeftText(value, maxValue) {
//     const percentage = value ? (value / maxValue) * 100 : 0
//     return percentage <= 100 ?
//         <Flex alignItems={'flex-end'}>
//             <Span fontSize={20} lineHeight={20}>
//                 {
//                     `${ComUtil.roundDown(percentage, 1)}%`
//                 }
//             </Span>
//             <Span ml={10} fontSize={13} lineHeight={13} style={{fontFamily: 'NanumSquareRound'}}>
//                 {ComUtil.addCommas(value)}개 달성
//             </Span>
//         </Flex>
//         :
//         `0%`
// }
function getRightText(date) {
    const remainedDayCount = ComUtil.getDateDiffTextBetweenNowAndFuture(moment(date, 'YYYYMMDD').endOf('day'), 'DD')
    return remainedDayCount <= 0 ? '종료' : parseFloat(remainedDayCount) + '일 남음'
}


export default {
    Basic,
    AutoUpdate
}