import React, {createContext, useEffect} from 'react';
import ScrollMenu from "./ScrollMenu";
import ExpandMenu from "./ExpandMenu";
import {Div, Fixed} from "~/styledComponents/shared";
import {useModal} from "~/util/useModal";
import ComUtil from "~/util/ComUtil";
import styled from "styled-components";

export const MenuContext = createContext()

const Mask = styled(Fixed)`        
    width: 100%;    
    background-color: rgba(0,0,0, 0.7);   
    z-index: 50;
`;

const ShopScrolledNav = ({top, menuGroupList, menuList}) => {

    const [modalOpen, setModalOpen, selected, setSelected, setModalState, toggle] = useModal()

    useEffect(() => {
        if (modalOpen) {
            ComUtil.noScrollBody()
        }else{
            ComUtil.scrollBody()
        }
    }, [modalOpen])

    const onMaskClick = e => {
        toggle()
    }

    return (
        <MenuContext.Provider value={{modalOpen, setModalState, toggle}}>
            <Div relative>
                {/* 가로 스크롤 메뉴 */}
                <ScrollMenu menuList={menuList}/>
                {
                    modalOpen && (
                        <Mask top={top+44} //top + 45 (ScrollMenu Wrapper height +1 )
                              bottom={57}
                              onClick={onMaskClick}
                        >
                            {/* 펼쳐지는 메뉴 */}
                            <ExpandMenu menuGroupList={menuGroupList} menuList={menuList} />
                            {/* 마스크 영역에 추가정보 넣으려면.. */}
                            {/*<Div fg={'white'} p={16} textAlign={'center'}>*/}
                            {/*    <Div>#샵블리를 더 잘 이용하는 방법!</Div>*/}
                            {/*    <Div>#핫한 상품!</Div>*/}
                            {/*    <Div>#핫 키워드!</Div>*/}
                            {/*    <Div>#등등......</Div>*/}
                            {/*</Div>*/}
                        </Mask>
                    )
                }
            </Div>
        </MenuContext.Provider>
    );
};

export default ShopScrolledNav;
