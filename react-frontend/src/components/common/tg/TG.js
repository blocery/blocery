import React, {useState, useEffect, useRef, useMemo} from 'react';
import { Server } from '~/components/Properties';
import useLogin from "~/hooks/useLogin";
import ComUtil from "~/util/ComUtil";

const TG = (props) => {
    const divRef = useRef(null)
    const {consumer} = useLogin()

    useEffect(() => {
        let scriptIncludeChk=false;
        /* 고객넘버 등 Unique ID (ex. 로그인  ID, 고객넘버 등 )를 암호화하여 대입. */
        /*주의 : 로그인 하지 않은 사용자는 어떠한 값도 대입하지 않습니다. */
        const wpHcuid = consumer ? ComUtil.encrypt(consumer.consumerNo):"";

        const TI = "53698";         /*광고주 코드 */
        const TY = props.ty;        /*트래킹태그 타입 */
        const ITEMS = props.items;  /* 상품,찜,장바구니,구매완료 */
        // console.log("TG",TY);
        // console.log("ITEMS",ITEMS);
        const scriptTGVars = document.createElement("script");
        let DEVICE = "web";     /*디바이스 종류  (web 또는  mobile)*/
        if (ComUtil.isMobileApp() || ComUtil.isMobileWeb()) {
            DEVICE = "mobile";
        }

        let tgData = {
            wp_hcuid:wpHcuid,
            ti:TI,
            ty:TY,
            device:DEVICE
        };

        let htmlScriptCodeVars = JSON.stringify(tgData);
        // `{
        //     wp_hcuid:"${wpHcuid}",
        //     ti:"${TI}",
        //     ty:"${TY}",
        //     device:"${DEVICE}"
        // }`;
        if(TY === 'Home'){
            scriptIncludeChk = true;
            htmlScriptCodeVars = JSON.stringify(tgData);
            // console.log("htmlScriptCodeVars=",htmlScriptCodeVars);
        }
        else if(TY === 'Item'){
            //상품 페이지
            const ARRITEMS = [];
            if(ITEMS) {
                ARRITEMS.push({i:ITEMS.goodsNo,t:ITEMS.goodsNm});
            }
            if(ARRITEMS.length > 0){
                scriptIncludeChk = true;
            }
            /* 상품 식별번호 (Feed로 제공되는 상품코드와 일치해야 합니다.) */
            /* 상품명 */
            tgData = {
                wp_hcuid:wpHcuid,
                ti:TI,
                ty:TY,
                device:DEVICE,
                items:ARRITEMS
            }
            htmlScriptCodeVars = JSON.stringify(tgData);
            // console.log("htmlScriptCodeVars=",htmlScriptCodeVars);
        }
        else if(TY === 'Wish'){
            //찜리스트 페이지
            if(ITEMS) {
                const ARRITEMS = [];
                ITEMS && ITEMS.map( (goods) => {
                    if(goods) {
                        ARRITEMS.push({i: goods.goodsNo, t: goods.goodsNm});
                    }
                });
                if(ARRITEMS.length > 0){
                    scriptIncludeChk = true;
                }
                tgData = {
                    wp_hcuid:wpHcuid,
                    ti:TI,
                    ty:TY,
                    device:DEVICE,
                    items:ARRITEMS
                };
                htmlScriptCodeVars = JSON.stringify(tgData);
                // console.log("htmlScriptCodeVars=",htmlScriptCodeVars);
            }
        }
        else if(TY === 'Cart'){
            //장바구니 페이지
            // items:[
            // {i:"상품ID", t: "상품명"}, 	 /*첫번째 상품 - i: 상품 식별번호 (Feed로 제공되는 식별번호와 일치) t: 상품명*/
            // {i:"상품ID", t: "상품명"} 	 /*두번째 상품 - i: 상품 식별번호 (Feed로 제공되는 식별번호와 일치) t: 상품명*/
            //]
            if(ITEMS) {
                const ARRITEMS = [];
                ITEMS && ITEMS.map( (goods) => {
                    if(goods) {
                        ARRITEMS.push({i: goods.goodsNo, t: goods.goodsNm});
                    }
                });
                if(ARRITEMS.length > 0){
                    scriptIncludeChk = true;
                }
                tgData = {
                    wp_hcuid:wpHcuid,
                    ti:TI,
                    ty:TY,
                    device:DEVICE,
                    items:ARRITEMS
                }
                htmlScriptCodeVars = JSON.stringify(tgData);
                // console.log("htmlScriptCodeVars=",htmlScriptCodeVars);
            }
        }
        else if(TY === 'Login'){
            //로그인 전환시 페이지
            // items:[{
            //     i:"로그인",	 /*전환 식별 코드  (한글 , 영어 , 번호 , 공백 허용 )*/
            //     t:"로그인",	 /*전환명  (한글 , 영어 , 번호 , 공백 허용 )*/
            //     p:"1", 	 /*전환가격  (전환 가격이 없을 경우 1로 설정 )*/
            //     q:"1"  	 /*전환수량  (전환 수량이 고정적으로 1개 이하일 경우 1로 설정 )*/
            // }]
            scriptIncludeChk = true;
            tgData = {
                wp_hcuid:wpHcuid,
                ti:TI,
                ty:TY,
                device:DEVICE,
                items:[{i:"로그인",t:"로그인",p:"1",q:"1"}]
            }
            htmlScriptCodeVars = JSON.stringify(tgData);
            // console.log("TG-Login",htmlScriptCodeVars);
        }
        else if(TY === 'Join'){
            //회원가입 완료 페이지
            // items:[{
            //     i:"회원가입",	 /*전환 식별 코드  (한글 , 영어 , 번호 , 공백 허용 )*/
            //     t:"회원가입",	 /*전환명  (한글 , 영어 , 번호 , 공백 허용 )*/
            //     p:"1", 	 /*전환가격  (전환 가격이 없을 경우 1로 설정 )*/
            //     q:"1"  	 /*전환수량  (전환 수량이 고정적으로 1개 이하일 경우 1로 설정 )*/
            // }]
            scriptIncludeChk = true;
            tgData = {
                wp_hcuid:wpHcuid,
                ti:TI,
                ty:TY,
                device:DEVICE,
                items:[{i:"회원가입",t:"회원가입",p:"1",q:"1"}]
            }
            htmlScriptCodeVars = JSON.stringify(tgData);
            // console.log("TG-Join",htmlScriptCodeVars);
        }
        else if(TY === 'PurchaseComplete'){
            //구매완료 페이지
            const ARRITEMS = [];
            ITEMS && ITEMS.map( (order) => {
                if(order) {
                    ARRITEMS.push({i: order.goodsNo, t: order.goodsNm, p: order.orderPrice, q: order.orderCnt});
                }
            });
            if(ARRITEMS.length > 0){
                scriptIncludeChk = true;
            }
            // items:[
            //     {i:"상품ID", t: "상품명", p: "단가", q: "수량"}, 	 /*첫번째 상품 - i: 상품 식별번호 (Feed로 제공되는 식별번호와 일치) t: 상품명*/
            //     {i:"상품ID", t: "상품명", p: "단가", q: "수량"} 	 /*두번째 상품 - i: 상품 식별번호 (Feed로 제공되는 식별번호와 일치) t: 상품명*/
            // ]
            tgData = {
                wp_hcuid:wpHcuid,
                ti:TI,
                ty:TY,
                device:DEVICE,
                items:ARRITEMS
            }
            htmlScriptCodeVars = JSON.stringify(tgData);
            // console.log("htmlScriptCodeVars=",htmlScriptCodeVars);
        }
        const htmlScriptCode = `
        var wptg_tagscript_vars = wptg_tagscript_vars || [];
        wptg_tagscript_vars.push(
        (function() {
             return ${htmlScriptCodeVars};
        }));
        `;
        if(scriptIncludeChk) {

            // TG 스크립트 내부 코드 적용
            scriptTGVars.innerHTML = htmlScriptCode;
            scriptTGVars.type = "text/javascript";

            // TG 스크립트 라이브러리 include
            const scriptTG = document.createElement("script");
            scriptTG.async = true;
            scriptTG.src = "//cdn-aitg.widerplanet.com/js/wp_astg_4.0.js";

            // 상용에서만 동작하도록 처리
            if(Server._serverMode() === 'production') {
                const containerScript = divRef.current;
                containerScript.append(scriptTGVars, scriptTG);
            }
            // else{
            //     const containerScript = divRef.current;
            //     containerScript.append(scriptTGVars);
            // }
        }

    }, [])

    return (
        <>
            {/*{WIDERPLANET SCRIPT START 2022.06.07}*/}
            <div id={"wp_tg_cts"} style={{"display":"none"}}></div>
            <div ref={divRef} id={"tgDivScript"}></div>
            {/*{WIDERPLANET SCRIPT END 2022.06.07}*/}
        </>
    );
};
export default TG;