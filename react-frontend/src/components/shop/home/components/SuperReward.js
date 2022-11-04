import React, {useState, useEffect, useRef} from 'react';
import {getSuperRewardList} from "~/lib/shopApi";
import {Div, Flex, GridColumns, Link, Right, Space} from "~/styledComponents/shared";
import {Title20} from "~/styledComponents/ShopBlyLayouts";
import {IoIosArrowRoundForward} from 'react-icons/io'
import {color} from "~/styledComponents/Properties";
import VerticalGoodsCard from "~/components/common/cards/VerticalGoodsCard";
import moment from "moment-timezone";
import {withRouter} from "react-router-dom";
import {isForceUpdate} from "~/lib/axiosCache";

const SuperReward = (props) => {
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
               const {data} = await getSuperRewardList(true, abortControllerRef.current.signal)
               //console.log({potenGoodsList:data})
               setList(data)
           }catch (error) {
               if (error.message === 'canceled') {
                   console.log("Request cancelled : SuperReward")
               }else{
                   console.log("Request error : SuperReward")
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
                        <Title20>슈퍼리워드</Title20>
                        <Div fg={'dark'}>|</Div>
                        <Div fontSize={14} fg={'dark'}>예상을 뛰어 넘는 보상!</Div>
                    </Space>
                    <Right><Link to={'/store/superReward'}><IoIosArrowRoundForward color={color.green} style={{lineHeight: 1}} size={24}/></Link></Right>
                </Flex>

                <GridColumns repeat={1} rowGap={30} px={16}>
                    {
                        list.map(goods => {
                            const startTime = moment(goods.superRewardStart)
                            const isAfter = startTime.isAfter(moment())
                            let maskContent;
                            if (isAfter) {
                                maskContent = MaskContent({
                                    top: startTime.format("MM[월 ]DD[일]"),
                                    center: startTime.format("HH:mm"),
                                    bottom: `${goods.superRewardReward}% 적립`
                                })
                            }
                            return <VerticalGoodsCard.Medium
                                key={goods.goodsNo}
                                isWide={true}
                                goods={goods}
                                maskContent={maskContent}
                                style={{mb: 16}}
                            />
                        })
                    }
                </GridColumns>
            </Div>
            :
            <div></div>
    );
};

export default withRouter(SuperReward);

const MaskContent = ({top, center, bottom}) =>
    <Div textAlign={'center'}>
        <Div fontSize={22}><strong>{top}</strong></Div>
        <Div fontSize={50} lineHeight={'1'} mb={6}><strong>{center}</strong></Div>
        <Div fw={900} fontSize={22}>{bottom}</Div>
    </Div>