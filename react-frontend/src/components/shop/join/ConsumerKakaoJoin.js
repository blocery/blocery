import React, { Component, Fragment, useEffect, useState } from 'react';
import {Button, FormGroup, InputGroup, Fade, Modal, ModalBody, ModalHeader, ModalFooter, Col} from 'reactstrap'
import { doKakaoReqConsumer } from "~/lib/loginApi";
import {BlocerySpinner, PassPhrase, SwitchButton} from '~/components/common'
import {
    Hr,
    Div,
    Flex,
    Span,
    Input as StyledInput,
    Button as StyledButton,
    Input,
    Divider, Right, Strong
} from '~/styledComponents/shared'
import { ToastContainer, toast } from 'react-toastify'  //토스트
import 'react-toastify/dist/ReactToastify.css'
import { Webview } from "~/lib/webviewApi";
import ComUtil from '~/util/ComUtil'
import {initIMPHeadScript} from "~/util/PgUtil";
import {smsConfirm, smsSend} from "~/lib/smsApi";
import Terms from "~/components/common/Terms/Terms";
import {B2cPrivatePolicy11, B2cTermsOfUse11} from "~/components/common/termsOfUses";
import BackNavigation from "~/components/common/navs/BackNavigation";
import {withRouter} from 'react-router-dom'
import useLogin from "~/hooks/useLogin";
import {Required} from "~/styledComponents/ShopBlyLayouts";
import {Server} from "~/components/Properties";

const Star = () => <span className='text-danger'>*</span>

const Title = ({children}) => <Div fontSize={17} lineHeight={17} mb={15} bold>{children}</Div>
const DisabledInput = ({children}) => <Flex bg={'light'} bc={'secondary'} rounded={4} minHeight={45} px={20}>{children}</Flex>



const ConsumerKakaoJoin = (props) => {
    const consumer = props.location.state.consumer
    const [state, setState] = useState({
        consumerNo: consumer.consumerNo,
        token: consumer.token,
        refreshToken: consumer.refreshToken,
        email: consumer.email||'',
        name: consumer.name||'',
        nickname: consumer.nickname||'',
        phone: consumer.phone||'',
        passPhrase: '',
        passPhraseCheck: '',
        fadePassPhraseCheck: false,
        modalPassPhrase: false,
        modalPassPhraseCheck: false,
        inviteCode:'',
        joinRegCheck: false,
        loading: false,  //스플래시 로딩용
        checkbox0: false,
        checkbox1: false,
        checkbox2: false,
        checkbox3: false,
        terms: [
            {name:'checkbox0', title:'만 14세 이상', content:null},
            {name:'checkbox1', title:'이용약관 동의', content:<B2cTermsOfUse11/>},
            {name:'checkbox2', title:'개인정보처리방침 동의', content:<B2cPrivatePolicy11/>},
            {name:'checkbox3', title:'경품 수령을 위한 정보 제공 동의', content:null}
        ],
        noBlockchain: false
    })

    const [loading, setLoading] = useState(false) //스플래시 로딩용

    useEffect(() => {

        initIMPHeadScript();

        // 추천인코드 (공유용)
        let inviteCode = localStorage.getItem("inviteCode");
        if (inviteCode) {
            setState({
                ...state,
                inviteCode: inviteCode
            })
        }
    }, [])

    // element의 값이 체인지될 때
    const handleChange = (e) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        })
    }

    // 입력한 결제 비밀번호와 일치하는지 체크
    const isCorrectPassPhrase = (passPhrase, passPhraseCheck) => {
        if (passPhrase !== passPhraseCheck) {
            return false
        }
        return true
    }

    const notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_CENTER
        })
    }
    // kakao 회원가입버튼 클릭시 호출하는 api
    const reqConsumer = async () => {
        localStorage.removeItem("inviteCode");
        const saveState = {...state}//Object.assign({}, this.state)

        //noBlockchain사용자는 결제비번을 000000으로 저장.
        if (state.noBlockchain) {
            saveState.passPhrase = '000000';
        }

        //초대코드를 consumerNo로 변환.
        const recommenderNo = ComUtil.decodeInviteCode(saveState.inviteCode);
        //console.log('inviteCode:' + saveState.inviteCode + ' recommenderNo:' + recommenderNo);
        const params = {
            consumerNo:saveState.consumerNo,
            passPhrase:saveState.passPhrase,
            noBlockchain: saveState.noBlockchain, //pivot 추가.
            recommenderNo:recommenderNo  //consumerNo로 변환해서 전송.
        }
        setLoading(true)
        //consumerNo 조건 - 임시 회원정보에 6자리 비번 및 블록체인여부, 추천인번호 임시저장
        const {data:res} = await doKakaoReqConsumer(params);
        // 본인인증페이지로 이동처리 아니면 해당페이지에서 본인인증 버튼 나오게 처리
        if(res == -9){
            setLoading(false)
            //alert('이미 등록된 사용자입니다. 카카오로그인을 하시길 바랍니다.');
            notify('이미 등록된 사용자입니다. 카카오로그인을 하시길 바랍니다.', toast.info);
            return false;
        }
        if(res > 0){
            setLoading(false)
            //alert('회원가입정보를 등록하셨습니다. 본인인증을 하시길 바랍니다.');
            notify('본인 인증 후 가입을 완료해 주세요.', toast.info);
            setState({
                ...state,
                joinRegCheck: true
            })
        }
    }

    const reqAuthConsumer = async () => {
        const saveState = {...state}//Object.assign({}, this.state)
        // 본인인증 처리후 joinComplete 이동후에 최종 본인인증검증처리
        //본인인증 호출용 data
        let userCode = Server.getImpKey();
        let data = { // param
            merchant_uid: "DANALJ_"+saveState.consumerNo, // 인증용 주문번호
            m_redirect_url: Server.getFrontURL()+'/joinComplete',   //모바일일경우 리다이렉트 페이지 처리
            popup: true,    // PC환경에서는 popup 파라메터가 무시되고 항상 true 로 적용됨
            min_age:14,     // 최소나이
            //name:state.name,        // 이름
            phone:saveState.phone       // 전화번호
        }

        //1. React-Native(Webview)용 본인인증호출 방식 /////////////////////////////////////////////////////////////////
        if (ComUtil.isMobileApp()) {
            setLoading(false)
            data.m_redirect_url = '';
            data.popup = false;
            data.min_age = '14';
            /* 리액트 네이티브 환경에 대응하기 */
            const params = {
                userCode,                       // 가맹점 식별코드
                data,                           // 결제 데이터
                callbackUrl:"joinComplete",
                type: 'certification',          // 결제와 본인인증 구분을 위한 필드
            };
            const paramsToString = JSON.stringify(params);
            window.ReactNativeWebView.postMessage(paramsToString); //(일반적으로) RN의 PopupScreen.js로 보내짐.

            return;
        }

        //2. Web용 아임포트  PG 결제 모듈 객체 /////////////////////////////////////////////////////////////////////
        const IMP = window.IMP;
        // 발급받은 가맹점 식별코드
        IMP.init(userCode);

        IMP.certification(data, rsp => {
            // callback
            setLoading(false)
            if (rsp.success) {
                //console.log("rsp========",rsp)
                props.history.replace('/joinComplete?imp_uid='+rsp.imp_uid+'&imp_success='+rsp.success+'&merchant_uid='+rsp.merchant_uid+'&error_msg='+'');
            } else {
                let msg = '본인인증에 실패하였습니다.';
                //msg += ' imp_uid : ' + rsp.imp_uid;
                msg += ' 에러내용 : ' + rsp.error_msg;
                // 결제 실패 시 로직
                //alert(msg);
                notify(msg, toast.warn);
            }
        });
    }

    // 회원가입버튼 클릭
    const onReqClick = () => {
        if(state.name.length == 0){
            alert('이름이 존재하지 않으면 회원가입을 하실수 없습니다!, 카카오계정의 닉네임를 등록해 주세요!')
            return false;
        }

        if(!state.phone || state.phone.length === 0){
            alert('휴대전화가 존재하지 않으면 회원가입을 하실수 없습니다!, 카카오계정의 연락처를 등록해 주세요!')
            return false;
        }

        if(!state.noBlockchain && (
            state.passPhrase.length != 6 ||
            (state.passPhrase !== state.passPhraseCheck))
        ) {
            alert('결제 비밀번호를 정확하게 입력해주세요.')
            return false;
        }

        if(!state.noBlockchain && state.passPhraseCheck.length != 6){
            alert('결제 비밀번호 확인를 정확하게 입력해주세요.')
            return false;
        }

        if(!state.checkbox0 || !state.checkbox1 || !state.checkbox2 || !state.checkbox3) {
            if(!state.checkbox0){
                alert('만 14세 이상에 동의해 주세요.')
            }
            else if(!state.checkbox1){
                alert('이용약관에 동의해 주세요.')
            }
            else if(!state.checkbox2){
                alert('개인정보처리방침에 동의해 주세요.')
            }
            else if(!state.checkbox3){
                alert('경품 수령을 위한 정보 제공 동의해 주세요.')
            }
            return false;
        }

        reqConsumer(state);
    }

    const onReqAuthClick = () => {
        reqAuthConsumer();
    }

    const modalToggle = () => {
        setState({
            ...state,
            modalPassPhrase: !state.modalPassPhrase
        })
    };

    const modalToggleCheck = () => {
        setState({
            ...state,
            modalPassPhraseCheck: !state.modalPassPhraseCheck
        })
    }

    //6자리 인증 비번 PassPhrase(6 CHAR PIN CODE)
    const onPassPhrase = (passPhrase) => {
        setState({
            ...state,
            passPhrase: passPhrase,
            clearPassPhrase: false
        })
    };

    const onPassPhraseCheck = (passPhrase) => {
        setState({
            ...state,
            passPhraseCheck: passPhrase,
            clearPassPhrase: false
        })
    };

    const modalPassPhrase = () => {
        setState({
            ...state,
            modalPassPhrase: true
        })
    }

    const modalPassPhraseCheck = () => {
        setState({
            ...state,
            modalPassPhraseCheck: true
        })
    }

    const modalToggleOk = () => {

        //비번 맞는지 체크
        const success = isCorrectPassPhrase(state.passPhrase, state.passPhraseCheck)

        //결제 비번 첫번째 모달 닫기
        if(state.modalPassPhrase === true) {
            setState({
                ...state,
                modalPassPhrase: false,
                fadePassPhraseCheck: success ? false : true
            })
        } else { //결제 비번 두번째 모달 닫기
            setState({
                ...state,
                modalPassPhraseCheck: false,
                fadePassPhraseCheck: success ? false : true
            })
        }
    }

    const onNoBlockchainChange = () => {
        setState({
            ...state,
            noBlockchain: !state.noBlockchain
        })
    }

    // checkbox 클릭시
    const handleCheckbox = (e, index) => {
        setState({
            ...state,
            [e[index].name]: e[index].checked
        })
    }

    // 약관 전체동의 check/uncheck
    const onChangeCheckAll = (e) => {
        setState({
            ...state,
            checkbox0: e.target.checked,
            checkbox1: e.target.checked,
            checkbox2: e.target.checked,
            checkbox3: e.target.checked,
        })
    }

    const onBackClick = () => {
        if(ComUtil.isMobileApp()){
            Webview.closePopup();
            return;
        }else{
            props.history.goBack();
        }
    }

    return(
        <Fragment>
            {
                loading && <BlocerySpinner/>
            }
            <BackNavigation onBackClick={onBackClick}>소비자 회원가입</BackNavigation>
            <Flex px={16} minHeight={43} bg={'light'} fontSize={13} bg={'background'}>
                <b>카카오 계정</b><Span fg={'dark'}>(수정불가)</Span>
            </Flex>
            <Div px={16} pb={20}>
                <Div mt={29}>
                    <Title>이름<Required /></Title>
                    <Input value={state.name} readOnly block/>
                </Div>
                <Div mt={29}>
                    <Title>휴대폰 번호<Required /></Title>
                    <Input value={state.phone ? state.phone : "전화번호 없음(카카오로 문의)"} readOnly  block/>
                </Div>
                {
                    state.email && (
                        <Div mt={29}>
                            <Title>이메일</Title>
                            <Input value={state.email} readOnly block/>
                        </Div>
                    )
                }
            </Div>
            {
                !state.joinRegCheck &&
                    <>
                        <Divider />
                        <Div px={16} pb={20}>
                            <Div mt={29}>
                                <Title>
                                    <Flex>
                                        <div>
                                            블록체인 사용여부
                                        </div>
                                        <Right>
                                            <SwitchButton checked={!state.noBlockchain} onChange={onNoBlockchainChange}/>
                                        </Right>
                                    </Flex>
                                </Title>
                                {
                                    state.noBlockchain &&
                                    <Div mt={19} fontSize={12}>
                                        * 샵블리는 블록체인 기반 E-commerce로 <Strong fg={'danger'}>블록체인을 사용하지 않으면 적립금, 쿠폰 등의 혜택을 받아볼 수 없습니다.</Strong>
                                    </Div>
                                }
                            </Div>
                        </Div>
                        {
                            !state.noBlockchain &&
                            <>
                                <Divider height={1} mb={29} />
                                <Div px={16} pb={20}>

                                    <Title>결제 비밀번호<Required /></Title>
                                    <Div mt={19} fontSize={12}>
                                        블록체인 특성상 <Strong fg={'danger'}>결제 비밀번호는 변경이 불가능</Strong>합니다. 분실 또는 유출되지 않도록 주의해주세요.
                                    </Div>
                                    <Input name="passPhrase"
                                           type="password"
                                           value={state.passPhrase}
                                           block
                                           readOnly
                                           mt={25}
                                           placeholder={'상품 구매 시 사용할 결제 비밀번호 6자리'}
                                           maxLength="6"
                                           onClick={modalPassPhrase}
                                    />
                                    <Div mt={29}>
                                        <Title>결제 비밀번호 확인<Required /></Title>
                                        <Input name="passPhraseCheck"
                                               type="password"
                                               value={state.passPhraseCheck}
                                               block
                                               readOnly
                                               placeholder={'상품 구매 시 사용할 결제 비밀번호 6자리(확인)'}
                                               maxLength="6"
                                               onClick={modalPassPhraseCheck}
                                        />
                                        {
                                            state.fadePassPhraseCheck && <Fade in className={'text-danger'}>비밀번호가 일치하지 않습니다.</Fade>
                                        }
                                    </Div>
                                </Div>

                            </>
                        }

                        <Divider />
                        <Div px={16} pt={29} pb={20}>
                            <Title>초대 코드</Title>
                            <Input name="inviteCode"
                                   type="text"
                                   value={state.inviteCode}
                                   block
                                   placeholder="초대받은경우 입력(7자리)"
                                   maxLength="7"
                                   onChange={handleChange}
                            />
                        </Div>
                        <Divider />
                        <Div px={16} py={29}>
                            <Title>약관동의</Title>
                            <Terms data={state.terms} onClickCheck={handleCheckbox} onCheckAll={onChangeCheckAll} />
                            <Div mt={19} fontSize={12}>
                                <Strong fg={'danger'}>기본 정보 입력 후 본인 인증이 진행됩니다.</Strong>
                            </Div>
                            <StyledButton fg={'white'} bg={'green'} fontSize={17} height={55} rounded={4}
                                          mt={30}
                                          block
                                          disabled={state.phone ? false:true }
                                          onClick={onReqClick}
                            >다음</StyledButton>
                            {/*<Button bg={'white'} fontSize={17} height={55} rounded={4} mt={10} onClick={() => props.history.goBack()}>취소</Button>*/}
                        </Div>
                    </>
            }
            {
                state.joinRegCheck &&
                    <Div px={16} py={29}>
                        <Title>본인인증</Title>
                        <StyledButton fg={'white'} bg={'green'} fontSize={17} height={55} rounded={4}
                                      mt={30}
                                      block
                                      disabled={!state.joinRegCheck}
                                      onClick={onReqAuthClick}
                        >본인인증 후 가입완료</StyledButton>
                    </Div>
            }

            {/* 결제비밀번호용 modal */}
            <Modal isOpen={state.modalPassPhrase} centered>
                <ModalHeader toggle={modalToggle}>결제 비밀번호</ModalHeader>
                <ModalBody className={'p-0'}>
                    <PassPhrase clearPassPhrase={state.clearPassPhrase} onChange={onPassPhrase}></PassPhrase>
                </ModalBody>
                <ModalFooter>
                    <Button color="info" onClick={modalToggleOk} disabled={(state.passPhrase.length === 6) ? false:true}>확인</Button>
                    {/*<Button color="secondary" onClick={modalToggle}>취소</Button>*/}
                </ModalFooter>
            </Modal>

            {/* 결제비밀번호 확인용 modal */}
            <Modal isOpen={state.modalPassPhraseCheck} centered>
                <ModalHeader toggle={modalToggleCheck}>결제 비밀번호 확인</ModalHeader>
                <ModalBody className={'p-0'}>
                    <PassPhrase clearPassPhrase={state.clearPassPhrase} onChange={onPassPhraseCheck}></PassPhrase>
                </ModalBody>
                <ModalFooter>
                    <Button color="info" onClick={modalToggleOk} disabled={(state.passPhraseCheck.length === 6) ? false:true}>확인</Button>
                    {/*<Button color="secondary" onClick={modalToggleCheck}>취소</Button>*/}
                </ModalFooter>
            </Modal>

            {/*<ToastContainer/>*/}

        </Fragment>

    );
}

export default withRouter(ConsumerKakaoJoin)