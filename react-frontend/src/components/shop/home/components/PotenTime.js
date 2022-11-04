import React, {useState, useEffect, useRef} from 'react';
import {getPotenCouponMaster, getTimeSaleList} from "~/lib/shopApi";
import {Div, Flex, Link, Right, Space} from "~/styledComponents/shared";
import PotenTimeList from "~/components/common/lists/PotenTimeList";
import {GrandTitle, Title20} from "~/styledComponents/ShopBlyLayouts";
import {IoIosArrowRoundForward} from 'react-icons/io'
import {color} from "~/styledComponents/Properties";
import {withRouter} from "react-router-dom";
import {isForceUpdate} from "~/lib/axiosCache";

const getCouponMasterList = async(goodsList) => {
    const promises = goodsList.map(goods => getPotenCouponMaster(goods.goodsNo).then(({data}) => {
            return{
                ...goods,
                couponMaster: data //상품에 쿠폰 마스터 추가해서 리턴
            }
        }
    ))
    return await Promise.all(promises)
}

const PotenTime = (props) => {
    const abortControllerRef = useRef(new AbortController());
    const { ...rest } = props
    const [list, setList] = useState()
    useEffect(() => {
        // async function fetch() {
        //     const {data: goodsList} = await getTimeSaleList()               // 2월 이벤트 종료후 원복
        //     const goodsWithCouponMasterList = await getCouponMasterList(goodsList) //쿠폰마스터 리스트
        //     console.log({goodsWithCouponMasterList})
        //     setList(goodsWithCouponMasterList)
        // }

        async function fetch() {
            try{
                const res = await getTimeSaleList(true, abortControllerRef.current.signal)               // 2월 이벤트 종료후 원복
                if(res) {
                    setList(res.data)
                }
            }catch (error) {
                if (error.message === 'canceled') {
                    console.log("Request cancelled : PotenTime")
                }else{
                    console.log("Request error : PotenTime")
                }
            }
        }
        fetch()

        return(() => {
            abortControllerRef.current.abort()
        })
    }, [])

    if (!list) return null

    return (
        (list && list.length > 0)?
            <Div { ...rest }>
                <Flex mb={16} px={16}>
                    <Space spaceGap={4} >
                        <Title20>포텐타임</Title20>
                        <Div fg={'dark'}>|</Div>
                        <Div fontSize={14} fg={'dark'}>온라인 최저가에 도전!</Div>
                    </Space>
                    <Right><Link to={'/store/potenTime'}><IoIosArrowRoundForward color={color.green} style={{lineHeight: 1}} size={24}/></Link></Right>
                </Flex>

                <Div px={16}>
                    <PotenTimeList data={list} />
                </Div>
            </Div>
            :
            null
    );
};

export default withRouter(PotenTime);