import React, {Component, Fragment, useEffect, useState} from 'react';
import {withRouter} from 'react-router-dom'
import { Container, Row, Col, Button } from 'reactstrap';
import ComUtil from '../../../util/ComUtil'
import { Webview } from "~/lib/webviewApi";
import {Div, Divider, Flex, Hr, Img, Span} from '~/styledComponents/shared'
import {Bold} from "~/styledComponents/ShopBlyLayouts";
import Flower from '~/images/flower@3x.png'
import BackNavigation from "~/components/common/navs/BackNavigation";
import {Server} from "~/components/Properties";
import { autoLoginCheckAndTry } from '~/lib/loginApi'
import { getUsableCouponList } from '~/lib/shopApi'
import axios from "axios";
import useLogin from "~/hooks/useLogin";
import { ToastContainer, toast } from 'react-toastify'                              //토스트
import 'react-toastify/dist/ReactToastify.css'
import joinEvent2 from '~/images/joinEvent_1080_1080.jpg'
import TG from "~/components/common/tg/TG";

const JoinComplete = (props) => {

    const {reFetch} = useLogin()
    const [loading, setLoading] = useState(false) //스플래시 로딩용
    const [state, setState] = useState({

        headTitle: null,
        imp_uid: "",
        merchant_uid: "",
        imp_success: false,
        resultStatus: false,
        error_msg: "",

        // 공통
        name: '',
        phone: '',
        email: '',

        issuedCoupon: {},        // 발급된 쿠폰 정보
        issuedCouponExtraCount: 0
    })

    useEffect(() => {

        const params = new URLSearchParams(props.location.search);

        let imp_success = params.get('imp_success') === 'true' ? true : false;

        let imp_uid = params.get('imp_uid')||'';            //아임포트ID
        let merchant_uid = params.get('merchant_uid')||'';  //신규소비자번호(=consumerNo)
        let error_msg = params.get('error_msg');            //에러메시지

        //본인인증 성공 여부
        if(imp_success) {

            // 본인인증 검증
            if (imp_uid.length > 0) {
                //본인인증성공 후 본인인증검증페이지 처리
                //[1] 서버단에서 본인인증정보 조회를 위해 jQuery ajax로 imp_uid 전달하기
                axios(
                    Server.getRestAPIHost() + "/iamport/joinCert",
                    {
                        method: "post",
                        headers: {"Content-Type": "application/json"},
                        data: {
                            impUid: imp_uid,
                            merchantUid: merchant_uid
                        },
                        withCredentials: true,
                        credentials: 'same-origin'
                    }
                ).then(async ({data}) => {
                    console.log(data);
                    const resultMessage = data.resultMessage;

                    if (data.resultStatus === "success")
                    {
                        if(data.consumerNo > 0) {
                            // this.setState({loading: false});

                            //로그인 정보 동기화(저장)
                            //IOS 경우 : 지금 화면이 팝업 상태여서 reFetch를 해도 안먹히나 "어차피 창이 닫히면 HOME_SCREEN 에서 전체 리프레시를 하기 때문에 라우터 index 에서 자동 로그인을 시도하니까 괜찮음
                            //안드로이드 or 웹 : HOME_SCREEN인 상태라서 여기서 프론트 엔드와 동기화 시켜줘야 함
                            await reFetch()

                            const v_ConsumerNo = data.consumerNo;
                            localStorage.removeItem('authType');
                            localStorage.removeItem('userType');
                            localStorage.removeItem('account'); //geth Account
                            localStorage.removeItem('token');
                            localStorage.removeItem('refreshToken');

                            localStorage.setItem('authType', 1);
                            localStorage.setItem('userType', 'consumer');
                            localStorage.setItem('token', data.token);
                            localStorage.setItem('refreshToken', data.refreshToken);
                            localStorage.setItem('autoLogin', 1);
                            sessionStorage.setItem('logined', 1); //1 : true로 이용중

                            Webview.updateFCMToken({userType: 'consumer', userNo: v_ConsumerNo})

                            const dataCoupon = await issuedCoupon();
                            autoLoginCheckAndTry(true); //처음 가입시 자동로그인 추가.

                            setState({
                                ...state,
                                headTitle: "본인인증성공",
                                resultStatus: true,
                                imp_uid: imp_uid,
                                merchant_uid: merchant_uid,
                                imp_success: true,
                                error_msg: '',
                                issuedCoupon: dataCoupon ? dataCoupon[0]:null,
                                issuedCouponExtraCount: dataCoupon ? dataCoupon.length-1:0  //외 1건 추가.(코박 AAAAA용 스페셜쿠폰 추가)
                            });
                        }
                    }
                    if (data.resultStatus == "failed" || data.resultStatus == "forgery" || data.resultStatus == "blocked") {
                        let v_headTitle = '본인인증실패';
                        let v_errMsg = resultMessage;
                        setState({
                            ...state,
                            headTitle: v_headTitle,
                            resultStatus: false,
                            imp_uid: imp_uid,
                            merchant_uid: merchant_uid,
                            imp_success: false,
                            error_msg: v_errMsg
                        });
                    }

                });
            }
        }else {
            //본인인증실패
            setState({
                ...state,
                headTitle: "본인인증실패",
                imp_uid: imp_uid,
                merchant_uid: merchant_uid,
                imp_success: false,
                error_msg: error_msg
            });
        }

    }, [props.location.search])



    // 회원가입 후 발급된 쿠폰 확인
    const issuedCoupon = async () => {
        const {data: res} = await getUsableCouponList();
        console.log("issuedCoupon====",res)
        return res;
    }

    // 확인 클릭시 팝업 닫힘
    const onConfirmClick = () => {
        onBackClick()
        // Webview.closePopupAndMovePage('/home/1');
    }

    const onBackClick = () => {
        //ios 일 경우 팝업 닫기 [ 현재 이 창은 "팝업" 의 가입 -> push -> 완료(푸쉬) 페이지 이기 때문 ]

        //샵블리 버젼 :: if (ComUtil.isMobileAppIos()) {
        //마켓블리 버젼
        if (ComUtil.isMobileApp()) {
            Webview.closePopupAndMovePage('/');
        }else{ //안드로이드 or web 인 경우는 원래 페이지로 가기 [ 현재 이 화면은 가입 -> replace -> 완료 페이지로 이기 때문 ]
            props.history.replace('/')
        }
    }


    //react-toastify usage: this.notify('메세지', toast.success/warn/error);
    const notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 10000
        })
    }

    const failed_render_comp = () => {
        return(
            <Fragment>
                <BackNavigation>{state.headTitle}</BackNavigation>

                <div className={'text-center pt-3'}>
                    { state.error_msg }
                </div>
                <hr/>
                <div className={'d-flex p-1'}>
                    <div className={'flex-grow-1 p-1'}>
                        <Button color='dark' block onClick={onConfirmClick}> 홈으로 가기 </Button>
                    </div>
                </div>

                {/*<ToastContainer/>*/}
            </Fragment>
        )
    }

    if(!state.imp_success){
        return(failed_render_comp())
    }
    if(state.imp_success) {
        if (state.resultStatus) {
            return (
                <Div relative pt={70}>
                    <Div absolute top={0} p={16}>
                        <Img src={Flower} alt={'flower'}/>
                    </Div>
                    {
                        state.issuedCoupon &&
                        <>

                            <Flex justifyContent={'center'}>
                                <Flex textAlign={'center'} justifyContent={'center'} rounded={10} overflow={'hidden'}
                                      custom={`
                                    box-shadow: rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px;
                                `}
                                >
                                    <Bold bg={'green'} fg={'white'} px={23} py={29} fontSize={17} height={122}
                                          style={{
                                              textOrientation: "mixed",
                                              writingMode: 'vertical-lr',
                                              transform: 'scaleX(-1) scaleY(-1)'
                                          }}
                                    >coupon</Bold>
                                    <Div bg={'background'} px={25} py={30} height={122}>
                                        <Bold>신규 회원가입 쿠폰</Bold>
                                        <Flex>
                                            <Bold fontSize={40} fg={'green'}
                                                  mr={10}>{state.issuedCoupon.couponBlyAmount}</Bold>
                                            <Bold fontSize={20}>BLY</Bold>
                                        </Flex>
                                    </Div>
                                    {/*<Img width={250} height={130} src={JoinCoupon} alt={'joinComplete'} />*/}
                                </Flex>
                            </Flex>
                            <Div p={16} my={40} textAlign={'center'}>
                                <Div><b>신규 회원가입 쿠폰</b><Span fg={'red'}> {(state.issuedCouponExtraCount>0)?'외 '+state.issuedCouponExtraCount +'건의 쿠폰':''} </Span>이 발급되었습니다.</Div>
                                <Div>해당 쿠폰은 상품 구매시 사용할 수 있습니다.</Div>
                                <Div><Span fg={'green'}>'마이페이지 > 쿠폰'</Span> 메뉴에서 확인해 주세요~</Div>
                            </Div>
                            <Divider/>
                        </>
                    }

                    <Div fw={800} py={44} px={16} textAlign={'center'}>
                        <Div fontSize={23} bold><Span fg={'green'}>회원가입</Span>이 완료 되었습니다.</Div>
                        <Div fontSize={20}>감사합니다.</Div>
                    </Div>

                    {
                        (ComUtil.getNowYYYYMM() =='202206') &&
                        <Div mb={30}>
                            <Img src={joinEvent2} alt={'joinComplete'}/>
                        </Div>
                    }

                    <Hr mt={15}/>

                    <Div p={15} fontSize={12} textAlign={'center'}>정보의 확인 및 수정은 <Span fg={'green'}>'마이페이지'</Span>에서
                        가능합니다.</Div>

                    <Div p={20} mt={20} mb={50}>
                        <Button py={12} block bg={'green'} fg={'white'} textAlign={'center'} rounded={5}
                              onClick={onConfirmClick}> 회원가입 완료 </Button>
                    </Div>

                    {/*{WIDERPLANET SCRIPT START 2022.06.07}*/}
                    <TG ty={"Join"} />
                    {/*{WIDERPLANET SCRIPT END 2022.06.07}*/}
                </Div>
            )
        }
    }

}

export default withRouter(JoinComplete)