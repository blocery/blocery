import React, {Fragment, useEffect, useState} from 'react';
import {Div, Flex, GridColumns, Right, Span, WhiteSpace} from '~/styledComponents/shared'
import BackNavigation from "~/components/common/navs/BackNavigation";
import {useHistory, withRouter} from "react-router-dom";
import {HrThin} from "~/styledComponents/mixedIn";
import ComUtil from '~/util/ComUtil'
import {getConsumer} from "~/lib/shopApi";
import { getLackNextLevelScore, getTotalOrderPrice3Year } from '~/lib/pointApi'
import {IoIosArrowForward} from 'react-icons/io'
import styled from 'styled-components'
import {color} from "~/styledComponents/Properties";

const LineHeavy = styled.div`
    height: 2px;
    background: ${color.black};        
`

const Item = ({level, standard, reward, double}) =>
    <Div px={10} py={23}>
        <Flex alignItems={'flex-start'}>
            <Div minWidth={90} flexShrink={0} fontSize={18} bold lineHeight={18}>{level}</Div>
            <GridColumns rowGap={16} fontSize={13}>
                <Flex alignItems={'flex-start'} lineHeight={13}>
                    <Div>기준 :</Div>
                    <Div>
                        <WhiteSpace>&nbsp;{standard}</WhiteSpace>
                        {double &&
                            <Div mt={10}>
                                <WhiteSpace>&nbsp;{double}</WhiteSpace>
                            </Div>
                        }
                    </Div>
                </Flex>
                <Flex alignItems={'flex-start'} lineHeight={13}>
                    <Div>혜택 : </Div>
                    <WhiteSpace>&nbsp;{reward}</WhiteSpace>
                </Flex>
            </GridColumns>
        </Flex>
    </Div>


const LevelInfo = (props) => {

    const history = useHistory()

    const onClickPointInfo = () => {
        history.push('/pointInfo');
    }

    return (
        <Fragment>
            <BackNavigation>등급 및 혜택 안내</BackNavigation>
            <Div p={16}>
                <Div>
                    <Flex alignItems={'center'} mb={16}>
                        <Div fontSize={17} bold>등급 및 혜택 안내</Div>
                        {/*<Right fontSize={14} fg={'green'} onClick={onClickPointInfo} cursor>*/}
                        {/*    <b>포인트 안내</b>*/}
                        {/*    <IoIosArrowForward />*/}
                        {/*</Right>*/}
                    </Flex>
                    <LineHeavy />
                    <Item level={'BRONZE'} standard={'회원가입 ~ 10,000점'} reward={'구매적립률 1%'} />
                    <HrThin/>
                    <Item level={'SILVER'} standard={'10,001 ~ 30,000점'} reward={'구매적립률 2%'} />
                    <HrThin/>
                    <Item level={'GOLD'} standard={'30,001 ~ 100,000점'} reward={'구매적립률 3%'} />
                    <HrThin/>
                    <Item level={'VIP'} standard={'100,001 ~ 300,000점'} reward={'구매적립률 4%'}  double={'더블혜택(리뷰적립 2배)'} />
                    <HrThin/>
                    <Item level={'VVIP'} standard={'300,001 ~'} reward={'구매적립률 5%'}  double={'더블혜택(리뷰적립 2배)'}/>
                    <HrThin/>
                </Div>
            </Div>
        </Fragment>
    )
}

export default withRouter(LevelInfo);