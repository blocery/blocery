import React, {useEffect, useState} from 'react';
import {Button, Input, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import ComUtil from '~/util/ComUtil'
import {goodsReviewList, goodsReviewBlinding, pickBestReview, goodsReviewNotBlinding} from '~/lib/adminApi'

//ag-grid
import { AgGridReact } from 'ag-grid-react';
import {Button as StyledButton, Div, FilterGroup, Flex, Hr, Img, Right, Space, Span} from "~/styledComponents/shared";

import SearchDates from '~/components/common/search/SearchDates'
import moment from "moment-timezone";
import ConsumerDetail from "~/components/common/contents/ConsumerDetail";
import {getLoginAdminUser} from "~/lib/loginApi";
import {useModal} from "~/util/useModal";
import {Server} from "~/components/Properties";
import {FaRegGrinBeam,FaRegFrown} from 'react-icons/fa'
import FilterContainer from "~/components/common/gridFilter/FilterContainer";
import InputFilter from "~/components/common/gridFilter/InputFilter";
import CheckboxFilter from "~/components/common/gridFilter/CheckboxFilter";
import {MenuButton} from "~/styledComponents/shared/AdminLayouts";
import GoodsContent from "~/components/common/contents/BizGoodsViewer";
import CmGoodsReviewDetail from "~/components/shop/goodsReviewDetail/CmGoodsReviewDetail";

import ReportInfoViewContent from "~/components/admin/goodsReview/ReportInfoViewContent";

const GoodsReviewList = (props) => {

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
        blinded: false
    });
    const [dataList, setDataList] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [bestReviewLoading, setBestReviewLoading]  = useState(false);


    const agGrid = {
        columnDefs: [
            {
                headerName: "상품리뷰ID", field: "orderSeq",width: 150, resizable: false,
                //headerCheckboxSelection: true,
                //headerCheckboxSelectionFilteredOnly: true,  //전체 체크시 필터된 것만 체크
                cellRenderer: "reviewViewRenderer",
                checkboxSelection: true
            },
            {
                headerName: "상품명", field: "goodsNm",width: 150, resizable: true,
                cellRenderer: "goodsNmRenderer",
                wrapText: true,
                autoHeight: true,
            },
            {
                headerName: "상품번호", field: "goodsNo",width: 90, resizable: false,
            },
            {
                headerName: "판매자번호", field: "producerNo",width: 100, resizable: false,
            },
            {
                headerName: "평점", field: "score", width: 80, resizable: false,
            },
            {
                headerName: "리뷰사진", field: "goodsReviewImage", minWidth:100, width: 100, resizable: true,
                cellRenderer: "goodsReviewImagesRenderer"
            },
            {
                headerName: "리뷰내용", field: "goodsReviewContent", minWidth:100, width: 300, resizable: true,
                wrapText: true,
                autoHeight: true,
                cellRenderer: "preRenderer"
            },
            {
                headerName: "도움돼요", field: "likesCount", width: 90, resizable: false,
            },
            {
                headerName: "의견", field: "repliesCount", width: 80, resizable: false,
            },
            {
                headerName: "신고", field: "reports", width: 80, resizable: false,
                cellRenderer: "reportRenderer",
            },
            // {
            //     headerName: "블라인드", field: "blinded",width: 100, resizable: false,
            // },
            {
                headerName: "작성자번호", field: "consumerNo",width: 100, resizable: false,
            },
            {
                headerName: "작성자명", field: "consumerName",width: 100, resizable: false,
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
                headerName: "작성일", field: "goodsReviewDate", width: 150, resizable: false,
                cellRenderer:"dateRenderer",
                valueGetter: function(params) {
                    //console.log("params",params);
                    //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                    let v_Date = params.data.goodsReviewDate ? ComUtil.utcToString(params.data.goodsReviewDate, 'YYYY-MM-DD HH:mm') : null;
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
            {
                headerName: "우수리뷰", field: "bestReview",width: 90, resizable: true,
                cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}),
                cellRenderer: "bestReviewRenderer",
                valueGetter: function(params) {
                    if(params.data.bestReview){
                        return "선정"
                    }
                    return '미선정'
                }
            },
            {
                headerName: "우수리워드지급", field: "rewardBestReviewBly",width: 150, resizable: true,
                cellRenderer: "rewardBestRenderer"
            },
            {
                headerName: "리워드지급", field: "rewardReviewBly",width: 150, resizable: true,
                cellRenderer: "rewardRenderer"
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
            goodsNmRenderer: goodsNmRenderer,
            preRenderer: preRenderer,
            dateRenderer: dateRenderer,
            bestReviewRenderer: bestReviewRenderer,
            goodsReviewImagesRenderer: goodsReviewImagesRenderer,
            reviewConsumerNameRenderer: reviewConsumerNameRenderer,
            rewardRenderer: rewardRenderer,
            rewardBestRenderer: rewardBestRenderer,
            countRenderer: countRenderer,
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
        const vRowHeight = (Math.floor(params.data.goodsReviewContent.length / 50) + 1) * 50;
        if(vRowHeight > 50){
            return 100;
        } else{
            return vRowHeight;
        }
    }

    //goodsReviewImages
    //리뷰 사진 렌더러
    function goodsReviewImagesRenderer ({value: images,data:rowData}) {
        if(!rowData.goodsReviewImages) return null;
        return rowData.goodsReviewImages.map((image,index) => {
            const src = Server.getImageURL() + image.imageUrl;
            const Style = {
                width: 50, height: 50, paddingRight: '1px'
            };
            return <img key={"goodsReviewImage"+index} src={src} style={Style} alt={'리뷰사진'}/>
        })
    };

    function countRenderer ({value,data:rowData}) {
        return (<span>{value.length}</span>)
    }

    function reportRenderer ({value, data:rowData}) {
        return <Span fg={'primary'} onClick={onReportClick.bind(this, rowData)}><u>{value.length}</u></Span>
    }

    function dateRenderer ({value,data:rowData}) {
        return (<span>{value ? ComUtil.utcToString(value, "YYYY-MM-DD HH:mm:ss"):''}</span>)
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
    function rewardRenderer ({value,data:rowData}) {
        if(rowData.bestReview) {
            return (
                <span>
                    {value ? value + ' Bly':null} <br/>
                    {rowData.rewardReviewWon ? "(지급당시 " + rowData.rewardReviewWon + '원)':null}
                </span>
            )
        }
        return null
    }
    function reviewViewRenderer ({value, data:rowData}) {
        const parmas = {
            orderSeq:rowData.orderSeq
        }
        return (<span className='text-primary' a href="#" onClick={onReviewViewClick.bind(this, parmas)}><u>{rowData.orderSeq}</u></span>);
    }
    function goodsNmRenderer ({value, data:rowData}) {
        return (<span className='text-primary' a href="#" onClick={onGoodsNmClick.bind(this, rowData.goodsNo)}><u>{rowData.goodsNm}</u></span>);
    }
    function bestReviewRenderer ({value,data:rowData}) {
        if(value === "선정"){
            return (
                <Div p={10} rounded={5} bg={'green'}>
                    <FaRegGrinBeam size={25} color={'white'}/>
                </Div>
            )
        }else{
            return (
                <Div p={10} rounded={5} bg={'secondary'}>
                    <FaRegFrown size={25} color={'white'}/>
                </Div>
            )
        }
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

    const getSearch = async (searchButtonClicked) => {

        if(searchButtonClicked) {
            if (!search.startDate || !search.endDate) {
                alert('시작일과 종료일을 선택해주세요')
                return;
            }
        }
        if(gridApi) {
            //ag-grid 레이지로딩중 보이기
            gridApi.showLoadingOverlay();
        }
        const params = {
            startDate:search.startDate ? moment(search.startDate).format('YYYYMMDD'):null,
            endDate:search.endDate ? moment(search.endDate).format('YYYYMMDD'):null,
            blinded:search.blinded
        };
        const { status, data } = await goodsReviewList(params)
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

    const onBestReviewClick = async () => {
        const res = selectedRows
        const tGoodsReviewList = []
        //console.log("onBestReviewClick===",res)
        if(res.length !== 1){
            alert("우수리뷰선정은 1건씩만 처리 하실수 있습니다!");
            return;
        }

        if (res[0].blinded) {
            alert("블라인드처리된 항목입니다.")
            return;
        }

        if (window.confirm(`리뷰ID ${res[0].orderSeq}을 우수리뷰선정을 하시겠습니까?`)) {

            const rewardBestReviewWon = window.prompt("지급할 리워드 원화 금액을 입력하세요!")
            if(!rewardBestReviewWon){
                alert("우수리뷰선정시 지급할 금액을 입력하셔야 합니다!");
                return;
            }

            //우수리뷰 대상만
            res.map((item) => {
                if (!item.bestReview) {
                    tGoodsReviewList.push({orderSeq:item.orderSeq,rewardBestReviewWon:rewardBestReviewWon})
                }
            })
            if (window.confirm(`리뷰ID ${res[0].orderSeq}을 우수리뷰선정 및 ${rewardBestReviewWon}원 리워드지급을 하시겠습니까?`)) {
                try{
                    setBestReviewLoading(true)
                    const oItem = tGoodsReviewList[0];
                    //console.log("oItem===",oItem)
                    //http://localhost:8080/restapi/admin/pickBestReview?orderSeq=24001822001&won=5000
                    const {data:rPickBestReview} = await pickBestReview(oItem.orderSeq,oItem.rewardBestReviewWon)
                    //console.log("rPickBestReview===",rPickBestReview)
                    if(rPickBestReview > 0){
                        alert(`우수리뷰선정 및 리워드지급이 되었습니다.`)
                        setSelectedRows([])
                        await getSearch()
                        setBestReviewLoading(false)
                    }else{
                        alert('에러가 발생하였습니다. 다시 시도해 주세요.')
                        setBestReviewLoading(false)
                    }
                }catch (err){
                    alert('에러가 발생하였습니다. 다시 시도해 주세요.')
                    setBestReviewLoading(false)
                }
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

    // 상품상세정보 조회
    const onGoodsNmClick = (data) => {
        //console.log(data)
        setModalType("goodsInfo")
        setSelected(data)
        toggle()
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

    const onDeleteClick = async () => {
        const res = selectedRows
        const targetList = []

        //블라인드 대상만 정리
        res.map((goodsReview) => {
            if (!goodsReview.blinded) {
                targetList.push({orderSeq:goodsReview.orderSeq})
            }
        })
        if (window.confirm(`${targetList.length}건을 블라인드 처리하시겠습니까?`)) {
            try{
                //delete(deleted = true 로 업데이트)
                await Promise.all(targetList.map(item => goodsReviewBlinding({orderSeq:item.orderSeq})))
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
        res.map((goodsReview) => {
            if (goodsReview.blinded) {
                targetList.push({orderSeq:goodsReview.orderSeq})
            }
        })
        if (window.confirm(`${targetList.length}건을 블라인드 복구 처리하시겠습니까?`)) {
            try{
                //delete(deleted = true 로 업데이트)
                await Promise.all(targetList.map(item => goodsReviewNotBlinding({orderSeq:item.orderSeq})))
                alert(`${targetList.length}건이 블라인드 복구 되었습니다.`)
                setSelectedRows([])
                await getSearch()
            }catch (err){
                alert('에러가 발생하였습니다. 다시 시도해 주세요.')
            }
        }
    }

    // 블라인드 조회 change
    const onBlindedChange = (e) => {
        const searchInfo = Object.assign({},search)
        searchInfo.blinded = (e.target.value === "true" ? true:false);
        setSearch(searchInfo);
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

    return (
        <Div p={16}>

            <Flex p={10} mb={10} bc={'secondary'}>
                <Space>
                    <Div>기 간</Div>
                    <SearchDates
                        gubun={search.selectedGubun}
                        startDate={search.startDate}
                        endDate={search.endDate}
                        onChange={onDatesChange}
                    />
                    <Input type='select' name='select' id='blinded' style={{width: 200}} onChange={onBlindedChange}>
                        <option name='radio1' value="false">블라인드 안된 글</option>
                        <option name='radio2' value="true">블라인드된 글</option>
                    </Input>
                    <MenuButton onClick={() => getSearch(true)}> 검 색 </MenuButton>
                </Space>
            </Flex>

            {/* filter START */}
            <FilterContainer gridApi={gridApi} columnApi={columnApi} excelFileName={'상품리뷰 목록'}>
                <FilterGroup>
                    <InputFilter
                        gridApi={gridApi}
                        columns={[
                            {field: 'orderSeq', name: '상품리뷰ID'},
                            {field: 'goodsNm', name: '상품명'},
                            {field: 'goodsNo', name: '상품번호'},
                            {field: 'score', name: '평점'},
                            {field: 'consumerName', name: '작성자명'},
                            {field: 'consumerNo', name: '작성자번호'},
                        ]}
                        isRealTime={true}
                    />
                </FilterGroup>
                <Hr/>
                <FilterGroup>
                    <CheckboxFilter
                        gridApi={gridApi}
                        field={'bestReview'}
                        name={'우수리뷰'}
                        data={[
                            {value: '미선정', name: '미선정'},
                            {value: '선정', name: '선정'},
                        ]}
                    />
                </FilterGroup>
            </FilterContainer>

            <Flex mb={10}>
                <Space>
                    {
                        (!search.blinded) && (selectedRows.length === 1) && (!selectedRows[0].blinded) && <MenuButton ml={10} bg={'primary'} fg={'white'} onClick={onBestReviewClick} disabled={bestReviewLoading}>리뷰ID {selectedRows[0].orderSeq} 우수리뷰선정</MenuButton>
                    }
                    {
                        (!search.blinded) && (selectedRows.length > 0 && <MenuButton ml={10} bg={'danger'} fg={'white'} onClick={onDeleteClick}>{selectedRows.length}건 블라인드</MenuButton>)
                    }
                    {
                        (search.blinded) && (selectedRows.length > 0 && <MenuButton ml={10} bg={'green'} fg={'white'} onClick={onNotDeleteClick}>{selectedRows.length}건 블라인드 복구</MenuButton>)
                    }
                </Space>
                <Right>
                    총 {dataList.length}명
                </Right>
            </Flex>

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

            {/* 상품 조회 */}
            <Modal isOpen={modalOpen && modalType === 'goodsInfo'} toggle={toggle} centered size={'lg'}>
                <ModalHeader toggle={toggle}>상품 수정</ModalHeader>
                <ModalBody style={{padding: 0}}>
                    <GoodsContent
                        goodsNo={selected}
                        onClose={toggle}
                    />
                </ModalBody>
            </Modal>

            {/* 리뷰 조회 */}
            <Modal isOpen={modalOpen && modalType === 'reviewInfo'} toggle={toggle} centered size={'lg'}>
                <ModalHeader toggle={toggle}>{'리뷰정보' + (selected && selected.orderSeq ? '[리뷰ID:'+selected.orderSeq+']':"")}</ModalHeader>
                <ModalBody style={{padding: 0}}>
                    <CmGoodsReviewDetail orderSeq={selected && selected.orderSeq} />
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
                            reportModalOpen && <ReportInfoViewContent data={reportSelected}/>
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
export default GoodsReviewList