import React, {useState, useEffect} from 'react';
import {AgGridReact} from "ag-grid-react";
import {Badge, Button, Col, Container, Input, Modal, ModalBody, ModalFooter, ModalHeader, Row} from "reactstrap";
import {useModal} from "~/util/useModal";
import {Div, FilterGroup, Flex, Hr, Right, Space} from "~/styledComponents/shared";
import BoardVoteContent from './BoardVoteContent'
import {color} from "~/styledComponents/Properties";
import adminApi from "~/lib/adminApi";
import ComUtil from "~/util/ComUtil";
import InputFilter from "~/components/common/gridFilter/InputFilter";
import CheckboxFilter from "~/components/common/gridFilter/CheckboxFilter";
import FilterContainer from "~/components/common/gridFilter/FilterContainer";
import BoardVoteDetail from "~/components/shop/community/boardVoteDetail/BoardVoteDetail";
import {MenuButton} from "~/styledComponents/shared/AdminLayouts";
import styled from 'styled-components'

const BoardVote = (props) => {

    //등록/수정 모달
    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()
    //미리보기 모달
    const [previewOpen, , previewSelected, setPreviewSelected, setPreviewModalState] = useModal()

    const [rowData, setRowData] = useState([])
    const [gridApi, setGridApi] = useState()
    const [columnApi, setColumnApi] = useState()

    useEffect(() => {
        search()
    }, [])

    function onGridReady (params){
        setGridApi(params.api)
        setColumnApi(params.columnApi)
    }

    const toggle = () => {
        setModalState(!modalOpen)
    }

    const gridOptions = {
        getRowHeight: function(params) {
            return 30;
        },
        // enableColResize: true,              //컬럼 크기 조정
        // enableSorting: true,                //정렬 여부
        // enableFilter: true,                 //필터링 여부
        // floatingFilter: true,               //Header 플로팅 필터 여부
        suppressMovableColumns: true,       //헤더고정시키
        columnDefs: [
            {headerName: "게시글번호", field: "writingId",width: 100, cellRenderer: 'writingIdRenderer'},
            {headerName: "제목", field: "title",width: 130, cellRenderer: 'titleRenderer'},
            {headerName: "설문 옵션", field: "itemsText",width: 200,
                valueGetter: function ({data}){
                    return data.items.map((item, index) => index+1 + '. ' + item.text).join('\n')
                }
            },
            {headerName: "참여가능 수", field: "maxVoter",width: 90},
            {headerName: "득표현황", field: "itemVoters",width: 120,
                valueGetter: function ({data}){
                    return `Tot ${data.itemVoters[0].length + data.itemVoters[1].length} (${data.itemVoters[0].length} / ${data.itemVoters[1].length})`
                }
            }, //(전체 15) : 12 / 3 실시간 득표현황
            {headerName: "시작일", field: "startDate",width: 100,
                valueGetter: function ({data}){
                    return ComUtil.intToDateString(data.startDate)
                }
            },
            {headerName: "마감일", field: "endDate",width: 100,
                valueGetter: function ({data}){
                    return ComUtil.intToDateString(data.endDate)
                }},
            {headerName: "노출순위", field: "priority",width: 100},
            {headerName: "건당 지급 설정", field: "rewardPoint",width: 100},
            {headerName: "누적 포인트", field: "appliedRewardPoint",width: 100,  //db 필드에 없음
                valueGetter: function ({data}){
                    return data.rewardPoint * (data.itemVoters[0].length + data.itemVoters[1].length)
                }
            },
            // {headerName: "조회수", field: "xxxxxxx",width: 100},
            {headerName: "댓글수", field: "repliesCount",width: 100},
            {headerName: "노출여부", field: "displayFlag",width: 100,
                valueGetter: function ({data}){
                    return data.displayFlag ? '공개' : '비공개'
                }
            },

        ],
        onGridReady: onGridReady.bind(this),              //그리드 init(최초한번실행)
        // onFilterChanged: this.onGridFilterChanged.bind(this),  //필터온체인지 이벤트
        // onCellDoubleClicked: this.copy,
        // onSelectionChanged: this.onSelectionChanged.bind(this),
        defaultColDef: {
            width: 100,
            resizable: true,
            filter: true,
            sortable: true,
            floatingFilter: true,
            filterParams: {
                newRowsAction: 'keep'
            }
        },
        // components: {
        //     formatCurrencyRenderer: this.formatCurrencyRenderer,
        //     formatDateRenderer: this.formatDateRenderer,
        //     formatDatesRenderer: this.formatDatesRenderer,
        //     vatRenderer: this.vatRenderer
        // },
        frameworkComponents: {
            titleRenderer: titleRenderer,
            writingIdRenderer: writingIdRenderer,
        },
        rowSelection: 'multiple',
        groupSelectsFiltered: true,
        suppressRowClickSelection: false,   //false : 셀 클릭시 체크박스도 체크 true: 셀클릭시 체크박스 체크 안함
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
    }

    function titleRenderer ({value, data}) {
        return(
            <Div fg={'primary'} onClick={onRowClick.bind(this, data.writingId)}>
                {value}
            </Div>
        )
    }

    function writingIdRenderer ({value, data}) {
        return(
            <Div fg={'primary'} onClick={onPreviewClick.bind(this, data.writingId)}>
                {value}
            </Div>
        )
    }


    const onRowClick = (writingId) => {
        setSelected(writingId)
        toggle()
    }

    const onPreviewClick = (writingId) => {
        setPreviewSelected(writingId)
        previewToggle()
    }

    const previewToggle = () => {
        setPreviewModalState(!previewOpen)
    }

    const search = async () => {
        const {data} = await adminApi.getBoardVoteList()
        setRowData(data)
        console.log({data})
    }

    const onClose = (isSearch) => {
        toggle()

        if (isSearch)
            search()

    }

    return (


        <Div p={16}>

            <FilterContainer gridApi={gridApi} columnApi={columnApi} excelFileName={'쿠폰 지급목록'}>
                <FilterGroup>
                    <InputFilter
                        gridApi={gridApi}
                        columns={[
                            {field: 'title', name: '제목', width: 100},
                            {field: 'itemsText', name: '설문옵션', width: 100},
                        ]}
                        isRealTime={true}
                    />
                </FilterGroup>
                <Hr/>
                <FilterGroup>
                    <CheckboxFilter
                        gridApi={gridApi}
                        field={'displayFlag'}
                        name={'노출여부'}
                        data={[
                            {value: '공개', name: '공개'},
                            {value: '비공개', name: '비공개'},
                        ]}
                    />
                </FilterGroup>
            </FilterContainer>

            <Flex mb={10}>
                <Space>
                    <MenuButton bg={'green'} onClick={toggle}>투표 생성</MenuButton>
                </Space>
                <Right>
                </Right>
            </Flex>

            <div
                id="myGrid"
                className="ag-theme-balham"
                style={{
                    height: '700px'
                }}
            >
                <AgGridReact
                    {...gridOptions}
                    rowData={rowData}
                />
            </div>

            <Modal isOpen={modalOpen} toggle={toggle} size={'xl'}>
                <ModalHeader toggle={toggle}>투표 생성 / 수정</ModalHeader>
                <ModalBody style={{background: color.veryLight, overflow: 'auto', maxHeight: 800}}>
                    <BoardVoteContent writingId={selected} onClose={onClose}/>
                </ModalBody>
            </Modal>

            <Modal isOpen={previewOpen} toggle={previewToggle} style={{width: 477, padding: 0}}>
                <ModalHeader toggle={previewToggle}>투표 미리보기</ModalHeader>
                <ModalBody>
                    <BoardVoteDetail writingId={previewSelected} />
                </ModalBody>
            </Modal>
        </Div>
    );
};

export default BoardVote;