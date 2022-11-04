import React, { useState, useEffect } from 'react'
import {NavLink, Badge} from 'reactstrap'
import { getCart } from '~/lib/cartApi'
import { IconShoppingCart,IconShoppingCartWhite } from '~/components/common/icons'
import {Button, Div, Link} from '~/styledComponents/shared'
import {useRecoilState} from "recoil";
import {cartCountrState} from "~/recoilState";
import {FiShoppingCart} from 'react-icons/fi'
import {withRouter} from 'react-router-dom'
function CartLink(props) {

    const [count, setCounter] = useRecoilState(cartCountrState)

    //장바구니 카운트 조회 (장바구니 카운트가 변경되면 항상 조회 하도록)
    useEffect(() => {
        getCart().then(({data}) => setCounter(data.length))
    }, [count])

    return (

        <Button to={'/cartList'} bg={'white'} onClick={() => props.history.push('/cartList')} width={36} height={36} position={'relative'}>
            <FiShoppingCart size={25}/>
            {
                count > 0 && (
                    <Div absolute top={0} right={0}>
                        <Div rounded={8} minWidth={16} height={16} bg={'green'} fg={'white'} px={2} fontSize={11} lineHeight={16}>{count}</Div>
                    </Div>
                )
            }
        </Button>


        // <Link to={'/cartList'} noti={counter > 0} notiRight={-2} >
        //     {  (white)? <IconShoppingCartWhite/>
        //                : <IconShoppingCart/>
        //     }
        // </Link>
    )
}

export default withRouter(CartLink)