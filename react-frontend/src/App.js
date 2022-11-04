import React, { useEffect } from 'react'
import jQuery from "jquery";
import Router from './router'
import { BrowserRouter } from 'react-router-dom'
import {Server} from "~/components/Properties";
//redux 대체용 전역 state 관리
import { RecoilRoot } from 'recoil';

import theme from "~/styledComponents/theme";
import media from '~/styledComponents/media'
import { ThemeProvider } from "styled-components";
import moment from "moment-timezone";
import ComUtil from "~/util/ComUtil";

require('~/plugin/bloceryCustom')

moment.locale('ko')

// // react-native에서 현재 url을 반환받기 위해 추가
// document.addEventListener('message', ()=>{
//     // url type
//     let url = window.location.href;
//     const data = {url: url, type: "CURRENT_URL"}
//     window.ReactNativeWebView.postMessage(JSON.stringify(data))
// })

//class => hook 로 변경(20210702 JADEN)
function App (props) {

    useEffect(() => {
        window.$ = window.jQuery = jQuery;
        window.clog = function() {
            if(Server._serverMode() === "stage") {
                var i;
                const logs = []
                for (i = 0; i < arguments.length; i++) {
                    logs.push(arguments[i])
                }
                console.log(logs);
            }
        }
        getHeadKakaoScript();
        getHeadArScript();
        initializeInfo();
        localStorage.setItem('today', ComUtil.utcToString(new Date()));
    }, [])

    const initializeInfo = async () => {
        // useLogin() 을 사용하려면 RecoilRoot 안쪽에 있어야 해서 router/index.js 로 옮김 (20210702 JADEN)
        // //앱시작시 한번만 실행됨... 자동로그인 시도 중. 20200410.
        // await autoLoginCheckAndTryAsync();
    }


    // 외부 jquery, iamport 라이브러리
    const getHeadKakaoScript = () => {
        const script = document.createElement("script");
        script.async = true;
        script.src = "https://developers.kakao.com/sdk/js/kakao.min.js";
        document.head.appendChild(script);
        script.onload = () => {
            window.Kakao.init(Server.getKakaoAppKey());
        }
    }

    // 외부 ar lib
    const getHeadArScript = () => {
        const script = document.createElement("script");
        script.async = true;
        script.type = 'module';
        script.src = "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";
        document.head.appendChild(script);
    }

    return (
        <React.StrictMode>
            <RecoilRoot>
                <BrowserRouter>
                    <ThemeProvider theme={{...theme, ...media}}>
                        <Router></Router>
                    </ThemeProvider>
                </BrowserRouter>
            </RecoilRoot>
        </React.StrictMode>
    )
}

export default App;
