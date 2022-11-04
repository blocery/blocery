import React, {Component, useState, useEffect, useMemo} from 'react'
import loadable, {lazy} from "@loadable/component";
import { Route, Switch, Redirect, withRouter } from 'react-router-dom'
import ComUtil from '../util/ComUtil'
import { Server } from '~/components/Properties'
import { ProducerPrivateRoute } from "./ProducerPrivateRoute";
import { AdminPrivateRoute } from "./AdminPrivateRoute";
import {exchangeWon2BLCTHome} from '~/lib/exchangeApi'
import SecureApi from '~/lib/secureApi'
import {useRecoilState} from "recoil";
import {boardTagModalState, consumerState, imageViewerModalState} from "~/recoilState";
import {autoLoginCheckAndTryAsync, getLoginUser} from "~/lib/loginApi";
import HashTagModal from "~/components/shop/hashTag/HashTagModal";
import useLogin from "~/hooks/useLogin";
import useZzim from "~/hooks/useZzim";
import {Webview} from "~/lib/webviewApi"
import useEventListener from "~/hooks/useEventListener";
import { ToastContainer, toast } from 'react-toastify'
import {PrivateRoute} from "~/router/PrivateRoute";
import LoginModal from "~/components/common/modals/LoginModal";
import useNotice from "~/hooks/useNotice";  //토스트

const ConsumerKakaoJoin = loadable(() => import('~/components/shop/join/ConsumerKakaoJoin'))
const ImageViewerModal = loadable(() => import('~/components/common/modals/ImageViewerModal'))
const ShopContainer = loadable(() => import('./ShopContainer'));
const AdminContainer = loadable(() => import('./AdminContainer'));
const ProducerWebContainer = loadable(() => import('./ProducerWebContainer'));
const SampleContainer = loadable(() => import('./SampleContainer'));
const AdminLogin = loadable(() => import('~/components/admin/AdminLogin'));
const ProducerJoinWeb = loadable(() => import('~/components/shop/join/ProducerJoinWeb'))
const ProducerJoinWebFinish = loadable(() => import('~/components/shop/join/ProducerJoinWebFinish'))
const WebLogin = loadable(() => import('~/components/producer/web/WebLogin'))
const Login = loadable(() => import('~/components/producer/mobile/Login'))
const ArPopup = loadable(() => import('~/components/common/Ar/ArPopup'))
const Error = loadable(() => import('~/components/Error'));

const Intro = loadable(() => import('~/components/outside/producerCenter/join/intro'))
const Question = loadable(() => import('~/components/outside/producerCenter/join/question'))
const CheckJoinStatus = loadable(() => import('~/components/outside/producerCenter/join/checkJoinStatus'))
const ProducerJoinAgree = loadable(() => import('~/components/outside/producerCenter/join/agree'))

const RequestProducerJoin = loadable(() => import("~/components/outside/producerCenter/join/request"))
const CreateAccount = loadable(() => import("~/components/outside/producerCenter/join/createAccount"))
const JoinComplete = loadable(() => import("~/components/outside/producerCenter/join/joinComplete"))

const ProducerDashboard = loadable(() => import("~/components/outside/producer/dashboard"))

//로컬 농가 재고관리 화면
const LocalCount = loadable(() => import('~/components/shop/local/count/LocalCount'))
const FarmerCount = loadable(() => import('~/components/shop/local/count/FarmerCount')) //재고관리
const FarmerPrintCount = loadable(() => import('~/components/shop/local/count/FarmerPrintCount')) //입고관리

const Font = () => [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map(size =>
    <div style={{fontSize: size}}>font-size {size} 가나다라 abcd ABCD 1234</div>
)

const index = ({history}) => {

    const [imageViewerState, setImageViewerState] = useRecoilState(imageViewerModalState)
    const [tagModalState] = useRecoilState(boardTagModalState)
    const [consumer, setConsumer] = useRecoilState(consumerState)

    const {pathname} = history.location

    const login = useLogin()
    const {reFetch: reFetchZzimList, clear: clearZzimList} = useZzim()

    useEffect(() => {
        if(tagModalState.isOpen){
            ComUtil.noScrollBody()
        }else{
            ComUtil.scrollBody()
        }
    }, [tagModalState.isOpen])

    useEffect(() => {
        sessionStorage.setItem("pathname", pathname)

        //이미지 모달 닫히게(초기화)
        if (imageViewerState.isOpen) {
            setImageViewerState(prev => ({
                isOpen: false,
                images: [],
                slideIndex: null
            }))
        }


    }, [pathname])

    useEffect(() => {

        //앱 최초 구동 시 뒤로가기에 홈이 될 수 있도록 pageLen을 0으로 초기화
        localStorage.setItem("pageLen", 0)

        async function fetchLoginInfo() {

            //앱시작시 한번만 실행됨... 자동로그인 시도 중. 20200410.
            const loginUser = await autoLoginCheckAndTryAsync();
            // console.log('fetchLoginInfo',loginUser)

            if (loginUser) {
                setConsumer(ComUtil.getConsumerByLoginUser(loginUser));
            }else {
                setConsumer(null);
            }


            //로그인 된 정보(세션)를 재 조회하여 담기
            //아래 내용은 위에서 자동로그인 후 바로 refetch() 하면 비동기가 아니지만 로그인 값이 null로 떨어짐(이해불가..)
            // await login.reFetch()
        }

        fetchLoginInfo()

        // //로그인 정보 저장
        // setLoginUser()

        // // react-native에서 현재 url을 반환받기 위해 추가
        // document.addEventListener('message', async (event)=>{
        //     // url type
        //     Webview.objAppLog(event.data)
        //
        //     let data = JSON.parse(event.data)
        //     if(data.action === "KAKAO_LOGIN") {
        //
        //         let accessToken = data.accessToken;
        //         let refreshToken = data.refreshToken;
        //
        //         if (accessToken) {
        //
        //             //React Native 에소 호출된 경우.. 로그인 확인 후, 가입페이지로 이동 or 로그인완료 처리.
        //             const res = await ComUtil.kakaoLoginWithAccessKey(accessToken,refreshToken);
        //
        //             if (res.result === 'SUCCESS') {
        //                 alert('SUCCESS 로그인 정보 조회 및 세팅')
        //                 //로그인 정보 조회 및 세팅
        //                 await login.reFetch()
        //
        //                 login.closeLoginModal()
        //
        //
        //             }else if (res.result === 'NEED_KAKAO_JOIN') {
        //                 alert('NEED_KAKAO_JOIN 회원가입 필요')
        //             }
        //             else if (res.result === 'FIRED') {
        //                 alert('FIRED 당분간 회원가입 못함')
        //
        //             }
        //
        //         }
        //     } else {
        //         let url = window.location.href;
        //         const data = {url: url, type: "CURRENT_URL"}
        //         window.ReactNativeWebView.postMessage(JSON.stringify(data))
        //     }
        // })

        // react-native에서 현재 url을 반환받기 위해 추가
        // document.addEventListener('message', messageFromReactNative)

        //라우터 변경시 callback : 항상 최상단으로 유지
        history.listen((location, action) => {





            // console.log('listen',location)

            //예상치 못한 스크롤 되지 않을 경우 대비
            if(document.body.style.overflow === 'hidden') {
                ComUtil.scrollBody()
            }

            //bly 기준가 sessionStorage 에 저장
            exchangeWon2BLCTHome();

            console.log("action:"+action)

            if(action === "POP"){

                localStorage.setItem("pageLen", parseInt(localStorage.getItem("pageLen")||0)-1);

                //window.scrollTo({top:0, behavior:'smooth'});
                const pageYOffset = sessionStorage.getItem("pageYOffset_"+location.pathname)

                if(pageYOffset){
                    console.log("pageYOffset:"+pageYOffset)

                    setTimeout(()=>{
                        // if (pageYOffset <= 300){
                        //     window.scrollTo({top:pageYOffset, behavior: 'smooth'})
                        // }
                        // else{

                        //board 같은 경우 알 수 없는 이유로 pageYOffset 이 0으로 저장 되서 강제로 항상 최상위로 올라가서, 0 이상일 경우만 아래로 향하도록 함.
                        //다행히도 board 페이지는 별도 스크롤을 잡아주지 않아도 알아서 기억 함. 이유는, 여러가지 컴포넌트 로드가 아니라서 그런것으로 판단 됨
                        if (pageYOffset > 0) {
                            window.scrollTo({top:pageYOffset})
                        }

                        // }

                    },500)

                }
            }
            else if(action === "PUSH") {

                localStorage.setItem("pageLen", parseInt(localStorage.getItem("pageLen")||0)+1);

                let pageYOffset = null;
                // cross browser 대응
                if(window.pageYOffset){
                    pageYOffset = window.pageYOffset;
                }else{
                    pageYOffset = document.documentElement.scrollTop || document.body.scrollTop;
                }

                console.log("pageYOffset:"+sessionStorage.getItem("pathname")+pageYOffset)


                // console.log({
                //     'window.pageYOffset': window.pageYOffset,
                //     'document.documentElement.scrollTop': document.documentElement.scrollTop,
                //     'document.body.scrollTop': document.body.scrollTop,
                //     'sessionStorage.getItem("pathname")': sessionStorage.getItem("pathname"),
                //     pageYOffset: pageYOffset
                // })

                sessionStorage.setItem("pageYOffset_"+ sessionStorage.getItem("pathname"), pageYOffset)
                // sessionStorage.setItem("scrollPosition_"+ history.location.pathname, 0)
                window.scrollTo(0,0)
            }
        });

    },[]);

    //React-native 로 부터 넘어온 부분 처리 브릿지
    const messageFromReactNative = async (event)=>{

        if(!ComUtil.isMobileApp()) {
            return false;
        }

        // url type
        Webview.objAppLog(event.data)

        let data;
        let action = "BACK_PRESSED"

        if(event && event.data) {
            try {
                data = JSON.parse(event.data)
                if (data.action)
                    action = data.action;
            } catch(err) {

            }
        }

        if(action === "APP_PUSH") {
            // alert(data.params.title + " " + data.params.body);
            console.log({push:data.params})
            toast(`${data.params.title} ${data.params.body}`, {
                position: toast.POSITION.TOP_RIGHT,
                icon: "💬"
                // icon: ({theme, type}) => <RiMessage3Line size={25}/>
                //className: ''     //클래스를 넣어도 됩니다
            });


        }else if(action === "KAKAO_LOGIN") {
            let accessToken = data.accessToken;
            let refreshToken = data.refreshToken;

            if (accessToken) {
                //React Native 에소 호출된 경우.. 로그인 확인 후, 가입페이지로 이동 or 로그인완료 처리.
                const res = await ComUtil.kakaoLoginWithAccessKey(accessToken,refreshToken);

                if (res.result === 'SUCCESS') {
                    //로그인 정보 조회 및 세팅
                    //샵블리 버전
                    // await login.reFetch()
                    //마켓블리 버전 => 추후 이걸 샵블리로 그대로 써도 될 듯 함
                    setConsumer(res.data)

                    login.closeLoginModal()

                    if (history.location.state && history.location.state.from) {
                        const movePage = history.location.state.from
                        //원래 이동 하려는 url로 이동 (현재 로그인 페이지로 오기 전 PrivateRoute 에서 state.from 에 담아둔 값을 이용)
                        // console.log("movePage2:", movePage)
                        Webview.appLog("movePage2:" + movePage)
                        history.replace(movePage)
                    }

                }else if (res.result === 'NEED_KAKAO_JOIN') {
                    login.closeLoginModal()
                    //회원가입 페이지로 이동
                    history.push({
                        pathname: '/consumerKakaoJoin',
                        state: {consumer : res.data.consumer} /* {consumer: {...}} */
                    })
                }
                else if (res.result === 'FIRED') {
                    // login.closeLoginModal()
                    alert(`탈퇴 후 재가입은 90일 이후에 가능합니다. 재가입 가능일 : ${res.data.stopLoginReJoinDate && ComUtil.intToDateString(res.data.stopLoginReJoinDate)}`)
                }
            }
        } else if(action === "BACK_PRESSED") {
            let url = window.location.href;
            const params = {url: url, type: "CURRENT_URL"}
            window.ReactNativeWebView.postMessage(JSON.stringify(params))

            //canGoBack
        }
    }

    useEventListener('message', messageFromReactNative, ComUtil.isMobileAppIos() ? window : ComUtil.isMobileAppAndroid() ? window.document : null)

    const consumerNo = useMemo(() => consumer ? consumer.consumerNo : null, [consumer])

    useEffect(() => {
        console.log("consumer changed")
        if (!consumer) {
            clearZzimList()
        }else{
            reFetchZzimList()
        }
    }, [consumerNo])

    // const setLoginUser = async () => {
    //     console.log("router didmount login============================")
    //     const loginUser = await getLoginUser()
    //     if (loginUser && loginUser.userType === 'consumer') {
    //         setConsumer({
    //             consumerNo: loginUser.uniqueNo,
    //             email: loginUser.email,
    //             userType: loginUser.userType,
    //             name: loginUser.name,
    //             nickname: loginUser.nickname,
    //             profile: loginUser.profile,
    //         })
    //     }else{
    //         setConsumer(null)
    //     }
    // }

    return(
        <>
            <Switch>
                <Route exact path='/producerJoinWeb' component={ProducerJoinWeb}/>
                <Route exact path='/producerJoinWeb/finish' component={ProducerJoinWebFinish}/>
                <Route exact path='/consumerKakaoJoin' component={ConsumerKakaoJoin}/>


                <Route exact path={'/b2c'} render={()=><Redirect to={'/'}/>} />

                {/* 관리자 로그인 검증*/}
                <Route path={'/admin/login'} component={AdminLogin} />
                {/* <Rooute> 가 두번 중복되어 직관적으로 변경함 : jaden */}
                <AdminPrivateRoute path={'/admin/:type/:id/:subId'} component={AdminContainer} />

                <Route path={'/admin'} render={() => (<Redirect to={Server.getAdminShopMainUrl()}/>)} />

                {/* 생산자 모바일 로그인 다시추가:pivot*/}
                <Route exact path={'/producer/login'} component={Login}/>

                {/* 생산자 웹 로그인 검증*/}
                {/* <Rooute> 가 두번 중복되어 직관적으로 변경함 : jaden */}
                <ProducerPrivateRoute path={'/producer/web/:id/:subId'} component={ProducerWebContainer} />
                {/* producer/ 로 접속 하였을 경우 최초 페이지 지정 */}
                <Route exact path={'/producer/web'} render={() => (<Redirect to={'/producer/web/home/home'}/>)} />
                <Route exact path={'/producer/webLogin'} component={WebLogin}/>
                {/* producer 로 접속 하였을 경우 최초 페이지 지정 */}
                <Route exact path={'/producer'} render={() =>
                {
                    return <Redirect to={'/producer/web/home/home'}/>
                }
                } />

                {/* 생산자용 대시보드 */}
                <Route path={'/producerDashboard'} component={ProducerDashboard}
                       // userType={'consumer'}
                />

                <Route path={'/sample'} component={SampleContainer}/>


                <Route path={'/font'} component={Font} />

                <Route exact path={'/arPopup'} component={ArPopup}/>

                {/* 생산자 가입안내 이미지*/}
                <Route path='/producerCenter/join/intro' component={Intro}/>

                {/* 동의하기 */}
                <Route path='/producerCenter/join/agree' component={ProducerJoinAgree}/>

                {/* 입점신청 */}
                <Route path='/producerCenter/join/request' component={RequestProducerJoin}/>
                {/* 입점상담 */}
                <Route path='/producerCenter/join/question' component={Question}/>
                {/* 진행확인 */}
                <Route path='/producerCenter/join/checkJoinStatus' component={CheckJoinStatus}/>
                {/* 로그인 계정생성 */}
                <Route path='/producerCenter/join/createAccount' component={CreateAccount}/>
                {/* 계정생성완료 */}
                <Route path='/producerCenter/join/joinComplete' component={JoinComplete}/>

                {/* 로컬푸드 농가재고관리 Dashboard */}
                <Route exact path={'/localCount/:producerNo'} component={LocalCount} />
                <Route exact path={'/localCount/localFarmer/:producerNo/:localFarmerNo'} component={FarmerCount} />
                <Route exact path={'/localCount/farmerPrint/:tabId/:seq'} component={FarmerPrintCount} />

                <Route path={'/'} component={ShopContainer} />

                <Route component={Error}/>
            </Switch>

            {/* 해시태그 통합검색 모달 */}
            <HashTagModal />

            {/* 이미지뷰어 전체 모달 */}
            <ImageViewerModal />

            <ToastContainer
                newestOnTop //최신 메시지 최상단으로
                draggable   //드래그로 닫기 가능
                limit={3} //화면에 표시할 총 최대 토스트 개수
                draggablePercent={50} //드래그로 닫는 퍼센트 0 ~ 100 default 80.
            />

            {/* 로그인 모달 */}
            <LoginModal />

        </>
    )
}

export default withRouter(index)