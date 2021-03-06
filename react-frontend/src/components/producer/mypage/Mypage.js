import React, { Component, Fragment } from 'react';
import { Container, Row, Col, Button, ListGroup, ListGroupItem} from 'reactstrap'
import { faAngleRight, faAddressCard, faQuestionCircle, faBell, faCog, faUserCog, faWallet, faBullhorn } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Header } from '~/components/producer/Header/index'  //Header를 common으로 바꿔야 할지 고민필요.
import { getProducer, countRegularConsumer, countTotalOrder } from '../../../lib/producerApi'
import { doLogout, getLoginUserType } from '../../../lib/loginApi'
import { scOntGetBalanceOfBlct } from "../../../lib/smartcontractApi";

import ComUtil from '../../../util/ComUtil'

import classNames from 'classnames' //여러개의 css 를 bind 하여 사용할 수 있게함

import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Webview } from '../../../lib/webviewApi'
import Style from './MyPage.module.scss'

import { LoginLinkCard } from '~/components/common'

import { Redirect } from 'react-router-dom'

export default class Mypage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tokenBalance: '',
            loginUser:'notRender',  //로그인 판별여부가 결정날때까지 render방지 -> (로그인 된경우) 로그인 버튼 안그리기.
            regularConsumerCount:'',
            totalOrderCount:'',
            redirect: null
        }
    }

    // 화면 로딩시 로그인한 producer정보 호출
    async componentDidMount() {

        await this.refreshCallback(); //로그인 정보 가져오기

        console.log({loginUser: this.state.loginUser, localStorage: localStorage})

        console.log('Producer/MyPage - componentDidMount:', this.state.loginUser, this.state.loginUser.account);
        if (this.state.loginUser && this.state.loginUser.account) {

            //단골고객
            let {data:regularConsumerCount} = await countRegularConsumer(this.state.loginUser.producerNo);

            //누적구매건수
            let {data:totalOrderCount} = await countTotalOrder(this.state.loginUser.producerNo);

            //생산자 BLCT
            let {data:blctBalance} = await scOntGetBalanceOfBlct(this.state.loginUser.account);

            this.setState({
                tokenBalance: blctBalance,
                regularConsumerCount: regularConsumerCount,
                totalOrderCount: totalOrderCount
            });

        }
    }

    //react-toastify usage: this.notify('메세지', toast.success/warn/error);
    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_CENTER
        })
    }

    refreshCallback = async () => {
        const loginUserType = await getLoginUserType();
        //console.log('refreshCallback',loginUserType);
        let loginUser; // = await getConsumer();

        console.log({loginUser})

        if(loginUserType.data == 'consumer') {
            console.log('loginUserType : ERROR ====== 메뉴잘못 진입됨: 생산자용임 - 자동이동시도', loginUserType.data)

            //소비자용 mypage로 자동이동.
            Webview.movePage('/mypage');

        } else if (loginUserType.data == 'producer') {
            //console.log('loginUserType', loginUserType.data)
            loginUser = await getProducer();

            // if(!loginUser){
            //     Webview.openPopup('/login?userType=producer');
            // }
        } else {
            //Webview.openPopup('/login?userType=producer', true);
        }

        this.setState({
            loginUser: (loginUser) ? loginUser.data : '',
            loginUserType: loginUserType.data
        })
    }

    onClickLogin = () => {

        Webview.openPopup('/login?userType=producer'); //producer로그인 버튼 일단 유지 중.
    }

    onClickLogout = async (isConfirmed) => {
        isConfirmed && await doLogout();

        Webview.logoutUpdate();
        // localStorage.clear();

        //자기 페이지 강제 새로고침()
        // window.location = this.props.history.location.pathname
        this.setState({
            redirect: '/home/1'
        })

    }


    //정보관리
    onInfoModify = () => {
        alert('정보의 확인 및 수정이 필요한 경우 메일(cs@blocery.io)로 요청해 주시기 바랍니다.')
    }

    //알림
    onNotification = () => {
        this.props.history.push('/producer/notificationList')
    }

    //고객센터
    onConsumerCenter = () => {
        this.props.history.push('/producer/customerCenter')
    }

    //설정
    onSetting = () => {
        this.props.history.push('/producer/setting')
    }

    // 공지사항
    onNoticeList = () => {
        this.props.history.push('/producer/noticeList')
    }

    render() {

        if(this.state.redirect){
            return <Redirect to={this.state.redirect} />
        }


        return (
            <Fragment>
                <Header />
                {
                    this.state.loginUser === 'notRender' ? <div></div> : //로그인 여부 판단될 때까지 render방지.
                    (!this.state.loginUser) ?
                        <div className='p-4'>
                            <LoginLinkCard onClick={this.onClickLogin}/>
                        </div>
                        :
                        <div>
                            <div className='d-flex m-3'>
                                <div className={classNames('d-flex justify-content-center align-items-center',Style.circle)}>{this.state.loginUser.level?this.state.loginUser.level:'5'}등급</div>
                                <div className={classNames('ml-3 d-flex align-items-center flex-grow-1')}>
                                    <div className={'flex-grow-1'}><strong> {this.state.loginUser.farmName} </strong><br/>
                                                                            {this.state.loginUser.name}님
                                    </div>

                                    {/* 아래로 이동. <div style={{color:'gray'}} className={'flex-grow-1 text-right'} onClick={this.clickInfoModify}>*/}
                                        {/*<FontAwesomeIcon icon={faUserCog} color={'gray'} /> 정보관리*/}
                                    {/*</div>*/}
                                </div>
                            </div>
                            <hr/>
                            <div className='d-flex m-3'>
                                <div className={classNames(Style.centerAlign, 'flex-grow-1 flex-column cursor-pointer')}>
                                    <h4 className='text-info font-weight-border'><u>{this.state.regularConsumerCount}</u></h4>
                                    <div>단골고객</div>
                                </div>
                                <div className={classNames(Style.centerAlign, 'flex-grow-1 flex-column cursor-pointer')}>
                                    <h4 className='text-info font-weight-border'><u>{this.state.totalOrderCount}</u></h4>
                                    <div>누적구매건수</div>
                                </div>
                                <div className={classNames(Style.centerAlign, 'flex-grow-1 flex-column cursor-pointer')} >
                                    <h4 className='text-info font-weight-border'><u>{ComUtil.addCommas(ComUtil.roundDown(this.state.tokenBalance, 2))}</u></h4>
                                    <div>보유적립금(BLCT)</div>
                                    {/* 주문/정산관리로 이동 <div className={Style.textLink}>보유적립금(BLCT)</div>*/}
                                </div>
                            </div>

                            <Container>
                                <Row>
                                    <Col>
                                        <ListGroup>
                                            <ListGroupItem onClick={this.onInfoModify}>
                                                <div className='d-flex'>
                                                    <div><FontAwesomeIcon icon={faAddressCard} size={'1x'} /></div>
                                                    <div className='ml-2 flex-grow-1 cursor-pointer'>정보관리</div>
                                                    <div className='ml-2 text-info'></div>
                                                    <div className='ml-2'><FontAwesomeIcon icon={faAngleRight} /></div>
                                                </div>
                                            </ListGroupItem>
                                        </ListGroup>
                                    </Col>
                                </Row>
                                <br/>
                                <Row>
                                    <Col>
                                        <ListGroup>
                                            <ListGroupItem tag="a" action>
                                                <div className='d-flex' onClick={this.onNotification}>
                                                    <div><FontAwesomeIcon icon={faBell} size={'1x'} /></div>
                                                    <div className='ml-2 flex-grow-1'>알림</div>
                                                    <div className='ml-2 text-info'></div>
                                                    <div className='ml-2'><FontAwesomeIcon icon={faAngleRight} /></div>
                                                </div>
                                            </ListGroupItem>
                                            <ListGroupItem tag="a" action>
                                                <div className='d-flex' onClick={this.onNoticeList}>
                                                    <div><FontAwesomeIcon icon={faBullhorn} size={'1x'} /></div>
                                                    <div className='ml-2 flex-grow-1'>공지사항</div>
                                                    <div className='ml-2 text-info'></div>
                                                    <div className='ml-2'><FontAwesomeIcon icon={faAngleRight} /></div>
                                                </div>
                                            </ListGroupItem>
                                            <ListGroupItem onClick={this.onConsumerCenter} tag="a" action>
                                                <div className='d-flex'>
                                                    <div><FontAwesomeIcon icon={faQuestionCircle} size={'1x'} /></div>
                                                    <div className='ml-2 flex-grow-1'>고객센터</div>
                                                    <div className='ml-2'><FontAwesomeIcon icon={faAngleRight} /></div>
                                                </div>
                                            </ListGroupItem>
                                            <ListGroupItem onClick={this.onSetting} tag="a" action>
                                                <div className='d-flex'>
                                                    <div><FontAwesomeIcon icon={faCog} size={'1x'} /></div>
                                                    <div className='ml-2 flex-grow-1'>설정</div>
                                                    <div className='ml-2'><FontAwesomeIcon icon={faAngleRight} /></div>
                                                </div>
                                            </ListGroupItem>
                                            <ListGroupItem tag="a" action>
                                                <div onClick={() => {
                                                    if(window.confirm('로그아웃 하시겠습니까?'))
                                                        this.onClickLogout(true)
                                                }}>
                                                    로그아웃
                                                </div>
                                            </ListGroupItem>



                                        </ListGroup>
                                    </Col>
                                </Row>
                            </Container>
                            <ToastContainer/>
                        </div>
                }


            </Fragment>

        )
    }
}

