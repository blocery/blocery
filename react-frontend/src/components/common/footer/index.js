import React, {useEffect, useState, useRef} from 'react'
import {Button, Div, Flex, Link, Right} from '~/styledComponents/shared'
import {IoIosArrowUp, IoIosArrowDown} from 'react-icons/io'
import styled from 'styled-components'
import {Collapse} from "reactstrap";
import { getNoticeList } from '~/lib/shopApi';
import {BsChevronRight} from 'react-icons/bs'
const RoundedButton = ({children, onClick}) => <Button onClick={onClick} p={0} width={100} height={35} textAlign={'center'} rounded={20} bg={'#464c52'} fg={'white'} lineHeight={35}><strong>{children}</strong></Button>

const Ul = styled.ul`
    list-style: none;
    padding: 8px 16px;
    margin: 0;
    text-align: left;
    
    & > li {
        display: inline-block;
        font-size: 12px;
    }
    
    //홀수
    & > li:nth-child(odd) {
        width: 40%;   
    }
    //짝수
    & > li:nth-child(even) {
        width: 60%;         
    }
`

const Footer = () => {

    // function queOpen() {
    //     this.props.history.push('/mypage/queInfo');
    // }

    const [isOpen, setOpenState] = useState(false)

    const toggle = () => setOpenState(!isOpen)

    return(
        <Div>
            <Notice />
            <Div bg={'#f3f6f9'} custom={`
                & > div {
                    border-bottom: 1px solid #e9ebed;
                }
                & > div:last-child {
                    border: 0;
                }
            `}>
                {/*<Flex px={16} py={25} fontSize={14}>*/}
                {/*    <Div>*/}
                {/*        <Div fw={900}>샵블리란?</Div>*/}
                {/*        /!*TODO 페이지 개발되면 링크 필요*!/*/}
                {/*        <Div fg={'#5a5a5a'} pr={16}>샵블리가 어떤 서비스인지 궁금하지 않으세요?</Div>*/}
                {/*    </Div>*/}
                {/*    <Right flexShrink={0}>*/}
                {/*        <RoundedButton>알아보기</RoundedButton>*/}
                {/*    </Right>*/}
                {/*</Flex>*/}
                <Flex px={16} py={25} fontSize={14}>
                    <Div>
                        <Div fw={900}>이용안내</Div>
                        <Div fg={'#5a5a5a'} pr={16}>이용안내를 확인하면 더 재미있게 샵블리를 이용할 수 있어요!</Div>
                    </Div>
                    <Right flexShrink={0}>
                        <Link to={'/mypage/useGuide'}>
                            <RoundedButton>알아보기</RoundedButton>
                        </Link>
                    </Right>
                </Flex>
                <Div px={16} py={25} fontSize={14}>
                    <Flex>
                        <Div>
                            <Div fw={900}>고객센터</Div>
                            <Div fg={'#5a5a5a'} pr={16}>궁금증은 고객센터에서 빠르게 해결 하세요.</Div>
                        </Div>
                        <Right flexShrink={0}>
                            <Link to={'/faq'}>
                                <RoundedButton>FAQ</RoundedButton>
                            </Link>
                        </Right>
                    </Flex>
                    <Flex fontSize={14} mt={11}>
                        <Div>
                            <Div fw={900}>평일 09:00~18:00</Div>
                            <Div fg={'#5a5a5a'} pr={16}>(주말/공휴일 제외)</Div>
                        </Div>
                        <Right flexShrink={0}>
                            <Link to={'/mypage/privateContact'}>
                                <RoundedButton>1:1 문의하기</RoundedButton>
                            </Link>
                        </Right>
                    </Flex>
                </Div>
            </Div>
            <Div bg={'#E9EBEE'} px={16}>
                <Flex height={73} textAlign={'center'} fg={'#494d53'}>
                    <Div flexGrow={1}><Link to={'/mypage/termsOfUse'}>이용약관</Link></Div>
                    <Div flexGrow={1}><Link to={'/mypage/privacyPolicy'}>개인정보처리방침</Link></Div>
                    <Div flexGrow={1}><Link to={'/producerCenter/join/intro'}>샵블리 입점센터</Link></Div>
                </Flex>
            </Div>
            <Div bg={'#DEE0E2'} py={25} textAlign={'center'}>
                <Div fg={'#717171'} fontSize={13} lineHeight={13} onClick={toggle} pb={8} cursor={1}>
                    샵블리(ShopBly) 사업자정보 {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </Div>

                <Collapse isOpen={isOpen} >
                    <Ul>
                        <li>위탁사업자</li><li>Farm & Consume, Ltd.</li>
                        <li>Director</li><li>HWANG DONG JU</li>
                        <li>Address</li><li>111 SOMERSET ROAD #06-07 111 SOMERSET SINGAPORE 238164
                        Registration No. 201830855C</li>
                        <li>운영사업자</li><li>(주)이지팜</li>
                        <li>대표이사</li><li>진교문</li>
                        <li>사업자등록번호</li><li>124-81-73259 <a href={"https://www.ftc.go.kr/bizCommPop.do?wrkr_no=1248173259"} target={"_blank"}>사업자정보확인</a></li>
                        <li>통신판매업신고번호</li><li>2006-경기안양-117</li>
                        <li>개인정보보호책임자</li><li>김용</li>
                        <li>주소</li><li>경기도 안양시 동안구 동편로20번길 9</li>
                        <li>호스팅제공</li><li>Amazon WebServices, Inc</li>
                        <li>제휴문의</li><li>info@blocery.io</li>
                        <li>고객센터</li><li>031-8090-3108</li>
                        <li>팩스</li><li>031-421-3422</li>
                    </Ul>
                </Collapse>

                <Div fg={'#717171'} fontSize={13} pt={8}>Copyrightⓒ Ezfarm All Rights Reserved.</Div>
            </Div>
        </Div>
    )
}
export default Footer

const NOTICE_STORE = {
    notice : { noticeType: 'notice', name: '공지사항', color: 'danger'},
    event : { noticeType: 'event', name: '이벤트', color: 'primary'},
    check : { noticeType: 'check', name: '점검', color: 'danger'},
    etc : { noticeType: 'etc', name: '기타', color: 'primary'},
};



function Notice() {

    const abortControllerRef = useRef(new AbortController());

    const [notice, setNotice] = useState()
    useEffect(() => {

        // const cancelTokenSource = axios.CancelToken.source()

        let params = {userType: 'consumer', isPaging: true, limit: 1, page: 1, signal: abortControllerRef.current.signal}
        getNoticeList(params).then(({data}) =>
            setNotice(data ? data.noticeList[0] : [])
        ).catch(error => {
            if (error.message === 'canceled') {
                console.log("Request cancelled : Footer 공지사항")
            }else{
                console.log("Request error : Footer 공지사항")
            }
        })
        return(() => {
            abortControllerRef.current.abort()
        })
    }, [])
    return(
        !notice ? '...' :
            <Link to={'/noticeList'} style={{display:'block'}}>
                <Flex p={16} fontSize={13} bc={'#e9ebed'}>
                    <Div width={75} pr={2} fg={NOTICE_STORE[notice.noticeType].color}>{NOTICE_STORE[notice.noticeType].name}</Div>
                    <Div lineClamp={1}>{notice.title}</Div>
                    <Right><BsChevronRight /></Right>
                </Flex>
            </Link>
    )
}