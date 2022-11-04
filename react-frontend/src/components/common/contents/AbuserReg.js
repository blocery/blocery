import React, {useState, useEffect} from 'react';
import {addAbuser, getAbuserByConsumerNo, setConsumerStop} from "~/lib/adminApi";
import {Div, Flex, Right, Span, Button, Input, Copy, A, Space, GridColumns} from "~/styledComponents/shared";
import styled from 'styled-components'
import ComUtil from "~/util/ComUtil";
import {color} from "~/styledComponents/Properties";
import {getValue} from "~/styledComponents/Util";
import Checkbox from '~/components/common/checkboxes/Checkbox'
import {getConsumerByConsumerNo} from "~/lib/shopApi";
import {useModal} from "~/util/useModal";

import {AiOutlineSafetyCertificate} from 'react-icons/ai'
import {FaUserAltSlash, FaCommentSlash} from 'react-icons/fa'
import {ImAngry} from 'react-icons/im'
import Textarea from "react-textarea-autosize";
import {Server} from "~/components/Properties";
import moment from 'moment-timezone'

const store = {
    userMessages: [
        '고객센터 메일 cs@blocery.io 로 문의 부탁 드립니다.',
        '어뷰징 유사 사례로 판단되어 차단 되었습니다. 고객센터 메일 cs@blocery.io 로 문의 부탁 드립니다.',
        '불법 해킹시도가 감지되어 차단 되었습니다. 고객센터 메일 cs@blocery.io 로 문의 부탁 드립니다.',
    ]
}


const AbuserReg = ({consumerNo}) => {

    const [updateMode, setModalOpen, selected, setSelected, setUpdateMode] = useModal()

    const initialAbuser = {
        consumerNo: consumerNo,
        userMessage: '',    //사용자에게 노출되는 메세지
        memo: '',           //관리자만 보이는 메모(어뷰저 사유)
        blocked: false,
        account: null,
        hackerFlag: false,
        communityAbuserFlag: false,
        communityAbuserDay: '',
        communityPermanentlyFlag: false
    }


    const [abuser, setAbuser] = useState(initialAbuser);
    const [ethScanUrl, setEthScanUrl] = useState('')

    useEffect(() => {
        getAbuser()
    }, [])

    const getAbuser = async () => {
        const {data} = await getAbuserByConsumerNo(consumerNo)
        if (data) {
            setAbuser(data)
        }else{
            setAbuser(initialAbuser)
        }

        let ethScanUrl = 'https://etherscan.io/address/';
        if(Server._serverMode() == "stage"){
            ethScanUrl = 'https://ropsten.etherscan.io/address/'
        }
        setEthScanUrl(ethScanUrl)
    }



    const onInputChange = ({target}) => {
        const {name, value} = target
        setAbuser({
            ...abuser,
            [name]: value
        })
    }

    const onUserMessageClick = (text) => {
        setAbuser({...abuser, userMessage: text})
    }

    const onCheckboxChange = ({target}) => {
        const {name, checked} = target
        const _abuser = Object.assign({}, abuser)
        _abuser[name] = checked
        if (name === 'hackerFlag' && checked) {
            _abuser.blocked = true
        }
        //console.log({_abuser});
        setAbuser(_abuser);
    }

    const onSaveAbuserClick = async () => {

        if (abuser.blocked) {
            if (!abuser.userMessage) {
                alert('어뷰저 등록을 위해서는 "사용자 안내 메시지" 는 필수 입니다')
                return
            }
            if (!abuser.memo) {
                alert('어뷰저 등록을 위해서는 "어뷰징 사유 [관리자 메모]" 는 필수 입니다')
                return
            }
        }

        console.log({abuser})

        await addAbuser(abuser)

        getAbuser()

        toggle()

    }

    const toggle = () => {
        setUpdateMode(!updateMode)
    }

    const onCancelClick = () => {
        getAbuser()
        toggle()
    }

    const copy = (text) => {
        ComUtil.copyTextToClipboard(text, '', '')
    }

    const {blocked, hackerFlag, communityAbuserFlag, communityAbuserDay, communityPermanentlyFlag, userMessage, memo, regDate, modDate, account, ip} = abuser

    return (
        <Div relative>

            <GridColumns rowGap={15} colGap={0}>



                <Flex>
                    <Flex>
                        <Div mr={5} fontSize={20} mt={-8}>
                            {
                                (!blocked && !hackerFlag && !communityAbuserFlag) && <AiOutlineSafetyCertificate color={color.green}/>
                            }
                            {
                                blocked && <Span ml={5} fg={'danger'}><FaUserAltSlash /></Span>
                            }
                            {
                                hackerFlag && <Span ml={5} fg={'danger'}><ImAngry /></Span>
                            }
                            {
                                (communityAbuserFlag || communityPermanentlyFlag) && <Span ml={5} fg={'danger'}><FaCommentSlash /></Span>
                            }
                        </Div>
                    </Flex>
                    {
                        updateMode ?
                            <Flex ml={5}>
                                <Button bg={'white'} bc={'dark'} onClick={onCancelClick} px={10}>취소</Button>
                                <Div ml={10}>
                                    <Button bg={'danger'} fg={'white'} onClick={onSaveAbuserClick} px={10}>저장</Button>
                                </Div>
                            </Flex> : <Button bg={'white'} bc={'dark'} onClick={toggle} px={10} ml={5}>변경하기</Button>
                    }
                </Flex>


                <div>
                    <Div fontSize={12} fg={'dark'} mb={5}>어뷰저 최초 등록일 / 최종 변경일</Div>
                    <Div>
                        {
                            `${regDate ? ComUtil.utcToString(regDate, 'YYYY-MM-DD HH:mm:ss') : '미등록'} / ${modDate ? ComUtil.utcToString(modDate, 'YYYY-MM-DD HH:mm:ss') : '미등록'}`
                        }
                    </Div>
                </div>



                <div>
                    <Div fontSize={12} fg={'dark'} mb={5}>사용자 안내 메시지(사용자에게 노출)</Div>
                    {
                        updateMode ? (
                                <>
                                    <Div p={10} bc={'light'} mb={5}>
                                        {
                                            store.userMessages.map((t, i) =>
                                                <Button key={`btn${i}`} bg={'light'} px={6} py={4} fontSize={12} rounded={10} m={5} style={{textAlign:'left'}} onClick={onUserMessageClick.bind(this, t)}>{t}</Button>
                                            )
                                        }
                                    </Div>
                                    <div>
                                        <Input name={'userMessage'} value={userMessage} block onChange={onInputChange} placeholder={'사용자에게 노출되는 메시지(어뷰저, 해킹 일 경우)'}/>
                                    </div>
                                </>
                            ) :
                            userMessage
                    }

                </div>
                <Div>
                    <Div fontSize={12} fg={'dark'} mb={5}>관리자 메모(어뷰징 사유)</Div>
                    <Div style={{whiteSpace: 'pre-line', wordBreak: 'break-word'}}>
                        {
                            updateMode ?
                                <textarea style={{width: '100%'}} name={'memo'} value={memo} onChange={onInputChange} rows={3} placeholder={'어뷰징 사유 [관리자 확인용]'}/> :
                                memo
                        }
                    </Div>
                </Div>

                <div>
                    <Div fontSize={12} mb={5} fg={'dark'}>어뷰저 제제</Div>
                    <Div p={10} bc={'light'}>
                        <Flex mb={5}>
                            <div>
                                <Checkbox name={'blocked'} bg={'danger'}
                                          onChange={onCheckboxChange}
                                          checked={blocked}
                                          size={'sm'}
                                          disabled={!updateMode || hackerFlag}
                                ><Div fontSize={12}>어뷰저 (상품구매 / 출금 중지)</Div></Checkbox>
                            </div>
                        </Flex>
                        <Flex>
                            <Div>
                                <Checkbox name={'hackerFlag'} bg={'danger'}
                                          onChange={onCheckboxChange}
                                          checked={hackerFlag}
                                          size={'sm'}
                                          disabled={!updateMode}
                                ><Div fontSize={12}>해커 (상품구매 / 출금 중지)</Div></Checkbox>
                            </Div>
                        </Flex>
                    </Div>
                </div>



                <div>
                    <Div fontSize={12} mb={5} fg={'dark'}>커뮤니티 어뷰저 제제</Div>
                    <Div p={10} bc={'light'} mb={5}>
                        <Flex mb={5}>
                            <div>
                                <Checkbox name={'communityAbuserFlag'} bg={'danger'}
                                          onChange={onCheckboxChange}
                                          checked={communityAbuserFlag}
                                          size={'sm'}
                                          disabled={!updateMode}
                                ><Div fontSize={12}>글쓰기/댓글등록 15일간 중지</Div></Checkbox>
                            </div>
                            <Div fontSize={12} fg={'danger'}>
                                {
                                    (communityAbuserFlag && communityAbuserDay) ? `${moment(communityAbuserDay, 'YYYYMMDD').format('YYYY.MM.DD') } ~ ${moment(communityAbuserDay, 'YYYYMMDD').add(+14, 'days').format('YYYY.MM.DD')}` : null
                                }
                            </Div>
                        </Flex>
                        <Flex>
                            <div>
                                <Checkbox name={'communityPermanentlyFlag'} bg={'danger'}
                                          onChange={onCheckboxChange}
                                          checked={communityPermanentlyFlag}
                                          size={'sm'}
                                          disabled={!updateMode}
                                ><Div fontSize={12}>글쓰기/댓글등록 영구 중지</Div></Checkbox>
                            </div>
                        </Flex>
                    </Div>
                </div>

                <div>
                    <Div fontSize={12} fg={'dark'} mb={5}>Account</Div>
                    <Flex>
                        <Copy onClick={copy.bind(this, account)}>
                            {account}
                        </Copy>
                        {
                            account && <A href={`${ethScanUrl}${account}`} target={'_blank'} fg={'primary'} ml={10} ><u>EthScan</u></A>
                        }

                    </Flex>
                </div>
                <div>
                    <Div fontSize={12} fg={'dark'} mb={5}>Ip</Div>
                    <Copy onClick={copy.bind(this, ip)}>
                        {ip}
                    </Copy>
                </div>

            </GridColumns>



        </Div>
    );
};

export default AbuserReg;
