import React, {useEffect, useState, useRef} from 'react';

import {Button, Div, Divider, Flex, GridColumns, Img, Input, Right, Space} from "~/styledComponents/shared";
import Select from 'react-select'
import {useParams, useRouteMatch} from 'react-router-dom'
import BOARD_STORE from "~/components/shop/community/BoardStore";
import Skeleton from "~/components/common/cards/Skeleton";


import {addBoardWriting, updateBoardWriting} from '~/lib/shopApi'
import {withRouter, Redirect} from 'react-router-dom'
import ComUtil from "~/util/ComUtil";
import {getMyBoard} from "~/lib/shopApi";
import {useRecoilState} from "recoil";

import {consumerState, refreshState} from "~/recoilState";
import Textarea from 'react-textarea-autosize'
import Tag from "~/components/common/hashTag/HashTagInput";
import BackNavigation from "~/components/common/navs/BackNavigation";
import {SingleImageUploader} from "~/components/common";
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import TermsOfUseCheckBox from "~/components/common/termsOfUses/TermsOfUseCheckBox";
import _ from 'lodash'
import {getValue} from "~/styledComponents/Util";
import SearchJjalbot from "~/components/common/search/SearchJjalbot";
import {useModal} from "~/util/useModal";

import {IoMdCloseCircle} from 'react-icons/io'
import {color} from "~/styledComponents/Properties";
import poweredByGiphy from "~/images/icons/poweredBy/giphy.png";
import axios from "axios";
import {Server} from "~/components/Properties";

//아래로 이동.
// const boardOptions = Object.values(BOARD_STORE).map(({boardType, name}) => {
//                 return {
//                     value: boardType,
//                     label: name
//                 }
//         })


// const BoardContainer = ({boardType, content, tags, images, onBoardTypeChange, onTextChange, onTagChange, onImageChange, boardOptions}) => {
//
//
//     return (
//         <>
//             <Div px={16} my={25}>
//                 <Div fontSize={17} mb={15}>주제 선택</Div>
//                 <Select
//                     name={'superRewardStartHH'}
//                     options={boardOptions}
//                     defaultValue={boardOptions.find(option => option.value === boardType)}
//                     value={boardOptions.find(option => option.value === boardType)}
//                     onChange={onBoardTypeChange}
//                     //isDisabled={true}
//                 />
//             </Div>
//             <Divider />
//             <Div px={16} pb={25}>
//
//
//                 <Div my={25}>
//                     <SingleImageUploader images={images} defaultCount={3} isShownMainText={false} onChange={onImageChange} />
//                 </Div>
//
//                 <Div my={25}>
//                     <Div fontSize={17} mb={15}>게시글 내용</Div>
//                     <Div>
//                         <Textarea name={'content'} style={{width: '100%', minHeight: 200, borderRadius: 0}}
//                                   onChange={onTextChange}
//                                   value={content}
//                                   placeholder='내용을 입력해 주세요'/>
//                         {/*<SummernoteEditor onChange={onContentChange} editorHtml={content} />*/}
//                     </Div>
//                 </Div>
//
//                 <Div my={25}>
//                     <Div fontSize={17} mb={15}>#태그</Div>
//                     <Div>
//                         <Tag onChange={onTagChange} tags={tags}/>
//                     </Div>
//                 </Div>
//
//             </Div>
//         </>
//     );
// };

//2차원 배열임
const allDefaultHashTags =  _.flattenDeep(Object.values(BOARD_STORE).map(item => item.defaultHashtags))

const MAX_JJAL_COUNT = 3;
const MAX_CONTENT_LENGTH = 30

const BoardWriting = ({history}) => {
    const abortControllerRef = useRef(new AbortController())

    const [uploading, setUploading] = useState(true)

    const [refresh, setRefresh] = useRecoilState(refreshState)

    const isUpdateMode = useRouteMatch('/community/board/modify')

    const {boardType, writingId} = useParams()

    const [board, setBoard] = useState({
        boardType: boardType,
        // title: '',
        content: '',
        tags: [],
        images: [],
        jjalImages: []
    })

    // const [images, setImages] = useState([])

    const [loading, setLoading] = useState(true)

    const [consumer, setConsumer] = useRecoilState(consumerState)

    //초기값: 생산자게시판 제외(consumer용 List) => didMount후에 생산자게시판 옵션 추가.(async 이슈)
    const [boardOptions, setBoardOptions] = useState( Object.values(BOARD_STORE).filter(({boardType}) => boardType !== 'producer').map(({boardType, name}) => {
        return {
            value: boardType,
            label: name
        }
    }))

    const [agree, setAgree] = useState((board && board.writingId) ? true:false)

    const [modalOpen, setModalOpen, selected, setSelected, setModalState, toggle] = useModal()


    const agreeChange = e => {
        setAgree(e.target.checked)
    }

    useEffect(() => {
        // 수정 모드일 경우 db 조회
        if (isUpdateMode) {
            // writingId가 없을 경우 커뮤니티 홈으로 보내버리기
            if (!writingId) {
                history.replace(`/community`)
                return
            }
            search()
        }else {
            setLoading(false)
        }

        //생산자일 경우 생산자게시판 노출로직.: 전체 List(생산자게시판 포함) boardOption을 consumer state받아서
        // -> 생산자게시판은 글쓰기가 달라서 무조건 제외.
        // if (consumer.producerFlag) {
        //     setBoardOptions(
        //         Object.values(BOARD_STORE).map(({boardType, name}) => {
        //             return {
        //                 value: boardType,
        //                 label: name
        //             }
        //         })
        //     )
        // }

        return(() => {
            abortControllerRef.current.abort()
        })


    }, [])

    const [recommendedTags, setRecommendedTags] = useState([])

    useEffect(() => {

        if (board.boardType) {
            console.log('===============')
            const defaultTagList = BOARD_STORE[board.boardType].defaultHashtags
            const firstTag = [defaultTagList[0]]
            const otherTags = defaultTagList.slice(1, defaultTagList.length)
            const randomSize = defaultTagList.length -1
            const randomTags = _.sampleSize(otherTags, randomSize)
            const randomRecommendedTags = firstTag.concat(randomTags)
            setRecommendedTags(randomRecommendedTags)
        }

    }, [board.boardType])


    const search = async () => {
        try {
            //본인글이 맞는지 체크해서 리턴
            const {data} = await getMyBoard(writingId, abortControllerRef.current.signal)

            if (!data || data.deleted) {
                if (!data)
                    alert('잘못된 접근 입니다.')
                else if (data.deleted)
                    alert('삭제된 게시물입니다.')

                history.goBack()
                return
            }
            if(data && data.writingId){
                setAgree(true);
            }
            setBoard(data)
            setLoading(false)
        }catch (erro){

        }

    }

    const onBoardTypeChange = ({value}) => {



        // const defaultHashtags = BOARD_STORE[value].defaultHashtags
        // const newTags = board.tags


        //일단 디폴트 태그에 포함되는건 모두 삭제
        // allDefaultHashTags.map(tag => {
        //     const index = newTags.indexOf(tag)
        //     //존재하면 삭제
        //     if (index > -1){
        //         newTags.splice(index, 1)
        //     }
        // })

        //태그 추가
        // if (newTags.length <= 0) {
        //     defaultHashtags.map(defTag => {
        //         //보드 태그에 디폴트 태그와 중복되는게 없으면 기본 태그 추가
        //         if (board.tags.indexOf(defTag) === -1) {
        //             newTags.unshift(defTag)
        //         }
        //     })
        // }

        setBoard({
            ...board,
            boardType: value,
            // tags: newTags
        })
    }

    const onImageChange = (images) => {
        setBoard(prev => ({
            ...prev,
            images: images
        }))
    }

    const onTextChange = e => {
        const {name, value} = e.target
        setBoard({
            ...board,
            [name]: value
        })
    }

    const onTagChange = (tags) => {
        setBoard({
            ...board,
            tags: tags
        })
    }

    //글자 길이 (영문:1,한글:1)
    const getLengthMaxChkCount = (message, blank=0) => {
        let totalByte = 0;
        //blank==0 공백 제외
        if (blank===0) {
            // 공백 미포함일 때는, 미리 줄바꿈과 공백을 빈칸으로 처리합니다.
            message = message.replace(/\s+/g,"");
        }
        for (let index = 0, length = message.length; index < length; index++) {
            let currentByte = message.charCodeAt(index);
            const uni_char = escape(currentByte); //유니코드 형식으로 변환
            if(uni_char.length>4){
                // 한글 : 2Byte
                //totalByte += 2;
                totalByte += 1;
            }else{
                // 영문,숫자,특수문자 : 1Byte
                totalByte += 1;
            }
        }
        return totalByte;
    };

    const [saving, setSaving] = useState(false)

    const onSaveClick = async () => {

        try {
            if (ComUtil.isConsumerLoggedIn(consumer)) {

                if (uploading) {
                    alert('이미지 업로드 중입니다. 잠시만 기다려 주세요.')
                    return
                }

                const {boardType, content} = board

                //우리집 밥상, 맛집추천, 우리동네텃밭
                if(boardType === 'recipe' || boardType === 'goodRest' || boardType === 'land'){
                    if(board.images.length == 0){
                        alert('이미지 첨부는 필수 입니다.')
                        return
                    }
                }

                if (!content) {
                    alert('게시글 내용은 필수 입니다.')
                    return
                }

                let totalByte = getLengthMaxChkCount(content, -1);
                if (totalByte < MAX_CONTENT_LENGTH) {
                    alert(`최소 ${MAX_CONTENT_LENGTH}자이상 입력해주세요.`)
                    return;
                }

                if (board.jjalImages.length > MAX_JJAL_COUNT) {
                    alert(`짤은 ${MAX_JJAL_COUNT}개까지 가능 합니다.`)
                    return
                }

                if (!agree) {
                    alert('이용약관에 동의해 주세요.')
                    agreeRef.current.focus()
                    return
                }

                let status;
                let retData;

                //에디터 속의 이미지를 파싱해서 url만 추출
                //const contentImagesUrl = ComUtil.getImagesUrlByHtmlString(board.content)
                //const newBoard = {...board, contentImagesUrl}

                if (isUpdateMode && board.writingId) {
                    //수정
                    setSaving(true)
                    const res = await updateBoardWriting(board, abortControllerRef.current.signal)
                    setSaving(false)

                    if (res.status !== 200) {
                        alert('에러가 발생 하였습니다. 다시 시도해 주세요.')
                        return
                    }

                    status = res.status
                    retData = res.data
                }else{
                    // 등록
                    setSaving(true)
                    const res = await addBoardWriting(board, abortControllerRef.current.signal)
                    setSaving(false)

                    if (res.status !== 200) {
                        alert('에러가 발생 하였습니다. 다시 시도해 주세요.')
                        return
                    }

                    status = res.status
                    retData = res.data
                }

                //5분안에 또 글 쓰기 하면 -1리턴됨: 어뷰징 방지
                if (retData.resCode) {
                    alert(retData.errMsg);
                } else if (status === 200) {
                    //goBack() 에 해당되는 페이지(boardMain.js 라면)에서 강제로 재검색 되도록 함
                    setRefresh(true)
                    history.goBack()
                }else{
                    alert('오류가 발생 하였습니다. 다시 시도해 주세요.')
                }
            }
        }catch (error){

        }
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

    //짤 변경
    const onJjalChange = (params) => {


        //item.images.fixed_width_small.webp
        const images = params.map((item, index) => ({
            imageNo: index,
            imageUrl: item.images.downsized.url,
            imageThumbUrl: item.images.downsized.url,
            imageNm: item.title
        }))

        setBoard(prev => ({...prev, jjalImages: prev.jjalImages.concat(images)}))
        toggle()
    }

    //짤 삭제
    const onDeleteJjal = (index) => {
        const jjalImages =  Object.assign([], board.jjalImages)
        jjalImages.splice(index, 1)
        setBoard(prev => ({...prev, jjalImages: jjalImages}))
    }

    const agreeRef = useRef()

    const contentLength = getLengthMaxChkCount(board.content, -1)

    return (
        <>
            <BackNavigation rightContent={
                <Button fontSize={15} px={10} mr={16} bg={'green'} fg={'white'} onClick={onSaveClick} disabled={saving}>저장</Button>
            }
            >
                {isUpdateMode ? '글수정' : '글쓰기'}
            </BackNavigation>
            {
                loading ?
                    <Skeleton.List count={3} /> :
                    <>

                        <Div bg={'background'} px={16} pt={16}>
                            <Div fontSize={12} mb={16} > 아래 내용에 해당할 경우, 사전 고지 없이 게시글 삭제와 계정 제재가 가해질 수 있음을 알려드립니다. <br/>
                                - 사진 도용, 기타 저작권을 침해하는 내용, 타인의 불쾌감을 유발하는 사진<br/>
                                - 게시판 속성에 맞지 않는 글, 단순 도배성 글, 의미 없는 글(과도한 특수 문자, 자음 사용 등),<br/>
                                - 타인 비방·욕설, 성희롱 및 기타 부적절한 글</Div>
                            <TermsOfUseCheckBox
                                innerRef={agreeRef}
                                checked={writingId ? true : agree}
                                onChange={agreeChange}
                                disabled={writingId ? true : false}
                            />
                        </Div>

                        <Div px={16} my={25}>
                            <Div fontSize={17} mb={15}>주제 선택</Div>
                            <Select
                                name={'superRewardStartHH'}
                                options={boardOptions}
                                defaultValue={boardOptions.find(option => option.value === board.boardType)}
                                value={boardOptions.find(option => option.value === board.boardType)}
                                isSearchable={false}
                                onChange={onBoardTypeChange}
                                //isDisabled={true}
                            />
                            <Div mt={12} fontSize={12}> * {BOARD_STORE[board.boardType].desc} </Div>
                        </Div>
                        <Divider />
                        <Div px={16} py={30} custom={`
                            & > div {
                                margin-bottom: ${getValue(30)};
                            }
                            & > div:last-child{
                                margin: 0;
                            }
                        `}>

                            <GridColumns colGap={0} rowGap={16}>
                                <Div fontSize={17} mb={0}>이미지 첨부</Div>
                                <SingleImageUploader setUploading={setUploading} images={board.images} defaultCount={10} isShownMainText={false} onChange={onImageChange} />
                            </GridColumns>
                            <GridColumns colGap={0} rowGap={16}>
                                <Flex>
                                    <Div fontSize={17}>
                                        게시글 내용 {contentLength < MAX_CONTENT_LENGTH && `(${contentLength}/${MAX_CONTENT_LENGTH})`}
                                    </Div>
                                    <Right onClick={toggle} cursor={1} fg={'green'}>
                                        <u>짤첨부</u>
                                    </Right>
                                </Flex>
                                <Textarea name={'content'}
                                          autocomplete="off"
                                          style={{width: '100%', minHeight: 100, borderRadius: 0}}
                                          onChange={onTextChange}
                                          value={board.content}
                                          placeholder={`내용을 입력해 주세요. (최소 ${MAX_CONTENT_LENGTH}자 이상)`}
                                />

                                {
                                    board.jjalImages.length > 0 && (
                                        <Flex overflow={'auto'}>
                                            {
                                                board.jjalImages.map((image, index) =>
                                                    <Div key={index} relative flexShrink={0} height={112.5} rounded={3} overflow={'hidden'} mr={8}>
                                                        <IoMdCloseCircle
                                                            style={{
                                                                position: 'absolute',
                                                                top: getValue(8),
                                                                right: getValue(8),
                                                                cursor: 'pointer',
                                                                zIndex: 1
                                                            }}
                                                            color={color.veryLight} size={getValue(25)}
                                                            onClick={onDeleteJjal.bind(this, index)}
                                                        />
                                                        <img src={image.imageUrl} alt={image.imageNm} style={{height: '100%'}} />
                                                    </Div>
                                                )
                                            }
                                        </Flex>
                                    )
                                }
                            </GridColumns>
                            <Div pb={200}>
                                <Flex mb={8}>
                                    <Div fontSize={17} flexShrink={0}>#태그</Div>
                                    <Flex fg={'green'} ml={16} flexGrow={1} overflow={'auto'} custom={`
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
                                </Flex>
                                <Div>
                                    <Tag onChange={onTagChange} tags={board.tags}/>
                                </Div>
                            </Div>

                        </Div>
                        <Modal isOpen={modalOpen} title={'짤봇'} scrollable={true} toggle={toggle}>
                            <ModalHeader toggle={toggle}>
                                <Space spaceGap={16}>
                                    <div>짤검색</div>
                                    <Img src={poweredByGiphy} width={122} alt={'powered by GIPHY'}/>
                                </Space>

                            </ModalHeader>
                            <ModalBody style={{padding: 0}}>
                                <SearchJjalbot onChange={onJjalChange}/>
                            </ModalBody>
                        </Modal>
                    </>
            }
        </>
    )



};

export default withRouter(BoardWriting);
