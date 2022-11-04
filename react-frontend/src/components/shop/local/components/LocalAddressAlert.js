import React, {useEffect, useState} from 'react';
import useScroll from "~/hooks/useScroll";
import {useRecoilValue} from "recoil";
// import {localDeliveryState} from "~/recoilState";
import {Flex} from "~/styledComponents/shared";
import {IoIosNotifications,RiNotification4Fill} from "react-icons/all";
import {color} from "~/styledComponents/Properties";
import styled, {css, keyframes} from 'styled-components'
import {getLocalfoodDeliveryText} from "~/lib/localfoodApi";
import ComUtil from "~/util/ComUtil";
import useLogin from "~/hooks/useLogin";
import {useHistory} from "react-router-dom";


const ani = keyframes`
    0% {}
    50% {
        color: ${color.danger}; 
        transform: rotate(-30deg);               
    }
    100% {        
    }   
`
const aniCss = css`
    transform: rotate(30deg);
    transform-origin: top;
    animation: ${ani} 1s infinite ease-in-out;
`

const IconWrap = styled.div`
    ${p => p.active ? aniCss : ''}
`


//TODO: 배송지역이 아닌경우 나오는 알림 (LocalAddressCard 에서 recoil 에 세팅해줌)
const LocalAddressAlert = ({producerNo}) => {

    const history = useHistory();

    // const {y} = useScroll()
    //로컬지역 배송가능 여부
    // const isLocalDelivery = useRecoilValue(localDeliveryState)
    const {consumer, isServerLoggedIn} = useLogin() //login정보

    const [res, setRes] = useState();

    // const onClick = () => isLocalDelivery === null ?  alert('배송지를 설정해주세요.') : alert('현재 선택된 주소는 배송이 지원되지 않는 지역입니다.')
    const onClick = async () => {
console.log({res})
        if (await isServerLoggedIn()) {
            if ([0,1,3].includes(res.resCode)) {

                let msg = '';
                if (res.resCode === 0) {
                    msg = '설정된 배송지가 없습니다. 배송지 설정 메뉴로 이동 하시겠습니까?'
                }else if (res.resCode === 1) {

                }else if (res.resCode === 3) {

                    if (res.errMsg.indexOf("휴일") > -1) {
                        alert("금일은 주문 할 수 없습니다.(휴일)")
                        return
                    }else{
                        msg = '현재 선택된 기본배송지는 배송 불가능 지역입니다. 배송지 설정 메뉴로 이동 하시겠습니까?'
                    }


                }
                if (window.confirm(msg)) {
                    history.push('/local/addressList')
                }
            }
        }
    }


    useEffect(() => {
        console.log({producerNo})
        if (producerNo) {
            fetch()
        }
    }, [producerNo, consumer])

    const fetch = async () => {
        // 로그인 X : 0, "배송지를 설정해 주세요"
        // 로그인 O 배송지 없으면 : 0, "배송지를 설정해 주세요"
        // 로그인 O producerNo X : 1, ""
        // 로그인 O producerNo O 배송가능지역 : 2, "x시 이내 배송가능"
        // 로그인 O producerNo X 배송불가능지역 : 3, "배송 불가능한 지역"
        // if (producerNo) { //localStore 에서 진입시에만 호출됨. => 무조건 진입으로 변경
        let {status, data: errorRes} = await getLocalfoodDeliveryText(producerNo);

        if (status === 200) {
            setRes(errorRes)
        }
        // if (status === 200 && errorRes.resCode !== 2) {
        //
        // }
    }

    // if (y < 100) return null
    if (res === undefined || res.resCode === 2) return null

    return(
        <Flex width={56} height={56} justifyContent={'center'} onClick={onClick} cursor>
            <IconWrap active={true}>
                <IoIosNotifications color={color.danger} size={25} />
            </IconWrap>
        </Flex>
    )
};

export default LocalAddressAlert;
