import styled from "styled-components";
import {Flex} from "~/styledComponents/shared";
import {color} from "~/styledComponents/Properties";
import {getValue} from "~/styledComponents/Util";

export const ItemHeader = styled(Flex)`
    // background-color: ${color.veryLight};
    // border-top: 1px solid ${color.light}; 
    // border-bottom: 1px solid ${color.light};
    // padding:  ${getValue(20)} 0; 
    // min-height: ${getValue(54)};
    font-size: ${getValue(17)};
    font-weight: 900;    
`;

export default {
    ItemHeader
}