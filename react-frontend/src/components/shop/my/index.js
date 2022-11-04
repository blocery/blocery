//Home.js 원본
import React, { Fragment, useEffect, lazy, Suspense } from 'react'
import { Route, Switch } from 'react-router-dom'
import {ModalPopup, SpinnerBox, Sticky} from '~/components/common'
import { ZzimList } from '~/components/shop'
import {MdNotificationsActive} from "react-icons/md";
import loadable from "@loadable/component";
import { BLCT_TO_WON } from "~/lib/exchangeApi"
import ShopScrolledNav from "~/components/common/navs/shopScrolledNav";
import {useRecoilState} from "recoil";
import {shopNavMenuState} from "~/recoilState";
import {isTimeSaleBadge, isBlyTimeBadge, isSuperRewardBadge, isDealGoodsBadge} from '~/lib/shopApi'
import useInterval from "~/hooks/useInterval";
import BackNavigation from "~/components/common/navs/BackNavigation";
import useNotice from "~/hooks/useNotice";

const FavoriteGoodsList  = lazy(() => import('~/components/shop/favoriteGoodsList'), {
    fallback: <SpinnerBox minHeight={160} />
})
const ZzimGoodsList  = lazy(() => import('~/components/shop/zzimGoodsList'), {
    fallback: <SpinnerBox minHeight={160} />
})
const Store = (props) => {

    const [menuState, ] = useRecoilState(shopNavMenuState)
    // const {noticeInfo, setPublicNotices} = useNotice()
    const {menuGroupList, menuList} = menuState.my

    // useEffect(() => {

        //TODO RENEW : main.js 로 이동 [jaden]
        // const params = new URLSearchParams(props.location.search)
        // let moveTo = params.get('moveTo');
        // if (moveTo)  {
        //     props.history.push('/home'); //back을 대비해서 mypage로 돌아오도록 넣어놔야 함...
        //     props.history.push('/' + moveTo);
        // }
        //
        // //추천인코드 localStorage에 임시저장
        // let inviteCode = params.get('inviteCode');
        // if (inviteCode) {
        //     console.log('inviteCode:'+ inviteCode);
        //     localStorage.setItem('inviteCode', inviteCode);
        // }

    // }, [])

    // 자동로그인 기능
    //App.js으로 옮겨서 시도 중:20200410 autoLoginCheckAndTry();

    setBlct();
    //BLCT 40.00원 쿠키에 저장.
    async function setBlct() {
        let {data: blctToWon} = await BLCT_TO_WON();
        sessionStorage.setItem('blctToWon', blctToWon);
    }

    // function setScroll(){
    //     window.scrollTo(0, 0)
    // }
    //
    // useEffect(()=>{
    //     setScroll()
    // })


    return (

        <div>
            <Sticky>
                {/*<B2cHeader />*/}
                <BackNavigation>나의 즐겨찾기</BackNavigation>
                {/*<HomeNavigation homeUrl={'/'}></HomeNavigation>*/}
                {/*<HeaderSectionTab tabId={props.match.params.id} />*/}

                <Sticky top={56} zIndex={3}>
                    <ShopScrolledNav top={56} menuGroupList={menuGroupList} menuList={menuList} />
                </Sticky>

            </Sticky>
            {/* 자식페이지에서 margin 겹침현상을 없애기 위해 padding 으로 변경함. 40px은 <HeaderSectionTab /> 의 height 이다 */}
            <div>
                <Suspense fallback={''}>
                    <Switch>
                        {/*<Route exact path="/store/7" component={FavoriteGoodsList} />*/}
                        {/*<Route exact path="/store/8" component={ZzimGoodsList} />*/}
                        <Route exact path="/my/favoriteGoodsList" component={FavoriteGoodsList} />
                        <Route exact path="/my/zzimGoodsList" component={ZzimGoodsList} />
                        <Route component={Error}/>
                    </Switch>
                </Suspense>
            </div>

            {/*<Footer/>*/}

            {/*{*/}
            {/*    false && !localStorage.getItem('eventNewPopup') && (  //이벤트팝업 오픈하고 싶으면 false -> true로*/}
            {/*        <ModalPopup*/}
            {/*            title={*/}
            {/*                <Fragment>*/}
            {/*                    <div style={{display:'flex', alignItems:'center'}}>*/}
            {/*                        <MdNotificationsActive/>{' '}*/}
            {/*                        <div>Blocery 이벤트 종료 알림</div>*/}
            {/*                    </div>*/}
            {/*                </Fragment>*/}
            {/*            }*/}
            {/*            content={*/}
            {/*                <EventPopup/>*/}
            {/*            }*/}
            {/*        >*/}
            {/*        </ModalPopup>*/}
            {/*    )*/}
            {/*}*/}
        </div>
    )
}
export default Store
