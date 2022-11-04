import React, {useContext} from 'react';
import {Div, Flex, Hr, Span} from "~/styledComponents/shared";
import {withRouter} from "react-router-dom";
import {Bold} from "~/styledComponents/ShopBlyLayouts";
import {MenuContext} from "~/components/common/navs/shopScrolledNav/index";
import styled from "styled-components";
import {color} from "~/styledComponents/Properties";
import {getValue} from "~/styledComponents/Util";
import ComUtil from "~/util/ComUtil";

const Wrapper = styled.div`
    padding: ${getValue(16)};
    background-color: ${color.white};
    box-shadow: 1px 1px 2px rgb(0 0 0 / 10%);
`

const MenuGroup = withRouter(({menuGroup, menuList, history}) => {
    const {toggle} = useContext(MenuContext)
    const onClick = (url) => {
        toggle()
        history.push(url)
    }
    return (
        <Div fontSize={14}>
            <Span mb={12} fg={'black'} display={'block'}><strong>{menuGroup.label}</strong></Span>
            <Flex flexWrap={'wrap'}>
                {
                    menuList.map(menu =>
                        <Div pr={8} pb={8}>
                            <Div px={12} py={4} bg={'white'} doActive rounded={20} cursor={1}
                                 onClick={onClick.bind(this, menu.values[0])}
                                 bc={menu.values.includes(history.location.pathname) ? 'green' : 'secondary'}
                                 fg={menu.values.includes(history.location.pathname) ? 'green' : 'dark'}
                            >
                                {menu.label}
                            </Div>
                        </Div>
                    )
                }
            </Flex>
        </Div>
    )
})

const ExpandMenu = ({menuGroupList, menuList}) => {
    return (
        <Wrapper onClick={e => e.stopPropagation()}>
            {
                menuGroupList.map((menuGroup, index) =>
                    <>
                        <MenuGroup
                            menuGroup={menuGroup}
                            menuList={menuList.filter(menu => menu.parentKey === menuGroup.parentKey)}
                        />
                        {
                            (menuGroupList.length -1) !== index && <Hr mt={8} mb={16} />
                        }
                    </>
                )
            }
        </Wrapper>
    )
};



export default ExpandMenu;
