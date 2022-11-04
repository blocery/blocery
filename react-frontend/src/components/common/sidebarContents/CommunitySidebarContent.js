import React, {useEffect, useState} from "react";
import {useRecoilState} from "recoil";
import {communitySidebarState} from "~/recoilState";
import Skeleton from "~/components/common/cards/Skeleton";
import {Div, Fixed, Flex, GridColumns, Hr, Img, Link, Space} from "~/styledComponents/shared";
import {getConsumer, getMyCommunitySummary, getMyProfile, getProfileByConsumerNo} from '~/lib/shopApi'
import {matchPath, withRouter} from 'react-router-dom'
import useLogin from "~/hooks/useLogin";
import Profile from "~/components/common/cards/Profile";
import BOARD_STORE from "~/components/shop/community/BoardStore";
import {GoLightBulb} from 'react-icons/go'
import {IoNewspaperOutline} from 'react-icons/io5'
import {autoLoginCheckAndTryAsync} from "~/lib/loginApi";


const slideWidth = 80 //80%
const titleHeight = 56
const profileHeight = 80
const bottomHeight = 44

const CommunitySidebarContent = ({history}) => {

    const [sidebarOpen, setSidebarOpen] = useRecoilState(communitySidebarState)
    const [profile, setProfile] = useState()
    const [summary, setSummary] = useState()
    const login = useLogin()

    useEffect(() => {
        async function fetch(){
            let loginUser = await autoLoginCheckAndTryAsync(); //push수신시 자동로그인 test : 20200825
            if (loginUser) {
                await login.reFetch();
                search();
            }else{
                setProfile(null)
                setSummary(null)
            }
        }
        if(sidebarOpen) {
            fetch();
        }
    }, [sidebarOpen])


    //최신정보 조회
    const search = async () => {

        const res = await Promise.all([
            getProfileByConsumerNo(login.consumer.consumerNo),
            getMyCommunitySummary()
        ])

        /*
            int boardWritingCount;
            int repliedCount;
            int boardScrapCount;
        */
        setProfile(res[0].data)
        setSummary(res[1].data)
    }


    const onLinkClick = (url) => {

        // //현재 pathname 과 이동하려는 pathname 비교
        const isMatched = matchPath(history.location.pathname, {
            path: url,
            exact: true
        })

        // //현재 pathname과 이동 하려는 pathname이 다를 경우만 history.push 로 이동
        if (isMatched === null) {
            //커뮤니티(토크) 메인일 경우
            // if (history.location.pathname === '/community') {
            //     history.push(url)
            // }else{
            //     history.replace(url)
            // }
        }

        history.replace(url)
        closeSidebar()
    }

    const footerClick = (url, e) => {
        e.stopPropagation()
        console.log({url})
        history.push(url)
        closeSidebar()
    }

    const closeSidebar = () => setSidebarOpen(false)

    const onLoginClick = async () => {
        let loginUser = await login.isServerLoggedIn()
        if (!loginUser ) { //|| !isLoggedIn() ) { //백 || front
            //Webview.openPopup('/login')
        }
    }

    const onProfileClick = () => {
        history.push(`/consumersDetailActivity?consumerNo=${profile.consumerNo}`)
        closeSidebar()
    }

    // if (!summary) return <Skeleton.ProductList count={1} />

    return (
        <div
            // flexDirection={'column'} alignItems={'flex-start'} justifyContent={'space-between'} height={'100%'}
        >
            {/* 위쪽 컨텐츠 */}
            <Div abaolute width={'100%'}>
                {/* 프로필 */}
                <Div px={20} height={profileHeight}>
                    {
                        (!login.consumer || !profile) ? (
                            <Flex fg={'green'} fontSize={16} lighter height={'100%'} justifyContent={'center'} cursor={1} onClick={onLoginClick}><u>로그인이 필요합니다.</u></Flex>
                        ) : (
                            <>

                                <Profile
                                    {...profile}
                                    size={'lg'}
                                    onClick={onProfileClick}
                                />
                                {/*<Div width={53} height={53} flexShrink={0} mr={20}>*/}
                                {/*    <Img width={'100%'} height={'100%'} rounded={'50%'}*/}
                                {/*         cover*/}
                                {/*         src={Server.getThumbnailURL() + login.consumer.profile} alt={'사용자'} />*/}
                                {/*</Div>*/}

                                {
                                    !summary ?  <Skeleton.ProductList count={1} /> : (
                                        <Flex pl={52 + 12} fg={'dark'} fontSize={12}>
                                            <Div cursor={1} onClick={onLinkClick.bind(this, '/mypage/boardList')}>게시글 {summary.boardWritingCount}</Div>
                                            <Div cursor={1} mx={10} onClick={onLinkClick.bind(this, '/mypage/replyList')}>댓글 {summary.repliedCount}</Div>
                                            <Div cursor={1} onClick={onLinkClick.bind(this, '/mypage/scrapList')}>스크랩 {summary.boardScrapCount}</Div>
                                        </Flex>
                                    )
                                }
                            </>
                        )
                    }

                </Div>
                <Hr bg={'veryLight'}/>

                {/* overflow 의 스크롤이 동작 하려면 명시적인 height 가 지정 되어야 함 */}
                <Div height={`calc(100vh - ${titleHeight + profileHeight + bottomHeight}px)`} overflow={'auto'}>
                    <GridColumns repeat={1} colGap={0} rowGap={20} px={16} py={20}>
                        {
                            Object.values(BOARD_STORE).map(board => {
                                const url = `/community/boardMain/${board.boardType}`
                                const isMatched = matchPath(history.location.pathname, {
                                    path: url,
                                    exact: true
                                })
                                // const isMatched = history.location.pathname === url
                                return(
                                    <Div key={board.boardType} cursor={1} bold={isMatched} fg={isMatched ? 'green' : 'darkBlack'} textAlign={'left'} onClick={onLinkClick.bind(this, url)}>
                                        {board.name}
                                    </Div>
                                )
                            })
                        }
                    </GridColumns>
                </Div>


                {/* 아래쪽 컨텐츠 */}
                <GridColumns repeat={2} colGap={0} rowGap={0}
                             height={bottomHeight}
                             fontSize={12}
                             bg={'light'}
                >
                    <Space spaceGap={4} justifyContent={'center'} cursor={1} onClick={footerClick.bind(this, '/pointInfo')}>
                        <Div><GoLightBulb /></Div>
                        <Div>포인트 제도 안내</Div>
                    </Space>
                    <Space spaceGap={4} justifyContent={'center'} cursor={1} onClick={footerClick.bind(this, '/community/termsOfPrivacy')}>
                        <Div><IoNewspaperOutline /></Div>
                        <Div>커뮤니티 이용약관</Div>
                    </Space>
                </GridColumns>



            </Div>

        </div>
    )

    return(
        <Div relative>
            <Div>
                <Flex px={20} height={80}>
                    <Div width={53} height={53} flexShrink={0} mr={20}>
                        <Img width={'100%'} height={'100%'} rounded={'50%'}
                             cover
                             src={'https://2.gall-img.com/hygall/files/attach/images/82/163/326/253/9155740d3c5d22097b451b1f5985d97e.jpg'} alt={'사용자'} />
                    </Div>
                    <Div>
                        <Flex>
                            <Div fontSize={16.5} lineClamp={1}><strong>별블리</strong></Div>
                            {/*<Div px={8} rounded={15} bg={'green'} fg={'white'} lineHeight={13} py={3} ml={10}>Bronze</Div>*/}
                        </Flex>
                        <Flex fg={'dark'} fontSize={12}>
                            <Div cursor={1} onClick={onLinkClick.bind(this, '/community/myBoard')}>게시글 {summary.boardWritingCount}</Div>
                            <Div cursor={1} mx={10} onClick={onLinkClick.bind(this, '/community/myReply')}>댓글 {summary.repliedCount}</Div>
                            <Div cursor={1} onClick={onLinkClick.bind(this, '/community/myScrap')}>스크랩 {summary.boardScrapCount}</Div>
                        </Flex>
                    </Div>
                </Flex>
                <Hr bg={'veryLight'}/>

                <Div>
                    <GridColumns repeat={4} colGap={0} height={80}>
                        <Flex flexDirection={'column'} justifyContent={'center'} bg={'light'}>
                            <Div>img</Div>
                            <Div fontSize={12} cursor={1}>내 게시글</Div>
                        </Flex>
                        <Flex flexDirection={'column'} justifyContent={'center'} bg={'light'}>
                            <Div>img</Div>
                            <Div fontSize={12} cursor={1}>내 게시글</Div>
                        </Flex>
                        <Flex flexDirection={'column'} justifyContent={'center'} bg={'light'}>
                            <Div>img</Div>
                            <Div fontSize={12}>내 게시글</Div>
                        </Flex>
                        <Flex flexDirection={'column'} justifyContent={'center'} bg={'light'}>
                            <Div>img</Div>
                            <Div fontSize={12}>내 게시글</Div>
                        </Flex>
                    </GridColumns>
                </Div>
                <Hr bg={'veryLight'}/>

                {/* 세로전체 - title - 프로필(border 포함) - footer */}
                <Div overflow={'auto'} height={'calc(100vmax - 56px - 162px - 135px)'}>
                    <Div p={20}>
                        <Link to={'/community'} >커뮤니티 홈</Link>
                    </Div>
                    <Div p={20} cursor={1}>
                        <Link to={'/community/boardVoteMain'} >당신의 선택은?</Link>
                    </Div>
                    <Div p={20} cursor={1}>
                        <Flex>
                            <Link to={'/community/boardMain/free'} >자유게시판</Link>
                            {/*<Div notiNew></Div>*/}
                        </Flex>
                    </Div>
                    <Div p={20} cursor={1}>
                        실시간 리뷰
                    </Div>
                </Div>

            </Div>


            {/* fixed 이기 때문에 부모 사이즈를 무시하기 때문에 slide 와 같은 width 를 적용해야 함 */}
            <Fixed bottom={0}
                   width={`${slideWidth}%`}
                   height={35+100}>
                <Flex height={35} bg={'light'}>
                    <Flex mx={20}>
                        /pointInfo
                        <Div>icon</Div>
                        <Div>포인트 제도 안내</Div>
                    </Flex>
                    <Flex>
                        <Div>icon</Div>
                        <Div>커뮤니티 이용약관</Div>
                    </Flex>
                </Flex>
                <Div
                    height={100}
                    py={15}
                >
                    <Flex
                        overflow={'auto'}
                        custom={`
                                    & > div {                                        
                                        padding-right: 5px;
                                    }
                                    & > div:first-child {
                                        margin-left: 20px;
                                    }
                                    & > div:last-child {
                                        padding-right: 20px;
                                    }
                                `}
                    >
                        {
                            [0,1,2].map((image, index) =>
                                <Div key={`sideBanner${index}`} flexShrink={0} width={184} height={70}>
                                    <Img width={'100%'} height={'100%'}
                                         src={'https://2.gall-img.com/hygall/files/attach/images/82/163/326/253/9155740d3c5d22097b451b1f5985d97e.jpg'} alt={'사용자'} />
                                </Div>
                            )
                        }
                    </Flex>
                </Div>
            </Fixed>
        </Div>
    )
}

export default withRouter(CommunitySidebarContent)