import React, { Fragment, useEffect, useState } from 'react'
import loadable from '@loadable/component'
import {Div, Flex, GridColumns, Img, Space, Link, Hr} from "~/styledComponents/shared";

import {IoDiceSharp} from 'react-icons/io5'
import {GiPartyFlags} from 'react-icons/gi'
import {FaMedal} from 'react-icons/fa'
import {withRouter} from 'react-router-dom'
import {color} from "~/styledComponents/Properties";
import IconTalk from '~/images/icons/home/home_talk.svg'
import IconPeople from '~/images/icons/home/home_people.svg'
import IconRoulette from '~/images/icons/home/home_roullette.svg'
import IconEvent from '~/images/icons/home/home_event.svg'
import ImgRealtimeGoodsReview from '~/images/banner/realtimeGoodsReview.jpg'
import {getValue} from "~/styledComponents/Util";
import {useRecoilState} from "recoil";
import {noticeState} from "~/recoilState";
import useNotice from "~/hooks/useNotice";
import BestImage from "~/images/home/best.png";
import SuperImage from '~/images/home/super.png'
import PotenImage from '~/images/home/poten.png'
import OpenImage from '~/images/home/open.svg'
import CloseImage from '~/images/home/close.svg'
import useLogin from "~/hooks/useLogin";


const Banner = loadable(() => import('./components/Banner'))
const SpecialPriceDeal = loadable(() => import('./components/SpecialPriceDeal'))   //특가Deal
const PotenTime = loadable(() => import('./components/PotenTime'))                 //포텐타임
const SuperReward = loadable(() => import('./components/SuperReward'))             //슈퍼리워드
const Best = loadable(() => import('./components/Best'))                           //베스트
const PopularCategories = loadable(() => import('./components/PopularCategories')) //인기카테고리
const MdPick = loadable(() => import('./components/MdPick'))                       //기획전
const DealGoodsTop1 = loadable(() => import('./components/DealGoodsTop1'))             //슈퍼리워드

const HashTagGroupContainer = loadable(() => import('./components/HashTagGroupContainer'))       //해시태그 그룹
const Footer = loadable(() => import('~/components/common/footer'))


const OnOffImage = ({isOpen}) => <img style={{
    position: 'absolute',
    top: 0,
    left: '7%',
    width: '42%',
    transform: 'translateY(-50%)'
}} src={ isOpen ? OpenImage : CloseImage} />

const Home = (props) => {

    // const {consumer} = useLogin()

    // const [isError, setError] = useState(false)
    const {noticeInfo, setPublicNotices, setPrivateNotificationNew} =  useNotice()

    const SubTitle = ({children, onClick = () => null}) =>
        <div className='f4 pl-2 pt-3 pr-2 mb-2 text-dark font-weight-bold' onClick={onClick}>{children}</div>

    useEffect(() => {

        //일반 noti
        setPublicNotices()

        console.log(props)

        //TODO main 으로 이동
        //pivot: home/index.js로 이동.
        // // console.log(props)
        // const params = new URLSearchParams(props.location.search)
        // let moveTo = params.get('moveTo');
        // if (moveTo)  {
        //     props.history.push('/store'); //back을 대비해서 mypage로 돌아오도록 넣어놔야 함...
        //     props.history.push('/' + moveTo);
        // }
        //
        // //추천인코드 localStorage에 임시저장
        // let inviteCode = params.get('inviteCode');
        // if (inviteCode) {
        //     console.log('inviteCode:'+ inviteCode);
        //     localStorage.setItem('inviteCode', inviteCode);
        // }

        //console.log('didMount TodaysDeal')

        //localStorage.setItem('today', ComUtil.utcToString(new Date()));

        //window.scrollTo(0, 0)
        //console.log(localStorage)
    }, [])

    const movePage = to => {
        props.history.push(to)
    }

    return(
        <Fragment>

            {/*<HomeNavigation />*/}
            {/*<StoreSelectionToggle />*/}
            <Banner/>

            {/*<SubNav />*/}

            <Div bg={'white'} pb={60}>
                <Img mt={10} cursor={1} src={ImgRealtimeGoodsReview} style={{width: '100%'}} alt={'실시간 리뷰'} onClick={movePage.bind(this, '/realtimeGoodsReviewList')} />

                <Div py={30} px={16}>
                    <GridColumns repeat={3} colGap={11} custom={`
                        & img {
                          width: 100%;
                        }
                    `}>

                        <img src={BestImage} alt={'베스트'} onClick={movePage.bind(this, '/store/best')}/>
                        <Div relative>
                            <OnOffImage isOpen={noticeInfo.superReward} />
                            <img src={SuperImage} alt={'슈퍼리워드'} onClick={movePage.bind(this, '/store/superReward')}/>
                        </Div>
                        <Div relative>
                            <OnOffImage isOpen={noticeInfo.potenTime} />
                            <img src={PotenImage} alt={'포텐타임'} onClick={movePage.bind(this, '/store/potenTime')}/>
                        </Div>
                    </GridColumns>

                    <GridColumns repeat={4} colGap={0} mt={20} rounded={8} cursor={1} custom={`
                            box-shadow: 0px 2px 15px 0 rgba(0, 0, 0, 0.15);
                        `}>
                        <Flex py={16} justifyContent={'center'} onClick={movePage.bind(this, '/community/boardMain/all')}>
                            <Div flexGrow={1} textAlign={'center'} custom={`border-right: 1px solid ${color.veryLight};`}>
                                <div><img src={IconTalk} style={{height: 40}} /> </div>
                                <Div fontSize={12}>토크</Div>
                            </Div>
                        </Flex>
                        <Flex py={16} justifyContent={'center'} onClick={movePage.bind(this, '/people/1')}>
                            <Div flexGrow={1} textAlign={'center'} custom={`border-right: 1px solid ${color.veryLight};`}>
                                <div><img src={IconPeople} style={{height: 40}} /> </div>
                                <Div fontSize={12}>피플</Div>
                            </Div>
                        </Flex>
                        <Flex py={16} justifyContent={'center'} onClick={movePage.bind(this, '/roulette')}>
                            <Div flexGrow={1} textAlign={'center'} custom={`border-right: 1px solid ${color.veryLight};`}>
                                <div><img src={IconRoulette} style={{height: 40}} /> </div>
                                <Div fontSize={12}>룰렛</Div>
                            </Div>
                        </Flex>
                        <Flex py={16} justifyContent={'center'} onClick={movePage.bind(this, '/eventList')}>
                            <Div flexGrow={1} textAlign={'center'}>
                                <div><img src={IconEvent} style={{height: 40}} /> </div>
                                <Div fontSize={12}>이벤트</Div>
                            </Div>
                        </Flex>
                    </GridColumns>

                </Div>

                <Hr bc={'veryLight'} />


                {/* 인기 카테고리 */}
                <PopularCategories />

                <Div height={10} mb={25} bc={'light'} bg={'veryLight'} bb={0} bl={0} br={0}></Div>

                <HashTagGroupContainer />

                {/* 계약재배 */}
                <DealGoodsTop1 history={props.history} />

                {/* 특가 Deal [연동필요] */}
                <SpecialPriceDeal //style={{marginTop: 29}}
                    history={props.history} />

                {/* 포텐타임 */}
                <PotenTime style={{marginTop: 76}} />

                {/* 슈퍼리워드 */}
                <SuperReward style={{marginTop: 76}} />


                {/* 기획전 [연동필요] */}
                <MdPick style={{marginTop: 54}} history={props.history} />

                {/* 베스트 Best */}
                <Best style={{marginTop: 76}} history={props.history} />

            </Div>

            <Footer/>
        </Fragment>
    )
}
export default withRouter(Home)

function SubNav() {
    return(
        <GridColumns repeat={3} colGap={0} rowGap={0} fontSize={13} bold bc={'veryLight'} cursor={1} custom={`
            & > div:nth-child(2) {
                border-left: 1px solid ${color.veryLight};
                border-right: 1px solid ${color.veryLight};
            }
        `}>
            <Link to={'/roulette'}>
                <Flex flexDirection={'column'} justifyContent={'center'} bc={'light'} minHeight={89}>
                    <Div><IoDiceSharp size={40} color={color.green}/></Div>
                    <Div mt={10}>도전룰렛!</Div>
                </Flex>
            </Link>
            <Link to={''} >
                <Flex flexDirection={'column'} justifyContent={'center'} bc={'light'} minHeight={89}>
                    <Div><GiPartyFlags size={40} color={color.green}/></Div>
                    <Div mt={10}>진행중인 이벤트</Div>
                </Flex>
            </Link>
            <Link to={''} >
                <Flex flexDirection={'column'} justifyContent={'center'} bc={'light'} minHeight={89}>
                    <Div><FaMedal size={40} color={color.green}/></Div>
                    <Div mt={10}>등급 및 혜택안내</Div>
                </Flex>
            </Link>
        </GridColumns>
    )
}
