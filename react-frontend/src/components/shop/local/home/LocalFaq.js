import React, { Component, Fragment } from 'react';
import { ShopXButtonNav } from '~/components/common'
import { Div, Span, Button, Flex, Hr, Right } from '~/styledComponents/shared'
import loadable from "@loadable/component";
import BackNavigation from "~/components/common/navs/BackNavigation";

const LocalFaq = (props) => {

    return (
        <Fragment>
            <BackNavigation>로컬푸드란</BackNavigation>

            <Div p={30}>
                <Div fontSize={18} mb={20}>로컬푸드가 뭔가요?</Div>
                <Div fontSize={12} mb={30} lineHeight={22}>
                    로컬푸드는 지역에서 생산한 먹거리를 <Span fg={'primary'}>다단계 유통과정을 거치지 않고 지역에서 소비</Span>하는 새로운 먹거리 유통문화로 장거리 운송을 거치지 않은 지역 농산물을 지칭합니다.
                </Div>
            </Div>

        </Fragment>
    )
};

export default LocalFaq;