/*global kakao*/
import React, { useRef, useEffect, useState } from 'react';
import {Server} from "~/components/Properties";
import styled from "styled-components";
import uuid from 'react-uuid';
const MapWrapContainer = styled.div`
  position:relative;
  overflow:hidden;
  width:100%;
  height:50vmin;
`;
const MapContainer = styled.div`
  width:100%;
  height:100%;
  position:relative;
  overflow:hidden;
  touch-action: manipulation;
`;

const KakaoMap = (props) => {

    const idUUID = uuid();
    const [mapId,] = useState(props.id?props.id+idUUID:'map'+idUUID);
    const [title,] = useState(props.title);
    const [addr,] = useState(props.addr);
    const [_map, setMap] = useState();

    //스크립트 파일 읽어오기
    const new_script = src => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.addEventListener('load', () => {
                resolve();
            });
            script.addEventListener('error', e => {
                reject(e);
            });
            document.head.appendChild(script);
        });
    };

    useEffect(() => {
        //카카오맵 스크립트 읽어오기
        const kakaoApiKey = `https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${Server.getKakaoAppKey()}&libraries=services`;
        const my_script = new_script(kakaoApiKey);

        //스크립트 읽기 완료 후 카카오맵 설정
        my_script.then(() => {
            console.log('kakaoMap script loaded!!!');
            const kakao = window['kakao'];
            kakao.maps.load(() => {
                const mapContainer = document.getElementById(mapId);
                const mapOptions = {
                    center: new kakao.maps.LatLng(37.56000302825312, 126.97540593203321), //좌표설정
                    level: 3
                };
                const map = new kakao.maps.Map(mapContainer, mapOptions); //맵생성

                // 지도 타입 변경 컨트롤을 생성한다
                const mapTypeControl = new kakao.maps.MapTypeControl();

                // 지도의 상단 우측에 지도 타입 변경 컨트롤을 추가한다
                map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPLEFT);

                // 지도에 확대 축소 컨트롤을 생성한다
                const zoomControl = new kakao.maps.ZoomControl();

                // 지도의 우측에 확대 축소 컨트롤을 추가한다
                map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

                setMap(map);

                // 주소-좌표 변환 객체를 생성합니다
                const geocoder = new kakao.maps.services.Geocoder();

                // 주소로 좌표를 검색합니다
                if(addr) {
                    geocoder.addressSearch(addr, function (result, status) {

                        // 정상적으로 검색이 완료됐으면
                        if (status === kakao.maps.services.Status.OK) {

                            const r_lat_y = result[0].y;
                            const r_lng_x = result[0].x;

                            //인포윈도우 표시 위치입니다
                            const iwPosition = new kakao.maps.LatLng(r_lat_y, r_lng_x);

                            // 결과값으로 받은 위치를 마커로 표시합니다
                            const marker = new kakao.maps.Marker({
                                map: map,
                                position: iwPosition,
                                clickable: true // 마커를 클릭했을 때 지도의 클릭 이벤트가 발생하지 않도록 설정합니다
                            });

                            // 인포윈도우에 표출될 내용으로 HTML 문자열이나 document element가 가능합니다
                            const bigMapLink = `https://map.kakao.com/link/map/${title},${r_lat_y},${r_lng_x}`;
                            const naviMapLink = `https://map.kakao.com/link/to/${title},${r_lat_y},${r_lng_x}`;
                            //const iwContent = `<div style="padding:5px;">${title}</div>`;
                            const iwContent = `<div style="padding:5px;">${title}<br/><a href="${bigMapLink}" style="color:blue" target="_blank">큰지도보기</a> <a href="${naviMapLink}" style="color:blue" target="_blank">길찾기</a></div>`;

                            // removeable 속성을 ture 로 설정하면 인포윈도우를 닫을 수 있는 x버튼이 표시됩니다
                            const iwRemoveable = true;

                            // 인포윈도우로 장소에 대한 설명을 표시합니다
                            const infowindow = new kakao.maps.InfoWindow({
                                content: iwContent,
                                removable : iwRemoveable
                            });
                            infowindow.open(map, marker);

                            // 지도의 중심을 결과값으로 받은 위치로 이동시킵니다
                            map.setCenter(iwPosition);

                            // 마커에 클릭이벤트를 등록합니다
                            kakao.maps.event.addListener(marker, 'click', function() {
                                // 마커 위에 인포윈도우를 표시합니다
                                infowindow.open(map, marker);
                            });
                        }
                    });
                }

            });
        });
    }, []);

    // 지도타입 컨트롤의 지도 또는 스카이뷰 버튼을 클릭하면 호출되어 지도타입을 바꾸는 함수입니다
    // const setMapType = (maptype) => {
    //     if (maptype === 'roadmap') {
    //         _map.setMapTypeId(kakao.maps.MapTypeId.ROADMAP);
    //     } else {
    //         _map.setMapTypeId(kakao.maps.MapTypeId.HYBRID);
    //     }
    // }

    // const zoomIn = () => { _map.setLevel(_map.getLevel() - 1); }
    // const zoomOut = () => { _map.setLevel(_map.getLevel() + 1); }

    return (
        <MapWrapContainer>
            <MapContainer id={mapId} />
        </MapWrapContainer>
    );
}

export default KakaoMap;