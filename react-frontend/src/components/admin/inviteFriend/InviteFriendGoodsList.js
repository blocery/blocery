import React, {useEffect, useState} from "react";
import {BlocerySpinner} from "~/components/common";
import {AgGridReact} from "ag-grid-react";
import ComUtil from "~/util/ComUtil";
import {getLoginAdminUser} from "~/lib/loginApi";
import {getInviteFriendGoodsList} from"~/lib/adminApi";
import {Div, FilterGroup, Flex, Span} from "~/styledComponents/shared";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {useModal} from "~/util/useModal";
import moment from "moment-timezone";

import ConsumerDetail from "~/components/common/contents/ConsumerDetail";
import AbuserRenderer from "~/components/common/agGridRenderers/AbuserRenderer";
import StoppedUserRenderer from "~/components/common/agGridRenderers/StoppedUserRenderer";
import SearchDates from "~/components/common/search/SearchDates";
import FilterContainer from "~/components/common/gridFilter/FilterContainer";
import InputFilter from "~/components/common/gridFilter/InputFilter";
import CheckboxFilter from "~/components/common/gridFilter/CheckboxFilter";

const FriendAbuserRenderer = (props) => {
    const data = {
        consumerNo: props.data.friendNo
    }
    return <AbuserRenderer
        data={data}
    />
}

const InviteFriendGoodsList = (props) => {

    const [gridApi, setGridApi] = useState(null);

    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()

    const [search, setSearch] = useState({
        isSearch:true,
        selectedGubun: 'day', //'week': 최초화면을 오늘(day)또는 1주일(week)로 설정.
        startDate: moment(moment().toDate()),
        endDate: moment(moment().toDate()),
    });

    const [dataList, setDataList] = useState([]);

    const [totalCount, setTotalCount] = useState(0);
    const [totalWon, setTotalWon] = useState(0);
    const [totalBly, setTotalBly] = useState(0);

    const agGrid = {
        columnDefs: [
            {headerName: "고객번호", field: "consumerNo", width: 100, cellStyle:ComUtil.getCellStyle({cellAlign: 'center'})},
            {headerName: "이름", field: "name", width: 100, cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}), cellRenderer: "nameRenderer"},
            {headerName: "어뷰징", field: "abuser",
                suppressFilter: true,   //no filter
                suppressSorting: true,  //no sort
                cellRenderer: "abuserRenderer"},
            {headerName: "이메일", field: "email", width: 200, cellStyle:ComUtil.getCellStyle({cellAlign: 'center'})},
            {headerName: "연락처", field: "phone", width: 130, cellStyle:ComUtil.getCellStyle({cellAlign: 'center'})},
            {headerName: "지급금액", field: "rewardWon", width: 130, cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}), cellRenderer: 'formatCurrencyRenderer'},
            {headerName: "지급BLY", field: "blyAmount", width: 130, cellStyle:ComUtil.getCellStyle({cellAlign: 'center'})},
            {headerName: "환율", field: "exchangeRate", width: 130, cellStyle:ComUtil.getCellStyle({cellAlign: 'center'})},
            {headerName: "친구 이름", field: "friendName", width: 100, cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}), cellRenderer: "friendNameRenderer"},
            {headerName: "어뷰징", field: "friendAbuser",
                suppressFilter: true,   //no filter
                suppressSorting: true,  //no sort
                cellRenderer: "friendAbuserRenderer"},
            {headerName: "친구 이메일", field: "friendEmail", width: 200, cellStyle:ComUtil.getCellStyle({cellAlign: 'center'})},
            {headerName: "친구 전화", field: "friendPhone", width: 200, cellStyle:ComUtil.getCellStyle({cellAlign: 'center'})},
            {headerName: "상품명", field: "goodsNm", width: 250, cellStyle:ComUtil.getCellStyle({cellAlign: 'left'})},
            {headerName: "구매확정일", field: "consumerOkDate", width: 180, cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}), cellRenderer: 'formatDateTimeRenderer'},
            {headerName: "리워드일", field: "rewardDate", width: 200, cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}), cellRenderer: 'formatUtcDateTimeRenderer'},
        ],
        defaultColDef: {
            width: 110,
            resizable: true,
            filter: true,
            sortable: true,
            floatingFilter: true,
            filterParams: {
                newRowsAction: 'keep'
            }
        },
        rowHeight:35,
        frameworkComponents: {
            nameRenderer: nameRenderer,
            abuserRenderer: AbuserRenderer,
            friendNameRenderer: friendNameRenderer,
            friendAbuserRenderer: FriendAbuserRenderer,
            stoppedUserRenderer: StoppedUserRenderer,
            formatCurrencyRenderer: formatCurrencyRenderer,
            formatDateTimeRenderer: formatDateTimeRenderer,
            formatUtcDateTimeRenderer: formatUtcDateTimeRenderer
        },
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>'
    };

    //Ag-Grid Cell 숫자콤마적용 렌더러
    function formatCurrencyRenderer ({value, data: rowData}) {
        //console.log("rowData",rowData);
        return ComUtil.addCommas(value);
    };
    //Ag-Grid Cell 날짜변환 렌더러
    function formatDateTimeRenderer ({value, data: rowData}){
        return (value ? ComUtil.utcToString(value, 'YYYY-MM-DD HH:mm') : '-')
    };

    //Ag-Grid Cell 날짜변환 렌더러
    function formatUtcDateTimeRenderer ({value, data: rowData}) {
        let result = ComUtil.utcToString(value,"YYYY-MM-DD HH:mm")
        return result;
    };

    function nameRenderer ({value, data}) {
        return <Span fg={'primary'} onClick={onNameClick.bind(this, data.consumerNo)}><u>{value}</u></Span>
    }

    function friendNameRenderer ({value, data}) {
        return <Span fg={'primary'} onClick={onNameClick.bind(this, data.friendNo)}><u>{value}</u></Span>
    }

    //[이벤트] 그리드 로드 후 callback 이벤트 API init
    const onGridReady = params => {
        setGridApi(params.api);
    };

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
        const {status, data} = await getInviteFriendGoodsList(params);
        if (status !== 200) {
            alert('응답이 실패 하였습니다');
            return;
        }

        let iTotalWon = 0;
        let iTotalBly = 0;
        data.map(item => {
            iTotalBly = ComUtil.doubleAdd(iTotalBly, item.blyAmount);
            iTotalWon += item.rewardWon;
        })

        setDataList(data);
        setTotalCount(data.length);
        setTotalWon(iTotalWon);
        setTotalBly(iTotalBly);

        //ag-grid api
        if(gridApi) {
            //ag-grid 레이지로딩중 감추기
            gridApi.hideOverlay()
        }
    }

    const onNameClick = (consumerNo) => {
        setSelected(consumerNo)
        setModalOpen(true);
    }

    const onToggle = () => {
        setModalOpen(!modalOpen)
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
        <div>
            <div className="ml-2 mt-2 mr-2">
                <Flex bc={'secondary'} m={3} p={7}>
                    <Div pl={10} pr={20} py={1}> 기 간 (리워드일) </Div>
                    <Div ml={10} >
                        <Flex>
                            <SearchDates
                                gubun={search.selectedGubun}
                                startDate={search.startDate}
                                endDate={search.endDate}
                                onChange={onDatesChange}
                            />
                            <Button className="ml-3" color="primary" onClick={() => getSearch(true)}> 검 색 </Button>
                        </Flex>
                    </Div>
                </Flex>
            </div>

            {/* filter START */}
            <FilterContainer gridApi={gridApi} excelFileName={'친추가입 적립내역'}>
                <FilterGroup>
                    <InputFilter
                        gridApi={gridApi}
                        columns={[
                            {field: 'consumerNo', name: '고객번호'},
                            {field: 'name', name: '이름'},
                            {field: 'email', name: '이메일'},
                            {field: 'phone', name: '연락처'},
                            {field: 'friendName', name: '친구이름'},
                            {field: 'friendEmail', name: '친구이메일'},
                            {field: 'friendPhone', name: '친구전화'},
                        ]}
                        isRealTime={true}
                    />
                </FilterGroup>
                {/*<Hr/>*/}
                {/*<FilterGroup>*/}
                {/*    <CheckboxFilter*/}
                {/*        gridApi={gridApi}*/}
                {/*        field={'authType'}*/}
                {/*        name={'가입경로'}*/}
                {/*        data={[*/}
                {/*            {value: '0', name: '일반'},*/}
                {/*            {value: '1', name: '카카오'},*/}
                {/*        ]}*/}
                {/*    />*/}
                {/*    <CheckboxFilter*/}
                {/*        gridApi={gridApi}*/}
                {/*        field={'stoppedUser'}*/}
                {/*        name={'탈퇴여부'}*/}
                {/*        data={[*/}
                {/*            {value: true, name: '탈퇴'},*/}
                {/*            {value: false, name: '미탈퇴'},*/}
                {/*        ]}*/}
                {/*    />*/}
                {/*</FilterGroup>*/}
            </FilterContainer>
            {/* filter END */}

            <div className="p-1 pl-3 pt-2">
                총 건수 : {ComUtil.addCommas(totalCount)}건, 친구 상품구매 적립금: {ComUtil.toCurrency(totalWon)}원, ({ComUtil.toCurrency(totalBly)} BLY)
            </div>

            <div className="p-1">
                <div
                    id="myGrid"
                    className="ag-theme-balham"
                    style={{
                        height: '550px'
                    }}
                >
                    <AgGridReact
                        gridOptions={agGrid}
                        rowData={dataList}
                        onGridReady={onGridReady}
                        onCellDoubleClicked={copy}
                    >
                    </AgGridReact>
                </div>
            </div>
            <Modal size="lg" isOpen={modalOpen}
                   toggle={onToggle} >
                <ModalHeader toggle={onToggle}>
                    소비자 상세 정보
                </ModalHeader>
                <ModalBody>
                    <ConsumerDetail consumerNo={selected} onClose={onToggle} />
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={onToggle}>닫기</Button>
                </ModalFooter>
            </Modal>
        </div>
    )
}
export default InviteFriendGoodsList