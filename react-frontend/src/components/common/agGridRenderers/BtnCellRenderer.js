import React, { Component } from 'react';
import AdminLayouts from "~/styledComponents/shared/AdminLayouts";
class BtnCellRenderer extends Component {
    constructor(props) {
        super(props);
        this.btnClickedHandler = this.btnClickedHandler.bind(this);
    }
    btnClickedHandler() {
        this.props.clicked(this.props.data);
    }
    render() {
        return (
            <AdminLayouts.SmButton onClick={this.btnClickedHandler}>{this.props.label}</AdminLayouts.SmButton>
        )
    }
}
export default BtnCellRenderer