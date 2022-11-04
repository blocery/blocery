import React, {useEffect, useState} from 'react';
import {Div, Space, Span, Flex, Button, Input as SharedInput} from "~/styledComponents/shared";
import {Modal, ModalBody, ModalFooter, ModalHeader, Input} from "reactstrap";
import {AgGridReact} from "ag-grid-react";
import ConsumerDetail from "~/components/common/contents/ConsumerDetail";
import {useModal} from "~/util/useModal";
import ComUtil from "~/util/ComUtil";
import {getOneConsumer, addSpecialPoint} from "~/lib/adminApi";
import {getLoginAdminUser} from "~/lib/loginApi";

const SpecialPoint = (props) => {

    const [gridApi, setGridApi] = useState(null);
    const [columnApi, setColumnApi] = useState()
    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()
    const [modalType, setModalType] = useState("")
    const [independentSearchBy, setIndependentSearchBy] = useState('consumerNo')
    const [dataList, setDataList] = useState([]);

    const [pointTitle, setPointTitle] = useState('');
    const [pointDesc, setPointDesc] = useState('');
    const [pointAmount, setPointAmount] = useState(0);
    const [adminMemo, setAdminMemo] = useState('이벤트');
    const [searchCond, setSearchCond] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);

    const agGrid = {
        columnDefs: [
            {headerName: "소비자번호", field: "consumerNo", width: 140},
            {headerName: "이름", field: "name",cellRenderer: "consumerNameRenderer"},
            {headerName: "별명", field: "nickname",width: 140},
            {headerName: "email", field: "email", width: 200},
            {headerName: "phone", field: "phone", width: 150, cellRenderer: "phoneRenderer"},
            {headerName: "가입일", field: "timestampUtc", width: 150},
            {headerName: "탈퇴일", field: "stoppedDateUTC", width: 150},
            {headerName: "마지막로그인일", field: "lastLoginUtc", width: 150},
            {headerName: "포인트", field: "point", width: 100},
            {headerName: "Today지급예정포인트", field: "toDayPoint", width: 150},
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
            phoneRenderer: phoneRenderer,
            consumerNameRenderer: consumerNameRenderer
        },
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
    };

    function phoneRenderer ({value, data:rowData}) {
        return (rowData.stoppedUser ? <span className='text-danger'>{rowData.phone}</span> : <span>{rowData.phone}</span>)
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
        }
        fetch();
    }, []);


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

    const onIndependentSearchByChange = (e)=> {
        setIndependentSearchBy(e.target.value);
    }

    const oneIndependentSearch = () => {
        if (searchCond) {
            let consumerObj;
            switch (independentSearchBy) {
                case 'phone': consumerObj = {phone:searchCond};break;
                case 'email': consumerObj = {email:searchCond};break;
                case 'name': consumerObj = {name:searchCond};break;
                case 'nickname': consumerObj = {nickname:searchCond};break;
                case 'consumerNo': consumerObj = {consumerNo:searchCond};break;
                case 'manyConsumers': consumerObj = {manyConsumers:searchCond};break;
            }
            search(consumerObj)
        }
    }

    const search = async(consumerObj) => {
        let {data} = await getOneConsumer(consumerObj);
        data.map((item) => {

            let lastLoginUtc = item.lastLogin ? ComUtil.utcToString(item.lastLogin,'YYYY-MM-DD HH:mm'):null;
            let timestampUtc = item.timestamp ? ComUtil.utcToString(item.timestamp,'YYYY-MM-DD HH:mm'):null;
            let stoppedDateUTC = item.stoppedDate ? ComUtil.intToDateString(item.stoppedDate):null;
            item.lastLoginUtc = lastLoginUtc;
            item.timestampUtc = timestampUtc;
            item.stoppedDateUTC = stoppedDateUTC;

            return item;
        })
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

    const onInputChange = (e) => {
        e.preventDefault();
        const {name, value} = e.target
        switch (name) {
            case 'cond':  // 소비자 검색조건
                setSearchCond(value);
                break;

            case 'title':
                setPointTitle(value);
                break;
            case 'desc':
                setPointDesc(value);
                break;
            case 'pointAmount':
                setPointAmount(value);
                break;
        }
    }

    const onSelectionChanged = (event) => {
        setSelectedRows(gridApi.getSelectedRows())
    }

    const onAdminMemoChange = (e) => {
        setAdminMemo(e.target.value);
    }

    const givePoint = async() => {
        // console.log(selectedRows);

        let arrayConsumerNo = new Array();
        selectedRows.map(item => {
            arrayConsumerNo.push(item.consumerNo);
        })

        if(arrayConsumerNo.length === 0) {
            alert('포인트를 지급할 소비자를 선택해주세요.')
            return;
        }

        if(pointTitle === '') {
            alert('포인트지급 제목을 입력해주세요.')
            return;
        }

        if(pointAmount < 0) {
            alert('입력한 포인트가 마이너스라 포인트가 회수됩니다.')
        }

        if (!window.confirm('선택하신 ' + arrayConsumerNo.length + '명에게 포인트를 지급하시겠습니까?'))
            return;

        console.log(arrayConsumerNo.length);
        // console.log(arrayConsumerNo, pointTitle, pointDesc, pointAmount);
        let params = {
            arrayConsumerNo:arrayConsumerNo,
            title: pointTitle,
            desc: pointDesc,
            point: pointAmount,
            adminMemo: adminMemo
        }
        let {data} = await addSpecialPoint(params);
        if(data === 200) {
            alert('포인트 지급/회수가 완료되었습니다.')
        } else {
            alert('로그인이 만료되었습니다. admin을 다시 로그인해주세요.')
        }
    }

    return (
        <Div p={16}>

            <Div p={10} bc={'secondary'} mb={10}>
                <Space p={10}>
                    <Input type='select' name='select' id='independentSearchBy' style={{width: 130}} onChange={onIndependentSearchByChange}>
                        <option name='radio1' value="consumerNo">consumerNo</option>
                        <option name='radio2' value="phone">phone</option>
                        <option name='radio3' value="email">email</option>
                        <option name='radio4' value="name">name</option>
                        <option name='radio5' value="nickname">nickname</option>
                        <option name='radio6' value="manyConsumers">manyConsumer</option>
                    </Input>
                    <SharedInput height={35} mr={10} type="text" name='cond' placeholder="검색조건" value={searchCond} onChange={onInputChange}/>

                    <Button bg={'green'} fg={'white'} onClick={oneIndependentSearch}> 소비자 조회 </Button>
                    <Span ml={5}>(여러명 동시 지급시 manyConsumer선택 후 ,로 구분해서 소비자 번호 입력후 조회)</Span>
                </Space>
            </Div>

            <Div>
                <Span m={10} fg={'danger'}> <b>수동 포인트 지급/회수는 회원별 1일 1회 가능합니다!!</b> </Span>
                <Flex mt={20} mb={20}>
                    <Span m={10}> 포인트 지급/회수 </Span>
                    <Input type='select' name='select' id='adminMemo' style={{width: 150, marginRight:10}} onChange={onAdminMemoChange}>
                        <option name='radio1' value="이벤트">이벤트</option>
                        <option name='radio2' value="클레임 외">클레임 외</option>
                    </Input>
                    <SharedInput height={35} mr={10} type="text" name='title' placeholder="포인트지급/회수 제목" value={pointTitle} onChange={onInputChange}/>
                    <SharedInput height={35} mr={10} type="text" name='desc' placeholder="상세내역" value={pointDesc} onChange={onInputChange}/>
                    <SharedInput height={35} mr={10} type="number" name='pointAmount' placeholder="0" value={pointAmount} onChange={onInputChange}/>

                    {/*<input id={'sendKakao'} type="checkbox" className={'m-2'} color={'default'}*/}
                    {/*       checked={this.state.sendKakao} onChange={this.onSendKakao}/>*/}
                    {/*<label htmlFor={'sendKakao'} className='text-secondary mr-2'>카카오톡 발송</label>*/}
                    <Button bg={'green'} fg={'white'} onClick={givePoint}> 포인트지급/회수 </Button>
                </Flex>
            </Div>

            <div
                className="ag-theme-balham"
                style={{
                    height: '500px'
                }}
            >
                <AgGridReact
                    columnDefs={agGrid.columnDefs}  //컬럼 세팅
                    rowSelection={'multiple'}
                    defaultColDef={agGrid.defaultColDef}
                    overlayLoadingTemplate={agGrid.overlayLoadingTemplate}
                    overlayNoRowsTemplate={agGrid.overlayNoRowsTemplate}
                    onGridReady={onGridReady}   //그리드 init(최초한번실행)
                    rowData={dataList}
                    frameworkComponents={agGrid.frameworkComponents}
                    onRowClicked={onSelectionChanged}       // 클릭된 row
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

export default SpecialPoint