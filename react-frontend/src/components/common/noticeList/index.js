import React, { useState, useEffect, Fragment } from 'react';
import { getNoticeList } from '~/lib/shopApi';
import { getLoginUserType } from '~/lib/loginApi';
import { ShopXButtonNav } from '~/components/common'
import ComUtil from '~/util/ComUtil';
import { setMissionClear } from "~/lib/eventApi"
import Collapse from 'reactstrap/lib/Collapse'
import {Div, Flex} from '~/styledComponents/shared/Layouts'
import {Badge} from '~/styledComponents/mixedIn'
import BackNavigation from "~/components/common/navs/BackNavigation";
import Skeleton from "~/components/common/cards/Skeleton";
import InfiniteScroll from "react-infinite-scroll-component";
import {Spinner} from "reactstrap";



const NoticeList = (props) => {

    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)

    const [noticeList, setNoticeList] = useState(undefined);
    const [isVisible, setIsVisible] = useState(false);
    const [tIndex, setIndex] = useState(null);
    const [nIndex, setNIndex] = useState([])

    const NOTICE_STORE = {
        notice : { noticeType: 'notice', name: '공지사항'},
        event : { noticeType: 'event', name: '이벤트'},
        check : { noticeType: 'check', name: '점검'},
        etc : { noticeType: 'etc', name: '기타'},
    };

    useEffect(() => {
        fetchMoreData(true);
    }, []);

    const fetchMoreData = async (isNewSearch) => {

        const {data: userType} = await getLoginUserType();

        let params = {userType: 'consumer', isPaging: true, limit: 15}
        if(userType){
            params.userType = userType;
        }

        //새로고침(처음부터 조회)
        if (isNewSearch) {
            params.page = 1
        } else {
            params.page = page + 1
        }

        let {data} = await getNoticeList(params);
        ComUtil.sortDate(data.noticeList, 'regDate', true);
        const list = data.noticeList;
        const totalCount = data.totalCount;
        const tempList = isNewSearch ? [] : noticeList

        let newList = tempList.concat(list)

        const newHasMore = newList.length === totalCount ? false : true

        //리스트 추가
        setNoticeList(newList);

        const newPage = list.length ? params.page : page

        //페이지 기록
        setPage(newPage)

        //조회된 총 카운트와 전체 카운트가 맞으면
        if (newList.length >= totalCount) {
            setHasMore(newHasMore)
        }
    }


    const toggle = (index) => {
        setIsVisible(!isVisible);
        setIndex(index);

        const ioIndex = nIndex.indexOf(index)

        const arrIndex = Object.assign([], nIndex)

        if (ioIndex === -1) {
            arrIndex.push(index)
            setNIndex(arrIndex)
        }else{
            arrIndex.splice(ioIndex, 1)
            setNIndex(arrIndex)
        }
    }

    return (
        <Fragment>
            <BackNavigation>공지사항</BackNavigation>
            <Div>
                <InfiniteScroll
                    dataLength={noticeList ? noticeList.length:0}
                    next={fetchMoreData.bind(this, false)}
                    hasMore={hasMore}
                    loader={<Flex p={16} justifyContent={'center'}><Spinner color="success" /></Flex>}
                    refreshFunction={fetchMoreData.bind(this, true)}
                    pullDownToRefresh
                    pullDownToRefreshThreshold={100}
                    pullDownToRefreshContent={
                        <Div textAlign={'center'} fg={'green'}>
                            &#8595; 아래로 당겨서 업데이트
                        </Div>
                    }
                    releaseToRefreshContent={
                        <Div textAlign={'center'} fg={'green'}>
                            &#8593; 업데이트 반영
                        </Div>
                    }
                >
                    {
                        (noticeList && noticeList.length != 0) ?
                            noticeList.map(({noticeNo, regDate, title, content, noticeType}, index) => {
                                return (
                                    <Div key={`notice_${index}`}>
                                        <Div cursor onClick={toggle.bind(this, index)} p={16}>
                                            {
                                                (!noticeType||noticeType==='notice') ? <Badge textAlign={'center'} width={60} px={13} fg={'danger'} bc={'danger'} fontSize={11}>공지사항</Badge> :
                                                    (noticeType === 'event' || noticeType === 'etc') ?
                                                        <Badge textAlign={'center'} width={60} px={13} fg={'primary'} bc={'primary'} fontSize={11}>{NOTICE_STORE[noticeType].name}</Badge> :
                                                        <Badge textAlign={'center'} width={60} px={13} fg={'danger'} bc={'danger'} fontSize={11}>{NOTICE_STORE[noticeType].name}</Badge>
                                            }
                                            <Div fontSize={15} fg={'black'} my={8}>{title}</Div>
                                            <Div fontSize={12} fg={'secondary'}>{ComUtil.utcToString(regDate)}</Div>
                                        </Div>

                                        <Collapse isOpen={nIndex.indexOf(index) !== -1}>
                                            <Div bg={'background'} p={16}>
                                                <Div fg={'black'} lineHeight={25} style={{whiteSpace:'pre-line', wordBreak: 'break-all'}}>{content}</Div>
                                            </Div>
                                        </Collapse>
                                        <hr className='p-0 m-0'/>
                                    </Div>
                                )}
                            )
                            :
                            <div className='w-100 h-100 d-flex justify-content-center align-items-center p-5 text-dark'>{(noticeList===undefined)?'':'공지사항이 없습니다.'}</div>
                    }
                </InfiniteScroll>
            </Div>

        </Fragment>
    )
}

export default NoticeList