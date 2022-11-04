import React, {Component, Fragment, useEffect, useMemo, useState} from 'react';
import {useHistory} from 'react-router-dom'
import {Div, Span, Button, Flex, Hr, Right, Img, GridColumns, JustListSpace, Space} from '~/styledComponents/shared'
import {getLocalfoodDeliveryText, getLocalfoodProducer} from "~/lib/localfoodApi";
import {Ul} from "~/styledComponents/shared/Layouts";
import {Container, Row, Col} from "reactstrap";
import ComUtil from "~/util/ComUtil";
import {GrLocation} from "react-icons/gr";
import ShopBlyLayouts, {Bold} from "~/styledComponents/ShopBlyLayouts";
import {color} from "~/styledComponents/Properties";
import HashTagList from "~/components/common/hashTag/HashTagList";
import {useRecoilState, useSetRecoilState} from "recoil";
import {boardTagModalState} from "~/recoilState";
import {AbsoluteMask} from "~/styledComponents/shared";
import {getValue} from "~/styledComponents/Util";
import styled from 'styled-components'
import {RiLeafFill, RiUser3Fill} from 'react-icons/ri'
import {RoundedCountBadge} from '../components/Style'
import {MdLocationPin, GiPear} from "react-icons/all";
import useInterval from "~/hooks/useInterval";
import {Server} from "~/components/Properties";


const LocalStoreCard = (props) => {

    const history = useHistory()
    const setTagModalState = useSetRecoilState(boardTagModalState)

    const store = props.store //LOCALFOOD_STORE 한 개.
    const [dbStore, setDbStore] = useState({})        //백엔드에서 가져온 store:dbStore
    const [errorRes, setErrorRes] = useState({
        resCode: 1,
        retData: ''
    })
    const [loading, setLoading] = useState(true)

    const onLinkClick = (to, disabled) => { if(!disabled) history.push(to) }

    useEffect(()=>{
        async function fetch(){

            if (store.producerNo) {
                let {data:dbStore} = await getLocalfoodProducer(store.producerNo)
                setDbStore(dbStore)
                console.log('dbStore', dbStore)

                if (!store.disabled) {

                    // 로그인 X : 0, "배송지를 설정해 주세요"
                    // 로그인 O 배송지 없으면 : 0, "배송지를 설정해 주세요"
                    // 로그인 O producerNo X : 1, ""
                    // 로그인 O producerNo O 배송가능지역 : 2, "x시 이내 배송가능"
                    // 로그인 O producerNo X 배송불가능지역 : 3, "배송 불가능한 지역"
                    let {data: errorRes} = await getLocalfoodDeliveryText(store.producerNo);
                    setErrorRes(errorRes)
                }
            }

            setLoading(false)
        }
        fetch()
    }, [])

    const onCardClick = (location, e) => {
        e.stopPropagation()

        if (store.disabled) {
            alert('해당 로컬푸드 매장은 오픈 예정이에요. 오픈이 되면 빠르게 알려 드릴게요!')
            return
        }

        history.push(`/localStore/${store.producerNo}/${location}`)
    }

    const onTagClick = ({index, tag}) => {
        console.log({index, tag})
        setTagModalState(state => ({isOpen: true, tag: tag}))
    }

    // if (!dbStore) return null

    const mergedStore = {...store, ...dbStore}

    console.log(mergedStore)
    //이미지 교체 background0번대신 profile0번사용 : 옥천로컬푸드직매장 이미지가 가로로 길어서 대체.
    if (mergedStore.profileBackgroundImages && mergedStore.profileImages && mergedStore.profileBackgroundImages.length > 0 && mergedStore.profileImages.length > 0) {
        mergedStore.profileBackgroundImages[0] = mergedStore.profileImages[0]
    }

    if (loading) return null

    return (
        <Card
            onCardClick={onCardClick.bind(this, 'home')}
            // onGoodsListClick={onCardClick.bind(this, 'goods')}
            disabled={store.disabled}
            // profileImages={mergedStore.profileImages}
            profileBackgroundImages={mergedStore.profileBackgroundImages}
            farmName={mergedStore.farmName}
            shopIntroduce={mergedStore.shopIntroduce}
            shopAddress={mergedStore.shopAddress}
            shopAddressDetail={mergedStore.shopAddressDetail}
            shopMainItems={mergedStore.shopMainItems}
            tags={mergedStore.tags}
            onTagClick={onTagClick}
            sellingGoodsCount={mergedStore.sellingGoodsCount}
            farmersCount={mergedStore.farmersCount}
            //배송가능일때만 나오도록
            deliveryStatusInfo={errorRes}
            // deliveryStatusText={errorRes.resCode [2,3].includes(errorRes.resCode) ? errorRes.retData : ''}
        />
    )
};

export default LocalStoreCard;


const LocalfoodContainer = styled.div`
    border-radius: ${getValue(8)};
    box-shadow: 0px 5px 15px 0 rgba(0, 0, 0, 0.17);
    overflow: hidden;
    margin: 0 ${getValue(16)} ${getValue(40)} ${getValue(16)};
    cursor: pointer; 
`

const ProfileBgWrapper = styled.div`
    position: relative;
    overflow: hidden;
    height: 60vmin;
`

const ProfileBgBox = styled.div`
    height: 100%;
    transition: 0.4s;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    background-image: url("${props => props.src}");
    // background-image: url("https://img.hankyung.com/photo/201912/01.21032432.1.jpg");
`

function Card({
                  onCardClick,
                  // onGoodsListClick,
                  disabled,
                  // profileImages,
                  profileBackgroundImages, farmName, shopIntroduce, shopAddress, shopAddressDetail, shopMainItems, tags, onTagClick, sellingGoodsCount, farmersCount,
                  deliveryStatusInfo,
                  deliveryStatusText
              }) {

    //최적화 코드
    //부모가 재 렌더링 되더라도 profileBackgroundImages이 바뀌었을(주소가)때만 실행 됨. 이 부분은 React.memo() 와 같이 쓰임.
    const backgroundImages = useMemo(() => profileBackgroundImages, profileBackgroundImages)

    return(
        <LocalfoodContainer cursor onClick={onCardClick}>
            <ProfileBgWrapper>
                {
                    //deliveryStatusInfo.resCode === 3 배송 불가능 지역
                    disabled && (
                        <AbsoluteMask>
                            <Div textAlign={'center'}>
                                <Div fontSize={30}>오픈예정</Div>
                                <Div fontSize={20}>Coming Soon</Div>
                            </Div>
                        </AbsoluteMask>
                    )
                }
                {
                    //deliveryStatusInfo.resCode === 2 배송가능 지역
                    !disabled && (
                        <Div absolute right={16} bottom={16} zIndex={1}>
                            <Space spaceGap={11}>
                                {
                                    sellingGoodsCount > 0 && (
                                        <RoundedCountBadge color={'danger'}>
                                            <RiLeafFill/>
                                            <div>
                                                상품
                                            </div>
                                            <Bold bold fontSize={15}>{ComUtil.addCommas(sellingGoodsCount)}</Bold>
                                        </RoundedCountBadge>
                                    )
                                }
                                <RoundedCountBadge color={'primary'} cursor>
                                    <RiUser3Fill color={color.primary} />
                                    <div>
                                        농가
                                    </div>
                                    <Bold bold fontSize={15}>{ComUtil.addCommas(farmersCount)}</Bold>
                                </RoundedCountBadge>
                            </Space>
                        </Div>
                    )
                }
                <ProfileBgBox src={backgroundImages.length && Server.getImageURL() + backgroundImages[0].imageUrl} />
                {/*<ProfileBg profileBackgroundImages={backgroundImages} />*/}
            </ProfileBgWrapper>


            <Div p={16} pt={29}>
                {/*상호명*/}
                <Flex fontSize={19} px={4} mb={24}>
                    <b style={{lineHeight: 1, marginBottom: -2}}>{farmName}</b>
                    <Div rounded={10} bg={disabled ? 'dark' : 'danger'} fg={'white'} fontSize={12} px={8} minHeight={20} lineHeight={20} ml={8}>{disabled ? 'CLOSED' : 'OPEN'}</Div>
                </Flex>
                {/*배송가능 상태 텍스트*/}
                {
                    [2,3].includes(deliveryStatusInfo.resCode) && (
                        <Div mb={4} fg={deliveryStatusInfo.resCode === 2 ? 'green' : 'danger'}>{deliveryStatusInfo.retData}</Div>
                    )
                }
                {/*<JustListSpace space={6} mb={4}>*/}
                    {/* 매장 주소 */}
                    {/*<div>*/}
                    {/*    <MdLocationPin />*/}
                    {/*    <Span fontSize={14} lineHeight={18} ml={8}>*/}
                    {/*        {*/}
                    {/*            `${shopAddress} ${shopAddressDetail}`*/}
                    {/*        }*/}
                    {/*    </Span>*/}
                    {/*</div>*/}
                    {/* 특산물 */}
                    {/*<div>*/}
                    {/*    <GiPear />*/}
                    {/*    <Span fontSize={14} lineHeight={18} ml={8}>*/}
                    {/*        {*/}
                    {/*            `${shopMainItems}`*/}
                    {/*        }*/}
                    {/*    </Span>*/}
                    {/*</div>*/}

                    {/*<Div overflow={'auto'} custom={`*/}
                    {/*    &::-webkit-scrollbar {*/}
                    {/*        display: none;*/}
                    {/*    }*/}
                    {/*`}>*/}
                    {/*    <Div width={720}>*/}
                    {/*        <HashTagList tags={tags} isViewer={true} onClick={onTagClick} wrap={'wrap'} />*/}
                    {/*    </Div>*/}
                    {/*</Div>*/}
                {/*</JustListSpace>*/}

                {/*버튼 영역*/}

                {/*{*/}
                {/*    !disabled && <Button block mt={10} fontSize={14} rounded={4} bg={'green'} height={55} fg={'white'} onClick={onCardClick}>바로가기</Button>*/}
                {/*}*/}

                {/*{*/}
                {/*    !disabled && (*/}
                {/*        <GridColumns repeat={2} rowGap={0} colGap={5} mt={10}>*/}
                {/*            <Button fontSize={14} rounded={4} bg={'light'} height={55} onClick={onGoodsListClick}>상품({ComUtil.addCommas(sellingGoodsCount)})</Button>*/}
                {/*            <Button fontSize={14} rounded={4} bg={'green'} height={55} fg={'white'} onClick={onCardClick}>바로가기</Button>*/}
                {/*        </GridColumns>*/}
                {/*    )*/}
                {/*}*/}

                {/*{*/}
                {/*    !disabled && (*/}
                {/*        <ShopBlyLayouts.TabButtonGroup pt={20}>*/}
                {/*            <ShopBlyLayouts.TabButton onClick={onGoodsListClick}>*/}
                {/*                판매상품<span style={{color: color.green}}>({ComUtil.addCommas(sellingGoodsCount)})</span>*/}
                {/*            </ShopBlyLayouts.TabButton>*/}
                {/*            <ShopBlyLayouts.TabButton active={true} onClick={onCardClick}>*/}
                {/*                바로가기*/}
                {/*            </ShopBlyLayouts.TabButton>*/}
                {/*        </ShopBlyLayouts.TabButtonGroup>*/}
                {/*    )*/}
                {/*}*/}
            </Div>


        </LocalfoodContainer>
    )
}

//최적화 코드
//React.memo는 오브젝트의 주소값을 비교하여 바뀌었을때만 렌더링 됨(profileBackgroundImages 주소가 바꼈을 경우만)
// const ProfileBg = React.memo(({profileBackgroundImages}) => {
//     const [bgIndex, setBgIndex] = useState(0)

    // useInterval(() => {
    //     let nextIndex = bgIndex + 1 //1
    //     const maxLen = profileBackgroundImages.length//1
    //
    //     if (nextIndex === maxLen) {
    //         nextIndex = 0
    //     }
    //
    //     setBgIndex(nextIndex)
    //
    // }, profileBackgroundImages.length === 1 ? null : 5000) //이미지가 1개인 경우는 인터벌 없음


//     return(
//         <ProfileBgBox src={Server.getImageURL() + profileBackgroundImages[bgIndex].imageUrl} />
//     )
// })