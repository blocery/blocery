import React, {useState, useEffect, Fragment} from 'react'
import {Button, Div, Flex, Link} from "~/styledComponents/shared";
import BackNavigation from "~/components/common/navs/BackNavigation";
import {getProfileByConsumerNo, getProfileReported, profileReport, getProfileBlocked, profileBlock} from "~/lib/shopApi";
import {ProducerProfile, ConsumerProfile} from './index'
import ComUtil from "~/util/ComUtil";
import useLogin from "~/hooks/useLogin";
import ProfileBig from "~/components/common/cards/ProfileBig";
import useDangol from "~/hooks/useDangol";
import {useModal} from "~/util/useModal";
import {withRouter} from "react-router-dom";
import {Modal, ModalBody, ModalHeader} from "reactstrap";
import ReportReasonContent from "~/components/common/contents/ReportReasonContent";
import BlockReasonContent from "~/components/common/contents/BlockReasonContent";

const DangolButton = ({initialValue, producerNo}) => {
    const {dangolFlag, addDangol} = useDangol({initialValue, producerNo})
    return <Button noHover bg={dangolFlag ? 'white' : 'green'} bc={dangolFlag && 'light'} fg={dangolFlag ? 'dark' : 'white'} block py={10} onClick={() => addDangol()}>
        {!dangolFlag ? '+ 단골상점' : '단골취소'}
    </Button>
}

const CommonProfile = (props) => {
    // const {match, history} = props
    const { consumerNo } = ComUtil.getParams(props)
    const {consumer, isServerLoggedIn} = useLogin()
    // const [loginUser, setLoginUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [tabId, setTabId] = useState('1')

    console.log({history: props.history})

    useEffect(() => {
        getProfile();
    }, [tabId])

    // login중인 user 검색
    const search = async () => {
        // const {data} = await getConsumer();
        // setLoginUser(data)
    }

    const getProfile = async () => {
        // const {data} = await getConsumerProfile(consumerNo);
        const {data} = await getProfileByConsumerNo(consumerNo)
        setProfile(data)
    }

    const [isReported, setReported] = useState(false)
    const [isBlocked, setBlocked] = useState(false)

    const [reportModalOpen,  setReportModalState] = useModal()
    const [blockModalOpen,  setBlockModalState] = useModal()

    const [refreshDate, setRefreshDate] = useState()

    const onBlockClick = async (reason) => {
        await profileBlock({targetConsumerNo: consumerNo, reason: reason})
        await searchBlocked()
        blockToggle()

        //구글검수 consumerNo 2개 및 개발용 consumerNo 2개 (gary,lydia)
        if (consumer && (consumer.consumerNo === 98554 || consumer.consumerNo === 900000117 || consumer.consumerNo === 442 || consumer.consumerNo === 40 )) { //구글검수자용 history.back

            console.log('blockClick2 :' + consumerNo)
            props.history.goBack();
        }else {

            //강제 프로필 새로고침 위해서
            setRefreshDate(new Date())
        }
    }

    const onReportClick = async (reason) => {
        await profileReport({targetConsumerNo: consumerNo, reason: reason})
        searchReported()
        reportToggle()

        //강제 프로필 새로고침 위해서
        setRefreshDate(new Date())
    }


    const reportToggle = async () => {
        if (await isServerLoggedIn()) {
            // consumer.consumerNo 숫자로인식, props로 넘어온 consumerNo 문자로 비교를 == 으로 해야함
            if (consumer.consumerNo === parseInt(consumerNo.toString())) {
                alert('자기 자신은 신고 할 수 없습니다.')
                return
            }

            if (isReported) {
                if (window.confirm('신고를 취소 하시겠습니까?')) {
                    await profileReport({targetConsumerNo: consumerNo, reason: '신고취소'})
                    setReported(false)
                    setRefreshDate(new Date())
                }
            }else{
                setReportModalState(!reportModalOpen)
            }
        }
    }

    const blockToggle = async () => {

        if (await isServerLoggedIn()) {
            // consumer.consumerNo 숫자로인식, props로 넘어온 consumerNo 문자로 비교를 == 으로 해야함
            if (consumer.consumerNo === parseInt(consumerNo.toString())) {
                alert('자기 자신은 차단 할 수 없습니다.')
                return
            }

            if (isBlocked) {
                if (window.confirm('차단을 취소 하시겠습니까?')) {
                    await profileBlock({targetConsumerNo: consumerNo, reason: '차단취소'})
                    setBlocked(false)
                    setRefreshDate(new Date())
                }
            }else{
                setBlockModalState(!blockModalOpen)
            }
        }
    }

    useEffect(() => {
        searchReported();
        searchBlocked();
    }, []);


    const searchReported = async () => {
        const {data} = await getProfileReported(consumerNo)
        setReported(data)
    }

    const searchBlocked = async () => {
        const {data} = await getProfileBlocked(consumerNo)
        setBlocked(data)
    }


    if(!profile)
        return null

    return (
        <Fragment>
            <BackNavigation rightContent={
                consumer && consumer.consumerNo !== parseInt(consumerNo.toString()) &&      //본인 프로필에서는 신고/차단 버튼 안나오게
                <Flex>
                    <Div mr={8} cursor={1} doActive bg={'white'} rounded={4} px={10} py={5} fontSize={13} bc={'light'} onClick={reportToggle}>
                        {isReported ? '신고취소' : '신고'}
                    </Div>
                    <Div mr={8} cursor={1} doActive bg={'white'} rounded={4} px={10} py={5} fontSize={13} bc={'light'} onClick={blockToggle}>
                        {isBlocked ? '차단취소' : '차단'}
                    </Div>
                </Flex>
            }>
                프로필
            </BackNavigation>
            <Div px={10}>
                <ProfileBig {...profile} hideGrade={ComUtil.isProducer(consumerNo)} refreshDate={refreshDate}/>
            </Div>
            {
                // 로그인했고 자신의 프로필이 아니고 프로필 화면이 생산자인 경우
                //consumer.consumerNo: undefined ERROR(toString err) (consumer && consumer.consumerNo.toString() !== consumerNo.toString() && ComUtil.isProducer(consumerNo)) &&
                (consumer && consumer.consumerNo != consumerNo && ComUtil.isProducer(consumerNo)) &&
                    <Div px={16} pb={16}>
                        <DangolButton initialValue={false} producerNo={ComUtil.getProducerNoByConsumerNo(consumerNo)} />
                    </Div>
            }

            {
                profile.localfoodFlag && <Link to={`/localStore/${ComUtil.getProducerNoByConsumerNo(consumerNo)}/home`} ml={26} mb={16}><u><b>로컬푸드매장 방문해보기</b></u></Link>
            }

            {
                // 로그인x && 프로필 화면이 생산자인 경우
                (!consumer && ComUtil.isProducer(consumerNo)) &&
                    <Div px={16} pb={16}>
                        <DangolButton initialValue={false} producerNo={ComUtil.getProducerNoByConsumerNo(consumerNo)} />
                    </Div>
            }
            {
                ComUtil.isProducer(consumerNo) ? <ProducerProfile isBlocked={isBlocked} consumerNo={consumerNo} /> : <ConsumerProfile isBlocked={isBlocked} consumerNo={consumerNo} />
            }

            <Modal isOpen={reportModalOpen} centered>
                <ModalHeader toggle={reportToggle}>
                    사용자 신고하기
                </ModalHeader>
                <ModalBody>
                    <ReportReasonContent
                        onReportClick={onReportClick}
                        onClose={reportToggle}/>
                </ModalBody>
            </Modal>

            <Modal isOpen={blockModalOpen} centered>
                <ModalHeader toggle={blockToggle}>
                    사용자 차단하기
                </ModalHeader>
                <ModalBody>
                    <BlockReasonContent
                        onBlockClick={onBlockClick}
                        onClose={blockToggle}/>
                </ModalBody>
            </Modal>

        </Fragment>
    )
}

export default withRouter(CommonProfile)

function HeaderButton({children, active, onClick}) {
    return(
        <Div flexGrow={1} py={10} textAlign={'center'} cursor={1}
             bc={'light'}
             bg={active && 'green'} fg={active && 'white'}
             rounded={4}
             onClick={onClick}
             doActive
        >{children}</Div>
    )
}