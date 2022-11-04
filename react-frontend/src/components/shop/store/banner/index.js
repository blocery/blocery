import React, {useState, useEffect, useRef} from 'react'
import ComUtil from '~/util/ComUtil'
import { getBannerList } from '~/lib/shopApi'
import {Server} from '~/components/Properties'
import styled from 'styled-components'
import loadable from "@loadable/component";
import {withRouter} from "react-router-dom"
import {isForceUpdate} from "~/lib/axiosCache";

const BannerSwiper = loadable(() => import('~/components/common/swipers/BannerSwiper'))

const EmptyBox = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 71.1638vmin;   //현재 배너의 비율에 딱 맞춤
`

const Banner = (props) => {

    const abortControllerRef = useRef(new AbortController());

    const [data, setData] = useState()

    useEffect(() => {

        getEventData()

        return(() => {
            abortControllerRef.current.abort()
        })

    }, [])

    async function getEventData() {

        try{

            let isLocalfoodBanner = (props.localfoodBanner)?true:false

            const { data } = await getBannerList(isLocalfoodBanner, isForceUpdate(props.history), abortControllerRef.current.signal);

            ComUtil.sortNumber(data, 'imageNo')

            //image, url 있는것만 노출
            const newData = data.filter(item => item.imageUrl && item.url).map(item => ({
                ...item,
                imageUrl: Server.getImageURL() + item.imageUrl
            }))

            setData(newData)
        }
        catch (error) {}
    }

    // async function getEventData(){
    //     const eventData = [
    //         {
    //             imageUrl: 'https://blocery.com/images/R8zbpk72bnlk.jpg',
    //             url: '/mypage/noticeList'
    //         },
    //         {
    //             imageUrl: 'https://blocery.com/images/xHiydxsbQcbD.jpg',
    //             url: '/event'
    //         },
    //         {
    //             imageUrl: 'https://blocery.com/images/NkTDnEnEycts.jpg',
    //             url: (Server._serverMode() === 'production')?'/goods?goodsNo=163':'/goods?goodsNo=265'
    //         },
    //
    //     ]
    //     setData(eventData)
    // }


    if (!data) return <EmptyBox />

    if (data.length <= 0) return null
    return <BannerSwiper data={data}/>

}
export default withRouter(Banner)

