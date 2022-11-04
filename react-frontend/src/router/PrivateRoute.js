import React from 'react'
import { Route, Redirect, useHistory } from 'react-router-dom'
import { Webview } from '../lib/webviewApi'
import ComUtil from '../util/ComUtil'
import {useRecoilState} from "recoil";
import {consumerState} from "~/recoilState";
import Login from "~/components/shop/login/Login";

const fakeAuth = {
    isAuthenticated: function(){
        //cookie check
        const logined = sessionStorage.getItem('logined');
        if (logined == 0) { //logout을 명시적으로 한 경우는 확실히 0 = false로 리턴.
            //console.log('fakeAuth return false');
            return false;
        }
        return true;
    }
}

export function PrivateRoute({ component: Component, userType, ...rest }) {
    const [consumer] = useRecoilState(consumerState)

    return (
        <Route
            {...rest}
            render={
                props => {
                    return consumer ? (
                        <Component {...props} />
                    ) : (
                        <Redirect to={{
                            pathname: '/login',
                            state: {from: props.location} //사용자가 이동 하려고 한 url
                        }} />
                        // Webview.openPopup('/login')
                    )
                }
            }
        />
    );
    // return (
    //     <Route
    //         {...rest}
    //         render={
    //             props => {
    //                 const isLoggedIn = fakeAuth.isAuthenticated()
    //                 //console.log('in privateRoute: userType, isLoggedIn', userType, isLoggedIn);
    //                 //console.log('consumer, isLoggedIn? '+isLoggedIn)
    //                 return isLoggedIn ? (
    //                     <Component {...props} />
    //                 ) : (
    //                     history.push('/login')
    //                     // Webview.openPopup('/login')
    //                 )
    //             }
    //         }
    //     />
    // );
}
