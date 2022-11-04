import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';

import React from 'react';
import ReactDOM from 'react-dom';

// Import bootstrap(v3 or v4) dependencies
import "bootstrap/js/dist/modal";
import "bootstrap/js/dist/dropdown";
import "bootstrap/js/dist/tooltip";

// import 'bootstrap/scss/bootstrap.scss'
//부트스트랩 색상 오버라이드
import '~/styles/bsVariables.scss'

import 'react-toastify/dist/ReactToastify.min.css'
import 'react-dates/lib/css/_datepicker.css';
import './styles/react_dates_overrides.css';

import moment from "moment-timezone";
import "moment/locale/ko";

import './styles/customTheme.scss';

//ag-grid
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

import "../src/styles/fontStyle.css"
import "../src/styles/cursor.css"

//swiper css
import 'swiper/css/swiper.css'

import "./App.css"

//quill css
import 'react-quill/dist/quill.snow.css';
import './components/common/quillEditor/QuillEditor.css';
//summernote css
import "react-summernote/dist/react-summernote.css";
import './components/common/summernoteEditor/SummerNoteEditor.css';

import 'react-lazy-load-image-component/src/effects/blur.css';

import Root from './Root'
moment.locale("ko");
const rootElement = document.getElementById('root');
if (rootElement.hasChildNodes()) {
    ReactDOM.hydrate(
        <Root />,
        rootElement
    );
}else{
    ReactDOM.render(
        <Root />,
        rootElement
    );
}