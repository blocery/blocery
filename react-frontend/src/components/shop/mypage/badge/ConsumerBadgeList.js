import React, {Component, useState, useEffect} from 'react'
import {Div, Flex, GridColumns, Img, Right, Span, WhiteSpace} from "~/styledComponents/shared";
import BackNavigation from "~/components/common/navs/BackNavigation";
import ComUtil from "~/util/ComUtil";
import {getConsumerProfile, getBadgeCountStatus} from "~/lib/shopApi";
import BADGE_LIST from "~/components/shop/mypage/badge/BadgeList";
import {ModalPopup} from "~/components/common";
import {BadgeSharp} from "~/styledComponents/ShopBlyLayouts";
import {AdminSubMenuList} from "~/components/Properties";
import useLogin from "~/hooks/useLogin";

const ConsumerBadgeList = (props) => {
    const params = ComUtil.getParams(props)
    const {consumer, isServerLoggedIn} = useLogin()
    const consumerNo = params.consumerNo
    const [badgeList, setBadgeList] = useState(null)
    const [isModal, setIsModal] = useState(false)
    const [selectedBadge, setSelectedBadge] = useState(null)
    const [badgeStatus, setBadgeStatus] = useState(null)
    const [selectedBadgeStatus, setSelectedBadgeStatus] = useState(null)
    const [badge5LikeCount, setBadge5LikeCount] = useState()

    useEffect(() => {
        async function fetch() {
            await search()
            await isServerLoggedIn();
        }
        fetch()
    }, []);

    const search = async () => {
        const {data:profile} = await getConsumerProfile(consumerNo);

        const badge = ComUtil.intToBinaryArray(profile.badgeList);
        badge.unshift(0)    // 0번 뱃지는 default값(하드코딩)
        setBadgeList(badge)

        const {data:badgeCount} = await getBadgeCountStatus();

        let badgeNo;
        const arrayBadge = [];
        for (badgeNo in badgeCount) {
            arrayBadge.push({badgeNo:badgeNo.replace(/badgeCount/,""), value: badgeCount[badgeNo]})
        }

        setBadgeStatus(arrayBadge)
    }

    function onBadgeClick(badgeNo) {
        const badge = BADGE_LIST.find(badge => badge.no === badgeNo)
        setSelectedBadge(badge)

        badgeStatus.map((badge)=> {
            if(badge.badgeNo.startsWith('5')) {
                setSelectedBadgeStatus(badgeStatus.find(badge => badge.badgeNo === '5Reply').value)
                setBadge5LikeCount(badgeStatus.find(badge => badge.badgeNo === '5Like').value)
            }
            return;
        })

        const badgeCountStatus = badgeStatus.find(badge => badge.badgeNo === badgeNo.toString())

        badgeCountStatus &&
        setSelectedBadgeStatus(badgeCountStatus.value)

        setIsModal(true)
    }

    const modalToggle = () => {
        setIsModal(!isModal)
    }

    return (
        <Div>
            <BackNavigation>활동배지</BackNavigation>
            <GridColumns repeat={3} colGap={2} rowGap={2} p={20}>
                {
                    badgeList && BADGE_LIST.map(item => {
                        return (
                            <Div cursor={1} mb={20} p={10} onClick={onBadgeClick.bind(this, item.no)}>
                                <Div mb={10}>
                                    <Img cover alt="" // rounded={'50%'}
                                         src={badgeList.includes(item.no) ? item.activeImage:item.defaultImage} />
                                </Div>
                                <Div textAlign={'center'} fontSize={14}>
                                    {
                                        badgeList.includes(item.no) ? <Span>{item.title}</Span>:<Span fg={'secondary'}>{item.title}</Span>
                                    }
                                </Div>
                            </Div>
                        )
                    })
                }
            </GridColumns>
            <Div px={20} py={25} bg={'background'}>
                <Div fontSize={14} lineHeight={22}>
                    <Flex dot alignItems={'flex-start'}><Div>모든 배지의 지급 기준은 배지 생성 시점부터입니다.</Div></Flex>
                </Div>
            </Div>

            {
                selectedBadge && isModal &&
                    <ModalPopup
                        title={selectedBadge.title} onClick={modalToggle}
                        content={
                            <Div textAlign={'center'} lineHeight={20} fontSize={15}>
                                <Div mb={8}>
                                    <Img cover alt="" // rounded={'50%'}
                                        width={200} height={200}
                                        src={badgeList.includes(selectedBadge.no) ? selectedBadge.activeImage : selectedBadge.defaultImage} />
                                </Div>
                                <Div mb={15} bc={"background"}>
                                    <WhiteSpace p={16} textAlign={'left'}>
                                        {selectedBadge.description}
                                    </WhiteSpace>
                                </Div>
                                <Div textAlign={'center'}>
                                    <Div bc={'dark'} display={'inline-block'} width={60} mb={5} fontSize={12} rounded={15} px={8} py={2}>방법</Div>
                                    <Div>{selectedBadge.howto}</Div>
                                </Div>
                                {
                                    consumer.consumerNo == consumerNo && selectedBadge.count && selectedBadge.no !== 5 &&
                                    <Div textAlign={'center'} fontSize={12}>
                                        ({selectedBadgeStatus < selectedBadge.count ? selectedBadgeStatus : selectedBadge.count}/{selectedBadge.count})
                                    </Div>
                                }
                                {
                                    consumer.consumerNo == consumerNo && selectedBadge.count && selectedBadge.no == 5 &&
                                    <Div textAlign={'center'} fontSize={12}>
                                        (댓글 {selectedBadgeStatus < 5 ? selectedBadgeStatus : 5}/5, 좋아요 {badge5LikeCount < 5 ? badge5LikeCount : 5}/5)
                                    </Div>
                                }
                                <Div textAlign={'center'} mt={15}>
                                    <Div bc={'dark'} display={'inline-block'} width={60} mb={5} fontSize={12} rounded={15} px={8} py={2}>포인트</Div>
                                    <Div>{selectedBadge.point}p</Div>
                                </Div>
                            </Div>
                        }
                    />
            }
        </Div>
    )
}

export default ConsumerBadgeList