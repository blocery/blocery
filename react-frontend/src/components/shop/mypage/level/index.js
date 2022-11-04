import React, {Component, Fragment, useEffect, useState} from 'react';
import { ShopXButtonNav } from '~/components/common'
import {Div, Span, Button, Flex, Hr, Right, Link} from '~/styledComponents/shared'
import {BadgeSharp} from "~/styledComponents/ShopBlyLayouts";
import BackNavigation from "~/components/common/navs/BackNavigation";
import {useHistory, withRouter} from "react-router-dom";
import {HrThin} from "~/styledComponents/mixedIn";
import useLogin from "~/hooks/useLogin";
import ComUtil from '~/util/ComUtil'
import {getConsumer} from "~/lib/shopApi";
import { getLackNextLevelScore, getTotalOrderPrice3Year } from '~/lib/pointApi'
import styled from "styled-components";
import {color} from "~/styledComponents/Properties";
import {Progress} from 'reactstrap'

const Level = (props) => {

    const [consumer, setConsumer] = useState('');
    const [nextLevelScore, setNextLevelScore] = useState('');
    const [totalOrderPrice3Year, setTotalOrderPrice3Year] = useState('');
    const [percent, setPercent] = useState(0);

    const history = useHistory()

    useEffect(() => {
        fetch();
    }, [])

    const fetch = async () => {
        const {data} = await getConsumer();
        const {data:nextLevelScore} = await getLackNextLevelScore();
        const {data:totalOrderPrice3Year} = await getTotalOrderPrice3Year();

        let progressPercent =  ComUtil.roundDown(100 * (data.point + totalOrderPrice3Year/10) / (data.point + totalOrderPrice3Year/10  + nextLevelScore), 0);
        console.log('progressPercent', progressPercent);


        setNextLevelScore(nextLevelScore);
        setTotalOrderPrice3Year(totalOrderPrice3Year);
        setConsumer(data);

        setPercent(progressPercent);

    }

    const getGradeKor = (level) => {
        if (level === 5) return '브론즈';
        if (level === 4) return '실버';
        if (level === 3) return '골드';
        if (level === 2) return 'VIP';
        if (level === 1) return 'VVIP';
    }

    const onClickPointInfo = () => {
        history.push('/pointInfo');
    }


    return (
        <Fragment>
            {/*<ShopXButtonNav underline fixed historyBack>포인트 안내</ShopXButtonNav>*/}
            <BackNavigation>등급 및 혜택</BackNavigation>

            <Div bg={'green'} px={16} py={25}>

                <Div fg={'white'}> {consumer.nickname} 님의 등급 </Div>
                <Div fg={'white'} fontSize={25}>{getGradeKor(consumer.level)} / {ComUtil.addCommas(consumer.point + totalOrderPrice3Year/10)}점</Div>
                {
                    consumer.level > 1 &&
                    <Div>
                        {nextLevelScore < 0 ? (
                                <Div fg={'secondary'} mt={20}> 월요일에 <Span fg={'white'}>{getGradeKor(consumer.level-1)}</Span>
                                    등급으로 업그레이드 됩니다.
                                </Div>
                            ) :
                            <Div fg={'veryLight'} mt={20} mb={10}> 다음 등급인 <Span fg={'white'}>{getGradeKor(consumer.level-1)}</Span>
                                까지 <Span fg={'white'}>{ComUtil.addCommas(nextLevelScore)}</Span>점 남았습니다.
                            </Div>
                        }
                        <Progress
                            //color={'success'}
                            max="100"
                            //striped
                            //animated
                            value={percent}
                        >
                            {percent} %
                        </Progress>
                    </Div>
                }
            </Div>


            <Div px={16} py={25}>
                <Flex my={5}>
                    <Div fontSize={20} >등급 계산 방법</Div>
                    <Right>
                        <Link to={'/levelInfo'}>
                            <u>등급 및 혜택 안내</u>
                        </Link>
                    </Right>
                </Flex>
                <HrThin/>
                <Flex>
                    <Div fontSize={15} ml={10} mt={10} mb={10}>누적 구매 금액/10</Div>
                    <Right mr={10}>{ComUtil.addCommas(totalOrderPrice3Year)}원/10 </Right>
                </Flex>
                <HrThin/>
                <Flex>
                    <Div fontSize={15} ml={10} mt={10} mb={10}>현재 포인트</Div>
                    <Right mr={10}>{ComUtil.addCommas(consumer.point)}p </Right>
                </Flex>
                <HrThin/>
                <Flex>
                    <Div fontSize={15} ml={10} mt={10} mb={10}>등급 점수</Div>
                    <Right mr={10}><Span fg={'primary'}>{ComUtil.addCommas(consumer.point + totalOrderPrice3Year/10)}</Span>점 </Right>
                </Flex>
                <HrThin/>

                <Div fontSize={13} fg={'dark'} mt={25}>
                    <Flex dot alignItems={'flex-start'}>
                        <div>등급은 '(누적 구매 금액/10)+포인트'에 따라 결정이 됩니다.</div>
                    </Flex>
                    <Flex dot alignItems={'flex-start'} my={5}>
                        <div>누적 구매 금액은 구매 확정된 건에 대해서만 집계되며, 매일 자정 업데이트 됩니다.</div>
                    </Flex>
                    <Flex dot alignItems={'flex-start'} my={5}>
                        <div>등급에 따라 구매 적립률, 리뷰2배 적립 등의 혜택이 주어 집니다.</div>
                    </Flex>
                    <Flex dot alignItems={'flex-start'}>
                        <div>누적 구매 금액은 최근 3년치가 반영이 됩니다.</div>
                    </Flex>
                </Div>

            </Div>
        </Fragment>
    )
}

export default withRouter(Level);