import React, { useState, useEffect } from 'react'
import { List } from '../components/List'
import ComUtil from '~/util/ComUtil'
import { Modal, ModalHeader, ModalBody, Button, ModalFooter } from 'reactstrap'

import Notice from '~/components/admin/notice'

import { getNoticeList } from '~/lib/shopApi'

function NoticeList(props) {

    const [data, setData] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const [noticeNo, setNoticeNo] = useState(null)

    useEffect(() => {
        search()
    }, [])

    async function search() {

        let params = {userType: 'producer', isPaging: true, limit: 5, page: 1}
        const {status, data} = await getNoticeList(params)

        if (status === 200) {

            let items = []

            ComUtil.sortDate(data.noticeList, 'regDate', true);

            if(data.noticeList && data.noticeList.length <= 5)
                items = data.noticeList;
            else
                items = data.noticeList.slice(0,5);

            items = items.map(item => {
                return {
                    ...item,
                    imageUrl: '',
                    regDate: ComUtil.utcToString(item.regDate, 'YY.MM.DD HH:MM'),
                    userType: '관리자'
                }
            })

            console.log({items})

            setData(items)
        }
    }

    function onHeaderRightSectionClick(){
        props.history.push('/producer/web/home/noticeList')
    }

    function onClick(param){
        console.log(param)
        setNoticeNo(param.noticeNo)
        toggle()
    }

    function toggle(){
        setIsOpen(!isOpen)
    }

    return(
        <>
        <List header={'공지사항'}
              headerRightSection={'more >'}
              onHeaderRightSectionClick={onHeaderRightSectionClick}
              data={data}
              titleKey={'title'}
              subTitleKey={'regDate'}
              badgeTextKey={'userType'}
              onImgClick={onClick}
              onTitleClick={onClick}
              onBadgeClick={onClick}
        />

        <Modal size={'xl'} isOpen={isOpen} toggle={toggle} className={''} centered>
            <ModalHeader toggle={toggle}>공지사항</ModalHeader>
            <ModalBody>
                <Notice noticeNo={noticeNo} />
            </ModalBody>
            <ModalFooter>
                <Button size='sm' color='secondary' onClick={toggle}>확인</Button>
            </ModalFooter>
        </Modal>
        </>
    )
}
export default NoticeList