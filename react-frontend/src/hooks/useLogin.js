import React, {useState} from 'react';
import {useRecoilState} from "recoil";
import {consumerState, consumerZzimListState, loginModalState} from "~/recoilState";
import {getLoginUser} from "~/lib/loginApi";
import ComUtil from "~/util/ComUtil";
import {autoLoginCheckAndTryAsync} from '~/lib/loginApi'
import {Webview} from '~/lib/webviewApi'

const useLogin = () => {
    const [consumer, setConsumer] = useRecoilState(consumerState)
    const [modalOpen, setModalOpen] = useRecoilState(loginModalState)

    // front-end consumer 체크 (현재 미사용중, 삭제예정)
    const isLoggedIn = (showLoginModal = true) => {
        if (consumer) {
            return true
        }else{
            if (showLoginModal){
                setModalOpen(true)
            }
            return false
        }
    }

    /* back-end 로그인 여부 체크

    1. params
          * showLoginModal : 로그인 모달 여부 | default true
            - 라우트에 따른 사용방법
                  <Route>        true : 가능 (모달 띄움)
                  <PrivateRoute> true : 가능 (모달 띄움)
                                 false : 가능 (로그인 페이지 자동 이동)
    2. 리턴 값 : 로그인 성공시 loginUser, 실패시 false

    */
    const isServerLoggedIn = async (showLoginModal = true) => {

        // if (showLoginModal) {
            let loginUser = await search()

        console.log('useLogin > isServerLoggedIn() data ', loginUser)

            if (!loginUser || loginUser.userType !== 'consumer') {

                console.log('isServerLoggedIn()')

                //자동 로그인 시도(아래 다시 체크 구문을 생략)
                loginUser = await autoLoginCheckAndTryAsync()

                //다시 체크
                // loginUser = await search()

                // if (!loginUser) {
                //     setModalOpen(true)
                //     return false
                // }
            }

            //마켓블리 버전, front 까지 체크하도록 변경 함
            if (!loginUser || !consumer) { //back, front
                if (showLoginModal) {
                    // 카카오로그인이 popupScreen에서만 되는 ios 예외처리
                    //if (ComUtil.isMobileAppIos()) { //샵블리 버전
                    if (ComUtil.isMobileApp()) {      //마켓블리 버전
                        Webview.openPopup('/login')
                        return false;
                    }else{
                        //로그인 모달 뜸 (모든 라우트에서 사용 가능)
                        setModalOpen(true)
                        return false
                    }
                }else{
                    //로그인 페이지로 이동 (<PrivateRoute> 에서만 사용 가능)
                    return await reFetch()
                }
            }

            return ComUtil.getConsumerByLoginUser(loginUser)//__getSession(loginUser)
        // }else{
        //     return await reFetch()
        // }




        // const loginUser = await search()
        // console.log("isServerLoggedIn=====================")
        // //백엔드 로그인 되어있는지만 검증하고 reFetch()는 하지 않음.
        // //이유는 만약 <PrivateRoute> 페이지에서 로그아웃된 경우 reFetch() -> setConsumer(null) 처리 되면 <PrivateRoute> 에서 로그인 페이지로 자동 리디렉션 시키기 때문임
        // if (!loginUser || loginUser.userType !== 'consumer') {
        //     if (showLoginModal) {
        //         setModalOpen(true)
        //         return false
        //     }else{
        //         //모달이 아닌 강제 리디렉션을
        //         return await reFetch()
        //     }
        // }
        // return loginUser

        // if (await reFetch()) {
        //     return true
        // }
        // else{
        //     setModalOpen(true)
        //     return false
        // }
    }

    //db 재조회
    const reFetch = async () => {
        const loginUser = await search()

        if (loginUser && loginUser.userType === 'consumer') {

            const session = ComUtil.getConsumerByLoginUser(loginUser)//__getSession(loginUser)

            setConsumer(session)

            return session
        }else{
            setConsumer(null)
            return false
        }
    }

    const search = async () =>  {
        return await getLoginUser()

        // //로그인 사용자 정보 조회
        // const fetchLoginUser = getLoginUser().then(res => res)
        //
        // //로그인 사용자 찜 리스트 조회
        // const fetchZzimList = getZzimList().then(({data}) => data)
        //
        // const res = await Promise.all([
        //     fetchLoginUser,
        //     fetchZzimList
        // ])
        //
        // console.log({aaaaaa:a})
        //
        // const loginUser = __getSession(res[0])
        //
        // return {
        //     ...loginUser,     //로그인 유저
        //     zzimList: res[1]  //찜 리스트
        // }
    }

    //강제로 로그인 모달 열기
    //22.05.15 JADEN 앱과 구분지어 변경
    const openLoginModal = () => {
        if (ComUtil.isMobileApp()) {      //마켓블리 버전
            Webview.openPopup('/login')
        }else {
            setModalOpen(true)
        }
    }
    //PopupScreen 이 열렸을때는 동작하지 않음
    const closeLoginModal = () => setModalOpen(false)

    return {consumer, isLoggedIn, isServerLoggedIn, reFetch, openLoginModal, closeLoginModal, modalOpen}
}
export default useLogin
