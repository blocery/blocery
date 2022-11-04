import React, {Fragment, useEffect, useState} from 'react'
import {Container, FormGroup, Label, FormText, Input} from 'reactstrap'
import {SingleImageUploader, SingleArImageUploader, FormGroupInput, FooterButtonLayer, ModalConfirm, BlocerySpinner} from '~/components/common'
import {A, Copy, Div, Flex, Span, Button as StyledButton} from "~/styledComponents/shared";
import { ToastContainer, toast } from 'react-toastify'                              //토스트
import 'react-toastify/dist/ReactToastify.css'
import {getGoodsStep, updateGoodsStep, delGoodsStep} from "~/lib/adminApi";
import { getGoodsByGoodsNo } from '~/lib/goodsApi'
import { Button, Alert } from 'reactstrap'
import PropTypes from 'prop-types'

import ComUtil from '~/util/ComUtil'
import 'react-dates/initialize';
import { SingleDatePicker } from 'react-dates';

import Select from 'react-select'
import Textarea from 'react-textarea-autosize'
import GoodsCard from "~/components/common/cards/GoodsCard";
import Tag from "~/components/common/hashTag/HashTagInput";

const GoodsStepUpd = (props) => {
    const [focused, setFocused] = useState(null);
    const [goods, setGoods] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [adminConfirm, setAdminConfirm] = useState(false)
    const [farmDiary, setFarmDiary] = useState({
        writingId:props.writingId ? props.writingId:null,
        goodsNo:props.goodsNo,
        consumerNo:props.consumerNo,
        stepIndex: 0,
        writeDate: '',
        images: [],	        //이미지
        tags:[],            //태그
        stepTitle: '',      //제목
        content: '',        //내용
        adminConfirm:false,
        txHash: '',	    //블록체인 저장된 해시값
        arGlbFile:{},
        arUsdzFile:{}
    });
    const NameInfo = {
        images: 'images',	            //이미지
        stepTitle: 'stepTitle',	        //제목
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

    //수정
    const Save = async () => {

        const goodsStep = Object.assign({}, farmDiary)

        if(goodsStep.writingId <= 0 || goodsStep.writingId === null){
            alert("writingId 없습니다!!")
            return false;
        }

        goodsStep.goodsNo = goods.goodsNo;
        //goodsStep.stepDay = parseInt(goodsStep.stepDay);
        if(adminConfirm) {
            goodsStep.adminConfirm = adminConfirm;
        }

        //console.log(goodsStep)
        const validArr = [
            {key: NameInfo.images, msg: '작업 이미지는 최소 한장이상 필요합니다'},
            {key: NameInfo.stepTitle, msg: '작업'},
        ]

        const resultData = ComUtil.validate(goodsStep, validArr)

        if(!resultData.result)
            return

        if(!isSaving) {
            setIsSaving(true);

            await updateGoodsStep(goodsStep);

            // const {data: diaryNo} = farmDiary.diaryNo ? await updFarmDiary(farmDiary) : await addFarmDiary(farmDiary)

            // farmDiary.diaryNo = diaryNo

            setIsSaving(false);
            Notify('수정되었습니다', toast.success)
            props.onClose({isSearch:true})
        }

    }
    //재배일지 삭제
    const Delete = async() => {
        await delGoodsStep(farmDiary.writingId)
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

    //AR 이미지
    const onArImageChange = (arimages) => {
        setFarmDiary(prev => ({
            ...prev,
            arGlbFile: arimages
        }))
    }
    const onArUSDZImageChange = (arimages) => {
        setFarmDiary(prev => ({
            ...prev,
            arUsdzFile: arimages
        }))
    }

    //onInputChange
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
    const onAdminConfirmChange = (e) => {
        const bAdminConfirm = e.target.value === "true" ? true:false;
        setAdminConfirm(bAdminConfirm)
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
            {
                isSaving && <BlocerySpinner/>
            }
            <Container>

                <FormGroup>
                    <Flex mt={5}>
                        <Label className={'mr-5'}>상품</Label>
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
                <FormGroup>
                    <Label>작업일시{STAR}</Label>
                    <Div>
                        {farmDiary.writeDate ? ComUtil.utcToString(farmDiary.writeDate,'YYYY-MM-DD HH:mm'):''}
                    </Div>
                </FormGroup>
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

                {
                    (farmDiary.writingId && farmDiary.adminConfirm === true) &&
                    <>
                        <hr/>
                        <FormGroup>
                            <Label>관리자승인</Label>
                            <FormText>
                                블록체인기록 (<A href={`${"https://www.iostabc.com/tx/"}${farmDiary.txHash}`} target={'_blank'} fg={'primary'}><u>{farmDiary.txHash}</u></A>)
                            </FormText>
                            <FormText>관리자 승인이 되어 있습니다!</FormText>
                        </FormGroup>
                    </>

                }

                {
                    (farmDiary.writingId && farmDiary.adminConfirm === false) &&
                        <>
                            <hr/>
                            <FormGroup>
                                <Label>관리자승인</Label>
                                <Input type='select' name='select' id='adminConfirm' style={{width:'200px'}} onChange={onAdminConfirmChange}>
                                    <option name='radio1' value='false'>미승인</option>
                                    <option name='radio2' value='true'>승인(블록체인기록)</option>
                                </Input>
                                <FormText>관리자 승인시 블록체인에 기록이 됩니다!</FormText>
                            </FormGroup>
                            <hr/>
                        </>
                }

                {
                    <Div bc={'secondary'} p={10}>
                        <FormGroup>
                            <Label>AR 이미지(glb)</Label>
                            <SingleArImageUploader image={farmDiary.arGlbFile} onChange={onArImageChange} />
                        </FormGroup>
                        <FormGroup>
                            <Label>AR 이미지(usdz) ios용</Label>
                            <SingleArImageUploader arType={'usdz'} image={farmDiary.arUsdzFile} onChange={onArUSDZImageChange} />
                        </FormGroup>
                    </Div>
                }
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

GoodsStepUpd.propTypes = {
    farmDiary: PropTypes.shape({
        day: PropTypes.instanceOf(Date),	//등록일자
        producerNo: PropTypes.number,
        stepImages: PropTypes.arrayOf({
            imageNo: PropTypes.number.isRequired,
            imageNm: PropTypes.string.isRequired,
            imageUrl: PropTypes.string.isRequired
        }),	                                    //재배 현황 이미지
        title: PropTypes.string,	//제목
        content: PropTypes.string,	        //내용
    })
}
export default GoodsStepUpd