import React, {useState, useEffect, useRef} from 'react';
import {getSuperRewardList} from "~/lib/shopApi";
import {Div, Flex, Link, Right, Space} from "~/styledComponents/shared";
import PotenTimeList from "~/components/common/lists/PotenTimeList";
import {GrandTitle, Title20} from "~/styledComponents/ShopBlyLayouts";
import {IoIosArrowRoundForward} from 'react-icons/io'
import {color} from "~/styledComponents/Properties";
import {getCurrentReservedDealGoods} from "~/lib/dealApi";
import VerticalGoodsCard from "~/components/common/cards/VerticalGoodsCard";
import {TYPE_OF_IMAGE} from "~/lib/bloceryConst";
import {withRouter} from "react-router-dom"
import {isForceUpdate} from "~/lib/axiosCache";

const DealGoodsTop1 = (props) => {
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
               const {data} = await getCurrentReservedDealGoods(isForceUpdate(props.history), abortControllerRef.current.signal);
               //console.log({potenGoodsList:data})
               setList(data)
           }catch (error) {
               if (error.message === 'canceled') {
                    console.log("Request cancelled : DealGoodsTop1")
                }else {
                    console.log("Request error : DealGoodsTop1")
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
                        <Title20>계약재배로 알뜰하게 구매하세요~</Title20>

                    </Space>
                    <Right><Link to={'/store/deal'}><IoIosArrowRoundForward color={color.green} style={{lineHeight: 1}} size={24}/></Link></Right>
                </Flex>

                <Div px={16}>
                    <VerticalGoodsCard.DealGoods
                        goods={list[0]}
                        isWide={true}
                        // isThumnail={false}
                        imageType={TYPE_OF_IMAGE.THUMB}
                    />
                </Div>
            </Div>
            :
            <Div></Div>
    );
};

export default withRouter(DealGoodsTop1);