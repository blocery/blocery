import React, { Component, Fragment } from 'react';
import { Col, Button, Form, FormGroup, Label, Input, Container, InputGroup, Table, Badge, Row, Fade } from 'reactstrap'
import ComUtil from "~/util/ComUtil"
import {getConsumer, updateValword} from "~/lib/shopApi";
import { doLogout } from "~/lib/loginApi"
import { Redirect } from 'react-router-dom'
import BackNavigation from "~/components/common/navs/BackNavigation";

export default class ModifyValword extends Component {

    constructor(props) {
        super(props)
        this.state = {
            consumerNo: 0,
            producerFlag: false,
            newValword: '',
            fadeValword: false,
            fadeValwordCheck: false,
            redirect: null
        }
    }

    async componentDidMount() {
        const {data:loginUser} = await getConsumer();
        if(!loginUser){
            this.props.history.replace('/mypage');
            return;
        }

        this.setState({
            consumerNo: loginUser.consumerNo,
            producerFlag: loginUser.producerFlag
        })
    }

    // element값 변경시
    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    valwordRegexCheck = (e) => {
        if(!ComUtil.valwordRegex(e.target.value)) {
            this.setState({ fadeValword: true })
        } else {
            this.setState({ fadeValword: false })
        }
    }

    handleValwordChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
        //비밀번호가 틀린 상황이면.. RegexCheck 이중화..
        if (this.state.fadeValword) {
            //console.log('val: wrong-onChange:' + e.target.value)
            this.valwordRegexCheck(e);
        }
    }

    valwordCheck = (e) => {
        if(e.target.value != this.state.newValword) {
            this.setState({ fadeValwordCheck: true })
        } else {
            this.setState({ fadeValwordCheck: false })
        }
    }

    // 저장버튼 클릭
    onModifyClick = async() => {
        if(this.state.fadeValwordCheck) {
            alert('비밀번호를 다시 확인해주세요.')
            return;
        }
        const data = {
            valword:this.state.newValword,
            consumerNo:this.state.consumerNo
        };
        const modified = await updateValword(data);
        if(modified.data === 1) {
            alert('비밀번호 변경이 완료되었습니다. 다시 로그인해주세요.')
            //this.props.history.push('/myPage');
            await this.doLogout();
            this.setState({
                redirect: this.state.producerFlag ? '/mypage/producer':'/mypage'
            })
        } else {
            alert('회원정보 수정 실패. 다시 시도해주세요.')
            return false;
        }
    }

    // 비밀번호 변경 후 자동 로그아웃
    doLogout = async () => {
        await doLogout();
        //this.props.history.push('/login')  // 새로고침+로그인 화면으로 이동
    }


    render() {
        if(this.state.redirect) return <Redirect to={this.state.redirect} />
        return(
            <Fragment>
                <BackNavigation>비밀번호 변경</BackNavigation>
                <Container fluid>
                    <p></p>
                    <Row>
                        <Col xs={12}>
                            <FormGroup>
                                <Label>비밀번호</Label>
                                <InputGroup>
                                    <Input type="password" name="newValword" placeholder="새로운 비밀번호를 입력해주세요" onBlur={this.valwordRegexCheck} onChange={this.handleValwordChange} />
                                </InputGroup>
                                {
                                    this.state.fadeValword && <Fade in className={'text-danger'}>8~16자 영문자, 숫자, 특수문자를 필수 조합해서 사용하세요</Fade>
                                }
                            </FormGroup>
                        </Col>
                        <Col xs={12}>
                            <FormGroup>
                                <InputGroup>
                                    <Input type="password" name="valwordCheck" placeholder="비밀번호 확인" onBlur={this.valwordCheck} onChange={this.handleChange} />
                                </InputGroup>
                                {
                                    this.state.fadeValwordCheck && <Fade in className={'text-danger'}>비밀번호가 일치하지 않습니다.</Fade>
                                }
                            </FormGroup>
                        </Col>
                    </Row>
                    <br/>
                    <Row>
                        <Col xs={12}>
                            <FormGroup>
                                <Button block color={'info'} onClick={this.onModifyClick}>저장</Button>
                            </FormGroup>
                        </Col>
                    </Row>
                </Container>
            </Fragment>
        )
    }
}