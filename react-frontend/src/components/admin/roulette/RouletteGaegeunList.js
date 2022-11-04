import React, {Component} from "react";
import { getLoginAdminUser } from "~/lib/loginApi";
import AdminApi from '~/lib/adminApi';
import {Button} from "reactstrap";
import {AgGridReact} from "ag-grid-react";
import {Div, Input, Flex, Right, Button as StyledButton} from '~/styledComponents/shared'
import {AiOutlineQuestion} from "react-icons/ai";

export default class RouletteGaegeunList extends Component{
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: [],
            columnDefs: [
                {headerName: "소비자번호", field: "consumerNo"},
                {headerName: "이름", field: "name"},
                {headerName: "nickname", field: "nickname"},
                {headerName: "email", field: "email", width: 150},
                {headerName: "phone", field: "phone", width: 150},
                {headerName: "룰렛수", field: "totalRoulletCnt", width: 150}
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
            modal: false,
            yyyymm: this.props.yyyymm,
            rCnt:null,
            filterCnt:0,
        }
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        this.gridApi = params.api
        this.gridColumnApi = params.columnApi
    }

    //Ag-Grid 필터링용 온체인지 이벤트 (데이터 동기화)
    onGridFilterChanged () {
        this.setState({
            filterCnt: this.gridApi.getDisplayedRowCount()
        });
    }

    async componentDidMount() {
        let user = await getLoginAdminUser();
        if (!user || user.email.indexOf('ezfarm') < 0) {
            //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
            window.location = '/admin/login';
        }
    }

    search = async () => {
        if(this.gridApi) {
            //ag-grid 레이지로딩중 보이기
            this.gridApi.showLoadingOverlay();
        }
        const { status, data } = await AdminApi.rouletteGaeGeunList(this.state.yyyymm,this.state.rCnt);
        if(status !== 200){
            alert('응답이 실패 하였습니다')
            return
        }
        this.setState({
            data: data
        })
        //ag-grid api
        if(this.gridApi) {
            //ag-grid 레이지로딩중 감추기
            this.gridApi.hideOverlay()
        }
    }

    onSearchChange = (e) => {
        const val = e.target.value;
        this.setState({
            rCnt: val ? val:null
        })
    }

    onCsvDownLoad = () => {
        const params = {
            fileName:'룰렛개근내역'+this.state.yyyymm
        };
        this.gridApi.exportDataAsCsv(params);
    }

    render() {
        return (
            <Div>
                <Div>
                    <Right bc={'secondary'} p={5}>
                        - 룰렛수를 빈값으로 검색했을 경우에는 해당월의 일수가 같은 참여자들만 조회됩니다. <br/>
                        - 룰렛수를 입력해서 검색했을 경우에는 룰렛수 이상인 참여자들이 조회됩니다.
                    </Right>
                </Div>
                <Flex p={3} alignItems={'center'}>
                    <Div mr={10}>
                        <Input width={100} type={'number'} placeholder={'룰렛수'} value={this.state.rCnt} onChange={this.onSearchChange}/>
                    </Div>
                    <Div mr={10}>
                        <Button size={'sm'} onClick={this.search}>검색</Button>
                    </Div>
                    <Div mr={10}>
                        [전체조회수 : {this.state.data && this.state.data.length}][현재조회수(필터링) : {this.state.filterCnt}]
                    </Div>
                    <Right>
                        <Button size={'sm'} onClick={this.onCsvDownLoad}>Excel DownLoad</Button>
                    </Right>
                </Flex>

                <div
                    className="ag-theme-balham"
                    style={{
                        height: '500px'
                    }}
                >
                    <AgGridReact
                        suppressExcelExport={true}
                        columnDefs={this.state.columnDefs}  //컬럼 세팅
                        defaultColDef={this.state.defaultColDef}
                        overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                        overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                        onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                        rowData={this.state.data}
                        onFilterChanged={this.onGridFilterChanged.bind(this)}  //필터온체인지 이벤트
                    >
                    </AgGridReact>
                </div>

            </Div>
        )
    }

}