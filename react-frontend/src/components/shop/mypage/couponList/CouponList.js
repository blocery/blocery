import React, { Fragment, useState, useEffect, lazy, Suspense} from 'react'
import {Div, Flex, Span} from '~/styledComponents/shared'
import { HrHeavyX2 } from '~/styledComponents/mixedIn'
import HeaderBox from '~/components/shop/goodsReviewList/HeaderBox'
import {BLCT_TO_WON} from '~/lib/exchangeApi'

import { ShopXButtonNav, Sticky } from '~/components/common'
import {getUnusedCouponList, getExpriedCouponList, getRewardCoupon} from '~/lib/shopApi'
import loadable from "@loadable/component";
import BackNavigation from "~/components/common/navs/BackNavigation";
import Skeleton from "~/components/common/cards/Skeleton";

const RewardCoupon = loadable(() => import('./RewardCoupon'))
const UnusedCouponList = lazy(() => import('./UnusedCouponList'))
const ExpiredCouponList = lazy(() => import('./ExpiredCouponList'))

const CouponList = (props) => {

    const [ tabId, setTabId ] = useState('1')     // 화면 렌더시 사용가능한쿠폰목록
    const [loading, setLoading] = useState(true)
    const [usableCouponList, setUsableCouponList] = useState()
    const [expiredCouponList, setExpiredCouponList] = useState()
    const [rewardCoupon, setRewardCoupon] = useState()
    const [blctToWon, setBlctToWon] = useState(0)

    // 탭이동
    const onHeaderClick = (selectedTabId) => {
        setTabId(selectedTabId)
    }

    useEffect(() => {
        getBlctToWon();
        searchRewardCoupon();
        if (tabId === '1') {
            searchUnusedCoupon()
        }else{
            searchExpiredCoupon()
        }

    }, [tabId]);

    async function getBlctToWon() {
        const {data} = await BLCT_TO_WON();
        setBlctToWon(data);
    }

    async function searchUnusedCoupon() {
        setLoading(true);
        const {data: usableCoupons} = await getUnusedCouponList();
        setUsableCouponList(usableCoupons)
        console.log({usableCoupons})
        setLoading(false);
    }

    async function searchExpiredCoupon() {
        setLoading(true);
        const {data: expiredCoupons} = await getExpriedCouponList();
        setExpiredCouponList(expiredCoupons)
        setLoading(false);
    }

    async function searchRewardCoupon() {
        const {data: rewardCoupons} = await getRewardCoupon();
        setRewardCoupon(rewardCoupons);
        console.log(rewardCoupons)
    }

    //마일리지 쿠폰 클릭
    const onRewardCouponClick = () => {

    }

    //적립된 쿠폰 마일리지가 없습니다.

    return (
        <Fragment>
            <Sticky>
                {/*<ShopXButtonNav fixed historyBack underline>쿠폰</ShopXButtonNav>*/}
                <BackNavigation>쿠폰</BackNavigation>
            </Sticky>
            <Div p={15} bold fontSize={17}>적립 쿠폰</Div>
            <Div p={15} minHeight={'500px)'}>
                <Suspense fallback={null}>
                    <RewardCoupon data={rewardCoupon} />
                </Suspense>
            </Div>

            <HrHeavyX2 m={0} bc={'background'} />

            <Div p={15} mt={20} bold>일반 쿠폰</Div>
            <Sticky top={56}>
                <div className='d-flex bg-white cursor-pointer' style={{boxShadow: '1px 1px 2px gray'}}>
                    <HeaderBox text={`사용가능${(usableCouponList && usableCouponList.length) > 0 ? '('+usableCouponList.length+'장)' : ''}`} tabId={tabId} active={tabId === '1'} onClick={onHeaderClick.bind(this, '1')}/>
                    <HeaderBox text={`사용불가`} tabId={tabId} active={tabId === '2'} onClick={onHeaderClick.bind(this, '2')}/>
                </div>
            </Sticky>
            <Div bg={'background'} minHeight={'calc(100vmax - 96px - 54px)'}>
                <Suspense fallback={null}>
                    {
                        loading ?
                            <Skeleton count={1} bc={'light'} />
                            :
                            tabId === '1' ?
                                <UnusedCouponList data={usableCouponList} /> :
                                <ExpiredCouponList data={expiredCouponList} />
                    }
                </Suspense>
            </Div>
        </Fragment>

    )
}
export default CouponList