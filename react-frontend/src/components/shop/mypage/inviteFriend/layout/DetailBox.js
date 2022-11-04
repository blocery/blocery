import React from 'react';
import {Div, Flex, Span} from "~/styledComponents/shared";

import styled from 'styled-components'

const DotText = styled(Div)`
    &::before {
        content: '·';
        margin-right: 10px;
    }
`;

const DetailBox = (props) => {
    return (
        <Div fontSize={13} lineHeight={23} p={10} bg={'background'} rounded={2} fg={'dark'}>

            {/*<Flex dot alignItems={'flex-start'}>*/}
                {/*<Div>친구가 회원가입 시 추천인 코드를 입력시 즉시 적립됩니다.</Div>*/}
            {/*</Flex>*/}
            <Flex dot alignItems={'flex-start'}>
                <Div>친구 상품 구매 적립금은 친구 구매 확정 시 당일 적용되고 있는 <Span fg={'green'}>BLY 시세를 기준</Span>으로 지급됩니다.</Div>
            </Flex>
            <Flex dot alignItems={'flex-start'}>
                <Div>친구 초대 가입 적립금은 친구 가입일의 <Span fg={'green'}>BLY 시세를 기준</Span>으로 지급되며, 친구의 첫 구매 확정시 지급됩니다.</Div>
            </Flex>
            <Flex dot alignItems={'flex-start'}>
                <Div>친구 상품구매 적립금은 친구가 회원가입 시점을 기준으로 3개월동안 구매확정내역에 한하여 지급 유효하며, 결제수단에 상관없이 결제금액의 1%씩 추가로 적립됩니다.</Div>
            </Flex>
        </Div>
    );
};

export default DetailBox;
