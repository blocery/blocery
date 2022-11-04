import React, { Component } from 'react';
import {
    getAllConsumers,
    getOneConsumer,
    getConsumerCount,
    getConsumerStopedCount,
    getConsumerDormancyCount,
    getSemiConsumerCount,
    getOrderCountByConsumers
} from '~/lib/adminApi'
import { scOntGetBalanceOfBlctAdmin } from '~/lib/smartcontractApi'
import { Server } from '~/components/Properties';
import axios from 'axios';
import { getLoginAdminUser } from '~/lib/loginApi'
import ComUtil from '~/util/ComUtil'

import BlctRenderer from '../SCRenderers/BlctRenderer';
import {ExcelDownload} from '~/components/common'
import {Button, Input, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'

import { AgGridReact } from 'ag-grid-react';

import SearchDates from '~/components/common/search/SearchDates'
import AbuserRenderer from '~/components/common/agGridRenderers/AbuserRenderer';
import ConsumerDetail from "~/components/common/contents/ConsumerDetail";

import moment from "moment-timezone";
import {Div, Flex, Hr, Span, FilterGroup, Space, Right, Textarea} from '~/styledComponents/shared'
import FilterContainer from "~/components/common/gridFilter/FilterContainer";
import InputFilter from "~/components/common/gridFilter/InputFilter";
import CheckboxFilter from "~/components/common/gridFilter/CheckboxFilter";
import {MenuButton} from "~/styledComponents/shared/AdminLayouts";


export default class ConsumerList extends Component{

    constructor(props) {
        super(props);
        this.state = {
            selectedGubun: 'day', //'week': 최초화면을 오늘(day)또는 1주일(week)로 설정.
            startDate: moment(moment().toDate()),
            endDate: moment(moment().toDate()),

            data: [],
            excelData: {
                columns: [],
                data: []
            },
            independentSearchBy:'phone',

            columnDefs: [
                {headerName: "소비자번호", field: "consumerNo", width: 140},
                {headerName: "이름", field: "name",cellRenderer: "nameRenderer"},
                {headerName: "별명", field: "nickname",width: 140},
                {headerName: "어뷰징", field: "abuser",
                    suppressFilter: true,   //no filter
                    suppressSorting: true,  //no sort
                    cellRenderer: "abuserRenderer"},
                {headerName: "email", field: "email", width: 200},
                {headerName: "등급", field: "level", width: 100},
                {headerName: "구분", field: "authType", width: 100, cellRenderer: "authTypeRenderer"},
                {headerName: "카카오ID", field: "authId", width: 100},
                {headerName: "phone", field: "phone", width: 150, cellRenderer: "phoneRenderer"},
                {headerName: "account", field: "account", width: 100},
                {headerName: "BLCT", field: "blct", cellRenderer: "blctRenderer", width: 150},
                {headerName: "가입일", field: "timestampUtc", width: 150},
                {headerName: "탈퇴일", field: "stoppedDateUTC", width: 150},
                {headerName: "iostAccount", field: "iostAccount", width: 140},
                {headerName: "마지막로그인일", field: "lastLoginUtc", width: 150},
                {headerName: "접속IP", field: "ip", width: 150},
                {headerName: "추천친구수", field: "inviteFriendCount", width: 150},
                {
                    headerName: "내추천번호", field: "inviteCode", width: 100,
                    valueGetter: function(params) {
                        if(params.data.consumerNo > 0){
                            const inviteCode = ComUtil.encodeInviteCode(params.data.consumerNo)
                            return inviteCode
                        }
                        return ''
                    }
                },
                {
                    headerName: "추천친구", field: "encodedRecommenderNo", width: 120,
                    valueGetter: function(params) {
                        if(params.data.recommenderNo > 0){
                            const inviteCode = ComUtil.encodeInviteCode(params.data.recommenderNo)
                            return inviteCode
                        }
                        return ''
                    }
                },
                {
                    headerName: "추천친구 소비자번호", field: "recommenderNo", width: 150,
                    valueGetter: function(params) {
                        if(params.data.recommenderNo > 0){
                            const recommenderNo = params.data.recommenderNo
                            return recommenderNo
                        }
                        return ''
                    }
                },
                {headerName: "탈퇴여부", field: "stoppedUser", width: 100},
            ],
            searchColumnDefs: [
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
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
            frameworkComponents: {
                blctRenderer: BlctRenderer,
                inviteCodeRenderer: this.inviteCodeRenderer,
                emailRenderer: this.emailRenderer,
                nameRenderer: this.nameRenderer,
                phoneRenderer: this.phoneRenderer,
                authTypeRenderer: this.authTypeRenderer,
                abuserRenderer: AbuserRenderer
            },
            modal: false,
            showBlctBalance: false,  //default로 false로 해서 속도 향상.20200819
            // selectedConsumer: [],
            consumer: null,

            consumerCount: 0,
            consumerStopedCount: 0,
            consumerDormancyCount: 0,
            semiConsumerCount: 0,
            searchConsumerNo: '',
            consumerOrderCount: ''
        }
    }

    async componentDidMount() {
        let user = await getLoginAdminUser();
        if (!user || user.email.indexOf('ezfarm') < 0) {
            //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
            window.location = '/admin/login';
        }
        await this.search();
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        //API init
        this.gridApi = params.api
        this.columnApi = params.columnApi
        //this.gridColumnApi = params.columnApi
        // console.log("onGridReady");
    }

    search = async (searchButtonClicked, consumerObj) => {

        // console.log('consumerObj')
        // console.log(consumerObj)

        let allData;
        //1건 독립조회 추가
        if (consumerObj) {

           let {data} = await getOneConsumer(consumerObj);
           allData = data;

        //기존 일반 조회
        } else {
            if (searchButtonClicked) {
                if (!this.state.startDate || !this.state.endDate) {
                    alert('시작일과 종료일을 선택해주세요')
                    return;
                }
            }

            if (this.gridApi) {
                //ag-grid 레이지로딩중 보이기
                this.gridApi.showLoadingOverlay();
            }
            const params = {
                startDate: this.state.startDate ? moment(this.state.startDate).format('YYYYMMDD') : null,
                endDate: this.state.endDate ? moment(this.state.endDate).format('YYYYMMDD') : null
            };
            const {status, data} = await getAllConsumers(params)

            if (status !== 200) {
                alert('응답이 실패 하였습니다')
                return
            }

            // manager를 data맨 위에 넣기
            let managerAccount = await this.getBaseAccount();
            let manager = {
                consumerNo: 0,
                name: '매니저',
                account: managerAccount
            }
            data.unshift(manager);
            allData = data;
        }

        allData.map((item) => {

            if (this.state.showBlctBalance) {
                item.getBalanceOfBlct = scOntGetBalanceOfBlctAdmin;
            } else {
                item.getBalanceOfBlct = null;
            }

            let lastLoginUtc = item.lastLogin ? ComUtil.utcToString(item.lastLogin,'YYYY-MM-DD HH:mm'):null;
            let timestampUtc = item.timestamp ? ComUtil.utcToString(item.timestamp,'YYYY-MM-DD HH:mm'):null;
            let stoppedDateUTC = item.stoppedDate ? ComUtil.intToDateString(item.stoppedDate):null;
            item.lastLoginUtc = lastLoginUtc;
            item.timestampUtc = timestampUtc;
            item.stoppedDateUTC = stoppedDateUTC;

            return item;
        })

        let {data:consumerCount} = await getConsumerCount();

        let {data:consumerStopedCount} = await getConsumerStopedCount();

        let {data:consumerDormancyCount} = await getConsumerDormancyCount();

        let {data:giftReceiverAccount} = await getSemiConsumerCount();

        this.setState({
            ...this.state,
            data: allData,
            consumerCount: consumerCount,
            consumerStopedCount: consumerStopedCount,
            consumerDormancyCount: consumerDormancyCount,
            semiConsumerCount: giftReceiverAccount
        });

        this.setExcelData();

        //ag-grid api
        if(this.gridApi) {
            //ag-grid 레이지로딩중 감추기
            this.gridApi.hideOverlay()
        }
    }

    //// cellRenderer
    nameRenderer = ({value, data:rowData}) => {
        if(rowData.consumerNo <= 0){
            return <Span>{rowData.name}</Span>
        }
        if(rowData.consumerNo > 0) {
            return <Span fg={'primary'} onClick={this.onEmailClick.bind(this, rowData)}><u>{rowData.name}</u></Span>
        }
        // return (rowData.stoppedUser ? <span className='text-danger'>{rowData.name}</span> : <span onClick={this.onEmailClick.bind(this, rowData)}><u>{rowData.name}</u></span>)
    }

    emailRenderer = ({value, data:rowData}) => {
        return (<span href="#" onClick={this.onEmailClick.bind(this, rowData)}><u>{rowData.email}</u></span>);
    }

    phoneRenderer = ({value, data:rowData}) => {
        return (rowData.stoppedUser ? <span className='text-danger'>{rowData.phone}</span> : <span>{rowData.phone}</span>)
    }


    authTypeRenderer = ({value, data:rowData}) => {
        return (rowData.authType === 0 ? <span>일반</span> : <span>카카오</span>)
    }

    inviteCodeRenderer = ({value, data:rowData}) => {
        if(rowData.consumerNo > 0){
            const inviteCode = ComUtil.encodeInviteCode(rowData.consumerNo)
            return <span>{inviteCode}</span>
        }
        return null;
    }

    onEmailClick = (data) => {
        this.setState({
            modal: true,
            consumer: data
        })
    }


    getBaseAccount = async () => {
        //ropsten에서는 getAccounts 동작하지 않을 수도 있기 때문에 안전하게 backend 이용.
        return axios(Server.getRestAPIHost() + '/baseAccount',
            {   method:"get",
                withCredentials: true,
                credentials: 'same-origin'
            }
        ).then((response) => {
            return response.data;
        });
    }

    toggle = async () => {
        this.setState(prevState => ({
            modal: !prevState.modal
        }));

        // await this.search();    // refresh
    }

    showBlctBalanceButtonClick = async () => {
        alert('잔고출력 On: 잠시 기다려 주세요')
        await this.setState({showBlctBalance:true});

        this.search();    // refresh
    }

    setExcelData = () => {
        let excelData = this.getExcelData();
        //console.log("excelData",excelData)
        this.setState({
            excelData: excelData
        })
    }

    getExcelData = () => {
        const columns = [
            '소비자번호', '이름', '이메일', '전화번호', 'account', '가입일', '탈퇴일', '내추천번호','추천친구','추천친구소비자번호'
        ]

        //필터링 된 데이터에서 sortedData._original 로 접근하여 그리드에 바인딩 원본 값을 가져옴
        const data = this.state.data.map((item ,index)=> {
            const consumerNoInviteCode = item.consumerNo > 0 ? ComUtil.encodeInviteCode(item.consumerNo):'';
            const recommenderNoInviteCode = item.recommenderNo > 0 ? ComUtil.encodeInviteCode(item.recommenderNo):'';
            return [
                item.consumerNo, item.name, item.email, item.phone, item.account, item.timestampUtc, item.stoppedDateUTC,
                consumerNoInviteCode,
                recommenderNoInviteCode,
                item.recommenderNo
            ]
        })

        return [{
            columns: columns,
            data: data
        }]
    }

    onDatesChange = async (data) => {
        await this.setState({
            startDate: data.startDate,
            endDate: data.endDate,
            selectedGubun: data.gubun
        });
        if(data.isSearch) {
            await this.search();
        }
    }

    copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    //1건 독립조회
    oneIndependentSearch = ()=> {

        const searchField = this.state.independentSearchBy //'phone,'email','consumerNo'등

        const inputValue = window.prompt('검색할 소비자 ' + searchField +':')
        if (inputValue) {
            let consumerObj;
            switch (searchField) {
                case 'phone': consumerObj = {phone:inputValue};break;
                case 'email': consumerObj = {email:inputValue};break;
                case 'name': consumerObj = {name:inputValue};break;
                case 'nickname': consumerObj = {nickname:inputValue};break;
                case 'consumerNo': consumerObj = {consumerNo:inputValue};break;
                case 'recommenderNo': consumerObj = {recommenderNo:inputValue};break;
                case 'ip': consumerObj = {ip:inputValue};break;
                case 'level': consumerObj = {level:inputValue};break;
            }
            this.search(false, consumerObj)
        }
    }
    onIndependentSearchByChange = (e)=> {
        this.setState({
            independentSearchBy:e.target.value
        })
    }


    onChangeSearchConsumerNo = (e) => {
        this.setState({
            searchConsumerNo: e.target.value
        })
    }

    searchConsumerOrderCount = async() => {
        alert('조회중입니다. 잠시만 기다려주세요');
        let {data} = await getOrderCountByConsumers(this.state.searchConsumerNo);
        console.log(data);
        this.setState({
            consumerOrderCount: JSON.stringify(data)
        })
    }

    render() {
        return (
            <Div p={16}>
                <Div p={10} bc={'secondary'} mb={10}>
                    <Space>
                        <Div>기 간 (가입일)</Div>
                        <Div>
                            <Space>
                                <SearchDates
                                    isHiddenAll={true}
                                    isCurrenYeartHidden={true}
                                    gubun={this.state.selectedGubun}
                                    startDate={this.state.startDate}
                                    endDate={this.state.endDate}
                                    onChange={this.onDatesChange}
                                />
                                <MenuButton onClick={() => this.search(true)}> 검 색 </MenuButton>
                                <MenuButton onClick={this.showBlctBalanceButtonClick.bind(this)}> Blct잔고 출력 </MenuButton>
                            </Space>
                        </Div>
                    </Space>
                </Div>

                <Div p={10} bc={'secondary'} mb={10}>
                    <Space>
                        <Input type='select' name='select' id='independentSearchBy' style={{width: 130}} onChange={this.onIndependentSearchByChange}>
                            <option name='radio1' value="phone">phone</option>
                            <option name='radio2' value="email">email</option>
                            <option name='radio3' value="name">name</option>
                            <option name='radio4' value="nickname">nickname</option>
                            <option name='radio5' value="consumerNo">consumerNo</option>
                            <option name='radio6' value="recommenderNo">recommenderNo</option>
                            <option name='radio6' value="ip">ip</option>
                            <option name='radio6' value="level">등급(level)</option>
                        </Input>
                        <Button onClick={this.oneIndependentSearch} className={'ml-2'}> 소비자 별도조회 (버튼클릭후 조건입력) </Button>
                    </Space>
                </Div>

                {/* filter START */}
                <FilterContainer gridApi={this.gridApi} columnApi={this.columnApi} excelFileName={'소비자 목록'}>
                    <FilterGroup>
                        <InputFilter
                            gridApi={this.gridApi}
                            columns={[
                                {field: 'consumerNo', name: '소비자번호'},
                                {field: 'name', name: '소비자명'},
                                {field: 'email', name: '이메일'},
                                {field: 'authId', name: '카카오ID'},
                                {field: 'phone', name: '연락처'},
                                {field: 'account', name: 'account'},
                                {field: 'ip', name: '접속IP'},
                                {field: 'inviteCode', name: '내추천번호'},
                                {field: 'recommenderNo', name: '추천친구'},
                                {field: 'stoppedDateUTC', name: '탈퇴일'},
                            ]}
                            isRealTime={true}
                        />
                    </FilterGroup>
                    <Hr/>
                    <FilterGroup>
                        <CheckboxFilter
                            gridApi={this.gridApi}
                            field={'authType'}
                            name={'가입경로'}
                            data={[
                                {value: '0', name: '일반'},
                                {value: '1', name: '카카오'},
                            ]}
                        />
                        <CheckboxFilter
                            gridApi={this.gridApi}
                            field={'stoppedUser'}
                            name={'탈퇴여부'}
                            data={[
                                {value: true, name: '탈퇴'},
                                {value: false, name: '미탈퇴'},
                            ]}
                        />
                    </FilterGroup>
                </FilterContainer>
                {/* filter END */}

                <Flex mb={10}>
                    <Div>
                        <ExcelDownload data={this.state.excelData}
                                       fileName="소비자전체목록확인"
                                       buttonName = "Excel 다운로드"
                        />
                    </Div>

                    <Right>
                        <span>
                            [현재Page {this.state.data.length-1}명] 총회원 {ComUtil.addCommas(this.state.consumerCount+this.state.consumerStopedCount)}명 = 실회원 {ComUtil.addCommas(this.state.consumerCount)}명 (활성 {ComUtil.addCommas(this.state.consumerCount - this.state.consumerDormancyCount)} + 휴면 {ComUtil.addCommas(this.state.consumerDormancyCount)}) + 탈퇴 {ComUtil.addCommas(this.state.consumerStopedCount)}, 준회원(선물수령자) {ComUtil.addCommas(this.state.semiConsumerCount)}명
                        </span>
                    </Right>
                </Flex>

                <div
                    className="ag-theme-balham"
                    style={{
                        height: '500px'
                    }}
                >
                    <AgGridReact
                        columnDefs={this.state.isSearch ? this.state.searchColumnDefs : this.state.columnDefs}  //컬럼 세팅
                        rowSelection={'multiple'}
                        defaultColDef={this.state.defaultColDef}
                        overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                        overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                        onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                        rowData={this.state.data}
                        frameworkComponents={this.state.frameworkComponents}
                        // onRowClicked={this.onSelectionChanged.bind(this)}       // 클릭된 row
                        onCellDoubleClicked={this.copy}
                    >
                    </AgGridReact>
                </div>


                <Space mt={30} mb={10}> [ 특정소비자 구매건수 조회 ] <Button className='ml-2' onClick={this.searchConsumerOrderCount}> 검색 </Button></Space>
                <Div className='mb-2'>
                    <Input mb={5} type="text" placeholder="소비자번호 (,로 구분해서 여러개 입력) " value={this.state.searchConsumerNo} onChange={this.onChangeSearchConsumerNo}/>
                </Div>
                <Div>
                    <Textarea placeholder="구매건수 결과" style={{width: '100%'}} readOnly value={this.state.consumerOrderCount}/>
                </Div>

                <Modal size="lg" isOpen={this.state.modal}
                       toggle={this.toggle} >
                    <ModalHeader toggle={this.toggle}>
                        소비자 상세 정보
                    </ModalHeader>
                    <ModalBody>
                        <ConsumerDetail consumerNo={this.state.consumer ? this.state.consumer.consumerNo : null}
                                        onClose={this.toggle} />
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.toggle}>닫기</Button>
                    </ModalFooter>
                </Modal>

            </Div>
        )
    }
}
