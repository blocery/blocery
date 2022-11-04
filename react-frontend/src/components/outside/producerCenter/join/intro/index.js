import React from 'react';
import IntroduceImage1 from '~/images/producer/producerJoinInfo.gif'
import IntroduceImage from '~/images/producer/producerJoinInfo.jpg'
import {Div, Img, Button, Space, Link, Fixed, GridColumns, Flex} from "~/styledComponents/shared";
import styled, {css} from 'styled-components'
import {getValue} from "~/styledComponents/Util";
import {color} from "~/styledComponents/Properties";
import ComUtil from "~/util/ComUtil";
import BackNavigation from "~/components/common/navs/BackNavigation";
import theme from "~/styledComponents/theme";
import {withRouter} from 'react-router-dom'

const dummy = css`
    ${({theme}) => theme.desktop`
        font-size: 22px;        
        height: 80px;                 
    `}

    ${({theme}) => theme.mobile`
        font-size: 18px;
        height: 60px;        
    `}
`

const FixedLayout = styled.div`
    position: fixed;
    bottom: 0;
    max-width: 800px;
    width: 100%;
    // height: 80px;
    left: 50%;
    transform: translateX(-50%);    
    // font-size: 22px;
    
    
    ${dummy};
    
`

const Dummy = styled.div`
  
    ${dummy};
  
    // ${({theme}) => theme.desktop`
    //     font-size: 22px;        
    //     height: 80px;                 
    // `}
    //
    // ${({theme}) => theme.mobile`
    //     font-size: 18px;
    //     height: 60px;        
    // `}
`

const ButtonGroup = withRouter(({history}) => {
    return(
        <FixedLayout>
            <Flex height={'100%'}>
                <Flex cursor={1} flexGrow={1} height={'100%'} width={'100%'} bg={'green'} fg={'white'} justifyContent={'center'} fw={900} onClick={() => history.push('/producerCenter/join/checkJoinStatus')}>
                    입점신청 / 결과조회
                </Flex>
                <Flex cursor={1} flexGrow={1} height={'100%'} width={'100%'} bg={'warning'} fg={'white'} justifyContent={'center'} fw={900} onClick={() => history.push('/producerCenter/join/question')}>
                    입점상담
                </Flex>
                {/* 가입되어있는지 확인하기 위해 한번 진행확인 페이지로 이동 */}
                {/*<Link to={'/producerCenter/join/checkJoinStatus'}>*/}
                {/*    <StyledButton bg={'green'} fg={'white'} fw={900}>*/}
                {/*        입점신청 / 결과조회*/}
                {/*    </StyledButton>*/}
                {/*</Link>*/}
                {/*<StyledButton to={'/producerCenter/join/question'}>*/}
                {/*    <Div cursor={1} height={150} bg={'warning'} fg={'white'} fw={900}>*/}
                {/*        입점상담*/}
                {/*    </Div>*/}
                {/*</StyledButton>*/}
            </Flex>
        </FixedLayout>
    )
})
const Intro = (props) => {
    return (
        <div>
            {
                (ComUtil.isMobileWeb() || ComUtil.isMobileApp()) && (
                    <BackNavigation>입점안내</BackNavigation>
                )
            }
            <Div>
                <Div textAlign={'center'}>
                    <Img maxWidth={800} src={IntroduceImage1} alt="샵블리 생산자 혜택 안내"/>
                </Div>
                <Div textAlign={'center'}>
                    <Img maxWidth={800} src={IntroduceImage} alt="샵블리 생산자 혜택 안내"/>
                </Div>
                <Dummy />
                <ButtonGroup />
            </Div>

        </div>
    );
};

export default Intro;
