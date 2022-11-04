import React, {useEffect, useState} from 'react';
import HomeNavigation from "~/components/common/navs/HomeNavigation";
import {Route, Switch, useLocation, withRouter, Redirect} from "react-router-dom";
import Home from "~/components/shop/home";
import loadable from "@loadable/component";
import StoreSelectionToggle from "~/components/common/storeSelectionToggle";

const Local = loadable(() => import('~/components/shop/local/home'))

const Main = (props) => {
    // const location = useLocation()
    useEffect(() => {
        const params = new URLSearchParams(props.location.search)
        let moveTo = params.get('moveTo');
        console.log("=====================",moveTo)
        if (moveTo)  {

            console.log("Main moveTo is:"+moveTo)

            // setRedirectUrl('/' + moveTo)
            props.history.push('/'); //back을 대비해서 mypage로 돌아오도록 넣어놔야 함...
            props.history.push('/' + moveTo);
            //http://localhost:3000/?moveTo=mypage/notificationList
        }

        //추천인코드 localStorage에 임시저장
        let inviteCode = params.get('inviteCode');
        if (inviteCode) {
            console.log('inviteCode:'+ inviteCode);
            localStorage.setItem('inviteCode', inviteCode);
        }
    }, []);

    return (
        <div>
            <HomeNavigation />
            <StoreSelectionToggle />
            <Switch>
                <Route exact path={['/', '/home', '/home/1']} component={Home}/>
                <Route exact path={'/local'} component={Local}/>
            </Switch>
        </div>
    );
};

export default withRouter(Main);
