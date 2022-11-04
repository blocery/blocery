import React, {useEffect, useState} from 'react';
import ComUtil from "~/util/ComUtil";
import {Div, Flex, Right, Button, FilterGroup, Hr, Space, Span} from "~/styledComponents/shared";
import adminApi from "~/lib/adminApi";
import {Modal, ModalBody, ModalHeader} from "reactstrap";
import {AgGridReact} from "ag-grid-react";
import {color} from "~/styledComponents/Properties";
import BoardVoteContent from "~/components/admin/boardVote/BoardVoteContent";
import BoardVoteDetail from "~/components/shop/community/boardVoteDetail/BoardVoteDetail";
import {useModal} from "~/util/useModal";
import HashTagContent from "~/components/admin/hashTag/HashTagContent";
import InputFilter from "~/components/common/gridFilter/InputFilter";
import CheckboxFilter from "~/components/common/gridFilter/CheckboxFilter";
import FilterContainer from "~/components/common/gridFilter/FilterContainer";
import {useRecoilState} from "recoil";
import {boardTagModalState} from "~/recoilState";
import {MenuButton} from "~/styledComponents/shared/AdminLayouts";


const index = (props) => {
    //등록/수정 모달
    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()

    const [tagModalState, setTagModalState] = useRecoilState(boardTagModalState)


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
            {
                headerName: "상태", field: "status",width: 90,
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,  //전체 체크시 필터된 것만 체크
                checkboxSelection: true,
                valueGetter: function ({data}){
                    return data.status === 0 ? 'O' : 'X'
                },
            },
            {
                headerName: "해시태그", field: "tag",width: 500,
                cellRenderer: "tagSearchRenderer",
            },
            {
                headerName: "사용수", field: "count",width: 200,
            },
            {
                headerName: "해시태그 등록/수정일시", field: "timestamp",width: 200,
                valueGetter: function ({data}){
                    return ComUtil.utcToString(data.timestamp, "YYYY-MM-DD HH:mm:ss")
                },
                // ,
                //     headerCheckboxSelection: true,
                //     headerCheckboxSelectionFilteredOnly: true,  //전체 체크시 필터된 것만 체크
                //     checkboxSelection: true,
            },
        ],
        onGridReady: onGridReady.bind(this),              //그리드 init(최초한번실행)
        // onFilterChanged: this.onGridFilterChanged.bind(this),  //필터온체인지 이벤트
        // onCellDoubleClicked: this.copy,
        // onSelectionChanged: this.onSelectionChanged.bind(this),
        defaultColDef: {
            width: 300,
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
            tagSearchRenderer: tagSearchRenderer
        },
        rowSelection: 'multiple',
        groupSelectsFiltered: true,
        suppressRowClickSelection: false,   //false : 셀 클릭시 체크박스도 체크 true: 셀클릭시 체크박스 체크 안함
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
    }

    function tagSearchRenderer ({data}) {
        return  <Span onClick={onTagClick.bind(this, data.tag)}>#{data.tag}</Span>
    }

    const onTagClick = (tag) => {
        //태그 전체조회 모달 조회
        setTagModalState({
            tag: tag,
            isOpen: true
        })
    }
    const search = async () => {
        const {data} = await adminApi.getAllHashTagList()
        setRowData(data)
    }

    const onClose = (isSearch) => {
        toggle()

        if (isSearch)
            search()

    }

    //상태값 변경 0: 사용, 1: 미사용
    const changeStatus = async (status) => {
        const rows = gridApi.getSelectedRows()

        const filterStatus = status === 0 ? 1 : 0

        const promises = []
        rows.map(row => (row.status === filterStatus) && promises.push(adminApi.updateHashTagStatus(row.tag, status)))

        if (promises.length <= 0) {
            alert("변경할 태그를 선택해 주세요.")
            return
        }


        if (window.confirm(`총 [${promises.length}]건을 ${status === 0 ? '사용함' : '사용불가'} 처리 하겠습니까?`)) {
            await Promise.all(promises)
            search()
        }
    }

    const onDeleteClick = async () => {
        const rows = gridApi.getSelectedRows()

        if (window.confirm(`[${rows.length}]건을 삭제 하겠습니까? 삭제 되어도 이미 등록된 게시물의 태그에는 영향이 가지 않습니다.`)) {

            const promises = rows.map(row => adminApi.deleteHashTag(row.tag))

            await Promise.all(promises)

            search()
        }


    }

    return (
        <Div p={16}>
            <FilterContainer gridApi={gridApi} columnApi={columnApi} excelFileName={'상품 목록'}>
                <FilterGroup>
                    <InputFilter
                        gridApi={gridApi}
                        columns={[
                            {field: 'tag', name: '해시태그', width: 200},
                        ]}
                        isRealTime={true}
                    />
                </FilterGroup>
                <Hr/>
                <FilterGroup>
                    <CheckboxFilter
                        gridApi={gridApi}
                        field={'status'}
                        name={'상태'}
                        data={[
                            {value: 'O', name: 'O 사용가능'},
                            {value: 'X', name: 'X 사용불가'},
                        ]}
                    />
                </FilterGroup>
            </FilterContainer>
            <Flex mb={10}>
                <Space>
                    <MenuButton onClick={search}>새로고침</MenuButton>
                    <MenuButton bg={'green'} onClick={toggle}>태그등록</MenuButton>
                    <MenuButton bg={'danger'} onClick={onDeleteClick}>삭제</MenuButton>
                    <MenuButton onClick={changeStatus.bind(this, 0)}>O 사용가능 처리</MenuButton>
                    <MenuButton onClick={changeStatus.bind(this, 1)}>X 사용불가 처리</MenuButton>
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
                <ModalHeader toggle={toggle}>#해시태그 등록</ModalHeader>
                <ModalBody style={{background: color.veryLight}}>
                    <HashTagContent tag={selected} onClose={onClose}/>
                </ModalBody>
            </Modal>

            {/*<Modal isOpen={previewOpen} toggle={previewToggle} style={{width: 477, padding: 0}}>*/}
            {/*    <ModalHeader toggle={previewToggle}>투표 미리보기</ModalHeader>*/}
            {/*    <ModalBody>*/}
            {/*        <BoardVoteDetail writingId={previewSelected} />*/}
            {/*    </ModalBody>*/}
            {/*</Modal>*/}
        </Div>
    );
};

export default index;
