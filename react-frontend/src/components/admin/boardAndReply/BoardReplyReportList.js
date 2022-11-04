import React, {useEffect, useState} from 'react';
import {Button, Input, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import ComUtil from '~/util/ComUtil'
import {boardReplyReportList, boardReplyDeleted, getOneConsumerBoardReplyReportList} from '~/lib/adminApi'

//ag-grid
import { AgGridReact } from 'ag-grid-react';
import {Button as StyledButton, Div, Flex, Space, Span} from "~/styledComponents/shared";

import SearchDates from '~/components/common/search/SearchDates'
import moment from "moment-timezone";

import ReportInfoViewContent from "./ReportInfoViewContent";
import {getLoginAdminUser} from "~/lib/loginApi";
import {useModal} from "~/util/useModal";
import {Server} from "~/components/Properties";
import {MenuButton} from "~/styledComponents/shared/AdminLayouts";
import ConsumerDetail from "~/components/common/contents/ConsumerDetail";

import Event from "~/components/shop/event/Event";
import BoardVoteDetail from "~/components/shop/community/boardVoteDetail/BoardVoteDetail";
import BoardDetail from "~/components/shop/community/boardViewer/BoardDetail";
// import CmGoodsReviewDetail from "~/components/shop/community/cmGoodsReviewDetail/CmGoodsReviewDetail";
import GoodsReviewDetail from '~/components/shop/goodsReviewDetail/CmGoodsReviewDetail'

const BoardReplyReportList = (props) => {

    const [gridApi, setGridApi] = useState(null);
    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()
    const [modalType, setModalType] = useState("")
    const [reportModalOpen, setReportModalOpen, reportSelected, setReportSelected, setReportModalState] = useModal()

    const [search, setSearch] = useState({
        isSearch:false,
        selectedGubun: 'day', //'week': 최초화면을 오늘(day)또는 1주일(week)로 설정.
        startDate: moment(moment().toDate()),
        endDate: moment(moment().toDate()),
        replyReported:true,
        replyDeleted:false,
        independentSearchBy:'consumerNo',
        tableName: 'board'
    });
    const [dataList, setDataList] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);


    const agGrid = {
        columnDefs: [
            {
                headerName: "게시글번호", field: "writingId",width: 120,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                cellRenderer: "reviewViewRenderer"
            },
            {
                headerName: "댓글ID", field: "replyId",width: 150,
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,  //전체 체크시 필터된 것만 체크
                checkboxSelection: true,
            },
            {
                headerName: "댓글소비자번호", field: "replyConsumerNo",width: 130,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'center'})
            },
            {
                headerName: "댓글작성자", field: "replyConsumerName",width: 100,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                cellRenderer: "replyConsumerNameRenderer"
            },
            {
                headerName: "댓글내용", field: "replyContent", width: 300,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'left'})
            },
            {
                headerName: "작성일", field: "replyDate", width: 150,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                cellRenderer:"dateRenderer",
            },
            {
                headerName: "댓글삭제여부", field: "replyDeleted", width: 120,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'center'})
            },
            {
                headerName: "신고건수", field: "reportCount", width: 100,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                cellRenderer: "replyReportRenderer"
            }
        ],
        defaultColDef: {
            width: 130,
            resizable: true,
            filter: true,
            sortable: true,
            floatingFilter: false,
            filterParams: {
                newRowsAction: 'keep'
            }
        },
        frameworkComponents: {
            reviewViewRenderer: reviewViewRenderer,
            dateRenderer: dateRenderer,
            replyConsumerNameRenderer: replyConsumerNameRenderer,
            replyReportRenderer: replyReportRenderer
        },
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
    };

    //[이벤트] 그리드 로드 후 callback 이벤트 API init
    const onGridReady = params => {
        setGridApi(params.api);
        if(gridApi)
            gridApi.resetRowHeights();
    };

    const getRowHeight = (params) => {
        return 50;
    }

    function dateRenderer ({data:rowData}) {
        return (<span>{rowData.replyDate ? ComUtil.utcToString(rowData.replyDate, "YYYY-MM-DD HH:mm:ss"):''}</span>)
    }

    function reviewViewRenderer ({value, data:rowData}) {
        const parmas = {
            writingId:rowData.writingId
        }
        return (<span className='text-primary' a href="#" onClick={onReviewViewClick.bind(this, parmas)}><u>{rowData.writingId}</u></span>);
    }

    function replyConsumerNameRenderer ({value, data:rowData}) {
        return <Span fg={'primary'} onClick={onNameClick.bind(this, rowData.replyConsumerNo)}><u>{rowData.replyConsumerName?rowData.replyConsumerName:'닉네임없음'}</u></Span>
    }

    function replyReportRenderer ({value, data:rowData}) {
        return <Span fg={'primary'} onClick={onReportClick.bind(this, rowData)}><u>{value}</u></Span>
    }

    useEffect(() => {
        async function fetch() {
            const user = await getLoginAdminUser();
            if (!user || user.email.indexOf('ezfarm') < 0) {
                //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
                window.location = '/admin/login';
            }

            await getSearch();
        }
        fetch();

    }, []);

    useEffect(() => {
        if(search.isSearch){
            getSearch();
        }
    },[search]);

    const getSearch = async (searchButtonClicked, consumerObj) => {

        if (consumerObj) {
            if (gridApi) {
                //ag-grid 레이지로딩중 보이기
                gridApi.showLoadingOverlay();
            }
            const params = {
                tableName:search.tableName,
                consumerNo: consumerObj.consumerNo,
                replyReported: search.replyReported,
                replyDeleted: search.replyDeleted
            };
            let {data} = await getOneConsumerBoardReplyReportList(params);
            setDataList(data);
            //ag-grid api
            if (gridApi) {
                //ag-grid 레이지로딩중 감추기
                gridApi.hideOverlay()

                //ag-grid 높이 리셋 및 렌더링
                // Following line dymanic set height to row on content
                gridApi.resetRowHeights();
            }
            //기존 일반 조회
        }else {
            if (searchButtonClicked) {
                if (!search.startDate || !search.endDate) {
                    alert('시작일과 종료일을 선택해주세요')
                    return;
                }
            }
            if (gridApi) {
                //ag-grid 레이지로딩중 보이기
                gridApi.showLoadingOverlay();
            }
            const params = {
                tableName:search.tableName,
                startDate: search.startDate ? moment(search.startDate).format('YYYYMMDD') : null,
                endDate: search.endDate ? moment(search.endDate).format('YYYYMMDD') : null,
                replyReported: search.replyReported,
                replyDeleted: search.replyDeleted
            };
            const {status, data} = await boardReplyReportList(params)
            if (status !== 200) {
                alert('응답이 실패 하였습니다')
                return
            }
            setDataList(data);

            //ag-grid api
            if (gridApi) {
                //ag-grid 레이지로딩중 감추기
                gridApi.hideOverlay()

                //ag-grid 높이 리셋 및 렌더링
                // Following line dymanic set height to row on content
                gridApi.resetRowHeights();
            }
        }
    }

    const onReviewViewClick = (data) => {
        setModalType("reviewInfo")
        setSelected(data)
        toggle()
    }

    const onNameClick = (data) => {
        setModalType("consumerInfo")
        setSelected(data)
        toggle()
    }

    const toggle = () => {
        setModalState(!modalOpen)
    }

    const onReportClick = (data) => {
        setReportSelected(data)
        reportModalToggle()
    }
    const reportModalToggle = () => {
        setReportModalState(!reportModalOpen)
    }

    const copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    const onSelectionChanged = (event) => {
        updateSelectedRows();
    }
    const updateSelectedRows = () => {
        setSelectedRows(gridApi.getSelectedRows())
    }

    const onDatesChange = async (data) => {
        const searchInfo = Object.assign({},search)
        searchInfo.startDate = data.startDate;
        searchInfo.endDate = data.endDate;
        searchInfo.selectedGubun = data.gubun;
        if(data.gubun === 'all') {
            searchInfo.isSearch = data.isSearch;
        }else {
            searchInfo.isSearch = false;
        }
        setSearch(
            searchInfo
        )
    }

    // 조회할 TableName
    const onTableNameChange = (e) => {
        const searchInfo = Object.assign({},search)
        const tableName = e.target.value;
        searchInfo.tableName = tableName;
        setSearch(searchInfo);
    }

    // 조회할 신고 상태 change
    const onReplyReportedChange = (e) => {
        const searchInfo = Object.assign({},search)
        const replyReported = e.target.value === "true"?true:false;
        searchInfo.replyReported = replyReported;
        setSearch(searchInfo);
    }

    // 조회할 댓글삭제상태 change
    const onReplyDeletedChange = (e) => {
        setSelectedRows([])
        const searchInfo = Object.assign({},search)
        searchInfo.replyDeleted = e.target.value === 'true' ? true:false;
        setSearch(searchInfo);
    }

    const onDeleteClick = async () => {
        const res = selectedRows
        const replyDeletedList = []

        //댓글 삭제 대상만 정리
        res.map((replyItem) => {
            if (!replyItem.replyDeleted) {
                replyDeletedList.push({writingId:replyItem.writingId,replyId:replyItem.replyId})
            }
        })
        if (window.confirm(`${replyDeletedList.length}건을 삭제 하시겠습니까?`)) {
            try{
                //delete(deleted = true 로 업데이트)
                await Promise.all(replyDeletedList.map(item => boardReplyDeleted({tableName:search.tableName,writingId:item.writingId,replyId:item.replyId,deleted:true})))
                alert(`${replyDeletedList.length}건이 삭제 되었습니다.`)
                setSelectedRows([])
                await getSearch()
            }catch (err){
                alert('에러가 발생하였습니다. 다시 시도해 주세요.')
            }
        }
    }

    const onUnDeleteClick = async () => {
        const res = selectedRows
        const replyDeletedList = []

        //댓글 복구 대상만 정리
        res.map((replyItem) => {
            if (replyItem.replyDeleted) {
                replyDeletedList.push({writingId:replyItem.writingId,replyId:replyItem.replyId})
            }
        })
        if (window.confirm(`${replyDeletedList.length}건을 복구 하시겠습니까?`)) {
            try{
                //delete(deleted = true 로 업데이트)
                await Promise.all(replyDeletedList.map(item => boardReplyDeleted({tableName:search.tableName,writingId:item.writingId,replyId:item.replyId,deleted:false})))
                alert(`${replyDeletedList.length}건이 복구 되었습니다.`)
                setSelectedRows([])
                await getSearch()
            }catch (err){
                alert('에러가 발생하였습니다. 다시 시도해 주세요.')
            }
        }
    }

    const oneIndependentSearch = ()=> {
        const searchField = search.independentSearchBy; //'phone,'email','consumerNo'등
        const inputValue = window.prompt('검색할 소비자 ' + searchField +':');
        if (inputValue) {
            let consumerObj;
            switch (searchField) {
                case 'consumerNo': consumerObj = {consumerNo:inputValue};break;
            }
            getSearch(false, consumerObj);
        }
    }
    const onIndependentSearchByChange = (e)=> {
        setSearch({
            ...search,
            independentSearchBy:e.target.value
        })
    }

    return (
        <Div p={16}>

            <Flex p={10} mb={10} bc={'secondary'}>
                <Space>
                    <Div>기 간 (작성일)</Div>
                    <SearchDates
                        isHiddenAll
                        gubun={search.selectedGubun}
                        startDate={search.startDate}
                        endDate={search.endDate}
                        onChange={onDatesChange}
                    />
                    <Input type='select' name='select' id='tableName' style={{width: 100}} onChange={onTableNameChange}>
                        <option name='radio1' value="board">토크</option>
                        <option name='radio2' value="vote">투표</option>
                        <option name='radio3' value="event">이벤트</option>
                        <option name='radio4' value="goodsReview">상품리뷰</option>
                    </Input>
                    <Input type='select' name='select' id='replyReported' style={{width: 100}} onChange={onReplyReportedChange}>
                        <option name='radio1' value="true">신고(유)</option>
                        <option name='radio2' value="false">신고(전체)</option>
                    </Input>
                    <Input type='select' name='select' id='replyDeleted' style={{width: 200}} onChange={onReplyDeletedChange}>
                        <option name='radio1' value="false">댓글삭제(무)</option>
                        <option name='radio2' value="true">댓글삭제(유)</option>
                    </Input>
                    <MenuButton className="ml-3" color="primary" onClick={() => getSearch(true)}> 검 색 </MenuButton>
                </Space>
            </Flex>
            <Div p={10} bc={'secondary'} mb={10}>
                <Space>
                    <Input type='select' name='select' id='independentSearchBy' style={{width: 130}} onChange={onIndependentSearchByChange}>
                        <option name='radio5' value="consumerNo">consumerNo</option>
                    </Input>
                    <Button onClick={oneIndependentSearch} className={'ml-2'}> 소비자 별도조회 (버튼클릭후 조건입력) </Button>
                </Space>
            </Div>


            <div className="d-flex p-1">
                <div>
                    {
                        (selectedRows.length > 0) && !search.replyDeleted && <MenuButton bg={'danger'} fg={'white'} onClick={onDeleteClick}>{selectedRows.length}건 삭제</MenuButton>
                    }
                    {
                        (selectedRows.length > 0) && search.replyDeleted && <MenuButton bg={'green'} fg={'white'} onClick={onUnDeleteClick}>{selectedRows.length}건 복구</MenuButton>
                    }
                </div>
                <div className="flex-grow-1 text-right">총 {dataList.length}명</div>
            </div>


            <div
                className="ag-theme-balham"
                style={{
                    height: '700px'
                }}
            >
                <AgGridReact
                    columnDefs={agGrid.columnDefs}  //컬럼 세팅
                    rowSelection={'multiple'}
                    getRowHeight={getRowHeight}
                    defaultColDef={agGrid.defaultColDef}
                    overlayLoadingTemplate={agGrid.overlayLoadingTemplate}
                    overlayNoRowsTemplate={agGrid.overlayNoRowsTemplate}
                    onGridReady={onGridReady}   //그리드 init(최초한번실행)
                    suppressRowClickSelection={false}
                    rowData={dataList}
                    frameworkComponents={agGrid.frameworkComponents}
                    onCellDoubleClicked={copy}
                    onSelectionChanged={onSelectionChanged}
                >
                </AgGridReact>
            </div>

            {/* 상세 조회 */}
            <Modal isOpen={modalOpen && modalType === 'reviewInfo'} toggle={toggle} centered size={'lg'}>
                <ModalHeader toggle={toggle}>{'게시글 정보' + (selected && selected.writingId ? '[게시글ID:'+selected.writingId+']':"")}</ModalHeader>
                <ModalBody style={{padding: 0}}>
                    {
                        search.tableName === 'vote' &&
                            <BoardVoteDetail writingId={selected && selected.writingId}/>
                    }
                    {
                        search.tableName === 'event' &&
                            <Event no={selected && selected.writingId}/>
                    }
                    {
                        search.tableName === 'goodsReview' &&
                            <GoodsReviewDetail orderSeq={selected && selected.writingId}/>
                    }
                    {
                        search.tableName === 'board' &&
                            <BoardDetail writingId={selected && selected.writingId} />
                    }
                </ModalBody>
            </Modal>

            <Modal size="lg" isOpen={modalOpen && modalType === 'consumerInfo'}
                   toggle={toggle} >
                <ModalHeader toggle={toggle}>
                    소비자 상세 정보
                </ModalHeader>
                <ModalBody>
                    <ConsumerDetail consumerNo={selected} onClose={toggle} />
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggle}>닫기</Button>
                </ModalFooter>
            </Modal>

            {
                reportModalOpen && <Modal
                    size={'lg'} isOpen={reportModalOpen}
                    toggle={reportModalToggle}>
                    <ModalHeader toggle={reportModalToggle}>
                        신고내역
                    </ModalHeader>
                    <ModalBody>
                        {
                            reportModalOpen && <ReportInfoViewContent type={'Reply'} boardType={search.tableName} data={reportSelected}/>
                        }
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={reportModalToggle}>닫기</Button>
                    </ModalFooter>
                </Modal>
            }
        </Div>
    )
}
export default BoardReplyReportList