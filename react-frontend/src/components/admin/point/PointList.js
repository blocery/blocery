import React, {useEffect, useState} from 'react';
import {Button, Input, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import ComUtil from '~/util/ComUtil'
import {pointList, consumerPointList} from '~/lib/adminApi'

//ag-grid
import { AgGridReact } from 'ag-grid-react';
import {Button as StyledButton, Div, FilterGroup, Flex, Hr, Img, Right, Space, Span} from "~/styledComponents/shared";

import moment from "moment-timezone";

import SearchDates from '~/components/common/search/SearchDates'
import ConsumerDetail from "~/components/common/contents/ConsumerDetail";
import {getLoginAdminUser} from "~/lib/loginApi";
import {useModal} from "~/util/useModal";
import {Server} from "~/components/Properties";
import {FaRegGrinBeam,FaRegFrown} from 'react-icons/fa'
import FilterContainer from "~/components/common/gridFilter/FilterContainer";
import InputFilter from "~/components/common/gridFilter/InputFilter";
import CheckboxFilter from "~/components/common/gridFilter/CheckboxFilter";
import {MenuButton} from "~/styledComponents/shared/AdminLayouts";

const PointList = (props) => {

    const [gridApi, setGridApi] = useState(null);
    const [columnApi, setColumnApi] = useState()
    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()
    const [modalType, setModalType] = useState("")
    const [searchConsumerNo, setSearchConsumerNo] = useState();

    const [search, setSearch] = useState({
        isSearch:false,
        selectedGubun: 'day', //'week': 최초화면을 오늘(day)또는 1주일(week)로 설정.
        startDate: moment(moment().toDate()),
        endDate: moment(moment().toDate())
    });
    const [dataList, setDataList] = useState([]);

    const agGrid = {
        columnDefs: [
            {
                headerName: "dayDotNo", field: "dayDotConsumerNo",width: 120, pinned: 'left'
            },
            {
                headerName: "소비자번호", field: "consumerNo",width: 100, pinned: 'left'
            },
            {
                headerName: "이름", field: "name",width: 100, pinned: 'left', cellRenderer: "consumerNameRenderer"
            },
            {
                headerName: "닉네임", field: "nickname", width: 100, pinned: 'left', hide:true
            },
            {
                headerName: "이메일", field: "email", width: 100, pinned: 'left', hide:true
            },
            {
                headerName: "연락처", field: "phone", width: 100, pinned: 'left', hide:true
            },
            {
                headerName: "포인트일", field: "day", width: 100, pinned: 'left'
            },
            {
                headerName: "today로그인여부", field: "todayLogin", width: 150
            },
            {
                headerName: "today로그인점수", field: "todayLoginPoint", width: 150
            },
            {
                headerName: "today댓글개수", field: "replyCount", width: 150
            },
            {
                headerName: "today댓글점수", field: "todayReplyPoint", width: 150
            },
            {
                headerName: "today글쓴개수", field: "writeCount", width: 150
            },
            {
                headerName: "today글쓴점수", field: "todayWritePoint", width: 150
            },
            //친구추천은 bly + 쿠폰으로 대체됨
            // {
            //     headerName: "today피추천개수", field: "friendCount", width: 150
            // },
            // {
            //     headerName: "today피추천점수", field: "todayFriendPoint", width: 150
            // },
            // {
            //     headerName: "today친구첫구매개수", field: "friendFirstBuyCount", width: 150
            // },
            // {
            //     headerName: "today친구첫구매점수", field: "todayFriendBuyPoint", width: 150
            // },
            {
                headerName: "투표성공시점수", field: "voteRewardPoint", width: 150
            },
            {
                headerName: "룰렛점수", field: "roulettePoint", width: 150
            },
            {
                headerName: "today뱃지점수", field: "todayBadgePoint", width: 150
            },
            {
                headerName: "쿠폰으로전환", field: "toCouponAmount", width: 150
            },
            {
                headerName: "수동(스페셜)점수", field: "specialPoint", width: 150
            },
            {
                headerName: "수동(스페셜)명칭", field: "specialPointName", width: 150
            },
            {
                headerName: "수동(스페셜)비고", field: "specialDesc", width: 150
            },
            {
                headerName: "관리자 메모", field: "adminMemo", width: 150
            },
            {
                headerName: "배치여부", field: "batchChk", width: 100
            },
            {
                headerName: "배치시간", field: "batchTime", width: 150, cellRenderer: "batchTimeRenderer"
            },
            {
                headerName: "최종점수", field: "todayTotalPoint", width: 150
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
            dateRenderer: dateRenderer,
            batchTimeRenderer: batchTimeRenderer,
            consumerNameRenderer: consumerNameRenderer
        },
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
    };
    function dateRenderer ({value,data:rowData}) {
        return (<span>{value ? ComUtil.utcToString(value, "YYYY-MM-DD HH:mm:ss"):''}</span>)
    }
    function batchTimeRenderer ({value,data:rowData}) {
        if(value === 0){
            return '미처리';
        }
        return (<span>{value ? ComUtil.longToDateTime(value, "YYYY-MM-DD HH:mm:ss"):''}</span>)
    }
    function consumerNameRenderer ({value, data:rowData}) {
        return <Span fg={'primary'} onClick={onNameClick.bind(this, rowData.consumerNo)}><u>{value?value:'이름없음'}</u></Span>
    }

    //[이벤트] 그리드 로드 후 callback 이벤트 API init
    const onGridReady = params => {
        setGridApi(params.api);
        setColumnApi(params.columnApi)
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
            endDate:search.endDate ? moment(search.endDate).format('YYYYMMDD'):null
        };
        const { status, data } = await pointList(params)
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

    const toggle = () => {
        setModalState(!modalOpen)
    }

    const onNameClick = (data) => {
        setModalType("consumerInfo")
        setSelected(data)
        toggle()
    }

    const copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    const onDatesChange = async (data) => {
        const searchInfo = Object.assign({},search)
        searchInfo.startDate = data.startDate;
        searchInfo.endDate = data.endDate;
        searchInfo.selectedGubun = data.gubun;
        searchInfo.isSearch = data.isSearch;
        // if(data.gubun === 'all') {
        //     searchInfo.isSearch = data.isSearch;
        // }else {
        //     searchInfo.isSearch = false;
        // }
        setSearch(
            searchInfo
        )
    }

    const onConsumerSearchByChange = (e) => {
        setSearchConsumerNo(e.target.value);
    }

    //1건 독립조회
    const oneConsumerSearch = async() => {
        if(gridApi) {
            //ag-grid 레이지로딩중 보이기
            gridApi.showLoadingOverlay();
        }

        const {status, data} = await consumerPointList(searchConsumerNo);
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
                    <MenuButton onClick={() => getSearch(true)}> 검 색 </MenuButton>
                </Space>
            </Div>

            <Div p={10} bc={'secondary'} mb={10}>
                <Space>
                    <Input type='text' name='consumerSearchBy' placeholder="소비자번호" style={{width: 130}} onChange={onConsumerSearchByChange}/>
                    <Button onClick={oneConsumerSearch} className={'ml-2'}> 소비자 별도조회 </Button>
                </Space>
            </Div>

            {/* filter START */}
            <FilterContainer gridApi={gridApi} columnApi={columnApi} excelFileName={'포인트 목록'}>
                <FilterGroup>
                    <InputFilter
                        gridApi={gridApi}
                        columns={[
                            {field: 'consumerNo', name: '소비자번호'},
                            {field: 'name', name: '이름'},
                            {field: 'nickname', name: '닉네임'},
                            {field: 'email', name: '이메일'},
                            {field: 'phone', name: '연락처'},
                        ]}
                        isRealTime={true}
                    />
                </FilterGroup>
                <Hr/>
                <FilterGroup>
                    <CheckboxFilter
                        gridApi={gridApi}
                        field={'todayLogin'}
                        name={'today로그인여부'}
                        data={[
                            {value: false, name: 'false'},
                            {value: true, name: 'true'},
                        ]}
                    />
                    <CheckboxFilter
                        gridApi={gridApi}
                        field={'batchChk'}
                        name={'배치여부'}
                        data={[
                            {value: false, name: 'false'},
                            {value: true, name: 'true'},
                        ]}
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
                    height: '500px'
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
                    onCellDoubleClicked={copy}
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
export default PointList