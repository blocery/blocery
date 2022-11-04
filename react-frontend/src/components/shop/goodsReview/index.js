import React, { useState, useEffect, useRef } from 'react'
import {ShopXButtonNav, StarButton, SingleImageUploader, Sticky} from '~/components/common'

import { ToastContainer, toast } from 'react-toastify'     //토스트
import { Webview } from '~/lib/webviewApi'
import { addGoodsReview, updGoodsReview, getGoodsReviewByOrderSeq } from '~/lib/shopApi'
import { getGoodsByGoodsNo } from '~/lib/goodsApi'
import { getLoginUser } from '~/lib/loginApi'
import ComUtil from '~/util/ComUtil'
import { Server } from '~/components/Properties'
import {useParams} from 'react-router-dom'
import Tag from "~/components/common/hashTag/HashTagInput";
import {Div, Button, Hr, Flex, Space, Textarea} from "~/styledComponents/shared";
import GoodsCard from "~/components/common/cards/GoodsCard";
import {color} from "~/styledComponents/Properties";
import {withRouter} from 'react-router-dom'
import BlocerySpinner from "~/components/common/Spinner/BlocerySpinner";
import BackNavigation from "~/components/common/navs/BackNavigation";
import {BsPinAngle} from "react-icons/bs";
import {useRecoilState} from "recoil";
import {refreshState} from "~/recoilState";

function GoodsReview(props){

    const [refresh, setRefresh] = useRecoilState(refreshState)
    const [uploading, setUploading] = useState(true)

    //등록 : action, orderSeq, goodsNo, score
    //수정 : action, orderSeq, goodsNo
    const params = ComUtil.getParams(props)

    const [goodsReview, setGoodsReview] = useState({
        orderSeq: params.orderSeq,
        score: params.score ? params.score : null,
        goodsReviewContent: '',
        goodsReviewImages: [],
        tags: []
    })


    const [goods, setGoods] = useState()
    const [loading, setLoading] = useState(false)

    const inputEl = useRef(null)




    useEffect(() => {

        searchGoods()       //상품 조회

        //신규
        if (params.action === 'I') {

        }else{//수정
            searchGoodsReview() //상품리뷰 조회
        }


    }, [])

    //상품 조회
    const searchGoods = async () => {
        const {data} = await getGoodsByGoodsNo(params.goodsNo)
        setGoods(data)
    }

    //상품리뷰 조회
    const searchGoodsReview = async () => {
        const {data} = await getGoodsReviewByOrderSeq(params.orderSeq)
        setGoodsReview(data)
        return data
    }

    const onStarClick = ({score}) => {
        setGoodsReview({
            ...goodsReview,
            score: score
        })
    }

    const onGoodsReviewContentChange = (e) => {
        setGoodsReview({
            ...goodsReview,
            goodsReviewContent: e.target.value
        })
    }

    const onGoodsReviewImageChange = (images) => {


        setGoodsReview(prev => ({
            ...prev,
            goodsReviewImages: images
        }))

        // setGoodsReview({
        //     ...goodsReview,
        //     goodsReviewImages: images
        // })
    }

    const onTagChange = (tags) => {
        setGoodsReview({
            ...goodsReview,
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

    const save = async () => {
        if (uploading) {
            alert('이미지 업로드 중입니다. 잠시만 기다려 주세요.')
            return
        }
        setLoading(true)
        if(!goodsReview.score || goodsReview.score <= 0){
            notify('별점을 선택해 주세요', toast.error)
            setLoading(false)
            return
        }
        if(!goodsReview.goodsReviewContent || goodsReview.goodsReviewContent.length <= 0) {
            notify('후기를 작성해 주세요', toast.error)
            inputEl.current.focus()
            setLoading(false)
            return
        }
        if(goodsReview.goodsReviewContent && goodsReview.goodsReviewContent.length > 0) {
            let totalByte = getLengthMaxChkCount(goodsReview.goodsReviewContent);
            if (totalByte < 10) {
                notify('최소 10자이상 입력해주세요.', toast.error)
                inputEl.current.focus()
                setLoading(false)
                return;
            }
        }

        let status;
        let data;
        if(params.action === 'I'){
            const response = await addGoodsReview(goodsReview)
            status = response.status
        }
        else if(params.action === 'U'){
            const response = await updGoodsReview(goodsReview)
            status = response.status
        }

        // 두번 클릭 방지용
        if(status === -1){
            notify('이미 등록되어 있습니다', toast.info)
            setLoading(false)
            props.history.goBack()
            return
        }
        else if(status === 0){
            notify('로그인이 안되어 있습니다. 다시 로그인을 시도해 주시기 바랍니다.', toast.info)
            setLoading(false)
            props.history.goBack()
            return
        }

        if(status !== 200){
            notify('다시 시도해 주세요', toast.error)
            setLoading(false)
            return
        }

        setLoading(false)
        setRefresh(true)
        props.history.goBack()
    }

    const notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
            //className: ''     //클래스를 넣어도 됩니다
        })
    }

    return(
        <Div>
            {
                loading && <BlocerySpinner />
            }
            <BackNavigation>상품리뷰 쓰기</BackNavigation>
            <GoodsCard goods={goods} onClick={() => null} />
            <Div px={16} pb={16}>
                <Hr />
                <Flex justifyContent={'center'} py={30}>
                    <Div fw={500}>별점 선택</Div>
                    <Div mx={20} height={43} custom={`
                        border-left: 1px solid ${color.light};
                    `}></Div>
                    <Space justifyContent={'center'}>
                        {
                            [2,4,6,8,10].map((_score, index) => {
                                return <StarButton key={`star${index}`} score={_score} active={_score <= goodsReview.score} onClick={onStarClick}/>
                            })
                        }
                    </Space>
                </Flex>
                <Textarea
                    style={{
                        width: '100%', minHeight: 100,
                        borderColor: `${color.light}!important`,
                        borderRadius: '3px'
                    }}
                    className={'border-info'}
                    onChange={onGoodsReviewContentChange}
                    inputRef={inputEl}
                    value={goodsReview.goodsReviewContent}
                    placeholder='받은 상품이 어떠셨나요? 후기를 자세히 공유해 주세요.(최소 10자이상 입력해 주세요.)'
                />
                <Div mt={30}>
                    <Div fw={500} mb={8}>이미지 첨부</Div>
                    <SingleImageUploader setUploading={setUploading} images={goodsReview.goodsReviewImages} defaultCount={10} isShownMainText={false} onChange={onGoodsReviewImageChange} />
                </Div>
                <Div my={30}>
                    <Div fw={500} mb={0}>#태그</Div>
                    <Tag tags={goodsReview.tags} onChange={onTagChange}/>
                </Div>
                <Space px={16} py={8} fontSize={12} spaceGap={8} bg={'background'} fg={'danger'}>
                    <BsPinAngle />
                    <div>
                        {'실제 수령한 상품과 관계없는 사진을 첨부할 경우, 통보 없이 삭제 및 지급된 적립금이 회수 됩니다. (타인의 사진 도용, 상품 소개 화면 캡처 등 기타 저작권에 위배되는 내용 포함)'}
                    </div>
                </Space>
                <Button block bg={'green'} fg={'white'} py={15} onClick={save}>리뷰 등록</Button>
            </Div>
            {/*<ToastContainer/>*/}
        </Div>
    )
}

// function GoodsReview_bak(props){
//
//     const params = useParams()
//     // const params = ComUtil.getParams(props)
//     const inputEl = useRef(null)
//
//     const action = '';//params.action
//     const orderSeq = params.orderSeq
//     const goodsNo = ''//params.goodsNo
//
//     //TODO score 파라미터
//     const [score, setScore] = useState(params.score)
//     const [goodsNm, setGoodsNm] = useState()
//     const [goodsImageUrl, setGoodsImageUrl] = useState()
//     const [consumerNo, setConsumerNo] = useState()
//
//     const [goodsReviewContent, setGoodsReviewContent] = useState()
//     const [goodsReviewImages, setGoodsReviewImages] = useState([])
//     const [tags, setTags] = useState([])
//
//     const onGoodsReviewImageChange = (images) => {
//         setGoodsReviewImages(images)
//     }
//     const onGoodsReviewContentChange = (e) => {
//         setGoodsReviewContent(e.target.value)
//     }
//
//     const onTagChange = (tags) => {
//         console.log({tags: tags})
//
//         setTags(tags)
//     }
//
//     const onStarClick = ({score}) => {
//         setScore(score)
//     }
//     const notify = (msg, toastFunc) => {
//         toastFunc(msg, {
//             position: toast.POSITION.TOP_RIGHT
//             //className: ''     //클래스를 넣어도 됩니다
//         })
//     }
//     const save = async () => {
//         const state = {
//             orderSeq,
//             goodsNo,
//             consumerNo,
//             score,
//             goodsReviewContent,
//             goodsReviewImages,
//             tags
//         }
//
//         console.log({saveData: state})
//
//         if(!state.score || state.score <= 0){
//             notify('별점을 선택해 주세요', toast.error)
//             return
//         }
//         else if(!state.goodsReviewContent || state.goodsReviewContent.length <= 0) {
//             notify('후기를 작성해 주세요', toast.error)
//             inputEl.current.focus()
//             return
//         }
//
//         // props.addGoodsReviewItem(payload)
//
//         let status;
//         let data;
//         if(action === 'I'){
//             const response = await addGoodsReview(state)
//             status = response.status
//             data = response.data
//         }
//         else if(action === 'U'){
//             const response = await updGoodsReview(state)
//             status = response.status
//             data = response.data
//         }
//
//         if(status !== 200){
//             alert('다시 시도해 주세요')
//             return
//         }
//
//         Webview.closePopup() //작성목록 으로
//     }
//
//     useEffect(() => {
//         inputEl.current.focus()
//
//         async function getAllDataFromDB (){
//
//             //사용자 조회
//             const consumer = await getLoginUser()
//             setConsumerNo(consumer.uniqueNo)
//
//             //상품조회
//             const {status, data: goods} = await getGoodsByGoodsNo(goodsNo)
//             setGoodsNm(goods.goodsNm)
//             setGoodsImageUrl(Server.getThumbnailURL() + goods.goodsImages[0].imageUrl)
//
//
//             //수정 일 경우
//             if(action === 'U'){
//                 //리뷰 조회
//                 const {data: goodsReview} = await getGoodsReviewByOrderSeq(orderSeq)
//
//                 console.log('Update', goodsReview)
//                 setScore(goodsReview.score)
//                 setGoodsReviewContent(goodsReview.goodsReviewContent)
//                 setGoodsReviewImages(goodsReview.goodsReviewImages)
//                 if (goodsReview.tags) {
//                     setTags(goodsReview.tags)
//                 }
//
//             }
//         }
//
//         getAllDataFromDB()
//     }, [])
//
//     return(
//         <div>
//             <ShopXButtonNav close>상품후기작성</ShopXButtonNav>
//             <div className='p-3'>
//                 <div className='d-flex mb-2'>
//                     <div className='mr-2'><img style={{borderRadius: '100%', width: 50, height: 50}} src={goodsImageUrl} alt={'상품후기 사진'}/></div>
//                     <div className='d-flex flex-column flex-grow-1 justify-content-between p-1'>
//                         <div className='font-weight-bold'>{goodsNm}</div>
//                         <div className='small text-secondary'>공개적으로 게시</div>
//                     </div>
//                 </div>
//                 <div className='d-flex justify-content-center mb-2'>
//                     {
//                         [2,4,6,8,10].map((_score, index) => {
//                             return <div key={`star_${index}`} className='p-1 m-2'><StarButton score={_score} active={_score <= score} onClick={onStarClick}/></div>
//                         })
//                     }
//                 </div>
//                 <div className='mb-4'>
//                     {/*<Input innerRef={inputEl} style={{borderRadius: 0, border: 0, borderBottom: '2px solid'}} className='border-info' placeholder='받은 상품이 어떠셨나요? 후기를 자세히 공유해 주세요.'/>*/}
//
//                     <Textarea style={{width: '100%', minHeight: 90, borderRadius: 0}}
//                               onChange={onGoodsReviewContentChange}
//                               inputRef={inputEl}
//                               value={goodsReviewContent}
//                               placeholder='받은 상품이 어떠셨나요? 후기를 자세히 공유해 주세요.'/>
//                 </div>
//                 <div className='mb-4'>
//                     <SingleImageUploader images={goodsReviewImages} defaultCount={5} isShownMainText={false} onChange={onGoodsReviewImageChange} />
//                 </div>
//                 <Div mb={8}>#태그</Div>
//                 <Tag tags={tags} onChange={onTagChange}/>
//                 <Div mt={24}>
//                     <Button block bg={'green'} fg={'white'} py={10} onClick={save}>게시</Button>
//                 </Div>
//             </div>
//             <ToastContainer/>
//         </div>
//     )
// }

export default withRouter(GoodsReview)