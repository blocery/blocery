import React, {useEffect, useState} from 'react';
import {Button, Input, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import ComUtil from '~/util/ComUtil'
import {
    makeBoardBlinding,
    makeBoardNotBlinding,
    getBoardReportList,
    getOneConsumerBoardReportList
} from '~/lib/adminApi'

//ag-grid
import { AgGridReact } from 'ag-grid-react';
import {Button as StyledButton, Div, FilterGroup, Flex, Hr, Img, Right, Space, Span} from "~/styledComponents/shared";

import SearchDates from '~/components/common/search/SearchDates'
import moment from "moment-timezone";
import ConsumerDetail from "~/components/common/contents/ConsumerDetail";
import {getLoginAdminUser} from "~/lib/loginApi";
import {useModal} from "~/util/useModal";
import {Server} from "~/components/Properties";
import {MenuButton} from "~/styledComponents/shared/AdminLayouts";
import BoardDetail from "~/components/shop/community/boardViewer/BoardDetail";
import ReportInfoViewContent from "~/components/admin/boardAndReply/ReportInfoViewContent";

const BoardReportList = (props) => {

    const [gridApi, setGridApi] = useState(null);
    const [columnApi, setColumnApi] = useState()
    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()
    const [modalType, setModalType] = useState("")
    const [reportModalOpen, setReportModalOpen, reportSelected, setReportSelected, setReportModalState] = useModal()

    const [search, setSearch] = useState({
        isSearch:false,
        selectedGubun: 'day', //'week': 최초화면을 오늘(day)또는 1주일(week)로 설정.
        startDate: moment(moment().toDate()),
        endDate: moment(moment().toDate()),
        reported:true,
        blinded: false,
        independentSearchBy:'consumerNo'
    });
    const [dataList, setDataList] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [bestReviewLoading, setBestReviewLoading]  = useState(false);


    const agGrid = {
        columnDefs: [
            {
                headerName: "게시글ID", field: "writingId",width: 100, resizable: false,
                cellRenderer: "reviewViewRenderer",
                checkboxSelection: true
            },
            // {
            //     headerName: "삭제", field: "deleted", minWidth:80, width: 100, resizable: true,
            // },
            {
                headerName: "게시판", field: "boardType", minWidth:80, width: 100, resizable: true,
            },
            {
                headerName: "사진", field: "images", minWidth:100, width: 100, resizable: true,
                cellRenderer: "ImageRenderer"
            },
            {
                headerName: "내용", field: "content", minWidth:100, width: 300, resizable: true,
                wrapText: true,
                autoHeight: true,
                cellRenderer: "preRenderer"
            },

            {
                headerName: "댓글수", field: "replies", width: 100,resizable: false,
                cellRenderer: "countRenderer"
            },

            {
                headerName: "신고건수", field: "reports", width: 100,resizable: false,
                cellRenderer: "reportRenderer"
            },

            {
                headerName: "작성자번호", field: "consumerNo",width: 100, resizable: false,
            },
            {
                headerName: "작성자명", field: "nickname",width: 100, resizable: false,
                cellRenderer: "reviewConsumerNameRenderer",
                valueGetter: function(params) {
                    let nickName = params.nickname;
                    if(params.data.profileInfo != null){
                        if(params.data.profileInfo.nickname){
                            nickName = params.data.profileInfo.nickname;
                        }
                    }
                    return nickName;
                }
            },
            {
                headerName: "작성일", field: "writeDate", width: 150, resizable: false,
                cellRenderer:"dateRenderer",
                valueGetter: function(params) {
                    //console.log("params",params);
                    //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                    let v_Date = params.data.writeDate ? ComUtil.utcToString(params.data.writeDate, 'YYYY-MM-DD HH:mm') : null;
                    return v_Date;
                },
                filter: "agDateColumnFilter",
                filterParams: {
                    comparator: function (filterLocalDateAtMidnight, cellValue) {
                        let dateAsString = cellValue;
                        if (dateAsString == null) return -1;
                        let filterLocalDate = ComUtil.utcToString(filterLocalDateAtMidnight);
                        let cellDate = ComUtil.utcToString(dateAsString);
                        if (filterLocalDate == cellDate) {
                            return 0;
                        }
                        else if (cellDate < filterLocalDate) {
                            return -1;
                        }
                        else if (cellDate > filterLocalDate) {
                            return 1;
                        }
                    },
                    browserDatePicker: true, //달력
                    clearButton: true //클리어버튼
                }
            },


        ],
        defaultColDef: {
            width: 100,
            filter: true,
            sortable: true,
            floatingFilter: false,
            filterParams: {
                newRowsAction: 'keep'
            }
        },
        frameworkComponents: {
            reviewViewRenderer: reviewViewRenderer,
            preRenderer: preRenderer,
            dateRenderer: dateRenderer,
            countRenderer: countRenderer,

            ImageRenderer: ImageRenderer,
            reviewConsumerNameRenderer: reviewConsumerNameRenderer,
            reportRenderer: reportRenderer
        },
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
    };

    //[이벤트] 그리드 로드 후 callback 이벤트 API init
    const onGridReady = params => {
        setGridApi(params.api);
        setColumnApi(params.columnApi)
    };

    const getRowHeight = (params) => {
        // assuming 50 characters per line, working how how many lines we need
        const vRowHeight = (Math.floor(params.data.content.length / 50) + 1) * 50;
        if(vRowHeight > 50){
            return 100;
        } else{
            return vRowHeight;
        }
    }

    //goodsReviewImages
    //리뷰 사진 렌더러
    function ImageRenderer ({value: images}) {
        if(!images) return null;
        return images.map((image,index) => {
            const src = Server.getImageURL() + image.imageUrl;
            const Style = {
                width: 50, height: 50, paddingRight: '1px'
            };
            return <img key={"boardImage"+index} src={src} style={Style} alt={'게시글사진'}/>
        })
    }

    function countRenderer ({value,data:rowData}) {
        return (<Span>{value.length}</Span>)
    }

    function dateRenderer ({value,data:rowData}) {
        return (<Span>{value ? ComUtil.utcToString(value, "YYYY-MM-DD HH:mm:ss"):''}</Span>)
    }

    function reviewConsumerNameRenderer ({value, data:rowData}) {
        let nickName = value;
        if(rowData.profileInfo != null){
            if(rowData.profileInfo.nickname){
                nickName = rowData.profileInfo.nickname;
            }
        }
        return <Span fg={'primary'} onClick={onNameClick.bind(this, rowData.consumerNo)}><u>{nickName?nickName:'이름없음'}</u></Span>
    }

    function preRenderer ({value,data:rowData}) {
        const rVal = value.replace(/(?:\r\n|\r|\n)/g, '<br />')
        return (<Div maxHeight={100} style={{whiteSpace:'pre-line'}} overflow={'auto'}>{value}</Div>)
    }

    function rewardBestRenderer ({value,data:rowData}) {
        if(rowData.bestReview) {
            return (
                <span>
                    {value ? value + ' Bly':null} <br/>
                    {rowData.rewardBestReviewWon ?"(지급당시 " + rowData.rewardBestReviewWon + '원)':null}
                </span>
            )
        }
        return null
    }

    function reviewViewRenderer ({value, data:rowData}) {
        return (<Span fg={'primary'} onClick={onReviewViewClick.bind(this, rowData)}><u>{rowData.writingId}</u></Span>);
    }

    function reportRenderer ({value, data:rowData}) {
        return <Span fg={'primary'} onClick={onReportClick.bind(this, rowData)}><u>{value.length}</u></Span>
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
                consumerNo: consumerObj.consumerNo,
                reported: search.reported,
                blinded: search.blinded
            };
            let {status,data} = await getOneConsumerBoardReportList(params);
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
                startDate: search.startDate ? moment(search.startDate).format('YYYYMMDD') : null,
                endDate: search.endDate ? moment(search.endDate).format('YYYYMMDD') : null,
                reported: search.reported,
                blinded: search.blinded
            };
            const {status, data} = await getBoardReportList(params)
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


    const toggle = () => {
        setModalState(!modalOpen)
    }

    const onNameClick = (data) => {
        setModalType("consumerInfo")
        setSelected(data)
        toggle()
    }

    const onReviewViewClick = (data) => {
        setModalType("reviewInfo")
        setSelected(data)
        toggle()
    }

    const onReportClick = (data) => {
        console.log("onReportClick",data)
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

    // 조회할 신고 상태 change
    const onReportedChange = (e) => {
        const searchInfo = Object.assign({},search)
        searchInfo.reported = e.target.value === 'true' ? true:false;
        setSearch(searchInfo);
    }

    // 블라인드 조회 change
    const onBlindedChange = (e) => {
        setSelectedRows([]);
        const searchInfo = Object.assign({},search)
        searchInfo.blinded = e.target.value === 'true' ? true:false;
        setSearch(searchInfo);
    }

    const onDeleteClick = async () => {
        const res = selectedRows
        const targetList = []

        //블라인드 대상만 정리
        res.map((board) => {
            if (!board.blinded) {
                targetList.push({writingId:board.writingId})
            }
        })
        if (window.confirm(`${targetList.length}건을 블라인드 처리하시겠습니까?`)) {
            try{
                //delete(deleted = true 로 업데이트)
                await Promise.all(targetList.map(item => makeBoardBlinding({writingId:item.writingId})))
                alert(`${targetList.length}건이 블라인드 되었습니다.`)
                setSelectedRows([])
                await getSearch()
            }catch (err){
                alert('에러가 발생하였습니다. 다시 시도해 주세요.')
            }
        }
    }

    const onNotDeleteClick = async () => {
        const res = selectedRows
        const targetList = []

        //블라인드 대상만 정리
        res.map((board) => {
            if (board.blinded) {
                targetList.push({writingId:board.writingId})
            }
        })
        if (window.confirm(`${targetList.length}건을 블라인드 복구 처리하시겠습니까?`)) {
            try{
                //delete(deleted = true 로 업데이트)
                await Promise.all(targetList.map(item => makeBoardNotBlinding({writingId:item.writingId})))
                alert(`${targetList.length}건이 블라인드 복구 되었습니다.`)
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
                    <Div>글작성기간</Div>
                    <SearchDates
                        isHiddenAll={true}
                        gubun={search.selectedGubun}
                        startDate={search.startDate}
                        endDate={search.endDate}
                        onChange={onDatesChange}
                    />
                    <Input type='select' name='select' id='boardReported' style={{width: 120}} onChange={onReportedChange}>
                        <option name='radio1' value="true">신고(유)</option>
                        <option name='radio2' value="false">신고(전체)</option>
                    </Input>
                    <Input type='select' name='select' id='boardDeleted' style={{width: 200}} onChange={onBlindedChange}>
                        <option name='radio1' value="false">블라인드 안된 글</option>
                        <option name='radio2' value="true">블라인드된 글</option>
                    </Input>
                    <MenuButton onClick={() => getSearch(true)}> 검 색 </MenuButton>
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
                        (selectedRows.length > 0) && !search.blinded && <MenuButton bg={'danger'} fg={'white'} onClick={onDeleteClick}>{selectedRows.length}건 블라인드</MenuButton>
                    }
                    {
                        (selectedRows.length > 0) && search.blinded && <MenuButton bg={'green'} fg={'white'} onClick={onNotDeleteClick}>{selectedRows.length}건 블라인드 복구</MenuButton>
                    }
                </div>
                <div className="flex-grow-1 text-right">총 {dataList.length}게시글</div>
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
                    <BoardDetail writingId={selected && selected.writingId} />
                </ModalBody>
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
                            reportModalOpen && <ReportInfoViewContent type={'Board'} boardType={'board'} data={reportSelected}/>
                        }
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={reportModalToggle}>닫기</Button>
                    </ModalFooter>
                </Modal>
            }


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
        </Div>
    )
}
export default BoardReportList