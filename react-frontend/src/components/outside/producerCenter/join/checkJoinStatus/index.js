import React, {useState} from 'react';
import {Button, Div, Flex, Link, Space, Span, Strong} from "~/styledComponents/shared";
import {withRouter} from "react-router-dom";
import {getProducerTemp,coRegistrationNoCheck} from '~/lib/producerApi'
import {Input} from "~/styledComponents/shared";
import {color} from "~/styledComponents/Properties";
import styled from 'styled-components'
import {Alert, Col, Container, Row} from "reactstrap";
import ComUtil from "~/util/ComUtil";
import BackNavigation from "~/components/common/navs/BackNavigation";
import axios from "axios";

const LinkButton = ({onClick, children}) => <Span cursor={1} fg={'primary'} fontSize={18} onClick={onClick}><b><u>{children}</u></b></Span>

const CheckJoinStatus = ({history}) => {

    //사업자등록번호
    const [coRegistrationNo, setCoRegistrationNo] = useState()
    //0: 임시저장 1: 신청완료(검토중) 2:반려 3:가입완료
    const [producerTemp, setProducerTemp] = useState()

    const onCheckClick = async () => {

        if (!coRegistrationNo) {
            alert('사업자 인증번호를 입력해주세요.')
            return
        }
        if (coRegistrationNo.length !== 10) {
            alert('사업자 인증번호는 10자리 입니다.')
            return
        }

        //사업자 등록번호가 맞는지
        let isCorrectionNo = ComUtil.checkCoRegistrationNo(coRegistrationNo);

        if (!isCorrectionNo) {
            alert('사업자등록번호가 잘못되었습니다.')
            return
        }

        //producerTemp 조회
        const {data} = await getProducerTemp(coRegistrationNo)

        //작성하지 않았을때
        if (!data) {

            //사업자등록번호 api 확인(정상)
            try{

                //axios 에서 validateStatus 를 통해 에러 결과값도 무조건 resolve 시키게 세팅되어 status === 200 으로만 판별하도록 함
                const {status, data:res} = await coRegistrationNoCheck(coRegistrationNo)

                if (status === 200) {

                    isCorrectionNo = (res.status_code == 'OK' && res.data && res.data.length > 0 && res.data[0].b_stt_cd)?true:false
                    if (!isCorrectionNo) {
                        alert('국세청에 등록되지 않은 사업자등록번호 입니다.')
                        return
                    }
                }else{
                    //이외 모든 에러 (아무처리 안함)
                }
            }catch (error) {
            }

            //미가입 : 동의하기 화면으로 이동
            history.push({
                pathname: '/producerCenter/join/agree',
                state: {
                    coRegistrationNo: coRegistrationNo
                }
            })
        }else{

            //임시저장 상태일 경우
            if (data.joinStatus === 0) {
                alert('작성중이던 신청서를 불러옵니다.')
                goRequestPage()
            }else{
                setProducerTemp(data)
            }
        }

        // //가입완료 : 이미 가입되었습니다.
        // //진행중 : 현재 가입 진행중입니다. 가입양식 수정하기 버튼 노출
        // const newJoinState = 0 //db의 joinStatus
        // setJoinStatus(newJoinState)
        // // if (newJoinState === 0) {
        // //
        // // }


    }

    //정보수정
    const onModClick = () => {
        goRequestPage()
    }

    const goRequestPage = () => {
        //진행중 : 현재 가입 진행중입니다. 가입양식 수정하기 버튼 노출
        history.push({
            pathname: '/producerCenter/join/request',
            state: {
                coRegistrationNo: coRegistrationNo,
            }
        })
    }

    const onInputChange = e => {
        setCoRegistrationNo(e.target.value)
    }
    const onCreateLoginAccountClick = async () => {

        if (!coRegistrationNo) {
            alert('사업자등록번호를 입력 해 주세요')
            return
        }

        //producerTemp 조회
        const {data} = await getProducerTemp(coRegistrationNo)

        if (!data) {
            alert('사업자등록번호가 잘못되었거나 신청한 이력이 없습니다. 사업자 등록번호를 다시 확인 바랍니다.')
            return
        }

        //진행중 : 현재 가입 진행중입니다. 가입양식 수정하기 버튼 노출
        history.push({
            pathname: '/producerCenter/join/createAccount',
            state: {
                coRegistrationNo: coRegistrationNo,
            }
        })
    }
    const onLoginClick = () => {
        history.push('/producer/webLogin')
    }

    const mLogin = () => {
        if (ComUtil.isMobileApp() || ComUtil.isMobileWeb()) {
            history.push('/mypage')
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
        <div>
            {
                (ComUtil.isMobileWeb() || ComUtil.isMobileApp()) && (
                    <BackNavigation>입점신청 및 확인</BackNavigation>
                )
            }








            <Flex justifyContent={'center'} p={16} height={'calc(100vh - 52px)'}>

                <Container className={'pt-3 pb-3'} style={{maxWidth: 400}}>
                    <Row>
                        <Col xs={12} sm={12} md={12} lg={12} xl={12} className='p-0'>
                            <div>
                                <div>
                                    <Div mb={10} bold fontSize={18}>사업자번호 인증</Div>
                                    <Flex bc={'light'}>
                                        <Div maxWidth={400} flexGrow={1}>
                                            <Input block bc='white' type={'number'} value={coRegistrationNo} onChange={onInputChange} placeholder={`'-' 제외한 숫자만 입력해주세요(10자리)`}/>
                                        </Div>
                                        <Div flexShrink={0}>
                                            <Button noHover bg={'green'} fg={'white'} height={'45px'} onClick={onCheckClick} px={20}>확인</Button>
                                        </Div>
                                    </Flex>
                                </div>

                                {
                                    producerTemp && (
                                        <>
                                            {
                                                [1].includes(producerTemp.joinStatus) && (
                                                    <Div mt={16}>
                                                        <Alert color="danger">
                                                            상태 : 관리자의 승인을 기다리고 있습니다.<br/>
                                                            최대한 빠른 검토 후 담당자 휴대폰 번호(카카오톡)로 결과 안내 드리겠습니다.
                                                        </Alert>
                                                    </Div>
                                                )
                                            }
                                            {
                                                [2].includes(producerTemp.joinStatus) && (
                                                    <Div mt={16}>
                                                        <Alert color="danger">
                                                            상태 : 신청서가 <u>반려</u> 되었습니다.<br/>
                                                            아래 사유를 확인 하시고 <u>신청서를 수정후 다시 제출</u>해 주세요.<br/><br/>
                                                            {
                                                                `사유 : "${producerTemp.reason}"`
                                                            }<br/><br/>
                                                            <Button onClick={onModClick} p={16}>신청서 수정하기</Button>
                                                        </Alert>
                                                    </Div>
                                                )
                                            }
                                            {
                                                [3].includes(producerTemp.joinStatus) && (
                                                    <Div mt={16}>
                                                        <Alert color="success">
                                                            상태 : 승인이 완료되었습니다.<br/>
                                                            생산자용 <LinkButton onClick={onCreateLoginAccountClick}>로그인 계정을 생성</LinkButton> 해주세요.
                                                        </Alert>
                                                    </Div>
                                                )
                                            }
                                            {
                                                [4].includes(producerTemp.joinStatus) && (
                                                    <Div mt={16}>
                                                        <Alert color="success">
                                                            상태 : 가입이 완료되었습니다.<br/>
                                                            <Button fontSize={16} block px={10} py={16} mt={16} fg={'green'} bg={'white'} onClick={mLogin}>Mobile 로그인</Button>
                                                            <Button fontSize={16} block px={10} py={16} mt={16} fg={'green'} bg={'white'} onClick={pcLogin}>PC 로그인</Button>
                                                        </Alert>
                                                    </Div>
                                                )
                                            }
                                        </>
                                    )
                                }

                                <Div py={16} mt={16}>
                                    {/*[필수 준비서류 사전 안내] */}
                                    <Strong fg={'green'}>"빠른 진행을 위해 서류를 미리 준비 해주세요"</Strong><br/>
                                    <Flex dot textAlign={'flex-start'} my={10}>
                                        <div>사업자 등록증</div>
                                    </Flex>
                                    <Flex dot textAlign={'flex-start'} my={10}>
                                        <div>통장사본</div>
                                    </Flex>
                                    <Flex dot textAlign={'flex-start'} my={10}>
                                        <div>통신 판매업 신고증 사본</div>
                                    </Flex>
                                    <Flex dot textAlign={'flex-start'} my={10}>
                                        <div>견적서</div>
                                    </Flex>
                                </Div>



                            </div>
                        </Col>
                    </Row>
                </Container>

                {/*<div>*/}
                {/*    <div>*/}
                {/*        <Div mb={10} bold fontSize={18}>사업자번호 인증</Div>*/}
                {/*        <Flex bc={'light'}>*/}
                {/*            <Div maxWidth={400} flexGrow={1}>*/}
                {/*                <Input block bc='white' type={'number'} maxLength={10} value={coRegistrationNo} onChange={onInputChange} placeholder={`'-' 제외한 숫자만 입력해주세요(10자리)`}/>*/}
                {/*            </Div>*/}
                {/*            <Div flexShrink={0}>*/}
                {/*                <Button noHover custom={`border-left: 1px solid ${color.light};`} bg={'green'} fg={'white'} height={45} onClick={onCheckClick} px={20}>확인</Button>*/}
                {/*            </Div>*/}
                {/*        </Flex>*/}
                {/*    </div>*/}

                {/*    {*/}
                {/*        producerTemp && (*/}
                {/*            <>*/}
                {/*                {*/}
                {/*                    [1].includes(producerTemp.joinStatus) && (*/}
                {/*                        <Div mt={16}>*/}
                {/*                            <Alert color="danger">*/}
                {/*                                상태 : 관리자의 승인을 기다리고 있습니다.<br/>*/}
                {/*                                최대한 빠른 검토 후 담당자 휴대폰 번호(카카오톡)로 결과 안내 드리겠습니다.*/}
                {/*                            </Alert>*/}
                {/*                        </Div>*/}
                {/*                    )*/}
                {/*                }*/}
                {/*                {*/}
                {/*                    [2].includes(producerTemp.joinStatus) && (*/}
                {/*                        <Div mt={16}>*/}
                {/*                            <Alert color="danger">*/}
                {/*                                상태 : 신청서가 <u>반려</u> 되었습니다.<br/>*/}
                {/*                                아래 사유를 확인 하시고 <u>신청서를 수정후 다시 제출</u>해 주세요.<br/><br/>*/}
                {/*                                {*/}
                {/*                                    `사유 : "${producerTemp.reason}"`*/}
                {/*                                }<br/><br/>*/}
                {/*                                <Button onClick={onModClick} p={16}>신청서 수정하기</Button>*/}
                {/*                            </Alert>*/}
                {/*                        </Div>*/}
                {/*                    )*/}
                {/*                }*/}
                {/*                {*/}
                {/*                    [3].includes(producerTemp.joinStatus) && (*/}
                {/*                        <Div mt={16}>*/}
                {/*                            <Alert color="success">*/}
                {/*                                상태 : 승인이 완료되었습니다.<br/>*/}
                {/*                                생산자용 <LinkButton onClick={onCreateLoginAccountClick}>로그인 계정을 생성</LinkButton> 해주세요.*/}
                {/*                            </Alert>*/}
                {/*                        </Div>*/}
                {/*                    )*/}
                {/*                }*/}
                {/*                {*/}
                {/*                    [4].includes(producerTemp.joinStatus) && (*/}
                {/*                        <Div mt={16}>*/}
                {/*                            <Alert color="success">*/}
                {/*                                상태 : 가입이 완료되었습니다.<br/>*/}
                {/*                                <Button fontSize={16} block px={10} py={16} mt={16} fg={'green'} bg={'white'} onClick={mLogin}>Mobile 로그인</Button>*/}
                {/*                                <Button fontSize={16} block px={10} py={16} mt={16} fg={'green'} bg={'white'} onClick={pcLogin}>PC 로그인</Button>*/}
                {/*                            </Alert>*/}
                {/*                        </Div>*/}
                {/*                    )*/}
                {/*                }*/}
                {/*            </>*/}
                {/*        )*/}
                {/*    }*/}

                {/*    <Div py={16} mt={16}>*/}
                {/*        /!*[필수 준비서류 사전 안내] *!/*/}
                {/*        <Strong fg={'green'}>"빠른 진행을 위해 서류를 미리 준 비해주세요"</Strong><br/>*/}
                {/*        <Flex dot textAlign={'flex-start'} my={10}>*/}
                {/*            <div>사업자 등록증</div>*/}
                {/*        </Flex>*/}
                {/*        <Flex dot textAlign={'flex-start'} my={10}>*/}
                {/*            <div>통장사본</div>*/}
                {/*        </Flex>*/}
                {/*        <Flex dot textAlign={'flex-start'} my={10}>*/}
                {/*            <div>통신 판매업 신고증 사본</div>*/}
                {/*        </Flex>*/}
                {/*        <Flex dot textAlign={'flex-start'} my={10}>*/}
                {/*            <div>견적서</div>*/}
                {/*        </Flex>*/}
                {/*    </Div>*/}



                {/*</div>*/}
            </Flex>
        </div>
    );
};

export default withRouter(CheckJoinStatus);
