import React from 'react'
import {RiSearchLine} from 'react-icons/ri'
import {Div} from "~/styledComponents/shared";
import {withRouter} from 'react-router-dom'
import {Link} from '~/styledComponents/shared'
// function onClick() {
//     Webview.openPopup('/search', true)
// }

const SearchButton = ({history}) => {
    return(
        <Div onClick={() => history.push('/search')}
             // pb={3}
            bg={'white'}
             py={8}
            px={8}
        >
            <RiSearchLine size={26}/>
        </Div>
    )
}
export default withRouter(SearchButton)