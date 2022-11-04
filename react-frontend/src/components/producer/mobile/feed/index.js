import React, { useState, useEffect, useRef } from 'react'
import { SingleImageUploader } from '~/components/common'

import { toast } from 'react-toastify'     //토스트
import { Webview } from '~/lib/webviewApi'
import {addBoardWriting, updateBoardWriting, getMyBoard} from '~/lib/shopApi'
import { getGoodsByGoodsNo } from '~/lib/goodsApi'
import { getLoginUser } from '~/lib/loginApi'
import ComUtil from '~/util/ComUtil'
import { Server } from '~/components/Properties'
import Tag from "~/components/common/hashTag/HashTagInput";
import {Div, Span, Button, Hr, Flex, Space, Textarea, Strong, Right} from "~/styledComponents/shared";

import {color} from "~/styledComponents/Properties";
import {useParams, withRouter} from 'react-router-dom'
import BlocerySpinner from "~/components/common/Spinner/BlocerySpinner";
import BackNavigation from "~/components/common/navs/BackNavigation";
import {Alert, Input, Modal, ModalBody, ModalHeader} from "reactstrap";
import {useModal} from "~/util/useModal";

import GoodsCard from "~/components/common/cards/GoodsCard";
import GoodsSearch from "~/components/producer/mobile/common/GoodsSearch";
import useLogin from "~/hooks/useLogin";
import {BsPinAngle} from "react-icons/bs";
import TermsOfUseCheckBox from "~/components/common/termsOfUses/TermsOfUseCheckBox";
import BOARD_STORE from "~/components/shop/community/BoardStore";
import _ from "lodash";
import {getValue} from "~/styledComponents/Util";
import Checkbox from "~/components/common/checkboxes/Checkbox";

const star = <span className='text-danger'>*</span>

function Feed(props){
    const [uploading, setUploading] = useState(true)
    const {consumer, isServerLoggedIn} = useLogin()

    //등록 및 수정 : writingId
    const {writingId} = useParams()
    const [modalOpen, , selected, setSelected, , toggle] = useModal()

    const [tabId, setTabId] = useState('1');
    const [step, setStep] = useState(100);
    const [goods, setGoods] = useState(null)
    const agreeRef = useRef()
    const [agree, setAgree] = useState(false)

    const [board, setBoard] = useState({
        writingId:0,
        boardType: 'producer',
        goodsNo:0,
        stepIndex:0,
        stepTitle:'',
        content:'',
        tags:[],
        images:[],
        topFix:false
    })

    const [loading, setLoading] = useState(false)

    const inputStepEl = useRef(null)
    const inputContentEl = useRef(null)

    const [recommendedTags, setRecommendedTags] = useState([])


    useEffect(() => {

        const defaultTagList = BOARD_STORE['producer'].defaultHashtags
        // const firstTag = [defaultTagList[0]]
        // const otherTags = defaultTagList.slice(1, defaultTagList.length)
        // const randomSize = defaultTagList.length -1
        // const randomTags = _.sampleSize(otherTags, randomSize)
        // const randomRecommendedTags = firstTag.concat(randomTags)
        setRecommendedTags(defaultTagList)

        search()
    }, [writingId])

    useEffect(() => {
        searchGoods(board.goodsNo);
    }, [board.goodsNo])

    //feed (Board) 조회
    const search = async () => {
        console.log(consumer)

        if(writingId) {
            //본인글이 맞는지 체크해서 리턴
            const {data} = await getMyBoard(writingId)
            if (!data || data.deleted) {
                if (!data)
                    notify('잘못된 접근 입니다.',toast.warn)
                else if (data.deleted)
                    notify('삭제된 게시물입니다.',toast.error)

                props.history.goBack()
                return
            }
            console.log("writingId===",data)
            if(data && data.writingId){
                setAgree(true);
            }
            setBoard(data);
        }
    }

    //상품 조회
    const searchGoods = async (goodsNo) => {
        const {data} = await getGoodsByGoodsNo(goodsNo)
        if(data && data.dealGoods) {
            setTabId('2');
        }
        setGoods(data)
    }

    const onModalToggle = () => {
        //isDealGoods 기본값 false
        setSelected(tabId === '2'?true:false)
        toggle()
    }
    const onModalChange = (data) => {
        setBoard({
            ...board,
            goodsNo: data.goodsNo
        });
        toggle();
    }
    const onModalClose = () => {
        toggle()
    }
    const onStepChange = (stepVal) => {
        setStep(stepVal)
        setBoard({
            ...board,
            stepIndex: stepVal
        });
    }
    const onGoodsDel = () => {
        setBoard({
            ...board,
            goodsNo: 0
        });
    }

    const onHeaderClick = (pTabId) => {
        setTabId(pTabId);
    }

    const onStepTitleChange = (e) => {
        setBoard({
            ...board,
            stepTitle: e.target.value
        })
    }
    const onFeedContentChange = (e) => {
        setBoard({
            ...board,
            content: e.target.value
        })
    }
    const onFeedImageChange = (images) => {
        setBoard(prev => ({
            ...prev,
            images: images
        }))
    }
    const onFeedTagChange = (tags) => {
        setBoard({
            ...board,
            tags: tags
        })
    }

    const save = async () => {

        if(await isServerLoggedIn()){

            if (uploading) {
                notify(<div>이미지 업로드 중입니다.<br/>잠시만 기다려 주세요.</div>, toast.warn)
                return
            }

            console.log({saveData: board})
            const boardData = Object.assign({}, board);

            if(tabId === '1'){
                // if(goods){
                //     if(!goods.dealGoods) {
                //         notify('일반상품이 아닙니다.', toast.warn)
                //         return
                //     }
                // }
                boardData.stepIndex = 0;
            }
            if(tabId === '2'){
                if(!goods){
                    notify('상품을 선택해 주십시오.', toast.warn)
                    return
                }
                if(goods && !goods.dealGoods){
                    notify('계약재배상품이 아닙니다.', toast.warn)
                    return
                }
                boardData.stepIndex = step;
                boardData.goodsNo = goods.goodsNo;
            }

            if(!boardData.images || boardData.images <= 0){
                notify('사진을 선택해 주세요', toast.warn)
                return
            }
            if(tabId === '2'){
                if(!boardData.stepTitle || boardData.stepTitle.length <= 0) {
                    notify('제목을 작성해 주세요', toast.warn)
                    inputStepEl.current.focus()
                    return
                }
            }
            if(!boardData.content || boardData.content.length <= 0) {
                notify('내용을 작성해 주세요', toast.warn)
                inputContentEl.current.focus()
                return
            }
            if(!boardData.tags || boardData.tags.length <= 0){
                notify('태그을 입력해 주세요', toast.warn)
                return
            }

            if (!agree) {
                notify('이용약관에 동의해 주세요.', toast.warn)
                agreeRef.current.focus()
                return
            }


            setLoading(true)
            let status;
            let retData;
            if(boardData.writingId > 0){
                const response = await updateBoardWriting(boardData)
                status = response.status
                retData = response.data
            }
            else {
                const response = await addBoardWriting(boardData)
                status = response.status
                retData = response.data
            }
            if (retData.resCode != 0) {
                alert(retData.errMsg);
                // notify(retData.errMsg, toast.error)
            } else if(status !== 200){
                notify('다시 시도해 주세요', toast.error)
                setLoading(false)
                return
            }
            setLoading(false)
            props.history.goBack()
        }

    }

    const notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
            //className: ''     //클래스를 넣어도 됩니다
        })
    }

    const agreeChange = e => {
        setAgree(e.target.checked)
    }

    //추천태그 추가
    const addRecommendedTag = (tag) => {
        if (!board.tags.includes(tag)) {
            setBoard({
                ...board,
                tags: board.tags.concat(tag)
            })
        }
    }

    const onTopFixChange = e => {
        setBoard({
            ...board,
            topFix: e.target.checked
        })
    }

    return(
        <Div>
            {
                loading && <BlocerySpinner />
            }
            <BackNavigation>농가소식/생산이력 등록</BackNavigation>

            <Flex bg={'white'} px={16} py={16} custom={`
                    & > div:nth-child(1){
                        border-right: 0;
                        border-top-right-radius: 0;
                        border-bottom-right-radius: 0;
                    }
                    & > div:nth-child(2){
                        border-left: 0;
                        border-top-left-radius: 0;
                        border-bottom-left-radius: 0;
                    }
                `}>
                <HeaderButton active={tabId === '1'} onClick={onHeaderClick.bind(this, '1')} disabled={writingId > 0 ? true:false}>농가소식</HeaderButton>
                <HeaderButton active={tabId === '2'} onClick={onHeaderClick.bind(this, '2')} disabled={writingId > 0 ? true:false}>생산이력</HeaderButton>
            </Flex>

            <Div bg={'light'} fontSize={13} p={16} lineHeight={'1.6'}>
                {
                    tabId === '1' &&
                    <>
                        일상생활이야기, 일기, 농장 소식 등에 다양한 주제로 피드를 작성할 수 있어요.<br/>
                        단, <Strong fg={'danger'}><u>제품홍보를 위한 글이나 상품 이미지</u></Strong>가 있을 경우 <Strong fg={'danger'}><u>자유게시판을 이용</u></Strong>해 주세요.<br/>
                        입력한 피드는 내프로필, 생산자활동, '홈>라운지'등에 자동 노출됩니다.<br/>
                        등록된 상품 선택 시 상품정보와 바로가기 링크가 함께 보여집니다.
                    </>
                }
                {
                    tabId === '2' &&
                    <>
                        진행중인 계약재배 상품이 있는 경우에만 등록이 가능합니다.<br/>
                        계약재배 상품 선택 후 현재 진행되는 이력을 정확하게 기록해 주세요!<br/>
                        기록 후 정보는 내프로필과 계약재배 상품의 "이력추적"메뉴에서 확인해 주세요.
                    </>
                }
            </Div>
            <Div //px={16}
                pb={16}>
                <Div mt={30}>
                    <Div px={16}>
                        <Div fw={500} mb={8}>
                            상품 {tabId === '2' && star}
                        </Div>
                        <Flex>
                            <Div>
                                <Button p={0} width={100} height={35} textAlign={'center'} rounded={20} bg={'#8a8a8a'} fg={'white'} lineHeight={35}
                                        onClick={onModalToggle}>선택</Button>
                                {tabId === '1' && <Span ml={5}>피드백 상품을 연결할 경우에만 선택</Span>}
                                {tabId === '2' && <Span ml={5}>생산이력을 기록할 계약재배 상품 선택</Span>}
                            </Div>
                            {
                                consumer.consumerNo === 900000125 &&
                                <Right>
                                    <Checkbox onChange={onTopFixChange} checked={board.topFix}>상단고정</Checkbox>
                                </Right>
                            }
                        </Flex>
                    </Div>
                    <Flex pr={16}>
                        {
                            goods && <Div flexGrow={1}><GoodsCard goods={goods} movePage={false} onClick={() => null} /></Div>
                        }
                        {
                            goods && <Div flexShrink={0}><Button bg={'danger'} fg={'white'} onClick={onGoodsDel}>삭제</Button></Div>
                        }
                    </Flex>
                    {
                        goods && goods.reviewGoodsNo != goods.goodsNo && //복사된 상품의 경우 안내 메시지
                        <Div ml={30} fg={'primary'} fontSize={10}> *복사된 상품이므로, 원본상품에 생산이력이 통합 관리됩니다.</Div>
                    }


                </Div>

                <Div px={16}>
                    {
                        tabId === '2' &&
                        <Div mt={30}>
                            <Div fw={500} mb={8}>단계 {star}</Div>
                            <Div>
                                <input type={'radio'} id={'step1'} name={'step'} checked={step === 100 && true} onChange={onStepChange.bind(this, 100)} /><label htmlFor="step1" className='pl-1 mr-3 f5'> 생산 | 대부분의 생산이력 기록시 선택</label>
                            </Div>
                            <Div>
                                <input type={'radio'} id={'step2'} name={'step'} checked={step === 200 && true} onChange={onStepChange.bind(this, 200)} /><label htmlFor="step2" className='pl-1 mr-3 f5'> 포장 | 생산 이후 포장작업 기록시 선택</label>
                            </Div>
                            <Div>
                                <input type={'radio'} id={'step3'} name={'step'} checked={step === 300 && true} onChange={onStepChange.bind(this, 300)} /><label htmlFor="step3" className='pl-1 mr-3 f5'> 발송 | 실제 상품 발송 후 관련 내용을 기록시 선택</label>
                            </Div>
                        </Div>
                    }
                    <Div mt={30}>
                        <Div fw={500} mb={8}>사진 {star}</Div>
                        <SingleImageUploader setUploading={setUploading} images={board.images} defaultCount={5} isShownMainText={false} onChange={onFeedImageChange} />
                    </Div>
                    {
                        tabId === '2' &&
                        <Div mt={30}>
                            <Div fw={500} mb={8}>작업명 {star}</Div>
                            <Input ref={inputStepEl}  type={'text'}
                                   autocomplete="off"
                                   name='stepTitle'
                                   style={{
                                       width:'100%',
                                       borderColor: `${color.light}!important`,
                                       borderRadius: '3px'
                                   }}
                                   maxLength="10"
                                   placeholder={'작업명을 입력해 주세요(10자내외)'}
                                   value={board.stepTitle}
                                   onChange={onStepTitleChange} />
                        </Div>
                    }
                    <Div mt={30}>
                        <Div fw={500} mb={8}>작업 내용 {star}</Div>
                        <Textarea
                            style={{
                                width: '100%', minHeight: 100,
                                borderColor: `${color.light}!important`,
                                borderRadius: '3px'
                            }}
                            autocomplete="off"
                            className={'border-info'}
                            onChange={onFeedContentChange}
                            inputRef={inputContentEl}
                            value={board.content}
                            placeholder='작업 내용을 입력해 주세요.'
                        />
                    </Div>
                    <Div my={30}>
                        <Div fw={500} mb={8}>#태그 {star}</Div>
                        <Flex fg={'green'} flexGrow={1} overflow={'auto'} custom={`
                                        & > span {
                                            margin-right: 10px;
                                            text-decoration: underline;
                                            cursor: pointer;
                                            font-size: ${getValue(13)};
                                            flex-shrink: 0;
                                            padding: 4px 0;
                                        }
                                    `}
                        >
                            {recommendedTags.map(tag =>
                                <span onClick={addRecommendedTag.bind(this, tag)}>#{tag}</span>)}
                        </Flex>
                        <Tag tags={board.tags} placeHolder={'태그를 입력해 주세요.(최대30개)'} onChange={onFeedTagChange}/>
                    </Div>


                    <Div bg={'background'} px={16} pt={16}>
                        <Div fontSize={12} mb={16} >타인사진도용, 불쾌감있는사진 등 기타 저작권에 위배되는 내용 포함등 UGC 정책에 의거해 관리자 검토 후 내부 정책에 따른 조치가 취해질 수 있습니다.</Div>
                        <TermsOfUseCheckBox
                            innerRef={agreeRef}
                            checked={writingId ? true : agree}
                            onChange={agreeChange}
                            disabled={writingId ? true : false}
                        />
                    </Div>


                    {/*<Space mt={100} px={16} py={8} fontSize={12} spaceGap={8} bg={'background'}>*/}
                    {/*    */}
                    {/*    <div>*/}
                    {/*        {'타인사진도용, 불쾌감있는사진 등 기타 저작권에 위배되는 내용 포함등 UGC 정책에 의거해 관리자 검토 후 내부 정책에 의거 조치가 될 수 있습니다.'}*/}
                    {/*    </div>*/}
                    {/*</Space>*/}
                    <Button block bg={'green'} fg={'white'} py={15} onClick={save}>
                        {writingId > 0 ?'수정':'등록'}
                    </Button>
                </Div>
            </Div>
            <Modal isOpen={modalOpen} toggle={toggle} size={'lg'}>
                <ModalHeader toggle={toggle}>상품검색</ModalHeader>
                <ModalBody style={{padding: 0}}>
                    {
                        modalOpen && <GoodsSearch isDealGoods={selected} onChange={onModalChange} onClose={onModalClose}/>
                    }
                </ModalBody>
            </Modal>
        </Div>
    )
}
const HeaderButton = ({children, active, onClick, disabled}) => {
    return(
        <Div flexGrow={1} py={10}
             textAlign={'center'} cursor={1}
             fg={active ? 'black':'secondary'}
             custom={`
                border-bottom: 2px solid ${active ? color.dark : color.white};
             `}
            // style={{borderBottom:active?'solid':''}}
             onClick={disabled ? null:onClick}
        >{children}</Div>
    )
}
export default withRouter(Feed)