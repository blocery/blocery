import React, {useState, useEffect, Fragment} from 'react'
import {Container, Row, Col, Form, Input, Button, Fade} from 'reactstrap'
import {Div, Span, Img, Flex, Right, WhiteSpace} from '~/styledComponents/shared/Layouts';

import Style from "~/components/shop/login/LoginTab.module.scss";
import {withRouter} from "react-router-dom";
import classNames from 'classnames'
import {MarketBlyLogoColorRectangle} from "~/components/common";
import BackNavigation from "~/components/common/navs/BackNavigation";
import axios from "axios";
import {Server} from "~/components/Properties";
import ComUtil from "~/util/ComUtil";
import {Webview} from "~/lib/webviewApi";
import {useRecoilState} from "recoil";
import {consumerState} from "~/recoilState";

// [미사용] ConsumerLogin.js 와 통합됨
const Login = (props) => {
    const [consumer, setConsumer] = useRecoilState(consumerState)

    const [state, setState] = useState({
        fadeEmail: false, //email 미입력시 에러메시지 여부
        fadeEmailType: false,
        fadePassword: false,
        fadeError: false,   //email or pw 가 서버에 없을때 에러메시지 여부
    });


    const onLoginClicked = async (event) => {
        event.preventDefault();

        //Fade All reset
        setState({
            ...state,
            fadeEmail: false, fadePassword:false, fadeEmailType:false, fadeError:false
        });

        //input ERROR check
        let data = {};
        data.email = event.target[0].value.trim();
        data.valword = event.target[1].value;
        data.userType = 'producer'

        if (!data.email) {
            setState({...state, fadeEmail: true});
            return;
        }

        const emailRule = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
        if (!emailRule.test(data.email)) {
            setState({...state, fadeEmailType: true});
            return;
        }

        if (!data.valword) {
            setState({...state, fadePassword: true});
            return;
        }

        await axios(Server.getRestAPIHost() + '/login', //=loginProducerReturnConsumer',
            {
                method: "post",
                data:data,
                withCredentials: true,
                credentials: 'same-origin'
            })
            .then((response) => {
                //console.log(response);
                if (response.data.status === Server.ERROR)             //100: login ERROR
                    setState({...state, fadeError: true});
                else
                {
                    let loginInfo = response.data;

                    console.log({loginInfo})

                    //recoil 세팅
                    setConsumer(ComUtil.getConsumerByLoginUser(loginInfo))


                    //아래 코드들 함수로 이동 - 잘안씀 주로 recoil이용.
                    ComUtil.setLocalStorageLogin(data);


                    Webview.updateFCMToken({userType: 'consumer', userNo: loginInfo.uniqueNo})
                    Webview.updateFCMToken({userType: 'producer', userNo: loginInfo.uniqueNo - 900000000}) //9억빼면 소비자 번호

                    //팝업에선 작동한해서 막음: Webview.loginUpdate(); //하단바 update용.
                }
            })
            .catch(function (error) {
                //console.log(error);
                alert('로그인 오류:'+error);
            });

        if (!state.fadeError) { //로그인 성공이면 마이페이지로 이동.
            props.history.replace('/mypage')
        }


    }

    return(
        <Fragment>
            <BackNavigation>생산자 로그인</BackNavigation>
            <Container fluid className={Style.wrap}>
                <div className='d-flex justify-content-center align-items-center'>
                    <MarketBlyLogoColorRectangle className={''} style={{textAlign:'center', width: 120, paddingTop: 10, paddingBottom: 10}}/>
                </div>
                <Form onSubmit={onLoginClicked}>
                    <Row>
                        <Col xs={12}>
                            <Input className={classNames('rounded-0 mb-3', Style.textBox)}  placeholder="생산자 아이디(이메일)" />
                            {
                                state.fadeEmail && <CustomFade>이메일 주소를 입력해 주세요.</CustomFade>
                            }
                            {
                                state.fadeEmailType && <CustomFade>이메일 주소를 양식에 맞게 입력해 주세요.</CustomFade>
                            }
                            <Input className={classNames('rounded-0 mb-3', Style.textBox)}  type="password" placeholder="비밀번호" />

                            {
                                state.fadePassword && <CustomFade>비밀번호를 입력해 주세요.</CustomFade>
                            }
                            {
                                state.fadeError && <CustomFade>아이디/비밀번호를 확인해 주세요.</CustomFade>
                            }
                            <Button type='submit' color={'info'} className={'rounded-0 p-3 mt-4 mb-3'} block ><span className='f20'>생산자 로그인</span></Button>

                        </Col>
                    </Row>

                </Form>
            </Container>
        </Fragment>
    )
}
export default Login

function CustomFade(props){
    return (
        <div className='mb-3'>
            <Fade in={true} className={'small text-danger'}>{props.children}</Fade>
        </div>
    )
}