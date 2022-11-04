import React, { Component, Fragment, useEffect, useState} from 'react'
import {LoginLinkCard, ShopXButtonNav} from '~/components/common'
import { SlideItemHeaderImage, SlideItemContent } from '~/components/common/slides'
import { getZzimList } from '~/lib/shopApi'
import { getLoginUser } from '~/lib/loginApi'
import { getGoodsByGoodsNo } from '~/lib/goodsApi'
import { Server } from '~/components/Properties'
import {Div, Flex, GridColumns, Span} from '~/styledComponents/shared/Layouts'
import useZzim from "~/hooks/useZzim";
import useLogin from "~/hooks/useLogin";
import Skeleton from "~/components/common/cards/Skeleton";
import VerticalGoodsCard from "~/components/common/cards/VerticalGoodsCard";
import {EmptyBox, GrandTitle, GridList, VerticalGoodsGridList} from "~/styledComponents/ShopBlyLayouts";
import BackNavigation from "~/components/common/navs/BackNavigation";
import {BodyFullHeight} from "~/components/common/layouts";
import {Webview} from "~/lib/webviewApi";
import {TYPE_OF_IMAGE} from "~/lib/bloceryConst";
import TG from '~/components/common/tg/TG'

const ZzimList = () => {

    const {consumer, isLoggedIn, isServerLoggedIn} = useLogin()
    //shop/8-> 로그인 직후 refresh가 잘안됨. const {zzimList} = useZzim()

    const [list, setList] = useState()

    useEffect(() => {
        if (consumer) {
            search()
        }
    }, [consumer])

    // 찜한 상품번호 조회
    const search = async () => {
        const {data:zzimList} = await getZzimList()

        const pr = zzimList.map(goodsNo => getGoodsByGoodsNo(goodsNo))
        const results = await Promise.all(pr)
        const list = results.map(res => res.data)
        setList(list)
    }

    async function onLoginClick() {

        let loginUser = await isServerLoggedIn()
        if (!loginUser ) { //} || !isLoggedIn()) {
            //Webview.openPopup('/login')
        }

        // Webview.openPopup('/login');
        //isLoggedIn()
    }

    console.log(consumer)

    if(!consumer){
        return(
            <BodyFullHeight nav homeTabbar bottomTabbar>

                <LoginLinkCard regularList icon description={'로그인 하여 내가 찜한상품을 확인하세요!'} onClick={onLoginClick}/>

            </BodyFullHeight>
        )
    }

    return(
        <Fragment>
            {
                (window.location.href.indexOf('myZzimList') > 0)  &&  //myPage에서 왔을 경우만 존재. shop에서 오면 URL이 /store/8 임.
                <BackNavigation>찜한상품</BackNavigation>
            }

            <GrandTitle
                px={16}
                mt={20}
            >
                <div>내가 찜한 상품</div>
            </GrandTitle>

            {
                !list ? (<Skeleton.ProductList count={5} />) :
                    (
                        list.length <= 0 ? (
                            <EmptyBox>찜한 상품이 없습니다.</EmptyBox>
                            // <div className='w-100 h-100 d-flex justify-content-center align-items-center p-5 text-dark'>찜한 상품이 없습니다.</div>
                        ) : (
                            <VerticalGoodsGridList p={16}>
                                {
                                    list.map(goods =>
                                        <VerticalGoodsCard.Medium key={goods.goodsNo} goods={goods} //isThumnail={true}
                                                                  imageType={TYPE_OF_IMAGE.SQUARE}
                                                                  showProducerNm />
                                    )
                                }
                            </VerticalGoodsGridList>
                        )
                    )
            }
            {/*{WIDERPLANET SCRIPT START 2022.06.07}*/}
            {
                (list && list.length > 0) && <TG ty={"Wish"} items={list} />
            }
            {/*{WIDERPLANET SCRIPT END 2022.06.07}*/}
        </Fragment>
    )
}

export default ZzimList