import React, {Fragment, Component} from 'react';

import {ShopXButtonNav} from '~/components/common/index'

import AddressManagementContent from './AddressManagementContent'
import {getConsumer} from "~/lib/shopApi";
import BackNavigation from "~/components/common/navs/BackNavigation";
import AddressList from '~/components/common/AddressList';
export default class AddressManagement extends Component {
    constructor(props) {
        super(props);
    }
    async componentDidMount() {
        const loginUser = await getConsumer();
        if(!loginUser || !loginUser.data){
            this.props.history.replace('/mypage');
            return;
        }
    }

    render() {
        return (
            <Fragment>
                <AddressList isMng={true} />
            </Fragment>
        )
    }
}