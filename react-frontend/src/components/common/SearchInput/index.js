import React, {useEffect, useRef, useState} from 'react';
import {Button, Div, Flex, Input} from "~/styledComponents/shared";
import {MdClose} from 'react-icons/md'
import {IoRemoveCircleOutline} from 'react-icons/io5'
import {BsTrash} from 'react-icons/bs'
import {RiSearchLine} from 'react-icons/ri'
import styled from 'styled-components'
import {color, hoverColor} from "~/styledComponents/Properties";
import {useModal} from "~/util/useModal";
import AdminLayouts from "~/styledComponents/shared/AdminLayouts";
import {getValue} from "~/styledComponents/Util";

const defaultInputStyle = {
    width: 150
}

const StyledButton = styled.button`
    background: ${color.white};
    padding: 0;
    height: ${getValue(35)};
    width: ${getValue(35)};
    &:active {
        background: ${hoverColor.white};
    }
`

const SearchInput = ({
                         name, //리턴 받을 name
                         label, //왼쪽 명칭
                         title, //모달 명칭
                         placeholder,
                         data = {keyword: '', code: '', data: null, filter: null},
                         inputStyle = {},
                         // hideCode = false,
                         // hideDel = false,
                         // hideInput = false,
                         readOnly = false,
                         disabled = false,
                         modalComponent,
                         onChange = () => null,
                         onSearchClick
                     }) => {
    const [modalOpen, setModalOpen, selected, setSelected, setModalState, toggle] = useModal()
    const inputRef = useRef(); //keyword input ref


    const onHandleFocus = (e) => {
        inputRef.current.select()
    }

    const onHandleKeyDown = (e) => {
        const keyCode = e.keyCode
        if (keyCode === 13) {
            onSearch()
            return
        }
    }

    const onHandleChange = e => {

        const __keyword = e.target.value
        const __filter = data.filter
        const __code = ''
        const __data = null

        onChange({
            name: name,
            keyword: __keyword,
            filter: __filter, //받은것을 항상 그대로 돌려줌. (단방향)
            code: __code,
            data: __data
        })
    }

    //모달 오픈
    //엔터 or 검색 클릭시
    const onSearch = async () => {

        //custom onClick 일 경우 우선한다.
        if (onSearchClick && typeof onSearchClick === 'function') {
            const canClick = await onSearchClick()

            //false 반환 일 경우 더이상 검색 수행 못하도록
            if (!canClick) return
        }

        //antD Input 은 current.input 으로 접근 해야 함. 하지만 inputRef.current.input = "bla" 처럼 set은 안됨.
        if (inputRef.current) {
            setSelected(inputRef.current)
        }

        toggle()
    }

    //그리드에서 선택 했을 경우
    const onModalClose =  (params) => {
        onChange({
            name: name,                 //구분용 이름 (항상 받은 것을 그대로 돌려줌: 단방향)
            keyword: params.___keyword, //기본 검색용 키워드
            filter: data.filter,        //필터링 조건으로 검색(항상 받은 것을 그대로 돌려줌: 단방향)
            code: params.___code,       //그리드 rowData 의 유일키
            data: params.data           //그리드 rowData
        })

        if (inputRef.current) //gary추가 2021.12.29 모달에서 호출시 null오류방지.
            inputRef.current.focus()

        toggle()
    }

    //모달에서 취소시
    const onModalCancel = () => {
        if (inputRef.current)
            inputRef.current.focus()
        toggle()
    }

    //클리어 클릭
    const onClearClick = () => {
        onChange({
            name: name,
            keyword: '',
            filter: data.filter, //받은것을 항상 그대로 돌려줌. (단방향)
            code: '',
            data: null
        })
    }

    if (!modalComponent) return null

    const ModalComponent = modalComponent

    return (
        <div>
            <Flex>

                {
                    label && (
                        <Div mr={8}>
                            {label}
                        </Div>
                    )
                }
                <Flex
                    custom={`
                & input {
                    border: 0;
                }                
                
                & button {
                    border: 0;
                }
                
                border: 1px solid ${color.light};
                
                & > div:nth-child(1) {
                    border-right: 1px solid ${color.light};
                }
                & > div:nth-child(2) {
                    border-right: 1px solid ${color.light};
                }
            `}>
                    <Div relative>
                        <Div absolute top={'50%'} right={7} yCenter cursor onClick={onClearClick}>
                            <MdClose color={color.secondary} />
                        </Div>
                        <Input
                            height={35}
                            ref={inputRef}
                            // itemRef={inputRef}
                            value={data.keyword}
                            style={{...defaultInputStyle, ...inputStyle}}
                            placeholder={placeholder}
                            // addonAfter={hideCode ? "" : data.code ? data.code : " "}
                            onFocus={onHandleFocus}
                            onKeyDown={onHandleKeyDown}
                            onChange={onHandleChange}
                            readOnly={readOnly}
                        />
                    </Div>
                    {
                        data.code &&
                        <Div px={8}>
                            {data.code}
                        </Div>
                    }
                    <StyledButton bc={0} p={0} onClick={onSearch} disabled={disabled} ><RiSearchLine/></StyledButton>
                </Flex>
            </Flex>
            {
                <ModalComponent
                    title={title}
                    keyword={data.keyword}
                    filter={data.filter}
                    modalOpen={modalOpen}
                    onCancel={onModalCancel}
                    onClose={onModalClose}
                />
            }
        </div>

    );
}

export default SearchInput;