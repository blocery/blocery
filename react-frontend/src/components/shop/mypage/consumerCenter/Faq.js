import React, {useState, useEffect, Fragment, useMemo} from 'react'
import {Div, Flex, Button, Input, Span, Right, GridColumns, Hr, WhiteSpace} from '~/styledComponents/shared'
import Collapse from 'reactstrap/lib/Collapse'
import { HrHeavyX2} from "~/styledComponents/mixedIn";
import { getFaqList, getFaqSearch } from "~/lib/adminApi"
import ComUtil from "~/util/ComUtil";
import {IoIosArrowDown} from "react-icons/io";
import {BsSearch} from 'react-icons/bs'
import BackNavigation from "~/components/common/navs/BackNavigation";
import {EmptyBox} from "~/styledComponents/ShopBlyLayouts";
import FAQ_STORE from "./FaqStore"


const CollapseItem = ({title, content}) => {
    const [isOpen, setOpen] = useState(false)
    const toggle = () => setOpen(!isOpen)
    return(
        <Div>
            <Flex cursor onClick={toggle} p={16} >
                <Div fontSize={15} fg={'black'}><Span fg={'green'} fontSize={20} mr={12}>Q</Span>{title}</Div>
                <Right><IoIosArrowDown color={'green'} /></Right>
            </Flex>
            <Hr />

            <Collapse isOpen={isOpen}>
                <Div bg={'background'} p={16}>
                    <WhiteSpace fg={'black'} lineHeight={25} dangerouslySetInnerHTML={{__html: content}} />
                </Div>
            </Collapse>
            <Hr />
        </Div>
    )
}

const store = Object.values(FAQ_STORE).filter(faq=>faq.hidden===false).map(faq => ({
    faqType: faq.faqType,
    name: faq.name
}))


const Faq = () => {
    // const [loading, setLoading] = useState(false);
    const [tabTitle, setTabTitle] = useState('all');
    const [faqList, setFaqList] = useState([]);
    const [isVisible, setIsVisible] = useState(false);
    const [tIndex, setIndex] = useState(null);
    const [nIndex, setNIndex] = useState([]);
    const [keyword, setKeyword] = useState(null);

    useEffect(() => {
        getData();
    }, [tabTitle])

    useEffect(() => {
        search();
    }, [keyword])

    async function getData() {
        let {data: faqs} = await getFaqList(tabTitle);

        faqs = ComUtil.sortDate(faqs, 'regDate', true);

        setFaqList(faqs)
    }

    async function search() {
        // if(!keyword || keyword.length <= 0) return

        // sessionStorage.setItem('searchKeyword', keyword); //재진입시 사용 용도.
        const {data: searched} = await getFaqSearch(keyword, tabTitle)

        setFaqList(searched)
    }

    function onChangeTab(type) {
        setTabTitle(type)
        setKeyword('')
    }

    const toggle = (index) => {
        setIsVisible(!isVisible);
        setIndex(index);

        const ioIndex = nIndex.indexOf(index)

        const arrIndex = Object.assign([], nIndex)

        if (ioIndex === -1) {
            arrIndex.push(index)
            setNIndex(arrIndex)
        }else{
            arrIndex.splice(ioIndex, 1)
            setNIndex(arrIndex)
        }
    }

    function onKeywordChange(e) {
        const { value } = e.target
        setKeyword(value)
    }

    //조회
    async function onSearchClick() {
        // setTabTitle('all')

        await search()
    }

    return (
        <Fragment>
            {/*<ShopXButtonNav underline historyBack>FAQ</ShopXButtonNav>*/}
            <BackNavigation>FAQ</BackNavigation>
            <Div p={16} bg={'green'} height={133}>
                <Div fg={'white'} fontSize={17} mb={15} bold>자주 묻는 질문</Div>
                <Flex cursor relative bg={'white'} rounded={4}>
                    <Input p={15} height={50} block bw={0}
                           placeholder={'무엇을 도와드릴까요?'}
                           onChange={onKeywordChange}
                           value={keyword}
                    />
                    <Flex justifyContent={'center'} width={50} height={50} rounded={'50%'} onClick={onSearchClick} fontSize={20} fg={'green'}
                        custom={`
                            transition: 0.2s;
                            &:hover {
                                box-shadow: 0 0 0 40px rgba(255, 255, 255, 80%);
                            }
                        `}
                    ><BsSearch /></Flex>
                </Flex>
            </Div>
            <GridColumns p={15} repeat={3} colGap={0} rowGap={20} fg={'darkBlack'} fontSize={14} textAlign={'center'} cursor>
                <Div onClick={onChangeTab.bind(this, 'all')} fg={tabTitle=='all' && 'green'}>전체</Div>

                {
                    store.map( faq => {
                        return (
                            <Div onClick={onChangeTab.bind(this, faq.faqType)} fg={tabTitle==faq.faqType && 'green'}>{faq.name}</Div>
                        )
                    })
                }
                {/*위 store.map으로 치환*/}
                {/*<Div onClick={onChangeTab.bind(this, 'myInfo')} fg={tabTitle=='myInfo' && 'green'}>나의 정보관리</Div>*/}
                {/*<Div onClick={onChangeTab.bind(this, 'order')} fg={tabTitle=='order' && 'green'}>주문/결제</Div>*/}
                {/*<Div onClick={onChangeTab.bind(this, 'delivery')} fg={tabTitle=='delivery' && 'green'}>배송</Div>*/}
                {/*<Div onClick={onChangeTab.bind(this, 'cancel')} fg={tabTitle=='cancel' && 'green'}>취소/반품/교환</Div>*/}
                {/*<Div onClick={onChangeTab.bind(this, 'point')} fg={tabTitle=='point' && 'green'}>코인/포인트</Div>*/}
                {/*<Div onClick={onChangeTab.bind(this, 'service')} fg={tabTitle=='service' && 'green'}>서비스/기타</Div>*/}
            </GridColumns>

            <HrHeavyX2 />

            {
                    faqList.map((item) => {
                        return (
                            <CollapseItem key={`faq${item.faqNo}`} title={item.title} content={item.content} />
                        )
                    })
            }


            {
                (faqList !== undefined && faqList.length <= 0) &&
                <div className='w-100 h-100 d-flex justify-content-center align-items-center p-5 text-dark'>{(faqList===undefined)?'':<EmptyBox>FAQ가 없습니다.</EmptyBox>}</div>
            }
        </Fragment>
    )
}

export default Faq