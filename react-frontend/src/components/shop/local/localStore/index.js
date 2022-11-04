import React, {Fragment, Suspense, useEffect, useRef, useState} from 'react';
import {Button, Div, Divider, Fixed, Flex, GridColumns, Hr, Link, Space, Span} from "~/styledComponents/shared";
import {Route, Switch, useHistory, useParams} from 'react-router-dom'
import useLogin from "~/hooks/useLogin";
import BackNavigation from "~/components/common/navs/BackNavigation";
import {getItems} from "~/lib/adminApi";
import {getLocalfoodProducer} from "~/lib/localfoodApi";
import LocalAddressCard from "~/components/shop/local/components/LocalAddressCard";
import loadable from '@loadable/component'
import {color} from "~/styledComponents/Properties";
import {getValue} from "~/styledComponents/Util";
import useScroll from "~/hooks/useScroll";
import Sticky from "~/components/common/layouts/Sticky";
import LocalAddressAlert from "~/components/shop/local/components/LocalAddressAlert";
import ComUtil from "~/util/ComUtil";
import CartLinkButton from "~/components/common/buttons/CartLinkButton";
import {IoMdInformationCircle, MdInfo} from "react-icons/all";

const LocalHome = loadable(() => import('./LocalHome'))
const LocalGoodsList = loadable(() => import('./LocalGoodsList'))
const FarmerList = loadable(() => import('./FarmerList'))



const LocalStore = (props) => {

    //const producerNo = new URLSearchParams(props.location.search).get('producerNo');
    const {producerNo, tabId} = useParams()

    const history = useHistory()
    const {consumer} = useLogin()
    const onLinkClick = (to) => history.replace(to)

    //로컬푸드매장 정보 : Producer정보+알파
    const [localfoodProducer, setLocalfoodProducer] = useState()

    useEffect(()=>{
        async function fetch(){
            let {data} = await getLocalfoodProducer(producerNo);
            setLocalfoodProducer(data)
        }
        fetch()
    }, [])



    const onTabClick = (_tabId) => {
        history.replace(`/localStore/${producerNo}/${_tabId}`)
        // if (tabType !== type) {
        //     setTabType(type)
        // }
    }

    return (
        <div>
            <BackNavigation
                rightContent={
                    <>
                        <Div mr={4}>
                            <LocalAddressAlert producerNo={producerNo} />
                        </Div>
                    </>
                }
            > {localfoodProducer && localfoodProducer.farmName} </BackNavigation>

            {/*<LocalAddressCard producerNo={producerNo}/>*/}

            <Flex fontSize={14} px={16} py={10} fg={'darkBlack'}>
                <IoMdInformationCircle size={22} style={{marginRight:4}}/>
                <div>
                    대전 <b>16시 이전 주문시 새벽배송!</b>(휴일제외 / 옥천 익일오전 배송)
                </div>
            </Flex>
            <Divider />


            {/*<Div>*/}
            {/*    <Span onclick={ () => history.replace('/localStore?producerNo='+producerNo)}>로컬푸드 홈</Span>*/}
            {/*    <Span onclick={ () => history.replace('/LocalGoodsList?producerNo='+producerNo)}>판매상품</Span>*/}
            {/*    <Span>생산자</Span>*/}

            {/*</Div>*/}
            {/*<Sticky top={56} zIndex={2}>*/}
            <Div py={10} cursor>
                <GridColumns repeat={3} fg={'dark'} bg={'light'} colGap={1} bold>
                    <Flex justifyContent={'center'} py={6} bg={'white'} fg={tabId === 'home' && 'black'} onClick={onLinkClick.bind(this, 'home')}>홈</Flex>
                    <Flex justifyContent={'center'} py={6} bg={'white'} fg={tabId === 'goods' && 'black'} onClick={onLinkClick.bind(this, 'goods')}>
                        상품({localfoodProducer && ComUtil.addCommas(localfoodProducer.sellingGoodsCount)})
                    </Flex>
                    <Flex justifyContent={'center'} py={6} bg={'white'} fg={tabId === 'farmer' && 'black'} onClick={onLinkClick.bind(this, 'farmer')}>농가({localfoodProducer && ComUtil.addCommas(localfoodProducer.farmersCount)})</Flex>
                </GridColumns>
            </Div>
            {/*<GridColumns fg={'dark'} lineHeight={'1'} repeat={3} bold>*/}
            {/*    <Flex justifyContent={'center'} py={16} cursor={1} fg={tabId === 'home' && 'black'} onClick={onLinkClick.bind(this, 'home')}>홈</Flex>*/}
            {/*    <Flex justifyContent={'center'} py={16}  cursor={1} fg={tabId === 'goods' && 'black'} onClick={onLinkClick.bind(this, 'goods')}>*/}
            {/*        <div style={{borderLeft: `1px solid ${color.light}`, borderRight: `1px solid ${color.light}`}}>*/}
            {/*            상품({localfoodProducer && ComUtil.addCommas(localfoodProducer.sellingGoodsCount)})*/}
            {/*        </div>*/}
            {/*    </Flex>*/}
            {/*    <Flex justifyContent={'center'} py={16} cursor={1} fg={tabId === 'farmer' && 'black'} onClick={onLinkClick.bind(this, 'farmer')}>농가({localfoodProducer && ComUtil.addCommas(localfoodProducer.farmersCount)})</Flex>*/}
            {/*</GridColumns>*/}
            {/*</Sticky>*/}


            <Suspense fallback={''}>
                <Switch>
                    <Route exact path="/localStore/:producerNo/home" component={LocalHome} />
                    <Route exact path="/localStore/:producerNo/goods" component={LocalGoodsList} />
                    <Route exact path="/localStore/:producerNo/farmer" component={FarmerList} />
                    <Route component={Error}/>
                </Switch>
            </Suspense>

        </div>
    );
};

export default LocalStore;

const VerticalDivide = () => <div style={{width: 1, minHeight: getValue(23), background: color.light}}></div>

// const TabWrapper = styled.div`
//     display: flex;
//     align-items: center;
//     justify-content: space-evenly;
//     color: ${color.secondary};
//     line-height: 1;
//     background: ${color.veryLight};
//     minHeight: ${p => p.minHeight};
// `

// const SM_HEIGHT = getValue(40)
// const LG_HEIGHT = getValue(54)

// function TabMenu({children}) {
//
//     // const {y} = useScroll()
//     // const isSmallScale = y > 100
//
//     return(
//         <div>
//             {/*<Fixed zIndex={4} top={56} width={'100%'}>*/}
//                 <Flex fg={'dark'} lineHeight={'1'} justifyContent={'space-evenly'}
//                       // minHeight={isSmallScale ? SM_HEIGHT : LG_HEIGHT}
//                       // bc={isSmallScale ? 'light' : 'white'}
//                       // bt={0}
//                       // bl={0}
//                       // br={0}
//                       // bb={isSmallScale ? 1 : 0}
//                       // custom={`
//                       //   transition: 0.2s min-height;
//                       // `}
//                 >
//                     {children}
//                 </Flex>
//             {/*</Fixed>*/}
//             {/*<div style={{height: isSmallScale ? SM_HEIGHT : LG_HEIGHT}}></div>*/}
//         </div>
//     )
// }