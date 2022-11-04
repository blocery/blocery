import React, {Component} from "react";
import { getLoginAdminUser } from "~/lib/loginApi";
import {addSpecialCouponMultiConsumer, getConsumerCommaList, getConsumerByConsumerNo, addSpecialCouponAllConsumer} from '~/lib/adminApi';
import ComUtil from "~/util/ComUtil";
import { ModalConfirm } from "~/components/common";
import {Button} from "reactstrap";
import {AgGridReact} from "ag-grid-react";
import Checkbox from "~/components/common/checkboxes/Checkbox";
import {Div, Span, Flex, Right} from '~/styledComponents/shared'

export default class ConsumerList extends Component{
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: [],
            columnDefs: [
                {headerName: "소비자번호", field: "consumerNo"},
                {headerName: "이름", field: "name", cellRenderer: "nameRenderer"},
                {headerName: "email", field: "email", width: 200},
                {headerName: "phone", field: "phone", width: 200},
                {headerName: "가입일", field: "timestampUtc", width: 200},
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
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">검색 버튼을 눌러 조회하십시오!</span>',
            frameworkComponents: {
                nameRenderer: this.nameRenderer,
            },
            modal: false,
            masterCouponNo: this.props.masterCouponNo,
            selectedConsumer: [],
            consumer: null,
            selectedAllConsumer: false
        }
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        this.gridApi = params.api
        this.gridColumnApi = params.columnApi
    }

    async componentDidMount() {
        let user = await getLoginAdminUser();
        if (!user || user.email.indexOf('ezfarm') < 0) {
            //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
            window.location = '/admin/login';
        }
    }


    onClickSearch = () => {
        const consumerNo = window.prompt("검색할 consumerNo를 ,로 구분해서 입력해 주세요. (미입력시 전체검색-서버부하)")
        this.search(consumerNo)
    }

    search = async (consumerNo) => {
        if(this.gridApi) {
            //ag-grid 레이지로딩중 보이기
            this.gridApi.showLoadingOverlay();
        }


        const { status, data } = await getConsumerCommaList(consumerNo);
        if(status !== 200){
            alert('응답이 실패 하였습니다')
            return
        }

        data.map((item) => {
            let timestampUtc = item.timestamp ? ComUtil.utcToString(item.timestamp,'YYYY-MM-DD HH:mm'):null;
            let stoppedDateUTC = item.stoppedDate ? ComUtil.intToDateString(item.stoppedDate):null;
            item.timestampUtc = timestampUtc;
            item.stoppedDateUTC = stoppedDateUTC;

            return item;
        })

        this.setState({
            data: data
        })

        //ag-grid api
        if(this.gridApi) {
            //ag-grid 레이지로딩중 감추기
            this.gridApi.hideOverlay()
        }
    }

    //// cellRenderer
    nameRenderer = ({value, data:rowData}) => {
        return <span className={rowData.stoppedUser && 'text-danger'}>{rowData.name}</span>
    }

    onClickAllConsumerSelection = async() => {

        if(!window.confirm('6개월내 접속 소비자 전체에게 쿠폰을 발급합니다. 진행하시겠습니까?')) return

        const masterNo = this.state.masterCouponNo;
        const {data:response} = await addSpecialCouponAllConsumer(masterNo);

        alert(`${response}명에게 지급이 완료되었습니다.`)
    }

    // 쿠폰 발급대상 선택 완료
    onClickSelection = async (isConfirmed) => {
        const masterNo = this.state.masterCouponNo;
        if(isConfirmed) {
            addSpecialCouponMultiConsumer(masterNo, this.state.selectedConsumer);
            alert(`쿠폰 지급을 요청했습니다. 잠시후 쿠폰발급내역을 확인해주세요.`)
            // alert(`${response}명에게 지급이 완료되었습니다.`)

            this.props.onClose();
            await this.search();    // refresh
        }

    }

    onSelectionChanged = (event) => {
        const rowNodes = event.api.getSelectedNodes()
        const rows = rowNodes.map((rowNode => rowNode.data))
        const selectedConsumerNo = rows.map((consumer => consumer.consumerNo))

        this.setState({
            selectedConsumer: selectedConsumerNo
        })
    }

    onAllConsumerChanged = async (e) => {
        this.setState({
            ...this.state,
            selectedAllConsumer: e.target.checked,
            //selectedConsumer: 모든 consumer
        })
    }

    render() {
        return (
            <Div>
                <Flex p={3} alignItems={'center'}>
                    <Div mr={10}>
                        <Button size={'sm'} onClick={this.onClickSearch}>검색</Button>
                    </Div>
                    <Div>총 {this.state.data.length}명</Div>
                    <Right>
                        <Flex>
                            <ModalConfirm title={'알림'} color={'primary'}
                                          content={`선택한 소비자(${this.state.selectedConsumer.length}명)에게 쿠폰을 지급하시겠습니까?`}
                                          onClick={this.onClickSelection}>
                                <Button className='mr-1' size={'sm'}>확인</Button>
                            </ModalConfirm>

                            <Button className={'ml-2'} size={'sm'} color={'danger'} onClick={this.onClickAllConsumerSelection}> 6개월내 접속소비자 전체에 발급(검색불필요) </Button>
                            {/*<Checkbox checked={this.state.selectedAllConsumer} onChange={this.onAllConsumerChanged}>전체 회원에 발급(화면 전체 아니고 진짜 전체)</Checkbox>*/}

                        </Flex>
                    </Right>
                </Flex>

                <div
                    className="ag-theme-balham"
                    style={{
                        height: '700px'
                    }}
                >
                    <AgGridReact
                        columnDefs={this.state.columnDefs}  //컬럼 세팅
                        rowSelection={'multiple'}
                        defaultColDef={this.state.defaultColDef}
                        overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                        overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                        onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                        rowData={this.state.data}
                        frameworkComponents={this.state.frameworkComponents}
                        onRowClicked={this.onSelectionChanged.bind(this)}       // 클릭된 row
                    >
                    </AgGridReact>
                </div>

            </Div>
        )
    }

}