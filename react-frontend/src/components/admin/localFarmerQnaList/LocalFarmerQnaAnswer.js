import React, {Fragment, useEffect, useRef, useState} from 'react';
import {Button, Input, Modal, ModalBody, ModalHeader} from 'reactstrap';
import ComUtil from '~/util/ComUtil'
import Textarea from 'react-textarea-autosize'
import { getLocalFarmerQnaByLocalFarmerQnaNo, setLocalFarmerQnaAnswerByLocalFarmerQnaNo } from '~/lib/adminApi';
import { toast } from 'react-toastify'; //토스트
import {Flex, Div, Span, Img, Space, Right} from "~/styledComponents/shared";
import {useModal} from "~/util/useModal";
import {Server} from "~/components/Properties";

const LocalFarmerQnaAnswer = (props) => {

    const [isModalOpen, , selected, setSelected, , toggle] = useModal(false)

    const [qnaStat, setQnaStat] = useState("");
    const [state, setState] = useState({
        localFarmerQnaNo: props.localFarmerQnaNo,
        localFarmerQna: null,
        act:"U"
    });

    useEffect(() => {
        async function fetch(){
            await search();
        }

        fetch()

    }, []);

    const search = async () => {
        const { data: localFarmerQna } = await getLocalFarmerQnaByLocalFarmerQnaNo(state.localFarmerQnaNo);
        //console.log({goodsQna });
        let vAct = "U";
        if(localFarmerQna.localFarmerQnaStat === "ready"){
            vAct = "U";
            // localFarmerQna.localFarmerAns = '안녕하세요. 사랑을 전하는 샵블리(SHOPBLY) 고객센터입니다.'
        }else if(localFarmerQna.localFarmerQnaStat === "processing"){
            vAct = "P";
        }else{
            vAct = "R";
        }
        if(localFarmerQna.localFarmerQnaStat && (localFarmerQna.localFarmerQnaStat === "processing"||localFarmerQna.localFarmerQnaStat === "success")) {
            setQnaStat(localFarmerQna.localFarmerQnaStat)
        }

        setState({
            ...state,
            act:vAct,
            localFarmerQna: localFarmerQna
        })
    }

    const onLocalFarmerQnaAnsChange = (e) => {
        const { name, value } = e.target;
        const localFarmerQna = Object.assign({}, state.localFarmerQna);
        localFarmerQna[name] = value;
        setState({
            ...state,
            localFarmerQna: localFarmerQna
        })
    }

    const onQnaStatChange = (e) => {
        const { name, value } = e.target;
        setQnaStat(value)
    }

    const onClose = (refreash) => {
        props.onClose(refreash) //부모(GoodsQnaList.js) callback
    }

    const onModify = () => {
        setState({
            ...state,
            act:'U'
        })
    }

    const onSave = async () => {
        const localFarmerQna = Object.assign({}, state.localFarmerQna);
        let confirmMsg = "저장을 하시겠습니까?";

        if (!localFarmerQna.localFarmerAns) {
            toast.warn('요청에 대한 처리내용을 입력해 주십시오!');
            return
        }

        if(localFarmerQna.localFarmerQnaStat === "ready") {
            if (qnaStat === "") {
                toast.warn('진행상태를 선택해 주세요.');
                return
            }
        }

        if (qnaStat !== "") {
            localFarmerQna.localFarmerQnaStat = qnaStat;
        }

        if(window.confirm(confirmMsg)){
            const { status, data } = await setLocalFarmerQnaAnswerByLocalFarmerQnaNo(localFarmerQna);
            if(status !== 200){
                toast.error('저장중 에러가 발생하였습니다.');
                return
            }
            toast.success('저장 되었습니다.');
            onClose(true);  //부모(GoodsQnaList.js) callback
        }
    }
    const {kind, data: selectedData} = selected || {kind: '', data: []}
    if(!state.localFarmerQna) return null;
    const { localFarmerQna } = state;
    return(
        <Fragment>
            <Div maxHeight={500} overflow={'auto'}>
                <div className={'p-3'}>
                    <div className={'p-2 small border-bottom'}>
                        문의요청 : {localFarmerQna.qaKind ? localFarmerQna.qaKind:"없음"}
                    </div>
                    {
                        localFarmerQna.goodsNo > 0 &&
                        <div className={'d-flex align-items-center m-2 border p-2'}>
                            <img className={'rounded-sm mr-3'} style={{width: 60, height: 60, objectFit: 'cover'}} src={Server.getThumbnailURL() + localFarmerQna.goodsImages[0].imageUrl}/>
                            <div>{ localFarmerQna.goodsName }</div>
                            <div className={'ml-auto small text-secondary'}>상품번호({localFarmerQna.goodsNo})</div>
                        </div>
                    }
                    <div className={'m-2 border'}>
                        <div className={'p-2 d-flex align-items-center bg-light border-bottom'}>
                            <div className={'f1  p-1 pl-3 pr-3 font-weight-bolder bg-info text-white rounded-sm mr-2'}>
                                Q
                            </div>
                            <div>
                                [로컬푸드 : {localFarmerQna.producerName}] <br/>
                                {
                                    localFarmerQna.farmerName &&
                                        <>
                                            [로컬농가 : { localFarmerQna.farmerName } { localFarmerQna.farmName && <> / {localFarmerQna.farmName}</> } { localFarmerQna.phoneNum && <> / {localFarmerQna.phoneNum}</> }
                                        </>
                                }
                            </div>
                            <div className={'m-2 text-secondary ml-auto'}>
                                {localFarmerQna.localFarmerQnaDate && ComUtil.utcToString(localFarmerQna.localFarmerQnaDate,'YYYY-MM-DD HH:mm')}
                            </div>
                        </div>
                        <div className={'p-2'} style={{whiteSpace:"pre-line"}}>
                            {localFarmerQna.localFarmerQns}
                        </div>
                    </div>


                    <div className={'m-2 border'}>
                        <div className={'p-2 d-flex align-items-center bg-light border-bottom'}>
                            <div className={'f1  p-1 pl-3 pr-3 font-weight-bolder bg-danger text-white rounded-sm mr-2'}>
                                A
                            </div>
                            <div className={'m-2 text-secondary ml-auto'}>
                                { localFarmerQna.localFarmerAnsDate && ComUtil.utcToString(localFarmerQna.localFarmerAnsDate,'YYYY-MM-DD HH:mm')}
                            </div>
                        </div>
                        <div className={'p-2'} style={{whiteSpace:"pre-line"}}>
                            {
                                (state.act === 'U' || state.act === 'P') ?
                                    <Textarea
                                        name="localFarmerAns"
                                        style={{width: '100%', minHeight: 300, borderRadius: 1, border: '1px solid rgba(0,0,0,.125)'}}
                                        className={'border-info'}
                                        rows={3}
                                        maxRows={3}
                                        onChange={onLocalFarmerQnaAnsChange}
                                        placeholder='요청 문의에 대한 처리 내용을 입력해 주세요.'>{localFarmerQna.localFarmerAns}</Textarea>
                                    :
                                    <p style={{whiteSpace:"pre-line"}}>
                                        {localFarmerQna.localFarmerAns}
                                    </p>
                            }
                        </div>
                    </div>
                    <div>
                        <Flex p={2}>
                            <Space>
                                <Div minWidth={220}>
                                    진행상태 {(state.act === 'U' || state.act === 'P') ? (localFarmerQna.localFarmerQnaStat && localFarmerQna.localFarmerQnaStat == "ready") && "(대기)":""}
                                </Div>
                                <Div>
                                    {
                                        (state.act === 'U' || state.act === 'P') ?
                                            <Input type='select' name='qnaStat' id='qnaStat' style={{width: 170}} value={qnaStat||""} onChange={onQnaStatChange}>
                                                {/*<option name={"goodsQnaStat_0"} value={"ready"}>대기</option>*/}
                                                <option name={"qnaStat_-1"} value={""}>선택</option>
                                                <option name={"qnaStat_1"} value={"processing"}>진행중</option>
                                                <option name={"qnaStat_2"} value={"success"}>처리완료</option>
                                            </Input>
                                            :
                                            <Div fg={"green"}>
                                                {localFarmerQna.localFarmerQnaStat === "ready" && "대기"}{localFarmerQna.localFarmerQnaStat === "processing" && "진행중"}{localFarmerQna.localFarmerQnaStat === "success" && "처리완료"}
                                            </Div>
                                    }
                                </Div>
                            </Space>
                        </Flex>
                    </div>
                    <Div p={2}>
                        <Flex mb={16} alignItems={'flex-start'}>
                            <Div minWidth={220}>관리자용 메모 </Div>
                            <Div flexGrow={1}>
                                <textarea
                                    name={'adminMemo'}
                                    style={{width:'100%',}}
                                    placeholder={'관리자용 메모'}
                                    disabled={(state.act === 'U' || state.act === 'P') ? false:true}
                                    value={localFarmerQna.adminMemo}
                                    onChange={onLocalFarmerQnaAnsChange}
                                />
                            </Div>
                        </Flex>
                    </Div>

                    <Flex m={2}>
                        <Right>
                            <Space>
                                <Button onClick={onClose}>{(state.act === 'U' || state.act === 'P') ? '취소':'닫기' }</Button>
                                {
                                    state.act === 'R' && <Button color={'info'} onClick={onModify}>수정모드</Button>
                                }
                                {
                                    (state.act === 'U' || state.act === 'P') && <Button color={'info'} onClick={onSave}>저장</Button>
                                }
                            </Space>
                        </Right>
                    </Flex>
                </div>
            </Div>
        </Fragment>
    )
}

export default LocalFarmerQnaAnswer