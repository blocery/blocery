import React, {Component} from "react";
import {BlocerySpinner, ExcelDownload} from "~/components/common";
import {AgGridReact} from "ag-grid-react";
import ComUtil from "~/util/ComUtil";
import {getLoginAdminUser} from "~/lib/loginApi";
import {getInviteFriendList} from"~/lib/adminApi";
import {Flex, Div, Span} from '~/styledComponents/shared'
import AbuserRenderer from "~/components/common/agGridRenderers/AbuserRenderer";
import StoppedUserRenderer from "~/components/common/agGridRenderers/StoppedUserRenderer";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import ConsumerDetail from "~/components/common/contents/ConsumerDetail";


const FriendAbuserRenderer = (props) => {
    const data = {
        consumerNo: props.data.friendNo
    }
    return <AbuserRenderer
        data={data}
    />
}

export default class InviteFriendList extends Component{
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            modalValue: null,
            loading: false,
            data: [],
            excelData: null,
            columnDefs: [
                {headerName: "고객번호", field: "consumerNo", width: 100, cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "이름", field: "name", width: 100, cellRenderer: "nameRenderer", cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "어뷰징", field: "abuser",
                    suppressFilter: true,   //no filter
                    suppressSorting: true,  //no sort
                    cellRenderer: "abuserRenderer"},
                {headerName: "탈퇴", field: "abuser",
                    suppressFilter: true,   //no filter
                    suppressSorting: true,  //no sort
                    cellRenderer: "stoppedUserRenderer"},
                {headerName: "이메일", field: "email", width: 200, cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "연락처", field: "phone", width: 130, cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "지급금액", field: "rewardWon", width: 130, cellStyle:this.getCellStyle({cellAlign: 'center'}), cellRenderer: 'formatCurrencyRenderer'},
                {headerName: "지급BLY", field: "blyAmount", width: 130, cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "환율", field: "exchangeRate", width: 130, cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "친구 이름", field: "friendName", width: 100, cellStyle:this.getCellStyle({cellAlign: 'center'}), cellRenderer: "friendNameRenderer"},
                {headerName: "어뷰징", field: "abuser",
                    suppressFilter: true,   //no filter
                    suppressSorting: true,  //no sort
                    cellRenderer: "friendAbuserRenderer"},
                {headerName: "친구 이메일", field: "friendEmail", width: 200, cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "친구 전화", field: "friendPhone", width: 200, cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "친추코드입력일", field: "joinTime", width: 200, cellStyle:this.getCellStyle({cellAlign: 'center'}), cellRenderer: 'formatDateTimeRenderer'},
            ],
            defaultColDef: {
                width: 110,
                resizable: true,
                filter: true,
                sortable: true,
                floatingFilter: false,
                filterParams: {
                    newRowsAction: 'keep'
                }
            },
            frameworkComponents: {

                nameRenderer: this.nameRenderer,
                abuserRenderer: AbuserRenderer,

                friendNameRenderer: this.friendNameRenderer,
                friendAbuserRenderer: FriendAbuserRenderer,


                stoppedUserRenderer: StoppedUserRenderer,
                formatCurrencyRenderer: this.formatCurrencyRenderer,
                formatDateTimeRenderer: this.formatDateTimeRenderer
            },
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
            totalCount: 0,
            totalWon: 0,
            totalBly: 0,
        }
    }

    //Ag-Grid Cell 숫자콤마적용 렌더러
    formatCurrencyRenderer = ({value, data: rowData}) => {
        //console.log("rowData",rowData);
        return ComUtil.addCommas(value);
    };
    //Ag-Grid Cell 날짜변환 렌더러
    formatDateTimeRenderer = ({value, data: rowData}) => {
        let strDate = String(value);
        let result = strDate.slice(0,4) + "-" + strDate.slice(4,6) + "-" + strDate.slice(6,8) + " " + strDate.slice(8,10) + ":" + strDate.slice(10,12);
        return result;
    };

    // Ag-Grid Cell 스타일 기본 적용 함수
    getCellStyle ({cellAlign,color,textDecoration,whiteSpace, fontWeight}){
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
            whiteSpace: whiteSpace,
            fontWeight: fontWeight
        }
    }

    async componentDidMount() {
        let user = await getLoginAdminUser();
        if (!user || user.email.indexOf('ezfarm') < 0) {
            //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
            window.location = '/admin/login';
        }

        this.search();
    }

    search = async () => {
        this.setState({loading: true});
        const {status, data} = await getInviteFriendList();
        if (status !== 200) {
            alert('응답이 실패 하였습니다');
            return;
        }
        console.log(data);
        this.setExcelData(data);

        let totalWon = 0;
        let totalBly = 0;
        data.map(item => {
            totalBly = ComUtil.doubleAdd(totalBly, item.blyAmount);
            totalWon += item.rewardWon;
        })

        this.setState({
            data: data,
            loading: false,
            totalCount : data.length,
            totalWon : totalWon,
            totalBly : totalBly
        })
    }

    setExcelData = (data) => {
        let excelData = this.getExcelData(data);
        this.setState({
            excelData: excelData
        })
    }
    getExcelData = (dataList) => {

        const columns = [
            '고객번호', '이름', '이메일', '연락처', '지급금액', '지급BLY',
            '환율', '친구 이름 ','친구 이메일', '친구 전화', '친구 가입일'
        ]
        const data = dataList.map((item ,index)=> {
            let joinTime = String(item.joinTime);
            let joinTimeResult = joinTime.slice(0,4) + "-" + joinTime.slice(4,6) + "-" + joinTime.slice(6,8) + " " + joinTime.slice(8,10) + ":" + joinTime.slice(10,12);

            return [
                item.consumerNo, item.name, item.email, item.phone, ComUtil.addCommas(item.rewardWon), item.blyAmount,
                item.exchangeRate, item.friendName, item.friendEmail, item.friendPhone, joinTimeResult
            ]
        })

        return [{
            columns: columns,
            data: data
        }]
    }
    onNameClick = (consumerNo) => {
        // console.log({data})
        this.setState({
            modalValue: consumerNo
        }, () => this.toggle())
    }

    nameRenderer = ({value, data}) => {
        return <Span fg={'primary'} onClick={this.onNameClick.bind(this, data.consumerNo)}><u>{value}</u></Span>
    }

    friendNameRenderer = ({value, data}) => {
        return <Span fg={'primary'} onClick={this.onNameClick.bind(this, data.friendNo)}><u>{value}</u></Span>
    }


    toggle = () => {
        const isOpen = !this.state.isOpen
        this.setState({
            isOpen: isOpen
        })
    }
    copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }
    render() {
        return (
            <div>
                {
                    this.state.loading && <BlocerySpinner/>
                }

                <Flex mt={10}>
                    <div className="p-1 pl-3 pt-2">
                        총 건수 : {ComUtil.addCommas(this.state.totalCount)}명, 친구초대 회원가입 적립금: {ComUtil.toCurrency(this.state.totalWon)}원, ({ComUtil.toCurrency(this.state.totalBly)} BLY)
                    </div>
                    <div className="flex-grow-1 text-right mr-1">
                        <ExcelDownload data={this.state.excelData}
                                       fileName="친구초대 가입이벤트"
                                       size={'md'}
                                       buttonName="Excel 다운로드"
                        />
                    </div>
                </Flex>

                <div className="p-1">
                    <div
                        id="myGrid"
                        className="ag-theme-balham"
                        style={{
                            height: '700px'
                        }}
                    >
                        <AgGridReact
                            // enableSorting={true}                //정렬 여부
                            // enableFilter={true}                 //필터링 여부
                            floatingFilter={true}               //Header 플로팅 필터 여부
                            columnDefs={this.state.columnDefs}  //컬럼 세팅
                            defaultColDef={this.state.defaultColDef}
                            // components={this.state.components}  //custom renderer 지정, 물론 정해져있는 api도 있음
                            frameworkComponents={this.state.frameworkComponents}
                            // enableColResize={true}              //컬럼 크기 조정
                            overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                            overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                            // onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                            rowData={this.state.data}
                            rowHeight={35}
                            onCellDoubleClicked={this.copy}
                        >
                        </AgGridReact>
                    </div>
                </div>
                <Modal size="lg" isOpen={this.state.isOpen}
                       toggle={this.toggle} >
                    <ModalHeader toggle={this.toggle}>
                        소비자 상세 정보
                    </ModalHeader>
                    <ModalBody>
                        <ConsumerDetail consumerNo={this.state.modalValue}
                                        onClose={this.toggle} />
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.toggle}>닫기</Button>
                    </ModalFooter>
                </Modal>
            </div>
        )
    }
}