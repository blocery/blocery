import React, { Component, Fragment } from 'react'
import axios from 'axios'
import { Server, Const } from '../../Properties'
import { Container, Button, Row, Col, Form, FormGroup, InputGroup, Input, Label, Modal, ModalHeader, ModalBody, ModalFooter, Fade } from 'reactstrap'
import { ShopXButtonNav, MarketBlyLogoColorRectangle } from '../../common'
import {Webview} from "../../../lib/webviewApi";
import ModalPopup from "../../common/modals/ModalPopup";
import {getProducerEmail} from "../../../lib/producerApi";
import {resetPassword} from "../../../lib/adminApi";
import {EMAIL_RESET_TITLE, getEmailResetContent} from "../../../lib/mailApi";
import Style from './ProducerLogin.module.scss'
import ComUtil from '~/util/ComUtil'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import classNames from 'classnames'
export default class ProducerLogin extends Component {
    constructor(props) {
        super(props);

        this.state = {
            fadeEmail: false, //email 미입력시 에러메시지 여부
            fadeEmailType: false,
            fadePassword: false,
            fadeError: false,   //email or pw 가 서버에 없을때 에러메시지 여부
            autoLogin: false,
            isOpen: false
        }
    }

    onLoginClicked = async (event) => {

        event.preventDefault();

        this.setState({
            fadeEmail: false, fadePassword:false, fadeEmailType:false, fadeError:false
        });

        // input ERROR check
        let data = {};
        data.email = event.target[0].value.trim();
        data.valword = event.target[1].value;
        data.userType = 'producer'

        if(!data.email) {
            this.setState({fadeEmail: true});
            return;
        }

        const emailRule = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
        if (!emailRule.test(data.email)) {
            this.setState({fadeEmailType: true});
            return;
        }

        if (!data.valword) {
            this.setState({fadePassword: true});
            return;
        }

        await axios(Server.getRestAPIHost() + '/login',
            {
                method: "post",
                data:data,
                withCredentials: true,
                credentials: 'same-origin'
            })
            .then((response) => {
                if (response.data.status === Server.ERROR)             //100: login ERROR
                    this.setState({fadeError: true});
                else
                {
                    let loginInfo = response.data;

                    localStorage.clear();

                    //쿠키(localStorage)에 login된 userType저장. - 필요하려나.
                    localStorage.setItem('userType', data.userType);
                    localStorage.setItem('account', loginInfo.account); //geth Account
                    localStorage.setItem('email', data.email);
                    localStorage.setItem('valword', ComUtil.encrypt(data.valword));
                    localStorage.setItem('autoLogin', this.state.autoLogin? 1:0);
                    //localStorage.setItem('logined', 1);//true);  1=true로 이용 중.

                    sessionStorage.setItem('logined', 1);
                    console.log('loginInfo : ===========================',loginInfo);
                    //self.closePopup();
                    //this.props.history.push('/')

                    Webview.updateFCMToken({userType: data.userType, userNo: loginInfo.uniqueNo})

                    //팝업에선 작동안해서 막음: Webview.loginUpdate();
                }
            })
            .catch(function (error) {
                console.log(error);
                alert('로그인 오류:'+error);
            });

        if (!this.state.fadeError) { //로그인 성공이면

            this.closePopup();
        }

    }

    closePopup = () => {
        Webview.closePopup();
        // Webview.closePopupAndMovePage('/');    //팝업닫으면서 홈으로 이동
    }

    autoLoginCheck = (e) => {
        let autoLoginFlag = e.target.checked;

        this.setState({autoLogin:autoLoginFlag});
    }

    //아이디 찾기
    onIdSearchClick = () => {
        this.setState({type: 'id'})
        this.togglePopup()
    }

    //비밀번호 찾기
    onPwSearchClick = () => {
        this.setState({type: 'pw'})
        this.togglePopup()
    }

    onJoinClick = () => {
        Webview.winOpenPopup('/mypage/queInfo');
        // this.setState({
        //     type: 'join'
        // })
        // this.togglePopup()

    }

    togglePopup = () => {
        this.setState({
            isOpen: !this.state.isOpen
        })
    }

    // 비밀번호 초기화 확인 클릭
    onResetValword = async() => {
        let response;
        let userType;

        response = await getProducerEmail(this.targetEmail.value);
        userType = 'producer';

        if(!response.data) {
            alert("가입정보가 없는 이메일입니다.")
        } else {
            let {data:newValword} = await resetPassword(userType, this.targetEmail.value);
            if (newValword.length === 8) {
                this.sendEmail(newValword, this.targetEmail.value);
                alert("변경된 비밀번호가 메일로 발송되었습니다. 시간이 지나도 메일이 수신되지 않을 경우 스팸메일함도 확인해주세요.");

                this.setState({
                    isOpen: !this.state.isOpen
                })
            } else {
                alert("비밀번호 찾기에 실패했습니다. 다시 시도해주세요.");
            }
        }
    }

    // 초기화된 비밀번호 메일 전송
    sendEmail = async(newValword, recipient) => {
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
                console.log(response);
            })
            .catch(function (error) {
                console.log(error)
            });
    }

    onClose = () => {
        this.setState({
            isOpen: false
        })
    }

    // 소비자로그인으로 이동
    moveToConsumerLogin = () => {
        this.props.history.push('/login')
    }

    render() {
        return (
            <Fragment>
                {/*<ShopXButtonNav close>생산자 로그인</ShopXButtonNav>*/}
                <Container fluid className={Style.wrap}>
                    <div className='d-flex justify-content-center align-items-center'>
                        <MarketBlyLogoColorRectangle className={''} style={{textAlign:'center', width: 120, paddingTop: 10, paddingBottom: 10}}/>
                    </div>
                    <Form onSubmit={this.onLoginClicked}>
                        <Row>
                            <Col xs={12}>
                                <Input className={classNames('rounded-0 mb-3', Style.textBox)} placeholder="생산자 아이디(이메일)"/>
                                {
                                    this.state.fadeEmail && <CustomFade>이메일 주소를 입력해 주세요.</CustomFade>
                                }
                                {
                                    this.state.fadeEmailType && <CustomFade>이메일 주소를 양식에 맞게 입력해 주세요.</CustomFade>
                                }
                                <Input className={classNames('rounded-0 mb-3', Style.textBox)}  type="password" placeholder="비밀번호"/>
                                {
                                    this.state.fadePassword && <CustomFade>비밀번호를 입력해 주세요.</CustomFade>
                                }
                                {
                                    this.state.fadeError && <CustomFade>아이디/비밀번호를 확인해 주세요.</CustomFade>
                                }
                                <Button type='submit' color={'info'} className={'rounded-0 p-3 mt-4 mb-3'} block ><span className='f20'>생산자 로그인</span></Button>
                                <span onClick={this.autoLoginCheck} className='d-flex align-items-center'>
                                    <FontAwesomeIcon icon={faCheckCircle} size={'2x'} className={classNames('mr-2', this.state.autoLogin ? 'text-info' : 'text-secondary')} />
                                    <div className='text-dark f13'> 자동로그인 </div>
                                    <div className='text-center text-secondary f13 font-weight-normal ml-auto cursor-pointer' onClick={this.props.onClick.bind(this, 'consumer')}>
                                        <u>소비자 로그인</u>
                                    </div>
                                </span>
                                <hr/>
                                <div class='d-flex justify-content-center f13 text-secondary'>
                                    <span className='mr-2 cursor-pointer' onClick={this.onIdSearchClick}>아이디 찾기</span>
                                    <span className='mr-2'>|</span>
                                    <span className='mr-2 cursor-pointer' onClick={this.onPwSearchClick}>비밀번호 찾기</span>
                                    <span className='mr-2'>|</span>
                                    <span className='mr-2 cursor-pointer' onClick={this.onJoinClick}>생산자 입점문의</span>
                                </div>
                            </Col>
                        </Row>
                    </Form>
                    <br/>
                </Container>
                {
                    this.state.isOpen && this.state.type === 'id' && <ModalPopup title={'알림'} content={'가입 시 입력하신 이름을 적어 고객센터로(cs@blocery.io) 메일을 보내주시면 답신 드리도록 하겠습니다.'} onClick={this.onClose}></ModalPopup>
                }
                {
                    this.state.isOpen && this.state.type === 'pw' &&
                    <Modal isOpen={true} centered>
                        <ModalHeader>비밀번호 찾기</ModalHeader>
                        <ModalBody>고객님의 비밀번호를 초기화하여 결과를 이메일 발송해드립니다.</ModalBody>
                        <ModalBody>
                            <Input type="text" placeholder="Email을 입력해주세요"
                                   innerRef = {(email) => {this.targetEmail = email}}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button color="info" onClick={this.onResetValword}>확인</Button>
                            <Button color="secondary" onClick={this.onClose}>취소</Button>
                        </ModalFooter>
                    </Modal>
                }
                {
                    this.state.isOpen && this.state.type === 'join' && <ModalPopup title={'알림'} content={'지금은 생산자 모집 기간이 아닙니다'} onClick={this.onClose}></ModalPopup>
                }
            </Fragment>
        )
    }
}
function CustomFade(props){
    return (
        <div className='mb-3'>
            <Fade in={true} className={'small text-danger'}>{props.children}</Fade>
        </div>
    )
}
