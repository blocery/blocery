import React, { useEffect, useState, Fragment } from 'react'
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap'
import Switch from "react-switch";

import { getConsumer, updateAlrimInfo } from '~/lib/shopApi'
import { getServerVersion } from "~/lib/commonApi";

import BackNavigation from "~/components/common/navs/BackNavigation";
import ArrowList from "~/components/common/lists/ArrowList";
import {Div, Divider, Flex, Right} from "~/styledComponents/shared";
import useLogin from "~/hooks/useLogin";
import {useHistory} from "react-router-dom";


const Setting = (props) => {
    const history = useHistory()
    const {consumer, isServerLoggedIn} = useLogin()
    const [isChecked,setIsChecked] = useState(false)
    const [modal,setModal] = useState(false)
    const [loginUser,setLoginUser] = useState(null)
    const [version,setVersion] = useState('')

    useEffect(() => {
        async function fetch() {
            const loginUserData = await getConsumer()
            setLoginUser((loginUserData) ? loginUserData.data : null)
            setIsChecked(loginUserData && loginUserData.data.receivePush)
            const {data: serverVersion} = await getServerVersion();
            const originVersion = serverVersion.serverVersion;
            const version = originVersion.substring(0, originVersion.length - 9);
            setVersion(version)
        }
        fetch();
    }, [])

    const handleChange = () => {
        setIsChecked(!isChecked)
        modalChange();
    }

    const modalChange = () => {
        if(isChecked) {
            setModal(true);
        } else {
            changeTrue();
        }
    }

    // 알림설정이 false->true 변경한 경우
    const changeTrue = async () => {
        let data = {};
        data.consumerNo = loginUser.consumerNo;
        data.receivePush = true;
        const modified = await updateAlrimInfo(data)

        if(modified.data === 1) {
            setModal(false);
            alert('알림 설정 수신 동의 처리완료되었습니다.')
        } else {
            alert('수신 동의 실패. 다시 시도해주세요.');
            return false;
        }
    }

    // 알림 유지 클릭시 모달닫고 설정true 유지
    const stayNoti = () => {
        setModal(!modal);
        setIsChecked(true);
    }

    // 알림 해제 클릭시 receivePush=false 로 변경
    const cancelNoti = async () => {
        let data = {};
        data.consumerNo = loginUser.consumerNo;
        data.receivePush = false;
        const modified = await updateAlrimInfo(data)
        if(modified.data === 1) {
            setModal(false);
            alert('알림 설정 수신 동의가 해제되었습니다. 마이페이지에서 재설정하실 수 있습니다.')
        } else {
            alert('수신 동의 해제 실패. 다시 시도해주세요.');
            return false;
        }
    }

    return (
        <Fragment>
            <BackNavigation>설정</BackNavigation>
            {
                loginUser &&
                <Div>
                    <Flex p={16}>
                        <Div bold mt={2} flexGrow={1} fontSize={17}>알림설정</Div>
                        <Div>
                            <Switch checked={isChecked} onChange={handleChange}></Switch>
                        </Div>
                    </Flex>
                    <Divider />
                </Div>
            }
            <ArrowList data={[
                {text: <>서비스 이용약관 </>, to: `/mypage/termsOfUse`},
                {text: <>개인정보 보호 정책 </>, to: `/mypage/privacyPolicy`},
            ]} />
            <Divider />
            <Flex px={16} py={23} fontSize={17} bc={'light'} bb={1}>
                <Div flexGrow={1}>버전정보</Div>
                <Right>V {version}</Right>
            </Flex>
            <Modal isOpen={modal} centered>
                <ModalBody className='text-center'>알림 수신 동의 해제 시 <br/> 주요 소식 및 혜택을 받아 보실 수 없습니다.<br/><br/>
                    <span className='text-secondary text-center'>알림 받기를 유지하시겠습니까?</span>
                </ModalBody>
                <ModalFooter>
                    <Button block outline size='sm' color='info' className='m-1' onClick={stayNoti}>알림 유지</Button>
                    <Button block outline size='sm' color='secondary' className='m-1' onClick={cancelNoti}>알림 해제</Button>
                </ModalFooter>
            </Modal>
        </Fragment>
    )
}
export default Setting