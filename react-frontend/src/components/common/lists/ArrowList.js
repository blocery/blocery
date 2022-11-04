import React from 'react';
import {Div, Flex, Link, Right} from "~/styledComponents/shared";
import {color} from "~/styledComponents/Properties";
import {IoIosArrowForward} from "react-icons/io";

const Item = ({text, to}) =>
    <Link to={to} display={'block'}>
        <Flex px={16} py={23} bg={'white'} doActive>
            <Div fontSize={17} bold>{text}</Div>
            <Right><IoIosArrowForward color={color.dark} size={22}/></Right>
        </Flex>
    </Link>

const ArrowList = ({data = []}) =>
    <Div custom={`
                border-top: 1px solid ${color.light};
                & > a {
                    border-bottom: 1px solid ${color.light};
                }
            `}>
        {
            data.map(({text, to}, index) =>
                <Item key={`${to}${index}`} text={text} to={to} />
            )
        }
    </Div>

export default ArrowList;
