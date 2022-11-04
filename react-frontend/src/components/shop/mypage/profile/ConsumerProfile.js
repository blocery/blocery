import React, {Fragment, useState, useEffect, useCallback} from 'react'
import {Div, Span, Flex, Img, Hr, Right, GridColumns, Link} from '~/styledComponents/shared'
import BackNavigation from "~/components/common/navs/BackNavigation";
import imgNoProfile from "~/images/icons/renewal/mypage/no_profile.png";
import {Server} from "~/components/Properties";
import {getConsumer, getMyProfile, getConsumerProfile} from '~/lib/shopApi'
import {BsCardImage, BsPeople} from 'react-icons/bs'
import {IoMdHeart, IoMdHeartEmpty, IoIosArrowRoundForward} from 'react-icons/io'
import ComUtil from "~/util/ComUtil";
import BADGE_LIST from "../../mypage/badge/BadgeList"
import {BoardCard} from "~/components/common";
import styled from 'styled-components'
import ArrowList from "~/components/common/lists/ArrowList";
import {FiMessageSquare, FiAward} from 'react-icons/fi'
import {BiStoreAlt} from 'react-icons/bi'
import {AiOutlineStar} from 'react-icons/ai'

const Icon = styled(Img)`
    margin-right: 17px;
    width: 19px;
    height: 22px;
`

const ConsumerProfile = (props) => {
    const [profile, setProfile] = useState(null)
    const [badgeList, setBadgeList] = useState([])

    useEffect(() => {
        async function fetch() {
            //await search(); //로그인 정보 가져오기
            await getProfile();
            // await getBadge();
        }

        fetch();
    }, [])

    const getProfile = async () => {
        const {data:profile} = await getConsumerProfile(props.consumerNo);
        setProfile(profile)

        const badge = ComUtil.intToBinaryArray(profile.badgeList);
        badge.unshift(0)    // 0번 뱃지는 default값(하드코딩)

        setBadgeList(badge)
    }

    if(!profile)
        return null

    return (
        <Fragment>
            <ArrowList data={props.isBlocked?[]:[
                {text: <><FiMessageSquare size={20} /><Span ml={17}>스토리</Span> <Span fg={'green'}>{ComUtil.addCommas(profile.storyCount)}개</Span></>, to: `/consumerBoardList?consumerNo=${profile.consumerNo}`},
                {text: <><BiStoreAlt size={20} /><Span ml={17}>단골상점</Span> <Span fg={'green'}>{ComUtil.addCommas(profile.following)}개</Span></>, to: `/regularShopList?consumerNo=${profile.consumerNo}`},
                {text: <><FiAward size={20} /><Span ml={17}>활동배지</Span> <Span fg={'green'}>{ComUtil.addCommas(badgeList.length)}개</Span></>, to: `/consumerBadgeList?consumerNo=${props.consumerNo}`},
                {text: <><AiOutlineStar size={20} /><Span ml={17}>리뷰</Span> <Span fg={'green'}>{ComUtil.addCommas(profile.reviewCount)}개</Span></>, to: `/consumerReviewList?consumerNo=${profile.consumerNo}`},
            ]} />

        </Fragment>
    )
}

export default ConsumerProfile;