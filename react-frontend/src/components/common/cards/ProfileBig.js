import React, {useState, useEffect} from 'react';
import {Div, Flex, Img, Right, Space} from "~/styledComponents/shared";
import {IoIosArrowForward} from "react-icons/io";
import {GradeBadgeBig, ProfileImageStrokeBig} from "~/styledComponents/ShopBlyLayouts";
import {gradeStore} from "~/store";
import ComUtil from "~/util/ComUtil";
import NoProfile from "~/images/icons/renewal/mypage/no_profile.png";
import {withRouter} from 'react-router-dom'
import { getProfileBlocked} from '~/lib/shopApi'

import {TYPE_OF_IMAGE} from "~/lib/bloceryConst";
//consumersDetailActivity

const ProfileBig = ({
                        consumerNo,
                        desc,
                        level,
                        name,
                        nickname,
                        producerFlag,
                        producerNo,
                        profileImages,
                        showArrowForward,
                        hideGrade = false,
                        onClick,
                        refreshDate,
                        history
                    }) => {

    const [profileImageUrl, setProfileImageUrl] = useState(ComUtil.getFirstImageSrc(profileImages, producerFlag ? TYPE_OF_IMAGE.THUMB : TYPE_OF_IMAGE.SQUARE) || NoProfile)

    //내가 신고 했는지 여부
    //const [reported, setReported] = useState()
    const [blocked, setBlocked] = useState()
    useEffect(() => {
        //getReported()
        getBlocked()
    }, [consumerNo])

    useEffect(() => {
        if (refreshDate) {
            //getReported()
            getBlocked()
        }
    }, [refreshDate])

    const getReported = async () => {
        //const {data} =  await getProfileBlocked(consumerNo)
        //setReported(data)
    }

    const getBlocked = async () => {
        const {data} =  await getProfileBlocked(consumerNo)
        setBlocked(data)
    }

    const onError = () => {
        setProfileImageUrl(NoProfile)
    }

    return (
        <>
            <Flex relative onClick={onClick} p={16} pt={29} bg={'white'} cursor>
                <ProfileImageStrokeBig producerFlag={producerFlag} level={level}>
                    <Img rounded={'50%'} cover width={78} height={78} src={blocked ? NoProfile : profileImageUrl} alt={'프로필 이미지'} onError={onError} />
                </ProfileImageStrokeBig>

                <Div ml={18}>
                    <Div fontSize={21.5} bold lineHeight={21.5}>
                        {   blocked? '차단된 사용자입니다.':nickname
                            //reported ? '프로필이 신고되었습니다' : nickname}
                        }

                    </Div>
                    <Space spaceGap={8} mt={8}>
                        {
                            !hideGrade && (
                                <Div>
                                    <GradeBadgeBig level={level}>
                                        <b>{gradeStore[level]}</b>
                                    </GradeBadgeBig>
                                </Div>
                            )
                        }
                        {
                            producerFlag && (
                                <Div fontSize={14.4} fg={'dark'} height={22}>
                                    <b>{blocked ? '****' : desc}</b>
                                </Div>
                            )
                        }
                    </Space>
                </Div>
                {
                    showArrowForward && (
                        <Right>
                            <IoIosArrowForward/>
                        </Right>
                    )
                }
            </Flex>
        </>
    );
};

export default withRouter(ProfileBig);
