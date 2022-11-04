import React, {useState, useEffect, Fragment} from 'react'
import {
    Div,
    Divider,
    Flex,
    GridColumns,
    Hr,
    Img,
    Link,
    Right,
    Space,
    Span,
    WhiteSpace
} from "~/styledComponents/shared";
import {getProducer, getProducerProfile} from '~/lib/producerApi'
import ComUtil from "~/util/ComUtil";
import HashTagList from "~/components/common/hashTag/HashTagList";
import {useRecoilState} from "recoil";
import {boardTagModalState} from "~/recoilState";
import ArrowList from "~/components/common/lists/ArrowList";
import {FiUsers, FiLayers} from 'react-icons/fi'
import {TiClipboard} from 'react-icons/ti'
import styled from "styled-components";
import {SummerNoteIEditorViewer} from "~/components/common";
import {getValue} from "~/styledComponents/Util";

const ProducerProfile = (props) => {
    const [profile, setProfile] = useState(null)

    const [tagModalState, setTagModalState] = useRecoilState(boardTagModalState)
    const openTagModal = ({tag}) => {
        setTagModalState({
            isOpen: true,
            tag: tag,
        })
    }

    useEffect(() => {
        async function fetch() {
            await getProfile();
        }

        fetch();
    }, [])

    const getProfile = async () => {
        const {data} = await getProducerProfile(props.consumerNo-900000000);
        //console.log(data)
        setProfile(data)
    }

    if(!profile)
        return null

    return (
        <Fragment>
            <Divider />
            <Div py={23} fontSize={14} fg={'black'}>
                {/*<WhiteSpace px={16}>{profile.shopIntroduce}</WhiteSpace>*/}

                <Div px={16} custom={`
                    & img {
                        width: 100%!important;
                        border-radius: ${getValue(4)};
                    }
                `}>
                    <SummerNoteIEditorViewer
                        // height="400px"
                        initialValue={profile.shopIntroduce}
                    />
                </Div>

                <Div px={16} mt={16} bold>
                    주요 취급품목 : {profile.shopMainItems}
                </Div>
                {
                    profile.tags.length > 0 && (
                        <Div overflow={'auto'} p={16}>
                            <Div mr={10}><HashTagList wrap={false} isViewer={true} tags={profile.tags} onClick={openTagModal} /></Div>
                        </Div>
                    )
                }
            </Div>

            <Divider />
            <ArrowList data={ props.isBlocked?[]:
                [
                {text: <><FiUsers size={20} /> <Span ml={14}>단골</Span> <Span fg={'green'} >{ComUtil.addCommas(profile.totalFollower)}명</Span></>, to: `/ProducerFollowerList?producerNo=${ComUtil.getProducerNoByConsumerNo(props.consumerNo)}`},
                {text: <><TiClipboard size={20} /> <Span ml={14}>피드</Span> <Span fg={'green'}>{ComUtil.addCommas(profile.totalFeed)}개</Span></>, to: `/producersFarmDiaryList?producerNo=${ComUtil.getProducerNoByConsumerNo(props.consumerNo)}`},
                {text: <><FiLayers size={20} /> <Span ml={14}>상품</Span> <Span fg={'green'}>{ComUtil.addCommas(profile.totalGoods)}개</Span></>, to: `/producersGoodsList?producerNo=${ComUtil.getProducerNoByConsumerNo(props.consumerNo)}`},
            ]} />

        </Fragment>
    )
}

export default ProducerProfile;