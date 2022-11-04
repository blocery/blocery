import React, {useEffect, useState} from "react";
import {Div, Flex, Img, Right, Space, Span, WhiteSpace} from "~/styledComponents/shared";
import Profile from "~/components/common/cards/Profile";
import RoundedFollowButton from "~/components/common/buttons/RoundedFollowButton";
import ComUtil from "~/util/ComUtil";
import HashTagList from "~/components/common/hashTag/HashTagList";

import styled from'styled-components'
import {getValue} from "~/styledComponents/Util";
import {Image, SummerNoteIEditorViewer} from "~/components/common";
import {Server} from "~/components/Properties";
import {useHistory} from "react-router-dom";
import useLogin from "~/hooks/useLogin";
import {color} from "~/styledComponents/Properties";

import medalGold from "~/images/icons/medal_gold.png"
import medalSilver from "~/images/icons/medal_silver.png"
import medalBronze from "~/images/icons/medal_bronze.png"

const CircleImg = styled(Img)`

    transition: 0.2s;
    object-fit: cover;
    ${props => props.selected ? `
        box-shadow: 
        0 0 0 2px white,
        0 0 0 4px #cdded1;        
        filter: brightness(1);
        
        transform: scale(1.1);
        
    ` : `
        filter: brightness(.9);
    `}
`
const style = {
    image: {
        width: '100%',
        height: '100%'
    }
}

const ScoreBadge = styled(Div)`
  font-size: 10px;
  font-family: NanumBarunGothic;
  font-size: 10px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.9;
  letter-spacing: normal;
  text-align: center;
  
  width: 45px;
  height: 20px;
  padding: 1px 6px 6px 5px;
  opacity: 0.7;
  border-radius: 4px;
  background-color: #212324;
  color: #fff;
  margin-left: 4px;
  margin-bottom: 4px;
`

export const CircleButton = ({value, label, src, selected, onClick}) => {
    return(
        <Div textAlign={'center'} onClick={onClick.bind(this, value)} >
            <Div width={63} height={63} >
                <CircleImg rounded={'50%'} src={src} selected={selected}/>
            </Div>
            <Div mt={17} bold fontSize={14}>{label}</Div>
        </Div>
    )
}

export const CircleButtonList = ({data, onClick, selectedValue}) => {
    return(
        <Div overflow={'auto'} px={18} pt={26} pb={10}>
            <Space spaceGap={16} custom={`
                        & > div:last-child {
                            padding-right: ${getValue(18)};
                        }
                    `}>
                {
                    data.map(item =>
                        <CircleButton key={item.value}
                                      onClick={onClick.bind(this, item.value)}
                                      label={item.label}
                                      value={item.value}
                                      src={item.src}
                                      selected={item.value === selectedValue}
                        />
                    )
                }
            </Space>
        </Div>
    )
}

// 단골과 피드는 현재 주간통계 부족해서 전체 합계 사용 중.
const producerTextValueByType = {
    sell: (value) => <Span>주간 총 <Span fg={'green'}>{ComUtil.addCommas(value)}건</Span> 판매</Span>,
    score: (value) => <Span>주간 평점 평균 <Span fg={'green'}>{ComUtil.addCommas(value)}점</Span></Span>,
    follower: (value, followerCount) => (value > 0)? <Span> 월 <Span fg={'green'}>{ComUtil.addCommas(value)}명 </Span>단골고객 확보</Span> :
                                                     <Span> 총 <Span fg={'green'}>{ComUtil.addCommas(followerCount)}명 </Span>단골고객 확보</Span> ,
    feed: (value, f1, feedCount) => <Span> 총 <Span fg={'green'}>{ComUtil.addCommas(feedCount)}개 </Span>게시글 등록</Span>,
}

export const PeopleProducerCard = ({producer, array, profileInfo, rank, diff, followerCount, feedCount, goodsCount, weeklyTotal, type, onHashTagClick }) => {

    const history = useHistory()


    const onInfoClick = (id) => {
        //array[].id 설명.
        // "sell","score": goodsNo,
        // "follower"    : consumerNo,
        // "feed"        : writingId,
        if (type === 'sell' || type === 'score')
            history.push('/goods?goodsNo='+ id)

        if (type === 'feed')
            history.push('/community/board/'+ id)


    }

    return(
        <Flex alignItems={'flex-start'} px={16} py={30}>
            <Div flexShrink={0} pr={16} textAlign={'center'}>
                <Div fontSize={20} bold>{rank}</Div>
                {
                    diff === 0 ? <Div fg={'dark'} fontSize={12}>-</Div> :
                        diff > 0 ? <Div fg={'danger'} fontSize={12}>▲{diff}</Div> :
                            <Div fg={'primary'} fontSize={12}>▼{diff}</Div>
                }
            </Div>
            <Div flexGrow={1}>
                <Flex>
                    <Profile {...profileInfo}/>
                    <Right>
                        <RoundedFollowButton producerNo={producer.producerNo} />
                    </Right>
                </Flex>
                {/* 에디터 내용이 너무 길어져 숨기기로 함 */}
                {/*<WhiteSpace lineClamp={3} mt={16} fontSize={14}>*/}
                {/*    <SummerNoteIEditorViewer initialValue={producer.shopIntroduce} />*/}
                {/*</WhiteSpace>*/}
                <Space fg={'dark'} fontSize={14} mt={16}>
                    <Div>단골{ComUtil.addCommas(followerCount)}</Div>
                    <Div>피드{ComUtil.addCommas(feedCount)}</Div>
                    <Div>상품{ComUtil.addCommas(goodsCount)}</Div>
                </Space>
                {
                    (producer.tags && producer.tags.length) > 0 && (
                        <Div mt={16}>
                            <HashTagList tags={producer.tags} onClick={()=>null} isViewer={true} onClick={onHashTagClick}/>
                        </Div>
                    )
                }
                <Flex bg={'veryLight'} rounded={4} justifyContent={rank <= 3?'left':'center'} fontSize={16} height={65} mt={16} bold>
                    {rank ===1 &&
                        <Div width={36} height={43} ml={56} mr={12}><Image src={medalGold} style={style.image}/></Div>
                    }
                    {rank ===2 &&
                        <Div width={37} height={43} ml={56} mr={12}><Image src={medalSilver} style={style.image}/></Div>
                    }
                    {rank ===3 &&
                        <Div width={37} height={43} ml={56} mr={12}><Image src={medalBronze} style={style.image}/></Div>
                    }
                    {producerTextValueByType[type](weeklyTotal, followerCount, feedCount)}
                </Flex>


                { type !== 'follower' && array.length >= 2 && //부가정보, follower는 profile들이 없어서 제외중.
                    <Flex mt={5}>
                        {
                            array.map((oneInfo) => {
                                return (
                                    oneInfo.image &&
                                    <Div relative overflow={'hidden'}>
                                        <Div height={64} width={65} mr={5} onClick={onInfoClick.bind(this, oneInfo.id)}>
                                            {type === 'score' &&
                                                <Div absolute zIndex={1} left={0} bottom={0}>
                                                    <ScoreBadge bg={'black'}>★ {oneInfo.score==10? (oneInfo.score).toFixed(0):(oneInfo.score).toFixed(1)}</ScoreBadge>
                                                </Div>
                                            }
                                            <Image cover style={style.image}
                                                   src={Server.getThumbnailURL() + oneInfo.image.imageUrl}
                                                   borderRadius={true}></Image>
                                        </Div>
                                    </Div>
                                )
                            })
                        }
                    </Flex>
                }


            </Div>
        </Flex>
    )
}

const consumerTextValueByType = {
    bly: (value) => `주간 ${ComUtil.addCommas(value)}BLY 적립`,
    point: (value) => `주간 ${ComUtil.addCommas(value)}포인트 적립`,
    buy: (value) => `주간 ${ComUtil.addCommas(value)}건 구매`,
    board: (value) => `주간 ${ComUtil.addCommas(value)}개 글 작성`,
    reply: (value) => `주간 ${ComUtil.addCommas(value)}개 댓글 작성`,
    friend: (value) => `주간 ${ComUtil.addCommas(value)}건 초대`
}

export const PeopleConsumerCard = ({rank, consumer, writingCount, replyCount, weeklyTotal, type }) => {
    return(
        <Flex alignItems={'flex-start'} px={16} py={30}>
            <Div flexShrink={0} pr={16} textAlign={'center'}>
                <Div fontSize={20} bold>{rank}</Div>
            </Div>
            <Div flexGrow={1}>
                <Div>
                    <Profile
                        consumerNo={consumer.consumerNo}
                        producerNo={null}
                        profileImages={consumer.profileImages}
                        nickname={consumer.nickname}
                        level={consumer.level}              //사용자 레벨(board, goodsReview)
                        desc={null}               //고령농장 감자. 산지직송 등등(producer 일 경우만 사용)
                        producerFlag={false}
                    />
                </Div>
                <Space fg={'secondary'} fontSize={14} mt={16}>
                    <Div fg={'green'}>{consumerTextValueByType[type](weeklyTotal)}</Div>
                    <Div>게시물{ComUtil.addCommas(writingCount)}</Div>
                    <Div>댓글{ComUtil.addCommas(replyCount)}</Div>
                </Space>
            </Div>
        </Flex>
    )
}