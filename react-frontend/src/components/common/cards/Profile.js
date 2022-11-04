import React, {useCallback, useEffect, useMemo, useState} from "react";
import {Div, Flex, Img, Space} from "~/styledComponents/shared";
import {withRouter} from 'react-router-dom'
import NoProfile from '~/images/icons/renewal/mypage/no_profile.png'
import {gradeStore} from "~/store";
import {GradeBadge} from "~/styledComponents/mixedIn";
import LeafIcon from '~/images/icons/renewal/leaf.svg'
import styled from 'styled-components'
import {getValue} from "~/styledComponents/Util";
import {color} from "~/styledComponents/Properties";
import ComUtil from "~/util/ComUtil";
import {GradeBadgeSmall, ProfileImageStrokeSmall} from "~/styledComponents/ShopBlyLayouts";
import {getProfileBlocked} from "~/lib/shopApi";
import useImg from "~/hooks/useImg";
import {TYPE_OF_IMAGE} from "~/lib/bloceryConst";
import {LazyLoadImage} from "react-lazy-load-image-component";

const Profile = withRouter(({
                                consumerNo,
                                producerNo,
                                profileImages,
                                nickname,
                                level,              //사용자 레벨(board, goodsReview)
                                desc,               //고령농장 감자. 산지직송 등등(producer 일 경우만 사용)
                                producerFlag,
                                onClick,
                                history,
                                style = {}
                            }) => {

    // const {imageUrl, onError} = useImg(profileImages, TYPE_OF_IMAGE.SQUARE, NoProfile)
    // console.log({profileImages})
    //프로필은 useImg 를 사용 하면 안됨. 11.11일 배포된 내용은 SMALL_THUMB 이 없었고, SMALL_THUMB 를 호출하면 onError 에서 NoProfile 을 바인딩 하게되면 잠시 깨졌다가 이미지가 들어가게 됨
    const [profileImageUrl, setProfileImageUrl] = useState()

    //내가 신고 했는지 여부
    //const [reported, setReported] = useState()
    const [blocked, setBlocked] = useState()


    useEffect(() => {
        async function fetch() {
            const {data} =  await getProfileBlocked(consumerNo)
            setBlocked(data)
        }
        fetch()

        setProfileImageUrl(ComUtil.getFirstImageSrc(profileImages, producerFlag ? TYPE_OF_IMAGE.THUMB : TYPE_OF_IMAGE.SQUARE) || NoProfile)

    }, [consumerNo])


    const onHandleClick = (e) => {
        e.stopPropagation() //모달에서 프로필 클릭시 카드의 onClick 이벤트에서 모달창이 닫힐 수 있도록..
        if (onClick && typeof onClick === 'function') {
            onClick()
        }else{
            history.push(`/consumersDetailActivity?consumerNo=${consumerNo}`)
        }
    }

    const onError = useCallback(() => {
        setProfileImageUrl(NoProfile)
    }, [])

    return(
        <Div cursor={1} doActive {...style}>
            <Flex onClick={onHandleClick}>
                <ProfileImageStrokeSmall producerFlag={producerFlag} level={level}>
                    <ProfileImage profileImageUrl={blocked ? NoProfile : profileImageUrl}
                                  onError={onError}
                    />
                </ProfileImageStrokeSmall>
                <Space ml={12} alignItems={'flex-start'} justifyContent={'center'} flexDirection={'column'}>
                    <Div lineClamp={1} fontSize={14}
                         //lineHeight={14}
                         mb={6}
                         bold>{blocked ? '차단된 사용자입니다.' : nickname}</Div>
                    <Space spaceGap={10}>
                        {
                            !producerFlag && (<GradeBadgeSmall level={level}>{gradeStore[level]}</GradeBadgeSmall>)
                        }
                        {
                            producerFlag && <Div fg={'green'} fontSize={12} ml={10}>{blocked ? '****' : desc}</Div>
                        }
                    </Space>
                </Space>
            </Flex>
        </Div>
    )
})

const ProfileImage = React.memo(({profileImageUrl, onError}) =>{
    // console.log({profileImageUrl})

    return (
        <LazyLoadImage
            alt={'user profile'}
            src={profileImageUrl}
            effect="blur"
            style={{objectFit: 'cover', cursor: 'pointer', borderRadius: '50%'}}
            placeholderSrc={'/lazy/gray_lazy_1_1.jpg'}
            width={42}
            height={42}
            onError={onError}
        />
    )

    // return (
    //     <img style={{objectFit: 'cover', width: 42, height: 42
    //         ,borderRadius: '50%'
    //     }}
    //          src={profileImageUrl}
    //          alt="프로필 이미지"
    //          onError={onError}
    //     />
    // )
})

export default Profile
