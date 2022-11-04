// import React, { useState, useEffect, Fragment } from 'react';
// import {Container} from "reactstrap";
// import {Button, Div, Flex, Input, ShadowBox, Span} from "~/styledComponents/shared";
// import styled from "styled-components";
// import {FaMinusCircle, FaPlusCircle} from "react-icons/fa";
// import {modifyGoodsStepName} from "~/lib/dealApi";
//
// const Subject = styled(Div)`
//     font-size: 16px;
//     font-weight: 700;
// `;
//
// const DealGoodsStepName = (props) => {
//     const [stepNames, setStepNames] = useState(props.data || null);
//
//     const onSave = async() => {
//         const {data} = await modifyGoodsStepName(props.goodsNo, stepNames);
//         if(data) {
//             alert('저장이 완료되었습니다.');
//         }
//         props.onClose()
//     }
//
//     const onDeleteClick = ({index}) => {
//         const stepNamesList = Object.assign([], stepNames)
//         stepNamesList.splice(index, 1)
//         setStepNames(stepNamesList)
//     }
//
//     const addStepName = () => {
//         const stepNamesList = Object.assign([], stepNames)
//         stepNamesList.push({
//             stepName: '', description: ''
//         })
//         console.log({stepNamesList})
//         setStepNames(stepNamesList)
//     }
//
//     const onChangeStapName = (index, e) => {
//         const value = e.target.value;
//         const stepNamesList = Object.assign([], stepNames);
//         stepNamesList[index].stepName = value;
//         setStepNames(stepNamesList)
//     }
//
//     const onChangeDescription = (index, e) => {
//         const value = e.target.value;
//         const stepNamesList = Object.assign([], stepNames);
//         stepNamesList[index].description = value;
//         setStepNames(stepNamesList)
//     }
//
//     return(
//         <Container>
//             <ShadowBox>
//                 <Flex mb={10}>
//                     <Subject>공동구매 상품 이력 단계 설정</Subject>
//                     <Button ml={20} onClick={addStepName} bg={'green'} fg={'white'} px={10}><FaPlusCircle/>{' 행추가'}</Button>
//                 </Flex>
//
//                 <Div mt={20}>
//                     {
//                         stepNames.map((stepName, index) =>
//                             <Flex className={'mb-2'}>
//                                 <Span>단계명칭</Span>
//                                 <Input className={'ml-1'} type="text" value={stepName ? stepName.stepName :''} onChange={onChangeStapName.bind(this, index)}/>
//                                 <Span className={'ml-3'}>소개문구</Span>
//                                 <Input className={'ml-1'} type="text" width={'50%'} value={stepName ? stepName.description :''} onChange={onChangeDescription.bind(this, index)}/>
//                                 <Button
//                                     ml={10}
//                                     bg={'danger'} fg={'white'}
//                                     onClick={onDeleteClick.bind(this, {index})}><FaMinusCircle />{' 삭제'}
//                                 </Button>
//                             </Flex>
//                         )
//                     }
//
//                 </Div>
//
//                 <div className={'text-right'}>
//                     <Button rounded={2} bg={'darkBlack'} fg={'white'} onClick={onSave} >저장</Button>
//                 </div>
//             </ShadowBox>
//         </Container>
//     )
// }
//
// export default DealGoodsStepName