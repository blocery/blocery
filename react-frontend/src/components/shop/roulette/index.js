import React, {useEffect, useState} from 'react';
import styled, {css, keyframes} from 'styled-components'
import {color} from "~/styledComponents/Properties";
import {Button, Div, Flex, GridColumns, Img, Span} from "~/styledComponents/shared";
import ComUtil from "~/util/ComUtil";
import {IoDiceSharp} from 'react-icons/io5'
import useLogin from "~/hooks/useLogin";
import {getMyRoulettePoint, getRouletteManage, getTodayRouletteAttend, raffleTodayRoulette} from "~/lib/shopApi";
import Skeleton from "~/components/common/cards/Skeleton";
import moment from 'moment-timezone'
import {withRouter} from 'react-router-dom'
import {Collapse} from "reactstrap";
import {IoIosArrowDown, IoIosArrowUp} from 'react-icons/io'
import roulette_coinBg from '~/images/icons/roulette/roulette_coinBg.png'
import roulette_title from '~/images/icons/roulette/roulette_title.png'
import coin_front from '~/images/icons/roulette/coin_front.png'
import roulette_arrow from '~/images/icons/roulette/roulette_arrow.png'

import circle4 from '~/images/icons/roulette/roulette_circle_4.png'
import circle5 from '~/images/icons/roulette/roulette_circle_5.png'
import circle6 from '~/images/icons/roulette/roulette_circle_6.png'
import circle7 from '~/images/icons/roulette/roulette_circle_7.png'
import circle8 from '~/images/icons/roulette/roulette_circle_8.png'

import BackNavigation from "~/components/common/navs/BackNavigation";
import {Bold} from "~/styledComponents/ShopBlyLayouts";
import {toast} from "react-toastify";
import {Server} from "~/components/Properties";

const circleStore = {
    4: circle4,
    5: circle5,
    6: circle6,
    7: circle7,
    8: circle8,
}

const rotation = (rotate) => keyframes`
    0% {
        transform: rotate(0deg);
    }   
    100% {
        transform: rotate(${rotate}deg);
        -ms-transform: rotate(${rotate}deg);
        -webkit-transform: rotate(${rotate}deg);
        -moz-transform: rotate(${rotate}deg);
        -o-transform: rotate(${rotate}deg);        
    }
`

const rotationAnimation = css`
  animation: ${props => rotation(props.rotate)} 7s ease-in-out forwards;  
`

const RouletteBox = styled(Div)`
  ${props => props.rotate && rotationAnimation};    
  // box-shadow: 
  //     0 0 0 2px ${color.secondary},
  //     0 0 0 15px ${color.danger};
  
`

const arrowRotate = () => {

    let str;
    let toggle = false
    for (let i = -2.5; i<100; i++) {
        i = i + 2.5
        toggle = !toggle
        let degree;
        if (i <= 20) {
            degree = -40
        }else if (i <= 80) {
            degree = -50
        }else{
            degree = - 40
        }

        str += `
            ${i}% {
                transform: rotate(${toggle ? 0 : degree}deg);
                -ms-transform: rotate(${toggle ? 0 : degree}deg);
                -webkit-transform: rotate(${toggle ? 0 : degree}deg);
                -moz-transform: rotate(${toggle ? 0 : degree}deg);
                -o-transform: rotate(${toggle ? 0 : degree}deg);
            }
        `
    }

    return keyframes`${str}`
}

const arrowAnimation = css`
  transform-origin: 12px 12px;
  animation: ${arrowRotate()} 7s ease-in-out forwards;  
`

const Arrow = styled(Div)`
    ${props => props.rotate && arrowAnimation}  
`

const RouletteItem = styled(Div)`    
    height: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: absolute;    
    z-index: 1;
    top: 0;
    left: 50%;
    transform-origin: bottom;    
    transform: translateX(-50%) rotate(${props => props.degree}deg);
`

const RouletteLine = styled(Div)`     
     position: absolute;
     width: 1px;
     height: 50%;
     left: 50%;
     background: ${color.secondary};
     transform-origin: bottom;
     transform: translateX(-50%) rotate(${props => props.degree}deg);
`

const spinCircle = keyframes`
    0% {}    
    100% {transform: rotateY(360deg);}
`
const spinCircleCss = css`
    animation: ${spinCircle} 0.4s ease-in-out forwards;
    animation-delay: ${props => props.delay};
`
const Circle = styled(Flex)`
    transform-style: preserve-3d;
    ${props => props.rotate && spinCircleCss};
`

const Stamp = ({index, day, point, type, count, etc}) =>
    <Div custom={'perspective: 1000px;'}>
        <Circle flexDirection={'column'} rotate={day ? true : false} delay={`${index / 7}s`}>
            <Flex flexDirection={'column'} justifyContent={'center'} m={'0 auto'} minWidth={85} minHeight={85} relative
                  rounded={'50%'}
                  bc={day ? 'danger' : 'dark'}
                  custom={`
                        box-shadow: 0 0 0 2px white, 0 0 0 6px ${day ? color.danger : color.dark};
                  `}
                  fg={day ? 'danger' : 'dark'}
                  bw={2}
            >

                <Div bold>출석 {index}회</Div>
                <Div bold fontSize={16} lineHeight={16}>{point ? point + 'P' : '?'}</Div>
                {
                    index === count &&<Div absolute bottom={-8} width={'max-content'} rounded={20} py={4} px={12} fontSize={11} bg={'danger'} fg={'white'}>{type === 'coupon' ? `₩${etc}쿠폰` : `${etc}BLY`}</Div>
                }
            </Flex>

            <Div mt={10} fontSize={12} fg={'dark'}>
                {day ? ComUtil.intToDateString(day) : null}
            </Div>
        </Circle>
    </Div>

const Roulette = ({history}) => {

    const login = useLogin()

    const notify = (msg, toastFunc, autoClose = 5000) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_CENTER,
            autoClose: autoClose
        })
    }

    //관리자가 설정한 룰렛 정보
    const [rouletteManage, setRouletteManage] = useState()
    //해당 월의 일자수
    const [daysCount, setDaysCount] = useState()
    //내가찍은 출석 리스트
    const [myPointList, setMyPointList] = useState()

    const [rotate, setRotate] = useState(0)
    //const [finished, setFinished] = useState()
    const [rotating, setRotating] = useState(false)


    useEffect(() => {
        async function fetch() {
            await getRouletteInfo()
            await setMyRoulettePoint()
        }
        fetch()
    }, [])

    useEffect(() => {
        // console.log(login)
        if (login.consumer)
            setMyRoulettePoint()

    }, [login.consumer])

    const [sumPoint, setSumPoint] = useState(0)


    useEffect(() => {
        if (myPointList) {
            let point = 0
            myPointList.map(item => point = point + item.roulettePoint)
            setSumPoint(point)
        }
    }, [myPointList])

    const getRouletteInfo = async () => {
        //룰렛정보 DB조회
        const {data} = await getRouletteManage()

        // console.log({rouletteManage:data})

        if (!data) {
            //룰렛정보가 없을경우
            notify(<div>룰렛 출석체크 <br/>이벤트는 마감되었습니다.</div>, toast.info);
            history.goBack()
            return
        }

        setRouletteManage(data)

        const count = moment(data.yyyymm, 'YYYYMM').daysInMonth()

        //월 몇건인지 세팅
        setDaysCount(count)
    }

    //테스트용
    // const onClick = () => {
    //     //TODO Back-end 에서 리턴된 룰렛번호
    //     const num = 3 //몇번째 룰렛인지
    //
    //     setRotationDegree(num)
    // }

    const setMyRoulettePoint = async () => {
        const {data} = await getMyRoulettePoint()
        // console.log({data})
        if (data) {
            setMyPointList(data)
        }else{
            setMyPointList([])
        }

    }

    const getRotationDegree = (rouletteNumber) => {
        const basicDegree = 360 * 20
        //보다 극적인 룰렛 기울기를 위해 추가

        let additionalDegree = Math.floor(Math.random() * getPieceOfDegree())
        if (additionalDegree > 0) {
            additionalDegree = additionalDegree / 2
        }
        const plusMinus = Math.floor(Math.random()*2) === 0 ? -1 : 1
        // const rotationDegree = (basicDegree - (rouletteNumber * getPieceOfDegree())) + (plusMinus * additionalDegree)
        const rotationDegree = basicDegree - ((rouletteNumber * getPieceOfDegree()) + (plusMinus * additionalDegree))
        return rotationDegree
    }

    //룰렛 한칸 각도
    const getPieceOfDegree = () => 360 / rouletteManage.items.length

    const onClick = async () => {

        //모바일앱 에서만 가능한 서비스
        if (ComUtil.checkAndMoveDownloadAppPage()) {
            if (await login.isServerLoggedIn()) {

                const status = await getStatus()

                //백엔드 세션이 없을경우
                if (status === -1) {
                    login.openLoginModal()
                }
                //이미 참여 했을 경우
                else if(status === 1) {
                    notify(<div>오늘 이미 참여 하셨습니다.<br/>내일 다시 참여해주세요!</div>, toast.info);
                    return
                }else{

                    //룰렛 돌리기 전 최신 데이터 조회
                    await getRouletteInfo()
                    await getMyRoulettePoint()

                    // 룰렛 참여
                    // 미로그인, 이미참여 : -1
                    // 정상 : 0 ~ 7 번 (룰렛번호)
                    const {data: rouletteNo} = await raffleTodayRoulette()

                    if (rouletteNo === -1) {
                        notify(<div>오늘 이미 참여 하셨습니다.<br/>내일 다시 참여해주세요!</div>, toast.info);
                        return
                    }else {
                        // console.log('당첨번호: '+rouletteNo)
                        setRotating(true)
                        setRotate(getRotationDegree(rouletteNo))
                        setTimeout(async () => {
                            //룰렛이 멈췄을대 최신 데이터 한번 더 조회(달이 넘어가는 케이스 방지위해서)
                            await getRouletteInfo()
                            await setMyRoulettePoint()
                            setRotating(false)
                            const mPoint = rouletteManage.items[rouletteNo].point;
                            let msg = <div>짝짝짝! {mPoint}P 당첨!</div>;
                            if(mPoint == 300){
                                msg = <div>짝짝짝! {mPoint}P 당첨! 🎉🎉🎉<br/> 1등 행운! 복권이라도 사세요!</div>;
                            } else if(mPoint == 100){
                                msg = <div>짝짝짝! {mPoint}P 당첨! 🎉🎉 <br/> 2등 행운! 괜찮은 점수입니다!</div>;
                            } else if(mPoint == 70){
                                msg = <div>짝짝짝! {mPoint}P 당첨! 🎉 <br/> 3등 행운! 그래도 3등이에요!</div>;
                            } else if(mPoint == 50){
                                msg = <div>짝짝짝! {mPoint}P 당첨! <br/> 4등이 어디에요!</div>;
                            } else if(mPoint == 10){
                                msg = <div>짝짝짝! {mPoint}P 당첨! <br/> 다음기회에 1등~4등 도전하세요~</div>;
                            } else if(mPoint == 5){
                                msg = <div>짝짝짝! {mPoint}P 당첨! <br/> 1점보다 높습니다...</div>;
                            } else if(mPoint == 1){
                                msg = <div>짝짝짝! {mPoint}P 당첨! <br/> ㅠㅠ 낙심하지 마세요~ 다음기회 도전!</div>;
                            }
                            notify(msg, toast.success, 10000);
                        }, 7000)
                    }
                }
            }
        }
    }

    const getStatus = async () => {
        // 오늘 룰렛에 이미 참여했는지 여부. -1 미로그인, 0 참여가능, 1 참여불가
        const {data} = await getTodayRouletteAttend()
        return data

        // const isFinished = false
        // setFinished(isFinished)
        // return isFinished
    }

    return (
        <Div>
            <BackNavigation>{rouletteManage ? rouletteManage.title : '...'}</BackNavigation>
            {/*<BackNavigation>매일매일 룰렛</BackNavigation>*/}
            {
                (rouletteManage && rouletteManage.rouletteInfoImages && rouletteManage.rouletteInfoImages.length > 0) && rouletteManage.rouletteInfoImages.map(image =>
                    <img style={{width:'100%'}} src={Server.getImageURL() + image.imageUrl} alt={'이번달 룰렛 안내'}/>
                )
            }
            {/* 전체 녹색 라이팅 배경 */}
            <Div
                // bg={'background'}
                // custom={`background: url(${lightBg}) no-repeat; background-size: contain;`}
            >
                {/* 상단 코인 배경 */}
                <Div custom={`background: url(${roulette_coinBg}) no-repeat; background-size: contain;`}>

                    <Flex justifyContent={'center'} py={40}>
                        <Img src={roulette_title} width={246} alt={'룰렛 타이틀 이미지'} />
                    </Flex>


                    {
                        (!rouletteManage) ? <Skeleton.List count={1} /> : (
                            <>


                                <Flex justifyContent={'center'}>

                                    <Div relative rounded={'50%'}
                                        // bc={'green'}
                                        // bw={10}
                                         custom={`box-shadow: 2px 8px 17px rgb(0 0 0 / 22%);`}
                                         width={'86vmin'} height={'86vmin'}
                                         maxWidth={500}
                                         maxHeight={500}
                                         minWidth={300}
                                         minHeight={300}
                                    >
                                        <Div absolute top={-17} left={'50%'} xCenter zIndex={1}>
                                            <Arrow width={24} rotate={rotate}>
                                                <Img src={roulette_arrow} alt={''} />
                                            </Arrow>
                                        </Div>
                                        <Div relative width={'100%'} height={'100%'} custom={`overflow: hidden;`}>
                                            <Flex absolute top={'50%'} left={'50%'} center zIndex={2} width={'26%'} height={'26%'}>
                                                <Button block height={'100%'} onClick={onClick} bg={'green'} fg={'white'} rounded={'50%'}
                                                        disabled={rotating}
                                                        custom={`
                                                    box-shadow: 2px 2px 8px rgba(0,0,0,0.3);
                                                `}
                                                >
                                                    {
                                                        rotating ? <IoDiceSharp size={40} /> : (
                                                            <Flex justifyContent={'center'} flexDirection={'column'}>
                                                                <Div fontSize={20} bold>Start</Div>
                                                            </Flex>
                                                        )
                                                    }
                                                </Button>
                                            </Flex>
                                            <RouletteBox
                                                bg={'white'}
                                                // m={'0 auto'}
                                                width={'100%'} height={'100%'} rounded={'50%'} rotate={rotate} relative>
                                                {
                                                    rouletteManage.items.map(({point, text}, index) => {
                                                        const pieceOfDegree = getPieceOfDegree()
                                                        // const lineDegree = (pieceOfDegree * index) - (pieceOfDegree / 2) // (120 * 1) - 60
                                                        return(
                                                            <RouletteItem key={`rouletteItem${index}`}
                                                                          pb={'10%'}
                                                                          degree={index * getPieceOfDegree()}>
                                                                <Div fw={300} fontSize={14} lineHeight={'1'} fg={'dark'}>{text}</Div>
                                                                <Bold fontSize={25} lineHeight={'1'} my={5} fg={'green'}>{point}</Bold>
                                                                <Flex justifyContent={'center'} rounded={'50%'}
                                                                      bg={'white'}
                                                                      fg={'darkBlack'}
                                                                      bc={'darkBlack'}
                                                                      pt={4}
                                                                      width={26} height={26} bold fontSize={18} lineHeight={26} >
                                                                    P
                                                                </Flex>
                                                            </RouletteItem>
                                                        )
                                                    })
                                                }
                                                <Img src={circleStore[rouletteManage.items.length]} alt={'roullete'} />
                                            </RouletteBox>
                                        </Div>
                                    </Div>
                                </Flex>
                                <Div mt={-35} zIndex={2}>
                                    <Img src={coin_front} alt={'금화 정면'} />
                                </Div>
                            </>
                        )
                    }

                    {
                        (rouletteManage && rouletteManage.content) && (
                            <Div mt={20}
                                 dangerouslySetInnerHTML={{__html: rouletteManage.content}}
                            />
                        )
                    }

                    {
                        (!daysCount || !myPointList) ? <Skeleton.List count={1} /> : (
                            <>
                                <Div bg={'white'} py={30}>
                                    <GridColumns repeat={2} colGap={0} rowGap={0}>
                                        <Div textAlign={'center'}>
                                            <Div fontSize={17} display={'inline-block'} px={12} py={4} bg={'black'} fg={'white'} rounded={25}>누적 참여 횟수</Div>
                                            <Div fontSize={28} mt={5}><b>{myPointList.length}회</b></Div>
                                        </Div>
                                        <Div textAlign={'center'}>
                                            <Div fontSize={17} display={'inline-block'} px={12} py={4} bg={'black'} fg={'white'} rounded={25}>누적 포인트</Div>
                                            <Div fontSize={28} mt={5}><b>{ComUtil.addCommas(sumPoint)}P</b></Div>
                                        </Div>
                                    </GridColumns>
                                    <Div px={16} mt={30} bg={'white'} rousnded={4}>
                                        <GridColumns repeat={3} colGap={0} rowGap={19}>
                                            {
                                                Array.from({length: daysCount}).map((_, index ) => {
                                                    const dayCount = index + 1

                                                    const reward = rouletteManage.rewards.find(reward => reward.count === dayCount)

                                                    const {type, count, refNo, etc} = reward || {type: null, count: null, refNo: null, etc: null}

                                                    const {day, roulettePoint} = myPointList[index] ? myPointList[index] : {day: '', roulettePoint: ''}
                                                    return <Stamp key={`rouletteItem${index}`} index={dayCount} day={day} point={roulettePoint} type={type} count={count} refNo={refNo} etc={etc}/>
                                                })
                                            }
                                        </GridColumns>
                                    </Div>
                                </Div>
                            </>
                        )
                    }

                </Div>
            </Div>
            {/* 꼭 확인하세요! */}
            {/*<RouletteInfo content={rouletteManage && rouletteManage.content} />*/}

            <Div px={16} py={25} bg={'background'}>
                <Div fontSize={14} lineHeight={22}>
                    <Flex dot alignItems={'flex-start'}><Div>룰렛 참여 출석은 매월 갱신 됩니다.</Div></Flex>
                    <Flex dot alignItems={'flex-start'}><Div>룰렛 이벤트는 '샵블리'앱에서만 참여 가능합니다.</Div></Flex>
                    <Flex dot alignItems={'flex-start'}><Div>룰렛은 1일 1회 참여 가능합니다.</Div></Flex>
                    <Flex dot alignItems={'flex-start'}><Div>룰렛은 모두 랜덤으로 당첨되어 지급이 됩니다.</Div></Flex>
                    <Flex dot alignItems={'flex-start'}><Div>룰렛 참여 시 포인트로 지급됩니다.(매일 자정 일괄 지급)</Div></Flex>
                    <Flex dot alignItems={'flex-start'}><Div>계속해서 참여하는 경우 스템프에 정해진 회차에 해당되는 선물(쿠폰, 적립금(BLY) 등)을 추가로 받을 수 있습니다.(즉시 지급)</Div></Flex>
                    <Flex dot alignItems={'flex-start'}><Div>포인트 획득 내역은 '마이페이지 > 포인트' 메뉴에서 확인 가능합니다.</Div></Flex>
                    <Flex dot alignItems={'flex-start'}><Div>본 이벤트는 당사의 사정에 의하여 변경·중단될 수 있습니다.</Div></Flex>
                </Div>
            </Div>

        </Div>
    );
};

export default withRouter(Roulette);


const RouletteInfo = ({content}) => {

    const [isOpen, setOpen] = useState(false)

    if (!content) return null

    const toggle = () => setOpen(!isOpen)

    return(
        <Flex p={16} py={25} flexDirection={'column'} justifyContent={'center'} bg={'white'}>
            <Button
                bc={'secondary'}
                bg={'white'} bw={2} px={14} py={8} rounded={20} onClick={toggle}>꼭 확인하세요! {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}  </Button>
            <Collapse isOpen={isOpen} >
                <Div bg={'veryLight'} bc={'light'} p={16} mt={20} rounded={5} dangerouslySetInnerHTML={{
                    __html: content
                }} />
            </Collapse>
        </Flex>
    )
}

