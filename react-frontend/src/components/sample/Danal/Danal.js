import React, { Component } from 'react'
import {Server} from "~/components/Properties";
import {toast} from "react-toastify";
import {Button} from "~/styledComponents/shared";
import ComUtil from "~/util/ComUtil";
import {initIMPHeadScript} from "~/util/PgUtil";

class Danal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            content: null
        }
    }

    async componentDidMount() {
        // this.setState({ gift: this.props.gift })

        //console.log("Buy.js - componentDidMount");
        // 외부 스크립트 (jquery,iamport)
        initIMPHeadScript();

    }

    //아임포트 다날 본인인증 창
    danalAuthOpen = async() => {

        const now = ComUtil.utcToString(new Date().getTime(), 'YYYYMMDDHHmmss');

        //본인인증호출용 data
        let userCode = Server.getImpKey();
        let data = { // param
            merchant_uid: "DANAL-"+now, // 인증용 주문번호
            m_redirect_url: Server.getFrontURL()+'/certificationFinish',   //모바일일경우 리다이렉트 페이지 처리
            popup: true,    // PC환경에서는 popup 파라메터가 무시되고 항상 true 로 적용됨
            min_age:14,     // 최소나이
            name:'',        // 이름
            phone:''        // 전화번호
        }

        //1. React-Native(Webview)용 본인인증호출 방식 /////////////////////////////////////////////////////////////////
        if (ComUtil.isMobileApp()) {
            data.m_redirect_url = '';
            data.popup = false;
            data.min_age = '14';
            this.setState({chainLoading: false});
            /* 리액트 네이티브 환경에 대응하기 */
            const params = {
                userCode,                       // 가맹점 식별코드
                data,                           // 결제 데이터
                type: 'certification',          // 결제와 본인인증 구분을 위한 필드
            };
            const paramsToString = JSON.stringify(params);
            window.ReactNativeWebView.postMessage(paramsToString); //(일반적으로) RN의 PopupScreen.js로 보내짐.

            return;
        }

        //2. Web용 아임포트  PG 본인인증 모듈 객체 /////////////////////////////////////////////////////////////////////
        const IMP = window.IMP;
        // 발급받은 가맹점 식별코드
        IMP.init(userCode);

        IMP.certification(data, rsp => {
            // callback
            //KCP 빌링 는 모바일에서 리다이렉트 페이지만 제공
            //웹에서는 콜백이 잘됨 (콜백에서도 처리하는걸 적용)
            if (rsp.success) {
                // 인증 성공 시 로직
                console.log("rsp.success===",rsp)
                //this.props.history.push('/certificationFinish?imp_uid='+rsp.imp_uid+'&imp_success=true'+'&merchant_uid='+ rsp.merchant_uid+'&error_msg='+'');
            } else {
                // 인증 실패 시 로직
                let msg = '인증에 실패하였습니다.';
                msg += '에러내용 : ' + rsp.error_msg;
                alert(msg);
            }
        });
    }

    render() {
        return (
            <div className='text-center'>
                <h4>다날 본인인증 테스트</h4>
                <Button bg={'green'} fg={'white'}
                        rounded={0}
                        py={15}
                        block
                        fontSize={18.5}
                        onClick={this.danalAuthOpen}>본인인증</Button>
            </div>
        );
    }
}

export default Danal