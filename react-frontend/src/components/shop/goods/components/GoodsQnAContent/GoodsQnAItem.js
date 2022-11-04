import React, {useState} from 'react'
import {FaComments} from 'react-icons/fa'
import ComUtil from '~/util/ComUtil'
import {Div, Flex, GridColumns, Space, Span, WhiteSpace} from "~/styledComponents/shared";
import {color} from "~/styledComponents/Properties";

const GoodsQnAItem = (props) => {
    const [ isVisible, setIsVisible ] = useState(false)
    function toggle(){
        setIsVisible(!isVisible)
    }
    const nickname = props.nickname
    const phone = props.consumerPhone
    // const secureEmail = email.split('@');
    return(
        <Div bg={'white'} p={16}>
            {/*<hr className='m-0'/>*/}
            {/*<Hr/>*/}

            <Div onClick={toggle} cursor={1} doActive bg={'white'}>
                <Flex fontSize={13} mb={12}>
                    <Div pr={16}>{nickname}</Div>
                    <Div px={16} custom={`border-left: 1px solid ${color.light}; border-right: 1px solid ${color.light};`}>{ComUtil.timeFromNow(props.goodsQueDate)}</Div>
                    <Div px={16} fg={props.goodsQnaStat !== 'ready' && 'green'}>{props.goodsQnaStat === 'ready' ? '답변대기' : '답변완료'}</Div>
                </Flex>
                <WhiteSpace fontSize={14}>
                    {props.goodsQue}
                </WhiteSpace>
            </Div>


            {/*<div className={'f6 m-3 cursor-pointer'}>*/}
            {/*    <div onClick={toggle}>*/}
            {/*        <div className={'mb-2'}>*/}
            {/*            <span className={'mr-2'}>{nickname}</span>*/}
            {/*            <span className={'mr-2'}>|</span>*/}
            {/*            <span className={'mr-2'}>{ComUtil.timeFromNow(props.goodsQueDate)}</span>*/}
            {/*            <span className={'mr-2'}>|</span>*/}
            {/*            {props.goodsQnaStat === 'ready' ? <span>답변대기</span> : <span className={'text-text'}>답변완료</span>}*/}
            {/*        </div>*/}
            {/*        <div style={whiteSpace}>*/}
            {/*            {props.goodsQue}*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</div>*/}

            {/*답변 영역*/}
            {
                (isVisible && props.goodsQnaStat === 'ready') && (
                    <Flex justifyContent={'center'} p={16} mt={16} bg={'veryLight'} rounded={4} fontSize={14}>
                        <FaComments className={'mr-2'} />
                        판매자의 답변을 기다리고 있습니다
                    </Flex>
                )
            }
            {
                (isVisible && props.goodsQnaStat !== 'ready') && (
                    <Div p={16}  mt={16} bg={'veryLight'} rounded={4} fontSize={14}>
                        <Space spaceGap={10} fontSize={13} mb={12}>
                            <Div fg={'green'}>
                                판매자 답변
                            </Div>
                            <div>
                                {ComUtil.utcToString(props.goodsAnsDate, 'YYYY.MM.DD')}
                            </div>
                        </Space>
                        <WhiteSpace>
                            {props.goodsAns}
                        </WhiteSpace>
                    </Div>

                )
            }

        </Div>
    )
}
export default GoodsQnAItem