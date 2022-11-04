import React, {Component, useEffect, useState} from 'react';
import { getRecommendFriends } from '~/lib/adminApi'
import { getLoginAdminUser } from '~/lib/loginApi'
import ComUtil from '~/util/ComUtil'
import { ExcelDownload } from '~/components/common'
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import { AgGridReact } from 'ag-grid-react';
import {Div, FilterGroup, Flex, Right, Space, Span} from "~/styledComponents/shared";
import ConsumerDetail from "~/components/common/contents/ConsumerDetail";
import AbuserRenderer from "~/components/common/agGridRenderers/AbuserRenderer";
import {useModal} from "~/util/useModal";
import moment from "moment-timezone";
import SearchDates from "~/components/common/search/SearchDates";
import {MenuButton} from "~/styledComponents/shared/AdminLayouts";
import FilterContainer from "~/components/common/gridFilter/FilterContainer";
import InputFilter from "~/components/common/gridFilter/InputFilter";

const RecommendAbuserRenderer = (props) => {
    const data = {
        consumerNo: props.data.recommenderNo
    }
    return <AbuserRenderer
        data={data}
    />
}

const FriendAbuserRenderer = (props) => {
    const data = {
        consumerNo: props.data.friendNo
    }
    return <AbuserRenderer
        data={data}
    />
}

const RecommendFriendList = (props) => {

    const [gridApi, setGridApi] = useState(null);
    const [columnApi, setColumnApi] = useState(null);

    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()

    const [search, setSearch] = useState({
        isSearch:true,
        selectedGubun: 'day', //'week': 최초화면을 오늘(day)또는 1주일(week)로 설정.
        startDate: moment(moment().toDate()),
        endDate: moment(moment().toDate()),
    });

    const [dataList, setDataList] = useState([]);
    const [excelData, setDataExcel] = useState([]);

    const agGrid = {
        columnDefs: [
            {headerName: "추천인번호", field: "recommenderNo",width: 100},
            {headerName: "추천인이름", field: "recommenderName", width: 100, cellRenderer: "recommenderNameRenderer"},
            {headerName: "어뷰저", field: "recommenderAbuser", width: 100, cellRenderer: "recommenderAbuserRenderer"},
            {headerName: "추천인email", field: "recommenderEmail", width: 180},
            {headerName: "추천인phone", field: "recommenderPhone", width: 120},
            {headerName: "친구번호", field: "friendNo",width: 100},
            {headerName: "친구이름", field: "friendName",width: 100, cellRenderer: "friendNameRenderer"},
            {headerName: "어뷰저", field: "friendAbuser", width: 100, cellRenderer: "friendAbuserRenderer"},
            {headerName: "친구email", field: "friendEmail", width: 180},
            {headerName: "친구phone", field: "friendPhone", width: 120},
            {headerName: "친구가입일", field: "joinTime", width: 150, cellRenderer:"dateRenderer"}
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
            dateRenderer: dateRenderer,
            recommenderNameRenderer: recommenderNameRenderer,
            friendNameRenderer: friendNameRenderer,
            recommenderAbuserRenderer: RecommendAbuserRenderer,
            friendAbuserRenderer: FriendAbuserRenderer
        },
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
    };

    //[이벤트] 그리드 로드 후 callback 이벤트 API init
    const onGridReady = params => {
        setGridApi(params.api);
        setColumnApi(params.columnApi);
    };

    function dateRenderer ({data:rowData}) {
        return (<span>{ComUtil.longToDateTime(rowData.joinTime, "YYYY-MM-DD HH:mm:ss")}</span>)
    }

    function recommenderNameRenderer ({value, data:rowData}) {
        return <Span fg={'primary'} onClick={onNameClick.bind(this, rowData.recommenderNo)}><u>{value}</u></Span>
    }

    function friendNameRenderer ({value, data:rowData}) {
        return <Span fg={'primary'} onClick={onNameClick.bind(this, rowData.friendNo)}><u>{value}</u></Span>
    }

    const onNameClick = (data) => {
        setSelected(data)
        toggle()
    }

    const toggle = () => {
        setModalState(!modalOpen)
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

    useEffect(()=> {
        async function fetch() {
            await setExcelData();
        }
        fetch();
    }, [dataList]);

    useEffect(() => {
        async function getData() {
            if(search.isSearch) {
                await getSearch();
            }
        }
        getData();
    }, [search]);

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
            endDate:search.endDate ? moment(search.endDate).format('YYYYMMDD'):null
        };
        const { status, data } = await getRecommendFriends(params)
        if(status !== 200){
            alert('응답이 실패 하였습니다')
            return
        }
        setDataList(data);

        //ag-grid api
        if(gridApi) {
            //ag-grid 레이지로딩중 감추기
            gridApi.hideOverlay()
        }
    }

    const setExcelData = () => {
        let excelData = getExcelData();
        setDataExcel(excelData);
    }

    const getExcelData = () => {
        const columns = [
            '추천인번호', '추천인이름', '추천인email', '추천인phone',
            '친구번호', '친구이름', '친구email', '친구phone', '친구가입일'
        ]

        //필터링 된 데이터에서 sortedData._original 로 접근하여 그리드에 바인딩 원본 값을 가져옴
        const data = dataList.map((item ,index)=> {
            let joinTime = ComUtil.longToDateTime(item.joinTime)
            return [
                item.recommenderNo, item.recommenderName, item.recommenderEmail, item.recommenderPhone,
                item.friendNo, item.friendName, item.friendEmail, item.friendPhone, joinTime
            ]
        })

        return [{
            columns: columns,
            data: data
        }]
    }

    const copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    const onDatesChange = async (data) => {
        const search = Object.assign({}, search);
        search.startDate = data.startDate;
        search.endDate = data.endDate;
        search.selectedGubun = data.gubun;
        search.isSearch = data.isSearch;
        setSearch(search);
    }

    return (
        <Div p={16}>

            <Flex p={10} mb={10} bc={'secondary'}>
                <Space>
                    <Div>기 간 (가입일)</Div>
                    <SearchDates
                        isHiddenAll={true}
                        isCurrenYeartHidden={true}
                        gubun={search.selectedGubun}
                        startDate={search.startDate}
                        endDate={search.endDate}
                        onChange={onDatesChange}
                    />
                    <MenuButton onClick={() => getSearch(true)}> 검 색 </MenuButton>
                </Space>
            </Flex>

            {/* filter START */}
            <FilterContainer gridApi={gridApi} columnApi={columnApi} excelFileName={'추천친구목록'}>
                <FilterGroup>
                    <InputFilter
                        gridApi={gridApi}
                        columns={[
                            {field: 'recommenderNo', name: '추천인번호'},
                            {field: 'recommenderName', name: '추천인이름'},
                            {field: 'recommenderEmail', name: '추천인이메일'},
                            {field: 'recommenderPhone', name: '추천인연락처'},
                            {field: 'friendNo', name: '친구번호'},
                            {field: 'friendName', name: '친구이름'},
                            {field: 'friendEmail', name: '친구이메일'},
                            {field: 'friendPhone', name: '친구연락처'},
                        ]}
                        isRealTime={true}
                    />
                </FilterGroup>
            </FilterContainer>
            {/* filter END */}

            <Flex mb={10}>
                <Space>
                    <ExcelDownload data={excelData}
                                   fileName="추천친구조회"
                                   buttonName = "Excel 다운로드"
                    />
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
                    // enableSorting={true}                //정렬 여부
                    // enableFilter={true}                 //필터링 여부
                    columnDefs={agGrid.columnDefs}  //컬럼 세팅
                    rowSelection={'single'}
                    defaultColDef={agGrid.defaultColDef}
                    // enableColResize={true}              //컬럼 크기 조정
                    overlayLoadingTemplate={agGrid.overlayLoadingTemplate}
                    overlayNoRowsTemplate={agGrid.overlayNoRowsTemplate}
                    onGridReady={onGridReady}   //그리드 init(최초한번실행)
                    rowData={dataList}
                    frameworkComponents={agGrid.frameworkComponents}
                    onCellDoubleClicked={copy}
                >
                </AgGridReact>
            </div>
            <Modal size="lg" isOpen={modalOpen}
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
export default RecommendFriendList