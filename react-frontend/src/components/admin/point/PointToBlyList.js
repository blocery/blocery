import React, {useEffect, useState} from 'react';
import {getAllPointBlyHistory} from "~/lib/adminApi";
import { AgGridReact } from "ag-grid-react";
import moment from "moment-timezone";
import ComUtil from "~/util/ComUtil";
import {getLoginAdminUser} from "~/lib/loginApi";
import {Div, FilterGroup, Flex, Hr, Right, Space, Span} from "~/styledComponents/shared";
import SearchDates from "~/components/common/search/SearchDates";
import {MenuButton} from "~/styledComponents/shared/AdminLayouts";
import FilterContainer from "~/components/common/gridFilter/FilterContainer";
import InputFilter from "~/components/common/gridFilter/InputFilter";
import {Button, Input, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import ConsumerDetail from "~/components/common/contents/ConsumerDetail";
import {useModal} from "~/util/useModal";


const PointToBlyList = (props) => {
    const [gridApi, setGridApi] = useState(null);
    const [columnApi, setColumnApi] = useState()
    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()
    const [modalType, setModalType] = useState("")

    const [search, setSearch] = useState({
        selectedGubun: 'day', //'week': 최초화면을 오늘(day)또는 1주일(week)로 설정.
        startDate: moment(moment().toDate()),
        endDate: moment(moment().toDate()),
        consumerNo: 0
    });

    const [dataList, setDataList] = useState([]);
    const agGrid = {
        columnDefs: [
            {
                headerName: "No", field: "pointHistoryNo", width: 100
            },
            {
                headerName: "소비자번호", field: "consumerNo", width: 120,  cellRenderer: "consumerNoRenderer"
            },
            {
                headerName: "이름", field: "name", width: 120
            },
            {
                headerName: "닉네임", field: "nickname", width: 150
            },
            {
                headerName: "변환일", field: "pointBlyTime", width: 250,
                valueGetter: function(params) {
                    return ComUtil.utcToString(params.data.pointBlyTime, "YYYY-MM-DD HH:mm:ss")
                }
            },
            {
                headerName: "변환포인트", field: "pointAmount", width: 150,
                valueGetter: function(params) {
                    return ComUtil.addCommas(params.data.pointAmount);
                }
            },
            {
                headerName: "BLY", field: "blyAmount", width: 120,
                valueGetter: function(params) {
                    return ComUtil.addCommas(params.data.blyAmount);
                }
            },
            {
                headerName: "환율 ", field: "exchangeRate", width: 100
            },
        ],
        rowHeight:35,
        defaultColDef: {
            width: 100,
            filter: true,
            sortable: true,
            floatingFilter: false,
            resizable: true,
            filterParams: {
                newRowsAction: 'keep'
            }
        },
        frameworkComponents: {
            consumerNoRenderer: consumerNoRenderer
        },
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
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

    //[이벤트] 그리드 로드 후 callback 이벤트 API init
    const onGridReady = params => {
        setGridApi(params.api);
        setColumnApi(params.columnApi)
    };

    const getSearch = async () => {
        if(gridApi) {
            //ag-grid 레이지로딩중 보이기
            gridApi.showLoadingOverlay();
        }
        const params = {
            startDate:search.startDate ? moment(search.startDate).format('YYYYMMDD'):null,
            endDate:search.endDate ? moment(search.endDate).format('YYYYMMDD'):null,
            consumerNo: search.consumerNo
        };
        const { status, data } = await getAllPointBlyHistory(params)

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

    function consumerNoRenderer ({value, data:rowData}) {
        return <Span fg={'primary'} onClick={onNameClick.bind(this, rowData.consumerNo)}><u>{value}</u></Span>
    }

    const onNameClick = (data) => {
        setModalType("consumerInfo")
        setSelected(data)
        toggle()
    }

    const toggle = () => {
        setModalState(!modalOpen)
    }

    const onDatesChange = async (data) => {
        const searchInfo = Object.assign({},search)
        searchInfo.startDate = data.startDate;
        searchInfo.endDate = data.endDate;
        searchInfo.selectedGubun = data.gubun;
        searchInfo.consumerNo = search.consumerNo;

        setSearch(searchInfo)
    }

    const onConsumerNoChange = (e) => {
        setSearch({
            ...search,
            consumerNo: e.target.value
        })
    }

    return (
        <Div p={16}>

            <Div p={10} mb={10} bc={'secondary'}>
                <Space>
                    <Div> 기 간 (포인트일) </Div>
                    <SearchDates
                        gubun={search.selectedGubun}
                        startDate={search.startDate}
                        endDate={search.endDate}
                        onChange={onDatesChange}
                    />

                    <Div> | 소비자번호 </Div>
                    <input className="ml-1" style={{width:'100px'}} type="text" name="consumerNo" value={search.consumerNo||''} onChange={onConsumerNoChange}/>

                    <MenuButton onClick={() => getSearch()}> 검 색 </MenuButton>
                </Space>
            </Div>

            {/* filter START */}
            <FilterContainer gridApi={gridApi} columnApi={columnApi} excelFileName={'포인트전환 목록'}>
                <FilterGroup>
                    <InputFilter
                        gridApi={gridApi}
                        columns={[
                            {field: 'consumerNo', name: '소비자번호'},
                        ]}
                        isRealTime={true}
                    />
                </FilterGroup>
            </FilterContainer>

            <Flex mb={10}>
                <Space></Space>
                <Right>총 {dataList.length}건</Right>
            </Flex>

            <div
                className="ag-theme-balham"
                style={{
                    height: '700px'
                }}
            >
                <AgGridReact
                    columnDefs={agGrid.columnDefs}  //컬럼 세팅
                    rowSelection={'single'}
                    rowHeight={agGrid.rowHeight}
                    defaultColDef={agGrid.defaultColDef}
                    overlayLoadingTemplate={agGrid.overlayLoadingTemplate}
                    overlayNoRowsTemplate={agGrid.overlayNoRowsTemplate}
                    onGridReady={onGridReady}   //그리드 init(최초한번실행)
                    suppressRowClickSelection={false}
                    rowData={dataList}
                    frameworkComponents={agGrid.frameworkComponents}
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
        </Div>
    )
}

export default PointToBlyList