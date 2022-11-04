import React, {useEffect, useState, useRef} from 'react';
import {getOrderDetailListByOrderSubGroupNos, getOrderSubGroupList} from "~/lib/producerApi";
import moment from "moment-timezone";
import {AgGridReact} from "ag-grid-react";
import {Div, FilterGroup, Hr, Space} from "~/styledComponents/shared";
import SearchDates from "~/components/common/search/SearchDates";
import {Button, FormGroup, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import AdminLayouts from "~/styledComponents/shared/AdminLayouts";
import ComUtil from "~/util/ComUtil";
import {useModal} from "~/util/useModal";
import OrderListModalContent from "~/components/producer/web/orderList/OrderListModalContent";
import InputFilter from "~/components/common/gridFilter/InputFilter";
import CheckboxFilter from "~/components/common/gridFilter/CheckboxFilter";
import FilterContainer from "~/components/common/gridFilter/FilterContainer";
import AgGridUtil from "~/util/AgGridUtil";
import {BsPrinter, RiFileExcel2Line} from "react-icons/all";
import {color} from "~/styledComponents/Properties";
import {getLoginAdminUser} from "~/lib/loginApi";
import UpdateProgressStateModalContent from "~/components/producer/web/orderList/UpdateProgressStateModalContent";
import {Server} from "~/components/Properties";
import {TYPE_OF_IMAGE} from "~/lib/bloceryConst";
import CancelOrderSubGroupContent from "~/components/producer/web/orderList/CancelOrderSubGroupContent";
import ConsumerDetail from "~/components/common/contents/ConsumerDetail";
import ExcelUtil from "~/util/ExcelUtil";

const EXCEL_DOWN_TYPE = {
    DELIVERY: 'delivery'
}

const KIND = {
    PRINT: 'print',
    UPDATE_PROGRESS_STATE: 'updateProgressState',
    IMAGE_VIEWER: 'imageViewer',
    CANCEL_ORDER_SUBGROUP: 'cancelOrderSubGroup',
    CONSUMER_DETAIL: 'consumerDetail',
}

function cellStrike(params){
    if((params.data.listSize - (params.data.cancelledDirectOrderCount+params.data.cancelledDealOrderCount)) <= 0){
        return {textDecoration:"line-through", color: 'red'};
    }
    return null
}
function DeliveryImageRenderer({data}) {
    if (data.deliveryImages.length > 0)
        return <img style={{width: 27, height: 27, display: 'inline-block'}} src={Server.getThumbnailURL(TYPE_OF_IMAGE.SMALL_SQUARE) + data.deliveryImages[0].imageUrl} />

    return null
}

const WebSubGroupList = (props) => {

    const gridRef = useRef();

    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [rowData, setRowData] = useState(null);
    const [selectedCount, setSelectedCount] = useState(0)
    const [isModalOpen, , selected, setSelected, , toggle] = useModal(false, )

    const [searchOption, setSearchOption] = useState({
        selectedGubun: 'day', //'week': 최초화면을 오늘(day)또는 1주일(week)로 설정.
        startDate: moment(moment().toDate()).add(-1,"days"),
        endDate: moment(moment().toDate()),
    })


    //tempAdmin일때 취소 출력.
    useEffect(() => {
        async function loginCheck(){
            let adminUser = await getLoginAdminUser();
            console.log('adminUser:', adminUser.email)
            if (adminUser && adminUser.email === 'tempProducer@ezfarm.co.kr') {
                //setTempProducerAdmin(true)
                let temp = Object.assign([], columnDefs)
                temp.push({headerName: '사용쿠폰번호', field: 'usedCouponNo', width: 100} )
                temp.push({headerName: '쿠폰Bly', field: 'usedCouponBlyAmount', cellStyle: cellStrike, width: 130} )
                temp.push({headerName: '취소', field: 'orderSubGroupNo',cellRenderer: "cancelOrderGroupRenderer", width: 130} )

                const consumerNameCol = temp.find(col => col.field === 'consumerName')
                consumerNameCol.cellStyle = AgGridUtil.cellStyleClick()
                consumerNameCol.onCellClicked = onConsumerClick
                setColumnDefs(temp)
            }
        }
        loginCheck()
    }, [])

    const onConsumerClick = ({data}) => {
        setSelected({kind: KIND.CONSUMER_DETAIL, data: [data.consumerNo]})
        toggle()
    }


    const searchOrderGroupList = async () => {

        const {api} = gridRef.current;

        if(api) {
            //ag-grid 레이지로딩중 보이기
            api.showLoadingOverlay();
        }

        const newSearchOption = {...searchOption}
        const startDate = newSearchOption.startDate ? moment(newSearchOption.startDate).format('YYYYMMDD'):null;
        const endDate = newSearchOption.endDate ? moment(newSearchOption.endDate).format('YYYYMMDD'):null;

        const params = {
            startDate,
            endDate
        }
        // console.time("test")
        const {status, data} = await getOrderSubGroupList(params)
        // console.timeEnd("test")
        if (status !== 200) {
            alert('에러가 발생 하였습니다. 새로고침 / 로그인을 다시 시도해 주세요.');
            return
        }
        // console.log({data})
        let vRowData = null;
        if(data && data.length > 0){
            vRowData = data;
        }
        setRowData(vRowData)

        if(api) {
            //ag-grid 레이지로딩중 감추기
            api.hideOverlay();

            if(!vRowData){
                api.showNoRowsOverlay();
            }
        }

    }

    const onGridReady = (e) => {
        setGridApi(e.api);
        setGridColumnApi(e.columnApi);
        searchOrderGroupList();
    }

    const onDatesChange = async (data) => {
        setSearchOption({...searchOption, startDate: data.startDate, endDate: data.endDate, selectedGubun: data.gubun})
    }

    //검색 버튼
    const onSearchClick = async () => {
        // filter값 적용해서 검색하기
        await searchOrderGroupList()
    }

    const onSelectionChanged = (event) => {
        const count = gridApi.getSelectedRows().length
        setSelectedCount(count)
    }

    const onExcelDownClick = async (type) => {
        if (type === EXCEL_DOWN_TYPE.DELIVERY) {
            const columns = [
                '고유번호',
                '받는사람',
                '받는사람연락처',
                '주소',
                '배송메세지',
                '공동현관 출입번호',
                '주문그룹번호',
            ]

            const selectedRows = gridApi.getSelectedRows()
            const oData = selectedRows.map(row => ([
                row.localKey,
                row.receiverName,
                row.receiverPhone,
                row.addr,
                row.deliveryMsg,
                row.commonEnterPwd,
                row.orderSubGroupNo,
            ]))
            const dataExcel = [{
                columns: columns,
                data: oData
            }];
            ExcelUtil.download("주문그룹목록-배송용", dataExcel);
        }
    }

    //출력 모달 띄우기
    const onPrintModalClick = () => {

        const selectedRows = gridApi.getSelectedRows()

        //주문 서브그룹 배열
        const orderSubGroupNoList = selectedRows.map(item => item.orderSubGroupNo)

        setSelected({kind: KIND.PRINT, data: orderSubGroupNoList})

        toggle()
    }

    //배송시작 or 배송완료 처리
    const onDeliveryFinishClick = async () => {

        const selectedRows = gridApi.getSelectedRows()

        //주문 서브그룹 배열
        // 0 미확인
        // 1 피킹중
        // 2 피킹완료 : 배송시작, 배송완료로 처리 가능 해야함
        // 4 배송시작 : 배송완료로 처리 가능 해야함
        // 3 배송완료
        // 99 전체취소된 건
        const impossibleList = selectedRows.filter(item => [0,1,3,99].includes(item.progressState))

        //체크된 건 중에 배송시작, 배송완료 처리 가능한게 하나도 없을때
        if (impossibleList.length === selectedRows.length) {
            alert('배송상태를 변경할 건이 없습니다.')
            return
        }

        const orderSubGroupNoList = selectedRows.map(item => item.orderSubGroupNo)

        setSelected({kind: KIND.UPDATE_PROGRESS_STATE, data: orderSubGroupNoList})

        toggle()
    }

    //주문그룹번호 클릭
    const onOrderSubGroupNoClick = ({data}) => {
        setSelected({kind: KIND.PRINT, data: [data.orderSubGroupNo]})
        toggle()
    }

    const onDeliveryImagesClick = ({data}) => {

        if (data.deliveryImages.length === 0) return

        setSelected({kind: KIND.IMAGE_VIEWER, data: data.deliveryImages})
        toggle()
    }

    const [columnDefs, setColumnDefs] = useState([
        {headerName: '상태', field: 'progressState', width: 120, headerCheckboxSelection: true, checkboxSelection: true,
            cellStyle:({data}) => {
                // 0 '미확인'
                // 1 피킹중
                // 2 피킹완료
                // 3 배송완료
                // 99 전체취소된 건
                if(![0,1,2,3,4].includes(data.progressState)) {
                    return {color: color.danger}
                }
                // else if (data.progressState === 2) {
                //     return {color: color.green}
                // }
                return null
            },
            valueGetter:({data}) => {
                // 0 '미확인'
                // 1 피킹중
                // 2 피킹완료
                // 3 배송완료
                // 99 전체취소된 건
                if (data.progressState === 0)
                    return '미확인'
                else if (data.progressState === 1)
                    return '피킹중 🛒'
                else if (data.progressState === 2)
                    return '피킹완료 📦'
                else if (data.progressState === 4)
                    return '배송시작 🏇'
                else if (data.progressState === 3)
                    return '배송완료 🚛'

                return '전체취소'
            }
        },
        {headerName: '고유번호', field: 'localKey', width: 110,
            cellStyle: AgGridUtil.cellStyleClick,
            onCellClicked: onOrderSubGroupNoClick
        },
        {headerName: '주문그룹번호', field: 'orderSubGroupNo', width: 110,
            cellStyle: AgGridUtil.cellStyleClick,
            onCellClicked: onOrderSubGroupNoClick
        },
        {headerName: '주문일시', field: 'orderDate', width: 100,
            valueGetter: function ({data}) {
                return ComUtil.utcToString(data.orderDate, 'MM/DD HH:mm')
            }
        },
        {
            headerName: '건수(주문-취소)', field: 'cancelledDirectOrderCount', width: 130,
            cellStyle: function (params){
                if((params.data.listSize - (params.data.cancelledDirectOrderCount+params.data.cancelledDealOrderCount)) == 0){
                    return {color:"red"};
                }
                return {color:""};
            },
            // valueFormatter: function ({data}) {
            //     return (data.listSize - (data.cancelledDirectOrderCount+data.cancelledDealOrderCount))
            //         + ' (' + data.listSize + '-' + (data.cancelledDirectOrderCount + data.cancelledDealOrderCount) + ')'
            // },
            valueGetter: function ({data}) {
                return (data.listSize - (data.cancelledDirectOrderCount+data.cancelledDealOrderCount))
                    + ' (' + data.listSize + '-' + (data.cancelledDirectOrderCount + data.cancelledDealOrderCount) + ')'
            }
        },
        {
            headerName: '배송일시', field: 'deliveryFee', width: 100, valueGetter: function ({data}) {
                return data.deliveryDate ? ComUtil.utcToString(data.deliveryDate, 'MM/DD HH:mm') : null
            }
            // cellRenderer: 'deliveryFeeRenderer'
        },
        {headerName: '배송이미지', field: 'deliveryImages', width: 120, cellRenderer: "deliveryImagesRenderer", onCellClicked: onDeliveryImagesClick},
        //{headerName: '사용쿠폰번호', field: 'usedCouponNo', width: 100},
        {headerName: '주문자', field: 'consumerName', width: 120},
        {headerName: '소비자번호', field: 'consumerNo', width: 100, hide: true},
        {headerName: '닉네임', field: 'consumerNickname', width: 120, hide: true},
        {headerName: '주문자 연락처', field: 'consumerPhone', width: 130, hide: true},
        {headerName: '받는이', field: 'receiverName', width: 130},
        {headerName: '받는이 연락처', field: 'receiverPhone', width: 130},

        {
            headerName: '배송비', field: 'deliveryFee', width: 100, cellStyle: cellStrike,
        },
        {headerName: '결제방법', field: 'payMethod', width: 100, hide: true},
        {
            headerName: '주소', field: 'addr', width: 300,
            cellStyle: cellStrike
        },
        {headerName: '배송 메세지', field: 'deliveryMsg', width: 130, hide: true},
        {headerName: '공동현관 출입번호', field: 'commonEnterPwd', width: 130, hide: true},
        {headerName: '받는이 연락처', field: 'receiverPhone', width: 130},
        {headerName: '출력여부', field: 'printed', width: 120,
            // cellStyle:({data}) => data.printed ? ({color:color.danger}) : null,
            valueGetter:({data}) => data.printed ? '완료' : '미완료'
        },
    ]);




    const toggleModal = () => {
        searchOrderGroupList()
        toggle()
    }

    //취소 모달./////////////////////////
    const onSubGroupCancelModal = ({orderSubGroupNo}) => {
        setSelected({kind: KIND.CANCEL_ORDER_SUBGROUP, data: [orderSubGroupNo]})
        toggle()
    }

    //tempProducer일때만 출력
    function CancelOrderGroupRenderer({value, data:rowData}) {
        if(rowData.progressState === 3){
            return null;
        }
        if (rowData.listSize - (rowData.cancelledDirectOrderCount+rowData.cancelledDealOrderCount) > 0){
            return (
                <AdminLayouts.SmButton fg={'danger'} onClick={onSubGroupCancelModal.bind(this, rowData)} >주문 취소</AdminLayouts.SmButton>
            );
        }else{
            return null;
        }
    }

    const copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    const {kind, data: selectedData} = selected || {kind: '', data: []}

    return (
        <>
            <FormGroup>
                <div className='border p-3'>
                    <div className='pt-3 pb-3 d-flex'>
                        <div className='d-flex'>
                            <div className='d-flex justify-content-center align-items-center textBoldLarge' fontSize={'small'}> 기 간 (주문일) </div>
                            <Div ml={10} >
                                <SearchDates
                                    isHiddenAll={true}
                                    isCurrenYeartHidden={true}
                                    gubun={searchOption.selectedGubun}
                                    startDate={searchOption.startDate}
                                    endDate={searchOption.endDate}
                                    onChange={onDatesChange}
                                />
                            </Div>
                        </div>
                        <div className='ml-auto d-flex'>
                            <AdminLayouts.MenuButton bg={'green'} onClick={onSearchClick} px={16}>검색</AdminLayouts.MenuButton>
                        </div>
                    </div>
                </div>
            </FormGroup>


            <FilterContainer gridApi={gridApi} columnApi={gridColumnApi} excelFileName={'주문그룹 목록'}>
                <FilterGroup>
                    <InputFilter
                        gridApi={gridApi}
                        columns={[
                            {field: 'orderSubGroupNo', name: '주문그룹번호', width: 80},
                            {field: 'consumerName', name: '주문자'},
                            {field: 'consumerPhone', name: '연락처'},
                            {field: 'addr', name: '주소'},
                        ]}
                        isRealTime={true}
                    />
                </FilterGroup>
                <Hr/>
                <FilterGroup>
                    <CheckboxFilter
                        gridApi={gridApi}
                        field={'printed'}
                        name={'출력상태'}
                        data={[
                            {value: '완료', name: '완료'},
                            {value: '미완료', name: '미완료'},
                        ]}
                    />
                    <CheckboxFilter
                        gridApi={gridApi}
                        field={'progressState'}
                        name={'상태'}
                        data={[
                            {value: '미확인', name: '미확인'},
                            {value: '피킹중 🛒', name: '피킹중 🛒'},
                            {value: '피킹완료 📦', name: '피킹완료 📦'},
                            {value: '배송시작 🏇', name: '배송시작 🏇'},
                            {value: '배송완료 🚛', name: '배송완료 🚛'},
                            {value: '전체취소', name: '전체취소'},
                        ]}
                    />
                </FilterGroup>
            </FilterContainer>


            <div className="d-flex pt-1 pb-1">
                {/*<div>총 {rowData ? ComUtil.addCommas(rowData.length) : 0} 개</div>*/}
                <div className='d-flex ml-auto'>
                    <Space>
                        <AdminLayouts.MenuButton
                            disabled={selectedCount === 0}
                            onClick={onExcelDownClick.bind(this, EXCEL_DOWN_TYPE.DELIVERY)}
                        >
                            <RiFileExcel2Line size={16}/>
                            <div>{selectedCount}건 배송용 엑셀다운로드</div>
                        </AdminLayouts.MenuButton>
                        <AdminLayouts.MenuButton
                            disabled={selectedCount === 0}
                            onClick={onPrintModalClick}
                            bg={'green'}
                        >
                            <BsPrinter size={16}/>
                            <div>{selectedCount}건 주문출력</div>
                        </AdminLayouts.MenuButton>
                        <AdminLayouts.MenuButton
                            disabled={selectedCount === 0}
                            onClick={onDeliveryFinishClick}
                            bg={'green'}
                        >
                            {selectedCount}건 배송상태 변경
                        </AdminLayouts.MenuButton>
                    </Space>

                </div>
            </div>

            <div id="myGrid" className="ag-theme-balham" style={{ height: '700px' }} >
                <AgGridReact
                    ref={gridRef}
                    onGridReady={onGridReady.bind(this)}
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={{
                        // width: 100,
                        resizable: true,
                        filter: true,
                        sortable: true,
                        floatingFilter: true,
                        filterParams: {
                            newRowsAction: 'keep'
                        },
                        headerCheckboxSelectionFilteredOnly: true
                    }}
                    overlayLoadingTemplate={'<span class="ag-overlay-loading-center">...정보를 불러오고 있습니다...</span>'}
                    overlayNoRowsTemplate={'<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>'}
                    rowSelection={'multiple'}
                    onSelectionChanged={onSelectionChanged}
                    onFilterChanged={() => {
                        // setSelectedCount(gridApi.getSelectedCount())
                        // gridApi.deselectAll()
                    }}
                    frameworkComponents={{
                        "cancelOrderGroupRenderer": CancelOrderGroupRenderer,
                        "deliveryImagesRenderer": DeliveryImageRenderer
                    }}
                    onCellDoubleClicked={copy}
                />
            </div>
            <Modal isOpen={kind === KIND.PRINT && isModalOpen} size={'xl'} backdrop={'static'} >
                <ModalHeader toggle={toggleModal}>
                    주문내역 출력
                </ModalHeader>
                <ModalBody>
                    <OrderListModalContent orderSubGroupNoList={selectedData} />
                </ModalBody>
            </Modal>

            <Modal isOpen={kind === KIND.UPDATE_PROGRESS_STATE && isModalOpen} size={'xl'} backdrop={'static'} >
                <ModalHeader toggle={toggleModal}>
                    배송상태 변경
                </ModalHeader>
                <ModalBody>
                    <UpdateProgressStateModalContent orderSubGroupNoList={selectedData} />
                </ModalBody>
            </Modal>
            <Modal isOpen={kind === KIND.IMAGE_VIEWER && isModalOpen} toggle={toggle} size={'md'} >
                <ModalHeader toggle={toggle}>
                    배송완료 이미지
                </ModalHeader>
                <ModalBody>
                    {
                        selectedData.map(image =>
                            <img style={{display: 'block', width: '100%'}} src={Server.getImageURL() + image.imageUrl} />
                        )
                    }
                </ModalBody>
            </Modal>
            <Modal isOpen={kind === KIND.CANCEL_ORDER_SUBGROUP && isModalOpen} size={'lg'} toggle={toggle}>
                <ModalHeader toggle={toggle}>
                    [주문취소] - 주문그룹번호:{selectedData.length > 0 && selectedData[0]}
                </ModalHeader>
                <ModalBody>
                    <CancelOrderSubGroupContent onCancel={toggle} onClose={toggleModal} orderSubGroupNo={selectedData.length > 0 ? selectedData[0] : null} />
                </ModalBody>
            </Modal>

            {/* tempAdmin 에서만 노출되는 소비자 상세 팝업 */}
            <Modal size="lg" isOpen={kind === KIND.CONSUMER_DETAIL && isModalOpen} toggle={toggle} >
                <ModalHeader toggle={toggle}>
                    소비자 상세 정보
                </ModalHeader>
                <ModalBody>
                    <ConsumerDetail consumerNo={selectedData[0]} onClose={toggle} />
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggle}>닫기</Button>
                </ModalFooter>
            </Modal>


        </>
    );
};

export default WebSubGroupList;
