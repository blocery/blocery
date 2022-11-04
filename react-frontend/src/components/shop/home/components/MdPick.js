import React, {useState, useEffect, useRef} from 'react'
import Css from './MdPick.module.scss'
import classNames from 'classnames'
import { SlideItemHeaderImage, SlideItemContent } from '~/components/common/slides'
import { IconNext } from '~/components/common/icons'
import { Server } from '~/components/Properties'
import { getMdPickListFront } from '~/lib/shopApi'         //기획전
import {Link} from 'react-router-dom'


import {getGoodsByGoodsNo} from '~/lib/goodsApi'
import {Div, Flex, Right, Space} from "~/styledComponents/shared";
import {Title20, VerticalGoodsGridList} from "~/styledComponents/ShopBlyLayouts";
import {IoIosArrowRoundForward} from "react-icons/io";
import {color} from "~/styledComponents/Properties";
import VerticalGoodsCard from "~/components/common/cards/VerticalGoodsCard";
import GoodsCard from "~/components/common/cards/GoodsCard";
import {withRouter} from "react-router-dom"
import {isForceUpdate} from "~/lib/axiosCache";
const MdPick = (props) => {

    const abortControllerRef = useRef(new AbortController());
    const { limitCount = 3, ...rest} = props
    const [data, setData] = useState()

    useEffect(() => {
        search()
        return(() => {
            abortControllerRef.current.abort()
        })
    }, [])

    async function search() {
        try{
            const { data } = await getMdPickListFront(isForceUpdate(props.history), abortControllerRef.current.signal);

            //1건만 보이도록
            // if(data.length > limitCount){
            //     data.splice(limitCount, data.length);
            // }

            const len = data.length ; //-1

            let index = 0;
            let mdPick = null;
            let tryCount = 0; //혹시나 홈에 출력용이 없을경우 무한루프 방지

            do {
                index = Math.floor(Math.random() * len)
                //console.log('homeMdPick:' + index + '/' + len + ',' + tryCount);
                mdPick = data[index]
                tryCount++;

                if(mdPick) {
                    if (mdPick.hideFromHome === false) //출력가능한 mdPick
                        break; //당첨.
                }

            } while (tryCount <= 10)


            //상품조회
            if(mdPick) {
                const pr = mdPick.mdPickGoodsList.map(goodsNo => getGoodsByGoodsNo(goodsNo).then(res => res.data))
                const goodsList = await Promise.all(pr)
                mdPick.goodsList = goodsList
            }
            setData(mdPick)
        }catch (error) {
            if (error.message === 'canceled') {
                console.log("Request cancelled : MdPick")
            }else{
                console.log("Request error : MdPick")
            }
        }
    }

    function onClick(item){
        props.history.push(`/goods?goodsNo=${item.goodsNo}`)
    }

    if(!data) return null
    
    return(
        <div {...rest}>
            {/*<div className={Css.grandTitleBox}>*/}
            {/*    <div>기획전</div>*/}
            {/*    <Link to={'/store/mdPick'}><IconNext/></Link>*/}
            {/*</div>*/}
            <Flex px={16}>
                <Space  >
                    <Title20>기획전</Title20>
                </Space>
                <Right><Link to={'/store/mdPick'}><IoIosArrowRoundForward color={color.green} style={{lineHeight: 1}} size={24}/></Link></Right>
            </Flex>

            <div style={{background: `url('${Server.getImageURL() + data.mdPickMainImages[0].imageUrl}') no-repeat`}}
                 className={classNames(Css.backgroundBox, Css.leftRound)}></div>
            <div className={classNames(Css.cornerRoundedBox, Css.leftRound)}>
                <div className={Css.greenTitleLayer}>{data.mdPickTitle}</div>
                <div className={Css.contentBox}>
                    <Div fontSize={17} bold mb={16}>
                        {data.mdPickTitle1}
                    </Div>

                    <VerticalGoodsGridList pt={0} px={0} pb={54}>
                        {
                            data.goodsList.map((item, index) => {
                                if(index >= limitCount)
                                    return null
                                return (
                                    <VerticalGoodsCard.Medium key={item.goodsNo} goods={item}/>
                                )
                            })
                        }
                    </VerticalGoodsGridList>
                    {/*{*/}
                    {/*    data.goodsList.map((item, index) => {*/}
                    {/*        if(index >= limitCount)*/}
                    {/*            return null*/}
                    {/*        return (*/}
                    {/*            <GoodsCard key={item.goodsNo} goods={item} pt={0} px={0} />*/}
                    {/*        )*/}
                    {/*    })*/}
                    {/*}*/}
                </div>
            </div>
        </div>
    )

}
export default withRouter(MdPick)