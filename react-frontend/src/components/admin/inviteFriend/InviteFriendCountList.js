import React, {useEffect, useState} from "react";
import {ExcelDownload} from "~/components/common";
import {AgGridReact} from "ag-grid-react";
import ComUtil from "~/util/ComUtil";
import {getLoginAdminUser} from "~/lib/loginApi";
import {getInviteFriendCountList, runInviteFriendCountBatch} from"~/lib/adminApi";
import {Flex, Div, Span} from '~/styledComponents/shared'
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import ConsumerDetail from "~/components/common/contents/ConsumerDetail";
import AbuserRenderer from "~/components/common/agGridRenderers/AbuserRenderer";
import StoppedUserRenderer from "~/components/common/agGridRenderers/StoppedUserRenderer";
import {useModal} from "~/util/useModal";

const InviteFriendCountList = (props) => {

    const [gridApi, setGridApi] = useState(null);

    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()

    const [dataList, setDataList] = useState([]);
    const [excelData, setDataExcel] = useState([]);

    const [totalCount, setTotalCount] = useState(0);
    const [totalFriendCount, setTotalFriendCount] = useState(0);
    const [totalWon, setTotalWon] = useState(0);
    const [totalBly, setTotalBly] = useState(0);


    const agGrid = {
        columnDefs: [
            {headerName: "고객번호", field: "consumerNo", width: 100, cellStyle:ComUtil.getCellStyle({cellAlign: 'center'})},
            {headerName: "이름", field: "name", width: 100, cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}), cellRenderer: "nameRenderer"},
            {headerName: "어뷰저", field: "abuser",
                suppressFilter: true,   //no filter
                suppressSorting: true,  //no sort
                cellRenderer: "abuserRenderer"},
            {headerName: "탈퇴", field: "abuser",
                suppressFilter: true,   //no filter
                suppressSorting: true,  //no sort
                cellRenderer: "stoppedUserRenderer"},
            {headerName: "이메일", field: "email", width: 200, cellStyle:ComUtil.getCellStyle({cellAlign: 'center'})},
            {headerName: "연락처", field: "phone", width: 130, cellStyle:ComUtil.getCellStyle({cellAlign: 'center'})},
            {headerName: "친구초대수", field: "count", width: 100, cellStyle:ComUtil.getCellStyle({cellAlign: 'center'})},
            {headerName: "지급금액", field: "rewardWon", width: 100, cellStyle:ComUtil.getCellStyle({cellAlign: 'center'}), cellRenderer: 'formatCurrencyRenderer'},
            {headerName: "지급BLY", field: "rewardBly", width: 100, cellStyle:ComUtil.getCellStyle({cellAlign: 'center'})},
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
            stoppedUserRenderer: StoppedUserRenderer,
            formatCurrencyRenderer: formatCurrencyRenderer,
            formatDateTimeRenderer: formatDateTimeRenderer
        },
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>'
    };

    //[이벤트] 그리드 로드 후 callback 이벤트 API init
    const onGridReady = params => {
        setGridApi(params.api);
    };

    //Ag-Grid Cell 숫자콤마적용 렌더러
    function formatCurrencyRenderer ({value, data: rowData}) {
        //console.log("rowData",rowData);
        return ComUtil.addCommas(value);
    };
    //Ag-Grid Cell 날짜변환 렌더러
    function formatDateTimeRenderer ({value, data: rowData}) {
        let strDate = String(value);
        let result = strDate.slice(0,4) + "-" + strDate.slice(4,6) + "-" + strDate.slice(6,8) + " " + strDate.slice(8,10) + ":" + strDate.slice(10,12);
        return result;
    };
    //Ag-Grid Cell 날짜변환 렌더러
    function formatUtcDateTimeRenderer ({value, data: rowData}) {
        let result = ComUtil.utcToString(value,"YYYY-MM-DD HH:mm")
        return result;
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

    const getSearch = async () => {

        if(gridApi) {
            //ag-grid 레이지로딩중 보이기
            gridApi.showLoadingOverlay();
        }

        const {status, data} = await getInviteFriendCountList();
        if (status !== 200) {
            alert('응답이 실패 하였습니다');
            return;
        }

        let sumCount = 0;
        let sumWon = 0;
        let sumBly = 0;
        data.map((item ,index)=> {
            sumCount += item.count;
            sumWon += item.rewardWon;
            sumBly += item.rewardBly;
        })

        setDataList(data);
        setTotalCount(data.length);
        setTotalFriendCount(sumCount)
        setTotalWon(sumWon);
        setTotalBly(sumBly);

        //ag-grid api
        if(gridApi) {
            //ag-grid 레이지로딩중 감추기
            gridApi.hideOverlay()
        }
    }

    const setExcelData = (data) => {
        setDataExcel(getExcelData(data))
    }
    const getExcelData = (dataList) => {
        const columns = [
            '고객번호', '이름', '이메일', '연락처','친구초대수','지급금액','지급BLY'
        ]
        const data = dataList.map((item ,index)=> {
            return [
                item.consumerNo, item.name, item.email, item.phone, item.count, item.rewardWon, item.rewardBly
            ]
        })

        return [{
            columns: columns,
            data: data
        }]
    }

    const showCountBatchButtonClick = () => {
        alert('친구초대카운트배치 업데이트가 시작 되었습니다. 배치시간이 오래걸릴수 있습니다!')
        runInviteFriendCountBatch();
    }

    const onNameClick = (consumerNo) => {
        setSelected(consumerNo)
        setModalOpen(true);
    }

    const onToggle = () => {
        setModalOpen(!modalOpen)

        if (!modalOpen)
            this.search();    // refresh
    }
    const copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }


    return (
        <div>
            <Flex mt={10}>
                <div className="p-1 pl-3 pt-2">
                    총 건수 : {ComUtil.addCommas(totalCount)}명, 총 친구초대수 : {ComUtil.addCommas(totalFriendCount)}건, 총 지급금액 : {ComUtil.addCommas(totalWon)}원, 총 지급BLY : {totalBly} BLY
                </div>
                <div className="flex-grow-1 text-right mr-1">
                    <Button color="secondary" onClick={getSearch}> 검색 </Button>
                </div>
                <div className="ml-3">
                    <ExcelDownload data={excelData}
                                   fileName="친구초대 가입이벤트"
                                   size={'md'}
                                   buttonName="Excel 다운로드"
                    />
                </div>
                <div className="ml-3">
                    <Button color="secondary" onClick={showCountBatchButtonClick}> 수동업데이트(자동=AM8시) </Button>
                </div>
            </Flex>

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
export default InviteFriendCountList