import React from 'react';
import _ from 'lodash'
import {Div, Flex} from "~/styledComponents/shared";
import {BsChevronLeft, BsChevronRight} from 'react-icons/bs'

const ArrowButton = ({active, onClick, children}) => {

    return(
        <Flex justifyContent={'center'} width={50} height={'100%'}
              cursor={active}
              doActive={active}
              bg={'white'}
              fg={active ? 'black' : 'secondary'}
              onClick={onClick}
        >
            {children}
        </Flex>
    )
}

const Page = ({active, page, onClick}) => {
    return(
        <Flex doActive bg={'white'} cursor={1} justifyContent={'center'} fw={active ? 900 : 'normal'} minWidth={50} height={'100%'} fontSize={17}
              fg={active ? 'green' : 'dark'} onClick={onClick}>{page}</Flex>
    )
}

const index = (props) => {

    const {
        totalCount,   //총 페이지 수
        limit,        //한 페이지의 도큐먼트 수
        currentPage,  //현재 페이지
        onPageChange  //체인지 이벤트
    } = props;

    const pageCount = Math.ceil(totalCount / limit); // 몇 페이지가 필요한지 계산
    // if (pageCount === 1) return null; // 1페이지 뿐이라면 페이지 수를 보여주지 않음

    let start_index;
    let end_index;

    // //화면에 5개만 표시하기 위해 정적으로 박음, 그리고 선택된 페이지가 항상 중앙에 오도록(되도록이면) (네이버처럼)
    if (currentPage < 3) {
        start_index = 1
        end_index = 5
    } else {
        start_index = parseFloat(currentPage) - 2;
        end_index = parseFloat(currentPage) + 2;
    }

    if (pageCount <= 5) {
        start_index = 1;
        end_index = pageCount;
    }

    if (end_index > pageCount) {
        end_index = pageCount
    }

    if (end_index - 4 > 0) {
        start_index = end_index - 4
    }

    const pages = _.range(start_index, end_index + 1);

    return (
        <Div p={6} bg={'backgroundDark'}>

            <Flex bg={'white'} bc={'light'} justifyContent={'space-between'} height={50}>
                <ArrowButton active={currentPage > 1}
                             onClick={currentPage > 1 ? onPageChange.bind(this, currentPage - 1) : null}>
                    <BsChevronLeft/>
                </ArrowButton>
                <Flex flexGrow={1} justifyContent={'center'} height={'100%'} bc={'light'} bt={0} bb={0}>
                    {
                        pages.map(page =>
                            <Page page={page} active={page == currentPage}
                                  onClick={currentPage !== page && onPageChange.bind(this, page)}/>
                        )
                    }
                </Flex>
                <ArrowButton active={currentPage < pageCount}
                             onClick={currentPage < pageCount ? onPageChange.bind(this, currentPage + 1) : null}>
                    <BsChevronRight/>
                </ArrowButton>
            </Flex>
        </Div>
    )
}

export default index;


