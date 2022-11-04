import React, { useState, useEffect } from 'react';
import {Button, Input, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import { getLoginAdminUser } from "~/lib/loginApi";
import {saveAllowanceIP, removeAllowanceIP, getAllowanceIPList} from "~/lib/adminApi";
import ComUtil from '~/util/ComUtil'
import { AgGridReact } from 'ag-grid-react';
import {Div, Flex, Right, Space} from "~/styledComponents/shared";
import {MenuButton} from "~/styledComponents/shared/AdminLayouts";

const AllowanceIP = (props) => {

    const [modalOpen, setModalOpen] = useState(false);
    const [allowanceData,setAllowanceData] = useState({
        seq:0,
        ip:'',
        title:'',
        desc:''
    })

    const [list, setList] = useState([]);

    const [agGrid, setAgGrid] = useState({
        columnDefs: [
            {headerName: 'Seq', field: 'seq', cellRenderer: "titleRenderer"},
            {headerName: 'IP', field: 'ip'},
            {headerName: '명칭', field: 'title', width: 300},
            {headerName: "비고", field: "desc", width: 500},
        ],
        defaultColDef: {
            width: 200,
            resizable: true,
            filter: true,
            sortable: true,
            floatingFilter: true,
            filterParams: {
                newRowsAction: 'keep'
            }
        },
        frameworkComponents: {
            titleRenderer:titleRenderer
        },
    })

     function titleRenderer ({value, data:rowData}) {
        return (
            <div onClick={onModOpen.bind(this, rowData)} style={{color: 'blue'}}>
                <u>{rowData.seq}</u>
            </div>
        );
    };

    useEffect(() => {

        async function fetch(){
            await checkLogin();
            await getSearch();
        }
        fetch();

    }, []);

    async function checkLogin() {
        let user = await getLoginAdminUser();

        if (!user || user.email.indexOf("ezfarm") < 0) {
            window.location = "/admin/login";
        }
    }

    async function getSearch() {
        let {data} = await getAllowanceIPList();
        setList(data);
    }

    const onSearch = () => {
        getSearch();
    }

    const onNew = () => {
        setAllowanceData({
            seq:0,
            ip:'',
            title:'',
            desc:''
        });
        toggle();
    }

    const onModOpen = (data) => {
        setAllowanceData({
            seq:data.seq,
            ip:data.ip,
            title:data.title,
            desc:data.desc
        });
        toggle();
    }

    const toggle = () => {
        setModalOpen(!modalOpen);
    }

    const onChangeInput = (e) => {
        const {name,value} = e.target;
        setAllowanceData({
            ...allowanceData,
            [name]:value
        })
    }

    const checkValidation = () => {

        if(allowanceData.ip === '') {
            alert('IP을 입력해주세요');
            return false;
        }

        return true;
    }

    const onSave = async() => {
        if(!checkValidation()) {
            return;
        }
        let {data:result} = await saveAllowanceIP(allowanceData);
        if(result === 1) {
            alert('저장되었습니다.');
            toggle();
            getSearch();
        }
    }

    const onDel = async() => {
        if(window.confirm("삭제하시겠습니까?")) {
            let {data: result} = await removeAllowanceIP(allowanceData.seq);
            if (result === 1) {
                alert('삭제되었습니다.');
                toggle();
                getSearch();
            }
        }
    }

    const copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    return (
        <Div p={16}>
            <h5> 관리자 로그인 허용 IP 설정 </h5>
            <Div p={16}>
                <Flex>
                    <MenuButton onClick={onNew}> 신규 </MenuButton>
                    <Right>
                        <MenuButton onClick={onSearch}> 검색 </MenuButton>
                    </Right>
                </Flex>
            </Div>
            <div
                className="ag-theme-balham"
                style={{
                    height: '400px'
                }}
            >
                <AgGridReact
                    // enableSorting={true}
                    // enableFilter={true}
                    columnDefs={agGrid.columnDefs}
                    defaultColDef={agGrid.defaultColDef}
                    rowSelection={'single'}  //멀티체크 가능 여부
                    // enableColResize={true}
                    rowData={list}
                    frameworkComponents={agGrid.frameworkComponents}
                    onCellDoubleClicked={copy}
                />
            </div>

            <Modal size="lg" isOpen={modalOpen} toggle={toggle} >
                <ModalHeader>관리자 로그인 허용 IP 설정</ModalHeader>
                <ModalBody>
                    <Div mb={5}>
                        <Input type="text" readOnly={true} value={allowanceData.seq} />
                    </Div>
                    <Div mb={5}>
                        <Input type="text" placeholder="IP" name={"ip"} value={allowanceData.ip} onChange={onChangeInput}/>
                    </Div>
                    <Div mb={5}>
                        <Input type="text" placeholder="명칭" name={"title"} value={allowanceData.title} onChange={onChangeInput}/>
                    </Div>
                    <Div>
                        <Input type="text" placeholder="비고" name={"desc"} value={allowanceData.desc} onChange={onChangeInput}/>
                    </Div>
                </ModalBody>
                <ModalFooter>
                    <Space>
                        <Button color={'secondary'} onClick={toggle}>닫기</Button>
                        <Button color={'primary'} onClick={onSave}>저장</Button>
                        {
                            allowanceData.seq > 0 && <Button color="danger" onClick={onDel}>삭제</Button>
                        }
                    </Space>
                </ModalFooter>
            </Modal>
        </Div>
    )
}

export default AllowanceIP