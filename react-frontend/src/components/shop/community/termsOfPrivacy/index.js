import React from 'react';
import BackNavigation from "~/components/common/navs/BackNavigation";
import {Div} from "~/styledComponents/shared";
import {Table} from "reactstrap";
import styled from 'styled-components'

const TdCenter = styled.td`
    text-align: center;
`

//커뮤니티 이용약관
const TermsOfPrivacy = (props) => {
    return (
        <div>
            <BackNavigation>커뮤니티 이용약관</BackNavigation>
            <Div p={16} fontSize={13}>
                안녕하세요. 샵블리 입니다.<br/><br/>

                샵블리 커뮤니티 운영정책을 공지하여 드리오니 참고하여 이용해 주시길 부탁 드리며,<br/>
                커뮤니티 활동을 통한 포인트 획득 및 사용 등의 방법은 관련 안내를 참고해 주시기 바랍니다.<br/>
                - 안내 위치<br/>
                ① 토크 > 메뉴 슬라이드 > 포인트 안내<br/>
                ② 마이페이지 > 포인트 안내<br/><br/>

                <b>[커뮤니티 운영정책]</b><br/><br/>
                <b>□ '샵블리 커뮤니티'란?</b><br/><br/>

                샵블리 커뮤니티는 샵블리 서비스 및 상품과 관련된 다양한 의견과 정보를 나눌 수 있으며, 다른 이용자들의 유용한 정보를 통해 궁금증을 해결하고 팁과 후기 등을 공유하는 자유로운 소통의 공간입니다.<br/><br/>


                <b>□ 커뮤니티 기본 사용 규칙</b><br/><br/>

                1. 이용자 간 배려와 존중을 바탕으로 건전한 커뮤니티 활동을 합니다.<br/>
                - 커뮤니티에서는 바른말 고운 말을 사용하여 건전한 커뮤니티 문화를 조성하도록 합니다.<br/>
                - 자신의 의견과 다르더라도 다양한 의견을 존중하고 다른 이용자가 등록한 게시물(게시글, 댓글, 사진, 그림, 동영상 등 샵블리 커뮤니티에 게시 가능한 형태의 콘텐츠 일체를 가리키며, 이하 동일함)을 폄하하거나 비하하지 않습니다.<br/>
                - 다른 이용자에게 공포심, 불안감 또는 불쾌감을 유발할 수 있는 게시물을 반복적으로 게시하여서는 안됩니다.<br/>
                - 그 외 음란하거나 선정적인 게시물, 반윤리적이거나 반인격적인 게시물, 폭력적이거나 잔혹한 게시물, 악성코드 또는 허위사실을 유포하는 게시물, 그 밖에 범죄를 목적으로 하거나 이를 교사, 방조하는 게시물 등 법령, 약관 또는 운영 정책에 위반되는 게시물을 게시하여서는 안됩니다.<br/>
                - 다른 이용자에게 불이익을 가할 목적으로 허위 신고를 하여서는 안됩니다.<br/>

                2. 건전한 닉네임/프로필을 등록하여 사용해 주세요.<br/>
                - 닉네임 : 법령, 약관 또는 운영 정책에 위반되는 닉네임, 다른 이용자에게 혐오감, 불쾌감을 유발할 수 있는 닉네임, 상업적인 목적의 닉네임, 다른 사람의 개인 정보가 포함된 닉네임 등은 사용할 수 없습니다.<br/>
                샵블리 담당자를 사칭하거나 담당자로 오해될 소지가 있는 닉네임은 사용할 수 없습니다.<br/>
                - 프로필 이미지 : 법령, 약관 또는 운영 정책에 위반되거나 다른 사람의 권리(저작권, 상표권, 인격권 등)를 침해하는 이미지는 프로필 이미지로 사용할 수 없습니다.<br/>

                3. 커뮤니티 게시물 작성 시 적절한 게시판(카테고리)을 선택하여 주제에 맞는 내용을 명확하게 작성, 등록해 주세요.<br/>
                게시판(카테고리) 주제에 맞지 않는 게시물(주제와 무관하거나 상업적인 게시물 등) 및 디지털 자산, 암호화폐, 토큰, 거래소 등의 게시물, 댓글은 운영진에 의해 다른 게시판(카테고리)으로 이동 조치되거나 숨김 처리 또는 삭제될 수 있습니다.<br/>
                ※ 새로운 주제의 커뮤니티 게시판이 운영자에 의해 추가되거나 기존 게시판이 삭제될 수 있습니다.<br/>

                4. 커뮤니티 활동 시 법령, 약관 또는 운영 정책에 위반(다른 이용자를 모욕, 협박하거나 명예를 훼손하는 게시물 등) 되거나, 타인의 권리(저작권, 상표권, 인격권 등)를 침해하는 게시물을 게시해서는 안됩니다.<br/>
                ※ 명백하게 법령, 약관 또는 운영 정책에 위반되거나 타인의 권리를 침해하는 게시물, 타인의 권리를 침해한다는 이유로 신고가 접수된 게시물은 숨김 처리 또는 삭제될 수 있습니다.<br/><br/>


                <b>□ 커뮤니티 운영 정책</b><br/><br/>

                - 운영 정책은 커뮤니티를 이용하는 모든 이용자에게 적용됩니다.<br/>
                - 커뮤니티 운영 정책에 위반되는 게시물은 숨김 처리 또는 임의 삭제되고 해당 게시물의 작성자에 대해서는 이용 제한 조치가 부과될 수 있습니다. 또한 신고가 접수된 게시물의 작성자에 대해서는 내용 검토 후 커뮤니티 운영 정책에 따라 조치가 내려집니다. 검토 결과, 조치 대상에 해당하지 않는 경우에는 조치를 부과하지 않을 수 있습니다.<br/>
                ※ 이용 제한 : 30일, 영구 사용 정지(영구 사용 정지된 계정에 대해서는 제한 해제는 제공되지 않습니다.)<br/>
                - 지속적, 반복적으로 운영 정책을 위반한 경우 명백한 법령, 약관 또는 운영 정책 위반이나 타인의 권리침해에 해당하는 경우 또는 위반 행위의 정도가 중대한 경우에는 즉시 30일 이상의 이용 제한 또는 영구 사용 정지 제재를 부과할 수 있습니다.<br/>
                ※ 허위 신고, 특정인을 겨냥한 신고 등의 경우 신고자가 이용 제한을 받을 수 있습니다.<br/>
                - 운영 정책에 위반되는 경우에 대한 구체적인 사례 및 이에 대한 조치사항은 아래 세부 규칙을 참고해 주시기 바랍니다. 아래에는 대표적인 사례만 규정되어 있기 때문에 아래 규정되지 않은 행위라고 해서 허용되는 행위에 해당하는 것은 아닙니다.<br/><br/><br/>


                <Div overflow={'auto'} width={'100%'} maxWidth={768}>
                    <Table bordered style={{fontSize:12, width: 768}}>
                        <thead>
                        <tr>
                            <th rowSpan={2} style={{textAlign: 'center'}}>
                                항목
                            </th>
                            <th rowSpan={2} style={{textAlign: 'center'}}>
                                세부 내용
                            </th>
                            <th colSpan={2} style={{textAlign: 'center'}}>
                                조치사항
                            </th>
                        </tr>
                        <tr>
                            <TdCenter>게시물 삭제</TdCenter>
                            <TdCenter>이용 제한</TdCenter>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <th scope="row" rowSpan={3}>개인 정보/인격권/사생활 침해</th>
                            <td>다른 사람의 개인 정보를 유포하거나 도용하는 경우(예: 이름, 생년월일, 이메일 주소 등)</td>
                            <TdCenter>○</TdCenter>
                            <TdCenter>○</TdCenter>
                        </tr>
                        <tr>

                            <td>다른 사람의 Privacy 및 초상권을 침해하는 경우</td>
                            <TdCenter>○</TdCenter>
                            <TdCenter>○</TdCenter>
                        </tr>
                        <tr>

                            <td>타인의 민감한 개인 정보가 담겨 있는 웹페이지 링크가 포함된 게시물</td>
                            <TdCenter>○</TdCenter>
                            <TdCenter>○</TdCenter>
                        </tr>

                        <tr>
                            <th scope="row" rowSpan={3}>닉네임/프로필</th>
                            <td>사용자에게 혐오감/불쾌감을 유발하는 단어가 포함된 닉네임</td>
                            <TdCenter>○</TdCenter>
                            <TdCenter>○</TdCenter>
                        </tr>
                        <tr>
                            <td>선정적, 폭력적 이거나 타인의 권리(저작권, 상표권 등)를 침해하거나 법령, 약관 또는 운영 정책에 위반되는 이미지가 포함된 프로필 사진</td>
                            <TdCenter>○</TdCenter>
                            <TdCenter>○</TdCenter>
                        </tr>
                        <tr>
                            <td>샵블리 담당자로 오해 될 소지가 있는 닉네임 (예: 관리자, 샵블리, 고객센터, 운영자 등)</td>
                            <TdCenter>○</TdCenter>
                            <TdCenter>○</TdCenter>
                        </tr>

                        <tr>
                            <th scope="row">모욕/명예훼손</th>
                            <td>다른 사람을 모욕하거나 명예를 훼손하는 내용의 게시물(상대방의 인격을 무시하고 비방/비하하는 행위가 포함될 수 있습니다.)</td>
                            <TdCenter>○</TdCenter>
                            <TdCenter>○</TdCenter>
                        </tr>

                        <tr>
                            <th scope="row" rowSpan={2}>협박/위협</th>
                            <td>게시물 또는 비공개 메시지로 다른 이용자를 협박, 위협하는 경우</td>
                            <TdCenter>○</TdCenter>
                            <TdCenter>영구<br/>정지</TdCenter>
                        </tr>
                        <tr>
                            <td>다른 이용자에게 공포심, 불안감 또는 불쾌감을 유발하는 게시물을 반복적으로 게시하는 경우</td>
                            <TdCenter>○</TdCenter>
                            <TdCenter>영구<br/>정지</TdCenter>
                        </tr>



                        <tr>
                            <th scope="row" rowSpan={6}>커뮤니티 주제와 무관한 게시물</th>
                            <td>커뮤니티 주제 내용과 무관한 게시물</td>
                            <TdCenter>○</TdCenter>
                            <TdCenter>○</TdCenter>
                        </tr>
                        <tr>
                            <td>디지털 자산, 암호화폐, 토큰, 거래소 등의 게시물, 댓글</td>
                            <TdCenter>○</TdCenter>
                            <TdCenter>○</TdCenter>
                        </tr>
                        <tr>
                            <td>스팸성 게시물</td>
                            <TdCenter>○</TdCenter>
                            <TdCenter>○</TdCenter>
                        </tr>
                        <tr>
                            <td>동일 또는 유사한 게시물을 중복 게시하는 경우</td>
                            <TdCenter>○</TdCenter>
                            <TdCenter>○</TdCenter>
                        </tr>
                        <tr>
                            <td>정치적 성향을 가지고 특정 정당을 지지/비난하는 내용의 게시물</td>
                            <TdCenter>○</TdCenter>
                            <TdCenter>○</TdCenter>
                        </tr>
                        <tr>
                            <td>국제적 분쟁에 관한 내용의 게시물</td>
                            <TdCenter>○</TdCenter>
                            <TdCenter>○</TdCenter>
                        </tr>


                        <tr>
                            <th scope="row" rowSpan={3}>저작권 침해</th>
                            <td>저작권자로부터 이용 허락을 받지 않은 게시물</td>
                            <TdCenter>○</TdCenter>
                            <TdCenter>○</TdCenter>
                        </tr>
                        <tr>
                            <td>다른 이용자의 게시글을 과도하게 인용한 게시물</td>
                            <TdCenter>○</TdCenter>
                            <TdCenter>○</TdCenter>
                        </tr>
                        <tr>
                            <td>그 외 다른 사람의 IP(지식 재산권) 를 침해할 수 있는 게시물</td>
                            <TdCenter>○</TdCenter>
                            <TdCenter>○</TdCenter>
                        </tr>

                        <tr>
                            <th scope="row" rowSpan={2}>허위정보 유포</th>
                            <td>당사 임직원 또는 담당자를 사칭하여 작성된 게시물</td>
                            <TdCenter>○</TdCenter>
                            <TdCenter>○</TdCenter>
                        </tr>
                        <tr>
                            <td>타인의 권리를 침해할 수 있는 미확인 또는 허위의 정보를 포함한 게시물(예: 사실과 다른 루머, 거짓 기사 작성 및 배포하는 행위)</td>
                            <TdCenter>○</TdCenter>
                            <TdCenter>○</TdCenter>
                        </tr>

                        <tr>
                            <th scope="row" rowSpan={2}>상업적 행위</th>
                            <td>특정 URL을 공유하여 상업적 이익을 얻으려는 게시물</td>
                            <TdCenter>○</TdCenter>
                            <TdCenter>○</TdCenter>
                        </tr>
                        <tr>
                            <td>샵블리와 관련 없는 상업적 광고성 게시물</td>
                            <TdCenter>○</TdCenter>
                            <TdCenter>○</TdCenter>
                        </tr>



                        <tr>
                            <th scope="row" rowSpan={8}>비윤리적/비인격적 게시물</th>
                            <td>모독(각 종교의 신에 대한 비난) 내용이 포함된 게시물</td>
                            <TdCenter>○</TdCenter>
                            <TdCenter>○</TdCenter>
                        </tr>
                        <tr>
                            <td>성/인종/신체 관련 차별적 발언이 사용된 게시물</td>
                            <TdCenter>○</TdCenter>
                            <TdCenter>영구<br/>정지</TdCenter>
                        </tr>
                        <tr>
                            <td>장애인을 차별하는 표현이 사용된 게시물</td>
                            <TdCenter>○</TdCenter>
                            <TdCenter>영구<br/>정지</TdCenter>
                        </tr>
                        <tr>
                            <td>특정 신체 부위, 성적 행위 등을 노골적으로 표현, 묘사하는 게시물</td>
                            <TdCenter>○</TdCenter>
                            <TdCenter>영구<br/>정지</TdCenter>
                        </tr>
                        <tr>
                            <td>사람 또는 동물을 대상으로 한 음란행위를 표현, 묘사하는 게시물</td>
                            <TdCenter>○</TdCenter>
                            <TdCenter>영구<br/>정지</TdCenter>
                        </tr>
                        <tr>
                            <td>학대/살인 등에 관한 폭력적인 게시물</td>
                            <TdCenter>○</TdCenter>
                            <TdCenter>영구<br/>정지</TdCenter>
                        </tr>
                        <tr>
                            <td>마약물(마리화나, 코카인 등)에 관한 게시물</td>
                            <TdCenter>○</TdCenter>
                            <TdCenter>영구<br/>정지</TdCenter>
                        </tr>
                        <tr>
                            <td>기타 비윤리적인 내용이 포함된 게시물</td>
                            <TdCenter>○</TdCenter>
                            <TdCenter>영구<br/>정지</TdCenter>
                        </tr>


                        <tr>
                            <th scope="row">악성코드 유포</th>
                            <td>악성파일 배포 경로로 연결하는 링크 게재</td>
                            <TdCenter>○</TdCenter>
                            <TdCenter>영구<br/>정지</TdCenter>
                        </tr>
                        <tr>
                            <th scope="row">법령 및 약관 위반</th>
                            <td>기타 관련 법률 및 약관에 위배되는 게시물</td>
                            <TdCenter>○</TdCenter>
                            <TdCenter>○</TdCenter>
                        </tr>
                        </tbody>
                    </Table>
                </Div>







                <br/><br/>
                <b>□ 커뮤니티 게시 중단 요청 서비스</b><br/><br/>

                - 다른 사람의 게시물로 인해 명예훼손, 개인 정보, 저작권 침해 등의 권리침해를 입은 경우 게시판에서 해당 내용이 노출되지 않도록 게시중단 요청을 할 수 있습니다.<br/>
                ※ 문의/접수 : 커뮤니티 운영팀(cs@blocery.io)<br/>
                - 2007년 7월 27일부터 시행된 정보통신망 이용 촉진 및 정보보호 등에 관한 법률 제44조의2 (정보의 삭제 요청 등)에 따라 게시중단 요청에도 불구하고 권리침해 여부 판단이 어렵거나 이해당사자 간 다툼이 예상되는 경우, 해당 게시물 접근을 30일 동안 임시적으로 차단하는 조치(임시 조치)를 할 수 있습니다.<br/>
                - 임시 조치 기간은 30일이며, 이 기간 동안 임시 조치 대상 게시물을 작성한 사용자가 관련 증빙을 첨부하여 재게 시 요청을 하지 않을 경우 해당 게시물은 다시 게시되지 않을 수 있습니다.<br/><br/>


                <b>□ 커뮤니티 건전성을 위한 기능</b><br/><br/>

                1. 신고 기능<br/>
                어떤 게시물에 대해 일정 기준 이상의 신고가 접수되는 경우에는 해당 게시물이 숨김 처리됩니다. 단, 허위 신고의 경우 신고자가 이용 제한 조치를 받을 수 있습니다.<br/>
                신고를 당한 사용자는 게시물의 내용에 따라 차단 또는 강제탈퇴 될 수 있습니다.
                <br/><br/>

                2. 불건전한 이미지<br/>
                게시물 또는 프로필 사진에 법령, 약관 또는 운영 정책에 위반되는 이미지는 숨김 처리 또는 삭제될 수 있습니다.<br/><br/><br/>


                <b>본 커뮤니티 운영정책은 2021년 11월 11일부터 시행합니다.</b><br/><br/><br/><br/>










            </Div>
        </div>
    );
};

export default TermsOfPrivacy;
