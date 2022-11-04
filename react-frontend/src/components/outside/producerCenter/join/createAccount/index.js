import React, {useState} from 'react';
import {Button, Div} from "~/styledComponents/shared";
import ComUtil from "~/util/ComUtil";
import BackNavigation from "~/components/common/navs/BackNavigation";
import {getProducerEmail, createProducerAccount } from "~/lib/producerApi";
import {Redirect} from 'react-router-dom'
import {
    Alert,
    Col,
    Container,
    Fade,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row
} from "reactstrap";
import {Required} from "~/styledComponents/ShopBlyLayouts";
import {PassPhrase} from "~/components/common";
import styled from "styled-components";
import {color} from "~/styledComponents/Properties";

const Title = styled.h5`
    margin-bottom: 18.75px;
`
const StyledLabel = styled(Label)`
    color: ${color.dark};
`
const CreateAccount = ({history}) => {
    const coRegistrationNo = history.location.state ? history.location.state.coRegistrationNo : null

    const [state, setState] = useState({
        coRegistrationNo: coRegistrationNo,
        email: '',
        valword: '',
        valwordCheck: '',
        passPhrase: '',
        passPhraseCheck: '',
    })

    const [fadeEmail, setFadeEmail] = useState()
    const [fadeOverlapEmail, setFadeOverlapEmail] = useState()
    const [fadeValword, setFadeValword] = useState()
    const [fadeValwordCheck, setFadeValwordCheck] = useState()
    const [bPassPhraseOpen, setBPassPhraseOpen] = useState(false)
    const [bCheckPassPhraseOpen, setBCheckPassPhraseOpen] = useState(false)
    const [fadePassPhraseCheck, setFadePassPhraseCheck] = useState()

    const onCreateClick = async () => {

        if (!state.email) {
            alert('아이디(이메일)은 필수입니다.')
            return
        }
        const emailRule = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
        if (!emailRule.test(state.email)) {
            alert('아이디는 이메일 형식에 맞게 입력해 주세요! [예 test@test.com] ')
            return;
        }
        if (fadeOverlapEmail) {
            alert('이미 사용중인 이메일입니다.')
            return
        }
        if (!state.valword || !state.valwordCheck) {
            alert('비밀번호는 필수 입니다.')
            return
        }
        if (fadeValword) {
            alert('비밀번호는 8~16자 영문자, 숫자, 특수문자를 필수 조합해서 사용하세요.')
            return
        }
        if (state.valword !== state.valwordCheck) {
            alert('비밀번호가 일치하지 않습니다.')
            return
        }

        if (!state.passPhrase || !state.passPhraseCheck) {
            alert('블록체인 비밀번호는 필수 입니다.')
            return
        }

        if (state.passPhrase !== state.passPhraseCheck) {
            alert('블록체인 비밀번호가 일치하지 않습니다.')
            return
        }
        //
        // producer.setCoRegistrationNo(infoVo.getCoRegistrationNo());
        // producer.setEmail(infoVo.getEmail());
        // producer.setValword(infoVo.getValword());
        // producer.setPassPhrase(infoVo.getPassPhrase());

        if (!window.confirm('계정을 생성 하시겠습니까?')) {
            return
        }

        try{
            console.log({saveparams: state})

            //DB 생산자 테이블로 복사 및 어카운트 생성
            const {status, data} = await createProducerAccount(state)

            console.log({data})

            if (status === 200) {
                if (data === 101) {
                    alert('이미 사용중인 아이디 입니다.')
                    return
                }else if (data === 102) {
                    alert('이미 등록된 사업자등록번호 입니다.')
                    return
                }else{
                    alert('계정이 정상적으로 등록 되었습니다.')
                    //안내 페이지
                    history.replace('/producerCenter/join/joinComplete')
                    return
                }
            }
        }catch (error) {
            alert('문제가 발생하였습니다. 다시 시도해 주세요.')
        }
    }

    const emailCheck = (e) => {
        if(!ComUtil.emailRegex(e.target.value)) {
            setFadeEmail(true)
        } else {
            setFadeEmail(false)
        }

        // db에 이미 있는 아이디인지 체크
        findOverlapEmail(e.target.value)
    }

    const findOverlapEmail = async (email) => {
        const response = await getProducerEmail(email)
        if (!response.data) {
            setFadeOverlapEmail(false)
        } else {
            setFadeOverlapEmail(true)
        }
    }





    // valword regex
    const valwordRegexCheck = (e) => {
        if (!ComUtil.valwordRegex(e.target.value)) {
            setFadeValword(true)
        } else {
            setFadeValword(false)
        }
    }

    const handleValwordChange = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        })

        //비밀번호가 틀린 상황이면.. RegexCheck 이중화..
        if (fadeValword) {
            //console.log('val: wrong-onChange:' + e.target.value)
            valwordRegexCheck(e);
        }
    }

    const valwordCheck = (e) => {
        if (e.target.value !== state.valword) {
            setFadeValwordCheck(true)
        } else {
            setFadeValwordCheck(false)
        }
    }

    const toggleBPassPhrase = (gb) => {

        if(gb === 1) {
            //블록체인 비밀번호 모달
            setBPassPhraseOpen(!bPassPhraseOpen)
        }else{
            //블록체인 비밀번호 확인 모달
            setBCheckPassPhraseOpen(!bCheckPassPhraseOpen)
        }

    }

    //6자리 인증 비번 PassPhrase(6 CHAR PIN CODE)
    const onPassPhrase = (passPhrase) => {
        console.log(passPhrase)
        setState({
            ...state,
            passPhrase: passPhrase,
            // clearPassPhrase:false
        });
    };

    const onPassPhraseCheck = (passPhrase) => {
        console.log(passPhrase)
        //블록체인 비밀번호 일치 하는지 체크
        if(state.passPhrase !== passPhrase) {
            setFadePassPhraseCheck(true)
        }else{
            setFadePassPhraseCheck(false)
        }

        setState({
            ...state,
            passPhraseCheck: passPhrase,
        });
    };

    // element의 값이 체인지될 때
    const handleChange = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        })
    }

    if (!coRegistrationNo) return <Redirect to={'/producerCenter/join/checkJoinStatus'} />

    return (
        <div>
            {
                (ComUtil.isMobileWeb() || ComUtil.isMobileApp()) && (
                    <BackNavigation>생산자 로그인 계정생성</BackNavigation>
                )
            }

            {
                ComUtil.isPcWeb() && (
                    <Container>
                        <Row>
                            <Col>
                                <Div my={30}>
                                    <h5>생산자 로그인 계정생성</h5>
                                </Div>
                            </Col>
                        </Row>
                    </Container>
                )
            }

            <Container className={'bg-white shadow-lg'}>
                <Row>
                    <Col className='p-0'>
                        {
                            !state.producerNo && (
                                <>
                                    <div className='m-4'>
                                        {/*<Alert color={'danger'}>*/}
                                        {/*    샵블리(ShopBly)는 <b><u>별도의 계약서 작성 대신 회원가입으로 간소화 체결</u></b>을 하고 있습니다.<br/>*/}
                                        {/*    이용약관을 꼭 확인해 주세요!*/}
                                        {/*</Alert>*/}
                                        <Title>계정정보</Title>
                                        <Alert color={'success'}>
                                            생산자 페이지에 로그인 하기위한 아이디/비밀번호를 작성해 주세요.
                                        </Alert>
                                        <FormGroup inline>
                                            <Row>
                                                <Col sm={3}>
                                                    <StyledLabel>아이디<Required/></StyledLabel>
                                                </Col>
                                                <Col sm={9}>
                                                    <Input
                                                        name="email" placeholder="아이디(이메일) [예 아이디@도메인]"
                                                        value={state.email}
                                                        onBlur={emailCheck}
                                                        onChange={handleChange}
                                                        // innerRef={this.email}
                                                    />
                                                    {
                                                        fadeEmail && <Fade in className={'text-danger small mt-1'}>이메일 형식을 다시 확인해주세요.</Fade>
                                                    }
                                                    {
                                                        fadeOverlapEmail && <Fade in className={'text-danger small mt-1'}>이미 사용중인 이메일입니다.</Fade>
                                                    }
                                                </Col>
                                            </Row>
                                        </FormGroup>
                                        <FormGroup inline>
                                            <Row>
                                                <Col sm={3}>
                                                    <StyledLabel>비밀번호<Required/></StyledLabel>
                                                </Col>
                                                <Col sm={9}>
                                                    <Input type="password" name="valword" placeholder="영문자, 숫자, 특수문자 필수조합 8~16자"
                                                           value={state.valword}
                                                           onBlur={valwordRegexCheck}
                                                           onChange={handleValwordChange}
                                                        // innerRef={valword1}
                                                    />
                                                    {
                                                        fadeValword && <Fade in className={'text-danger small mt-1'}>8~16자 영문자, 숫자, 특수문자를 필수 조합해서 사용하세요</Fade>
                                                    }
                                                </Col>
                                            </Row>
                                        </FormGroup>
                                        <FormGroup inline>
                                            <Row>
                                                <Col sm={3}>
                                                    <StyledLabel>비밀번호확인<Required/></StyledLabel>
                                                </Col>
                                                <Col sm={9}>
                                                    <Input type="password" name="valwordCheck" placeholder="비밀번호 확인"
                                                           onBlur={valwordCheck}
                                                           onChange={handleChange}
                                                        // innerRef={valword2}
                                                    />
                                                    {
                                                        fadeValwordCheck && <Fade in className={'text-danger small mt-1'}>비밀번호가 일치하지 않습니다.</Fade>
                                                    }
                                                </Col>
                                            </Row>
                                        </FormGroup>
                                    </div>

                                    <hr/>

                                    {/* 블록체인 계정정보 */}
                                    <div className='m-4'>
                                        <Title>블록체인 계정정보</Title>
                                        <Alert color={'danger'}>
                                            BLS/BLCT 환전시 사용할 비밀번호 입니다.<br/>
                                            (블록체인 특성상 <b><u>블록체인 비밀번호는 변경이 불가능</u></b>합니다. 분실 또는 유출되지 않도록 주의해주세요)
                                        </Alert>
                                        <FormGroup inline>
                                            <Row>
                                                <Col sm={3}>
                                                    <StyledLabel>블록체인 비밀번호<Required/></StyledLabel>
                                                </Col>
                                                <Col sm={9}>
                                                    <Input type="password" name="passPhrase" readOnly value={state.passPhrase}
                                                           onClick={toggleBPassPhrase.bind(this, 1)}
                                                           placeholder="블록체인 비밀번호(숫자6자리)" maxLength="6"
                                                        // innerRef={passPhrase1}
                                                    />
                                                </Col>
                                            </Row>
                                        </FormGroup>
                                        <FormGroup inline>
                                            <Row>
                                                <Col sm={3}>
                                                    <StyledLabel>블록체인 비밀번호 확인<Required/></StyledLabel>
                                                </Col>
                                                <Col sm={9}>
                                                    <Input type="password" name="passPhraseCheck" readOnly value={state.passPhraseCheck}
                                                           placeholder="블록체인 비밀번호 확인"
                                                           onClick={toggleBPassPhrase.bind(this, 2)}
                                                           maxLength="6"
                                                        // innerRef={passPhrase2}
                                                    />
                                                    {
                                                        fadePassPhraseCheck && <Fade in className={'text-danger small mt-1'}>비밀번호가 일치하지 않습니다.</Fade>
                                                    }
                                                </Col>
                                            </Row>
                                        </FormGroup>
                                    </div>
                                </>
                            )
                        }
                        <Div textAlign={'center'} py={30}>
                            <Button px={20} fg={'white'} bg={'green'} height={40} onClick={onCreateClick}>계정생성완료</Button>
                        </Div>
                    </Col>
                </Row>
            </Container>
            {/* 블록체인 비밀번호용 modal */}
            <Modal isOpen={bPassPhraseOpen} centered>
                <ModalHeader toggle={toggleBPassPhrase.bind(this, 1)}>블록체인 비밀번호</ModalHeader>
                <ModalBody className={'p-0'}>
                    <PassPhrase clearPassPhrase={true} onChange={onPassPhrase}></PassPhrase>
                </ModalBody>
                <ModalFooter>
                    <Button color="info" onClick={toggleBPassPhrase.bind(this, 1)} disabled={(state.passPhrase.length === 6)?false:true}>확인</Button>
                    <Button color="secondary" onClick={toggleBPassPhrase.bind(this, 1)}>취소</Button>
                </ModalFooter>
            </Modal>

            {/* 블록체인 비밀번호 확인용 modal */}
            <Modal isOpen={bCheckPassPhraseOpen} centered>
                <ModalHeader toggle={toggleBPassPhrase.bind(this, 2)}>블록체인 비밀번호 확인</ModalHeader>
                <ModalBody className={'p-0'}>
                    <PassPhrase clearPassPhrase={true} onChange={onPassPhraseCheck}></PassPhrase>
                </ModalBody>
                <ModalFooter>
                    <Button color="info" onClick={toggleBPassPhrase.bind(this, 2)} disabled={(state.passPhraseCheck.length === 6)?false:true}>확인</Button>
                    <Button color="secondary" onClick={toggleBPassPhrase.bind(this, 2)}>취소</Button>
                </ModalFooter>
            </Modal>


        </div>
    );
};

export default CreateAccount;
