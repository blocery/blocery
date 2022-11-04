import React, {Fragment, useEffect, useState} from 'react'
import Style from './WebFarmDiaryReg.module.scss'
import { Container, FormGroup, Label, FormText } from 'reactstrap'
import { SingleImageUploader, FormGroupInput, FooterButtonLayer, ModalConfirm } from '../../../common'
import { ToastContainer, toast } from 'react-toastify'                              //토스트
import 'react-toastify/dist/ReactToastify.css'
import { getGoodsStep, addGoodsStepBoard} from '~/lib/producerApi'
import { deleteBoardWriting } from '~/lib/shopApi'
import { getGoodsByGoodsNo } from '~/lib/goodsApi'
import { Button, Alert } from 'reactstrap'
import PropTypes from 'prop-types'

import ComUtil from '../../../../util/ComUtil'
import 'react-dates/initialize';
import Textarea from 'react-textarea-autosize'
import Tag from "~/components/common/hashTag/HashTagInput";
import GoodsCard from "~/components/common/cards/GoodsCard";
import {Div, Flex} from "~/styledComponents/shared";

const WebFarmDiaryReg = (props) => {
    const [goods, setGoods] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    // const [stepNames, setStepNames] = useState([]);
    const [farmDiary, setFarmDiary] = useState({
        writingId:props.writingId ? props.writingId:null,
        goodsNo:props.goodsNo,
        consumerNo:props.consumerNo,
        stepIndex: 0,
        images: [],	        //재배 현황 이미지
        tags: [],
        stepTitle: '',	            //제목
        content: '',	        //내용
    });

    const NameInfo = {
        images: 'images',	                //재배 현황 이미지
        stepTitle: 'stepTitle',	//제목
        content: 'content',	            //내용
    }

    const STAR = <span className='text-danger'>*</span>

    //react-toastify
    const Notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
            //className: ''     //클래스를 넣어도 됩니다
        })
    }

    useEffect(() => {
        async function fetch() {
            await getBind()
        }
        fetch();

    }, []);

    const getBind = async () => {
        if(farmDiary.writingId){
            const {data:goodsStepData} = await getGoodsStep(farmDiary.writingId, farmDiary.consumerNo)
            setFarmDiary(goodsStepData);
        }
        const {data:goodsData} = await getGoodsByGoodsNo(farmDiary.goodsNo);
        setGoods(goodsData);
    }

    //등록 | 수정
    const Save = async () => {

        const goodsStep = Object.assign({}, farmDiary)
        goodsStep.goodsNo = goods.goodsNo;

        //console.log(goodsStep)
        const validArr = [
            {key: NameInfo.images, msg: '작물현황 이미지는 최소 한장이상 필요합니다'},
            {key: NameInfo.stepTitle, msg: '작업명'},
        ]

        const resultData = ComUtil.validate(goodsStep, validArr)

        if(!resultData.result)
            return

        if(!isSaving) {
            setIsSaving(true);

            await addGoodsStepBoard(goodsStep);

            // const {data: diaryNo} = farmDiary.diaryNo ? await updFarmDiary(farmDiary) : await addFarmDiary(farmDiary)

            // farmDiary.diaryNo = diaryNo

            setIsSaving(false);
            Notify('저장되었습니다', toast.success)
            props.onClose({isSearch:true})
        }

    }
    //재배일지 삭제 (본인 글 삭제)
    const Delete = async() => {
        await deleteBoardWriting(farmDiary.writingId)
        // this.notify('삭제되었습니다', toast.success)
        props.onClose()//창닫기
    }

    //작물현황 이미지
    const onDiaryImageChange = (images) => {
        setFarmDiary(prev => ({
            ...prev,
            images: images
        }))
    }

    //재배단계 메모
    const onInputChange = (e) => {
        const goodsStep = Object.assign({}, farmDiary)
        goodsStep[e.target.name] = e.target.value;
        setFarmDiary(goodsStep)
    }
    //저장
    const onBtnSaveClick = (e) => {
        Save();
    }
    //삭제
    const onBtnDeleteClick = (isConfirmed) => {
        if(isConfirmed)
            Delete();
    }
    //목록
    const onBtnCloseClick = (e) => {
        props.onClose()
    }
    const onStateChange = (stepVal) => {
        setFarmDiary({
            ...farmDiary,
            stepIndex: stepVal
        })
    }
    const onFeedTagChange = (tags) => {
        setFarmDiary({
            ...farmDiary,
            tags: tags
        })
    }

    return(
        <div>
            <Container>

                <FormGroup>
                    <Flex mt={5}>
                        <Label>상품</Label>
                        {
                            goods && <GoodsCard goods={goods} movePage={false} onClick={() => null} />
                        }
                    </Flex>
                </FormGroup>
                <hr/>
                <FormGroup>
                    <Label>작업단계</Label>
                    <Div pl={3}>
                        <Div>
                            <input type={'radio'} id={'step1'} name={'step'} checked={farmDiary.stepIndex === 100 && true} onChange={onStateChange.bind(this, 100)} /><label htmlFor="step1" className='pl-1 mr-3 f5'> 생산 | 대부분의 생산이력 기록시 선택</label>
                        </Div>
                        <Div>
                            <input type={'radio'} id={'step2'} name={'step'} checked={farmDiary.stepIndex === 200 && true} onChange={onStateChange.bind(this, 200)} /><label htmlFor="step2" className='pl-1 mr-3 f5'> 포장 | 생산 이후 포장작업 기록시 선택</label>
                        </Div>
                        <Div>
                            <input type={'radio'} id={'step3'} name={'step'} checked={farmDiary.stepIndex === 300 && true} onChange={onStateChange.bind(this, 300)} /><label htmlFor="step3" className='pl-1 mr-3 f5'> 발송 | 실제 상품 발송 후 관련 내용을 기록시 선택</label>
                        </Div>
                    </Div>
                </FormGroup>
                <hr/>
                {
                    farmDiary.writeDate &&
                    <FormGroup>
                        <Label>작업일시{STAR}</Label>
                        <div>
                            {farmDiary.writeDate ? ComUtil.utcToString(farmDiary.writeDate,'YYYY-MM-DD HH:mm'): null}
                        </div>
                    </FormGroup>
                }
                <hr/>
                <FormGroup>
                    <Label>작업 이미지{STAR}</Label>
                    <SingleImageUploader images={farmDiary.images} defaultCount={5} isShownMainText={false} onChange={onDiaryImageChange} />
                    <FormText>이미지는 1장이상 등록해야 합니다</FormText>
                </FormGroup>
                <hr/>
                <FormGroupInput
                    title={'작업명'}
                    name={NameInfo.stepTitle}
                    value={farmDiary.stepTitle}
                    explain={'파종준비 및 소독, 벌목, 종자준비, 비닐작업 등..'}
                    isRequired
                    onChange={onInputChange}
                />
                <FormGroup>
                    <Label>작업내용</Label>
                    <Textarea style={{width: '100%', minHeight: 30, borderRadius: 0, border: 0, borderBottom: '2px solid'}}
                              name={NameInfo.content}
                              className={'border-info'}
                              onChange={onInputChange}
                              value={farmDiary.content}
                              placeholder='작업 내용입니다'/>
                </FormGroup>
                <FormGroup>
                    <Label>#태그</Label>
                    <Tag tags={farmDiary.tags} placeHolder={'태그를 입력해 주세요.(최대30개)'} onChange={onFeedTagChange}/>
                </FormGroup>
            </Container>

            <FooterButtonLayer data={[
                <Button color={'secondary'} onClick={onBtnCloseClick} block>닫기</Button>,
                <Button color={'warning'} onClick={onBtnSaveClick} disabled={isSaving} block>저장</Button>,
                (farmDiary.writingId && farmDiary.adminConfirm === false) ? (
                    <ModalConfirm title={'삭제하시겠습니까?'} content={'삭제된 데이터는 복구 불가능 합니다'} onClick={onBtnDeleteClick}>
                        <Button color="danger" block>삭제</Button>
                    </ModalConfirm>
                ) : null
            ]} />
            {/*<ToastContainer />  /!* toast 가 그려질 컨테이너 *!/*/}
        </div>
    )
}

WebFarmDiaryReg.propTypes = {
    farmDiary: PropTypes.shape({
        day: PropTypes.instanceOf(Date),	//등록일자
        producerNo: PropTypes.number,
        stepImages: PropTypes.arrayOf({
            imageNo: PropTypes.number.isRequired,
            imageNm: PropTypes.string.isRequired,
            imageUrl: PropTypes.string.isRequired
        }),	                                    //재배 현황 이미지
        // cultivationStepNm: PropTypes.string,	//재배단계
        // cultivationStepCd: PropTypes.string,	//재배단계 코드
        title: PropTypes.string,	//제목
        content: PropTypes.string,	        //내용
        // contractHash: PropTypes.string,	        //블록체인 저장된 해시값
        // itemNo: PropTypes.number,
        // itemKinkCode: PropTypes.number,
        // itemKindName: PropTypes.string
    })
}
//defaultProps에서 nested 된 object 일 경우 merge 되지 않습니다

export default WebFarmDiaryReg