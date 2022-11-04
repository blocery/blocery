import React, {useState} from 'react';
import {Div, Button, Flex, Right, WhiteSpace, Space} from "~/styledComponents/shared";
import Toast from "~/components/common/toast/Toast";
import DealProgress from '~/components/common/progresses/DealProgress'
import SearchInput from "~/components/common/SearchInput";
import ModalSample from "~/components/sample/Components/ModalSample";


function Content({componentName, children}) {
    return(
        <Div mt={20}>
            <Div fontSize={20}><strong>{componentName}</strong></Div>
            <Div mt={20}>
                {children}
            </Div>
        </Div>
    )
}


const Components = (props) => {

    const [searchInputData, setSearchInputData] = useState({keyword: 371,  code: '' })

    const onSearchChange = (param) => {
        console.log(param)
        setSearchInputData({
            keyword: param.keyword,
            code: param.code
        })

    }

    return (
        <div>
            <Div p={16}>
                <code>import SearchInput from "~/components/common/SearchInput";</code>
                <Content componentName={'SearchInput'}>


                    <SearchInput
                        label={'상품조회'}
                        placeholder={'상품번호'}
                        //모달 타이틀
                        title={'상품조회'}
                        data={searchInputData}
                        modalComponent={ModalSample}
                        onChange={onSearchChange}/>


                </Content>
            </Div>
            <hr/>
            <Div p={16}>
                <code>
                    import Toast from "~/components/common/toast/Toast";
                </code>
                <Content componentName={'Toast'}>
                    <Flex>
                        <Div>
                            <Toast position={'left'} title={'배송정책이 어떻게 되나요?'} content={'배송정책은 생산자가 정한 부분을 따르며, 도서산간지역은 예외로 정해진 배송료(3,000원)이 추가 됩니다. 그리고 샵블리 내의 모든 제품은 각각 배송비가 부여 됩니다.(무료배송 제외)'}>
                                <Div fontSize={12} fg={'dark'}>샵블리 배송비 정책?</Div>
                            </Toast>
                        </Div>
                        <Right>
                            <Toast position={'right'} title={'배송정책이 어떻게 되나요?'} content={'배송정책은 생산자가 정한 부분을 따르며, 도서산간지역은 예외로 정해진 배송료(3,000원)이 추가 됩니다. 그리고 샵블리 내의 모든 제품은 각각 배송비가 부여 됩니다.(무료배송 제외)'}>
                                <Div fontSize={12} fg={'dark'}>샵블리 배송비 정책?</Div>
                            </Toast>
                        </Right>
                    </Flex>

                    <Div mt={20}>
                        <Toast position={'left'} title={'배송정책이 어떻게 되나요?'} content={'배송정책은 도서산간지역은 예외로 정해진 배송료(3,000원)이 추가 됩니다. 그리고 샵블리 내의 모든 제품은 각각 배송비가 부여 됩니다.(무료배송 제외)'}>
                            <Button bc={'light'} bg={'white'}>
                                샵블리 배송비 정책?
                            </Button>
                        </Toast>
                    </Div>

                    <Div mt={20}>
                        <Toast position={'left'} title={'배송정책이 어떻게 되나요?'}
                               content={
                                   <div>
                                       <img src="https://img.hankyung.com/photo/201912/01.21032432.1.jpg" alt="이미지" width={'100%'}/>
                                       <p>
                                           <WhiteSpace>
                                               손흥민은 올해 여름에 토트넘과 2025년까지 재계약을 체결했다. \n 휴가에서 돌아온 뒤에 프리시즌 연속 공격 포인트에 개막전 맨체스터 시티, 3라운드 왓퍼드전에서 골망을 흔들었다. 토트넘은 손흥민 맹활약에 프리미어리그 1위에 있었다.
                                           </WhiteSpace>
                                       </p>
                                   </div>
                               }>
                            <Button bg={'green'} fg={'white'}>
                                샵블리 배송비 정책?
                            </Button>
                        </Toast>
                    </Div>



                    <Space mt={20}>
                        <Toast position={'left'} title={'배송정책이 어떻게 되나요?'} content={'배송정책은 도서산간지역은 예외로 정해진 배송료(3,000원)이 추가 됩니다. 그리고 샵블리 내의 모든 제품은 각각 배송비가 부여 됩니다.(무료배송 제외)'}>
                            <Button bc={'light'} bg={'white'}>
                                샵블리 배송비 정책?
                            </Button>
                        </Toast>
                        <Toast position={'left'} title={'배송정책이 어떻게 되나요?'} content={'배송정책은 도서산간지역은 예외로 정해진 배송료(3,000원)이 추가 됩니다. 그리고 샵블리 내의 모든 제품은 각각 배송비가 부여 됩니다.(무료배송 제외)'}>
                            <Button bc={'light'} bg={'white'}>
                                샵블리 배송비 정책?
                            </Button>
                        </Toast>
                    </Space>

                </Content>
            </Div>
            <hr/>

            <Div p={16}>
                <code>
                    import DealProgress from '~/components/common/progresses/DealProgress'
                </code>
                <Content componentName={'DealProgress.Basic'}>
                    <DealProgress.Basic goodsNo={431}
                                        value={70}
                                        minValue={50}
                                        maxValue={150}
                                        leftText={null}
                                        rightText={null}
                    />
                    <DealProgress.Basic goodsNo={431}
                                        value={70}
                                        minValue={50}
                                        maxValue={150}
                                        leftText={'왼쪽 내용'}
                                        rightText={'오른쪽 내용'}
                    />
                </Content>
                <Content componentName={'DealProgress.AutoUpdate'}>
                    <DealProgress.AutoUpdate goodsNo={431}
                                             value={70}
                                             minValue={50}
                                             maxValue={150}
                                             showProgressRate={true}
                                             showRemainedDaysCount={true}
                    />
                </Content>
            </Div>
        </div>
    );
};

export default Components;
