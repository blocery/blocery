import React, {useEffect} from 'react'
import {getCart} from '~/lib/cartApi'
import {Div, Flex, Link} from '~/styledComponents/shared'
import {useRecoilState} from "recoil";
import {cartCountrState, noticeState} from "~/recoilState";
import {FiShoppingCart} from 'react-icons/fi'
import {withRouter} from 'react-router-dom'
import {Webview} from "~/lib/webviewApi";
import useLogin from "~/hooks/useLogin";
import useNotice from "~/hooks/useNotice";
import useCartCount from "~/hooks/useCartCount";

function CartLinkButton({history, ...rest}) {
    const {isLoggedIn, isServerLoggedIn} = useLogin()
    const {cartCount, setPrivateCartCount} = useCartCount()
    //장바구니 카운트 조회 (장바구니 카운트가 변경되면 항상 조회 하도록)
    // useEffect(() => {
    //     getCart().then(({data}) => setCounter(data.length))
    // }, [count])
    useEffect(() => {
        setPrivateCartCount()
    }, [])

    const onClick = async () => {
        let loginUser = await isServerLoggedIn()
        if (!loginUser) { //} || !isLoggedIn()) { //백 || front
            //Webview.openPopup('/login')
        }else {
            history.push('/cartList')
        }
    }

    return (
        <Div onClick={onClick} cursor={1} pr={10}>
        {/*<Link to={'/cartList'}>*/}
            <Flex
                bg={'white'}
                // height={52}
                py={8}
                px={8}
                justifyContent={'center'}
                position={'relative'}
                textAlign={'center'}
                {...rest}
            >
                <FiShoppingCart size={26}/>
                {
                    cartCount > 0 && (
                        <Div absolute top={8} right={4}>
                            <Div rounded={8} minWidth={16} height={16} bg={'green'} fg={'white'} px={2} fontSize={11} lineHeight={16}>{cartCount}</Div>
                        </Div>
                    )
                }
            </Flex>
        {/*</Link>*/}
        </Div>
    )
}

export default withRouter(CartLinkButton)