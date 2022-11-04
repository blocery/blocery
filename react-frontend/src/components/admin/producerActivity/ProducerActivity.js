import React, {useEffect, useState} from 'react';
import {Button, Input, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import ComUtil from '~/util/ComUtil'
import {
    makeBoardBlinding,
    getBoardRankingList,
    getConsumerBoardList,
    getProducerActivity
} from '~/lib/adminApi'

//ag-grid
import { AgGridReact } from 'ag-grid-react';
import {Button as StyledButton, Div, Flex, Space, Span, Right} from "~/styledComponents/shared";

import moment from "moment-timezone";
import ConsumerDetail from "~/components/common/contents/ConsumerDetail";
import {getLoginAdminUser} from "~/lib/loginApi";
import {useModal} from "~/util/useModal";
import {Server} from "~/components/Properties";

import {MenuButton} from "~/styledComponents/shared/AdminLayouts";
import BoardDetail from "~/components/shop/community/boardViewer/BoardDetail";
import MonthPicker from "react-month-picker";
import {ExcelDownload, MonthBox} from "~/components/common";

import { AiOutlineQuestion } from 'react-icons/ai';

const pickerLang = {
    months: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
}

//왼쪽 랭킹
const ProducerActivity = (props) => {
    const today =  moment();
    // const initMonth = today.subtract(1, 'month');
    const limitMonth = {year: today.year(), month: today.month() + 1};

    const [gridApi, setGridApi] = useState(null)
    const [columnApi, setColumnApi] = useState()
    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()
    const [modalType, setModalType] = useState("")
    const [showMonthPicker, setShowMonthPicker] = useState(false)
    const [searchMonthValue, setSearchMonthValue] = useState(limitMonth)

    //우측화면 연결변수
    const [consumerNo, setConsumerNo] = useState(0)

    // const [search, setSearch] = useState({
    //     // isSearch:false,
    //     selectedGubun: 'day', //'week': 최초화면을 오늘(day)또는 1주일(week)로 설정.
    //     startDate: moment(moment().toDate()),
    //     endDate: moment(moment().toDate()),
    // });
    const [dataList, setDataList] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);

    const [excelData, setExcelData] = useState({columns:[], data:[]});

    const agGrid = {
        columnDefs: [
            {
                headerName: "생산자명", field: "name",width: 120, resizable: false, cellRenderer: "consumerNameRenderer"
            },
            {
                headerName: "생산자번호", field: "producerNo",width: 100, resizable: false,
            },
            {
                headerName: "활동정산금", field: "boardCount",width: 100, resizable: false, cellRenderer: "activityPaymentRenderer"
            },
            {
                headerName: "총게시물수", field: "boardCount", width: 100,resizable: false, cellRenderer: "boardListRenderer"
            },
            {
                headerName: "농가소식", field: "farmInfoCount", width: 100,resizable: false,
            },
            {
                headerName: "생산일지", field: "diaryCount", width: 100,resizable: false,
            },
            {
                headerName: "일반게시물", field: "etcCount", width: 100,resizable: false,
            },
            {
                headerName: "총댓글수", field: "replyCount", width: 100,resizable: false, cellRenderer: "replyCountRenderer",
            },
            {
                headerName: "리뷰댓글", field: "reviewReplyCount", width: 100,resizable: false,
            },
            {
                headerName: "대댓글", field: "reReplyCount", width: 100,resizable: false,
            },
            {
                headerName: "은행명", field: "payoutBankName", width: 100,resizable: false
            },
            {
                headerName: "계좌번호", field: "payoutAccount", width: 100,resizable: false,
            },
            {
                headerName: "예금주", field: "payoutAccountName", width: 100,resizable: false,
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
            consumerNameRenderer: consumerNameRenderer,
            boardListRenderer: boardListRenderer,
            activityPaymentRenderer: activityPaymentRenderer,
            replyCountRenderer: replyCountRenderer
        },
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
    };


    useEffect(() => {
        async function fetch() {
            const user = await getLoginAdminUser();
            if (!user || user.email.indexOf('ezfarm') < 0) {
                //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
                window.location = '/admin/login';
            }
            // await bindBankData();
            await getSearch();
        }

        fetch();

    },[]);

    useEffect(() => {
        async function excelData() {
            await setExcel();
            
        }
        excelData();

    },[dataList]);

    const getSearch = async () => {
        let year = searchMonthValue.year;
        let month = searchMonthValue.month;

        if(gridApi) {
            //ag-grid 레이지로딩중 보이기
            gridApi.showLoadingOverlay();
        }

        const { status, data } = await getProducerActivity(year, month)
        console.log({data})

        if(status !== 200){
            alert('응답이 실패 하였습니다')
            return
        }
        setDataList(data);

        //ag-grid api
        if(gridApi) {
            //ag-grid 레이지로딩중 감추기
            gridApi.hideOverlay()

            //ag-grid 높이 리셋 및 렌더링
            // Following line dymanic set height to row on content
            gridApi.resetRowHeights();
        }
    }

    //[이벤트] 그리드 로드 후 callback 이벤트 API init
    const onGridReady = params => {
        setGridApi(params.api);
        setColumnApi(params.columnApi)
    };

    const onNameClick = (data) => {
        setModalType("consumerInfo")
        setSelected(data)
        toggle()
    }

    const onActivityInfoClick = () => {
        setModalType("activityInfo")
        toggle()
    }

    const onBoardCountClick = (data) => {
        if (data) { //가끔 undefined들어옴.
            setConsumerNo(data)
        }
    }

    function consumerNameRenderer ({value, data:rowData}) {
        return <Span fg={'primary'} onClick={onNameClick.bind(this, rowData.producerNo)}><u>{rowData.producerName}</u></Span>
    }

    function boardListRenderer ({value, data:rowData}) {
        return <Span fg={'primary'} onClick={onBoardCountClick.bind(this, rowData.producerNo)}><u>{rowData.boardCount}</u></Span>
    }

    function activityPaymentRenderer({value, data:rowData}) {
        let paymentAll = rowData.farmInfoCount*500 + rowData.diaryCount*1000 + rowData.etcCount*500 + rowData.reviewReplyCount*200 + rowData.reReplyCount*200;
        return ComUtil.addCommas(paymentAll);
    }

    function replyCountRenderer({value, data:rowData}) {
        return <Span>{rowData.reReplyCount+rowData.reviewReplyCount}</Span>
    }

    const toggle = () => {
        setModalState(!modalOpen)
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

    const handleClickMonthBox = () => {
        setShowMonthPicker(true)
    }
    const handleAMonthChange = (value, text) => {
        let monthValue = {year: value, month: text}
        setShowMonthPicker(false)
        setSearchMonthValue(monthValue)
    }
    const handleAMonthDismiss = (value) => {
        setShowMonthPicker(false)
        setSearchMonthValue(value)
    }

    const makeMonthText = (m) => {
        if (m && m.year && m.month) return (m.year + "년 " + pickerLang.months[m.month-1])
        return '?'
    }

    const setExcel = async () => {
        let excelData = await getExcelData();
        // console.log("excelData",excelData)
        setExcelData(excelData)
    }
    const getExcelData = async () => {
        const columns = [
            '생산자명', '생산자No', '활동정산금', '총게시물수', '농가소식', '생산일지', '일반게시물',
            '총댓글수', '리뷰댓글', '대댓글', '은행명', '계좌번호', '예금주'
        ]
        //필터링 된 데이터에서 sortedData._original 로 접근하여 그리드에 바인딩 원본 값을 가져옴
        const data = dataList.filter(
            item=>(item.boardCount+item.reviewReplyCount+item.reReplyCount) > 0
        ).map((item ,index)=> {
            let paymentAll = item.farmInfoCount*500 + item.diaryCount*1000 + item.etcCount*500 + item.reviewReplyCount*200 + item.reReplyCount*200;

            return [
                item.producerName, item.producerNo, paymentAll, item.boardCount, item.farmInfoCount, item.diaryCount, item.etcCount,
                item.reviewReplyCount+item.reReplyCount, item.reviewReplyCount, item.reReplyCount, item.payoutBankName, item.payoutAccount, item.payoutAccountName
            ]
        })

        return [{
            columns: columns,
            data: data
        }]
    }

    return (
        <Flex>
            <Div p={16} flexGrow={8}>

                <Flex>
                    <Div width="150px">
                        {
                            showMonthPicker &&
                            <MonthPicker
                                show={true}
                                years={[2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029]}
                                value={searchMonthValue}
                                lang={pickerLang.months}
                                onChange={handleAMonthChange.bind(this)}
                                onDismiss={handleAMonthDismiss.bind(this)}
                            >
                            </MonthPicker>
                        }
                        <MonthBox value={makeMonthText(searchMonthValue)}
                                  onClick={handleClickMonthBox.bind(this)} />
                    </Div>
                    <Div width="100px" ml={5}>
                        <Button onClick={() => getSearch(true)} block color={'info'}>조회</Button>
                    </Div>
                    <Right bc={'secondary'} p={5}>
                        - 생산자 활동 정산은 매월 1일 ~ 말일 기준으로 익월 20일에 지급합니다. <br/>
                        - 활동정산금 지급에 적절하지 않은 게시글은 우측 목록에서 블라인드 처리하여 정산 지급에서 제외합니다. <br/>
                        - 생산자 활동 지급기준 &nbsp; <StyledButton p={2} rounded={'50%'} bc={'secondary'} fontSize={10} onClick={onActivityInfoClick}><AiOutlineQuestion /></StyledButton>
                    </Right>
                </Flex>

                <div className="d-flex p-1">
                    <div>
                        <ExcelDownload data={excelData}
                                       fileName={`생산자활동내역_`+makeMonthText(searchMonthValue)}
                                       sheetName="생산자활동"
                        />
                    </div>
                    <div className="flex-grow-1 text-right">총 {dataList.length} 명</div>
                </div>

                <div
                    className="ag-theme-balham"
                    style={{
                        height: '700px'
                    }}
                >
                    <AgGridReact
                        columnDefs={agGrid.columnDefs}  //컬럼 세팅
                        rowSelection={'single'}
                        //getRowHeight={getRowHeight}
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

                <Modal isOpen={modalOpen && modalType === 'activityInfo'} toggle={toggle}>
                    <ModalHeader toggle={toggle}>생산자 활동 지급기준</ModalHeader>
                    <ModalBody>
                        <Div>
                            <Div mb={16} lineHeight={28}>
                                {/*<b>[ 생산자 활동 지급기준]</b> <br/>*/}
                                1. 농가 소식 : 500원 <br/>
                                2. 생산 일지 : 1,000원 / 쑥쑥 계약재배 상품에만 작성 가능함 <br/>
                                3. 일반 게시물 : 500원 / 농장소식, 생산일지, 리뷰를 제외한 모든 생산자 게시글 <br/>
                                4. 리뷰 댓글 : 200원 / 해당 생산자 상품 리뷰에 작성한 댓글 <br/>
                                5. 피드 댓글 : 200원 / 해당 생산자 피드 게시글에 작성한 대댓글
                            </Div>
                        </Div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={toggle}>닫기</Button>
                    </ModalFooter>
                </Modal>
            </Div>

            <Div p={1} flexGrow={2}>
                <BoardRankingRight consumerNo={consumerNo} year={searchMonthValue.year} month={searchMonthValue.month} />
            </Div>
        </Flex>
    )
}




//오른쪽 게시글 블라인드 관리 화면
const BoardRankingRight = ({consumerNo, year, month}) => {
    let yearStr = year.toString();
    let monthStr = month.toString();
    if(monthStr.length === 1) {
        monthStr = '0'+monthStr
    }

    const [gridApi, setGridApi] = useState(null);
    const [columnApi, setColumnApi] = useState()
    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()
    const [modalType, setModalType] = useState("")

    //좌측화면으로부터 수신
    // const [consumerNo, setConsumerNo] = useState(paramConsumerNo);
    const [search, setSearch] = useState({
        startDate:yearStr+monthStr+'01',
        endDate: yearStr+monthStr+ComUtil.lastDay(month),
        blinded: false
    });

    const [dataList, setDataList] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [bestReviewLoading, setBestReviewLoading]  = useState(false);


    // useEffect(() => {
    //     async function fetch() {
    //         const user = await getLoginAdminUser();
    //         if (!user || user.email.indexOf('ezfarm') < 0) {
    //             //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
    //             window.location = '/admin/login';
    //         }
    //
    //         await getSearch();
    //     }
    //     fetch();
    //
    // }, []);

    useEffect(() => {
        setSearch({
            startDate: yearStr+monthStr+'01', endDate:yearStr+monthStr+ComUtil.lastDay(month),
            blinded:search.blinded
        })
        getSearch();

    },[consumerNo]);

    const getSearch = async () => {
        if (!consumerNo) return;//첫접속시

        if(gridApi) {
            //ag-grid 레이지로딩중 보이기
            gridApi.showLoadingOverlay();
        }
        const params = {
            consumerNo:consumerNo,
            // startDate:search.startDate ? moment(search.startDate).format('YYYYMMDD'):null,
            // endDate:search.endDate ? moment(search.endDate).format('YYYYMMDD'):null,
            startDate: search.startDate && search.startDate,
            endDate: search.endDate && search.endDate,
            blinded:search.blinded,
        };
        console.log('params',params)

        const { status, data } = await getConsumerBoardList(params)
        if(status !== 200){
            alert('응답이 실패 하였습니다')
            return
        }
        setDataList(data);

        //ag-grid api
        if(gridApi) {
            //ag-grid 레이지로딩중 감추기
            gridApi.hideOverlay()

            //ag-grid 높이 리셋 및 렌더링
            // Following line dymanic set height to row on content
            gridApi.resetRowHeights();
        }
    }

    const agGrid = {
        columnDefs: [
            {
                headerName: "게시글ID", field: "writingId",width: 100, resizable: false,
                cellRenderer: "reviewViewRenderer",
                checkboxSelection: true
            },
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
                headerName: "댓글수", field: "replies", width: 80,resizable: false,
                cellRenderer: "countRenderer"
            },
            {
                headerName: "신고수", field: "reports", width: 80,resizable: false,
                cellRenderer: "countRenderer"
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

            ImageRenderer: ImageRenderer
        },
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
    };

    // Ag-Grid Cell 스타일 기본 적용 함수
    function getCellStyle ({cellAlign,color,textDecoration,whiteSpace}) {
        if(cellAlign === 'left') cellAlign='flex-start';
        else if(cellAlign === 'center') cellAlign='center';
        else if(cellAlign === 'right') cellAlign='flex-end';
        else cellAlign='flex-start';
        return {
            display: "flex",
            alignItems: "center",
            justifyContent: cellAlign,
            color: color,
            textDecoration: textDecoration,
            whiteSpace: whiteSpace
        }
    }

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
        return (<span>{value.length}</span>)
    }

    function dateRenderer ({value,data:rowData}) {
        return (<span>{value ? ComUtil.utcToString(value, "YYYY-MM-DD HH:mm:ss"):''}</span>)
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

        const vUrl = Server.getFrontURL() + '/community/board/'+rowData.writingId;
        const parmas = {
            writingId:rowData.writingId,
            reviewUrl:vUrl
        }
        return (<span className='text-primary' a href="#" onClick={onReviewViewClick.bind(this, parmas)}><u>{rowData.writingId}</u></span>);
    }

    const toggle = () => {
        setModalState(!modalOpen)
    }

    const onReviewViewClick = (data) => {
        setModalType("reviewInfo")
        setSelected(data)
        toggle()
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


    // 블라인드 조회 change
    const onBlindedChange = (e) => {
        const searchInfo = Object.assign({},search)
        searchInfo.blinded = e.target.value;
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

    return (
        <Div p={16} >
            <Flex p={10} mb={10} bc={'secondary'}>
                <Space>
                    <Input type='select' name='select' id='replyDeleted' style={{width: 200}} onChange={onBlindedChange}>
                        <option name='radio1' value="false">블라인드 안된 글</option>
                        <option name='radio2' value="true">블라인드된 글</option>
                    </Input>
                    <MenuButton onClick={() => getSearch(true)}> 검 색 </MenuButton>
                </Space>
            </Flex>

            <div className="d-flex p-1">
                <div>
                    {
                        (selectedRows.length > 0) && <StyledButton ml={10} bg={'danger'} fg={'white'} onClick={onDeleteClick}>{selectedRows.length}건 블라인드</StyledButton>
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

export default ProducerActivity