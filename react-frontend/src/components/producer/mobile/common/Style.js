import styled from "styled-components";
import {Button} from "~/styledComponents/shared";

export const FlexButton = styled(Button)`
    min-height: 32px;
    padding: 0 10px;  
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    & > * {
        margin-right: 4px;
    }
    & > *:last-child {
        margin: 0;
    }
`

export default {
    FlexButton
}