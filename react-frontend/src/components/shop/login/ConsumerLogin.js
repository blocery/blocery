import React, { Component, Fragment, useState, useEffect, useRef } from 'react'
import { Container, Input, Form, Row, Col, Fade, Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap'
import axios from 'axios'
import { Server } from '../../Properties';
import { Webview } from "~/lib/webviewApi";
import {doKakaoLogin, doLogin, getLoginUser} from "~/lib/loginApi";
import { getConsumerEmail } from "~/lib/shopApi";
import { resetPassword } from "~/lib/adminApi";
import { EMAIL_RESET_TITLE, getEmailResetContent } from '~/lib/mailApi';
import { ModalPopup, MarketBlyLogoColorRectangle } from '~/components/common'
import Style from './LoginTab.module.scss'
import {FaCheckCircle} from 'react-icons/fa'
import {RiKakaoTalkFill} from 'react-icons/ri'
import classNames from 'classnames'
import ComUtil from '~/util/ComUtil'
import styled from 'styled-components'
import ConsumerKakaoJoin from '~/components/shop/join/ConsumerKakaoJoin'
import {withRouter} from 'react-router-dom'
import {useRecoilState} from "recoil";
import {consumerState} from "~/recoilState";
import {useModal} from "~/util/useModal";
import {Flex, Button, Div, Span, Space, Link, GridColumns} from "~/styledComponents/shared";
import {color} from "~/styledComponents/Properties";
import {getValue} from "~/styledComponents/Util";
import useLogin from "~/hooks/useLogin";

import {IoIosArrowUp, IoIosArrowDown} from 'react-icons/io'
import Checkbox from "~/components/common/checkboxes/Checkbox";
import {B2cTermsOfUse11} from "~/components/common/termsOfUses";
import TermsOfUseCheckBox from "~/components/common/termsOfUses/TermsOfUseCheckBox";
import TG from "~/components/common/tg/TG";
import LoginPasswordInput from "~/components/common/inputs/LoginPasswordInput";

const StyledInput = styled(Input)`
    padding: ${getValue(30)} ${getValue(25)};
    border: 1px solid whitesmoke;    
    border-bottom: 2px solid #acacac;
    margin-bottom: ${getValue(18)}    
`

const DivDivder = styled.div`
    position: relative;
    width: 95%;
    height: 58.5px;
    margin: 0 auto;
    line-height: 58.5px;
    text-align: center;
`
const DivDivderLine = styled.div`
    position: absolute;
    width: 100%;
    height: 1px;
    margin-top: 29.25px;
    background-color: #d2d2d6;
`
const DivDivderText = styled.div`
    position: relative;
    width: 200px;
    height: 48.5px;
    padding: 5px 0;
    margin: 0 auto;
    line-height: 58.5px;
    font-size: 11px;
    color: #d2d2d6;
    text-align: center;
    background-color: #fff;
`

const ConsumerLogin = (props) => {
    const {...rest} = props
    const {closeLoginModal} = useLogin()
    const [isConsumer, setConsumerState] = useState(true)

    // //tab바뀔때
    const changeState = (state) => {
        //tab바뀔때 약관동의도 변경. state=isConsumer
        setAgree(localStorage.getItem(((state?"":"producer") + "termsOfUseChecked")) || false)

        setConsumerState(state)
    }

    const [consumer, setConsumer] = useRecoilState(consumerState)

    const targetEmail = useRef()
    const [modalOpen, , selected, setSelected, setModalState] = useModal()

    const [agree, setAgree] = useState(localStorage.getItem(((isConsumer?"":"producer") + "termsOfUseChecked")) || false)

    const [state, setState] = useState({
        fadeEmail: false, //email 미입력시 에러메시지 여부
        fadeEmailType: false,
        fadePassword: false,
        fadeError: false,   //email or pw 가 서버에 없을때 에러메시지 여부
        autoLogin: true,
        isOpen: false,
        //kakaoJoinOpen: false,
        kakaoJoinInfo:{
            consumerInfo:null,
            token:"",
            refreshToken:""
        },
        stopLoginOpen: false,
        stopLoginReJoinDate:''
    });

    useEffect(() => {

        async function fetch() {
            //// RN2.혹시 RN(React Native)로부터 accessKey파라미터로 kakao 로그인호출 되면. /////////////////

            //doKakaoLogin(access_token) 바로 호출.  test필요..
            //USAGE:  login?accessToken="accessToken...."
            //console.log('this.props.location:' + this.props.location);
            //TODO 고쳐야할듯?
            if (!props.location) return;

            const params = new URLSearchParams(props.location.search)
            let accessToken = params.get('accessToken');
            let refreshToken = params.get('refreshToken')||(localStorage.getItem("refreshToken")||"");
            if (accessToken) {

                //React Native 에소 호출된 경우.. 로그인 확인 후, 가입페이지로 이동 or 로그인완료 처리.
                //this.kakaoLoginWithAccessKey(accessToken);
                await kakaoLoginWithAccessKey(accessToken,refreshToken);
            }
        }

        fetch()

    }, []);





    const onLoginClicked = async (event) => {
        event.preventDefault();

        if (!agree) {
            alert('이용약관에 동의해 주세요.')
            return
        }

        //this.storage.setItem('email', 'blocery@ezfarm.co.kr')


        //Fade All reset
        setState({
            ...state,
            fadeEmail: false, fadePassword:false, fadeEmailType:false, fadeError:false
        });

        //input ERROR check
        let data = {};
        data.email = event.target[0].value.trim();
        data.valword = event.target[1].value;
        data.userType = isConsumer ? 'consumer' : 'producer'

        if (!data.email) {
            setState({...state, fadeEmail: true});
            return;
        }

        console.log({data})

        const emailRule = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
        if (!emailRule.test(data.email)) {
            setState({...state, fadeEmailType: true});
            return;
        }

        if (!data.valword) {
            setState({...state, fadePassword: true});
            return;
        }

        const response = await doLogin(data)

        let error = false

        //console.log(response);
        if (response.data.status === Server.ERROR){
            // setState({...state, fadeError: true}); //100: login ERROR
            alert('이메일 또는 비밀번호가 잘못 되었습니다.')
            error = true
        }else{
            let loginInfo = response.data;

            console.log({loginInfo})

            //recoil 세팅
            setConsumer(ComUtil.getConsumerByLoginUser(loginInfo))


            //아래 코드들 함수로 이동 - 잘안씀 주로 recoil이용.
            ComUtil.setLocalStorageLogin(data);


            Webview.updateFCMToken({userType: 'consumer', userNo: loginInfo.uniqueNo})

            if (!isConsumer) {
                Webview.updateFCMToken({userType: 'producer', userNo: loginInfo.uniqueNo - 900000000}) //9억빼면 소비자 번호
            }

            //팝업에선 작동한해서 막음: Webview.loginUpdate(); //하단바 update용.

            if (isConsumer) {
                localStorage.setItem("termsOfUseChecked", true)
            }else { //producer
                localStorage.setItem("producertermsOfUseChecked", true)
            }

            movePage()
        }

    }

    const closePopup = () => { //팝업 close는 axios와 분리.
        Webview.closePopup();  //팝업만 닫음.
        // Webview.closePopupAndMovePage('/');    //팝업닫으면서 홈으로 이동
    }

    // const autoLoginCheck = (e) => {
    //     // let autoLoginFlag = e.target.checked;
    //     // console.log('autoLoginFlag:' + autoLoginFlag);
    //
    //     setState({...state, autoLogin:!state.autoLogin});
    // }


    //아이디 찾기
    const onIdSearchClick = () => {
        //모달타입
        setSelected('id')
        togglePopup()
    }

    //비밀번호 찾기
    const onPwSearchClick = () => {
        //모달타입
        setSelected('pw')
        togglePopup()
    }

    const onJoinClick = () => {
        //미션이벤트용 날짜 check - 베타오픈 후에는 제거해도 됨
        if (Server._serverMode() === 'production') {
            let now = ComUtil.utcToString(ComUtil.getNow());
            //console.log(now);

            if (ComUtil.compareDate(now, '2019-12-30') < 0) {

                alert("12월 30일부터 가입과 이벤트참여가 가능합니다");
                return;
            }
        }

        Webview.openPopup('/join');
    }

    const togglePopup = () => {
        // setState({
        //     ...state,
        //     isOpen: !state.isOpen
        // })
        setModalState(!modalOpen)
    }

    // 비밀번호 초기화 확인 클릭
    const onResetValword = async() => {

        let response = await getConsumerEmail(targetEmail.current.value);
        let userType = 'consumer';
        //console.log("getConsumerEmail==",response)
        if (!response.data) { //= (response.data == '' || response.data == null) {     // 없는 이메일
            alert("가입정보가 없는 이메일입니다.")
        } else {
            let {data:newValword} = await resetPassword(userType, targetEmail.current.value);
            if (newValword.length === 8) {
                sendEmail(newValword, targetEmail.current.value);
                alert("변경된 비밀번호가 메일로 발송되었습니다. 시간이 지나도 메일이 수신되지 않을 경우 스팸메일함도 확인해주세요.");

                setState({
                    ...state,
                    isOpen: !state.isOpen
                })
            } else {
                alert("비밀번호 찾기에 실패했습니다. 다시 시도해주세요.")
            }
        }
    }

    // 초기화된 비밀번호 메일 전송
    const sendEmail = async(newValword, recipient) => {
        let data = {};

        data.recipient = recipient;
        data.subject = EMAIL_RESET_TITLE;
        data.content = getEmailResetContent(newValword);

        await axios(Server.getRestAPIHost() + '/sendmail',
            {
                method: "post",
                data: data,
                withCredentials: true,
                credentials: 'same-origin'
            })
            .then((response) => {
                //console.log(response);
            })
            .catch(function (error) {
                //console.log(error)
            });
    }

    //닫기
    const onClose = () => {
        // setState({
        //     ...state,
        //     isOpen: false
        // })
        setModalState(false)
    }

    // //history.push 로 진행되면 삭제 되어도 무관할듯 함
    // const kakaodoJoinSuccessed = async (consumerInfo) => {
    //     // setState({
    //     //     ...state,
    //     //     kakaoJoinOpen: false
    //     // });
    //
    //     Webview.updateFCMToken({userType: 'consumer', userNo: consumerInfo.consumerNo})
    //     // props.history.push('/joinComplete?name='+consumerInfo.name+'&email='+consumerInfo.email);
    //     props.history.push('/joinComplete');
    // }

    // const KakaoJoinClose = () => {
    //     setState({
    //         ...state,
    //         kakaoJoinOpen: false
    //     })
    // }

    const KakaoLogin = () => {

        // const that = this;

        //RN1. mobileApp이면 ReactNative 호출..
        if(ComUtil.isMobileApp()) { //모바일앱 카카오로그인 - 202012 추가

            Webview.kakaoAppLogin(); //RN호출..

        }else { //웹 카카오로그인 - 202011기존코드

            //RN1-1. mobileApp이 아니면 웹로그인(아래)호출.
            window.Kakao.Auth.login({
                // 세션이 종료된 이후에도 토큰을 유지.
                persistAccessToken: true,
                // 세션이 종료된 이후에도 refresh토큰을 유지.
                persistRefreshToken: true,
                success: async function (response) {
                    //console.log(response)
                    const access_token = response.access_token;
                    const refresh_token = response.refresh_token;
                    //202012 RN을 위해 함수로 분리..
                    await kakaoLoginWithAccessKey(access_token, refresh_token);


                },
                fail: function (error) {
                    //console.log(error)
                },
            })
        }
    }

    //ReactNative(RN)공용사용을 위해  분리. 202012
    // code: -1 - 가져오기 실패
    // code: 0  - 가져오기 성공 (로그인 성공)
    // code: 1 -  회원가입 중=>  결제비번 입력창으로 redirect 필요.
    // code: 20210101 - 8자리면서 날짜가 나오면 재가입 가능일
    const kakaoLoginWithAccessKey = async(access_token, refresh_token) => {

        const {data:res} = await doKakaoLogin(access_token, refresh_token);
        //console.log("doKakaoLogin===",res)
        Webview.appLog("doKakaoLogin===")
        Webview.objAppLog(res)

        const code = res.code;
        if(code > 1 && code.toString().length == 8){
            //console.log("doKakaoLogin2=code==",code)
            setState({
                ...state,
                stopLoginReJoinDate:code,
                stopLoginOpen:true
            })
        } else if(code == 1){
            //consumerNo (0보다 크면) -  회원가입 중인 consumerNo =>  결제비번 입력창으로.

            // const consumerInfo = res.consumer;
            // setState({
            //     ...state,
            //     kakaoJoinInfo:{
            //         consumer:consumerInfo,
            //         token:consumerInfo.token,
            //         refreshToken:consumerInfo.refreshToken
            //     },
            //     kakaoJoinOpen:true
            // })

            //로그인 모달창 닫기
            closeLoginModal()

            //가입 페이지로 이동
            props.history.push({
                pathname: '/consumerKakaoJoin',
                state: {consumer : res.consumer} /* {consumer: {...}} */
            })

        } else if(code == 0){
            // 로그인 처리
            // 0  - 가져오기 성공 (로그인 성공)
            const consumerInfo = res.consumer;
            const loginInfo = res.loginInfo;
            //recoil 세팅
            setConsumer(ComUtil.getConsumerByLoginUser(loginInfo));

            localStorage.removeItem('authType');
            localStorage.removeItem('userType');
            localStorage.removeItem('email');
            localStorage.removeItem('valword');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');

            localStorage.setItem('authType', 1);
            localStorage.setItem('userType', 'consumer');
            localStorage.setItem('token', consumerInfo.token);
            localStorage.setItem('refreshToken', consumerInfo.refreshToken);
            localStorage.setItem('autoLogin', 1);
            sessionStorage.setItem('logined', 1); //1 : true로 이용중
            Webview.updateFCMToken({userType: 'consumer', userNo: loginInfo.uniqueNo})

            //console.log('kakao Login OK: + history.goback');
            // closePopup();

            movePage()

        } else{
            if(code == -1){
                // -1 - 가져오기 실패
                //console.log("-1 카카오톡 정보 가져오기 실패");
            }else{
                //console.log("-1 카카오톡 정보 가져오기 실패");
            }
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
        }

    }

    const movePage = (customUrl) => {
        //샵블리 버전
        // if(ComUtil.isMobileAppIos()){
        //마켓블리 버전
        if(ComUtil.isMobileApp()){
            Webview.closePopup();
            return;
        }
        //팝업을 통해 팝업창을 닫기 위해 주로쓰임 : LoginModal.js 참조
        Webview.objAppLog(props)
        if (props.callback && typeof props.callback === 'function')
            props.callback()
        else {
            //사용자가 강제로 이동하거나 링크를 통해 PrivateRoute 에서 로그인되어있지 않다고 걸리면 들어옴
            //별도의 callback 을 넘기지 않았을 때는 원래 이동 하려는 location 으로 이동 시켜줌
            if (props.history.location.state && props.history.location.state.from) {
                const movePage = props.history.location.state.from
                //원래 이동 하려는 url로 이동 (현재 로그인 페이지로 오기 전 PrivateRoute 에서 state.from 에 담아둔 값을 이용)
                console.log("movePage:",movePage)
                Webview.appLog("movePage:"+movePage)
                props.history.replace(movePage)
            }else{
                //  /login 으로 들어 왔을 경우는 "뒤로가기"
                console.log("movePage:goBack")
                Webview.appLog("movePage:goBack")
                //로그인 페이지를 직접 쳐서 들어온 경우 history.goBack 하면 샵블리를 벗어나 버리므로 강제로 홈으로 이동하게 변경 함
                props.history.replace("/home")
            }
        }
    }

    const StopLoginClose = () => {
        setState({
            ...state,
            stopLoginOpen: false
        })
    }

    const onProducerLogin = () => {
        props.history.replace('/producer/login')
    }

    const [emailFormOpen, setEmailFormOpen] = useState(false)
    const toggleEmailForm = () => {
        setEmailFormOpen( !emailFormOpen)
    }

    //모달로 띄워진 상태라면 callback 에 onClose 함수가 있을꺼라서 아래처럼 실행 해 줌
    const closeModal = () => {
        if (props.callback && typeof props.callback === 'function')
            props.callback()
    }

    const toggleAgree = e => {
        const newAgree = !agree
        setAgree(newAgree)
    }
    // const [termsOfUseModal, setTermsOfUseModal] = useState(false)
    // const toggleTermsOfUseModal = () => {
    //     setTermsOfUseModal(!termsOfUseModal)
    // }

    let appleReviewMode = ComUtil.isMobileAppIosAppleReivew(); //애플 review모드일때는 kakaoLogin숨기기.

    return(

        <Div position={'relative'} {...rest} >

            {/* 생산자 소비자 탭 */}
            <Flex justifyContent={'center'}  bg={'veryLight'} mb={50}>
                <Space spaceGap={17} fg={'secondary'} lineHeight={'1'}>
                    <Div p={16} cursor={1} bold fg={isConsumer && 'black'} onClick={changeState.bind(this, true)}>소비자</Div>
                    <span>|</span>
                    <Div p={16} cursor={1} bold fg={!isConsumer && 'black'} onClick={changeState.bind(this, false)}>생산자</Div>
                </Space>
            </Flex>
            {
                isConsumer && <ConsumerAdd />
            }
            {
                !isConsumer &&  <ProducerAdd />
            }
            <Div>
                <Div p={16} pb={25}>
                    {
                        (!appleReviewMode && isConsumer) &&
                        <Div>
                            <Button height={60} bg={'kakao'} fg={'#783c00'} block onClick={KakaoLogin}>
                                <RiKakaoTalkFill size={30}/><span className='f18'>카카오톡으로 로그인</span>
                            </Button>

                            <Space cursor={1} px={16} my={25} bg={'white'} fg={'secondary'} justifyContent={'center'}
                                   onClick={toggleEmailForm}
                            >
                                <Span fg={'dark'}>2020년 이전 이메일 가입자 로그인</Span>
                                {
                                    !emailFormOpen ? <IoIosArrowDown /> : <IoIosArrowUp />
                                }
                            </Space>
                        </Div>
                    }

                    {
                        (!isConsumer || emailFormOpen || appleReviewMode) && (
                            <Div bg={'white'}>
                                <Form onSubmit={onLoginClicked}>
                                    <StyledInput placeholder={isConsumer ? '소비자 아이디(이메일)':'생산자 아이디(이메일)'} />
                                    {
                                        state.fadeEmail && <CustomFade>이메일 주소를 입력해 주세요.</CustomFade>
                                    }
                                    {
                                        state.fadeEmailType && <CustomFade>이메일 주소를 양식에 맞게 입력해 주세요.</CustomFade>
                                    }
                                    {/*<StyledInput type="password" placeholder="비밀번호" />*/}
                                    <LoginPasswordInput placeholder="비밀번호" />

                                        {
                                        state.fadePassword && <CustomFade>비밀번호를 입력해 주세요.</CustomFade>
                                    }
                                    {
                                        state.fadeError && <CustomFade>아이디/비밀번호를 확인해 주세요.</CustomFade>
                                    }
                                    <TermsOfUseCheckBox
                                        //innerRef={agreeRef}
                                        checked={agree}
                                        onChange={toggleAgree}
                                        disabled={localStorage.getItem(((isConsumer?"":"producer") + "termsOfUseChecked")) ? true : false}
                                    />

                                    {/*<Space spaceGap={8} my={16}>*/}
                                    {/*    <Checkbox checked={agree} onChange={toggleAgree}*/}
                                    {/*              disabled={localStorage.getItem(((isConsumer?"":"producer") + "termsOfUseChecked")) ? true : false}></Checkbox>*/}

                                    {/*    <Div onClick={toggleTermsOfUseModal}><u>이용약관 동의</u></Div>*/}
                                    {/*</Space>*/}


                                    <Button type='submit' mt={7} mb={25} bg={'green'} fg={'white'} block fontSize={18} height={60}>{isConsumer ? '소비자 ' : '생산자 '} 로그인</Button>

                                    <Flex justifyContent={'center'} fontSize={14} fg={'dark'}>
                                        <Div cursor={1} onClick={onIdSearchClick}>아이디 찾기</Div>
                                        <Div mx={16}>|</Div>
                                        <Div cursor={1} onClick={onPwSearchClick}>비밀번호 찾기</Div>
                                    </Flex>
                                </Form>
                            </Div>
                        )
                    }


                </Div>

                <Div mt={20} mb={30}>
                    <Flex justifyContent={'center'} mb={8}>
                        <Space fg={'dark'} fontSize={14} spaceGap={7}>
                            <Div flexGrow={1}><Link onClick={closeModal} to={'/mypage/termsOfUse'}>이용약관</Link></Div>
                            <div>|</div>
                            <Div flexGrow={1}><Link onClick={closeModal} to={'/mypage/privacyPolicy'}>개인정보처리방침</Link></Div>
                            <div>|</div>
                            <Div flexGrow={1}><Link onClick={closeModal} to={'/producerCenter/join/intro'}>샵블리 입점센터</Link></Div>
                        </Space>
                    </Flex>
                    <Div fg={'#717171'} fontSize={13} textAlign={'center'}>Copyrightⓒ <Span fg={'darkBlack'}><b>Ezfarm</b></Span> All Rights Reserved.</Div>
                </Div>

            </Div>

            {/*<Modal isOpen={termsOfUseModal} toggle={toggleTermsOfUseModal} centered>*/}
            {/*    <ModalHeader toggle={toggleTermsOfUseModal} >이용약관 동의</ModalHeader>*/}
            {/*    <ModalBody className={'p-0'}>*/}
            {/*        <B2cTermsOfUse11/>*/}
            {/*    </ModalBody>*/}
            {/*    <ModalFooter>*/}
            {/*        <Button bg="white" bc={'light'} px={20} onClick={toggleTermsOfUseModal}>확인</Button>*/}
            {/*    </ModalFooter>*/}
            {/*</Modal>*/}

            <Div>
                {
                    modalOpen && selected === 'id' && <ModalPopup title={'알림'} content={'가입 시 입력하신 성함, 이메일, 연락처 등과 함께 문의사항을 고객센터로(cs@blocery.io) 메일을 보내주시거나, 카카오채널(샵블리) 1:1 채팅으로 문의주시면 확인 후 회신 드리도록 하겠습니다.'} onClick={onClose}></ModalPopup>
                }
                {
                    modalOpen && selected === 'pw' &&
                    <Modal isOpen={true} centered>
                        <ModalHeader>비밀번호 찾기</ModalHeader>
                        <ModalBody>고객님의 비밀번호를 초기화하여 결과를 이메일 발송해드립니다.</ModalBody>
                        <ModalBody>(카카오톡 연동고객은 해당되지 않습니다.<br/> 카카오톡 비밀번호는 카카오에 문의하시기 바랍니다.)</ModalBody>
                        <ModalBody>
                            <Input type="text" placeholder="샵블리에 가입하신 Email을 입력해주세요"
                                   innerRef = {targetEmail}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button color="info" onClick={onResetValword}>확인</Button>
                            <Button color="secondary" onClick={onClose}>취소</Button>
                        </ModalFooter>
                    </Modal>
                }
                {/*{*/}
                {/*    state.kakaoJoinOpen &&*/}
                {/*    <Modal size="lg" isOpen={true} centered>*/}
                {/*        <ModalHeader>소비자 회원가입</ModalHeader>*/}
                {/*        <ModalBody>*/}
                {/*            <ConsumerKakaoJoin*/}
                {/*                kakaoJoinInfo={state.kakaoJoinInfo}*/}
                {/*                kakaodoJoinSuccessed={kakaodoJoinSuccessed}*/}
                {/*            />*/}
                {/*        </ModalBody>*/}
                {/*        <ModalFooter>*/}
                {/*            <Button color="secondary" onClick={KakaoJoinClose}>취소</Button>*/}
                {/*        </ModalFooter>*/}
                {/*    </Modal>*/}
                {/*}*/}
                {
                    state.stopLoginOpen &&
                    <Modal size="lg" isOpen={true} centered>
                        <ModalHeader>알림</ModalHeader>
                        <ModalBody>
                            탈퇴 후 재가입은 90일 이후에 가능합니다. <br/>
                            재가입 가능일 : {state.stopLoginReJoinDate && ComUtil.intToDateString(state.stopLoginReJoinDate)}
                        </ModalBody>
                        <ModalFooter>
                            <Button color="secondary" onClick={StopLoginClose}>확인</Button>
                        </ModalFooter>
                    </Modal>
                }
            </Div>

            {/*{WIDERPLANET SCRIPT START 2022.06.07}*/}
            {
                consumer && <TG ty={"Login"} />
            }
            {/*{WIDERPLANET SCRIPT END 2022.06.07}*/}
        </Div>
    )
}
export default withRouter(ConsumerLogin);


function CustomFade(props){
    return (
        <div className='mb-3'>
            <Fade in={true} className={'small text-danger'}>{props.children}</Fade>
        </div>
    )
}

function ConsumerAdd() {

    let appleReviewMode = ComUtil.isMobileAppIosAppleReivew(); //애플 review모드일때는 kakaoLogin숨기기.

    return(
        appleReviewMode?
            <Div px={29} fontSize={24} lineHeight={30} mb={59} fw={900}>
                지금<br/>
                샵#블리에 로그인하면<br/>
                <Span fg={'green'}>1 Point </Span> 및 <br/>
                다양한 활동 혜택을 드려요!
            </Div>
            :
            <Div px={29} fontSize={24} lineHeight={30} mb={59} fw={900}>
                지금<br/>
                샵#블리에 가입하면<br/>
                <Span fg={'green'}> {(ComUtil.getNowYYYYMM()==='202205')?'50,000원 쿠폰팩':'100,000원 쿠폰팩'}</Span>을<br/>
                {/*<Span fg={'green'}> 50,000원 쿠폰팩</Span>을<br/>*/}
                즉시 지급합니다!
            </Div>
    )
}

function ProducerAdd() {
    return(
        <Div px={29} fontSize={24} lineHeight={30} mb={59} fw={900}>
            지금<br/>
            생산자로 로그인하면<br/>
            <Span fg={'green'}>다양한 활동 혜택</Span>을 드려요!
        </Div>
    )
}