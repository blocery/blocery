import React from 'react'
import ConsumerLogin from './ConsumerLogin'   //BuyerLogin.js
import BackNavigation from "~/components/common/navs/BackNavigation";
const Login = (props) => {
    return(
        <div>
            <BackNavigation hideHomeButton>샵블리 로그인</BackNavigation>
            <div><ConsumerLogin minHeight={'calc(100vh - 52px - 56px)'}/></div>
        </div>
    )
}
export default Login
