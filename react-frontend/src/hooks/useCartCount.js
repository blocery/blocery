import React from 'react';
import PropTypes from 'prop-types';
import {useRecoilState, useSetRecoilState} from "recoil";
import {cartCountState} from "~/recoilState";
import {getCartCount} from "~/lib/cartApi";

const useCartCount = (props) => {
    const [cartCount, setCartCount] = useRecoilState(cartCountState)

    //로그인 한 사용자가 볼 수 있는 알림
    const setPrivateCartCount = async () => {
        try {
            //getCart 에서 getCartCount 로 변경함
            // const {status, data} = await getCart()
            const {status, data} = await getCartCount()

            if (status === 200) {
                console.log("setPrivateCartCount:",data)
                setCartCount(data)
            }
        }catch (err) {
            console.error(err.message)
        }
    }

    return {cartCount, setPrivateCartCount}
};

export default useCartCount;
