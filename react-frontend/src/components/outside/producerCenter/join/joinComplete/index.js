import React from 'react';
import {Button, Div, Flex, Space, Strong} from "~/styledComponents/shared";
import ComUtil from "~/util/ComUtil";
import BackNavigation from "~/components/common/navs/BackNavigation";

const JoinComplete = ({history}) => {
    const mLogin = () => {
        if (ComUtil.isMobileApp() || ComUtil.isMobileWeb()) {
            history.replace('/mypage')
        }else{
            alert('모바일에서 이용해 주세요!')
        }
    }
    const pcLogin = () => {
        if (ComUtil.isPcWeb()) {
            window.open('/producer/webLogin', '_blank')
        }else{
            alert('PC에서 이용해 주세요!')
        }
    }
    return (
        <>
            {
                (ComUtil.isMobileWeb() || ComUtil.isMobileApp()) && (
                    <BackNavigation>가입완료</BackNavigation>
                )
            }
            <Flex justifyContent={'center'} flexDirection={'column'} height={'calc(100vh - 52px)'}>
                <Div textAlign={'center'} fontSize={17}>
                    계정이 생성되었습니다!<br/>
                    <Strong>이제 로그인 하여 서비스를 이용 가능 합니다.</Strong>
                </Div>
                <Space mt={30}>
                    <Button px={10} py={8} fg={'white'} bg={'green'} onClick={mLogin}>Mobile 로그인</Button>
                    <Button px={10} py={8} fg={'white'} bg={'green'} onClick={pcLogin}>PC 로그인</Button>
                </Space>
            </Flex>
        </>
    );
};

export default JoinComplete;
