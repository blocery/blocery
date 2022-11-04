import styled, {keyframes} from "styled-components";
import {getValue} from "~/styledComponents/Util";
import {color} from "~/styledComponents/Properties";
import React, {useEffect, useState, useRef} from "react";
import useInterval from "~/hooks/useInterval";
import {useRecoilState} from "recoil";
import {optionAlertState} from "~/recoilState";
import {useHistory} from 'react-router-dom'
import {getMyTotalProducerOrderPrice} from "~/lib/cartApi";
import ComUtil from "~/util/ComUtil";

const fadeInOut = keyframes`
  0% {opacity: 0;    }
  25% {bottom: 70px; opacity: .8; background: ${color.danger};}
  35% {bottom: 57px; opacity: 1; background: ${color.danger};}
  90% {bottom: 57px; opacity: 1; transform: scale(1); background: ${color.danger};}
  100% {bottom: 30px; opacity: 0; transform: scale(0.4);}
`
const RoundedBox = styled.div`
    position: absolute;
    bottom: ${getValue(57)};
    right: ${getValue(16)};
    // top: ${getValue(-25)};
    // right: ${getValue(16)};
    z-index: 9999;
    // width: ${getValue(50)};
    // height: ${getValue(50)};
    width: max-content;
    font-size: 14px;
    padding: 3px 5px;
    background: ${color.danger};
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    // border: 1px solid white;
    transform-origin: bottom center;
    animation: ${fadeInOut} 1.5s forwards ease alternate;
`


//옵션 추가시 +1 애니메이션 되는 객체
export function OptionAlert({action, producerNo = null, children}) {

    const [state, setState] = useState()
    const abortControllerRef = useRef(new AbortController());

    useInterval(() => {
        // setDelay(null)
        setState(null)
    }, state ? 1500 : null)

    useEffect(() => {

        //await cart 에서 같은 농가의 상품 조회

        async function fetch() {
            if (action === "CART_ADDED") {
                const {data} = await getMyTotalProducerOrderPrice(producerNo, abortControllerRef.current.signal)
                console.log({data})

                setState({
                    orderPrice: data.orderPrice,
                    producerNm: data.producerNm,
                    producerFarmNm: data.producerFarmNm
                })
            }
        }
        fetch()

        return(() =>
            abortControllerRef.current.abort()
        )
    }, [])

    //애니메이션 끝난 후 Element 제거
    // if (!delay) return null
    if (!state) return null

    //장바구니 담았을때 CART_ADDED
    if (action === 'CART_ADDED')
        return (
            <RoundedBox>
                <div>
                    <div>
                        {state.producerFarmNm}
                    </div>
                    <div>
                        총 <b>{ComUtil.addCommas(state.orderPrice)}</b>원 장바구니에 담겨 있어요!
                    </div>
                </div>
            </RoundedBox>
        )

    //옵션 담았을때 OPTION_ADDED
    return(
        <RoundedBox>
            옵션을 담았어요!
        </RoundedBox>
    )
}

export const OptionAlertHook = () => {
    const history = useHistory()
    const [optionAlerts, setOptionAlerts] = useRecoilState(optionAlertState)
    useEffect(() => {
        //페이지가 바뀔때마다 초기화
        if (optionAlerts && optionAlerts.length)
            setOptionAlerts([])
    }, [history.location.pathname])
    return(
        optionAlerts.map(item => <OptionAlert action={item.action} producerNo={item.producerNo} />)
    )
}
