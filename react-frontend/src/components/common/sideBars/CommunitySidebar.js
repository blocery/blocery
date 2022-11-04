import {useRecoilState} from "recoil";
import {communitySidebarState} from "~/recoilState";
import React, {useState, useEffect} from "react";
import {Div, Hr, Flex, Img, GridColumns, Fixed} from "~/styledComponents/shared";
import Sidebar from "./Sidebar";
import BasicSwiper from "~/components/common/swipers/BasicSwiper";
import Skeleton from "~/components/common/cards/Skeleton";

import loadable from "@loadable/component";
import ComUtil from "~/util/ComUtil";
import {Offcanvas, OffcanvasHeader, OffcanvasBody} from 'reactstrap'

const CommunitySidebarContent = loadable(() => import("~/components/common/sidebarContents/CommunitySidebarContent"))

const slideWidth = 80 //80%

const CommunitySidebar = () => {
    const [sidebarOpen, setSidebarOpen] = useRecoilState(communitySidebarState)

    // useEffect(() => {
    //     if (sidebarOpen) {
    //         ComUtil.noScrollBody()
    //     }else{
    //         ComUtil.scrollBody()
    //     }
    // }, [sidebarOpen])

    const sidebarToggle = e => {
        e.stopPropagation()
        setSidebarOpen(!sidebarOpen)
    }

    return(
        <>
            <Sidebar
                title={'토크'}
                width={slideWidth}
                menuOpen={sidebarOpen}
                onClose={sidebarToggle}
            >


                <CommunitySidebarContent />

                {/*<Div relative>*/}
                {/*    <Div>*/}


                {/*        <Flex px={20} height={80}>*/}
                {/*            <Div width={53} height={53} flexShrink={0} mr={20}>*/}
                {/*                <Img width={'100%'} height={'100%'} rounded={'50%'}*/}
                {/*                     cover*/}
                {/*                     src={'https://2.gall-img.com/hygall/files/attach/images/82/163/326/253/9155740d3c5d22097b451b1f5985d97e.jpg'} alt={'사용자'} />*/}
                {/*            </Div>*/}
                {/*            <Div>*/}
                {/*                <Flex>*/}
                {/*                    <Div fontSize={16.5} lineClamp={1}><strong>별블리</strong></Div>*/}
                {/*                    /!*<Div px={8} rounded={15} bg={'green'} fg={'white'} lineHeight={13} py={3} ml={10}>Bronze</Div>*!/*/}
                {/*                </Flex>*/}
                {/*                <Flex fg={'dark'} fontSize={12}>*/}
                {/*                    <Div>게시글 2</Div>*/}
                {/*                    <Div mx={10}>댓글 343</Div>*/}
                {/*                    <Div>스크랩 4</Div>*/}
                {/*                </Flex>*/}
                {/*            </Div>*/}
                {/*        </Flex>*/}
                {/*        <Hr bg={'veryLight'}/>*/}

                {/*        <Div>*/}
                {/*            <GridColumns repeat={4} colGap={0} height={80}>*/}
                {/*                <Flex flexDirection={'column'} justifyContent={'center'} bg={'light'}>*/}
                {/*                    <Div>img</Div>*/}
                {/*                    <Div fontSize={12}>내 게시글</Div>*/}
                {/*                </Flex>*/}
                {/*                <Flex flexDirection={'column'} justifyContent={'center'} bg={'light'}>*/}
                {/*                    <Div>img</Div>*/}
                {/*                    <Div fontSize={12}>내 게시글</Div>*/}
                {/*                </Flex>*/}
                {/*                <Flex flexDirection={'column'} justifyContent={'center'} bg={'light'}>*/}
                {/*                    <Div>img</Div>*/}
                {/*                    <Div fontSize={12}>내 게시글</Div>*/}
                {/*                </Flex>*/}
                {/*                <Flex flexDirection={'column'} justifyContent={'center'} bg={'light'}>*/}
                {/*                    <Div>img</Div>*/}
                {/*                    <Div fontSize={12}>내 게시글</Div>*/}
                {/*                </Flex>*/}
                {/*            </GridColumns>*/}
                {/*        </Div>*/}
                {/*        <Hr bg={'veryLight'}/>*/}

                {/*        /!* 세로전체 - title - 프로필(border 포함) - footer *!/*/}
                {/*        <Div overflow={'auto'} height={'calc(100vmax - 56px - 162px - 135px)'}>*/}
                {/*            <Div p={20}>*/}
                {/*                커뮤니티 홈*/}
                {/*            </Div>*/}
                {/*            <Div p={20}>*/}
                {/*                당신의 선택은?*/}
                {/*            </Div>*/}
                {/*            <Div p={20}>*/}
                {/*                실시간 리뷰*/}
                {/*            </Div>*/}
                {/*            <Div p={20}>*/}
                {/*                <Flex>*/}
                {/*                    <Div>이 상품 어때요?</Div>*/}
                {/*                    <Div notiNew></Div>*/}
                {/*                </Flex>*/}
                {/*            </Div>*/}
                {/*            <Div p={20}>*/}
                {/*                레시티*/}
                {/*            </Div>*/}
                {/*        </Div>*/}

                {/*    </Div>*/}


                {/*    /!* fixed 이기 때문에 부모 사이즈를 무시하기 때문에 slide 와 같은 width 를 적용해야 함 *!/*/}
                {/*    <Fixed bottom={0}*/}
                {/*           width={`${slideWidth}%`}*/}
                {/*           height={35+100}>*/}
                {/*        <Flex height={35} bg={'light'}>*/}
                {/*            <Flex mx={20}>*/}
                {/*                <Div>icon</Div>*/}
                {/*                <Div>포인트 제도 안내</Div>*/}
                {/*            </Flex>*/}
                {/*            <Flex>*/}
                {/*                <Div>icon</Div>*/}
                {/*                <Div>커뮤니티 이용약관</Div>*/}
                {/*            </Flex>*/}
                {/*        </Flex>*/}
                {/*        <Div*/}
                {/*            height={100}*/}
                {/*            py={15}*/}
                {/*        >*/}
                {/*            <Flex*/}
                {/*                overflow={'auto'}*/}
                {/*                custom={`*/}
                {/*                    & > div {                                        */}
                {/*                        padding-right: 5px;*/}
                {/*                    }*/}
                {/*                    & > div:first-child {*/}
                {/*                        margin-left: 20px;*/}
                {/*                    }*/}
                {/*                    & > div:last-child {*/}
                {/*                        padding-right: 20px;*/}
                {/*                    }*/}
                {/*                `}*/}
                {/*            >*/}
                {/*                {*/}
                {/*                    [0,1,2].map((image, index) =>*/}
                {/*                        <Div key={`sideBanner${index}`} flexShrink={0} width={184} height={70}>*/}
                {/*                            <Img width={'100%'} height={'100%'}*/}
                {/*                                 src={'https://2.gall-img.com/hygall/files/attach/images/82/163/326/253/9155740d3c5d22097b451b1f5985d97e.jpg'} alt={'사용자'} />*/}
                {/*                        </Div>*/}
                {/*                    )*/}
                {/*                }*/}
                {/*            </Flex>*/}
                {/*        </Div>*/}
                {/*    </Fixed>*/}
                {/*</Div>*/}

            </Sidebar>
        </>
    )
}
export default CommunitySidebar

