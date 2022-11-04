import React, { Component } from 'react'
import {Server} from "~/components/Properties";
import {toast} from "react-toastify";
import {Button} from "~/styledComponents/shared";
import ComUtil from "~/util/ComUtil";

class Billing extends Component {
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
        this.getHeadScript();

    }

    // 외부 jquery, iamport 라이브러리
    getHeadScript = () => {
        //외부 Jquery 라이브러리
        if (!document.getElementById('jQuery')) {
            const scriptjQueryJS = document.createElement('script');
            scriptjQueryJS.id = 'jQuery';
            scriptjQueryJS.src = '//code.jquery.com/jquery-1.12.4.min.js';
            document.body.appendChild(scriptjQueryJS);
        }
        //외부 아임포트 라이브러리
        if (!document.getElementById('iamport')) {
            const scriptiamportJS = document.createElement('script');
            scriptiamportJS.id = 'iamport';
            scriptiamportJS.src = '//cdn.iamport.kr/js/iamport.payment-1.1.8.js';
            document.body.appendChild(scriptiamportJS);
        }
    }

    //아임포트 PG 결제창
    payPgOpen = async() => {

        //결제호출용 data
        let userCode = Server.getImpKey();
        let data = { // param
            pg: Server.getImpPgId("kakaopay_billing"), // KCP 빌링키 발급
            popup: true,
            pay_method: "card",     //신용카드(card)
            merchant_uid: "1111issue_billingkey_monthly_0001", // 빌링키 발급용 주문번호 === 주문그룹번호
            customer_uid: "davidlee_0001_1234", // 카드(빌링키)와 1:1로 대응하는 값 === consumerNo 값으로 하면 될듯??
            name: "예약상품",            //주문명(상품명)
            amount: 0,  //금액을 넣으면 빌링키 발급 창에서 금액표시가 됨 단순표시용(실제는 결제요청시 주문내역의 주문금액으로 나중에 처리)
            buyer_email: "ezfarm@ezfarm.co.kr",           //주문자 이메일주소
            buyer_name: "홍길동",              //주문자 명
            buyer_tel: "010-1234-1234",       //주문자 연락처 필수라서 혹시 없으면 주문정보에서라도 넣음.
            buyer_addr: "",                   //주문자 주소
            buyer_postcode: "",               //주문자 우편번호(5자리)
            m_redirect_url: Server.getFrontURL()+'/buyFinish',   //모바일일경우 리다이렉트 페이지 처리
            app_scheme: 'blocery',   //모바일 웹앱 스키마명
            display:{
                card_quota:[0,2,3]  //할부개월수 비자카드 문제로 2개월 3개월 까지
            }
        }

        //1. React-Native(Webview)용 결제호출 방식 /////////////////////////////////////////////////////////////////
        if (ComUtil.isMobileApp()) {
            this.setState({chainLoading: false});
            /* 리액트 네이티브 환경에 대응하기 */
            const params = {
                userCode,                             // 가맹점 식별코드
                data,                                 // 결제 데이터
                type: 'payment',                      // 결제와 본인인증 구분을 위한 필드
            };
            const paramsToString = JSON.stringify(params);
            window.ReactNativeWebView.postMessage(paramsToString); //(일반적으로) RN의 PopupScreen.js로 보내짐.

            return;
        }

        //2. Web용 아임포트  PG 결제 모듈 객체 /////////////////////////////////////////////////////////////////////
        const IMP = window.IMP;
        // 발급받은 가맹점 식별코드
        IMP.init(userCode);

        IMP.request_pay(data, rsp => {
            // callback
            //KCP 빌링 는 모바일에서 리다이렉트 페이지만 제공
            //웹에서는 콜백이 잘됨 (콜백에서도 처리하는걸 적용)
            if (rsp.success) {
                console.log("rsp.success===",rsp)
                // todo : buyFinish 이동후 결제 실제 요청 api 처리
                //this.props.history.push('/buyFinish?imp_uid='+rsp.imp_uid+'&imp_success=true'+'&merchant_uid='+ rsp.merchant_uid+'&error_msg='+'');
            } else {
                let msg = '결제에 실패하였습니다.';
                msg += '에러내용 : ' + rsp.error_msg;
                alert(msg);
            }
        });
    }

    render() {
        return (
            <div className='text-center'>
                <h4>예약결제 테스트</h4>
                <Button bg={'green'} fg={'white'}
                        rounded={0}
                        py={15}
                        block
                        fontSize={18.5}
                        onClick={this.payPgOpen}>결제테스트</Button>
            </div>
        );
    }
}

export default Billing