import React, {useEffect} from 'react';
import {Redirect, Route, Switch} from "react-router-dom";
import HomeNavigation from "~/components/common/navs/HomeNavigation";
import loadable from "@loadable/component";
import Sticky from "~/components/common/layouts/Sticky";
import ScrollMenu from "~/components/common/navs/shopScrolledNav/ScrollMenu";
import DealProgress from "~/components/common/progresses/DealProgress";
import {Div} from "~/styledComponents/shared";
import MenuBox from "~/components/common/navs/shopScrolledNav/ExpandMenu";
import ShopScrolledNav from "~/components/common/navs/shopScrolledNav";
import {useRecoilState} from "recoil";
import {shopNavMenuState} from "~/recoilState";

const Now = loadable(() => import('./lounge'))
// const People = loadable(() => import('./people'))
const Community = loadable(() => import('~/components/shop/community'))

const menuGroupList = [
    {parentKey: 'lounge', label: '라운지', fg: 'black'},
    {parentKey: 'talk', label: '토크', fg: 'black'},
    {parentKey: 'event', label: '이벤트', fg: 'black'},
]

const menuList = [
    {parentKey: 'lounge', values: ['/', '/home', '/home/1'], label: '라운지'},
    {parentKey: 'lounge', values: ['/home/people'], label: '피플'},
    {parentKey: 'lounge', values: ['/community/goodsReviewMain'], label: '실시간 리뷰'},

    {parentKey: 'talk', values: ['/home/community'], label: '토크홈'},
    {parentKey: 'talk', values: ['/community/boardMain/free'], label: '자유게시판'},
    {parentKey: 'talk', values: ['/community/boardMain/recipe'], label: '레시피'},
    {parentKey: 'talk', values: ['/community/boardMain/land'], label: '내텃밭'},
    {parentKey: 'talk', values: ['/community/boardMain/blocery'], label: '블로서리'},

    {parentKey: 'event', values: ['/roulette'], label: '매일매일 룰렛'},
    {parentKey: 'event', values: ['/community/boardVoteMain'], label: '당신의 선택'},
]

const Home = (props) => {

    const [menuState] = useRecoilState(shopNavMenuState)

    useEffect(() => {

        // const {data: isPotenNew} = await isNewTimeSame();
        // const {data: isSuperRewardNew} = await isSuperReward();
        //
        // const newShopNavMenuState = {...shopNavMenuState}
        //
        // newShopNavMenuState.home.menuList[1].isNew = isPotenNew;
        // newShopNavMenuState.home.menuList[2].isNew = isSuperRewardNew;
        //
        // setShopNavMenuState(newShopNavMenuState)

        // console.log(props)

        //TODO RENEW store.jsa 로 이동 됨 (home url 이 바뀌기 때문)
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

    }, [])

    return (
        <div>
            <HomeNavigation homeUrl={'/'}></HomeNavigation>
            <Sticky top={56} zIndex={3}>
                <ShopScrolledNav top={56} menuGroupList={menuState.home.menuGroupList} menuList={menuState.home.menuList} />
            </Sticky>
            {/* 탭 밑에 들어올 서브 메뉴 */}
            <Switch>
                <Route exact path={'/'} component={Now}/>

                <Route exact path={'/home/1'} component={Now}/>
                {/*<Route exact path={'/home/people'} render={()=><Redirect to={'/home/people/1'}/>} />*/}
                {/*<Route exact path={'/home/people/:tabId'} component={People}/>*/}
                {/* 토크홈 */}
                <Route exact path={'/home/community'} component={Community}/>
                <Route path={'/home'} component={Now}/>
            </Switch>
        </div>

    );
};

export default Home;

