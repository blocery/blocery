import React, {useEffect} from 'react';
import useLogin from "~/hooks/useLogin";
import {isDealGoodsBadge, isNewNotifiation, isSuperRewardBadge, isTimeSaleBadge} from "~/lib/shopApi";
import {getCart, getCartCount} from "~/lib/cartApi";
import {useRecoilState} from "recoil";
import {noticeState} from "~/recoilState";

const useNotice = (props) => {

    const [noticeInfo, setNoticeInfo] = useRecoilState(noticeState)

    // const {consumer} = useLogin()

    // useEffect(() => {
    //
    //     if (consumer) {
    //         setPublicNotices()
    //         setPrivateNotices()
    //     }else{
    //         setPublicNotices()
    //     }
    //
    // }, [consumer])


    //로그인 하지 않은 사용자도 볼 수 있는 알림
    const setPublicNotices = async () => {

        try {
            let potenTime = false
            let superReward = false
            let dealGoods = false

            const a = isTimeSaleBadge()//.then(({data}) => potenTimeNew = data)
            const b = isSuperRewardBadge()//.then(({data}) => superRewardNew = data)
            const c = isDealGoodsBadge()

            const res = await Promise.all([a, b, c])

            console.log({res})

            if (res[0].status === 200) {
                potenTime = res[0].data
            }
            if (res[1].status === 200) {
                superReward = res[1].data
            }
            if (res[2].status === 200) {
                dealGoods = res[2].data
            }

            setNoticeInfo(prev => ({...prev, loading: false, potenTime, superReward, dealGoods}))

        }catch (err) {
            console.error(err.message)
        }
    }

    //로그인 한 사용자가 볼 수 있는 알림
    const setPrivateCartCount = async () => {
        try {
            //getCart 에서 getCartCount 로 변경함
            // const {status, data} = await getCart()
            const {status, data} = await getCartCount()

            if (status === 200) {
                console.log("setPrivateCartCount:",data)
                setNoticeInfo(prev => ({...prev, loading: false, cartCount: data}))
            }
        }catch (err) {
            console.error(err.message)
        }
    }

    //로그인 한 사용자가 볼 수 있는 알림
    const setPrivateNotificationNew = async () => {
        try {
            const {status, data} = await isNewNotifiation();
            if (status === 200) {
                console.log("setPrivateNotificationNew is"+ data)
                setNoticeInfo(prev => ({...prev, loading: false, notification: data}))
            }
        }catch (err) {
            console.error(err.message)
        }
    }

    return {
        noticeInfo, setPublicNotices, setPrivateNotificationNew, setPrivateCartCount
    };
};

export default useNotice;
