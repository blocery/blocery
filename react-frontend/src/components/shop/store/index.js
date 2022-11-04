//Home.js 원본
import React, { Fragment, useEffect, lazy, Suspense } from 'react'
import { Route, Switch } from 'react-router-dom'
import {ModalPopup, SpinnerBox, Sticky} from '~/components/common'
// import { ZzimList } from '~/components/shop'
import {MdNotificationsActive} from "react-icons/md";
import loadable from "@loadable/component";
import { BLCT_TO_WON } from "~/lib/exchangeApi"
import HomeNavigation from "~/components/common/navs/HomeNavigation";
import ShopScrolledNav from "~/components/common/navs/shopScrolledNav";
import {useRecoilState} from "recoil";
import {shopNavMenuState} from "~/recoilState";
import {isTimeSaleBadge, isBlyTimeBadge, isSuperRewardBadge, isDealGoodsBadge} from '~/lib/shopApi'
import useInterval from "~/hooks/useInterval";
// import MdPick from "~/components/shop/mdPick";
import MdPick from "./mdPick";
import MdPickSub from "./mdPickSub";
import BackNavigation from "~/components/common/navs/BackNavigation";
import Footer from "~/components/common/footer";
import useNotice from "~/hooks/useNotice";

//TODO full dynamic import 로 교체 예정
// const TodaysDeal = loadable(() => import('./todaysDeal'), {
//     fallback: <SpinnerBox minHeight={160} />
// })
const TimeSale  = loadable(() => import('./timeSale'), {
    fallback: <SpinnerBox minHeight={160} />
})
const NewestGoods  = loadable(() => import('./newestGoods'), {
    fallback: <SpinnerBox minHeight={160} />
})
const DeadlineGoods  = loadable(() => import('./deadlineGoods'), {
    fallback: <SpinnerBox minHeight={160} />
})
const SuperReward  = loadable(() => import('./superReward'), {
    fallback: <SpinnerBox minHeight={160} />
})
const SpecialPriceDeal  = loadable(() => import('./specialPriceDeal'), {
    fallback: <SpinnerBox minHeight={160} />
})
const BestDeal  = loadable(() => import('./bestDeal'), {
    fallback: <SpinnerBox minHeight={160} />
})

const DealGoods = loadable(() => import('./dealGoods'), {
    fallback: <SpinnerBox minHeight={160} />
})

// const FavoriteGoods  = lazy(() => import('../../favoriteGoodsList'), {
//     fallback: <SpinnerBox minHeight={160} />
// })

const Store = (props) => {

    const [menuState, ] = useRecoilState(shopNavMenuState)
    const {menuGroupList, menuList} = menuState.store

    const {setPublicNotices} = useNotice()


    useEffect(() => {

        //모든 사용자가 볼 수 있는 noti(페이지 didMount 시 한번 조회)
        setPublicNotices()

        //TODO root 인 main.js 로 이동
        // const params = new URLSearchParams(props.location.search)
        // let moveTo = params.get('moveTo');
        // if (moveTo)  {
        //     props.history.push('/home'); //back을 대비해서 mypage로 돌아오도록 넣어놔야 함...
        //     props.history.push('/' + moveTo);
        // }
        //TODO root 인 main.js 로 이동
        // //추천인코드 localStorage에 임시저장
        // let inviteCode = params.get('inviteCode');
        // if (inviteCode) {
        //     console.log('inviteCode:'+ inviteCode);
        //     localStorage.setItem('inviteCode', inviteCode);
        // }

    }, [])

    //TODO 인터벌 더이상 사용 하지 않도록(내부적인 새로고침은 불필요하다고 보여짐)
    // useInterval(() => {
    //     searchNewFlags()
    // }, 60 * 1000) //1분

    // const searchNewFlags = async () => {
    //     try {
    //         let potenTimeNew = false
    //         let superRewardNew = false
    //         let dealGoodsNew = false
    //
    //         const a = isTimeSaleBadge()//.then(({data}) => potenTimeNew = data)
    //         const b = isSuperRewardBadge()//.then(({data}) => superRewardNew = data)
    //         const c = isDealGoodsBadge()
    //
    //         const res = await Promise.all([a, b, c])
    //
    //         potenTimeNew = res[0].data
    //         superRewardNew = res[1].data
    //         dealGoodsNew = res[2].data
    //
    //         const newMenuList = menuList.map(menu => {
    //             let isNew = false//menu.isNew || false
    //
    //             if (menu.id === 'potenTime') {
    //                 isNew = potenTimeNew
    //             }else if (menu.id === 'superReward'){
    //                 isNew = superRewardNew
    //             }else if(menu.id === 'dealGoods') {
    //                 isNew = dealGoodsNew
    //             }
    //
    //             return {
    //                 ...menu,
    //                 isNew: isNew
    //             }
    //         })
    //
    //         const newMenuState = Object.assign({}, menuState)
    //         newMenuState.store.menuList = newMenuList
    //         setMenuState(newMenuState)
    //     }catch (error) {
    //
    //     }
    // }


    // 자동로그인 기능
    //App.js으로 옮겨서 시도 중:20200410 autoLoginCheckAndTry();

    setBlct();
    //BLCT 40.00원 쿠키에 저장.
    async function setBlct() {
        let {data: blctToWon} = await BLCT_TO_WON();
        sessionStorage.setItem('blctToWon', blctToWon);
    }

    return (

        <div>
            <Sticky>
                {/*<B2cHeader />*/}
                <BackNavigation showShopRightIcons>일반 스토어</BackNavigation>
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
                        {/*<Route exact path="/" component={TodaysDeal} />*/}

                        <Route exact path="/store/best" component={BestDeal} />
                        <Route exact path="/store/new" component={NewestGoods} />
                        <Route exact path="/store/specialPriceDeal" component={SpecialPriceDeal} />
                        <Route exact path="/store/mdPick" component={MdPick} />
                        <Route exact path="/store/mdPickSub" component={MdPickSub} />
                        <Route exact path="/store/deal" component={DealGoods} />
                        <Route exact path="/store/potenTime" component={TimeSale} />
                        <Route exact path="/store/superReward" component={SuperReward} />
                        {/*<Route exact path="/store/4" component={DeadlineGoods} />*/}


                        {/*<Route exact path="/store/7" component={FavoriteGoods} />*/}
                        {/*<Route exact path="/store/8" component={ZzimList} />*/}
                        <Route component={Error}/>
                    </Switch>
                </Suspense>
            </div>

            <Footer />
        </div>
    )
}
export default Store
