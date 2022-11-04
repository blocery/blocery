import React, {useState, useEffect, useRef} from 'react';
import {Div, Flex, Img} from "~/styledComponents/shared";
import useInterval from "~/hooks/useInterval";
import {getOrderConsumers, getFkOrderConsumers} from "~/lib/shopApi";
import ComUtil from "~/util/ComUtil";
import NoProfile from '~/images/icons/renewal/mypage/no_profile.png'
import moment from 'moment-timezone'
import styled, {keyframes} from 'styled-components'
import {color} from "~/styledComponents/Properties";
import {ImSpinner2} from 'react-icons/im'
import {spin} from "~/styledComponents/CoreStyles";

const RotationSpinner = styled(Div)`
    ${spin};
`

//실시간 상품 구매자 스크롤 카드
const BuyingPeopleCard = ({
                              goodsNo,      //상품코드(필수)
                              startDate,    //시작일자 moment객체
                              endDate,      //종료일자 moment객체
                              searchInterval = 3000 //조회 인터벌(기간에 접어 들었을 경우 자동 조회됨)
                          }) => {

    const [data, setData] = useState()
    const [timerInterval, setTimerInterval] = useState(1000)
    const [periodInterval, setPeriodInterval] = useState(null)

    const el = useRef()

    useEffect(() => {
        const now = moment()

        //기간에 접어 든 경우라면 최초 조회
        if (now.isBetween(startDate, endDate,undefined, '[]') || now.isAfter(endDate)){
            moreSearch(true)
        }
    }, [goodsNo])

    //1초마다 기간에 접어들었는지 체크
    useInterval(() => {

        const now = moment()

        //기간 이전일 경우
        if (now.isBefore(startDate)) {
            // console.log('before')
        }
        /*
            기간중
            [ : 시작이 같거나 큰것
            ] : 종료가 같거나 큰것
            ( : 시작보다 큰것
            ) : 종료보다 큰것
      */
        else if (periodInterval === null && now.isBetween(startDate, endDate,undefined, '[]')) {
            setPeriodInterval(searchInterval)
            // console.log('between')
        }
        //기간종료
        else if (now.isAfter(endDate)){
            setPeriodInterval(null)
            setTimerInterval(null)
            // console.log('after')
        }
    }, timerInterval)

    useInterval(() => {
        moreSearch()
    }, periodInterval)

    //최초 전체검색
    const initialSearch = () => {
        //TODO db 조회
        // const rand = Math.floor(Math.random() * 100)
        // const newData = [{consumerNo: rand, src: 'https://cdn.nbnnews.co.kr/news/photo/201911/343103_390165_529.jpg', nickname: '별블리'+rand}]
        // setData(data.concat(newData))
        // el.current.scrollTop = el.current.scrollHeight - 16;
    }

    //추가조회
    const moreSearch = async (isFirstSearch) => {

        try{

            const beforeData = data ? data : []

            const params = {
                goodsNo: goodsNo,
                orderSeq: beforeData.length <= 0 ? 0  : beforeData[beforeData.length-1].orderSeq //마지막 orderSeq 이후로 조회
            }

            //구매자 조회
            const res = await getOrderConsumers(params)

            //조절된 구매자 조회(fake)
            if (isFirstSearch) {
                const {data: fkOrderList} = await getFkOrderConsumers(params)
                if (fkOrderList && fkOrderList.length) {
                    res.data = res.data.concat(fkOrderList)
                }
            }

            // const orderDetailList = profileInfoList


            // console.log({params, orderInfo: JSON.parse(JSON.stringify(res.data))})

            if (res.data.length > 0) {

                //lastOrderSeqRef.current = res.data

                setData(beforeData.concat(ComUtil.sortNumber(res.data, 'orderSeq', false)))

                const offset = el.current.scrollHeight - 16

                //처음 조회시 애니메이션 없음
                if (beforeData.length <= 0) {
                    el.current.scrollTop = offset;
                }else{
                    el.current.scrollTo({top:offset, behavior: 'smooth'})
                }
            }
        }catch (error) {

        }

    }

    if (!data) {
        return null
    }

    return (
        <Div relative custom={`border-bottom: 1px solid ${color.veryLight};`}>
            {
                periodInterval && (
                    <Div absolute top={10} right={16}>
                        <RotationSpinner>
                            <ImSpinner2 />
                        </RotationSpinner>
                    </Div>
                )
            }
            <Div ref={el} overflow={'auto'} height={100} px={16} py={10} bg={'background'}>
                {
                    data.map(({profileInfo, orderSeq}) =>
                        <Item
                            key={orderSeq}
                            src={ComUtil.getFirstImageSrc(profileInfo.profileImages)}
                            nickname={profileInfo.nickname}
                        />
                    )
                }
            </Div>
        </Div>

    );
};

const colorTransition = keyframes`
    0% {
        color: ${color.dark};
    }   
    50% {
        color: ${color.green};
    }
    100% {
        color: ${color.dark};
    }
  `

const AnimatedText = styled(Div)`
    color: black;
    animation: ${colorTransition} 1s forwards;
`




const Item = React.memo(({src, nickname}) => {
    return(
        <Flex mt={5}>
            <img style={{objectFit: 'cover', borderRadius: '50%', width: 30, height: 30, border: `1px solid ${color.light}`}} src={src || NoProfile} alt={'프로필사진'} />
            <AnimatedText ml={10} lighter fontSize={12}>
                {nickname} 님이 구매에 참여 하셨습니다.
            </AnimatedText>
        </Flex>
    )
})

export default BuyingPeopleCard;
