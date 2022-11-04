import React, {useState, useEffect} from 'react'
import useLogin from "~/hooks/useLogin";
import {withRouter} from 'react-router-dom'
import BackNavigation from "~/components/common/navs/BackNavigation";
import {Button, Div, Flex, GridColumns, Input, Space, Textarea} from "~/styledComponents/shared";
import {Required} from "~/styledComponents/ShopBlyLayouts";
import {qaKindStore} from "~/store";
import BasicSelect from "~/components/common/selectBoxes/BasicSelect";
import styled from'styled-components'
import {useModal} from "~/util/useModal";
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";

import OrderListContent from "~/components/shop/mypage/myQA/OrderListContent";
import OrderGoodsCard from "./OrderGoodsCard";
import {MdClose} from "react-icons/all";
import {color} from "~/styledComponents/Properties";
import SingleImageUploader from "~/components/common/ImageUploader/SingleImageUploader";
import {addGoodsQnA} from "~/lib/shopApi";
import {toast} from "react-toastify";
import {RadioButtons} from "~/components/common";
import {getBankInfoList} from "~/lib/producerApi";

const Title = styled(Div)`
    font-weight: bold;
    font-size: 17px;
    margin: 23px 0 10px 0;
`

const QA_CLAIM_KIND_DATA = [
    {value: '취소', label: '취소'},
    {value: '교환', label: '교환'},
    {value: '환불', label: '환불'},
]

//취소
const ClaimKindCancelled = () => {
    return(
        <>
            <Desc>상품에 따라 “출고대기“ 상태에서는 주문 취소가 불가능할 수 있습니다.</Desc>
            <Desc>출고 완료 후 운송장번호가 입력되지 않아 “출고대기”로 보여질 수 있습니다.</Desc>
            <Desc>상품 수령 후 교환/환불 접수는 “교환” 또는 “환불”로 접수 부탁드립니다.</Desc>
        </>
    )
}
//교환
const ClaimKindChange = () => {
    return(
        <>
            {/*<Desc>상품 수령 후 이상이 있는 경우 사진과 함께 문의하시면 확인 후 최대한 신속하게 처리해 드리겠습니다.</Desc>*/}
            {/*<Div pl={8}>*/}
            {/*    <Desc>신선식품 특성 상 받으신 당일, 상품의 정확한 상태를 확인할 수 있도록 사진을 촬영해 주시면 빠른 처리가 가능합니다.</Desc>*/}
            {/*    <Desc>사진은 농가와 파손 상품을 확인 하기 위해 사용되기에 꼭 첨부해 주셔야 합니다.</Desc>*/}
            {/*    <Desc>운송장, 상품 박스, 상품의 전체적인 이미지(상품의 양 2/3 이상), 상품 파손 부분을 포함한 내용 증명이 가능한 사진을 촬영해 주세요.</Desc>*/}
            {/*</Div>*/}
            <Desc>
                <div>
                    <div>
                        상품 수령 후 이상이 있는 경우 사진과 함께 문의하시면 확인 후 최대한 신속하게 처리해 드리겠습니다.
                    </div>
                    <GridColumns repeat={1} colGap={0} rowGap={5} p={10} bg={'veryLight'} fontSize={12} rounded={4}>
                        <Div fg={'danger'}>
                            운송장, 상품 박스, 상품의 전체적인 이미지(상품의 양 2/3 이상), 상품 파손 부분을 포함한 내용 증명이 가능한 사진을 촬영해 주세요.
                        </Div>
                        <div>
                            신선식품 특성 상 받으신 당일, 상품의 정확한 상태를 확인할 수 있도록 사진을 촬영해 주시면 빠른 처리가 가능합니다.
                        </div>
                        <div >
                            사진은 농가와 파손 상품을 확인 하기 위해 사용되기에 꼭 첨부해 주셔야 합니다.
                        </div>
                    </GridColumns>
                </div>
            </Desc>
        </>
    )
}
//환불 =               placeholder  보관상의 부주의로 제품의 변질이 생긴 경우 처리가 어려울 수 있습니다.
const ClaimKindRefund = () => {
    return(
        <>
            <Desc>
                <div>
                    <div>
                        상품 수령 후 이상이 있는 경우 사진과 함께 문의하시면 확인 후 최대한 신속하게 처리해 드리겠습니다.
                    </div>
                    <GridColumns repeat={1} colGap={0} rowGap={5} p={10} bg={'veryLight'} fontSize={12} rounded={4}>
                        <Div fg={'danger'}>
                            운송장, 상품 박스, 상품의 전체적인 이미지(상품의 양 2/3 이상), 상품 파손 부분을 포함한 내용 증명이 가능한 사진을 촬영해 주세요.
                        </Div>
                        <div>
                            신선식품 특성 상 받으신 당일, 상품의 정확한 상태를 확인할 수 있도록 사진을 촬영해 주시면 빠른 처리가 가능합니다.
                        </div>
                        <div >
                            사진은 농가와 파손 상품을 확인 하기 위해 사용되기에 꼭 첨부해 주셔야 합니다.
                        </div>
                    </GridColumns>
                </div>
            </Desc>
            <Desc>
                <div>
                    <div>
                        환불 요청 후 담당자의 검토/승인까지는 영업일 기준 최대 하루가 소요될 수 있습니다. (주말 및 공휴일 제외)
                    </div>
                    <GridColumns repeat={1} colGap={0} rowGap={5} p={10} bg={'veryLight'} fontSize={12} rounded={4}>
                        <Div>
                            전체 상품 중 절반 이하가 파손된 경우에는 “부분 환불”로 접수해 주세요.
                        </Div>
                        <Div>
                            “부분 환불”의 경우 계좌입금으로 진행되며, 부정확한 정보 입력으로 인한 불이익은 책임지지 않습니다.
                        </Div>
                        <Div>
                            “전체 환불“ 접수된 주문건 중 사진 확인 후 “전체 환불”이 불가능한 경우에는 “부분 환불”로 진행될 수 있습니다.
                        </Div>
                    </GridColumns>
                </div>
            </Desc>
        </>
    )
}

const CLAIM_DESC_TAG = {
    '취소': ClaimKindCancelled,
    '교환': ClaimKindChange,
    '환불': ClaimKindRefund
}


const Desc = ({children, ...rest}) => <Flex dot alignItems={'flex-start'} mb={10} {...rest}>{children}</Flex>

//qa 등록
const MyQAReg = ({history}) => {

    const {isServerLoggedIn} = useLogin()
    const [uploading, setUploading] = useState(true)
    const [bankList, setBankList] = useState([])
    const [goodsQna, setGoodsQna] = useState({
        qaType: '',
        qaKind: '',
        goodsQue: '',
        qaImages: [],
        orderSeq: 0,
        goodsNo: 0,

        qaClaimKind: '',        //취소,교환,환불
        qaClaimMethod: '',      //전체 환불,부분 환불
        bankName: '',           //은행
        bankAccount: '',        //계좌번호
        bankAccountHolder: '',  //예금주
        qaClaimProcStat: '',    //관리자 클레임 상태 : 소비자 최초 ("":미처리), 생산자 (request: 요청), 관리자 (reject:거절, confirm:승인)

    })
    const [order, setOrder] = useState()
    const [modalOpen, setModalOpen, selected, setSelected, setModalState, toggle] = useModal()

    useEffect(() => {
        console.log({goodsQna})
        if (goodsQna.qaClaimMethod === '부분 환불' && bankList.length === 0) {
            bindBankData()
        }
    }, [goodsQna.qaClaimMethod])


    //은행 데이터 바인딩 정보
    const bindBankData = async () => {
        const {data: itemsData} = await getBankInfoList();
        console.log({itemsData: itemsData})

        const bankList = itemsData.map(item => ({
            value: item.name,
            label: item.name
        }))
        setBankList(bankList)
    }


    const onSaveClick = async () => {

        const params = {...goodsQna}


        //클리어 처리
        if (params.qaKind === '취소/교환/환불') {
            if(['취소', '교환'].includes(params.qaClaimKind)) {
                if (['전체 환불'].includes(params.qaClaimMethod)) {
                    params.bankName = ''
                    params.bankAccount = ''
                    params.bankAccountHolder = ''
                }
            }
        }


        if (!params.qaKind) {
            toast.warn('문의유형을 선택해 주세요.')
            return
        }

        if (params.qaKind === '취소/교환/환불') {
            if (!params.qaClaimKind) {
                toast.warn('문의종류를 선택해 주세요.')
                return
            }
        }

        //옵셔널로 변경
        //주문선택이 필수인 문의항목인지 체크
        const item = qaKindStore.find(item => item.value === goodsQna.qaKind)
        if (item.orderRequired) {
            if (!order) {
                toast.warn('+ 주문상품을 선택해 주세요.')
                toggle()
                return
            }
        }

        if (params.qaKind === '취소/교환/환불') {

            if (['교환', '환불'].includes(params.qaClaimKind)) {
                if (params.qaImages.length === 0) {
                    toast.warn('교환 및 환불은 이미지(상품사진)를 필수로 올려 주셔야 합니다.')
                    return
                }
            }

            if (params.qaClaimMethod === '부분 환불') {
                if (!params.bankName) {
                    toast.warn('은행을 선택해 주세요.')
                    return
                }
                if (!params.bankAccount) {
                    toast.warn('계좌번호를 입력해 주세요.')
                    return
                }
                if (!params.bankAccountHolder) {
                    toast.warn('예금주를 입력해 주세요.')
                    return
                }
            }


        }
        if (!params.goodsQue) {
            toast.warn('문의내용을 작성해 주세요.')
            return
        }

        if (uploading) {
            toast.info('이미지 업로드 중입니다. 잠시만 기다려 주세요.')
            return
        }


        if (await isServerLoggedIn()) {

            if (params.qaClaimMethod === '부분 환불') {
                if (!window.confirm(`${params.bankName} ${params.bankAccount} ${params.bankAccountHolder} 정보가 맞습니까? 부정확한 정보 입력으로 인한 불이익은 책임지지 않습니다.`)) return
            }

            // const params = {
            //     ...goodsQna
            // }

            //주문상품관련 유형을 선택시 주문상품 정보 세팅
            if (item.orderRequired) {
                if (order) {
                    params.goodsNo = order.goodsNo
                    params.orderSeq = order.orderSeq
                }
            }


            console.log({params})


            const {status} = await addGoodsQnA(params)

            if (status === 200) {
                toast.success('문의가 등록 되었습니다. 최대한 빠른 시간안에 답변 드리도록 하겠습니다.')
                history.replace(`/myPage/myQA/1`)
            }else{
                toast.error('에러가 발생 하였습니다. 다시 시도해 주세요.');
            }
        }

    }

    //문의유형
    const onQAKindChange = ({target}) => {
        const value = target.value
        const item = qaKindStore.find(item => item.value === value);

        setGoodsQna(prev => {

            const newGoodsQna = {...prev}
            newGoodsQna.qaKind = value
            newGoodsQna.qaType = item ? item.qaType : '' //0 상품문의 1 판매자문의 2 고객센터문의

            if (value !== '취소/교환/환불') {
                newGoodsQna.qaClaimKind= ''
                newGoodsQna.qaClaimMethod = ''
                newGoodsQna.bankName = ''
                newGoodsQna.bankAccount = ''
                newGoodsQna.bankAccountHolder = ''
            }

            return newGoodsQna
        })

        // if (value !== '취소/교환/환불') {
        //     setGoodsQna(prev => ({
        //         ...prev,
        //         qaType: item ? item.qaType : '', //0 상품문의 1 판매자문의 2 고객센터문의
        //         qaClaimKind: '',
        //         qaClaimMethod: '',
        //         bankName: '',
        //         bankAccount: '',
        //         bankAccountHolder: '',
        //     }))
        //
        // }else{
        //     setGoodsQna(prev => ({
        //         ...prev,
        //         qaType: item ? item.qaType : '', //0 상품문의 1 판매자문의 2 고객센터문의
        //         qaKind: value,
        //     }))
        // }
    }

    //문의종류 변경
    const onQAClaimKindChange = ({target}) => {
        setGoodsQna(prev => ({
            ...prev,
            qaClaimKind: target.value
        }))
    }

    //주문상품 변경
    const onCardChange = (order) => {
        toggle()
        setOrder(order)
    }

    //주문상품 삭제
    const onDeleteOrderClick = () => {
        setOrder(null)
    }

    const onGoodsQueChange = ({target}) => {
        setGoodsQna(prev => ({
            ...prev,
            goodsQue: target.value
        }))
    }

    const onImageChange = (images) => {
        setGoodsQna(prev => ({
            ...prev,
            qaImages: images
        }))
    }


    const getKindDesc = (qaKind) => {

        let kindDescMsg = null;
        if(goodsQna.qaKind === '회원정보/어뷰징') {
            kindDescMsg = <div>- 이름, 전화번호, 로그인, 배송지관리, 인증오류, 어뷰징 등과 관련한 문의사항을 남겨주세요</div>
        }
        else if(goodsQna.qaKind === '주문/결제') {
            kindDescMsg = <div>- 상품 주문 방법, 결제방법, 결제오류 등과 관련한 문의사항을 남겨주세요.</div>;
        }
        else if(goodsQna.qaKind === '배송') {
            kindDescMsg = <div>- 상품 배송 상태 확인, 택배 오배송, 출고 전 주소지 변경 등과 관련한 문의사항을 남겨주세요.</div>;
        }
            // else if(goodsQna.qaKind === '취소/교환/환불') {
            //     kindDescMsg = <div>배송 전 주문취소,상품교환,환불 등과 관련한 문의사항을 남겨주세요. <br/><br/>
            //         ※ 주문 취소의 경우 '출고 준비' 상태에서는 상품에 따라 주문 취소가 불가능할 수 있습니다. <br/><br/>
            //         ※ 상품 수령 후 상품에 이상이 있을 경우 사진과 함께 문의하시면 확인 후 최대한 신속하게 처리해 드리겠습니다. <br/>
            //         - 사진은 농가와 파손 상품을 확인하기 위해 사용되기에 꼭 첨부해 주셔야 합니다. <br/><br/>
            //         1. 수령하신 상품의 사진을 촬영해 주세요. <br/>
            //         - 운송장, 상품박스, 상품의 전체적인 이미지(상품의 양 2/3 이상)를 포함한 내용 증명이 가능한 사진을 촬영해 주세요. <br/>
            //         2. 문의 내용 작성 후 촬영해 주신 사진을 함께 첨부하여 등록해 주세요.</div>;
        // }
        else if(goodsQna.qaKind === '이벤트/쿠폰/포인트/적립금') {
            kindDescMsg = <div>- 이벤트 관련 문의, 쿠폰 사용, 포인트 적립 및 사용 등과 관련한 문의사항을 남겨주세요.</div>;
        }
        else if(goodsQna.qaKind === '커뮤니티') {
            kindDescMsg = <div>- 게시글, 댓글과 관련한 문의사항을 남겨주세요.</div>;
        }
        else if(goodsQna.qaKind === '시스템 장애/오류') {
            kindDescMsg = <div>- 샵블리 이용 시 오류가 발생한 내용을 남겨주세요.</div>;
        }
        else if(goodsQna.qaKind === '건의/불만사항/기타') {
            kindDescMsg = <div>- 건의 및 불만 사항을 남겨주세요. 고객님의 소리에 귀 기울이는 샵블리가 되겠습니다.</div>;
        }

        if(kindDescMsg) {
            return (
                <Div mt={16}>
                    <Div fontSize={13} lineHeight={22}>
                        {kindDescMsg}
                    </Div>
                </Div>
            )
        }

        return null;
    }

    const onRadioChange = e => {
        const {name, value} = e.target
        setGoodsQna(prev => ({
            ...prev,
            qaClaimMethod: value
        }))
    }

    const onBankChange = ({target}) => {
        setGoodsQna(prev => ({
            ...prev,
            bankName: target.value
        }))
    }

    const onInputChange = e => {
        const {name, value} = e.target
        setGoodsQna(prev => ({
            ...prev,
            [name]: value
        }))
    }

    return (
        <div>
            <BackNavigation>무엇을 도와드릴까요?</BackNavigation>
            <Div px={16}>
                <Title>문의유형<Required /></Title>
                <BasicSelect data={qaKindStore} selectionText={'문의유형을 선택해 주세요.'} onChange={onQAKindChange}/>

                {
                    goodsQna.qaKind && (
                        <>
                            {
                                !['취소/교환/환불'].includes(goodsQna.qaKind) && getKindDesc(goodsQna.qaKind)
                            }

                            {
                                ['취소/교환/환불'].includes(goodsQna.qaKind) && (
                                    <Div mb={16}>
                                        <Title mt={39}>문의종류<Required /></Title>
                                        <BasicSelect data={QA_CLAIM_KIND_DATA} selectionText={'문의종류를 선택해 주세요.'} value={goodsQna.qaClaimKind} onChange={onQAClaimKindChange} />
                                    </Div>
                                )
                            }

                            <Div fg={'black'} fontSize={13}>
                                {
                                    //취소/교환/환불 별 설명
                                    goodsQna.qaClaimKind && (
                                        CLAIM_DESC_TAG[goodsQna.qaClaimKind]()
                                    )
                                }
                            </Div>
                            <Div mt={16}>
                                {
                                    (goodsQna.qaKind && qaKindStore.find(item => item.value == goodsQna.qaKind).orderRequired) ?
                                        (
                                            !order ? (
                                                <Div bg={'white'} bc={'light'} rounded={4} doActive p={16} onClick={toggle}>
                                                    + 주문상품 선택
                                                </Div>
                                            ) : (
                                                <Div relative bc={'light'} overflow={'hidden'} rounded={4} >
                                                    <Flex absolute justifyContent={'center'} top={0} right={0} width={40} height={40} onClick={onDeleteOrderClick}>
                                                        <MdClose />
                                                    </Flex>
                                                    <OrderGoodsCard {...order}/>
                                                </Div>
                                            )
                                        )
                                        :
                                        null
                                }
                            </Div>

                            <Title mt={39}>문의내용<Required /></Title>

                            <Textarea style={{width: '100%', minHeight: 100, borderRadius: 4, border: `1px solid ${color.light}`}}
                                      onChange={onGoodsQueChange}
                                      value={goodsQna.goodsQue}
                                      placeholder={['취소'].includes(goodsQna.qaClaimKind) ? '“출고대기” 상태의 주문건 취소와 관련한 문의 사항을 남겨주세요.' : ['교환','환불'].includes(goodsQna.qaClaimKind) ? '상품 수령 후 상품 파손 및 불량과 관련한 환불 요청 문의 사항을 남겨주세요.' : '문의내용을 구체적으로 작성해 주시면 보다 빠른 처리가 가능합니다.'}
                            />

                            <Title mt={39}>이미지 첨부</Title>

                            {/*{*/}
                            {/*    ['교환','환불'].includes(goodsQna.qaClaimKind) && (*/}
                            {/*        <>*/}
                            {/*            <Desc>사진은 농가와 상품을 확인 하기 위해 사용되기에 꼭 첨부해 주셔야 합니다.</Desc>*/}
                            {/*            <Desc fg={'danger'}><b>운송장 사진, 상품 박스, 상품의 전체적인 이미지(상품의 전체 수량 확인), 상품의 불량 또는 파손 부분 등을 포함하여 상품의 상태 확인이 가능하도록 촬영해 주세요.</b></Desc>*/}
                            {/*            <Desc>상품과 무관한 내용인 경우 통보없이 삭제될 수 있습니다.</Desc>*/}
                            {/*        </>*/}
                            {/*    )*/}
                            {/*}*/}

                            <SingleImageUploader
                                setUploading={setUploading}
                                images={goodsQna.qaImages}
                                defaultCount={5}
                                isShownMainText={false}
                                onChange={onImageChange} />

                            {
                                ['환불'].includes(goodsQna.qaClaimKind) && (
                                    <>
                                        <Title mt={39}>환불 요청 방법<Required /></Title>
                                        <Space spaceGap={16}>
                                            <div>
                                                <input id="전체 환불"
                                                       value="전체 환불"
                                                       name="qaClaimMethod"
                                                       type="radio"
                                                       checked={goodsQna.qaClaimMethod === "전체 환불"}
                                                       onChange={onRadioChange}
                                                />
                                                <label htmlFor={'전체 환불'} style={{marginLeft: 4}}>전체 환불</label>
                                            </div>
                                            <div>
                                                <input id="부분 환불"
                                                       value="부분 환불"
                                                       name="qaClaimMethod"
                                                       type="radio"
                                                       checked={goodsQna.qaClaimMethod === "부분 환불"}
                                                       onChange={onRadioChange}
                                                />
                                                <label htmlFor={'부분 환불'} style={{marginLeft: 4}}>부분 환불</label>
                                            </div>
                                        </Space>
                                        {
                                            goodsQna.qaClaimMethod === "부분 환불" && (
                                                <>
                                                    <Title mt={39}>환불 계좌 입력<Required /></Title>
                                                    <Div mb={10}>
                                                        <Div mb={8}>은행명</Div>
                                                        <div>
                                                            <BasicSelect data={bankList} value={goodsQna.bankName} onChange={onBankChange} selectionText={'은행을 선택해 주세요.'} />
                                                        </div>
                                                    </Div>
                                                    <Div mb={10}>
                                                        <Div mb={8}>계좌번호</Div>
                                                        <Input block name={'bankAccount'} placeholder={'계좌번호 입력'} value={goodsQna.bankAccount} onChange={onInputChange}/>
                                                    </Div>
                                                    <Div mb={10}>
                                                        <Div>예금주</Div>
                                                        <Input block name={'bankAccountHolder'} placeholder={'예금주 입력'} value={goodsQna.bankAccountHolder} onChange={onInputChange}/>
                                                    </Div>
                                                </>
                                            )
                                        }
                                    </>
                                )
                            }
                            <Button mt={20} mb={39} fontSize={17} height={50} bg={'green'} fg={'white'} block onClick={onSaveClick}>
                                문의등록
                            </Button>
                        </>
                    )
                }
            </Div>
            <Modal size="lg" isOpen={modalOpen}
                   toggle={toggle} >
                <ModalHeader toggle={toggle}>
                    문의할 주문상품 선택
                </ModalHeader>
                <ModalBody style={{padding: 0}}>
                    <OrderListContent activeOrderSeq={order ? order.orderSeq : null} onChange={onCardChange}/>
                </ModalBody>
                {/*<ModalFooter>*/}
                {/*    <Button color="secondary" onClick={toggle}>닫기</Button>*/}
                {/*</ModalFooter>*/}
            </Modal>

        </div>
    );
};

export default withRouter(MyQAReg);
